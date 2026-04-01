import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS (Corregidos y Completos)
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa-huevo.jpg", disponible: true },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.jpg", disponible: true },
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.jpg", disponible: true },
  { id: "8", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelo.jpg", disponible: true },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", esDesayuno: true, imagen: "/desayuno.jpg", disponible: true },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", esDesayuno: true, imagen: "/desayuno-especial.jpg", disponible: true },
  { id: "5", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", esArroz: true, imagen: "/arroz-pollo.jpg", disponible: true },
  
  { id: "6", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", imagen: "/jugo-natural.jpg", disponible: true, 
    opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], 
    tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] 
  },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", imagen: "/coca-cola.jpg", disponible: true,
    tamanos: [
      { nombre: "Mini 250ml", precio: 2500, disponible: true },
      { nombre: "Personal 400ml", precio: 3500, disponible: true },
      { nombre: "Familiar 1.5L", precio: 6500, disponible: true }
    ]
  },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", imagen: "/pony.jpg", disponible: true,
    tamanos: [
      { nombre: "Malta Mini 250ml", precio: 2500, disponible: true },
      { nombre: "Malta Personal 400ml", precio: 3500, disponible: true }
    ]
  },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", imagen: "/agua.jpg", disponible: true }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Tajada de Queso", disponible: true, precio: 1000 }
];

const salsasBase = [
  { id: "s1", nombre: "Pique", disponible: true },
  { id: "s2", nombre: "Salsa Roja", disponible: true },
  { id: "s3", nombre: "Salsa Rosada", disponible: true },
  { id: "s4", nombre: "Suero", disponible: true },
  { id: "s5", nombre: "Suero Picante", disponible: true }
];

