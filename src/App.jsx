import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Importación de tus componentes locales
import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';

// --- DATOS INICIALES ---
const productosBase = [
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg", disponible: true },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg", disponible: true },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.jpg", disponible: true },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.jpg", disponible: true },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, disponible: true },
  { id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.jpg", disponible: true, opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] }
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

export default function App() {
  // --- ESTADOS ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState(productosBase);
  const [extrasArroz, setExtrasArroz] = useState(extrasArrozBase);
  const [salsas, setSalsas] = useState(salsasBase);
  
  const [pedido, setPedido] = useState([]);
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

  // --- FUNCIONES ADMIN (Los botones que no te funcionaban) ---
  const toggleProducto = (id) => setProductos(prev => prev.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  const cambiarPrecioProducto = (id, nuevo) => setProductos(prev => prev.map(p => p.id === id ? { ...p, precio: parseInt(nuevo) || 0 } : p));
  
  const toggleSabor = (pId, sNom) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, opciones: p.opciones.map(o => o.nombre === sNom ? { ...o, disponible: !o.disponible } : o) } : p));
  const toggleTamano = (pId, tNom) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, tamanos: p.tamanos.map(t => t.nombre === tNom ? { ...t, disponible: !t.disponible } : t) } : p));
  const cambiarPrecioTamano = (pId, tNom, nuevo) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, tamanos: p.tamanos.map(t => t.nombre === tNom ? { ...t, precio: parseInt(nuevo) || 0 } : t) } : p));

  const toggleExtraArroz = (id) => setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, disponible: !e.disponible } : e));
  const cambiarPrecioExtraArroz = (id, nuevo) => setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, precio: parseInt(nuevo) || 0 } : e));
  const toggleSalsa = (nom) => setSalsas(prev => prev.map(s => s.nombre === nom ? { ...s, disponible: !s.disponible } : s));

  // --- FUNCIONES CLIENTE (Lógica de cantidades e inputs) ---
  const sumarCantidad = (id) => setCantidades({ ...cantidades, [id]: (cantidades[id] || 1) + 1 });
  const restarCantidad = (id) => {
    const act = cantidades[id] || 1;
    if (act > 1) setCantidades({ ...cantidades, [id]: act - 1 });
  };
  const manejarInputCantidad = (id, val) => {
    if (val === "") { setCantidades({ ...cantidades, [id]: "" }); return; }
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) setCantidades({ ...cantidades, [id]: num });
  };
  const corregirInputVacio = (id) => { if (!cantidades[id]) setCantidades({ ...cantidades, [id]: 1 }); };

  const agregarAlCarrito = (p) => {
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    let sabor = sabores[p.id] || "";
    let detallesExtra = "";

    if (p.opciones && !sabor) return toast.error("Elige un sabor");
    if (p.esJugo) {
      if (!tamanosJugo[p.id]) return toast.error("Elige tamaño");
      precioBase = p.tamanos.find(t => t.nombre === tamanosJugo[p.id]).precio;
      detallesExtra = `(${tamanosJugo[p.id]})`;
    }
    if (p.esArroz) {
      if (!acompañanteArroz) return toast.error("Elige Tajada o Yuca");
      if (conHuevo) precioBase += 1000;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})`;
    }

    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioBase, saborElegido: sabor, detallesArroz: detallesExtra, cantidad: cant, subtotal: precioBase * cant }]);
    toast.success("¡Añadido!");
  };

  const enviarWhatsApp = () => {
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.saborElegido} ${i.detallesArroz}`).join('\n');
    const msg = `Pedido Fritos El Mono:\n${lista}\nTotal: $${pedido.reduce((a, b) => a + b.subtotal, 0)}\nCli: ${nombre}\nDir: ${direccion}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  // --- RENDER ---
  if (isAdmin) {
    return (
      <AdminPanel 
        setIsAdmin={setIsAdmin} tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta}
        productos={productos} toggleProducto={toggleProducto} cambiarPrecioProducto={cambiarPrecioProducto}
        toggleSabor={toggleSabor} toggleTamano={toggleTamano} cambiarPrecioTamano={cambiarPrecioTamano}
        extrasArroz={extrasArroz} toggleExtraArroz={toggleExtraArroz} cambiarPrecioExtraArroz={cambiarPrecioExtraArroz}
        salsas={salsas} toggleSalsa={toggleSalsa}
      />
    );
  }

  return (
    <div style={{ backgroundColor: '#fffbeb', minHeight: '100vh' }}>
      <Toaster position="top-center" />
      <Header accesoSecreto={() => { const p = window.prompt("PIN:"); if (p === "mono2026") setIsAdmin(true); }} tipoArrozHoy={tipoArrozHoy} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
        {productos.map(p => (
          <ProductCard 
            key={p.id} p={p} tiendaAbierta={tiendaAbierta}
            hoveredCardId={hoveredCardId} setHoveredCardId={setHoveredCardId}
            tamanosJugo={tamanosJugo} setTamanosJugo={setTamanosJugo}
            sabores={sabores} setSabores={setSabores}
            acompañanteArroz={acompañanteArroz} setAcompañanteArroz={setAcompañanteArroz}
            conHuevo={conHuevo} setConHuevo={setConHuevo}
            cantidades={cantidades} sumarCantidad={sumarCantidad} restarCantidad={restarCantidad}
            manejarInputCantidad={manejarInputCantidad} corregirInputVacio={corregirInputVacio}
            agregarAlCarrito={agregarAlCarrito}
            tajadaObj={extrasArroz.find(e => e.id === 'tajada')}
            yucaObj={extrasArroz.find(e => e.id === 'yuca')}
            huevoObj={extrasArroz.find(e => e.id === 'huevo')}
          />
        ))}
      </main>

      {/* SALSAS CLIENTE */}
      <div style={{ maxWidth: '850px', margin: '20px auto', background: 'white', padding: '20px', borderRadius: '20px' }}>
        <h3>Salsas:</h3>
        {salsas.map(s => (
          <button key={s.nombre} onClick={() => setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])} disabled={!s.disponible} style={{ margin: '5px', padding: '10px', borderRadius: '10px', border: 'none', background: salsasElegidas.includes(s.nombre) ? '#f97316' : '#fef3c7', cursor: s.disponible ? 'pointer' : 'not-allowed' }}>
            {s.nombre} {!s.disponible && "🚫"}
          </button>
        ))}
      </div>

      {pedido.length > 0 && (
        <Carrito 
          pedido={pedido} setPedido={setPedido} total={pedido.reduce((a, b) => a + b.subtotal, 0)}
          nombre={nombre} setNombre={setNombre} direccion={direccion} setDireccion={setDireccion}
          metodoPago={metodoPago} setMetodoPago={setMetodoPago} enviarWhatsApp={enviarWhatsApp}
          vaciarCarrito={() => setPedido([])}
        />
      )}
    </div>
  );
}