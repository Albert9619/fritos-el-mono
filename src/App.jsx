import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 COMPONENTE MINISWITCH
// ==========================================
const MiniSwitch = ({ activo, onClick }) => (
  <div onClick={onClick} style={{ width: '46px', height: '24px', backgroundColor: activo ? "#16a34a" : '#cbd5e1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s', flexShrink: 0 }}>
    <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '25px' : '3px', transition: '0.3s cubic-bezier(0.18, 0.89, 0.35, 1.15)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
  </div>
);

// ==========================================
// 🔴 DATOS MAESTROS
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", disponible: true, imagen: "/empanada.jpg", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", disponible: true, imagen: "/papa-rellena.jpg", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", disponible: true, imagen: "/pastel-pollo.jpg" },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", disponible: true, imagen: "/api-logo.jpg" },
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", disponible: true, imagen: "/palito-queso.jpg" },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", disponible: true, imagen: "/desayuno-carne.jpg", config: { acompanamiento: ["Patacón", "Arepa"], huevos: ["Revueltos", "Pericos"], jugos: ["Avena", "Maracuyá"] } },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", disponible: true, imagen: "/desayuno-huevo.jpg", config: { acompanamiento: ["Patacón", "Arepa"], proteina: ["Carne desmechada", "Pollo desmechado"], jugos: ["Avena", "Maracuyá"] } },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", disponible: true, imagen: "/jugo-natural.jpg", sabores: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", disponible: true, imagen: "/cocacola.jpg", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }, { nombre: "Familiar", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", disponible: true, imagen: "/malta.jpg", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", disponible: true, imagen: "/agua.jpg"},
  { id: "milo1", nombre: "Milo Refrescante", precio: 4000, categoria: "Bebidas", disponible: true, imagen: "/milo.jpg" }, 
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", disponible: true, imagen: "/arroz-pollo.jpg" }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Cocido", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Tajada de Queso", disponible: true, precio: 1000 }
];

