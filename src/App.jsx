import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS BASE
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos" },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos" },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }, { nombre: "Familiar", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }] },
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces" }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Tajada de Queso", disponible: true, precio: 1000 }
];

const MONO_NARANJA = "#f97316";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

// ==========================================
// 🧠 FUNCIONES DE LÓGICA
// ==========================================
const fusionar = (base, fb) => {
  const mapa = {};
  base.forEach(p => mapa[p.id] = p);
  fb.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
  return Object.values(mapa);
};

const calcularSubtotal = (producto, seleccion, extrasDisponibles) => {
  let total = producto.precio || 0;
  if (seleccion?.tamano) total = seleccion.tamano.precio;
  if (seleccion?.extras?.length) {
    total += seleccion.extras.reduce((acc, id) => {
      const extra = extrasDisponibles.find(e => e.id === id);
      return acc + (extra?.precio || 0);
    }, 0);
  }
  return total;
};

// ==========================================
// 🚀 COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");
  const [productosFB, setProductosFB] = useState([]);
  const [extrasFB, setExtrasFB] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [selecciones, setSelecciones] = useState({});
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // Sincronización Firebase
  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { if (s.exists()) setTiendaAbierta(s.data().abierta); });
    return () => { unsubProd(); unsubExtras(); unsubTienda(); };
  }, []);

  // Local Storage para no perder el pedido
  useEffect(() => {
    const saved = localStorage.getItem("pedido_mono");
    if (saved) setPedido(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("pedido_mono", JSON.stringify(pedido));
  }, [pedido]);

  const productosMostrar = fusionar(productosBase, productosFB);
  const extrasMostrar = fusionar(extrasArrozBase, extrasFB);

  const guardarCambio = async (col, id, datos) => {
    try { await setDoc(doc(db, col, id), datos, { merge: true }); } 
    catch (e) { console.error(e); }
  };

  const agregarProducto = (p) => {
    const sel = selecciones[p.id] || {};
    if (p.opciones && !sel.sabor) return alert("Elige un sabor");
    if (p.tamanos && !sel.tamano) return alert("Elige el tamaño");

    const sub = calcularSubtotal(p, sel, extrasMostrar);
    const detalle = `${sel.sabor || ''} ${sel.tamano?.nombre || ''} ${sel.extras ? ' Extras: '+sel.extras.join(', ') : ''}`;
    
    setPedido([...pedido, { idUnico: Date.now(), id: p.id, nombre: p.nombre, cantidad: 1, subtotal: sub, detalle }]);
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{width: '45px', height: '24px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'}}>
      <div style={{width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '24px' : '3px', transition: '0.3s'}}/>
    </div>
  );

  // 🟢 VISTA ADMINISTRADOR
  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px'}}>
            <h1 style={{color: MONO_NARANJA}}>Admin 🐒</h1>
            <button onClick={() => setIsAdmin(false)} style={{background:MONO_TEXTO, color:'white', border:'none', padding:'10px 20px', borderRadius:'10px'}}>Salir</button>
          </div>

          {["Fritos", "Arroces", "Bebidas"].map(cat => (
            <div key={cat} style={{background:'white', padding:'25px', borderRadius:'25px', marginBottom:'25px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
              <h2 style={{borderBottom:'2px solid #eee', paddingBottom:'10px'}}>{cat}</h2>
              {productosMostrar.filter(p => (p.categoria || 'Fritos') === cat).map(p => (
                <div key={p.id} style={{padding:'15px 0', borderBottom:'1px solid #f8fafc'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <strong>{p.nombre}</strong>
                    <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                      {/* PRECIO GENERAL */}
                      {!p.tamanos && (
                        <div style={{background:'#f1f5f9', padding:'5px 10px', borderRadius:'10px'}}>
                          $ <input type="number" defaultValue={p.precio} onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })} style={{width:'80px', border:'none', background:'transparent', fontWeight:'bold'}} />
                        </div>
                      )}
                      <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
                    </div>
                  </div>

                  {/* REGLA 2: Sabores (Solo switche) */}
                  {p.opciones && (
                    <div style={{marginTop:'12px', display:'flex', flexWrap:'wrap', gap:'10px'}}>
                      {p.opciones.map((opt, idx) => (
                        <div key={idx} style={{background:'#fff7ed', padding:'8px 12px', borderRadius:'15px', display:'flex', alignItems:'center', gap:'8px', border:'1px solid #ffedd5'}}>
                          <small>{opt.nombre}</small>
                          <MiniSwitch activo={opt.disponible} onClick={() => {
                            const n = [...p.opciones]; n[idx].disponible = !n[idx].disponible;
                            guardarCambio("productos", p.id, { opciones: n });
                          }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* REGLA 1: Bebidas (Switche + Precio por tamaño) */}
                  {p.tamanos && (
                    <div style={{marginTop:'10px', display:'grid', gap:'10px'}}>
                      {p.tamanos.map((t, idx) => (
                        <div key={idx} style={{background:'#f0f9ff', padding:'10px 15px', borderRadius:'15px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <small>{t.nombre}</small>
                          <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                            <div style={{background:'white', padding:'3px 8px', borderRadius:'8px', border:'1px solid #e0f2fe'}}>
                              $ <input type="number" defaultValue={t.precio} onBlur={(e) => {
                                const n = [...p.tamanos]; n[idx].precio = Number(e.target.value);
                                guardarCambio("productos", p.id, { tamanos: n });
                              }} style={{width:'70px', border:'none', textAlign:'center'}} />
                            </div>
                            <MiniSwitch activo={t.disponible} onClick={() => {
                              const n = [...p.tamanos]; n[idx].disponible = !n[idx].disponible;
                              guardarCambio("productos", p.id, { tamanos: n });
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* REGLA 3: Extras del Arroz */}
              {cat === "Arroces" && (
                <div style={{marginTop:'20px', borderTop:'2px dashed #eee', paddingTop:'15px'}}>
                  <h4 style={{margin:'0 0 10px 0'}}>Extras y Añadidos</h4>
                  {extrasMostrar.map(e => (
                    <div key={e.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0'}}>
                      <span>{e.nombre}</span>
                      <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        {(e.id === 'huevo' || e.id === 'queso') && (
                          <div style={{background:'#f1f5f9', padding:'5px 10px', borderRadius:'10px'}}>
                            $ <input type="number" defaultValue={e.precio} onBlur={(ev) => guardarCambio("extrasArroz", e.id, { precio: Number(ev.target.value) })} style={{width:'80px', border:'none', background:'transparent', textAlign:'center'}} />
                          </div>
                        )}
                        <MiniSwitch activo={e.disponible} onClick={() => guardarCambio("extrasArroz", e.id, { disponible: !e.disponible })} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 🔵 VISTA CLIENTE
  return (
    <div style={{fontFamily: 'sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px'}}>
      <header style={{textAlign: 'center', background: 'white', padding: '20px', borderRadius: '0 0 40px 40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
        <h1 onDoubleClick={() => { const p = prompt("PIN"); if(p === "mono2026") setIsAdmin(true); }} style={{color: MONO_NARANJA, cursor:'pointer'}}>Fritos El Mono 🐒</h1>
        <p>Arroz de Hoy: <strong>{tipoArrozHoy}</strong></p>
      </header>

      {/* CATEGORÍAS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '30px 0' }}>
        {["Fritos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', cursor:'pointer', boxShadow:'0 4px 6px rgba(0,0,0,0.05)' }}>{cat}</button>
        ))}
      </div>

      {/* GRILLA PRODUCTOS */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px', padding: '0 20px', maxWidth:'1200px', margin:'0 auto'}}>
        {productosMostrar.filter(p => (p.categoria || 'Fritos') === categoriaActiva).map(p => {
            const sel = selecciones[p.id] || {};
            return (
              <div key={p.id} style={{background: 'white', borderRadius: '30px', padding: '20px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column'}}>
                <h3 style={{margin:0}}>{p.nombre}</h3>
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '24px'}}>${(p.precio || (sel.tamano ? sel.tamano.precio : (p.tamanos ? p.tamanos[0].precio : 0))).toLocaleString()}</p>

                {p.opciones && (
                  <select onChange={(e) => setSelecciones({...selecciones, [p.id]: {...sel, sabor: e.target.value}})} style={{width:'100%', padding:'10px', borderRadius:'12px', marginBottom:'10px'}}>
                    <option value="">¿Qué sabor?</option>
                    {p.opciones.filter(o => o.disponible).map(o => <option key={o.nombre}>{o.nombre}</option>)}
                  </select>
                )}

                {p.tamanos && (
                  <select onChange={(e) => {
                    const t = p.tamanos.find(x => x.nombre === e.target.value);
                    setSelecciones({...selecciones, [p.id]: {...sel, tamano: t}});
                  }} style={{width:'100%', padding:'10px', borderRadius:'12px', marginBottom:'10px'}}>
                    <option value="">¿Qué tamaño?</option>
                    {p.tamanos.filter(t => t.disponible).map(t => <option key={t.nombre}>{t.nombre}</option>)}
                  </select>
                )}

                {p.categoria === "Arroces" && (
                  <div style={{background: '#fef3c7', padding: '12px', borderRadius: '15px', marginBottom: '10px'}}>
                     {extrasMostrar.map(e => (
                       <label key={e.id} style={{display:'block', marginBottom:'5px', opacity: e.disponible ? 1 : 0.4}}>
                         <input type="checkbox" disabled={!e.disponible} onChange={(ev) => {
                           const ex = sel.extras || [];
                           const n = ev.target.checked ? [...ex, e.id] : ex.filter(x => x !== e.id);
                           setSelecciones({...selecciones, [p.id]: {...sel, extras: n}});
                         }} /> {e.nombre} {e.precio > 0 && `(+$${e.precio})`}
                       </label>
                     ))}
                  </div>
                )}

                <button onClick={() => agregarProducto(p)} disabled={!p.disponible || !tiendaAbierta} style={{marginTop:'auto', background: MONO_NARANJA, color:'white', border:'none', padding:'15px', borderRadius:'18px', fontWeight:'bold', cursor:'pointer'}}>Añadir 🥟</button>
              </div>
            );
        })}
      </div>

      {/* CARRITO */}
      {pedido.length > 0 && (
        <div style={{maxWidth: '600px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '35px', border: `4px solid ${MONO_NARANJA}`, boxShadow: '0 20px 25px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginTop:0}}>Tu Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f1f5f9'}}>
              <span>{item.cantidad}x {item.nombre} <small>{item.detalle}</small></span>
              <strong>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}
          <h2 style={{textAlign:'right', color: MONO_NARANJA, fontSize:'32px', marginTop:'20px'}}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'20px'}}>
            <input placeholder="Nombre" onChange={e => setNombre(e.target.value)} style={{padding:'15px', borderRadius:'12px', border:'1px solid #ddd'}} />
            <input placeholder="Dirección" onChange={e => setDireccion(e.target.value)} style={{padding:'15px', borderRadius:'12px', border:'1px solid #ddd'}} />
            <select onChange={e => setMetodoPago(e.target.value)} style={{padding:'15px', borderRadius:'12px', border:'1px solid #ddd'}}>
              <option value="">¿Cómo pagas?</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={() => {
               const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.detalle}`).join('\n');
               const msg = `¡Hola! Pedido Mono 🐒:\n\n${lista}\n\nTotal: $${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}\n👤 ${nombre}\n📍 ${direccion}`;
               window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
            }} style={{width:'100%', background:MONO_VERDE, color:'white', border:'none', padding:'18px', borderRadius:'15px', fontSize:'18px', fontWeight:'bold', cursor:'pointer'}}>Confirmar Pedido 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}