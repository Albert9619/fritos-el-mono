import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS (Rutas sincronizadas con tu carpeta public)
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

  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px'}}>
            <h1 style={{color: MONO_NARANJA}}>Admin 🐒</h1>
            <button onClick={() => setIsAdmin(false)} style={{padding:'10px 20px', borderRadius:'12px', background:MONO_TEXTO, color:'white', border:'none', cursor:'pointer'}}>Salir</button>
          </div>
          {["Fritos", "Arroces", "Bebidas", "Desayunos"].map(cat => (
            <div key={cat} style={{background:'white', padding:'25px', borderRadius:'25px', marginBottom:'25px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
              <h2>{cat}</h2>
              {productosMostrar.filter(p => p.categoria === cat).map(p => (
                <div key={p.id} style={{padding:'10px 0', borderBottom:'1px solid #f8fafc', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <strong>{p.nombre}</strong>
                  <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    {!p.tamanos && <div>$ <input type="number" defaultValue={p.precio} onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })} style={{width:'80px'}} /></div>}
                    <button onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} style={{background: p.disponible ? MONO_VERDE : '#ccc', color:'white', border:'none', padding:'5px 10px', borderRadius:'10px'}}>{p.disponible ? 'Activo' : 'Agotado'}</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{fontFamily: 'sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px'}}>
      {notificacion && (
        <div style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background: MONO_VERDE, color:'white', padding:'15px 30px', borderRadius:'50px', zIndex: 10000, fontWeight:'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.2)'}}>{notificacion}</div>
      )}

      {pedido.length > 0 && (
        <div onClick={() => document.getElementById('carrito_seccion')?.scrollIntoView({ behavior: 'smooth' })} style={{position: 'fixed', bottom: '30px', right: '30px', background: MONO_NARANJA, color: 'white', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.5)', zIndex: 9999, cursor: 'pointer'}}>🛒<span style={{position:'absolute', top:'0', right:'0', background:'red', color: 'white', fontSize:'14px', minWidth:'22px', height:'22px', borderRadius:'50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'}}>{pedido.length}</span></div>
      )}

      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{width: '100%', height: '220px', objectFit: 'cover'}} />
        <h1 onDoubleClick={() => { const pin = window.prompt("🔐 PIN:"); if(pin === "mono2026") setIsAdmin(true); }} style={{color: MONO_NARANJA, cursor:'pointer', margin:'15px 0'}}>Fritos El Mono 🐒</h1>
        <div style={{paddingBottom:'20px'}}>Arroz de Hoy: <strong>{tipoArrozHoy}</strong></div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX:'auto', padding:'10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : '#333', fontWeight: 'bold', cursor:'pointer' }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px', padding: '0 20px', maxWidth:'1200px', margin:'0 auto'}}>
        {productosMostrar.filter(p => (p.categoria || 'Fritos') === categoriaActiva).map(p => {
            const sel = selecciones[p.id] || {};
            const cant = cantidades[p.id] || 1;
            return (
              <div key={p.id} style={{background: 'white', borderRadius: '30px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9'}}>
                <div style={{ width: '100%', height: '180px', borderRadius: '20px', overflow: 'hidden', marginBottom: '15px' }}>
                  <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none' }} onError={(e) => {e.target.onerror = null; e.target.src = "/logo-fritos-el-mono.jpg";}} />
                </div>
                <h3 style={{margin: '0 0 5px 0'}}>{p.nombre}</h3>
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '24px', margin:'0 0 15px 0'}}>${(p.precio || (sel.tamano ? sel.tamano.precio : (p.tamanos ? p.tamanos[0].precio : 0))).toLocaleString()}</p>

                {p.categoria === "Fritos" && p.opciones && (
                  <select onChange={(e) => setSelecciones({...selecciones, [p.id]: {...sel, sabor: e.target.value}})} style={{width:'100%', padding:'12px', borderRadius:'15px', border:'1px solid #e2e8f0', marginBottom:'15px', background:'#f8fafc'}}>
                    <option value="">-- Elige Sabor --</option>
                    {p.opciones.filter(opt => opt.disponible).map(opt => <option key={opt.nombre} value={opt.nombre}>{opt.nombre}</option>)}
                  </select>
                )}

                {p.tamanos && (
                  <select onChange={(e) => {
                    const t = p.tamanos.find(x => x.nombre === e.target.value);
                    setSelecciones({...selecciones, [p.id]: {...sel, tamano: t}});
                  }} style={{width:'100%', padding:'12px', borderRadius:'15px', border:'1px solid #e2e8f0', marginBottom:'15px'}}>
                    <option value="">-- Elige Tamaño --</option>
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
                   <button onClick={() => setCantidades({...cantidades, [p.id]: Math.max(1, cant - 1)})} style={{width:'35px', height:'35px', borderRadius:'50%', border:'none', background:'white', fontWeight:'bold'}}>-</button>
                   <span style={{fontWeight:'bold', fontSize:'18px'}}>{cant}</span>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: cant + 1})} style={{width:'35px', height:'35px', borderRadius:'50%', border:'none', background:MONO_NARANJA, color:'white', fontWeight:'bold'}}>+</button>
                </div>
                <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible || !tiendaAbierta} style={{marginTop:'auto', background: p.disponible ? MONO_NARANJA : '#cbd5e1', color:'white', border:'none', padding:'15px', borderRadius:'18px', fontWeight:'bold'}}>Añadir 🥟</button>
              </div>
            );
        })}
      </div>

      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '40px auto 100px', background: 'white', padding: '40px', borderRadius: '35px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 45px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: '900', margin: 0 }}>🛒 Tu Pedido</h2>
            <button onClick={vaciarCarrito} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold' }}>🗑️ Vaciar</button>
          </div>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '15px 0', alignItems: 'center' }}>
              <span style={{fontSize: '17px'}}><strong>{item.cantidad}x</strong> {item.nombre} <br /><small style={{color: '#666'}}>{item.detalle}</small></span>
              <strong>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '36px', marginTop: '30px', borderTop: '3px dashed #eee', paddingTop: '15px' }}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '25px' }}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd' }} />
            <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd' }} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd' }}>
              <option value="">-- Pago --</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', border: 'none', padding: '22px', borderRadius: '18px', fontWeight: '900', fontSize: '20px' }}>WhatsApp 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}