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
// 🔴 DATOS MAESTROS (Ajusta estos para tu nuevo negocio)
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
  { id: "b4", nombre: "Tinto Tradicional", precio: 1000, categoria: "Bebidas", disponible: true, imagen: "/tinto.jpg" },
  { id: "b5", nombre: "Café con Leche", precio: 1500, categoria: "Bebidas", disponible: true, imagen: "/cafe-leche.jpg" },
  { id: "b6", nombre: "Chocolate Caliente", precio: 1500, categoria: "Bebidas", disponible: true, imagen: "/chocolate.jpg", sabores: [{ nombre: "Con Leche", disponible: true }, { nombre: "Sin Leche", disponible: true }] },
  { id: "b7", nombre: "Aromáticas", precio: 1000, categoria: "Bebidas", disponible: true, imagen: "/aromática.jpg" , sabores: [{ nombre: "Manzanilla", disponible: true},{nombre: "Hierbabuena", disponible: true},{nombre: "Limoncillo", disponible: true},{nombre: "Frutos Rojos", disponible: true}]},
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
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [manualOverride, setManualOverride] = useState(null); 
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
  const [notas, setNotas] = useState("");
  const [agradecimiento, setAgradecimiento] = useState(false);

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // 🕒 LÓGICA DE CIERRE AUTOMÁTICO (PRUEBA 5:10 PM)
  useEffect(() => {
    const verificarEstado = () => {
      const ahora = new Date();
      const hora = ahora.getHours();
      const minutos = ahora.getMinutes();
      
      const tiempoActualEnMinutos = (hora * 60) + minutos;

      // 6:00 AM = 360 | 5:10 PM = 1030 (17*60 + 10)
      const estaEnHorario = tiempoActualEnMinutos >= 360 && tiempoActualEnMinutos < 1030;

      // Para la prueba, el reloj manda sobre el manualOverride
      setTiendaAbierta(estaEnHorario);
      
      console.log("Minutos actuales:", tiempoActualEnMinutos, "Limite:", 1030);
    };

    verificarEstado();
    const t = setInterval(verificarEstado, 30000); // Revisa cada 30 segundos
    
    return () => clearInterval(t);
  }, []); // Quitamos manualOverride de aquí para que el reloj sea el jefe en la prueba

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSalsas = onSnapshot(collection(db, "salsas"), (s) => setSalsasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { 
      if (s.exists()) setManualOverride(s.data().abierta); 
    });
    return () => { unsubProd(); unsubExtras(); unsubSalsas(); unsubTienda(); };
  }, []);

  // 📦 CAMBIO DE LOCALSTORAGE PARA EL NUEVO NEGOCIO
  useEffect(() => {
    const p = localStorage.getItem("pedido_gestion_digital"); 
    if (p) setPedido(JSON.parse(p));
  }, []);

  useEffect(() => {
    localStorage.setItem("pedido_gestion_digital", JSON.stringify(pedido));
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
    catch (e) { console.error(e); }
  };

  const agregarAlCarrito = (p) => {
    const sel = selecciones[p.id] || {};
    const cant = cantidades[p.id] || 1;
    if (p.disponible === false) return alert("Agotado");
    if (p.opciones && !sel.sabor && p.categoria === "Fritos") return alert("Elige un sabor antes de añadir");
    if (p.sabores && !sel.sabor) return alert("Elige una opción antes de añadir");
    if (p.tamanos && p.tamanos.length > 0 && !sel.tamano) return alert("Elige el tamaño antes de añadir");
    if (p.categoria === "Desayunos") {
      if (!sel.acompanamiento || !sel.jugo || (p.id === "d1" && !sel.huevos) || (p.id === "d2" && !sel.proteina)) return alert("Completa tu desayuno");
    }
    
    // 🧠 HISTORIAL ÚNICO PARA GESTIÓN DIGITAL
    const historial = JSON.parse(localStorage.getItem("gestion_favoritos") || "{}");
    if (!historial[p.id]) historial[p.id] = {};
    if (sel.sabor) historial[p.id][sel.sabor] = (historial[p.id][sel.sabor] || 0) + 1;
    localStorage.setItem("gestion_favoritos", JSON.stringify(historial));

    let precioB = p.precio || 0;
    if (sel.tamano) precioB = sel.tamano.precio || 0;
    const extrasP = (sel.extras || []).reduce((acc, n) => acc + (extrasMostrar.find(e => e.nombre === n)?.precio || 0), 0);
    const subtotal = (precioB + extrasP + (sel.agrandar ? 1000 : 0)) * cant;
    
    let det = `${sel.sabor || ''} ${sel.tamano?.nombre || ''} ${sel.extras?.length > 0 ? 'Ex: '+sel.extras.join(', ') : ''}`;
    if (p.categoria === "Desayunos") det += `(${sel.acompanamiento}, ${sel.huevos || sel.proteina}, ${sel.jugo}${sel.agrandar ? ' Gr' : ''})`;
    
    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, cantidad: cant, subtotal, detalle: det.trim() }]);
    setCantidades({ ...cantidades, [p.id]: 1 });
    setSelecciones({ ...selecciones, [p.id]: {} });
    setNotificacion("¡Añadido! 🥟");
    setTimeout(() => setNotificacion(""), 2000);
  };

  const predecirSeleccion = (p) => {
    let saborElegido = null;
    if (p.opciones || p.sabores) {
      const opciones = (p.opciones || p.sabores).filter(o => o.disponible);
      const historial = JSON.parse(localStorage.getItem("gestion_favoritos") || "{}");
      const stats = historial[p.id] || {};
      const ordenados = Object.keys(stats).sort((a,b) => stats[b] - stats[a]);
      saborElegido = ordenados.find(f => opciones.some(o => o.nombre === f));
      if (!saborElegido && opciones.length > 0) saborElegido = opciones[0].nombre;
    }
    let tamanoElegido = null;
    if (p.tamanos && p.tamanos.length > 0) {
      const disponibles = p.tamanos.filter(t => t.disponible);
      tamanoElegido = disponibles[0]; 
    }
    return { sabor: saborElegido, tamano: tamanoElegido };
  };

  const eliminarDelCarrito = (idUnico) => setPedido(pedido.filter(i => i.idUnico !== idUnico));
  const vaciarCarrito = () => { if (window.confirm("¿Vaciar todo el pedido?")) { setPedido([]); setSalsasElegidas([]); } };

  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos (Nombre, Dirección y Pago)");
    if (metodoPago === "Efectivo" && !pagoCon) return alert("Dinos con cuánto vas a pagar");
    const horaActual = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    
    const tComida = pedido.reduce((acc, i) => acc + i.subtotal, 0);
    const cDom = tComida < 8000 ? 2000 : 0;
    const tFinal = tComida + cDom;
    
    const lista = pedido.map(i => `• ${i.cantidad}x ${i.nombre} (${i.detalle})`).join('\n');
    const salsas = salsasElegidas.length > 0 ? `🍯 *Salsas:* ${salsasElegidas.join(', ')}` : "🍯 *Salsas:* Ninguna";
    
    let infoPago = `💳 *Pago:* ${metodoPago}`;
    if (metodoPago === "Efectivo") {
      const cambio = Number(pagoCon) - tFinal;
      infoPago += `\n💵 *Paga con:* $${Number(pagoCon).toLocaleString()}\n💰 *Cambio:* $${cambio > 0 ? cambio.toLocaleString() : '0'}`;
    }

    const divisor = "━━━━━━━━━━━━━━━";
    const msg = `🍽️ *Pedido - Gestión Digital* 📂\n🕒 Enviado: ${horaActual}\n⏰ *Entregar:* ${horaEntrega || 'Lo antes posible'}\n\n${divisor}\n\n🧾 *Productos:*\n${lista}\n\n${divisor}\n\n${salsas}\n\n${notas ? `📝 *Observaciones:* ${notas}\n\n${divisor}\n\n` : ''}💰 *Subtotal:* $${tComida.toLocaleString()}\n🛵 *Dom:* $${cDom}\n⭐ *TOTAL:* $${tFinal.toLocaleString()}\n\n${divisor}\n\n👤 ${nombre}\n📍 ${direccion}\n${infoPago}`;
    
    window.open(`https://wa.me/573116624201?text=${encodeURIComponent(msg)}`);
    setAgradecimiento(true);
    setPedido([]);
  };

  const totalSinDom = pedido.reduce((acc, i) => acc + i.subtotal, 0);
  const domCosto = totalSinDom < 8000 && totalSinDom > 0 ? 2000 : 0;
  const faltaParaGratis = 8000 - totalSinDom;
  const sugeridos = productosMostrar.filter(p => p.disponible !== false && p.precio > 0 && p.precio <= (faltaParaGratis + 1000) && p.categoria !== "Arroces" && p.categoria !== "Desayunos").slice(0, 3);

  // 🔴 PANEL DE ADMINISTRADOR
  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'850px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px', alignItems: 'center'}}>
            <h1 style={{color: MONO_NARANJA}}>Admin 📂</h1>
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <div style={{textAlign:'right'}}>
                  <small style={{display:'block', fontWeight:'bold', color: tiendaAbierta ? MONO_VERDE : '#ef4444'}}>
                    {tiendaAbierta ? 'SISTEMA ABIERTO' : 'SISTEMA CERRADO'}
                  </small>
                </div>
                <MiniSwitch activo={tiendaAbierta} onClick={() => guardarCambio("ajuste", "tienda", { abierta: !tiendaAbierta })} />
                <button onClick={() => setIsAdmin(false)} style={{padding:'10px 15px', borderRadius:'10px', background:MONO_TEXTO, color:'white', border:'none', cursor:'pointer'}}>Cerrar</button>
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
                  
                  {(p.opciones || p.sabores) && (
                    <div style={{marginTop:'10px', display:'flex', gap:'10px', flexWrap:'wrap', background:'#f8fafc', padding:'10px', borderRadius:'15px'}}>
                      <small style={{width:'100%', fontWeight:'bold'}}>Opciones:</small>
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
                            }} style={{width:'80px', padding:'5px', borderRadius:'5px', border:'1px solid #ddd'}} />
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
        </div>
      </div>
    );
  }

  // 🟡 VISTA DEL CLIENTE
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px', color: MONO_TEXTO }}>
      <style>{`.card-mono { transition: 0.3s; } .card-mono:hover { transform: translateY(-10px); } .opcion-btn { padding: 10px; border-radius: 12px; border: 1px solid #ddd; background: white; cursor: pointer; font-weight: bold; font-size: 13px; } .opcion-btn.active { background: ${MONO_NARANJA}; color: white; border-color: ${MONO_NARANJA}; } .salsa-chip { padding: 12px; border-radius: 15px; border: 2px solid #eee; background: white; cursor: pointer; font-weight: bold; font-size: 13px; } .salsa-chip.active { border-color: ${MONO_NARANJA}; background: #fff7ed; color: ${MONO_NARANJA}; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      
      {mostrarLogin && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.85)', zIndex:40000, display:'flex', justifyContent:'center', alignItems:'center'}}>
          <div style={{background:'white', padding:'30px', borderRadius:'30px', textAlign:'center', width:'90%', maxWidth:'350px'}}>
            <h3 style={{marginBottom:'20px'}}>Acceso Propietario</h3>
            <input type="password" placeholder="Ingresa el PIN" onChange={(e) => setPinInput(e.target.value)} style={{width:'100%', padding:'15px', borderRadius:'15px', border:'1px solid #ddd', marginBottom:'15px', textAlign:'center', fontSize:'18px'}} />
            <button onClick={() => { if(pinInput === "mono2026") { setIsAdmin(true); setMostrarLogin(false); } else { alert("PIN Incorrecto"); } }} style={{width:'100%', background:MONO_NARANJA, color:'white', border:'none', padding:'15px', borderRadius:'15px', fontWeight:'900', cursor:'pointer'}}>Entrar al Panel</button>
            <button onClick={() => setMostrarLogin(false)} style={{marginTop:'15px', background:'none', border:'none', color:'#666', cursor:'pointer'}}>Cancelar</button>
          </div>
        </div>
      )}

      {agradecimiento && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:MONO_NARANJA, zIndex:30000, display:'flex', justifyContent:'center', alignItems:'center', textAlign:'center', color:'white', padding:'20px'}}>
          <div>
            <span style={{fontSize:'80px'}}>📂</span>
            <h2 style={{fontSize:'32px', fontWeight:'900', margin:'20px 0'}}>¡Solicitud Procesada!</h2>
            <p style={{fontSize:'18px'}}>Ya recibimos tu información en WhatsApp. <br/> Nos pondremos en contacto pronto.</p>
            <button onClick={() => setAgradecimiento(false)} style={{marginTop:'30px', background:'white', color:MONO_NARANJA, border:'none', padding:'15px 40px', borderRadius:'50px', fontWeight:'900', cursor:'pointer'}}>Volver al Inicio</button>
          </div>
        </div>
      )}

      {!tiendaAbierta && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(255,252,245,0.98)', zIndex:15000, display:'flex', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'20px'}}>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <span style={{fontSize:'70px'}}>📂💤</span>
            <h2 style={{color:MONO_NARANJA, fontSize:'30px', fontWeight:'900', marginTop:'20px'}}>Sistema en Mantenimiento</h2>
            <p style={{fontSize:'18px'}}>Atendemos de <b>6:00 a.m. a 5:10 p.m.</b></p>
            <button onClick={() => setMostrarLogin(true)} style={{marginTop:'50px', background:'#eee', color:'#999', border:'none', padding:'10px 20px', borderRadius:'15px', fontSize:'12px', fontWeight:'bold', cursor:'pointer'}}>ACCESO ADMIN</button>
          </div>
        </div>
      )}

      {notificacion && <div style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background: MONO_VERDE, color:'white', padding:'15px 30px', borderRadius:'50px', zIndex: 10000, fontWeight:'bold', boxShadow:'0 5px 15px rgba(0,0,0,0.1)'}}>{notificacion}</div>}

      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 50px 50px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow:'hidden'}}>
        <div style={{padding: '40px 0'}}>
            <h1 onClick={() => setMostrarLogin(true)} style={{color: MONO_NARANJA, margin:'0', fontSize: '2.5rem', fontWeight: '900', cursor:'pointer'}}>Gestión Digital 📂</h1>
            <p style={{fontWeight:'bold', color: '#666', marginTop:'10px'}}>Ortega Gestión Digital y Documental</p>
        </div>
      </header>

      <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', marginBottom: '40px', overflowX: 'auto', padding: '0 20px' }}>
        {["Servicios", "Trámites", "Consultas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '14px 28px', borderRadius: '30px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', flexShrink: 0, boxShadow:'0 4px 10px rgba(0,0,0,0.05)' }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '30px', padding: '0 20px', maxWidth:'1300px', margin:'0 auto'}}>
        {productosMostrar.filter(p => p.categoria === categoriaActiva).map(p => {
            const sel = selecciones[p.id] || {};
            const cant = cantidades[p.id] || 1;
            const pU = (p.tamanos && p.tamanos.length > 0) ? (sel.tamano?.precio || p.tamanos[0]?.precio || 0) : (p.precio || 0);
            const total = (pU + (sel.agrandar ? 1000 : 0)) * cant;
            
            return (
              <div key={p.id} className="card-mono" style={{background: 'white', borderRadius: '40px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 20px rgba(0,0,0,0.02)', border:'1px solid #f1f5f9', opacity: p.disponible === false ? 0.6 : 1}}>
                <h3 style={{margin: '15px 0 5px 0', fontWeight: '800', fontSize: '18px', minHeight: '44px', display: 'flex', alignItems: 'center'}}>{p.nombre}</h3>
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '26px', margin:'0 0 15px 0'}}>${(total || 0).toLocaleString()}</p>
                
                {p.tamanos && p.tamanos.length > 0 && (
                  <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px'}}>
                    {p.tamanos.filter(t => t.disponible).map(t => (
                      <button key={t.nombre} onClick={() => setSelecciones({...selecciones, [p.id]: {...sel, tamano: t}})} className={`opcion-btn ${sel.tamano?.nombre === t.nombre ? 'active' : ''}`}>{t.nombre}</button>
                    ))}
                  </div>
                )}

                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'15px', marginBottom:'15px', background:'#f8fafc', padding:'10px', borderRadius:'15px'}}>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: Math.max(1, cant - 1)})} style={{width:'40px', height:'40px', borderRadius:'50%', border:'none'}}>-</button>
                   <span style={{fontWeight:'900', fontSize:'20px'}}>{cant}</span>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: cant + 1})} style={{width:'40px', height:'40px', borderRadius:'50%', border:'none', background:MONO_NARANJA, color:'white'}}>+</button>
                </div>
                <button onClick={() => agregarAlCarrito(p)} disabled={!tiendaAbierta || p.disponible === false} style={{background: (tiendaAbierta && p.disponible !== false) ? MONO_NARANJA : '#ccc', color:'white', border:'none', padding:'18px', borderRadius:'20px', fontWeight:'900', cursor:'pointer'}}>{p.disponible === false ? 'NO DISPONIBLE' : 'Añadir 📋'}</button>
              </div>
            );
        })}
      </div>

      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '50px auto 100px', background: 'white', padding: '40px', borderRadius: '40px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 45px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '25px' }}>📋 Solicitud de Trámites</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '15px 0' }}>
              <span style={{flex: 1}}><strong>{item.cantidad}x</strong> {item.nombre} <br /><small>{item.detalle}</small></span>
              <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <strong style={{fontSize: '18px'}}>${item.subtotal.toLocaleString()}</strong>
                <button onClick={() => eliminarDelCarrito(item.idUnico)} style={{background:'none', border:'none', color:'#ef4444', fontSize:'20px', cursor:'pointer'}}>❌</button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
             <h2 style={{ color: MONO_NARANJA, fontSize: '38px', fontWeight: '900' }}>Total: ${pedido.reduce((acc, i) => acc + i.subtotal, 0).toLocaleString()}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '25px' }}>
            <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd' }} />
            <input type="text" placeholder="Teléfono / Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd' }} />
            <textarea placeholder="Explica brevemente tu caso o trámite..." value={notas} onChange={(e) => setNotas(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd', height: '90px' }} />
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', padding: '22px', borderRadius: '25px', fontWeight: '900', fontSize: '20px', cursor:'pointer' }}>Enviar por WhatsApp 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}