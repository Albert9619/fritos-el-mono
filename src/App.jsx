import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS
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
  { id: "6", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", esJugo: true, imagen: "/jugo-natural.jpg", disponible: true, opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
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

  const [pedido, setPedido] = useState([]);
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

  // 🛡️ SEGURO ANTI-FALLOS: Si Firebase está vacío, usa los datos base
  const productosMostrar = productos.length > 0 ? productos : productosBase;
  const extrasArrozMostrar = extrasArroz.length > 0 ? extrasArroz : extrasArrozBase;
  const salsasMostrar = salsas.length > 0 ? salsas : salsasBase;

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
    if(!window.confirm("¿Quieres actualizar todo el menú y forzar la aparición del QUESO?")) return;
    try {
      await updateDoc(doc(db, "ajuste", "tienda"), { abierta: true }).catch(() => setDoc(doc(db, "ajuste", "tienda"), { abierta: true }));
      
      // Subir productos uno por uno
      for (const p of productosBase) { await setDoc(doc(db, "productos", p.id), p); }
      // Subir extras (Queso, Huevo, etc.)
      for (const e of extrasArrozBase) { await setDoc(doc(db, "extrasArroz", e.id), e); }
      // Subir salsas
      for (const s of salsasBase) { await setDoc(doc(db, "salsas", s.id || s.nombre), s); }

      alert("✅ ¡Todo actualizado en Firebase! Refresca la página.");
    } catch (e) {
      console.error(e);
      alert("Error al restaurar.");
    }
  };

  const toggleTiendaGlobal = async () => { await updateDoc(doc(db, "ajuste", "tienda"), { abierta: !tiendaAbierta }); };

  const actualizarEnFirebase = async (coleccion, id, nuevosDatos) => {
    try { await updateDoc(doc(db, coleccion, id), nuevosDatos); } 
    catch (e) { console.error("Error actualizando", e); }
  };

  const toggleProducto = (p) => actualizarEnFirebase("productos", p.id, { disponible: !p.disponible });
  const cambiarPrecioProducto = (p, nuevoPrecio) => actualizarEnFirebase("productos", p.id, { precio: parseInt(nuevoPrecio) || 0 });
  
  const toggleExtraArroz = (e) => actualizarEnFirebase("extrasArroz", e.id, { disponible: !e.disponible });
  const cambiarPrecioExtraArroz = (e, nuevoPrecio) => actualizarEnFirebase("extrasArroz", e.id, { precio: parseInt(nuevoPrecio) || 0 });
  const toggleSalsa = (s) => actualizarEnFirebase("salsas", s.id || s.nombre, { disponible: !s.disponible });

  const manejarSalsa = (salsaObj) => {
    if (!tiendaAbierta || !salsaObj || !salsaObj.disponible) return;
    setSalsasElegidas(prev => prev.includes(salsaObj.nombre) ? prev.filter(s => s !== salsaObj.nombre) : [...prev, salsaObj.nombre]);
  };

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

    // 🍚 LÓGICA ESPECIAL PARA EL ARROZ
    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Por favor elige Tajadas o Yuca");
      
      // Asigna el sabor automáticamente según el día
      sabor = `Arroz de ${tipoArrozHoy}`; 

      const huevoExtra = extrasArrozMostrar.find(e => e.id === 'huevo');
      const quesoExtra = extrasArrozMostrar.find(e => e.id === 'queso');
      
      if (conHuevo && huevoExtra) precioBase += huevoExtra.precio;
      if (conQueso && quesoExtra) precioBase += quesoExtra.precio;
      
      let textosExtra = conHuevo ? ' + Huevo' : '';
      textosExtra += conQueso ? ' + Queso' : '';
      detallesExtra = `(Con ${acompañanteArroz}${textosExtra})`;
    } 
    // 🥟 LÓGICA PARA OTROS PRODUCTOS CON SABOR (Empanadas, Papas, etc.)
    else if (p.opciones) {
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
    
    // Limpiar selecciones
    setSabores({...sabores, [p.id]: ""});
    setTamanosJugo({...tamanosJugo, [p.id]: ""});
    setAcompañanteArroz("");
    setConHuevo(false);
    setConQueso(false);
    setCantidades({...cantidades, [p.id]: 1});
  };
  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("El carrito está vacío");
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos de envío");
    const listaFritos = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}`).join('\n');
    const mensaje = `¡Hola! Pedido Fritos El Mono:\n\n${listaFritos}\n\n🧂 Salsas: ${salsasElegidas.join(', ') || 'Ninguna'}\n\n*Total: $${total.toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  // ==========================================
  // 🟢 VISTA ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    const MiniSwitch = ({ activo, onClick }) => (
      <div onClick={onClick} style={{width: '40px', height: '22px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'}}>
        <div style={{width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '21px' : '3px', transition: '0.3s'}}/>
      </div>
    );

    return (
      <div style={{backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth: '700px', margin: '0 auto'}}>
          <button onClick={() => setIsAdmin(false)} style={{marginBottom: '20px', padding: '10px 15px', borderRadius: '10px', border: 'none', background: MONO_TEXTO, color: 'white', fontWeight: 'bold', cursor: 'pointer'}}>
            ← Volver a la Tienda
          </button>
          
          <div style={{background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px'}}>
            <h1 style={{color: MONO_NARANJA, margin: '0 0 10px 0'}}>Panel de Control ⚙️</h1>
            <div style={{padding: '20px', borderRadius: '15px', background: tiendaAbierta ? '#dcfce7' : '#fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <strong style={{fontSize: '18px'}}>ESTADO: {tiendaAbierta ? '🟢 ABIERTO' : '🔴 CERRADO'}</strong>
              <button onClick={toggleTiendaGlobal} style={{background: MONO_TEXTO, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'}}>
                {tiendaAbierta ? 'Cerrar Negocio' : 'Abrir Negocio'}
              </button>
            </div>
            <button onClick={restaurarBaseDeDatos} style={{width: '100%', marginTop: '15px', background: '#b91c1c', color: 'white', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'}}>
              🔄 SUBIR / REPARAR DATOS EN FIREBASE
            </button>
          </div>

          {/* LISTA DE EXTRAS (QUESO, HUEVO, etc.) */}
          <div style={{background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px'}}>
             <div style={{padding: '15px 20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee'}}><h3 style={{margin: 0}}>Extras del Arroz (Queso, Huevo, etc.)</h3></div>
             {extrasArrozMostrar.map(e => (
               <div key={e.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #eee'}}>
                 <span>{e.nombre}</span>
                 <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                   <input type="number" value={e.precio || 0} onChange={(ev) => cambiarPrecioExtraArroz(e, ev.target.value)} style={{width: '65px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd'}} />
                   <MiniSwitch activo={e.disponible} onClick={() => toggleExtraArroz(e)} />
                 </div>
               </div>
             ))}
          </div>

          <div style={{background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px'}}>
            <div style={{padding: '20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee'}}><h3 style={{margin: 0}}>Productos Principales</h3></div>
            {productosMostrar.map(p => (
              <div key={p.id} style={{borderBottom: '2px solid #eee', padding: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <strong style={{fontSize: '16px'}}>{p.nombre}</strong>
                  <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    <input type="number" value={p.precio || 0} onChange={(e) => cambiarPrecioProducto(p, e.target.value)} style={{width: '70px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd'}} />
                    <MiniSwitch activo={p.disponible} onClick={() => toggleProducto(p)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🔵 VISTA CLIENTE
  // ==========================================
  const tajadaObj = extrasArrozMostrar.find(e => e.id === 'tajada') || { disponible: false, precio: 0 };
  const yucaObj = extrasArrozMostrar.find(e => e.id === 'yuca') || { disponible: false, precio: 0 };
  const huevoObj = extrasArrozMostrar.find(e => e.id === 'huevo') || { disponible: false, precio: 1000 };
  const quesoObj = extrasArrozMostrar.find(e => e.id === 'queso') || { disponible: false, precio: 1000 };

  return (
    <div style={{fontFamily: 'system-ui, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', color: MONO_TEXTO, paddingBottom: '60px'}}>
      
      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Banner Fritos El Mono" style={{width: '100%', height: '280px', objectFit: 'cover', display: 'block'}} />
        <div style={{padding: '25px', background: 'rgba(255, 255, 255, 0.95)', borderTop: `5px solid ${MONO_NARANJA}`}}>
          <h1 onDoubleClick={accesoSecreto} style={{color: MONO_NARANJA, margin: 0, fontSize: '36px', fontWeight: '900', userSelect: 'none', cursor: 'pointer'}}>
            Fritos El Mono 🐒
          </h1>
          <p style={{marginTop: '5px', fontSize: '18px', fontWeight: '600'}}>Hoy Arroz de <span style={{color:MONO_NARANJA}}>{tipoArrozHoy}</span></p>
        </div>
      </header>

      {/* TABS DE CATEGORÍAS */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px 20px', maxWidth: '800px', margin: '0 auto 30px', whiteSpace: 'nowrap' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : '#ffffff', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: categoriaActiva === cat ? '0 4px 15px rgba(249, 115, 22, 0.4)' : '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}>{cat}</button>
        ))}
      </div>

      {/* PRODUCTOS */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', opacity: tiendaAbierta ? 1 : 0.6}}>
        {productosMostrar
          .filter(p => {
             let cat = p.categoria || (p.esArroz ? "Arroces" : p.esDesayuno ? "Desayunos" : "Fritos");
             return cat === categoriaActiva;
          })
          .map(p => (
            <div key={p.id} style={{background: 'white', borderRadius: '28px', padding: '0', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
              <img src={p.imagen} onError={(e) => e.target.src = "https://via.placeholder.com/400x300?text=Fritos+El+Mono"} style={{width: '100%', height: '210px', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none'}} alt={p.nombre} />
              <div style={{padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                <h3 style={{margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800'}}>{p.nombre}</h3>
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '26px'}}>${p.precio.toLocaleString('es-CO')}</p>
                
                {p.esArroz && (
                  <div style={{background: MONO_AMARILLO, padding: '15px', borderRadius: '18px', marginTop: '10px'}}>
                    <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width:'100%', padding:'12px', borderRadius:'12px', border:`1px solid #ddd`}}>
                      <option value="">¿Tajada o Yuca?</option>
                      <option value="Tajadas" disabled={!tajadaObj.disponible}>Tajadas</option>
                      <option value="Yuca" disabled={!yucaObj.disponible}>Yuca</option>
                    </select>
                    <div style={{marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                        <input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} disabled={!huevoObj.disponible} />
                        + Huevo Extra (${huevoObj.precio.toLocaleString('es-CO')})
                      </label>
                      {/* ✅ ESTE ES EL BOTÓN QUE BUSCÁBAMOS */}
                      <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                        <input type="checkbox" checked={conQueso} onChange={(e) => setConQueso(e.target.checked)} disabled={!quesoObj.disponible} />
                        + Tajada de Queso (${quesoObj.precio.toLocaleString('es-CO')})
                      </label>
                    </div>
                  </div>
                )}

                <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible} style={{background: MONO_NARANJA, color: 'white', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer'}}>{p.disponible ? 'Añadir al Pedido 🥟' : 'AGOTADO'}</button>
              </div>
            </div>
          ))}
      </div>

      {/* SALSAS */}
      {tiendaAbierta && (
        <div style={{maxWidth: '850px', margin: '40px auto', background: 'white', padding: '35px', borderRadius: '35px'}}>
          <h3 style={{color: MONO_NARANJA, margin: '0 0 25px 0'}}>🧂 ¿Qué salsas deseas?</h3>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px'}}>
            {salsasMostrar.map(s => (
              <button key={s.id || s.nombre} onClick={() => manejarSalsa(s)} disabled={!s.disponible} style={{ padding: '14px 28px', borderRadius: '40px', border: 'none', background: salsasElegidas.includes(s.nombre) ? MONO_NARANJA : MONO_AMARILLO, color: salsasElegidas.includes(s.nombre) ? 'white' : MONO_TEXTO, cursor: 'pointer' }}>{s.nombre}</button>
            ))}
          </div>
        </div>
      )}

      {/* CARRITO (RESUMEN) */}
      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '40px auto', background: 'white', padding: '40px', borderRadius: '35px', border: `5px solid ${MONO_NARANJA}` }}>
          <h2>Confirmar Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <span>{item.cantidad}x {item.nombre} {item.detallesArroz}</span>
              <strong>${item.subtotal.toLocaleString('es-CO')}</strong>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA }}>Total: ${total.toLocaleString('es-CO')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
             <input type="text" placeholder="Tu Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{padding: '15px', borderRadius: '10px', border: '1px solid #ddd'}} />
             <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{padding: '15px', borderRadius: '10px', border: '1px solid #ddd'}} />
             <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{padding: '15px', borderRadius: '10px', border: '1px solid #ddd'}}>
               <option value="">¿Cómo pagas?</option>
               <option value="Efectivo">Efectivo</option>
               <option value="Nequi">Nequi</option>
             </select>
             <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>Enviar por WhatsApp 📲</button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
        <p>📍 Carepa, Antioquia | Hecho con ❤️ para El Mono</p>
      </footer>
    </div>
  );
}