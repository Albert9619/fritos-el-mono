import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS (Corregidos y Protegidos)
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
    if(!window.confirm("¿Restaurar todo el menú en Firebase?")) return;
    try {
      await setDoc(doc(db, "ajuste", "tienda"), { abierta: true });
      for (const p of productosBase) await setDoc(doc(db, "productos", p.id), p);
      for (const e of extrasArrozBase) await setDoc(doc(db, "extrasArroz", e.id), e);
      for (const s of salsasBase) await setDoc(doc(db, "salsas", s.id), s);
      alert("✅ ¡Menú Restaurado!");
    } catch (e) { alert("Error al subir datos"); }
  };

  const sumarCantidad = (id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1});
  const restarCantidad = (id) => {
    const actual = cantidades[id] || 1;
    if (actual > 1) setCantidades({...cantidades, [id]: actual - 1});
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return;
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    let sabor = "";
    let detallesExtra = "";

    try {
      if (p.esArroz) {
        if (!acompañanteArroz) return alert("Por favor elige Tajadas o Yuca");
        sabor = `Arroz de ${tipoArrozHoy}`;
        const h = extrasArrozMostrar.find(e => e.id === 'huevo') || {precio: 1000};
        const q = extrasArrozMostrar.find(e => e.id === 'queso') || {precio: 1000};
        if (conHuevo) precioBase += h.precio;
        if (conQueso) precioBase += q.precio;
        detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''}${conQueso ? ' + Queso' : ''})`;
      } else if (p.opciones) {
        sabor = sabores[p.id];
        if (!sabor) return alert("Por favor elige un sabor");
      }

      if (p.tamanos) {
        const tam = tamanosJugo[p.id];
        if (!tam) return alert("Por favor elige el tamaño/presentación");
        const tObj = p.tamanos.find(t => t.nombre === tam);
        if (tObj) precioBase = tObj.precio;
        detallesExtra = `(${tam})`;
      }

      setPedido([...pedido, { 
        idUnico: Date.now(), 
        nombre: p.nombre, 
        precioUnitario: precioBase, 
        saborElegido: sabor, 
        detallesArroz: detallesExtra, 
        cantidad: cant, 
        subtotal: precioBase * cant 
      }]);

      setNotificacion(`¡${p.nombre} añadido! 🥟`);
      setTimeout(() => setNotificacion(""), 2000);
      
      // Limpiar estados temporales
      setAcompañanteArroz(""); 
      setConHuevo(false); 
      setConQueso(false);
      setCantidades({...cantidades, [p.id]: 1});
    } catch (error) {
      console.error(error);
      alert("Hubo un error al añadir el producto. Intenta de nuevo.");
    }
  };

  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <button onClick={() => setIsAdmin(false)} style={{padding:'10px', borderRadius:'10px', cursor:'pointer'}}>← Volver</button>
        <button onClick={restaurarBaseDeDatos} style={{display:'block', marginTop:'20px', background:'red', color:'white', padding:'15px', borderRadius:'10px', fontWeight:'bold', border:'none', cursor:'pointer'}}>🔄 REPARAR TODO EL MENÚ</button>
        <h2 style={{marginTop:'30px'}}>Control de Disponibilidad</h2>
        {productosMostrar.map(p => (
          <div key={p.id} style={{background:'white', padding:'15px', marginBottom:'10px', borderRadius:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
            <strong>{p.nombre}</strong>
            <button 
              onClick={() => updateDoc(doc(db, "productos", p.id), { disponible: !p.disponible })}
              style={{padding:'10px', borderRadius:'10px', background: p.disponible ? MONO_VERDE : '#ccc', color:'white', border:'none', fontWeight:'bold', cursor:'pointer'}}
            >
              {p.disponible ? 'DISPONIBLE' : 'AGOTADO'}
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{fontFamily: 'system-ui, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '120px', color: MONO_TEXTO}}>
      
      {notificacion && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: MONO_VERDE, color: 'white', padding: '15px 30px', borderRadius: '50px', zIndex: 3000, fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          {notificacion}
        </div>
      )}

      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Banner" style={{width: '100%', height: '220px', objectFit: 'cover'}} />
        <h1 onDoubleClick={accesoSecreto} style={{color: MONO_NARANJA, margin: '15px 0', fontSize: '32px'}}>Fritos El Mono 🐒</h1>
        <p style={{paddingBottom: '20px'}}>Hoy Arroz de <strong style={{color: MONO_NARANJA}}>{tipoArrozHoy}</strong></p>
      </header>

      {/* CATEGORÍAS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategoriaActiva(cat)} 
            style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* LISTA DE PRODUCTOS */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
        {productosMostrar
          .filter(p => (p.categoria || (p.esArroz ? "Arroces" : p.esDesayuno ? "Desayunos" : "Fritos")) === categoriaActiva)
          .map(p => (
            <div key={p.id} style={{background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'}}>
              <img src={p.imagen} style={{width: '100%', height: '200px', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none'}} alt={p.nombre} />
              <div style={{padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                <h3 style={{margin: '0 0 10px 0', fontSize: '22px'}}>{p.nombre}</h3>
                
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '24px', marginBottom: '15px'}}>
                  {p.tamanos && p.tamanos.length > 0 
                    ? `$${p.tamanos[0].precio.toLocaleString()} - $${p.tamanos[p.tamanos.length-1].precio.toLocaleString()}` 
                    : `$${(p.precio || 0).toLocaleString('es-CO')}`}
                </p>

                {/* OPCIONES DE ARROZ */}
                {p.esArroz && (
                  <div style={{background: MONO_AMARILLO, padding: '15px', borderRadius: '20px', marginBottom: '15px'}}>
                    <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width:'100%', padding:'10px', borderRadius:'10px', border:'1px solid #ddd', marginBottom:'10px'}}>
                      <option value="">¿Tajada o Yuca?</option>
                      <option value="Tajadas">Tajadas</option>
                      <option value="Yuca">Yuca</option>
                    </select>
                    <label style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'5px'}}><input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} style={{width:'18px', height:'18px'}} /> + Huevo ($1.000)</label>
                    <label style={{display:'flex', alignItems:'center', gap:'10px'}}><input type="checkbox" checked={conQueso} onChange={(e) => setConQueso(e.target.checked)} style={{width:'18px', height:'18px'}} /> + Queso ($1.000)</label>
                  </div>
                )}

                {/* OPCIONES DE SABOR / TAMAÑO */}
                {p.opciones && (
                  <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} value={sabores[p.id] || ""} style={{width:'100%', padding:'12px', borderRadius:'15px', border:'1px solid #ddd', marginBottom:'15px', fontSize:'16px'}}>
                    <option value="">-- Elige Sabor --</option>
                    {p.opciones.map(opt => <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre}</option>)}
                  </select>
                )}

                {p.tamanos && (
                  <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} value={tamanosJugo[p.id] || ""} style={{width:'100%', padding:'12px', borderRadius:'15px', border:`2px solid ${MONO_NARANJA}`, marginBottom:'15px', fontWeight:'bold'}}>
                    <option value="">-- Elige Presentación --</option>
                    {p.tamanos.map(t => <option key={t.nombre} value={t.nombre} disabled={!t.disponible}>{t.nombre} - ${t.precio.toLocaleString()}</option>)}
                  </select>
                )}

                {/* ✅ CONTROLES DE CANTIDAD (VUELVEN A APARECER) */}
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'auto'}}>
                  <div style={{display:'flex', alignItems:'center', background:'#f0f2f5', borderRadius:'15px', padding:'5px'}}>
                    <button onClick={() => restarCantidad(p.id)} style={{width:'35px', height:'35px', border:'none', background:'white', borderRadius:'10px', fontWeight:'bold', cursor:'pointer'}}>-</button>
                    <span style={{padding:'0 15px', fontWeight:'bold', fontSize:'18px'}}>{cantidades[p.id] || 1}</span>
                    <button onClick={() => sumarCantidad(p.id)} style={{width:'35px', height:'35px', border:'none', background: MONO_NARANJA, color:'white', borderRadius:'10px', fontWeight:'bold', cursor:'pointer'}}>+</button>
                  </div>
                  
                  <button 
                    onClick={() => agregarAlCarrito(p)} 
                    disabled={!p.disponible || !tiendaAbierta} 
                    style={{flex:1, background: MONO_NARANJA, color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'}}
                  >
                    {p.disponible ? 'Añadir 🥟' : 'AGOTADO'}
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* SALSAS */}
      {pedido.length > 0 && (
        <div style={{maxWidth: '800px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '30px', textAlign:'center', boxShadow:'0 10px 20px rgba(0,0,0,0.05)'}}>
          <h3 style={{color: MONO_NARANJA, fontSize:'24px', margin:'0 0 15px 0'}}>🧂 ¿Deseas agregar salsas?</h3>
          <div style={{display:'flex', flexWrap:'wrap', gap:'12px', justifyContent:'center'}}>
            {salsasMostrar.map(s => (
              <button 
                key={s.id} 
                onClick={() => setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])} 
                style={{padding:'12px 22px', borderRadius:'25px', border:'none', background: salsasElegidas.includes(s.nombre) ? MONO_NARANJA : MONO_AMARILLO, color: salsasElegidas.includes(s.nombre) ? 'white' : MONO_TEXTO, fontWeight:'bold', cursor:'pointer', transition:'0.3s'}}
              >
                {salsasElegidas.includes(s.nombre) ? `✓ ${s.nombre}` : s.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CARRITO FLOTANTE */}
      {pedido.length > 0 && tiendaAbierta && (
        <a href="#carrito_seccion" style={{ position: 'fixed', bottom: '25px', right: '25px', background: MONO_TEXTO, color: 'white', padding: '15px 25px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 8px 25px rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{fontSize: '12px', opacity: 0.8}}>🛒 Carrito ({pedido.length})</span>
          <span style={{fontSize: '18px', color: MONO_NARANJA}}>${total.toLocaleString('es-CO')}</span>
        </a>
      )}

      {/* RESUMEN DEL PEDIDO */}
      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '40px auto', background: 'white', padding: '35px', borderRadius: '35px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{margin:0, fontSize:'28px'}}>🥟 Tu Pedido</h2>
            <button onClick={vaciarCarrito} style={{background:'#fee2e2', color:'#b91c1c', border:'none', padding:'10px 15px', borderRadius:'12px', fontWeight:'bold', cursor:'pointer'}}>Vaciar 🗑️</button>
          </div>
          
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
              <div style={{flex:1}}>
                <span style={{fontSize:'18px'}}><strong>{item.cantidad}x </strong>{item.nombre}</span><br/>
                <small style={{color: '#666'}}>{item.saborElegido} {item.detallesArroz}</small>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <strong style={{fontSize:'18px'}}>${item.subtotal.toLocaleString()}</strong>
                <button onClick={() => setPedido(pedido.filter(i => i.idUnico !== item.idUnico))} style={{color:'red', border:'none', background:'#fff5f5', width:'35px', height:'35px', borderRadius:'50%', cursor:'pointer', fontWeight:'bold'}}>✕</button>
              </div>
            </div>
          ))}

          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '36px', marginTop: '30px', borderTop:`3px dashed ${MONO_AMARILLO}`, paddingTop:'20px' }}>
            Total: ${total.toLocaleString('es-CO')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '25px' }}>
            <input type="text" placeholder="Tu Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{padding:'18px', borderRadius:'15px', border:'1px solid #ddd', fontSize:'16px', background: MONO_CREMA}} />
            <input type="text" placeholder="Dirección Exacta / Barrio" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{padding:'18px', borderRadius:'15px', border:'1px solid #ddd', fontSize:'16px', background: MONO_CREMA}} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{padding:'18px', borderRadius:'15px', border:'1px solid #ddd', fontSize:'16px'}}>
              <option value="">¿Cómo deseas pagar?</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi">Nequi</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', padding: '22px', borderRadius: '20px', fontWeight: 'bold', fontSize: '20px', border:'none', cursor:'pointer', marginTop:'10px', boxShadow:'0 5px 15px rgba(22, 163, 74, 0.3)' }}>
              Confirmar Pedido por WhatsApp 📲
            </button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        <p>📍 Carepa, Antioquia - Fritos El Mono 🐒</p>
      </footer>
    </div>
  );
}