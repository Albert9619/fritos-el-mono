import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos" },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos" },
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos" },
  { id: "8", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos" },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos" },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos" },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }, { nombre: "Familiar", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas" },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
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

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");
  const [productosFB, setProductosFB] = useState([]);
  const [extrasFB, setExtrasFB] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [selecciones, setSelecciones] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [notificacion, setNotificacion] = useState(""); // 🔔 ESTADO PARA MENSAJE

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
    catch (e) { console.error(e); }
  };

  const vaciarCarrito = () => {
    if (window.confirm("¿Seguro que quieres borrar todo el pedido?")) {
      setPedido([]);
      localStorage.removeItem("pedido_mono");
    }
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

    // ✅ REGLA 1: Mostrar notificación
    setNotificacion(`¡${cant}x ${p.nombre} añadido! 🥟`);
    setTimeout(() => setNotificacion(""), 2500);
  };

  // 🔵 VISTA CLIENTE
  return (
    <div style={{fontFamily:'sans-serif', backgroundColor:'#fffcf5', minHeight:'100vh', paddingBottom:'100px'}}>
      
      {/* 🔔 COMPONENTE DE NOTIFICACIÓN */}
      {notificacion && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: MONO_VERDE, color: 'white', padding: '15px 30px', borderRadius: '50px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 9999, fontWeight: 'bold',
          animation: 'fadeIn 0.3s'
        }}>
          {notificacion}
        </div>
      )}

      <header style={{textAlign:'center', padding:'20px', background:'white'}}>
        <h1 onDoubleClick={() => { const p = prompt("PIN"); if(p === "mono2026") setIsAdmin(true); }} style={{color:MONO_NARANJA, cursor:'pointer'}}>Fritos El Mono 🐒</h1>
        <p>Arroz de Hoy: <strong>{tipoArrozHoy}</strong></p>
      </header>

      {/* CATEGORIAS */}
      <div style={{display:'flex', justifyContent:'center', gap:'10px', marginBottom:'20px', flexWrap:'wrap'}}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(c => (
          <button key={c} onClick={() => setCategoriaActiva(c)} style={{background: categoriaActiva === c ? MONO_NARANJA : 'white', border:'none', padding:'12px 20px', borderRadius:'15px', fontWeight:'bold', boxShadow:'0 2px 5px rgba(0,0,0,0.1)', cursor:'pointer'}}>{c}</button>
        ))}
      </div>

      {/* GRILLA PRODUCTOS */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px', padding:'0 20px', maxWidth:'1200px', margin:'0 auto'}}>
        {productosMostrar.filter(p => p.categoria === categoriaActiva).map(p => {
            const sel = selecciones[p.id] || {};
            const cant = cantidades[p.id] || 1;
            return (
              <div key={p.id} style={{background:'white', padding:'20px', borderRadius:'30px', boxShadow:'0 4px 10px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column'}}>
                <h3>{p.nombre}</h3>
                <p style={{color:MONO_NARANJA, fontWeight:'bold', fontSize:'22px'}}>${(p.precio || (sel.tamano ? sel.tamano.precio : (p.tamanos ? p.tamanos[0].precio : 0))).toLocaleString()}</p>
                
                {p.opciones && categoriaActiva === "Fritos" && (
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
                  <div style={{background:'#fffbeb', padding:'10px', borderRadius:'15px', marginBottom:'10px'}}>
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

                {/* SELECTOR CANTIDAD */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'15px', marginBottom:'15px', background:'#f8fafc', padding:'10px', borderRadius:'15px'}}>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: Math.max(1, cant - 1)})} style={{width:'35px', height:'35px', borderRadius:'50%', border:'none', background:'white', fontWeight:'bold', cursor:'pointer'}}>-</button>
                   <span style={{fontWeight:'bold', fontSize:'18px'}}>{cant}</span>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: cant + 1})} style={{width:'35px', height:'35px', borderRadius:'50%', border:'none', background:MONO_NARANJA, color:'white', fontWeight:'bold', cursor:'pointer'}}>+</button>
                </div>

                <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible || !tiendaAbierta} style={{width:'100%', background:MONO_NARANJA, color:'white', border:'none', padding:'15px', borderRadius:'15px', fontWeight:'bold', cursor:'pointer'}}>Añadir al Pedido 🥟</button>
              </div>
            );
        })}
      </div>

      {/* CARRITO */}
      {pedido.length > 0 && (
        <div style={{maxWidth:'600px', margin:'40px auto', background:'white', padding:'30px', borderRadius:'35px', border:`4px solid ${MONO_NARANJA}`, boxShadow:'0 20px 25px rgba(0,0,0,0.1)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{margin:0}}>Tu Pedido</h2>
            {/* ✅ REGLA 2: Botón de Vaciar Carrito */}
            <button onClick={vaciarCarrito} style={{background:'none', border:'none', color:'red', fontWeight:'bold', cursor:'pointer', textDecoration:'underline'}}>Vaciar Carrito</button>
          </div>

          {pedido.map((item, i) => (
            <div key={item.idUnico} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f1f5f9'}}>
              <span>{item.cantidad}x {item.nombre} <small>{item.detalle}</small></span>
              <strong>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}
          <h2 style={{textAlign:'right', color:MONO_NARANJA, fontSize:'32px', marginTop:'20px'}}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          
          <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'20px'}}>
            <input placeholder="Nombre" onChange={e => setNombre(e.target.value)} style={{padding:'15px', borderRadius:'12px', border:'1px solid #ddd'}} />
            <input placeholder="Dirección" onChange={e => setDireccion(e.target.value)} style={{padding:'15px', borderRadius:'12px', border:'1px solid #ddd'}} />
            <select onChange={e => setMetodoPago(e.target.value)} style={{padding:'15px', borderRadius:'12px', border:'1px solid #ddd'}}>
              <option value="">¿Cómo pagas?</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={() => {
               const totalP = (pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString();
               const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.detalle}`).join('\n');
               const msg = `¡Hola! Pedido Mono 🐒:\n\n${lista}\n\nTotal: $${totalP}\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
               window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
            }} style={{width:'100%', background:MONO_VERDE, color:'white', border:'none', padding:'18px', borderRadius:'15px', fontSize:'18px', fontWeight:'bold', cursor:'pointer'}}>Confirmar por WhatsApp 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}