const salsasIniciales = [
  { id: "roja", nombre: "🔴 Roja", disponible: true },
  { id: "rosada", nombre: "💗 Rosada", disponible: true },
  { id: "pique", nombre: "🔥 Pique", disponible: true },
  { id: "suero", nombre: "🥛 Suero", disponible: true },
  { id: "suero_p", nombre: "🥛🔥 Suero Picante", disponible: true }
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
  const [salsasFB, setSalsasFB] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [selecciones, setSelecciones] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [salsasElegidas, setSalsasElegidas] = useState([]);
  const [notificacion, setNotificacion] = useState("");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [horaEntrega, setHoraEntrega] = useState(""); 
  const [pagoCon, setPagoCon] = useState(""); 

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSalsas = onSnapshot(collection(db, "salsas"), (s) => setSalsasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { 
      if (s.exists()) setTiendaAbierta(s.data().abierta); 
    });
    return () => { unsubProd(); unsubExtras(); unsubSalsas(); unsubTienda(); };
  }, []);

  useEffect(() => {
    const pedidoGuardado = localStorage.getItem("pedido_mono_storage");
    if (pedidoGuardado) setPedido(JSON.parse(pedidoGuardado));
  }, []);

  useEffect(() => {
    localStorage.setItem("pedido_mono_storage", JSON.stringify(pedido));
  }, [pedido]);

  const fusionar = (base, fb) => {
    const mapa = {};
    base.forEach(p => mapa[p.id] = { ...p });
    fb.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
    return Object.values(mapa);
  };

  const productosMostrar = fusionar(productosBase, productosFB);
  const extrasMostrar = fusionar(extrasArrozBase, extrasFB);
  const salsasMostrar = fusionar(salsasIniciales, salsasFB);

  const guardarCambio = async (col, id, datos) => {
    try { await setDoc(doc(db, col, id), datos, { merge: true }); } 
    catch (e) { console.error("Error Firebase:", e); }
  };

  const agregarAlCarrito = (p) => {
    const sel = selecciones[p.id] || {};
    const cant = cantidades[p.id] || 1;
    if (p.disponible === false) return alert("Producto agotado");
    if (p.opciones && !sel.sabor && p.categoria === "Fritos") return alert("Elige un sabor");
    if (p.sabores && !sel.sabor) return alert("Elige el sabor");
    if (p.tamanos && p.tamanos.length > 0 && !sel.tamano) return alert("Elige el tamaño");
    if (p.categoria === "Desayunos") {
        if (!sel.acompanamiento || !sel.jugo || (p.id === "d1" && !sel.huevos) || (p.id === "d2" && !sel.proteina)) return alert("Completa el desayuno");
    }
    
    let precioBase = p.precio || 0;
    // 🛡️ BLINDAJE: Verificamos de forma segura usando optional chaining
    if (sel.tamano) precioBase = sel.tamano?.precio || 0;
    
    const extrasPrice = (sel.extras || []).reduce((acc, name) => {
      const ex = extrasMostrar.find(e => e.nombre === name);
      return acc + (ex?.precio || 0);
    }, 0);
    
    const upgrade = (p.categoria === "Desayunos" && sel.agrandar) ? 1000 : 0;
    const subtotal = (precioBase + extrasPrice + upgrade) * cant;
    
    let detalle = `${sel.sabor || ''} ${sel.tamano?.nombre || ''} ${sel.extras && sel.extras.length > 0 ? ' Extras: '+sel.extras.join(', ') : ''}`;
    if (p.categoria === "Desayunos") detalle += `(${sel.acompanamiento || ''}, ${sel.huevos || sel.proteina || ''}, Jugo: ${sel.jugo || ''}${sel.agrandar ? ' Grande' : ''})`;
    
    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, cantidad: cant, subtotal, detalle: detalle.trim() }]);
    setCantidades({ ...cantidades, [p.id]: 1 });
    setSelecciones({ ...selecciones, [p.id]: {} });
    setNotificacion(`¡Añadido! 🥟`);
    setTimeout(() => setNotificacion(""), 2000);
  };

  const eliminarDelCarrito = (idUnico) => setPedido(pedido.filter(i => i.idUnico !== idUnico));
  const vaciarCarrito = () => { if (window.confirm("¿Vaciar todo el pedido?")) { setPedido([]); setSalsasElegidas([]); } };

  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos");
    if (metodoPago === "Efectivo" && !pagoCon) return alert("Dinos con cuánto vas a pagar");
    const horaActual = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const divisor = "━━━━━━━━━━━━━━━";
    const totalComida = pedido.reduce((acc, i) => acc + (i.subtotal || 0), 0);
    const costoDomicilio = totalComida < 8000 ? 2000 : 0;
    const totalFinal = totalComida + costoDomicilio;
    const listaProductos = pedido.map(i => `• ${i.cantidad}x ${i.nombre} (${i.detalle.trim()})`).join('\n');
    const salsas = salsasElegidas.length > 0 ? `🍯 *Salsas:* ${salsasElegidas.join(', ')}` : "🍯 *Salsas:* Ninguna";
    let infoPago = `💳 *Pago:* ${metodoPago}`;
    if (metodoPago === "Efectivo") {
      const cambio = Number(pagoCon) - totalFinal;
      infoPago += `\n💵 *Paga con:* $${Number(pagoCon).toLocaleString()}\n💰 *Cambio:* $${cambio > 0 ? cambio.toLocaleString() : '0'}`;
    }
    const msg = `🍽️ *Pedido - Fritos El Mono* 🐒\n🕒 Enviado: ${horaActual}\n⏰ *Entregar:* ${horaEntrega || 'ASAP'}\n\n${divisor}\n\n🧾 *Productos:*\n${listaProductos}\n\n${divisor}\n\n${salsas}\n\n${divisor}\n\n💰 *Subtotal:* $${totalComida.toLocaleString()}\n🛵 *Dom:* $${costoDomicilio}\n⭐ *TOTAL:* $${totalFinal.toLocaleString()}\n\n${divisor}\n\n👤 ${nombre}\n📍 ${direccion}\n${infoPago}`;
    window.open(`https://wa.me/573116624201?text=${encodeURIComponent(msg)}`);
  };

  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'850px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px', alignItems: 'center'}}>
            <h1 style={{color: MONO_NARANJA}}>Admin 🐒</h1>
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
               <MiniSwitch activo={tiendaAbierta} onClick={() => guardarCambio("ajuste", "tienda", { abierta: !tiendaAbierta })} />
               <button onClick={() => setIsAdmin(false)} style={{padding:'10px', borderRadius:'10px', background:MONO_TEXTO, color:'white', border:'none', cursor:'pointer'}}>Cerrar</button>
            </div>
          </div>
          {["Fritos", "Arroces", "Bebidas", "Desayunos"].map(cat => (
            <div key={cat} style={{background:'white', padding:'25px', borderRadius:'25px', marginBottom:'25px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
              <h2 style={{borderBottom:'2px solid #eee', paddingBottom:'10px', marginBottom:'15px'}}>{cat}</h2>
              {productosMostrar.filter(p => p.categoria === cat).map(p => (
                <div key={p.id} style={{padding:'15px 0', borderBottom:'1px solid #f1f5f9'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <strong>{p.nombre}</strong>
                    <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
                  </div>
                  {/* Gestión de Sabores/Opciones (Empanadas, Papas, Jugos) */}
                  {(p.opciones || p.sabores) && (
                    <div style={{marginTop:'10px', display:'flex', gap:'10px', flexWrap:'wrap', background:'#f8fafc', padding:'10px', borderRadius:'15px'}}>
                      <small style={{width:'100%', fontWeight:'bold'}}>Gestionar Sabores:</small>
                      {(p.opciones || p.sabores).map((opt, idx) => (
                        <div key={idx} style={{display:'flex', alignItems:'center', gap:'5px', background:'white', padding:'5px 10px', borderRadius:'10px', border:'1px solid #eee'}}>
                          <small>{opt.nombre}</small>
                          <MiniSwitch activo={opt.disponible} onClick={() => {
                            const n = [...(p.opciones || p.sabores)];
                            n[idx].disponible = !n[idx].disponible;
                            guardarCambio("productos", p.id, p.opciones ? { opciones: n } : { sabores: n });
                          }} />
                        </div>
                      ))}
                    </div>
                  )}
                  {p.tamanos ? (
                    <div style={{display:'grid', gap:'10px', marginTop:'10px'}}>
                      {p.tamanos.map((t, idx) => (
                        <div key={idx} style={{display:'flex', justifyContent:'space-between', background:'#f0f9ff', padding:'10px', borderRadius:'15px'}}>
                          <small>{t.nombre}</small>
                          <div style={{display:'flex', gap:'10px'}}>
                            $ <input type="number" defaultValue={t.precio} onBlur={(e) => {
                              const nt = [...p.tamanos]; nt[idx].precio = Number(e.target.value);
                              guardarCambio("productos", p.id, { tamanos: nt });
                            }} style={{width:'80px'}} />
                            <MiniSwitch activo={t.disponible} onClick={() => {
                              const nt = [...p.tamanos]; nt[idx].disponible = !nt[idx].disponible;
                              guardarCambio("productos", p.id, { tamanos: nt });
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{marginTop:'10px'}}>
                      $ <input type="number" defaultValue={p.precio} onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })} style={{width:'100px', padding:'8px', borderRadius:'8px', border:'1px solid #ddd'}} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          {/* Gestión de Salsas */}
          <div style={{background:'white', padding:'25px', borderRadius:'25px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)', marginBottom:'25px'}}>
            <h2 style={{borderBottom:'2px solid #eee', paddingBottom:'10px', marginBottom:'15px'}}>Salsas</h2>
            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
              {salsasMostrar.map(s => (
                <div key={s.id} style={{padding:'10px', background:'#f8fafc', borderRadius:'15px', display:'flex', alignItems:'center', gap:'10px', border:'1px solid #eee'}}>
                  <small style={{fontWeight:'bold'}}>{s.nombre}</small>
                  <MiniSwitch activo={s.disponible} onClick={() => guardarCambio("salsas", s.id, { disponible: !s.disponible })} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalSinDom = pedido.reduce((acc, i) => acc + (i.subtotal || 0), 0);
  const domCosto = totalSinDom < 8000 && totalSinDom > 0 ? 2000 : 0;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px', color: MONO_TEXTO, filter: tiendaAbierta ? 'none' : 'grayscale(1) opacity(0.8)', transition: '0.4s' }}>
      <style>{`.card-mono { transition: 0.3s; } .card-mono:hover { transform: translateY(-10px); } .opcion-btn { padding: 10px; border-radius: 12px; border: 1px solid #ddd; background: white; cursor: pointer; font-weight: bold; font-size: 13px; } .opcion-btn.active { background: ${MONO_NARANJA}; color: white; border-color: ${MONO_NARANJA}; } .salsa-chip { padding: 12px; border-radius: 15px; border: 2px solid #eee; background: white; cursor: pointer; font-weight: bold; font-size: 13px; } .salsa-chip.active { border-color: ${MONO_NARANJA}; background: #fff7ed; color: ${MONO_NARANJA}; } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      
      {!tiendaAbierta && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.1)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: `4px solid ${MONO_NARANJA}`, maxWidth: '400px' }}>
            <span style={{ fontSize: '60px' }}>🐒💤</span>
            <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '20px 0 10px', color: MONO_NARANJA }}>El Mono descansa</h2>
            <button onDoubleClick={() => { const pin = window.prompt("PIN:"); if(pin === "mono2026") setIsAdmin(true); }} style={{ background: 'none', border: 'none', color: '#eee' }}>Admin</button>
          </div>
        </div>
      )}

      {notificacion && <div style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background: MONO_VERDE, color:'white', padding:'15px 30px', borderRadius:'50px', zIndex: 10000, fontWeight:'bold'}}>{notificacion}</div>}

      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 50px 50px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{width: '100%', height: '200px', objectFit: 'cover'}} />
        <div style={{padding: '25px 0'}}>
            <h1 onDoubleClick={() => { const pin = window.prompt("PIN:"); if(pin === "mono2026") setIsAdmin(true); }} style={{color: MONO_NARANJA, margin:'0', fontSize: '2.5rem', fontWeight: '900'}}>Fritos El Mono 🐒</h1>
            <div style={{display:'inline-block', marginTop: '10px', background: '#fff7ed', padding: '6px 20px', borderRadius: '20px', fontWeight: 'bold'}}>
              Sabor del arroz hoy: {tipoArrozHoy}
            </div>
        </div>
      </header>

      <div className="no-scrollbar" style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px', marginBottom: '40px', overflowX: 'auto', padding: '10px 20px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '14px 28px', borderRadius: '30px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : '#333', fontWeight: 'bold', flexShrink: 0 }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '30px', padding: '0 20px', maxWidth:'1300px', margin:'0 auto'}}>
        {productosMostrar.filter(p => p.categoria === categoriaActiva).map(p => {
            const sel = selecciones[p.id] || {};
            const cant = cantidades[p.id] || 1;
            
            // 🛡️ BLINDAJE: Cálculo de precio súper seguro. Si tamanos está vacío, no se rompe.
            const precioU = (p.tamanos && p.tamanos.length > 0) 
              ? (sel.tamano?.precio || p.tamanos[0]?.precio || 0) 
              : (p.precio || 0);
              
            const extrasP = (sel.extras || []).reduce((acc, name) => acc + (extrasMostrar.find(e => e.nombre === name)?.precio || 0), 0);
            const total = (precioU + extrasP + (sel.agrandar ? 1000 : 0)) * cant;
            
            return (
              <div key={p.id} className="card-mono" style={{background: 'white', borderRadius: '40px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 20px rgba(0,0,0,0.02)', border:'1px solid #f1f5f9', opacity: p.disponible === false ? 0.6 : 1}}>
                <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '180px', borderRadius: '25px', objectFit: 'cover', filter: p.disponible === false ? 'grayscale(1)' : 'none' }} />
                <h3 style={{margin: '15px 0 5px 0', fontWeight: '800', fontSize: '18px', minHeight: '44px', display: 'flex', alignItems: 'center'}}>{p.nombre}</h3>
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '26px', margin:'0 0 15px 0'}}>${(total || 0).toLocaleString()}</p>
                {(p.opciones || p.sabores) && p.categoria !== "Arroces" && (
                  <select value={sel.sabor || ""} onChange={(e) => setSelecciones({...selecciones, [p.id]: {...sel, sabor: e.target.value}})} style={{width:'100%', padding:'12px', borderRadius:'15px', marginBottom:'10px', background:'#f8fafc', fontWeight:'bold', border:'1px solid #eee'}}>
                    <option value="">-- Sabor --</option>
                    {(p.opciones || p.sabores).filter(o => o.disponible).map(o => <option key={o.nombre} value={o.nombre}>{o.nombre}</option>)}
                  </select>
                )}
                {p.tamanos && p.tamanos.length > 0 && (
                  <select value={sel.tamano?.nombre || ""} onChange={(e) => setSelecciones({...selecciones, [p.id]: {...sel, tamano: p.tamanos.find(t => t.nombre === e.target.value)}})} style={{width:'100%', padding:'12px', borderRadius:'15px', marginBottom:'10px', background:'#f8fafc', fontWeight:'bold', border:'1px solid #eee'}}>
                    <option value="">-- Tamaño --</option>
                    {p.tamanos.filter(t => t.disponible).map(t => <option key={t.nombre} value={t.nombre}>{t.nombre}</option>)}
                  </select>
                )}
                {p.categoria === "Arroces" && (
                  <div style={{background: '#fef3c7', padding: '12px', borderRadius: '15px', marginBottom: '10px'}}>
                     {extrasMostrar.map(e => (
                       <label key={e.id} style={{display:'block', fontSize:'14px', marginBottom:'5px', opacity: e.disponible ? 1 : 0.3, fontWeight:'bold'}}>
                         <input type="checkbox" checked={sel.extras?.includes(e.nombre) || false} disabled={!e.disponible} onChange={(ev) => {
                           const ex = sel.extras || [];
                           setSelecciones({...selecciones, [p.id]: {...sel, extras: ev.target.checked ? [...ex, e.nombre] : ex.filter(x => x !== e.nombre)}});
                         }} /> {e.nombre} {e.precio > 0 && `(+$${e.precio})`}
                       </label>
                     ))}
                  </div>
                )}
                {p.categoria === "Desayunos" && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px'}}>
                        <div style={{display: 'flex', gap: '5px'}}>{p.config.acompanamiento.map(a => <button key={a} onClick={() => setSelecciones({...selecciones, [p.id]: {...sel, acompanamiento: a}})} className={`opcion-btn ${sel.acompanamiento === a ? 'active' : ''}`}>{a}</button>)}</div>
                        <div style={{display: 'flex', gap: '5px'}}>{(p.config.huevos || p.config.proteina).map(op => <button key={op} onClick={() => setSelecciones({...selecciones, [p.id]: {...sel, [p.id === "d1" ? "huevos" : "proteina"]: op}})} className={`opcion-btn ${ (sel.huevos === op || sel.proteina === op) ? 'active' : ''}`}>{op}</button>)}</div>
                        <div style={{display: 'flex', gap: '5px'}}>{p.config.jugos.map(j => <button key={j} onClick={() => setSelecciones({...selecciones, [p.id]: {...sel, jugo: j}})} className={`opcion-btn ${sel.jugo === j ? 'active' : ''}`}>{j}</button>)}</div>
                        <label style={{fontSize: '13px', fontWeight: 'bold'}}><input type="checkbox" checked={sel.agrandar || false} onChange={(e) => setSelecciones({...selecciones, [p.id]: {...sel, agrandar: e.target.checked}})} /> 🥤 Agrandar Jugo (+1.000)</label>
                    </div>
                )}
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'15px', marginBottom:'15px', background:'#f8fafc', padding:'10px', borderRadius:'15px'}}>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: Math.max(1, cant - 1)})} style={{width:'40px', height:'40px', borderRadius:'50%', border:'none'}}>-</button>
                   <span style={{fontWeight:'900', fontSize:'20px'}}>{cant}</span>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: cant + 1})} style={{width:'40px', height:'40px', borderRadius:'50%', border:'none', background:MONO_NARANJA, color:'white'}}>+</button>
                </div>
                <button onClick={() => agregarAlCarrito(p)} disabled={!tiendaAbierta || p.disponible === false} style={{background: (tiendaAbierta && p.disponible !== false) ? MONO_NARANJA : '#ccc', color:'white', border:'none', padding:'18px', borderRadius:'20px', fontWeight:'900', cursor:'pointer'}}>{p.disponible === false ? 'AGOTADO' : 'Añadir 🛒'}</button>
              </div>
            );
        })}
      </div>

      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '50px auto 100px', background: 'white', padding: '40px', borderRadius: '40px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 45px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>🛒 Tu Pedido</h2>
            <button onClick={vaciarCarrito} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🗑️ Vaciar Todo</button>
          </div>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '15px 0' }}>
              <span style={{flex: 1}}><strong>{item.cantidad}x</strong> {item.nombre} <br /><small style={{fontWeight:'bold'}}>{item.detalle}</small></span>
              <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <strong style={{fontSize: '18px'}}>${item.subtotal.toLocaleString()}</strong>
                <button onClick={() => eliminarDelCarrito(item.idUnico)} style={{background:'none', border:'none', color:'#ef4444', fontSize:'20px', cursor:'pointer', padding:'5px'}}>❌</button>
              </div>
            </div>
          ))}
          <div style={{marginTop: '30px', background: '#f8fafc', padding: '25px', borderRadius: '25px'}}>
            <h3 style={{margin: '0 0 15px 0', fontSize: '20px', fontWeight: '900'}}>🧂 Salsas:</h3>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              {salsasMostrar.filter(s => s.disponible).map(s => (
                <button key={s.id} onClick={() => setSalsasElegidas(salsasElegidas.includes(s.nombre) ? salsasElegidas.filter(x => x !== s.nombre) : [...salsasElegidas, s.nombre])} className={`salsa-chip ${salsasElegidas.includes(s.nombre) ? 'active' : ''}`}>{s.nombre}</button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '20px', padding: '20px', background: '#fffcf5', borderRadius: '25px', border: `2px dashed ${MONO_NARANJA}`, textAlign: 'right' }}>
             <p style={{margin:0}}>Subtotal: <strong>${totalSinDom.toLocaleString()}</strong></p>
             <p style={{margin:'5px 0', color: domCosto === 0 ? MONO_VERDE : '#333'}}>Domicilio: <strong>{domCosto === 0 ? '¡GRATIS!' : `+$${domCosto.toLocaleString()}`}</strong></p>
             {totalSinDom < 8000 && (
               <small style={{display:'block', marginBottom:'10px', color:MONO_NARANJA, fontWeight:'bold'}}>
                 (Pide ${(8000 - totalSinDom).toLocaleString()} más para envío gratis)
               </small>
             )}
             <h2 style={{ color: MONO_NARANJA, fontSize: '42px', fontWeight: '900', margin:0 }}>Total: ${(totalSinDom + domCosto).toLocaleString()}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '25px' }}>
            <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd' }} />
            <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd' }} />
            <div style={{background:'#f0f9ff', padding:'15px', borderRadius:'15px'}}>
               <label style={{display:'block', fontSize:'13px', fontWeight:'bold', marginBottom:'5px'}}>🕒 ¿A qué hora lo necesitas?</label>
               <input type="time" value={horaEntrega} onChange={(e) => setHoraEntrega(e.target.value)} style={{ width:'100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
            </div>
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd', fontWeight: 'bold' }}>
              <option value="">-- ¿Cómo pagas? --</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi">Nequi</option>
            </select>
            {metodoPago === "Efectivo" && (
              <div style={{background:'#fff7ed', padding:'15px', borderRadius:'15px', border:`1px solid ${MONO_NARANJA}`}}>
                <label style={{display:'block', fontSize:'13px', fontWeight:'bold', marginBottom:'5px'}}>💵 ¿Con cuánto pagas?</label>
                <input type="number" placeholder="Ej: 20000" value={pagoCon} onChange={(e) => setPagoCon(e.target.value)} style={{ width:'100%', padding: '15px', borderRadius: '10px', border: 'none' }} />
              </div>
            )}
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', padding: '22px', borderRadius: '25px', fontWeight: '900', fontSize: '22px', cursor:'pointer' }}>WhatsApp 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}