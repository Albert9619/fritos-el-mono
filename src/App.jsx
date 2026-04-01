import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS (Corregidos con Sabores y Tamaños)
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
  { id: "6", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", esJugo: true, imagen: "/jugo-natural.jpg", disponible: true, 
    opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], 
    tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] 
  },
  { id: "b1", nombre: "Coca-Cola", precio: 3500, categoria: "Bebidas", imagen: "/coca-cola.jpg", disponible: true },
  { id: "b2", nombre: "Pony Malta", precio: 2500, categoria: "Bebidas", imagen: "/pony.jpg", disponible: true },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", imagen: "/agua.jpg", disponible: true }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Tajada de Queso", disponible: true, precio: 1000 }
];

const salsasBase = [
  { id: "Pique", nombre: "Pique", disponible: true },
  { id: "Salsa Roja", nombre: "Salsa Roja", disponible: true },
  { id: "Salsa Rosada", nombre: "Salsa Rosada", disponible: true },
  { id: "Suero", nombre: "Suero", disponible: true },
  { id: "Suero Picante", nombre: "Suero Picante", disponible: true }
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

  // Notificación de producto añadido
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
  const [hoveredCardId, setHoveredCardId] = useState(null);

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
    const clave = window.prompt("🔐 Ingresa el PIN:");
    if (clave === "mono2026") { setIsAdmin(true); } 
    else if (clave !== null) { alert("❌ PIN incorrecto."); }
  };

  const restaurarBaseDeDatos = async () => {
    if(!window.confirm("¿Quieres actualizar todo el menú en Firebase?")) return;
    try {
      await updateDoc(doc(db, "ajuste", "tienda"), { abierta: true }).catch(() => setDoc(doc(db, "ajuste", "tienda"), { abierta: true }));
      for (const p of productosBase) { await setDoc(doc(db, "productos", p.id), p); }
      for (const e of extrasArrozBase) { await setDoc(doc(db, "extrasArroz", e.id), e); }
      for (const s of salsasBase) { await setDoc(doc(db, "salsas", s.id || s.nombre), s); }
      alert("✅ ¡Todo actualizado en Firebase!");
    } catch (e) {
      console.error(e);
      alert("Error al restaurar.");
    }
  };

  const actualizarEnFirebase = (coleccion, id, nuevosDatos) => {
    updateDoc(doc(db, coleccion, id), nuevosDatos).catch(e => console.error(e));
  };

  const toggleProducto = (p) => actualizarEnFirebase("productos", p.id, { disponible: !p.disponible });
  const cambiarPrecioProducto = (p, nuevoPrecio) => actualizarEnFirebase("productos", p.id, { precio: parseInt(nuevoPrecio) || 0 });
  const toggleExtraArroz = (e) => actualizarEnFirebase("extrasArroz", e.id, { disponible: !e.disponible });
  const cambiarPrecioExtraArroz = (e, nuevoPrecio) => actualizarEnFirebase("extrasArroz", e.id, { precio: parseInt(nuevoPrecio) || 0 });
  const toggleSalsa = (s) => actualizarEnFirebase("salsas", s.id || s.nombre, { disponible: !s.disponible });

  const sumarCantidad = (id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1});
  const restarCantidad = (id) => {
    const actual = cantidades[id] || 1;
    if (actual > 1) setCantidades({...cantidades, [id]: actual - 1});
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return alert("El local está cerrado.");
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    let sabor = "";
    let detallesExtra = "";

    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Por favor elige Tajadas o Yuca");
      sabor = `Arroz de ${tipoArrozHoy}`; 
      const huevoExtra = extrasArrozMostrar.find(e => e.id === 'huevo');
      const quesoExtra = extrasArrozMostrar.find(e => e.id === 'queso');
      if (conHuevo && huevoExtra) precioBase += huevoExtra.precio;
      if (conQueso && quesoExtra) precioBase += quesoExtra.precio;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''}${conQueso ? ' + Queso' : ''})`;
    } else if (p.opciones) {
      sabor = sabores[p.id];
      if (!sabor) return alert(`Por favor elige un sabor para: ${p.nombre}`);
    }

    if (p.esJugo && p.tamanos) {
      const tamNombre = tamanosJugo[p.id];
      if (!tamNombre) return alert("Por favor elige el tamaño");
      const tamObj = p.tamanos.find(t => t.nombre === tamNombre);
      if (tamObj) precioBase = tamObj.precio;
      detallesExtra = `(${tamNombre})`;
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

    // Mostrar mensaje verde
    setNotificacion(`¡${p.nombre} añadido! 🥟`);
    setTimeout(() => setNotificacion(""), 3000);
    
    setSabores({...sabores, [p.id]: ""});
    setTamanosJugo({...tamanosJugo, [p.id]: ""});
    setAcompañanteArroz("");
    setConHuevo(false);
    setConQueso(false);
    setCantidades({...cantidades, [p.id]: 1});
  };

  const vaciarCarrito = () => {
    if (window.confirm("¿Seguro que quieres borrar todo el pedido? 🗑️")) {
      setPedido([]);
      localStorage.removeItem("carrito_mono");
    }
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("El carrito está vacío");
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos de envío");
    const listaFritos = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}`).join('\n');
    const mensaje = `¡Hola! Pedido Fritos El Mono:\n\n${listaFritos}\n\n🧂 Salsas: ${salsasElegidas.join(', ') || 'Ninguna'}\n\n*Total: $${total.toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  if (isAdmin) {
    const MiniSwitch = ({ activo, onClick }) => (
      <div onClick={onClick} style={{width: '40px', height: '22px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'}}>
        <div style={{width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '21px' : '3px', transition: '0.3s'}}/>
      </div>
    );

    return (
      <div style={{backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth: '700px', margin: '0 auto'}}>
          <button onClick={() => setIsAdmin(false)} style={{marginBottom: '20px', padding: '10px 15px', borderRadius: '10px', border: 'none', background: MONO_TEXTO, color: 'white', fontWeight: 'bold', cursor: 'pointer'}}>← Volver</button>
          <div style={{background: 'white', padding: '25px', borderRadius: '25px', marginBottom: '20px'}}>
            <h1 style={{color: MONO_NARANJA}}>Panel de Control ⚙️</h1>
            <div style={{padding: '20px', borderRadius: '15px', background: tiendaAbierta ? '#dcfce7' : '#fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <strong>ESTADO: {tiendaAbierta ? '🟢 ABIERTO' : '🔴 CERRADO'}</strong>
              <button onClick={() => updateDoc(doc(db, "ajuste", "tienda"), { abierta: !tiendaAbierta })} style={{background: MONO_TEXTO, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px'}}>Cambiar Estado</button>
            </div>
            <button onClick={restaurarBaseDeDatos} style={{width: '100%', marginTop: '15px', background: '#b91c1c', color: 'white', padding: '15px', borderRadius: '10px', border: 'none'}}>🔄 REPARAR BASE DE DATOS</button>
          </div>
          {/* Admin Extras */}
          <div style={{background: 'white', borderRadius: '25px', padding: '20px', marginBottom: '20px'}}>
             <h3 style={{marginTop: 0}}>Extras y Salsas</h3>
             {extrasArrozMostrar.map(e => (
               <div key={e.id} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee'}}>
                 <span>{e.nombre}</span>
                 <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input type="number" value={e.precio || 0} onChange={(ev) => cambiarPrecioExtraArroz(e, ev.target.value)} style={{width: '60px'}} />
                    <MiniSwitch activo={e.disponible} onClick={() => toggleExtraArroz(e)} />
                 </div>
               </div>
             ))}
          </div>
          {/* Admin Productos */}
          <div style={{background: 'white', borderRadius: '25px', padding: '20px'}}>
            <h3>Productos Principales</h3>
            {productosMostrar.map(p => (
              <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee'}}>
                <span>{p.nombre}</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                   <input type="number" value={p.precio || 0} onChange={(ev) => cambiarPrecioProducto(p, ev.target.value)} style={{width: '70px'}} />
                   <MiniSwitch activo={p.disponible} onClick={() => toggleProducto(p)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{fontFamily: 'system-ui, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', color: MONO_TEXTO, paddingBottom: '100px'}}>
      
      {/* 🟢 MENSAJE DE NOTIFICACIÓN FLOTANTE */}
      {notificacion && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: MONO_VERDE, color: 'white', padding: '15px 30px', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', zIndex: 2000, transition: 'all 0.5s' }}>
          {notificacion}
        </div>
      )}

      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Banner" style={{width: '100%', height: '280px', objectFit: 'cover'}} />
        <div style={{padding: '25px', borderTop: `5px solid ${MONO_NARANJA}`}}>
          <h1 onDoubleClick={accesoSecreto} style={{color: MONO_NARANJA, margin: 0, fontSize: '36px', fontWeight: '900', cursor: 'pointer'}}>Fritos El Mono 🐒</h1>
          <p style={{marginTop: '5px', fontSize: '18px', fontWeight: '600'}}>Hoy Arroz de <span style={{color:MONO_NARANJA}}>{tipoArrozHoy}</span></p>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 20px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : '#ffffff', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>{cat}</button>
        ))}
      </div>

      {!tiendaAbierta && (
        <div style={{maxWidth: '800px', margin: '0 auto 30px', background: '#fee2e2', color: '#b91c1c', padding: '20px', borderRadius: '20px', textAlign: 'center', fontWeight: 'bold', border: '2px solid #ef4444'}}>🔴 Cerrado temporalmente</div>
      )}

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
        {productosMostrar
          .filter(p => (p.categoria || (p.esArroz ? "Arroces" : p.esDesayuno ? "Desayunos" : "Fritos")) === categoriaActiva)
          .map(p => (
            <div key={p.id} style={{background: 'white', borderRadius: '28px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}}>
              <img src={p.imagen} style={{width: '100%', height: '210px', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none'}} alt={p.nombre} />
              <div style={{padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                <h3 style={{margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800'}}>{p.nombre}</h3>
                
                {/* 🔵 MOSTRAR PRECIO BASE O RANGO SI ES JUGO */}
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '26px', marginBottom: '15px'}}>
                  {p.esJugo ? "$1.000 - $2.000" : `$${p.precio.toLocaleString('es-CO')}`}
                </p>

                {/* 🍚 OPCIONES DE ARROZ */}
                {p.esArroz && (
                  <div style={{background: MONO_AMARILLO, padding: '15px', borderRadius: '18px', marginBottom: '15px'}}>
                    <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width:'100%', padding:'10px', borderRadius:'10px', marginBottom: '10px'}}>
                      <option value="">¿Acompañante?</option>
                      <option value="Tajadas" disabled={!tajadaObj.disponible}>Tajadas</option>
                      <option value="Yuca" disabled={!yucaObj.disponible}>Yuca</option>
                    </select>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                      <label><input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} disabled={!huevoObj.disponible} /> + Huevo ($1.000)</label>
                      <label><input type="checkbox" checked={conQueso} onChange={(e) => setConQueso(e.target.checked)} disabled={!quesoObj.disponible} /> + Queso ($1.000)</label>
                    </div>
                  </div>
                )}

                {/* 🥟 OPCIONES DE SABOR (EMPANADAS, PAPAS, JUGOS) */}
                {p.opciones && (
                  <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} value={sabores[p.id] || ""} style={{width:'100%', padding:'12px', borderRadius:'12px', marginBottom: '15px'}}>
                    <option value="">-- Elige Sabor --</option>
                    {p.opciones.map(opt => <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre}</option>)}
                  </select>
                )}

                {/* 🥤 OPCIONES DE TAMAÑO (JUGOS) */}
                {p.esJugo && p.tamanos && (
                  <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} value={tamanosJugo[p.id] || ""} style={{width:'100%', padding:'12px', borderRadius:'12px', marginBottom: '15px', border: `2px solid ${MONO_NARANJA}`}}>
                    <option value="">-- Elige Tamaño --</option>
                    {p.tamanos.map(t => <option key={t.nombre} value={t.nombre} disabled={!t.disponible}>{t.nombre} - ${t.precio.toLocaleString()}</option>)}
                  </select>
                )}

                <div style={{display: 'flex', gap: '10px', marginTop: 'auto'}}>
                  <div style={{display: 'flex', alignItems: 'center', background: '#f0f0f0', borderRadius: '15px', padding: '5px'}}>
                    <button onClick={() => restarCantidad(p.id)} style={{border:'none', background:'none', padding:'5px 10px', fontWeight:'bold'}}>-</button>
                    <span style={{padding: '0 10px', fontWeight:'bold'}}>{cantidades[p.id] || 1}</span>
                    <button onClick={() => sumarCantidad(p.id)} style={{border:'none', background:'none', padding:'5px 10px', fontWeight:'bold'}}>+</button>
                  </div>
                  <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible || !tiendaAbierta} style={{flex: 1, background: MONO_NARANJA, color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer'}}>
                    {p.disponible ? 'Añadir 🥟' : 'AGOTADO'}
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* CARRITO FLOTANTE */}
      {pedido.length > 0 && tiendaAbierta && (
        <a href="#carrito_seccion" style={{ position: 'fixed', bottom: '25px', right: '25px', background: MONO_TEXTO, color: 'white', padding: '15px 25px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 8px 25px rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{fontSize: '12px', opacity: 0.8}}>🛒 Carrito ({pedido.length})</span>
          <span style={{fontSize: '18px', color: MONO_NARANJA}}>${total.toLocaleString('es-CO')}</span>
        </a>
      )}

      {/* SECCIÓN RESUMEN CARRITO */}
      {pedido.length > 0 && tiendaAbierta && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '40px auto 60px', background: 'white', padding: '40px', borderRadius: '35px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 45px rgba(0,0,0,0.15)' }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{margin: 0}}>🛒 Mi Pedido</h2>
            <button onClick={vaciarCarrito} style={{background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'}}>Vaciar 🗑️</button>
          </div>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '15px 0', alignItems: 'center' }}>
              <div style={{flex: 1}}>
                <span><strong>{item.cantidad}x </strong>{item.nombre}</span><br/>
                <small style={{color: '#666'}}>{item.saborElegido} {item.detallesArroz}</small>
              </div>
              <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                <span style={{fontWeight:'900'}}>${item.subtotal.toLocaleString('es-CO')}</span>
                <button onClick={() => setPedido(pedido.filter(i => i.idUnico !== item.idUnico))} style={{color:'red', border:'none', background: '#fff5f5', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', fontWeight: '900'}}>✕</button>
              </div>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '32px', borderTop: `3px dashed ${MONO_AMARILLO}`, paddingTop: '15px' }}>Total: ${total.toLocaleString('es-CO')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '25px' }}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '15px', borderRadius: '15px', border: `1px solid #ddd` }} />
            <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ padding: '15px', borderRadius: '15px', border: `1px solid #ddd` }} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '15px', borderRadius: '15px', border: `1px solid #ddd` }}>
              <option value="">¿Cómo pagas?</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', border: 'none', padding: '20px', borderRadius: '18px', fontWeight: '900', fontSize: '20px', cursor: 'pointer' }}>Enviar por WhatsApp 📲</button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}><p>📍 Carepa, Antioquia - Fritos El Mono 🐒</p></footer>
    </div>
  );
}