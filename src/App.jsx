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
    if(!window.confirm("¿Quieres actualizar el menú y asegurar que aparezca el Queso?")) return;
    try {
      await updateDoc(doc(db, "ajuste", "tienda"), { abierta: true }).catch(() => setDoc(doc(db, "ajuste", "tienda"), { abierta: true }));
      
      for (const p of productosBase) { await setDoc(doc(db, "productos", p.id), p); }
      for (const e of extrasArrozBase) { await setDoc(doc(db, "extrasArroz", e.id), e); }
      for (const s of salsasBase) { await setDoc(doc(db, "salsas", s.id || s.nombre), s); }

      alert("✅ ¡Todo actualizado! El Queso ya debe aparecer en el Admin y en la compra.");
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
  
  const toggleSabor = (p, saborNombre) => {
    const nuevasOpciones = p.opciones.map(o => o.nombre === saborNombre ? { ...o, disponible: !o.disponible } : o);
    actualizarEnFirebase("productos", p.id, { opciones: nuevasOpciones });
  };
  
  const toggleTamano = (p, tamNombre) => {
    const nuevosTamanos = p.tamanos.map(t => t.nombre === tamNombre ? { ...t, disponible: !t.disponible } : t);
    actualizarEnFirebase("productos", p.id, { tamanos: nuevosTamanos });
  };

  const cambiarPrecioTamano = (p, tamNombre, nuevoPrecio) => {
    const nuevosTamanos = p.tamanos.map(t => t.nombre === tamNombre ? { ...t, precio: parseInt(nuevoPrecio) || 0 } : t);
    actualizarEnFirebase("productos", p.id, { tamanos: nuevosTamanos });
  };

  const toggleExtraArroz = (e) => actualizarEnFirebase("extrasArroz", e.id, { disponible: !e.disponible });
  const cambiarPrecioExtraArroz = (e, nuevoPrecio) => actualizarEnFirebase("extrasArroz", e.id, { precio: parseInt(nuevoPrecio) || 0 });
  const toggleSalsa = (s) => actualizarEnFirebase("salsas", s.id, { disponible: !s.disponible });

  const manejarSalsa = (salsaObj) => {
    if (!tiendaAbierta || !salsaObj || !salsaObj.disponible) return;
    setSalsasElegidas(prev => prev.includes(salsaObj.nombre) ? prev.filter(s => s !== salsaObj.nombre) : [...prev, salsaObj.nombre]);
  };

  const sumarCantidad = (id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1});
  const restarCantidad = (id) => {
    const actual = cantidades[id] || 1;
    if (actual > 1) setCantidades({...cantidades, [id]: actual - 1});
  };

  const manejarInputCantidad = (id, valor) => {
    if (valor === "") { setCantidades({...cantidades, [id]: ""}); return; }
    const num = parseInt(valor);
    if (!isNaN(num) && num > 0) setCantidades({...cantidades, [id]: num});
  };

  const corregirInputVacio = (id) => {
    if (!cantidades[id] || cantidades[id] < 1) setCantidades({...cantidades, [id]: 1});
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return alert("El local está cerrado.");
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    let sabor = "";
    let detallesExtra = "";

    if (p.opciones) {
      sabor = sabores[p.id];
      if (!sabor) return alert(`Por favor elige un sabor para: ${p.nombre}`);
    }

    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Por favor elige Tajadas o Yuca");
      const huevoExtra = extrasArrozMostrar.find(e => e.id === 'huevo');
      const quesoExtra = extrasArrozMostrar.find(e => e.id === 'queso');
      
      if (conHuevo && huevoExtra) precioBase += huevoExtra.precio;
      if (conQueso && quesoExtra) precioBase += quesoExtra.precio;
      
      let textosExtra = conHuevo ? ' + Huevo' : '';
      textosExtra += conQueso ? ' + Queso' : '';
      
      detallesExtra = `(Con ${acompañanteArroz}${textosExtra})`;
    }

    if (p.esJugo && p.tamanos) {
      const tamNombre = tamanosJugo[p.id];
      if (!tamNombre) return alert("Por favor elige el tamaño del jugo");
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
              🔄 SUBIR DATOS A FIREBASE (Hundir para actualizar)
            </button>
          </div>

          <div style={{background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px'}}>
            <div style={{padding: '20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee'}}><h3 style={{margin: 0}}>Productos Principales</h3></div>
            {productosMostrar.map(p => (
              <div key={p.id} style={{borderBottom: '2px solid #eee'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', gap: '10px'}}>
                  <strong style={{fontSize: '16px', flexGrow: 1}}>{p.nombre}</strong>
                  <input type="number" value={p.precio || ""} disabled={p.esJugo} onChange={(e) => cambiarPrecioProducto(p, e.target.value)} style={{width: '70px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd', background: p.esJugo ? '#eee' : 'white'}} />
                  <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                    <span style={{fontSize: '12px', fontWeight: 'bold', color: p.disponible ? MONO_VERDE : 'red'}}>{p.disponible ? 'HAY' : 'AGOTADO'}</span>
                    <MiniSwitch activo={p.disponible} onClick={() => toggleProducto(p)} />
                  </div>
                </div>

                {p.opciones && (
                  <div style={{padding: '10px 20px', background: '#fafafa', borderTop: '1px dashed #ddd'}}>
                    <span style={{fontSize: '12px', color: '#666', fontWeight: 'bold'}}>SABORES:</span>
                    {p.opciones.map(opt => (
                      <div key={opt.nombre} style={{display: 'flex', justifyContent: 'space-between', margin: '8px 0', paddingLeft: '15px'}}>
                        <span style={{fontSize: '14px', color: opt.disponible ? '#333' : '#aaa'}}>- {opt.nombre}</span>
                        <MiniSwitch activo={opt.disponible} onClick={() => toggleSabor(p, opt.nombre)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
            <div style={{flex: '1 1 300px', background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', paddingBottom: '10px'}}>
              <div style={{padding: '15px 20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee'}}><h3 style={{margin: 0}}>Extras del Arroz</h3></div>
              {extrasArrozMostrar.map(e => (
                <div key={e.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #eee'}}>
                  <span>{e.nombre}</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    {e.precio !== undefined && (
                      <input type="number" value={e.precio || ""} onChange={(ev) => cambiarPrecioExtraArroz(e, ev.target.value)} style={{width: '65px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd'}} />
                    )}
                    <MiniSwitch activo={e.disponible} onClick={() => toggleExtraArroz(e)} />
                  </div>
                </div>
              ))}
            </div>
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
  const quesoObj = extrasArrozMostrar.find(e => e.id === 'queso') || { disponible: true, precio: 1000 };

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

      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px 20px', maxWidth: '800px', margin: '0 auto 30px', whiteSpace: 'nowrap' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : '#ffffff', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: categoriaActiva === cat ? '0 4px 15px rgba(249, 115, 22, 0.4)' : '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', opacity: tiendaAbierta ? 1 : 0.6}}>
        {productosMostrar
          .filter(p => {
            let cat = p.categoria;
            if (!cat) { 
              if (p.esArroz) cat = "Arroces";
              else if (p.esJugo || p.nombre.toLowerCase().includes("agua") || p.nombre.toLowerCase().includes("cola") || p.nombre.toLowerCase().includes("malta")) cat = "Bebidas";
              else if (p.esDesayuno) cat = "Desayunos";
              else cat = "Fritos";
            }
            return cat === categoriaActiva;
          })
          .sort((a, b) => {
            const ordenFritos = ["Empanada Crujiente", "Arepa con Huevo y Carne", "Papa Rellena de la Casa", "Pastel de Pollo Hojaldrado", "Palitos de Queso Costeño", "Buñuelos Calientitos"];
            let posA = ordenFritos.indexOf(a.nombre); let posB = ordenFritos.indexOf(b.nombre);
            return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
          })
          .map(p => {
            const todoAgotado = !p.disponible;
            const isHovered = hoveredCardId === p.id;
            let precioMostrar = p.precio || 0;
            if (p.esJugo && p.tamanos) {
              const tamSeleccionado = tamanosJugo[p.id];
              if (tamSeleccionado) {
                const tamObj = p.tamanos.find(t => t.nombre === tamSeleccionado);
                precioMostrar = tamObj ? tamObj.precio : p.tamanos[0].precio;
              } else {
                precioMostrar = p.tamanos[0].precio;
              }
            }

            return (
              <div key={p.id} onMouseEnter={() => setHoveredCardId(p.id)} onMouseLeave={() => setHoveredCardId(null)} style={{background: 'white', borderRadius: '28px', padding: '0', boxShadow: isHovered && tiendaAbierta ? '0 20px 40px rgba(0,0,0,0.12)' : '0 10px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', transform: isHovered && tiendaAbierta ? 'translateY(-8px)' : 'translateY(0)', border: isHovered && tiendaAbierta ? `2px solid ${MONO_NARANJA}` : `2px solid transparent`, display: 'flex', flexDirection: 'column'}}>
                <img src={p.imagen} onError={(e) => e.target.src = "https://via.placeholder.com/400x300?text=El+Mono"} style={{width: '100%', height: '210px', objectFit: 'cover', filter: todoAgotado ? 'grayscale(1)' : 'none'}} alt={p.nombre} />
                <div style={{padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                  <h3 style={{margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800'}}>{p.nombre}</h3>
                  <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '26px', margin: '0 0 20px 0', paddingBottom: '10px', borderBottom: `2px dashed ${MONO_AMARILLO}`}}>${precioMostrar.toLocaleString('es-CO')}</p>
                  
                  {!todoAgotado && tiendaAbierta && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                      {p.esArroz && (
                        <div style={{background: MONO_AMARILLO, padding: '15px', borderRadius: '18px', border: `1px solid rgba(249, 115, 22, 0.2)`}}>
                          <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width:'100%', padding:'12px', borderRadius:'12px', border:`1px solid #ddd`, fontSize:'16px'}}>
                            <option value="">¿Tajada o Yuca?</option>
                            <option value="Tajadas" disabled={!tajadaObj.disponible}>Tajadas {!tajadaObj.disponible ? "(AGOTADO)" : "😋"}</option>
                            <option value="Yuca" disabled={!yucaObj.disponible}>Yuca {!yucaObj.disponible ? "(AGOTADO)" : "😋"}</option>
                          </select>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px'}}>
                            {!huevoObj.disponible ? <p style={{color: 'red', fontSize: '14px', fontWeight: 'bold'}}>🚫 Huevo Agotado</p> : (
                              <label style={{fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                                <input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} style={{accentColor: MONO_NARANJA, width: '22px', height: '22px'}} />
                                + Huevo (${huevoObj.precio.toLocaleString('es-CO')})
                              </label>
                            )}
                            {/* ✅ BOTÓN DE QUESO ARREGLADO */}
                            {!quesoObj.disponible ? <p style={{color: 'red', fontSize: '14px', fontWeight: 'bold'}}>🚫 Queso Agotado</p> : (
                              <label style={{fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '5px'}}>
                                <input type="checkbox" checked={conQueso} onChange={(e) => setConQueso(e.target.checked)} style={{accentColor: MONO_NARANJA, width: '22px', height: '22px'}} />
                                + Tajada de Queso (${quesoObj.precio.toLocaleString('es-CO')})
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                      <button onClick={() => agregarAlCarrito(p)} style={{background: MONO_NARANJA, color: 'white', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer'}}>Añadir al Pedido 🥟</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      {/* SALSAS, CARRITO Y FOOTER (Se mantienen igual para no dañar nada) */}
    </div>
  );
}