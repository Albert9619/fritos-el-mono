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
  
  { 
    id: "d1", 
    nombre: "Desayuno Tradicional", 
    precio: 8000, 
    categoria: "Desayunos", 
    imagen: "/desayuno-carne.png",
    config: { acompanamiento: ["Patacón", "Arepa"], huevos: ["Revueltos", "Pericos"], jugos: ["Avena", "Maracuyá"] }
  },
  
  { 
    id: "d2", 
    nombre: "Desayuno Especial", 
    precio: 10000, 
    categoria: "Desayunos", 
    imagen: "/desayuno-huevo.png",
    config: { acompanamiento: ["Patacón", "Arepa"], proteina: ["Carne desmechada", "Pollo desmechado"], jugos: ["Avena", "Maracuyá"] }
  },

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

const salsasMaestras = ["Rosada", "Tártara", "Ajo", "Picante"];

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
  const [salsasElegidas, setSalsasElegidas] = useState([]); // Salsas al final
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
    if (p.categoria === "Desayunos") {
        if (!sel.acompanamiento) return alert("Elige Patacón o Arepa");
        if (p.id === "d1" && !sel.huevos) return alert("Elige tipo de huevos");
        if (p.id === "d2" && !sel.proteina) return alert("Elige la proteína");
        if (!sel.jugo) return alert("Elige el jugo");
    }

    let precioBase = p.precio || 0;
    if (sel.tamano) precioBase = sel.tamano.precio;
    const extrasPrice = (sel.extras || []).reduce((acc, id) => {
      const ex = extrasMostrar.find(e => e.id === id);
      return acc + (ex?.precio || 0);
    }, 0);
    const upgradeDesayuno = (p.categoria === "Desayunos" && sel.agrandar) ? 1000 : 0;
    const subtotal = (precioBase + extrasPrice + upgradeDesayuno) * cant;

    let detalle = "";
    if (sel.sabor) detalle += `${sel.sabor} `;
    if (sel.tamano) detalle += `${sel.tamano.nombre} `;
    if (sel.extras) detalle += `Extras: ${sel.extras.join(', ')} `;
    if (p.categoria === "Desayunos") {
        detalle += `(${sel.acompanamiento}, ${sel.huevos || sel.proteina}, Jugo: ${sel.jugo}${sel.agrandar ? ' Grande' : ''})`;
    }

    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, cantidad: cant, subtotal, detalle }]);
    setCantidades({ ...cantidades, [p.id]: 1 });
    setSelecciones({ ...selecciones, [p.id]: {} });
    setNotificacion(`¡${cant}x ${p.nombre} añadido! 🥟`);
    setTimeout(() => setNotificacion(""), 2000);
  };

  const vaciarCarrito = () => { if (window.confirm("¿Vaciar todo el pedido?")) { setPedido([]); setSalsasElegidas([]); } };

  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos de entrega");
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.detalle}`).join('\n');
    const salsasMsg = salsasElegidas.length > 0 ? `\n\n🧂 *Salsas:* ${salsasElegidas.join(', ')}` : "";
    const totalP = pedido.reduce((acc, i) => acc + i.subtotal, 0);
    const msg = `¡Hola! Pedido Fritos El Mono 🐒:\n\n${lista}${salsasMsg}\n\n*Total: $${totalP.toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{ width: '46px', height: '24px', backgroundColor: activo ? MONO_VERDE : '#cbd5e1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s', flexShrink: 0 }}>
      <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '25px' : '3px', transition: '0.3s cubic-bezier(0.18, 0.89, 0.35, 1.15)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
    </div>
  );

  // 🟢 VISTA ADMIN (RESTAURADA TOTALMENTE)
  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px', alignItems: 'center'}}>
            <h1 style={{color: MONO_NARANJA}}>Admin 🐒</h1>
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
               <span style={{fontWeight:'bold'}}>Tienda:</span>
               <MiniSwitch activo={tiendaAbierta} onClick={() => guardarCambio("ajuste", "tienda", { abierta: !tiendaAbierta })} />
               <button onClick={() => setIsAdmin(false)} style={{padding:'10px 20px', borderRadius:'12px', background:MONO_TEXTO, color:'white', border:'none', cursor:'pointer'}}>Cerrar</button>
            </div>
          </div>
          {["Fritos", "Arroces", "Bebidas", "Desayunos"].map(cat => (
            <div key={cat} style={{background:'white', padding:'25px', borderRadius:'25px', marginBottom:'25px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
              <h2 style={{borderBottom:'2px solid #eee', paddingBottom:'10px', marginBottom:'15px'}}>{cat}</h2>
              {productosMostrar.filter(p => p.categoria === cat).map(p => (
                <div key={p.id} style={{padding:'15px 0', borderBottom:'1px solid #f8fafc'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <strong>{p.nombre}</strong>
                    <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                      {!p.tamanos && <div>$ <input type="number" defaultValue={p.precio} onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })} style={{width:'80px', padding:'5px', borderRadius:'8px', border:'1px solid #ddd'}} /></div>}
                      <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
                    </div>
                  </div>
                </div>
              ))}
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
        .opcion-btn { padding: 10px 14px; border-radius: 12px; border: 1px solid #ddd; background: white; cursor: pointer; font-size: 14px; font-weight: bold; }
        .opcion-btn.active { background: ${MONO_NARANJA}; color: white; border-color: ${MONO_NARANJA}; }
        .salsa-chip { padding: 12px 20px; border-radius: 15px; border: 2px solid #eee; background: white; cursor: pointer; font-weight: bold; transition: 0.2s; }
        .salsa-chip.active { border-color: ${MONO_NARANJA}; background: #fff7ed; color: ${MONO_NARANJA}; }
      `}</style>

      {notificacion && (
        <div style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background: MONO_VERDE, color:'white', padding:'15px 30px', borderRadius:'50px', zIndex: 10000, fontWeight:'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.2)'}}>{notificacion}</div>
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

            let precioUni = p.precio || 0;
            if (p.tamanos) precioUni = sel.tamano ? sel.tamano.precio : p.tamanos[0].precio;
            const extraSum = (sel.extras || []).reduce((acc, id) => {
                const ex = extrasMostrar.find(e => e.id === id);
                return acc + (ex?.precio || 0);
            }, 0);
            const upgradeSum = (p.categoria === "Desayunos" && sel.agrandar) ? 1000 : 0;
            const totalDinamico = (precioUni + extraSum + upgradeSum) * cant;

            return (
              <div key={p.id} className="card-mono" style={{background: 'white', borderRadius: '40px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 20px rgba(0,0,0,0.02)', border:'1px solid #f1f5f9', position: 'relative'}}>
                {esFavorito && (
                  <div style={{position:'absolute', top: '15px', left: '15px', zIndex: 10, background: '#ef4444', color: 'white', padding: '6px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: '900'}}>⭐ EL FAVORITO</div>
                )}
                <div style={{ width: '100%', height: '180px', borderRadius: '25px', overflow: 'hidden', marginBottom: '15px' }}>
                  <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none' }} onError={(e) => {e.target.onerror = null; e.target.src = "/logo-fritos-el-mono.jpg";}} />
                </div>
                <h3 style={{margin: '0 0 5px 0', fontWeight: '800', fontSize: '20px'}}>{p.nombre}</h3>
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '26px', margin:'0 0 15px 0'}}>${totalDinamico.toLocaleString()}</p>
                
                {p.categoria === "Fritos" && p.opciones && (
                  <select onChange={(e) => setSelecciones({...selecciones, [p.id]: {...sel, sabor: e.target.value}})} style={{width:'100%', padding:'14px', borderRadius:'18px', border:'2px solid #f8fafc', marginBottom:'15px', background:'#f8fafc', fontWeight: 'bold'}}>
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
                       <label key={e.id} style={{display:'block', marginBottom:'5px', opacity: e.disponible ? 1 : 0.4, fontSize: '14px', fontWeight: 'bold'}}>
                         <input type="checkbox" disabled={!e.disponible} onChange={(ev) => {
                           const ex = sel.extras || [];
                           const n = ev.target.checked ? [...ex, e.id] : ex.filter(x => x !== e.id);
                           setSelecciones({...selecciones, [p.id]: {...sel, extras: n}});
                         }} /> {e.nombre} {e.precio > 0 && `(+$${e.precio})`}
                       </label>
                     ))}
                  </div>
                )}

                {p.categoria === "Desayunos" && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px'}}>
                        <div style={{display: 'flex', gap: '5px'}}>
                            {p.config.acompanamiento.map(a => (
                                <button key={a} onClick={() => setSelecciones({...selecciones, [p.id]: {...sel, acompanamiento: a}})} className={`opcion-btn ${sel.acompanamiento === a ? 'active' : ''}`}>{a}</button>
                            ))}
                        </div>
                        <div style={{display: 'flex', gap: '5px'}}>
                            {(p.config.huevos || p.config.proteina).map(op => (
                                <button key={op} onClick={() => setSelecciones({...selecciones, [p.id]: {...sel, [p.id === "d1" ? "huevos" : "proteina"]: op}})} className={`opcion-btn ${ (sel.huevos === op || sel.proteina === op) ? 'active' : ''}`}>{op}</button>
                            ))}
                        </div>
                        <div style={{display: 'flex', gap: '5px'}}>
                            {p.config.jugos.map(j => (
                                <button key={j} onClick={() => setSelecciones({...selecciones, [p.id]: {...sel, jugo: j}})} className={`opcion-btn ${sel.jugo === j ? 'active' : ''}`}>{j}</button>
                            ))}
                        </div>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '900', background: '#f0fdf4', padding: '10px', borderRadius: '12px', cursor: 'pointer', border: '1px dashed #16a34a'}}>
                            <input type="checkbox" onChange={(e) => setSelecciones({...selecciones, [p.id]: {...sel, agrandar: e.target.checked}})} />
                            🥤 Agrandar Jugo (+1.000)
                        </label>
                        <div style={{fontSize: '22px', color: MONO_VERDE, fontWeight: '900', textAlign: 'center', marginTop: '5px'}}>🧀 ¡INCLUYE QUESO!</div>
                    </div>
                )}

                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'15px', marginBottom:'15px', background:'#f8fafc', padding:'10px', borderRadius:'15px'}}>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: Math.max(1, cant - 1)})} style={{width:'40px', height:'40px', borderRadius:'50%', border:'none', background:'white', fontWeight:'bold', fontSize: '18px'}}>-</button>
                   <span style={{fontWeight:'900', fontSize:'20px', minWidth: '30px', textAlign: 'center'}}>{cant}</span>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: cant + 1})} style={{width:'40px', height:'40px', borderRadius:'50%', border:'none', background:MONO_NARANJA, color:'white', fontWeight:'bold', fontSize: '18px'}}>+</button>
                </div>
                <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible || !tiendaAbierta} style={{marginTop:'auto', background: p.disponible ? MONO_NARANJA : '#cbd5e1', color:'white', border:'none', padding:'18px', borderRadius:'20px', fontWeight:'900', fontSize: '16px'}}>Añadir 🛒</button>
              </div>
            );
        })}
      </div>
      
      {/* SECCIÓN CARRITO */}
      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '50px auto 100px', background: 'white', padding: '40px', borderRadius: '40px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 45px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '25px' }}>🛒 Tu Pedido</h2>
          
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '15px 0', alignItems: 'center' }}>
              <span style={{fontSize: '17px'}}><strong>{item.cantidad}x</strong> {item.nombre} <br /><small style={{color: '#666', fontWeight: 'bold'}}>{item.detalle}</small></span>
              <strong style={{fontSize: '18px'}}>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}

          {/* 🧂 SECCIÓN DE SALSAS AL FINAL */}
          <div style={{marginTop: '30px', padding: '25px', background: '#f8fafc', borderRadius: '25px', border: '1px solid #eee'}}>
            <h3 style={{margin: '0 0 15px 0', fontSize: '20px', fontWeight: '900'}}>🧂 Elige tus salsas:</h3>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              {salsasMaestras.map(s => (
                <button key={s} onClick={() => {
                  const n = salsasElegidas.includes(s) ? salsasElegidas.filter(x => x !== s) : [...salsasElegidas, s];
                  setSalsasElegidas(n);
                }} className={`salsa-chip ${salsasElegidas.includes(s) ? 'active' : ''}`}>{s}</button>
              ))}
            </div>
          </div>

          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '42px', fontWeight: '900', marginTop: '30px', borderTop: '4px dashed #eee', paddingTop: '20px' }}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '25px' }}>
            <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '18px' }} />
            <input type="text" placeholder="Dirección en Carepa" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '18px' }} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '18px', fontWeight: 'bold' }}>
              <option value="">-- ¿Cómo pagas? --</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button onClick={enviarWhatsApp} style={{ flex: 3, background: MONO_VERDE, color: 'white', border: 'none', padding: '22px', borderRadius: '25px', fontWeight: '900', fontSize: '20px', cursor: 'pointer' }}>WhatsApp 📲</button>
                <button onClick={vaciarCarrito} style={{ flex: 1, background: '#fee2e2', color: '#dc2626', border: 'none', padding: '22px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>🗑️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}