const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");
  const [productos, setProductos] = useState([]);
  const [extrasArroz, setExtrasArroz] = useState([]);
  const [salsas, setSalsas] = useState([]);
  const [notificacion, setNotificacion] = useState("");

  const [pedido, setPedido] = useState(() => {
    const guardado = localStorage.getItem("carrito_mono");
    return guardado ? JSON.parse(guardado) : [];
  });

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [sabores, setSabores] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);
  const [conQueso, setConQueso] = useState(false);
  const [salsasElegidas, setSalsasElegidas] = useState([]);

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  const productosMostrar = productos.length > 0 ? productos : productosBase;
  const extrasArrozMostrar = extrasArroz.length > 0 ? extrasArroz : extrasArrozBase;
  const salsasMostrar = salsas.length > 0 ? salsas : salsasBase;

  useEffect(() => {
    localStorage.setItem("carrito_mono", JSON.stringify(pedido));
  }, [pedido]);

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (snap) => setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (snap) => setExtrasArroz(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSalsas = onSnapshot(collection(db, "salsas"), (snap) => setSalsas(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (snap) => {
      if (snap.exists()) setTiendaAbierta(snap.data().abierta);
    });
    return () => { unsubProd(); unsubExtras(); unsubSalsas(); unsubTienda(); };
  }, []);

  const accesoSecreto = () => {
    const clave = window.prompt("🔐 PIN:");
    if (clave === "mono2026") setIsAdmin(true);
  };

  const restaurarBaseDeDatos = async () => {
    if(!window.confirm("¿Restaurar todo?")) return;
    try {
      await setDoc(doc(db, "ajuste", "tienda"), { abierta: true });
      for (const p of productosBase) await setDoc(doc(db, "productos", p.id), p);
      for (const e of extrasArrozBase) await setDoc(doc(db, "extrasArroz", e.id), e);
      for (const s of salsasBase) await setDoc(doc(db, "salsas", s.id), s);
      alert("✅ Éxito");
    } catch (e) { alert("Error"); }
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return;
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    let sabor = "";
    let detallesExtra = "";

    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Elige acompañante");
      sabor = `Arroz de ${tipoArrozHoy}`;
      const h = extrasArrozMostrar.find(e => e.id === 'huevo');
      const q = extrasArrozMostrar.find(e => e.id === 'queso');
      if (conHuevo && h) precioBase += h.precio;
      if (conQueso && q) precioBase += q.precio;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''}${conQueso ? ' + Queso' : ''})`;
    } else if (p.opciones) {
      sabor = sabores[p.id];
      if (!sabor) return alert("Elige sabor");
    }

    if (p.tamanos) {
      const tam = tamanosJugo[p.id];
      if (!tam) return alert("Elige tamaño");
      const tObj = p.tamanos.find(t => t.nombre === tam);
      if (tObj) precioBase = tObj.precio;
      detallesExtra = `(${tam})`;
    }

    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioBase, saborElegido: sabor, detallesArroz: detallesExtra, cantidad: cant, subtotal: precioBase * cant }]);
    setNotificacion(`¡${p.nombre} añadido! 🥟`);
    setTimeout(() => setNotificacion(""), 2000);
    setAcompañanteArroz(""); setConHuevo(false); setConQueso(false);
  };

  const tajadaObj = extrasArrozMostrar.find(e => e.id === 'tajada') || { disponible: true, precio: 0 };
  const yucaObj = extrasArrozMostrar.find(e => e.id === 'yuca') || { disponible: true, precio: 0 };
  const huevoObj = extrasArrozMostrar.find(e => e.id === 'huevo') || { disponible: true, precio: 1000 };
  const quesoObj = extrasArrozMostrar.find(e => e.id === 'queso') || { disponible: true, precio: 1000 };

  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f0f2f5', minHeight: '100vh'}}>
        <button onClick={() => setIsAdmin(false)}>← Volver</button>
        <button onClick={restaurarBaseDeDatos} style={{display:'block', marginTop:'20px', background:'red', color:'white', padding:'10px'}}>🔄 REPARAR TODO</button>
        <h2 style={{marginTop:'20px'}}>Editar Productos</h2>
        {productosMostrar.map(p => (
          <div key={p.id} style={{background:'white', padding:'10px', marginBottom:'5px', display:'flex', justifyContent:'space-between'}}>
            <span>{p.nombre}</span>
            <button onClick={() => updateDoc(doc(db, "productos", p.id), { disponible: !p.disponible })}>{p.disponible ? 'HAY' : 'AGOTADO'}</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{fontFamily: 'sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '100px'}}>
      
      {notificacion && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: MONO_VERDE, color: 'white', padding: '15px 30px', borderRadius: '50px', zIndex: 2000 }}>{notificacion}</div>
      )}

      <header style={{textAlign: 'center', background: 'white', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Banner" style={{width: '100%', height: '220px', objectFit: 'cover'}} />
        <h1 onDoubleClick={accesoSecreto} style={{color: MONO_NARANJA, margin: '10px 0'}}>Fritos El Mono 🐒</h1>
        <p>Hoy Arroz de <strong>{tipoArrozHoy}</strong></p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', overflowX: 'auto', padding: '10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : 'black', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
        {productosMostrar
          .filter(p => (p.categoria || (p.esArroz ? "Arroces" : p.esDesayuno ? "Desayunos" : "Fritos")) === categoriaActiva)
          .map(p => (
            <div key={p.id} style={{background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'}}>
              <img src={p.imagen} style={{width: '100%', height: '180px', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none'}} alt={p.nombre} />
              <div style={{padding: '20px', flexGrow: 1}}>
                <h3 style={{margin: '0 0 10px 0'}}>{p.nombre}</h3>
                
                {/* 🛡️ ARREGLO PARA QUE NO SE PONGA EN BLANCO */}
                <p style={{color: MONO_NARANJA, fontWeight: 'bold', fontSize: '22px'}}>
                  {p.tamanos && p.tamanos.length > 0 
                    ? `$${p.tamanos[0].precio.toLocaleString()} - $${p.tamanos[p.tamanos.length - 1].precio.toLocaleString()}` 
                    : `$${(p.precio || 0).toLocaleString('es-CO')}`}
                </p>

                {p.esArroz && (
                  <div style={{background: MONO_AMARILLO, padding: '15px', borderRadius: '15px', marginTop: '10px'}}>
                    <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width:'100%', padding:'8px', borderRadius:'8px', marginBottom:'10px'}}>
                      <option value="">¿Acompañante?</option>
                      <option value="Tajadas" disabled={!tajadaObj.disponible}>Tajadas</option>
                      <option value="Yuca" disabled={!yucaObj.disponible}>Yuca</option>
                    </select>
                    <label style={{display:'block'}}><input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} /> + Huevo ($1.000)</label>
                    <label style={{display:'block'}}><input type="checkbox" checked={conQueso} onChange={(e) => setConQueso(e.target.checked)} /> + Queso ($1.000)</label>
                  </div>
                )}

                {p.opciones && (
                  <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} value={sabores[p.id] || ""} style={{width:'100%', padding:'10px', borderRadius:'10px', marginTop:'10px'}}>
                    <option value="">-- Elige Sabor --</option>
                    {p.opciones.map(opt => <option key={opt.nombre} value={opt.nombre}>{opt.nombre}</option>)}
                  </select>
                )}

                {p.tamanos && (
                  <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} value={tamanosJugo[p.id] || ""} style={{width:'100%', padding:'10px', borderRadius:'10px', marginTop:'10px', border:`2px solid ${MONO_NARANJA}`}}>
                    <option value="">-- Elige Tamaño --</option>
                    {p.tamanos.map(t => <option key={t.nombre} value={t.nombre}>{t.nombre} - ${t.precio.toLocaleString()}</option>)}
                  </select>
                )}

                <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible} style={{width:'100%', background: MONO_NARANJA, color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer'}}>
                  {p.disponible ? 'Añadir 🥟' : 'AGOTADO'}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* 🧂 LAS SALSAS QUE SE HABÍAN BORRADO */}
      {pedido.length > 0 && (
        <div style={{maxWidth: '800px', margin: '40px auto', background: 'white', padding: '25px', borderRadius: '25px', textAlign:'center'}}>
          <h3 style={{color: MONO_NARANJA}}>🧂 ¿Qué salsas quieres?</h3>
          <div style={{display:'flex', flexWrap:'wrap', gap:'10px', justifyContent:'center', marginTop:'10px'}}>
            {salsasMostrar.map(s => (
              <button 
                key={s.id} 
                onClick={() => setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])} 
                style={{padding:'10px 20px', borderRadius:'20px', border:'none', background: salsasElegidas.includes(s.nombre) ? MONO_NARANJA : MONO_AMARILLO, color: salsasElegidas.includes(s.nombre) ? 'white' : 'black', cursor:'pointer'}}
              >
                {s.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CARRITO FLOTANTE */}
      {pedido.length > 0 && (
        <a href="#carrito_seccion" style={{ position: 'fixed', bottom: '20px', right: '20px', background: MONO_TEXTO, color: 'white', padding: '15px 25px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 100 }}>
          🛒 Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}
        </a>
      )}

      {/* SECCIÓN DEL CARRITO */}
      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '30px', border: `4px solid ${MONO_NARANJA}` }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2>Tu Pedido</h2>
            <button onClick={vaciarCarrito} style={{background:'red', color:'white', border:'none', padding:'5px 10px', borderRadius:'8px'}}>Vaciar 🗑️</button>
          </div>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>{item.cantidad}x {item.nombre} <small>({item.saborElegido} {item.detallesArroz})</small></span>
              <div>
                <strong>${item.subtotal.toLocaleString()}</strong>
                <button onClick={() => setPedido(pedido.filter(i => i.idUnico !== item.idUnico))} style={{marginLeft:'10px', color:'red', border:'none', background:'none', cursor:'pointer'}}>✕</button>
              </div>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA }}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{padding:'12px', borderRadius:'10px', border:'1px solid #ddd'}} />
            <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{padding:'12px', borderRadius:'10px', border:'1px solid #ddd'}} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{padding:'12px', borderRadius:'10px', border:'1px solid #ddd'}}>
              <option value="">¿Cómo pagas?</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', border:'none', fontSize:'18px' }}>Pedir por WhatsApp 📲</button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '30px', color: '#888' }}>📍 Carepa, Antioquia - El Mono 🐒</footer>
    </div>
  );
}