import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 
import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard'; // ✅ Nueva pieza
import AdminPanel from './components/AdminPanel';
import { db } from './firebase'; // El puente que creamos
import { collection, onSnapshot, doc } from 'firebase/firestore'; // Las herramientas de Firebase

// ==========================================
// 🔴 DATOS BLINDADOS (Carepa)
// ==========================================
const productosBase = [
  { 
    id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.jpg", disponible: true,
    opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] 
  },
  { 
    id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.jpg", disponible: true,
    opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] 
  },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg", disponible: true },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg", disponible: true },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.jpg", disponible: true },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.jpg", disponible: true },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, disponible: true },
  { 
    id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.jpg", disponible: true,
    opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }],
    tamanos: [
      { nombre: "Pequeño", precio: 1000, disponible: true },
      { nombre: "Mediano", precio: 1500, disponible: true },
      { nombre: "Grande", precio: 2000, disponible: true }
    ]
  }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 }
];

const salsasBase = [
  { nombre: "Pique", disponible: true },
  { nombre: "Salsa Roja", disponible: true },
  { nombre: "Salsa Rosada", disponible: true },
  { nombre: "Suero", disponible: true },
  { nombre: "Suero Picante", disponible: true }
];

const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  
  const [productos, setProductos] = useState([]);
  const [extrasArroz, setExtrasArroz] = useState(extrasArrozBase);
  const [salsas, setSalsas] = useState(salsasBase);

  // ✅ AQUÍ ESTÁ LA MEMORIA (LocalStorage)
  const [pedido, setPedido] = useState(() => {
    const guardado = localStorage.getItem("pedidoMono");
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
  const [salsasElegidas, setSalsasElegidas] = useState([]);
  
  const [hoveredCardId, setHoveredCardId] = useState(null); 

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // 📡 Conexión en tiempo real con Firebase
  useEffect(() => {
    // 1. Escuchar los Productos
    const unsubProductos = onSnapshot(collection(db, "productos"), (snapshot) => {
      const listaProductos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(listaProductos);
    });

    // 2. Escuchar la Configuración (Tienda abierta y Arroz)
    const unsubConfig = onSnapshot(doc(db, "configuracion", "tienda"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setTiendaAbierta(data.tiendaAbierta);
        setAcompañanteArroz(data.tipoArrozHoy); // O el estado que uses para el arroz
      }
    });

    return () => { unsubProductos(); unsubConfig(); };
  }, []);

  // --- ACCESO SEGURO ---
  const accesoSecreto = () => {
    const clave = window.prompt("🔐 Ingresa el PIN:");
    if (clave === "mono2026") {
      setIsAdmin(true);
      toast.success("Bienvenido al panel, Mono"); // ✅ NOTIFICACIÓN BONITA
    } else if (clave !== null) {
      toast.error("PIN incorrecto"); // ✅ NOTIFICACIÓN BONITA
    }
  };

  // --- FUNCIONES ADMIN ---
  const toggleProducto = (id) => setProductos(productos.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  const cambiarPrecioProducto = (id, nuevoPrecio) => setProductos(productos.map(p => p.id === id ? { ...p, precio: parseInt(nuevoPrecio) || 0 } : p));
  const toggleSabor = (prodId, saborNombre) => setProductos(productos.map(p => p.id === prodId && p.opciones ? { ...p, opciones: p.opciones.map(o => o.nombre === saborNombre ? { ...o, disponible: !o.disponible } : o) } : p));
  const toggleTamano = (prodId, tamNombre) => setProductos(productos.map(p => p.id === prodId && p.tamanos ? { ...p, tamanos: p.tamanos.map(t => t.nombre === tamNombre ? { ...t, disponible: !t.disponible } : t) } : p));
  const cambiarPrecioTamano = (prodId, tamNombre, nuevoPrecio) => setProductos(productos.map(p => p.id === prodId && p.tamanos ? { ...p, tamanos: p.tamanos.map(t => t.nombre === tamNombre ? { ...t, precio: parseInt(nuevoPrecio) || 0 } : t) } : p));
  const toggleExtraArroz = (id) => setExtrasArroz(extrasArroz.map(e => e.id === id ? { ...e, disponible: !e.disponible } : e));
  const cambiarPrecioExtraArroz = (id, nuevoPrecio) => setExtrasArroz(extrasArroz.map(e => e.id === id ? { ...e, precio: parseInt(nuevoPrecio) || 0 } : e));
  const toggleSalsa = (nombre) => setSalsas(salsas.map(s => s.nombre === nombre ? { ...s, disponible: !s.disponible } : s));

  // --- FUNCIONES CLIENTE ---
  const manejarSalsa = (salsaObj) => {
    if (!tiendaAbierta || !salsaObj || !salsaObj.disponible) return;
    setSalsasElegidas(prev => prev.includes(salsaObj.nombre) ? prev.filter(s => s !== salsaObj.nombre) : [...prev, salsaObj.nombre]);
  };

  const sumarCantidad = (id) => setCantidades({ ...cantidades, [id]: (cantidades[id] || 1) + 1 });
  const restarCantidad = (id) => {
    const actual = cantidades[id] || 1;
    if (actual > 1) setCantidades({ ...cantidades, [id]: actual - 1 });
  };

  const manejarInputCantidad = (id, valor) => {
    if (valor === "") { setCantidades({ ...cantidades, [id]: "" }); return; }
    const num = parseInt(valor);
    if (!isNaN(num) && num > 0) setCantidades({ ...cantidades, [id]: num });
  };

  const corregirInputVacio = (id) => {
    if (!cantidades[id] || cantidades[id] < 1) setCantidades({ ...cantidades, [id]: 1 });
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("El local está cerrado actualmente.");
    
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    let sabor = "";
    let detallesExtra = "";

    if (p.opciones) {
      sabor = sabores[p.id];
      if (!sabor) return toast.error(`Por favor elige un sabor para: ${p.nombre}`);
    }

    if (p.esArroz) {
      if (!acompañanteArroz) return toast.error("Por favor elige Tajadas o Yuca");
      const huevoExtra = extrasArroz.find(e => e.id === 'huevo');
      if (conHuevo && huevoExtra) precioBase += huevoExtra.precio;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})`;
    }

    if (p.esJugo && p.tamanos) {
      const tamNombre = tamanosJugo[p.id];
      if (!tamNombre) return toast.error("Por favor elige el tamaño del jugo");
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
    setCantidades({...cantidades, [p.id]: 1});
    
    toast.success(`${cant}x ${p.nombre} agregado!`); // ✅ NOTIFICACIÓN DE ÉXITO AL AÑADIR
  };

  // ✅ NUEVO: BOTÓN PARA VACIAR TODO EL CARRITO DE GOLPE
  const vaciarCarrito = () => {
    if(window.confirm("¿Seguro que deseas vaciar todo el pedido?")) {
      setPedido([]);
      toast.success("Carrito vaciado");
    }
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return toast.error("El carrito está vacío");
    if (!nombre || !direccion || !metodoPago) return toast.error("Faltan datos de envío");
    
    const listaFritos = pedido.map(i => `- ${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}`).join('\n');
    
    // Agregamos la hora para que el Mono sepa exactamente cuándo pidieron
    const horaActual = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const idPedido = Math.floor(Math.random() * 10000); 
    
    const mensaje = `¡Hola! Pedido Fritos El Mono:\n\n*ID:* #${idPedido}\n*Hora:* ${horaActual}\n\n${listaFritos}\n\n🧂 Salsas: ${salsasElegidas.join(', ') || 'Ninguna'}\n\n*Total: $${total.toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  // ==========================================
  // 🟢 VISTA ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    return (
      <AdminPanel 
        setIsAdmin={setIsAdmin}
        tiendaAbierta={tiendaAbierta}
        setTiendaAbierta={setTiendaAbierta}
        productos={productos}
        toggleProducto={toggleProducto}
        cambiarPrecioProducto={cambiarPrecioProducto}
        toggleSabor={toggleSabor}
        toggleTamano={toggleTamano}
        cambiarPrecioTamano={cambiarPrecioTamano}
        extrasArroz={extrasArroz}
        toggleExtraArroz={toggleExtraArroz}
        cambiarPrecioExtraArroz={cambiarPrecioExtraArroz}
        salsas={salsas}
        toggleSalsa={toggleSalsa}
      />
    );
  }
  // ==========================================
  // 🔵 VISTA CLIENTE
  // ==========================================
  const tajadaObj = extrasArroz.find(e => e.id === 'tajada') || { disponible: false, precio: 0 };
  const yucaObj = extrasArroz.find(e => e.id === 'yuca') || { disponible: false, precio: 0 };
  const huevoObj = extrasArroz.find(e => e.id === 'huevo') || { disponible: false, precio: 1000 };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', color: MONO_TEXTO, paddingBottom: '60px' }}>
      <Toaster position="bottom-center" /> {/* ✅ Componente base para los Toast del cliente */}
      
     <Header accesoSecreto={accesoSecreto} tipoArrozHoy={tipoArrozHoy} />
      {!tiendaAbierta && (
        <div style={{ maxWidth: '800px', margin: '0 auto 30px', background: '#fee2e2', color: '#b91c1c', padding: '20px', borderRadius: '20px', textAlign: 'center', fontWeight: 'bold', border: '2px solid #ef4444' }}>
          🔴 Actualmente estamos cerrados. ¡Vuelve pronto a hacer tu pedido!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', opacity: tiendaAbierta ? 1 : 0.6 }}>
        {productos.map(p => (
          <ProductCard 
            key={p.id}
            p={p}
            tiendaAbierta={tiendaAbierta}
            hoveredCardId={hoveredCardId}
            setHoveredCardId={setHoveredCardId}
            tamanosJugo={tamanosJugo}
            setTamanosJugo={setTamanosJugo}
            sabores={sabores}
            setSabores={setSabores}
            acompañanteArroz={acompañanteArroz}
            setAcompañanteArroz={setAcompañanteArroz}
            conHuevo={conHuevo}
            setConHuevo={setConHuevo}
            cantidades={cantidades}
            sumarCantidad={sumarCantidad}
            restarCantidad={restarCantidad}
            manejarInputCantidad={manejarInputCantidad}
            corregirInputVacio={corregirInputVacio}
            agregarAlCarrito={agregarAlCarrito}
            tajadaObj={tajadaObj}
            yucaObj={yucaObj}
            huevoObj={huevoObj}
          />
        ))}
      </div>

      {tiendaAbierta && (
        <div style={{ maxWidth: '850px', margin: '40px auto', background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: MONO_NARANJA, margin: '0 0 25px 0', fontSize: '26px', fontWeight: '900' }}>🧂 ¿Qué salsas deseas?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {salsas.map(salsaObj => {
              const seleccionada = salsasElegidas.includes(salsaObj.nombre);
              const agotada = !salsaObj.disponible;
              return (
                <button key={salsaObj.nombre} onClick={() => manejarSalsa(salsaObj)} disabled={agotada} style={{ padding: '14px 28px', borderRadius: '40px', fontSize: '17px', border: 'none', cursor: agotada ? 'not-allowed' : 'pointer', background: seleccionada ? MONO_NARANJA : (agotada ? '#f0f0f0' : MONO_AMARILLO), color: seleccionada ? 'white' : (agotada ? '#bbb' : MONO_TEXTO), fontWeight: seleccionada ? 'bold' : 'normal', transition: 'all 0.2s', boxShadow: seleccionada ? '0 5px 12px rgba(249, 115, 22, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)', transform: seleccionada ? 'scale(1.08)' : 'scale(1)', textDecoration: agotada ? 'line-through' : 'none' }}>
                  {seleccionada ? `✓ ${salsaObj.nombre}` : salsaObj.nombre} {agotada ? "🚫" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {pedido.length > 0 && tiendaAbierta && (
        <a href="#carrito_seccion" style={{ position: 'fixed', bottom: '25px', right: '25px', background: MONO_TEXTO, color: 'white', padding: '18px 30px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 8px 25px rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px' }}>
          🛒 Mi Pedido <span style={{ background: MONO_NARANJA, borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pedido.reduce((acc, item) => acc + item.cantidad, 0)}</span>
        </a>
      )}

      {pedido.length > 0 && tiendaAbierta && (
        <Carrito 
        pedido={pedido} 
        setPedido={setPedido} 
        total={total} 
        vaciarCarrito={vaciarCarrito} 
        nombre={nombre} 
        setNombre={setNombre} 
        direccion={direccion} 
        setDireccion={setDireccion} 
        metodoPago={metodoPago} 
        setMetodoPago={setMetodoPago} 
        enviarWhatsApp={enviarWhatsApp} 
      />
      )}

      <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '15px', borderTop: '1px solid #eee', background: 'white' }}>
        <p style={{ margin: 0, fontWeight: '600' }}>
          📍 Carepa, Antioquia | Hecho con ❤️ para los clientes de El Mono
        </p>
      </footer>
    </div>
  );
}