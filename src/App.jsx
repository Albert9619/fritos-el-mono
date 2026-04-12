import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS (CÓDIGO BASE - SAGRADO)
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.png", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.png", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.png" },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa-huevo.png" },
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.png" },
  { id: "8", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelo.png" },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", imagen: "/desayuno-carne.png" },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", imagen: "/desayuno-huevo.png" },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", imagen: "/jugo-natural.png", tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", imagen: "/cocacola.png", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }, { nombre: "Familiar", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", imagen: "/malta.png", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", imagen: "/agua.png" },
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", imagen: "/arroz-pollo.png" }
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
  const [selecciones, setSelecciones] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [notificacion, setNotificacion] = useState("");

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // 🔄 FIREBASE
  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { if (s.exists()) setTiendaAbierta(s.data().abierta); });
    return () => { unsubProd(); unsubExtras(); unsubTienda(); };
  }, []);

  // 💾 PERSISTENCIA
  useEffect(() => {
    const pedidoGuardado = localStorage.getItem("pedido_mono_storage");
    if (pedidoGuardado) setPedido(JSON.parse(pedidoGuardado));
  }, []);

  useEffect(() => {
    localStorage.setItem("pedido_mono_storage", JSON.stringify(pedido));
  }, [pedido]);

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

  const agregarAlCarrito = (p) => {
    const sel = selecciones[p.id] || {};
    const cant = cantidades[p.id] || 1;
    if (p.opciones && !sel.sabor && p.categoria === "Fritos") return alert("Elige un sabor");
    if (p.tamanos && !sel.tamano) return alert("Elige el tamaño");
    let precioBase = p.precio || 0;
    if (sel.tamano) precioBase = sel.tamano.precio;
    const extrasPrice = (sel.extras || []).reduce((acc, id) => {
      const ex = extrasMostrar.find(e => e.id === id);
      return acc + (ex?.precio || 0);
    }, 0);
    const subtotal = (precioBase + extrasPrice) * cant;
    const detalle = `${sel.sabor || ''} ${sel.tamano?.nombre || ''} ${sel.extras ? ' Extras: '+sel.extras.join(', ') : ''}`;
    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, cantidad: cant, subtotal, detalle }]);
    setCantidades({ ...cantidades, [p.id]: 1 });
    setNotificacion(`¡${cant}x ${p.nombre} añadido! 🥟`);
    setTimeout(() => setNotificacion(""), 2000);
  };

  const vaciarCarrito = () => { if (window.confirm("¿Vaciar todo el pedido?")) setPedido([]); };

  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos de entrega");
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.detalle}`).join('\n');
    const totalP = pedido.reduce((acc, i) => acc + i.subtotal, 0);
    const msg = `¡Hola! Pedido Fritos El Mono 🐒:\n\n${lista}\n\n*Total: $${totalP.toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{ width: '46px', height: '24px', backgroundColor: activo ? MONO_VERDE : '#cbd5e1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s', flexShrink: 0 }}>
      <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '25px' : '3px', transition: '0.3s cubic-bezier(0.18, 0.89, 0.35, 1.15)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
    </div>
  );

  // 🟢 VISTA ADMIN
  if (isAdmin) {
    return (
      <div style={{padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'850px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'40px', alignItems: 'center'}}>
            <h1 style={{color: MONO_NARANJA, fontSize: '32px', fontWeight: '900'}}>Panel Admin 🐒</h1>
            <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
               <span style={{fontWeight:'bold'}}>Tienda Abierta:</span>
               <MiniSwitch activo={tiendaAbierta} onClick={() => guardarCambio("ajuste", "tienda", { abierta: !tiendaAbierta })} />
               <button onClick={() => setIsAdmin(false)} style={{padding:'12px 25px', borderRadius:'15px', background:MONO_TEXTO, color:'white', border:'none', cursor:'pointer', fontWeight: 'bold'}}>Cerrar Panel</button>
            </div>
          </div>

          {["Fritos", "Arroces", "Bebidas", "Desayunos"].map(cat => (
            <div key={cat} style={{background:'white', padding:'30px', borderRadius:'35px', marginBottom:'30px', boxShadow:'0 10px 25px rgba(0,0,0,0.05)'}}>
              <h2 style={{fontSize: '24px', fontWeight: '900', marginBottom: '25px'}}>{cat}</h2>
              {productosMostrar.filter(p => p.categoria === cat).map(p => (
                <div key={p.id} style={{padding:'20px 0', borderBottom:'1px solid #f1f5f9'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: (p.opciones || p.tamanos) ? '15px' : '0'}}>
                    <strong style={{fontSize: '18px'}}>{p.nombre}</strong>
                    <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                      {!p.tamanos && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <span style={{fontWeight: 'bold'}}>$</span>
                          <input type="number" defaultValue={p.precio} onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })} style={{width:'100px', padding:'10px', borderRadius:'12px', border:'1px solid #e2e8f0', textAlign: 'center', fontWeight: 'bold'}} />
                        </div>
                      )}
                      <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
                    </div>
                  </div>

                  {/* 📂 CAJA DE SABORES (Fritos) */}
                  {p.opciones && cat === "Fritos" && (
                    <div style={{background: '#f8fafc', padding: '15px', borderRadius: '18px', display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                      {p.opciones.map((opt, idx) => (
                        <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '8px 15px', borderRadius: '12px', border: '1px solid #edf2f7'}}>
                          <span style={{fontSize: '14px', fontWeight: 'bold'}}>{opt.nombre}</span>
                          <MiniSwitch activo={opt.disponible} onClick={() => {
                            const n = [...p.opciones]; n[idx].disponible = !n[idx].disponible;
                            guardarCambio("productos", p.id, { opciones: n });
                          }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 🥤 TAMAÑOS BEBIDAS */}
                  {p.tamanos && (
                    <div style={{display: 'grid', gap: '10px', marginTop: '10px'}}>
                      {p.tamanos.map((t, idx) => (
                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff', padding: '10px 15px', borderRadius: '15px'}}>
                          <span style={{fontWeight: 'bold', fontSize: '14px'}}>{t.nombre}</span>
                          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                             <input type="number" defaultValue={t.precio} onBlur={(e) => {
                               const n = [...p.tamanos]; n[idx].precio = Number(e.target.value);
                               guardarCambio("productos", p.id, { tamanos: n });
                             }} style={{width:'80px', padding:'5px', borderRadius:'8px', border:'none', textAlign: 'center', fontWeight: 'bold'}} />
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

              {/* ✅ AÑADIDOS DEL ARROZ (Tajadas, Yuca, Huevo, Queso) */}
              {cat === "Arroces" && (
                <div style={{marginTop:'25px', borderTop:'2px dashed #eee', paddingTop:'20px'}}>
                  <h4 style={{margin:'0 0 15px 0', fontSize: '18px', color: MONO_NARANJA}}>Disponibilidad de Acompañamientos:</h4>
                  <div style={{background: '#f8fafc', padding: '15px', borderRadius: '18px', display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
                    {extrasMostrar.map(extra => (
                      <div key={extra.id} style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #edf2f7'}}>
                        <span style={{fontSize: '14px', fontWeight: 'bold'}}>{extra.nombre}</span>
                        <MiniSwitch activo={extra.disponible} onClick={() => guardarCambio("extrasArroz", extra.id, { disponible: !extra.disponible })} />
                      </div>
                    ))}
                  </div>
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
    <div style={{fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px', color: MONO_TEXTO}}>
      <style>{`
        .card-mono { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-mono:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
        .img-mono { transition: transform 0.5s ease; }
        .card-mono:hover .img-mono { transform: scale(1.08); }
        .price-tag { transition: all 0.2s ease; }
      `}</style>
      {notificacion && (
        <div style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background: MONO_VERDE, color:'white', padding:'15px 30px', borderRadius:'50px', zIndex: 10000, fontWeight:'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.2)'}}>{notificacion}</div>
      )}
      {pedido.length > 0 && (
        <div onClick={() => document.getElementById('carrito_seccion')?.scrollIntoView({ behavior: 'smooth' })} style={{position: 'fixed', bottom: '30px', right: '30px', background: MONO_NARANJA, color: 'white', width: '75px', height: '75px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.5)', zIndex: 9999, cursor: 'pointer', border: '3px solid white'}}>🛒<span style={{position:'absolute', top:'-5px', right:'-5px', background:'red', color: 'white', fontSize:'14px', minWidth:'22px', height:'22px', borderRadius:'50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', border: '2px solid white'}}>{pedido.length}</span></div>
      )}
      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 50px 50px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{width: '100%', height: '240px', objectFit: 'cover'}} />
        <div style={{padding: '25px 0'}}>
            <h1 onDoubleClick={() => { const pin = window.prompt("🔐 PIN:"); if(pin === "mono2026") setIsAdmin(true); }} style={{color: MONO_NARANJA, cursor:'pointer', margin:'0', fontSize: '2.5rem', fontWeight: '900'}}>Fritos El Mono 🐒</h1>
            <div style={{display:'inline-block', marginTop: '10px', background: '#fff7ed', padding: '6px 20px', borderRadius: '20px', border: '1px solid #ffedd5', fontWeight: 'bold'}}>Arroz de Hoy: <span style={{color: MONO_NARANJA}}>{tipoArrozHoy}</span></div>
        </div>
      </header>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', overflowX:'auto', padding:'10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '14px 28px', borderRadius: '30px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : '#333', fontWeight: 'bold', cursor:'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: '0.3s' }}>{cat}</button>
        ))}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '30px', padding: '0 20px', maxWidth:'1300px', margin:'0 auto'}}>
        {productosMostrar.filter(p => (p.categoria || 'Fritos') === categoriaActiva).map(p => {
            const sel = selecciones[p.id] || {};
            const cant = cantidades[p.id] || 1;
            const esFavorito = p.id === "4" || p.id === "lzEcQicq9WUrxw7FEaq7";
            const precioUnitario = p.tamanos ? (sel.tamano ? sel.tamano.precio : p.tamanos[0].precio) : (p.precio || 0);
            const precioTotalMostrado = precioUnitario * cant;
            return (
              <div key={p.id} className="card-mono" style={{background: 'white', borderRadius: '40px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 20px rgba(0,0,0,0.02)', border:'1px solid #f1f5f9', position: 'relative'}}>
                {esFavorito && (
                  <div style={{position:'absolute', top: '15px', left: '15px', zIndex: 10, background: '#ef4444', color: 'white', padding: '6px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: '900'}}>⭐ EL FAVORITO</div>
                )}
                <div style={{ width: '100%', height: '200px', borderRadius: '25px', overflow: 'hidden', marginBottom: '15px' }}>
                  <img className="img-mono" src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none' }} onError={(e) => {e.target.onerror = null; e.target.src = "/logo-fritos-el-mono.jpg";}} />
                </div>
                <h3 style={{margin: '0 0 5px 0', fontWeight: '800', fontSize: '20px'}}>{p.nombre}</h3>
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '26px', margin:'0 0 15px 0'}}>${precioTotalMostrado.toLocaleString()}</p>
                {p.categoria === "Fritos" && p.opciones && (
                  <select onChange={(e) => setSelecciones({...selecciones, [p.id]: {...sel, sabor: e.target.value}})} style={{width:'100%', padding:'14px', borderRadius:'18px', border:'2px solid #f8fafc', marginBottom:'15px', background:'#f8fafc', fontWeight: 'bold', outline: 'none'}}>
                    <option value="">-- ¿Qué sabor? --</option>
                    {p.opciones.filter(opt => opt.disponible).map(opt => <option key={opt.nombre} value={opt.nombre}>{opt.nombre}</option>)}
                  </select>
                )}
                {p.tamanos && (
                  <select onChange={(e) => {
                    const t = p.tamanos.find(x => x.nombre === e.target.value);
                    setSelecciones({...selecciones, [p.id]: {...sel, tamano: t}});
                  }} style={{width:'100%', padding:'14px', borderRadius:'18px', border:'2px solid #f8fafc', marginBottom:'15px', fontWeight: 'bold'}}>
                    <option value="">-- Elige el tamaño --</option>
                    {p.tamanos.filter(t => t.disponible).map(t => <option key={t.nombre} value={t.nombre}>{t.nombre}</option>)}
                  </select>
                )}
                {p.categoria === "Arroces" && (
                  <div style={{background: '#fef3c7', padding: '15px', borderRadius: '20px', marginBottom: '15px'}}>
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
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'15px', marginBottom:'15px', background:'#f8fafc', padding:'10px', borderRadius:'15px'}}>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: Math.max(1, cant - 1)})} style={{width:'40px', height:'40px', borderRadius:'50%', border:'none', background:'white', fontWeight:'bold', fontSize: '18px', cursor: 'pointer'}}>-</button>
                   <span style={{fontWeight:'900', fontSize:'20px', minWidth: '30px', textAlign: 'center'}}>{cant}</span>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: cant + 1})} style={{width:'40px', height:'40px', borderRadius:'50%', border:'none', background:MONO_NARANJA, color:'white', fontWeight:'bold', fontSize: '18px', cursor: 'pointer'}}>+</button>
                </div>
                <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible || !tiendaAbierta} style={{marginTop:'auto', background: p.disponible ? MONO_NARANJA : '#cbd5e1', color:'white', border:'none', padding:'18px', borderRadius:'20px', fontWeight:'900', fontSize: '16px', cursor: 'pointer'}}>Añadir 🛒</button>
              </div>
            );
        })}
      </div>
      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '50px auto 100px', background: 'white', padding: '40px', borderRadius: '40px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 45px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: '900', margin: 0 }}>🛒 Tu Pedido</h2>
            <button onClick={vaciarCarrito} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>🗑️ Vaciar</button>
          </div>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '15px 0', alignItems: 'center' }}>
              <span style={{fontSize: '17px'}}><strong>{item.cantidad}x</strong> {item.nombre} <br /><small style={{color: '#666', fontWeight: 'bold'}}>{item.detalle}</small></span>
              <strong style={{fontSize: '18px'}}>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '38px', fontWeight: '900', marginTop: '30px', borderTop: '4px dashed #eee', paddingTop: '15px' }}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '25px' }}>
            <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '16px' }} />
            <input type="text" placeholder="Dirección en Carepa" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '16px' }} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '16px', fontWeight: 'bold' }}>
              <option value="">-- ¿Cómo pagas? --</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', border: 'none', padding: '22px', borderRadius: '25px', fontWeight: '900', fontSize: '20px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(22, 163, 74, 0.2)' }}>WhatsApp 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}