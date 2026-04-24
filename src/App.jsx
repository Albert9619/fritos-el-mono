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
  { id: "d2", nombre: "Desayuno Especial Con Carne", precio: 12000, categoria: "Desayunos", disponible: true, imagen: "/desayuno-carne.jpg", config: { acompanamiento: ["Patacón", "Arepa"], jugos: ["Avena", "Maracuyá"] } },
  { id: "d3", nombre: "Desayuno Especial Con Pollo", precio: 10000, categoria: "Desayunos", disponible: true, imagen: "/desayuno-carne.jpg", config: { acompanamiento: ["Patacón", "Arepa"], jugos: ["Avena", "Maracuyá"] } },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", disponible: true, imagen: "/jugo-natural.jpg", sabores: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: "b4", nombre: "Tinto Tradicional", precio: 1000, categoria: "Bebidas", disponible: true, imagen: "/tinto.jpg", config: { azucar: ["Con Azúcar", "Sin Azúcar"] } },
  { id: "b5", nombre: "Café con Leche", precio: 1500, categoria: "Bebidas", disponible: true, imagen: "/cafe-leche.jpg", config: { leche: ["Con Leche", "Sin Leche"], azucar: ["Con Azúcar", "Sin Azúcar"] } },
  { id: "b6", nombre: "Chocolate Caliente", precio: 1500, categoria: "Bebidas", disponible: true, imagen: "/chocolate.jpg", config: { leche: ["Con Leche", "Sin Leche"], azucar: ["Con Azúcar", "Sin Azúcar"] } },
  { id: "b7", nombre: "Aromáticas", precio: 1000, categoria: "Bebidas", disponible: true, imagen: "/aromática.jpg", config: { sabores: ["Manzanilla", "Hierbabuena", "Limoncillo", "Frutos Rojos"], azucar: ["Con Azúcar", "Sin Azúcar"] } },
  { id: "milo1", nombre: "Milo Refrescante", precio: 4000, categoria: "Bebidas", disponible: true, imagen: "/milo.jpg" },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", disponible: true, imagen: "/cocacola.jpg", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }, { nombre: "Familiar", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", disponible: true, imagen: "/malta.jpg", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", disponible: true, imagen: "/agua.jpg" },
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
  const [mesa, setMesa] = useState(null);

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // 🔎 DETECTOR DE MESA POR URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mesaURL = params.get('mesa');
    if (mesaURL) {
      setMesa(mesaURL);
      setDireccion(`Mesa ${mesaURL}`);
    }
  }, []);

  // 🕒 LÓGICA DE CIERRE AUTOMÁTICO
  useEffect(() => {
    const verificarEstado = () => {
      if (manualOverride !== null) {
        setTiendaAbierta(manualOverride);
        return;
      }
      const ahora = new Date();
      const tiempoActualEnMinutos = ahora.getHours() * 60 + ahora.getMinutes();
      setTiendaAbierta(tiempoActualEnMinutos >= 360 && tiempoActualEnMinutos < 1350);
    };
    verificarEstado();
    const t = setInterval(verificarEstado, 30000);
    return () => clearInterval(t);
  }, [manualOverride]);

  // 🔥 FIREBASE LISTENERS
  useEffect(() => {
    const unsubProd    = onSnapshot(collection(db, "productos"),   (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras  = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSalsas  = onSnapshot(collection(db, "salsas"),      (s) => setSalsasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda  = onSnapshot(doc(db, "ajuste", "tienda"),   (s) => {
      if (s.exists()) setManualOverride(s.data().abierta);
    });
    return () => { unsubProd(); unsubExtras(); unsubSalsas(); unsubTienda(); };
  }, []);

  // 💾 PERSISTENCIA DEL CARRITO
  useEffect(() => {
    const p = localStorage.getItem("pedido_mono_storage");
    if (p) setPedido(JSON.parse(p));
  }, []);

  useEffect(() => {
    localStorage.setItem("pedido_mono_storage", JSON.stringify(pedido));
  }, [pedido]);

  // 🔀 FUSIÓN BASE + FIREBASE
  const fusionar = (base, fb) => {
    const mapa = {};
    base.forEach(p => { mapa[p.id] = { ...p }; });
    fb.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
    return Object.values(mapa);
  };

  const productosMostrar = fusionar(productosBase, productosFB);
  const extrasMostrar    = fusionar(extrasArrozBase, extrasFB);
  const salsasMostrar    = fusionar(salsasIniciales, salsasFB);

  // 💾 GUARDAR CAMBIO EN FIREBASE
  const guardarCambio = async (col, id, datos) => {
    try { await setDoc(doc(db, col, id), datos, { merge: true }); }
    catch (e) { console.error(e); }
  };

  // 🧠 PREDICCIÓN DE SELECCIÓN
  const predecirSeleccion = (p) => {
    let saborElegido = null;
    const listaOpciones = p.opciones || p.sabores || p.config?.sabores;
    if (listaOpciones) {
      const opciones = listaOpciones.filter(o => typeof o === 'string' ? true : o.disponible);
      const historial = JSON.parse(localStorage.getItem("mono_favoritos") || "{}");
      const stats = historial[p.id] || {};
      const ordenados = Object.keys(stats).sort((a, b) => stats[b] - stats[a]);
      saborElegido = ordenados.find(f => opciones.some(o => (typeof o === 'string' ? o : o.nombre) === f));
      if (!saborElegido && opciones.length > 0) {
        saborElegido = typeof opciones[0] === 'string' ? opciones[0] : opciones[0].nombre;
      }
    }
    let tamanoElegido = null;
    if (p.tamanos && p.tamanos.length > 0) {
      tamanoElegido = p.tamanos.filter(t => t.disponible)[0] || p.tamanos[0];
    }
    return { sabor: saborElegido, tamano: tamanoElegido };
  };

  // 🛒 AGREGAR AL CARRITO — Versión Blindada
  const agregarAlCarrito = (p) => {
    // 1. Obtenemos los datos actuales de forma segura
    const sel = selecciones[p.id] || {};
    const cant = cantidades[p.id] || 1;

    if (p.disponible === false) return alert("Agotado 🚫");

    // --- 🛑 VALIDACIONES ---
    // Para Fritos
    if (p.categoria === "Fritos" && p.opciones && !sel.sabor) {
      return alert("Por favor, elige el sabor (Carne, Pollo, etc.)");
    }
    
    // Para Desayunos
    if (p.categoria === "Desayunos") {
      if (!sel.acompanamiento || !sel.jugo) {
        return alert("Completa tu desayuno: falta el acompañamiento o el jugo");
      }
    }

    // Para Bebidas (Incluyendo Jugos y calientes)
    if (p.categoria === "Bebidas") {
      if (p.config?.leche && !sel.leche) return alert("Elige si quieres con leche");
      if (p.config?.azucar && !sel.azucar) return alert("Elige el nivel de azúcar");
      // Si el jugo tiene sabores (Avena/Maracuyá), obligamos a elegir
      if ((p.sabores || p.config?.sabores) && !sel.sabor) return alert("Elige el sabor de tu jugo");
      // Si tiene tamaños (Gaseosas/Jugos), obligamos a elegir
      if (p.tamanos && !sel.tamano) return alert("Elige el tamaño");
    }

    // --- 💰 CÁLCULO DE PRECIO SEGURO ---
    let precioBase = p.precio || 0;
    if (sel.tamano) precioBase = sel.tamano.precio || 0;
    
    const costoExtras = (sel.extras || []).reduce((acc, n) => {
      const exEncontrado = extrasMostrar.find(e => e.nombre === n);
      return acc + (exEncontrado?.precio || 0);
    }, 0);

    const subtotal = (precioBase + costoExtras + (sel.agrandar ? 1000 : 0)) * cant;

    // --- 📝 CONSTRUCCIÓN DEL DETALLE PARA WHATSAPP ---
    let detalle = "";
    if (p.categoria === "Desayunos") {
      const prote = sel.huevos || "";
      detalle = `(${sel.acompanamiento}${prote ? ', ' + prote : ''}, ${sel.jugo}${sel.agrandar ? ' Gr' : ''})`;
    } else {
      // Lógica universal para Fritos, Arroces y Bebidas
      const partes = [];
      if (sel.sabor) partes.push(sel.sabor);
      if (sel.leche) partes.push(sel.leche);
      if (sel.azucar) partes.push(sel.azucar);
      if (sel.tamano) partes.push(sel.tamano.nombre);
      if (sel.extras?.length > 0) partes.push(`Extras: ${sel.extras.join(', ')}`);
      detalle = partes.join(" - ").trim();
    }

    // 🧠 Guardar en historial para la predicción del Mono
    if (sel.sabor) {
      try {
        const historial = JSON.parse(localStorage.getItem("mono_favoritos") || "{}");
        if (!historial[p.id]) historial[p.id] = {};
        historial[p.id][sel.sabor] = (historial[p.id][sel.sabor] || 0) + 1;
        localStorage.setItem("mono_favoritos", JSON.stringify(historial));
      } catch(e) { console.log("Error en historial"); }
    }

    // --- 🛒 GUARDAR EN EL PEDIDO ---
    const nuevoItem = {
      idUnico: Date.now() + Math.random(),
      nombre: p.nombre,
      cantidad: cant,
      subtotal,
      detalle
    };

    setPedido(prev => [...prev, nuevoItem]);

    // --- ✨ LIMPIEZA POST-COMPRA ---
    setCantidades(prev => ({ ...prev, [p.id]: 1 }));
    setSelecciones(prev => ({ ...prev, [p.id]: {} }));
    setNotificacion("¡Añadido al carrito! 🛒");
    setTimeout(() => setNotificacion(""), 2000);
  };


  const eliminarDelCarrito = (idUnico) => setPedido(prev => prev.filter(i => i.idUnico !== idUnico));
  const vaciarCarrito = () => {
    if (window.confirm("¿Vaciar todo el pedido?")) {
      setPedido([]);
      setSalsasElegidas([]);
    }
  };

  // 📲 ENVIAR POR WHATSAPP
  const enviarWhatsApp = () => {
    if (!nombre || (!mesa && !direccion) || !metodoPago) return alert("Faltan datos de envío");
    if (metodoPago === "Efectivo" && !pagoCon) return alert("Dinos con cuánto vas a pagar");

    const horaActual = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const tComida = pedido.reduce((acc, i) => acc + i.subtotal, 0);
    const cDom    = mesa ? 0 : (tComida < 8000 ? 2000 : 0);
    const tFinal  = tComida + cDom;

    const lista  = pedido.map(i => `• ${i.cantidad}x ${i.nombre}${i.detalle ? ` (${i.detalle})` : ''}`).join('\n');
    const salsas = salsasElegidas.length > 0 ? `🍯 *Salsas:* ${salsasElegidas.join(', ')}` : "🍯 *Salsas:* Ninguna";

    let infoPago = `💳 *Pago:* ${metodoPago}`;
    if (metodoPago === "Efectivo") {
      const cambio = Number(pagoCon) - tFinal;
      infoPago += `\n💵 *Paga con:* $${Number(pagoCon).toLocaleString()}\n💰 *Cambio:* $${cambio > 0 ? cambio.toLocaleString() : '0'}`;
    }

    const divisor = "━━━━━━━━━━━━━━━";
    const titulo  = mesa ? `🪑 *ORDEN MESA ${mesa}* 🪑` : `🛵 *PEDIDO DOMICILIO* 🛵`;

    const msg = `${titulo}\n🕒 Enviado: ${horaActual}\n⏰ *Entregar:* ${horaEntrega || 'Lo antes posible'}\n\n${divisor}\n\n🧾 *Productos:*\n${lista}\n\n${divisor}\n\n${salsas}\n\n${notas ? `📝 *Observaciones:* ${notas}\n\n${divisor}\n\n` : ''}💰 *Subtotal:* $${tComida.toLocaleString()}\n${!mesa ? `🛵 *Dom:* $${cDom.toLocaleString()}\n` : ''}⭐ *TOTAL:* $${tFinal.toLocaleString()}\n\n${divisor}\n\n👤 *Cliente:* ${nombre}\n📍 ${mesa ? `LOCAL - MESA ${mesa}` : `DIRECCIÓN: ${direccion}`}\n${infoPago}`;

    window.open(`https://wa.me/573116624201?text=${encodeURIComponent(msg)}`);
    setAgradecimiento(true);
    setPedido([]);
  };

  // 💰 TOTALES
  const totalSinDom = pedido.reduce((acc, i) => acc + i.subtotal, 0);
  const domCosto    = !mesa && totalSinDom > 0 && totalSinDom < 8000 ? 2000 : 0;
  const faltaParaGratis = Math.max(0, 8000 - totalSinDom);
  const sugeridos   = productosMostrar.filter(p =>
    p.disponible !== false &&
    p.precio > 0 &&
    p.precio <= faltaParaGratis + 1000 &&
    p.categoria !== "Arroces" &&
    p.categoria !== "Desayunos"
  ).slice(0, 3);

  // ==========================================
  // 🖼️ RENDER
  // ==========================================
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px', color: MONO_TEXTO }}>
      <style>{`
        .card-mono { transition: 0.3s; }
        .card-mono:hover { transform: translateY(-10px); }
        .opcion-btn { padding: 10px; border-radius: 12px; border: 1px solid #ddd; background: white; cursor: pointer; font-weight: bold; font-size: 13px; }
        .opcion-btn.active { background: ${MONO_NARANJA}; color: white; border-color: ${MONO_NARANJA}; }
        .salsa-chip { padding: 12px; border-radius: 15px; border: 2px solid #eee; background: white; cursor: pointer; font-weight: bold; font-size: 13px; }
        .salsa-chip.active { border-color: ${MONO_NARANJA}; background: #fff7ed; color: ${MONO_NARANJA}; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* 🔐 MODAL DE LOGIN */}
      {mostrarLogin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 40000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center', width: '90%', maxWidth: '350px' }}>
            <h3 style={{ marginBottom: '20px' }}>Acceso Propietario</h3>
            <input type="password" placeholder="Ingresa el PIN" onChange={(e) => setPinInput(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #ddd', marginBottom: '15px', textAlign: 'center', fontSize: '18px' }} />
            <button onClick={() => { if (pinInput === "mono2026") { setIsAdmin(true); setMostrarLogin(false); } else { alert("PIN Incorrecto"); } }} style={{ width: '100%', background: MONO_NARANJA, color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' }}>Entrar al Panel</button>
            <button onClick={() => setMostrarLogin(false)} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* 🎉 PANTALLA DE AGRADECIMIENTO */}
      {agradecimiento && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: MONO_NARANJA, zIndex: 30000, display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'white', padding: '20px' }}>
          <div>
            <span style={{ fontSize: '80px' }}>🐒</span>
            <h2 style={{ fontSize: '32px', fontWeight: '900', margin: '20px 0' }}>¡Pedido Procesado!</h2>
            <p style={{ fontSize: '18px' }}>Ya recibimos tu orden en WhatsApp.<br />El Mono se pone en marcha.</p>
            <button onClick={() => setAgradecimiento(false)} style={{ marginTop: '30px', background: 'white', color: MONO_NARANJA, border: 'none', padding: '15px 40px', borderRadius: '50px', fontWeight: '900', cursor: 'pointer' }}>Volver al Menú</button>
          </div>
        </div>
      )}

      {/* 💤 AVISO DE TIENDA CERRADA */}
      {!tiendaAbierta && !isAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,252,245,0.98)', zIndex: 15000, display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '70px' }}>🐒💤</span>
            <h2 style={{ color: MONO_NARANJA, fontSize: '30px', fontWeight: '900', marginTop: '20px' }}>El Mono descansa</h2>
            <p style={{ fontSize: '18px' }}>Atendemos de <b>6:00 a.m. a 11:30 a.m.</b></p>
            <button onClick={() => setMostrarLogin(true)} style={{ marginTop: '50px', background: '#eee', color: '#999', border: 'none', padding: '10px 20px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>ACCESO ADMIN</button>
          </div>
        </div>
      )}

      {/* 🔔 NOTIFICACIÓN FLOTANTE */}
      {notificacion && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: MONO_VERDE, color: 'white', padding: '15px 30px', borderRadius: '50px', zIndex: 10000, fontWeight: 'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
          {notificacion}
        </div>
      )}

      {/* 🛠️ PANEL DE ADMINISTRACIÓN */}
      {isAdmin && (
        <div style={{ background: '#1e293b', color: 'white', padding: '30px', marginBottom: '30px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, color: MONO_NARANJA }}>🛠️ Panel Admin</h2>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px' }}>Tienda {manualOverride !== null ? (manualOverride ? 'ABIERTA' : 'CERRADA') : 'AUTO'}</span>
                <MiniSwitch
                  activo={manualOverride !== null ? manualOverride : tiendaAbierta}
                  onClick={() => {
                    const nuevoEstado = manualOverride !== null ? !manualOverride : !tiendaAbierta;
                    setManualOverride(nuevoEstado);
                    guardarCambio("ajuste", "tienda", { abierta: nuevoEstado });
                  }}
                />
                <button onClick={() => setIsAdmin(false)} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button>
              </div>
            </div>

            {/* SALSAS */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#94a3b8', marginBottom: '15px' }}>Salsas disponibles</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {salsasMostrar.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#334155', padding: '10px 15px', borderRadius: '12px' }}>
                    <span>{s.nombre}</span>
                    <MiniSwitch activo={s.disponible} onClick={() => guardarCambio("salsas", s.id, { disponible: !s.disponible })} />
                  </div>
                ))}
              </div>
            </div>

            {/* EXTRAS ARROZ */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#94a3b8', marginBottom: '15px' }}>Extras Arroz</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {extrasMostrar.map(ex => (
                  <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#334155', padding: '10px 15px', borderRadius: '12px' }}>
                    <span>{ex.nombre}</span>
                    <MiniSwitch activo={ex.disponible} onClick={() => guardarCambio("extrasArroz", ex.id, { disponible: !ex.disponible })} />
                  </div>
                ))}
              </div>
            </div>

            {/* PRODUCTOS */}
            <h3 style={{ color: '#94a3b8', marginBottom: '15px' }}>Productos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
              {productosMostrar.map(p => (
                <div key={p.id} style={{ background: '#334155', padding: '15px', borderRadius: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.nombre}</span>
                    <MiniSwitch activo={p.disponible !== false} onClick={() => guardarCambio("productos", p.id, { disponible: !(p.disponible !== false) })} />
                  </div>

                  {/* Opciones / Sabores */}
                  {(p.opciones || p.sabores) && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(p.opciones || p.sabores).map((opt, idx) => (
                        <div key={`opt-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#1e293b', padding: '4px 8px', borderRadius: '8px' }}>
                          <small>{opt.nombre}</small>
                          <MiniSwitch activo={opt.disponible} onClick={() => {
                            const arr = [...(p.opciones || p.sabores)];
                            arr[idx] = { ...arr[idx], disponible: !arr[idx].disponible };
                            guardarCambio("productos", p.id, p.opciones ? { opciones: arr } : { sabores: arr });
                          }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tamaños */}
                  {p.tamanos && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {p.tamanos.map((t, idx) => (
                        <div key={`tam-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#1e293b', padding: '4px 8px', borderRadius: '8px' }}>
                          <small>{t.nombre} ${t.precio.toLocaleString()}</small>
                          <MiniSwitch activo={t.disponible} onClick={() => {
                            const arr = [...p.tamanos];
                            arr[idx] = { ...arr[idx], disponible: !arr[idx].disponible };
                            guardarCambio("productos", p.id, { tamanos: arr });
                          }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ HEADER */}
      <header style={{ textAlign: 'center', background: 'white', borderRadius: '0 0 50px 50px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
        <div style={{ padding: '25px 0' }}>
          <h1 onClick={() => setMostrarLogin(true)} style={{ color: MONO_NARANJA, margin: '0', fontSize: '2.5rem', fontWeight: '900', cursor: 'pointer' }}>Fritos El Mono 🐒</h1>
          <div style={{ display: 'inline-block', marginTop: '10px', background: '#fff7ed', padding: '6px 20px', borderRadius: '20px', fontWeight: 'bold' }}>
            Sabor del arroz hoy: {tipoArrozHoy}
          </div>
        </div>
      </header>

      {/* 📂 SELECTOR DE CATEGORÍAS */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', marginBottom: '40px', overflowX: 'auto', padding: '0 20px' }}>
        {["Fritos", "Bebidas", "Arroces", "Desayunos"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '14px 28px', borderRadius: '30px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* 🍱 GRILLA DE PRODUCTOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '30px', padding: '0 20px', maxWidth: '1300px', margin: '0 auto' }}>
        {productosMostrar.filter(p => p.categoria === categoriaActiva).map(p => {
          const sel  = selecciones[p.id] || {};
          const cant = cantidades[p.id] || 1;

          // Precio base
          const pBase = (p.tamanos && p.tamanos.length > 0)
            ? (sel.tamano?.precio ?? p.tamanos.find(t => t.disponible)?.precio ?? 0)
            : (p.precio || 0);

          // Costo extras
          const costoExtras = (sel.extras || []).reduce((acc, n) => {
            return acc + (extrasMostrar.find(e => e.nombre === n)?.precio || 0);
          }, 0);

          const total = (pBase + costoExtras + (sel.agrandar ? 1000 : 0)) * cant;

          return (
            <div key={p.id} className="card-mono" style={{ background: 'white', borderRadius: '40px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', opacity: p.disponible === false ? 0.6 : 1 }}>
              <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '180px', borderRadius: '25px', objectFit: 'cover' }} />
              <h3 style={{ margin: '15px 0 5px 0', fontWeight: '800', fontSize: '18px', minHeight: '44px', display: 'flex', alignItems: 'center' }}>{p.nombre}</h3>
              <p style={{ color: MONO_NARANJA, fontWeight: '900', fontSize: '26px', margin: '0 0 15px 0' }}>${total.toLocaleString()}</p>

              {/* 2. TAMAÑOS (Gaseosas, Jugos) */}
              {p.tamanos && p.tamanos.length > 0 && (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {p.tamanos.filter(t => t.disponible).map(t => (
                    <button key={t.nombre} onClick={() => setSelecciones(prev => ({ ...prev, [p.id]: { ...sel, tamano: t } }))} className={`opcion-btn ${sel.tamano?.nombre === t.nombre ? 'active' : ''}`}>
                      {t.nombre}
                    </button>
                  ))}
                </div>
              )}
              {/* 1. SABORES (Para Fritos, Jugos y otros) */}
{(p.opciones || p.sabores) && !p.config && (
  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
    {(p.opciones || p.sabores).filter(o => o.disponible).map(o => (
      <button 
        key={o.nombre} 
        onClick={() => setSelecciones(prev => ({ ...prev, [p.id]: { ...sel, sabor: o.nombre } }))} 
        className={`opcion-btn ${sel.sabor === o.nombre ? 'active' : ''}`}
      >
        {o.nombre}
      </button>
    ))}
  </div>
)}

              {/* 3. DESAYUNOS */}
              {p.categoria === "Desayunos" && p.config && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {p.config.acompanamiento.map(a => (
                      <button key={a} onClick={() => setSelecciones(prev => ({ ...prev, [p.id]: { ...sel, acompanamiento: a } }))} className={`opcion-btn ${sel.acompanamiento === a ? 'active' : ''}`}>{a}</button>
                    ))}
                  </div>
                  {p.config.huevos && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {p.config.huevos.map(h => (
                        <button key={h} onClick={() => setSelecciones(prev => ({ ...prev, [p.id]: { ...sel, huevos: h } }))} className={`opcion-btn ${sel.huevos === h ? 'active' : ''}`}>{h}</button>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {p.config.jugos.map(j => (
                      <button key={j} onClick={() => setSelecciones(prev => ({ ...prev, [p.id]: { ...sel, jugo: j } }))} className={`opcion-btn ${sel.jugo === j ? 'active' : ''}`}>{j}</button>
                    ))}
                  </div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="checkbox" checked={sel.agrandar || false} onChange={(e) => setSelecciones(prev => ({ ...prev, [p.id]: { ...sel, agrandar: e.target.checked } }))} />
                    🥤 Agrandar Jugo (+1k)
                  </label>
                </div>
              )}

              {/* 4. EXTRAS PARA ARROCES */}
              {p.categoria === "Arroces" && (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {extrasMostrar.filter(ex => ex.disponible !== false).map(ex => (
                    <button key={ex.id} onClick={() => {
                      const actuales = sel.extras || [];
                      const nuevos = actuales.includes(ex.nombre) ? actuales.filter(x => x !== ex.nombre) : [...actuales, ex.nombre];
                      setSelecciones(prev => ({ ...prev, [p.id]: { ...sel, extras: nuevos } }));
                    }} className={`opcion-btn ${sel.extras?.includes(ex.nombre) ? 'active' : ''}`}>
                      {ex.nombre}{ex.precio > 0 ? ` (+$${(ex.precio / 1000).toFixed(0)}k)` : ''}
                    </button>
                  ))}
                </div>
              )}

              {/* 5. BEBIDAS CALIENTES Y AROMÁTICAS */}
              {p.config && p.categoria === "Bebidas" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                  {p.config.sabores && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {p.config.sabores.map(s => (
                        <button key={s} onClick={() => setSelecciones(prev => ({ ...prev, [p.id]: { ...sel, sabor: s } }))} className={`opcion-btn ${sel.sabor === s ? 'active' : ''}`}>{s}</button>
                      ))}
                    </div>
                  )}
                  {p.config.leche && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {p.config.leche.map(l => (
                        <button key={l} onClick={() => setSelecciones(prev => ({ ...prev, [p.id]: { ...sel, leche: l } }))} className={`opcion-btn ${sel.leche === l ? 'active' : ''}`}>{l}</button>
                      ))}
                    </div>
                  )}
                  {p.config.azucar && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {p.config.azucar.map(a => (
                        <button key={a} onClick={() => setSelecciones(prev => ({ ...prev, [p.id]: { ...sel, azucar: a } }))} className={`opcion-btn ${sel.azucar === a ? 'active' : ''}`}>{a}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CONTROLES: CANTIDAD Y BOTÓN */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '15px', background: '#f8fafc', padding: '10px', borderRadius: '15px' }}>
                  <button onClick={() => setCantidades(prev => ({ ...prev, [p.id]: Math.max(1, cant - 1) }))} style={{ width: '35px', height: '35px', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '18px' }}>-</button>
                  <span style={{ fontWeight: '900', fontSize: '18px' }}>{cant}</span>
                  <button onClick={() => setCantidades(prev => ({ ...prev, [p.id]: cant + 1 }))} style={{ width: '35px', height: '35px', borderRadius: '50%', border: 'none', background: MONO_NARANJA, color: 'white', cursor: 'pointer', fontSize: '18px' }}>+</button>
                </div>
                <button
                  onClick={() => agregarAlCarrito(p)}
                  disabled={!tiendaAbierta || p.disponible === false}
                  style={{ width: '100%', background: (tiendaAbierta && p.disponible !== false) ? MONO_NARANJA : '#ccc', color: 'white', border: 'none', padding: '15px', borderRadius: '20px', fontWeight: '900', cursor: 'pointer' }}
                >
                  {p.disponible === false ? 'AGOTADO' : 'Añadir 🛒'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🛒 CARRITO */}
      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '50px auto 100px', background: 'white', padding: '40px', borderRadius: '40px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 45px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>🛒 Tu Pedido</h2>
            <button onClick={vaciarCarrito} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🗑️ Vaciar Todo</button>
          </div>

          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '15px 0' }}>
              <span style={{ flex: 1 }}>
                <strong>{item.cantidad}x</strong> {item.nombre}<br />
                <small style={{ color: '#666' }}>{item.detalle}</small>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <strong style={{ fontSize: '18px' }}>${item.subtotal.toLocaleString()}</strong>
                <button onClick={() => eliminarDelCarrito(item.idUnico)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '20px', cursor: 'pointer', padding: '5px' }}>❌</button>
              </div>
            </div>
          ))}

          {/* 🌟 SUGERIDO: ENVÍO GRATIS */}
          {!mesa && totalSinDom < 8000 && (
            <div style={{ marginTop: '25px', background: '#fff7ed', padding: '20px', borderRadius: '25px', border: '2px dashed #f97316' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>💡 ¡Te faltan ${faltaParaGratis.toLocaleString()} para envío GRATIS!</p>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }} className="no-scrollbar">
                {sugeridos.map(sug => {
                  const prediccion = predecirSeleccion(sug);
                  const textoAdicional = prediccion.sabor ? ` de ${prediccion.sabor}` : '';
                  const precioSugerido = prediccion.tamano ? prediccion.tamano.precio : sug.precio;
                  return (
                    <button key={sug.id} onClick={() => {
                      const detalleRapido = `${prediccion.sabor || ''} ${prediccion.tamano?.nombre || ''}`.trim();
                      setPedido(prev => [...prev, {
                        idUnico: Date.now() + Math.random(),
                        nombre: sug.nombre,
                        cantidad: 1,
                        subtotal: precioSugerido,
                        detalle: detalleRapido
                      }]);
                      setNotificacion("¡Añadido rápido! 🥟");
                      setTimeout(() => setNotificacion(""), 2000);
                    }} style={{ padding: '10px 15px', background: 'white', border: '1px solid #f97316', borderRadius: '15px', fontSize: '13px', flexShrink: 0, fontWeight: 'bold', cursor: 'pointer' }}>
                      + {sug.nombre}{textoAdicional} (${precioSugerido.toLocaleString()})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🍯 SALSAS */}
          <div style={{ marginTop: '30px', background: '#f8fafc', padding: '25px', borderRadius: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '900' }}>Salsas:</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {salsasMostrar.filter(s => s.disponible).map(s => (
                <button key={s.id} onClick={() => setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])} className={`salsa-chip ${salsasElegidas.includes(s.nombre) ? 'active' : ''}`}>
                  {s.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* 💰 TOTALES */}
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <p>Subtotal: <strong>${totalSinDom.toLocaleString()}</strong></p>
            <p>Domicilio: <strong>{mesa ? '¡LOCAL!' : (domCosto === 0 ? '¡GRATIS!' : `$${domCosto.toLocaleString()}`)}</strong></p>
            <h2 style={{ color: MONO_NARANJA, fontSize: '38px', fontWeight: '900' }}>Total: ${(totalSinDom + (mesa ? 0 : domCosto)).toLocaleString()}</h2>
          </div>

          {/* 📝 FORMULARIO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '25px' }}>
            <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd' }} />

            {!mesa ? (
              <input type="text" placeholder="Dirección exacta" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd' }} />
            ) : (
              <div style={{ padding: '18px', background: '#ecfdf5', borderRadius: '15px', border: '2px solid #10b981', color: '#065f46', fontWeight: 'bold', textAlign: 'center' }}>
                📍 Estás pidiendo desde la MESA {mesa}
              </div>
            )}

            <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>🕒 ¿A qué hora lo necesitas?</label>
              <input type="time" value={horaEntrega} onChange={(e) => setHoraEntrega(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
            </div>

            <textarea placeholder="Notas (Ej: Patacones tostados...)" value={notas} onChange={(e) => setNotas(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd', height: '90px', resize: 'vertical' }} />

            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: '1px solid #ddd', fontWeight: 'bold' }}>
              <option value="">-- ¿Cómo pagas? --</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi">Nequi</option>
            </select>

            {metodoPago === "Efectivo" && (
              <input type="number" placeholder="¿Con cuánto pagas?" value={pagoCon} onChange={(e) => setPagoCon(e.target.value)} style={{ padding: '15px', borderRadius: '10px', border: '1px solid #f97316' }} />
            )}

            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', padding: '22px', borderRadius: '25px', fontWeight: '900', fontSize: '20px', cursor: 'pointer', border: 'none' }}>
              Enviar por WhatsApp 📲
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
