import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.jpg", disponible: true },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa-huevo.jpg", disponible: true },
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.jpg", disponible: true },
  { id: "8", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelo.jpg", disponible: true },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", disponible: true },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", disponible: true },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", disponible: true, opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", disponible: true, tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }, { nombre: "Familiar", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", disponible: true, tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", disponible: true },
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", disponible: true }
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

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");
  const [productosFB, setProductosFB] = useState([]);
  const [extrasFB, setExtrasFB] = useState([]);
  const [pedido, setPedido] = useState([]);

  // Estados Cliente
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);
  const [conQueso, setConQueso] = useState(false);
  const [saboresElegidos, setSaboresElegidos] = useState({});

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { if (s.exists()) setTiendaAbierta(s.data().abierta); });
    return () => { unsubProd(); unsubExtras(); unsubTienda(); };
  }, []);

  const fusionar = (base, fb) => {
    const mapa = {};
    base.forEach(p => mapa[p.id] = p);
    fb.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
    return Object.values(mapa);
  };

  const productosMostrar = fusionar(productosBase, productosFB);
  const extrasMostrar = fusionar(extrasArrozBase, extrasFB);

  const guardarCambio = async (col, id, datos) => {
    try { await setDoc(doc(db, col, id), datos, { merge: true }); } 
    catch (e) { console.error("Error Firebase:", e); }
  };

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("Carrito vacío");
    if (!nombre || !direccion || !metodoPago) return alert("Faltan tus datos");
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.detalle || ''}`).join('\n');
    const msg = `¡Hola! Pedido Fritos El Mono 🐒:\n\n${lista}\n\n*Total: $${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{width: '45px', height: '24px', backgroundColor: activo ? MONO_VERDE : '#cbd5e1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'}}>
      <div style={{width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '24px' : '3px', transition: '0.3s'}}/>
    </div>
  );

  // 🟢 PANEL DE CONTROL (ADMIN)
  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
            <h1 style={{color: MONO_NARANJA}}>Panel de Control 🐒</h1>
            <button onClick={() => setIsAdmin(false)} style={{background:MONO_TEXTO, color:'white', border:'none', padding:'10px 20px', borderRadius:'12px', fontWeight:'bold'}}>Salir</button>
          </div>

          {["Fritos", "Arroces", "Desayunos", "Bebidas"].map(cat => (
            <div key={cat} style={{marginBottom:'35px', background:'white', padding:'25px', borderRadius:'25px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
              <h2 style={{borderBottom:'2px solid #eee', paddingBottom:'10px'}}>{cat}</h2>
              {productosMostrar.filter(p => (p.categoria || (p.id === 'lzEcQicq9WUrxw7FEaq7' ? 'Arroces' : 'Fritos')) === cat).map(p => (
                <div key={p.id} style={{padding:'15px 0', borderBottom:'1px solid #f8fafc'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{fontWeight:'bold'}}>{p.nombre}</span>
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                      {!p.tamanos && (
                        <div style={{background:'#f1f5f9', padding:'5px 10px', borderRadius:'10px'}}>
                          $ <input type="number" defaultValue={p.precio} onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })} style={{width:'80px', border:'none', background:'transparent', fontWeight:'bold'}} />
                        </div>
                      )}
                      <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
                    </div>
                  </div>

                  {/* SUB-INTERRUPTORES PARA SABORES (FRITOS) */}
                  {p.opciones && cat === "Fritos" && (
                    <div style={{marginTop:'12px', display:'flex', flexWrap:'wrap', gap:'10px'}}>
                      {p.opciones.map((opt, idx) => (
                        <div key={idx} style={{background:'#fff7ed', padding:'8px 12px', borderRadius:'15px', border:'1px solid #ffedd5', display:'flex', alignItems:'center', gap:'10px'}}>
                          <small>{opt.nombre}</small>
                          <MiniSwitch activo={opt.disponible} onClick={() => {
                            const n = [...p.opciones]; n[idx].disponible = !n[idx].disponible;
                            guardarCambio("productos", p.id, { opciones: n });
                          }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PRESENTACIONES (BEBIDAS) CON PRECIO INDIVIDUAL */}
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
              
              {/* EXTRAS DEL ARROZ DENTRO DE SU CATEGORÍA */}
              {cat === "Arroces" && (
                <div style={{marginTop:'20px', borderTop:'2px dashed #eee', paddingTop:'15px'}}>
                  <h4 style={{margin:'0 0 10px 0'}}>Extras de Arroz</h4>
                  {extrasMostrar.map(e => (
                    <div key={e.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0'}}>
                      <span>{e.nombre}</span>
                      <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        {(e.id === 'huevo' || e.id === 'queso') && (
                          <div style={{background:'#f1f5f9', padding:'5px 10px', borderRadius:'10px'}}>
                            $ <input type="number" defaultValue={e.precio} onBlur={(ev) => guardarCambio("extrasArroz", e.id, { precio: Number(ev.target.value) })} style={{width:'70px', border:'none', background:'transparent'}} />
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
    <div style={{fontFamily: 'system-ui, sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px', color: MONO_TEXTO}}>
      
      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{width: '100%', height: '220px', objectFit: 'cover'}} />
        <h1 onDoubleClick={() => { const pin = window.prompt("🔐 PIN:"); if(pin === "mono2026") setIsAdmin(true); }} style={{color: MONO_NARANJA, cursor:'pointer', margin:'15px 0'}}>Fritos El Mono 🐒</h1>
        <div style={{paddingBottom:'20px'}}>Hoy Arroz de <strong>{tipoArrozHoy}</strong></div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX:'auto', padding:'0 10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', cursor:'pointer' }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px', padding: '0 20px', maxWidth:'1200px', margin:'0 auto'}}>
        {productosMostrar
          .filter(p => (p.categoria || (p.id === 'lzEcQicq9WUrxw7FEaq7' ? 'Arroces' : 'Fritos')) === categoriaActiva)
          .map(p => (
            <div key={p.id} style={{background: 'white', borderRadius: '30px', overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9'}}>
              <h3 style={{margin: '0 0 5px 0'}}>{p.nombre}</h3>
              <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '24px', margin:'0 0 15px 0'}}>
                ${(p.precio || (p.tamanos ? p.tamanos.find(t=>t.disponible)?.precio : 0)).toLocaleString()}
              </p>

              {p.categoria === "Fritos" && p.opciones && (
                <select onChange={(e) => setSaboresElegidos({...saboresElegidos, [p.id]: e.target.value})} style={{width:'100%', padding:'12px', borderRadius:'15px', border:'1px solid #e2e8f0', marginBottom:'15px', background:'#f8fafc'}}>
                  <option value="">-- Elige Sabor --</option>
                  {p.opciones.filter(opt => opt.disponible).map(opt => <option key={opt.nombre} value={opt.nombre}>{opt.nombre}</option>)}
                </select>
              )}

              {p.id === 'lzEcQicq9WUrxw7FEaq7' && (
                <div style={{background: '#fef3c7', padding: '15px', borderRadius: '20px', marginBottom: '15px'}}>
                   <select onChange={(e) => setAcompañanteArroz(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'10px', border:'none', marginBottom:'10px'}}>
                     <option value="">¿Tajada o Yuca?</option>
                     {extrasMostrar.filter(e => (e.id === 'tajada' || e.id === 'yuca') && e.disponible).map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
                   </select>
                   <label style={{display:'block'}}><input type="checkbox" onChange={(e)=>setConHuevo(e.target.checked)} disabled={!extrasMostrar.find(e=>e.id==='huevo')?.disponible}/> + Huevo Extra</label>
                   <label style={{display:'block'}}><input type="checkbox" onChange={(e)=>setConQueso(e.target.checked)} disabled={!extrasMostrar.find(e=>e.id==='queso')?.disponible}/> + Queso Extra</label>
                </div>
              )}

              <button 
                onClick={() => {
                  let detalle = "";
                  let subtotal = p.precio;
                  if(p.categoria === "Fritos") {
                    if(!saboresElegidos[p.id]) return alert("Elige un sabor");
                    detalle = `(${saboresElegidos[p.id]})`;
                  }
                  setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, subtotal: subtotal, cantidad: 1, detalle: detalle }]);
                }} 
                disabled={!p.disponible || !tiendaAbierta} 
                style={{marginTop:'auto', background: p.disponible ? MONO_NARANJA : '#cbd5e1', color:'white', border:'none', padding:'15px', borderRadius:'18px', fontWeight:'bold', cursor:'pointer'}}
              >
                {p.disponible ? 'Añadir 🥟' : 'Agotado'}
              </button>
            </div>
          ))}
      </div>

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
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{padding:'15px', borderRadius:'12px', border:'1px solid #ddd'}} />
            <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{padding:'15px', borderRadius:'12px', border:'1px solid #ddd'}} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{padding:'15px', borderRadius:'12px', border:'1px solid #ddd'}}>
              <option value="">¿Cómo pagas?</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={enviarWhatsApp} style={{width:'100%', background:MONO_VERDE, color:'white', border:'none', padding:'18px', borderRadius:'15px', fontSize:'18px', fontWeight:'bold', cursor:'pointer'}}>Confirmar Pedido 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}