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
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }] },
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces" }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Tajada de Queso", disponible: true, precio: 1000 }
];

// ==========================================
// 🧠 LÓGICA DE NEGOCIO
// ==========================================
const fusionar = (base, fb) => {
  const mapa = {};
  base.forEach(p => mapa[p.id] = p);
  fb.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
  return Object.values(mapa);
};

const MONO_NARANJA = "#f97316";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

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

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { if (s.exists()) setTiendaAbierta(s.data().abierta); });
    return () => { unsubProd(); unsubExtras(); unsubTienda(); };
  }, []);

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

  const calcularSubtotal = (p, sel) => {
    let base = p.precio || 0;
    if (sel.tamano) base = sel.tamano.precio;
    const extrasPrice = (sel.extras || []).reduce((acc, id) => {
      const ex = extrasMostrar.find(e => e.id === id);
      return acc + (ex?.precio || 0);
    }, 0);
    return base + extrasPrice;
  };

  const agregarAlCarrito = (p) => {
    const sel = selecciones[p.id] || {};
    if (p.opciones && !sel.sabor && p.categoria === "Fritos") return alert("Elige un sabor");
    if (p.tamanos && !sel.tamano) return alert("Elige el tamaño");

    const sub = calcularSubtotal(p, sel);
    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, cantidad: 1, subtotal: sub, detalle: `${sel.sabor || ''} ${sel.tamano?.nombre || ''} ${sel.extras ? ' Extras: '+sel.extras.join(', ') : ''}` }]);
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{width: '45px', height: '24px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'}}>
      <div style={{width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '24px' : '3px', transition: '0.3s'}}/>
    </div>
  );

  // 🟢 VISTA ADMIN
  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <button onClick={() => setIsAdmin(false)}>← Volver</button>
          <h2 style={{color: MONO_NARANJA}}>Panel de Control 🐒</h2>

          {["Fritos", "Arroces", "Bebidas", "Desayunos"].map(cat => (
            <div key={cat} style={{background:'white', padding:'20px', borderRadius:'20px', marginBottom:'20px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
              <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'10px'}}>{cat}</h3>
              {productosMostrar.filter(p => (p.categoria || (p.id.length > 5 ? 'Arroces' : 'Fritos')) === cat).map(p => (
                <div key={p.id} style={{padding:'10px 0', borderBottom:'1px solid #f9f9f9'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <strong>{p.nombre}</strong>
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                      {!p.tamanos && (
                        <input type="number" defaultValue={p.precio} onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })} style={{width:'80px', textAlign:'center', borderRadius:'8px', border:'1px solid #ddd'}} />
                      )}
                      <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
                    </div>
                  </div>

                  {/* REGLA 2: Sabores con switche (precio igual) */}
                  {p.opciones && cat === "Fritos" && (
                    <div style={{marginTop:'10px', display:'flex', gap:'10px', flexWrap:'wrap'}}>
                      {p.opciones.map((opt, idx) => (
                        <div key={idx} style={{background:'#fff7ed', padding:'5px 10px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'5px', border:'1px solid #fed7aa'}}>
                          <small>{opt.nombre}</small>
                          <MiniSwitch activo={opt.disponible} onClick={() => {
                            const n = [...p.opciones]; n[idx].disponible = !n[idx].disponible;
                            guardarCambio("productos", p.id, { opciones: n });
                          }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* REGLA 1: Bebidas con switche y precio por tamaño */}
                  {p.tamanos && (
                    <div style={{marginTop:'10px', display:'grid', gap:'5px'}}>
                      {p.tamanos.map((t, idx) => (
                        <div key={idx} style={{display:'flex', justifyContent:'space-between', background:'#f0f9ff', padding:'8px', borderRadius:'10px'}}>
                          <small>{t.nombre}</small>
                          <div style={{display:'flex', gap:'10px'}}>
                            <input type="number" defaultValue={t.precio} onBlur={(e) => {
                               const n = [...p.tamanos]; n[idx].precio = Number(e.target.value);
                               guardarCambio("productos", p.id, { tamanos: n });
                            }} style={{width:'70px', border:'1px solid #bae6fd', borderRadius:'5px'}} />
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
                  {extrasMostrar.map(e => (
                    <div key={e.id} style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                      <span>{e.nombre}</span>
                      <div style={{display:'flex', gap:'10px'}}>
                        {(e.id === 'huevo' || e.id === 'queso') && (
                          <input type="number" defaultValue={e.precio} onBlur={(ev) => guardarCambio("extrasArroz", e.id, { precio: Number(ev.target.value) })} style={{width:'80px', borderRadius:'8px', border:'1px solid #ddd'}} />
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
    <div style={{fontFamily:'sans-serif', backgroundColor:'#fffcf5', minHeight:'100vh', paddingBottom:'100px'}}>
      <header style={{textAlign:'center', padding:'20px', background:'white'}}>
        <h1 onDoubleClick={accesoSecreto} style={{color:MONO_NARANJA}}>Fritos El Mono 🐒</h1>
        <p>Hoy Arroz de <strong>{tipoArrozHoy}</strong></p>
      </header>

      {/* CATEGORIAS */}
      <div style={{display:'flex', justifyContent:'center', gap:'10px', marginBottom:'20px'}}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(c => (
          <button key={c} onClick={() => setCategoriaActiva(c)} style={{background: categoriaActiva === c ? MONO_NARANJA : 'white', border:'none', padding:'10px 15px', borderRadius:'15px'}}>{c}</button>
        ))}
      </div>

      {/* PRODUCTOS */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px', padding:'0 20px'}}>
        {productosMostrar.filter(p => (p.categoria || (p.id.length > 5 ? 'Arroces' : 'Fritos')) === categoriaActiva).map(p => (
          <div key={p.id} style={{background:'white', padding:'20px', borderRadius:'25px', boxShadow:'0 4px 10px rgba(0,0,0,0.05)'}}>
            <h3>{p.nombre}</h3>
            <p style={{color:MONO_NARANJA, fontWeight:'bold', fontSize:'20px'}}>${(p.precio || (p.tamanos ? p.tamanos[0].precio : 0)).toLocaleString()}</p>
            
            {p.opciones && categoriaActiva === "Fritos" && (
              <select onChange={(e) => setSelecciones({...selecciones, [p.id]: {...selecciones[p.id], sabor: e.target.value}})} style={{width:'100%', padding:'10px', borderRadius:'10px', marginBottom:'10px'}}>
                <option value="">Sabor</option>
                {p.opciones.filter(o => o.disponible).map(o => <option key={o.nombre}>{o.nombre}</option>)}
              </select>
            )}

            {p.tamanos && (
              <select onChange={(e) => {
                const t = p.tamanos.find(x => x.nombre === e.target.value);
                setSelecciones({...selecciones, [p.id]: {...selecciones[p.id], tamano: t}});
              }} style={{width:'100%', padding:'10px', borderRadius:'10px', marginBottom:'10px'}}>
                <option value="">Presentación</option>
                {p.tamanos.filter(t => t.disponible).map(t => <option key={t.nombre}>{t.nombre}</option>)}
              </select>
            )}

            {categoriaActiva === "Arroces" && (
              <div style={{background:'#fffbeb', padding:'10px', borderRadius:'15px', marginBottom:'10px'}}>
                 {extrasMostrar.map(e => (
                   <label key={e.id} style={{display:'block', opacity: e.disponible ? 1 : 0.4}}>
                     <input type="checkbox" disabled={!e.disponible} onChange={(ev) => {
                       const ex = selecciones[p.id]?.extras || [];
                       const n = ev.target.checked ? [...ex, e.id] : ex.filter(x => x !== e.id);
                       setSelecciones({...selecciones, [p.id]: {...selecciones[p.id], extras: n}});
                     }} /> {e.nombre} {e.precio > 0 && `(+$${e.precio})`}
                   </label>
                 ))}
              </div>
            )}

            <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible || !tiendaAbierta} style={{width:'100%', background:MONO_NARANJA, color:'white', border:'none', padding:'12px', borderRadius:'15px', fontWeight:'bold'}}>Añadir 🥟</button>
          </div>
        ))}
      </div>

      {/* CARRITO */}
      {pedido.length > 0 && (
        <div style={{maxWidth:'600px', margin:'40px auto', background:'white', padding:'25px', borderRadius:'30px', border:`3px solid ${MONO_NARANJA}`}}>
          <h2 style={{marginTop:0}}>Tu Pedido</h2>
          {pedido.map((item, i) => (
            <div key={item.idUnico} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
              <span>{item.cantidad}x {item.nombre} <small>{item.detalle}</small></span>
              <strong>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}
          <h2 style={{textAlign:'right', color:MONO_NARANJA}}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <button onClick={() => {
            const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.detalle}`).join('\n');
            const msg = `¡Hola! Pedido Mono 🐒:\n\n${lista}\n\nTotal: $${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}`;
            window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
          }} style={{width:'100%', background:MONO_VERDE, color:'white', border:'none', padding:'15px', borderRadius:'15px', fontWeight:'bold', cursor:'pointer'}}>Pedir por WhatsApp 📲</button>
        </div>
      )}
    </div>
  );

  function accesoSecreto() {
    const pin = prompt("PIN");
    if (pin === "mono2026") setIsAdmin(true);
  }
}