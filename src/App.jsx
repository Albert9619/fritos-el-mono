import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';

// 🎨 COLORES
const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_TEXTO = "#333333";
const [categoriaActiva, setCategoriaActiva] = useState("fritos");

const productosBase = [
  // FRITOS
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.png", disponible: true, categoria: "fritos" },
  
  // BEBIDAS (Nuevas)
  { id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.png", disponible: true, categoria: "bebidas", opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: 9, nombre: "Gaseosa 350ml", precio: 2500, imagen: "/gaseosa.png", disponible: true, categoria: "bebidas", opciones: [{ nombre: "Coca-Cola", disponible: true }, { nombre: "Postobón", disponible: true }] },
  { id: 10, nombre: "Agua Mineral", precio: 2000, imagen: "/agua.png", disponible: true, categoria: "bebidas" },

  // ARROCES
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, imagen: "/arroz-pollo.png", disponible: true, categoria: "arroces" },
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 }
];

const salsasBase = [
  { nombre: "Pique", disponible: true, imagen: "/pique.png" },
  { nombre: "Salsa Roja", disponible: true, imagen: "/salsa-roja.png" },
  { nombre: "Salsa Rosada", disponible: true, imagen: "/salsa-rosada.png" },
  { nombre: "Suero", disponible: true, imagen: "/suero.png" },
  { nombre: "Suero Picante", disponible: true, imagen: "/suero-picante.png" }
];

export default function App() {
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

  const toggleProducto = (id) => setProductos(p => p.map(x => x.id === id ? { ...x, disponible: !x.disponible } : x));
  const cambiarPrecioProducto = (id, n) => setProductos(p => p.map(x => x.id === id ? { ...x, precio: parseInt(n) || 0 } : x));
  const toggleSalsa = (nom) => setSalsas(s => s.map(x => x.nombre === nom ? { ...x, disponible: !x.disponible } : x));
  const toggleExtraArroz = (id) => setExtrasArroz(e => e.map(x => x.id === id ? { ...x, disponible: !x.disponible } : x));

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Local cerrado");
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    
    if (p.esJugo) {
      const tamElegido = tamanosJugo[p.id] || p.tamanos[0].nombre;
      precioBase = p.tamanos.find(t => t.nombre === tamElegido).precio;
    }
    if (p.esArroz) {
      if (!acompañanteArroz) return toast.error("Elige Tajada o Yuca");
      if (conHuevo) precioBase += 1000;
    }

    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioBase, saborElegido: sabores[p.id] || "", detallesArroz: p.esArroz ? `(${acompañanteArroz})` : "", cantidad: cant, subtotal: precioBase * cant }]);
    toast.success("🥟 ¡Añadido!");
  };

  const enviarWhatsApp = () => {
    const total = pedido.reduce((acc, i) => acc + i.subtotal, 0);
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.saborElegido}`).join('\n');
    const msg = `Pedido Fritos El Mono:\n${lista}\nSalsas: ${salsasElegidas.join(', ')}\nTotal: $${total}\nCliente: ${nombre}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  if (isAdmin) return <AdminPanel setIsAdmin={setIsAdmin} tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta} productos={productos} toggleProducto={toggleProducto} cambiarPrecioProducto={cambiarPrecioProducto} salsas={salsas} toggleSalsa={toggleSalsa} extrasArroz={extrasArroz} toggleExtraArroz={toggleExtraArroz} />;

  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '100px' }}>
      <Toaster position="top-center" />
      <Header accesoSecreto={() => { const p = window.prompt("PIN:"); if (p === "mono2026") setIsAdmin(true); }} tipoArrozHoy={tipoArrozHoy} />
      
     <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
  
  {/* 🗂️ SELECTOR DE PESTAÑAS (Categorías) */}
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    gap: '12px', 
    marginBottom: '35px',
    flexWrap: 'wrap'
  }}>
    {["fritos", "bebidas", "arroces"].map(cat => (
      <button
        key={cat}
        onClick={() => setCategoriaActiva(cat)}
        style={{
          padding: '12px 25px',
          borderRadius: '50px',
          border: `2px solid ${MONO_NARANJA}`,
          cursor: 'pointer',
          textTransform: 'capitalize',
          fontWeight: '900',
          fontSize: '16px',
          transition: '0.3s',
          background: categoriaActiva === cat ? MONO_NARANJA : 'white',
          color: categoriaActiva === cat ? 'white' : MONO_NARANJA,
          boxShadow: categoriaActiva === cat ? '0 4px 15px rgba(249, 115, 22, 0.3)' : 'none'
        }}
      >
        {cat} {cat === "fritos" ? "🥟" : cat === "bebidas" ? "🥤" : "🍛"}
      </button>
    ))}
  </div>

  {/* 🛒 GRILLA DE PRODUCTOS (Filtrada) */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
    {productos
      .filter(p => p.categoria === categoriaActiva) // <--- Solo muestra lo de la pestaña elegida
      .map(p => (
        <ProductCard 
          key={p.id} p={p} tiendaAbierta={tiendaAbierta} hoveredCardId={hoveredCardId} setHoveredCardId={setHoveredCardId}
          tamanosJugo={tamanosJugo} setTamanosJugo={setTamanosJugo} sabores={sabores} setSabores={setSabores}
          acompañanteArroz={acompañanteArroz} setAcompañanteArroz={setAcompañanteArroz} conHuevo={conHuevo} setConHuevo={setConHuevo}
          cantidades={cantidades} sumarCantidad={(id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1})}
          restarCantidad={(id) => setCantidades({...cantidades, [id]: Math.max(1, (cantidades[id] || 1) - 1)})}
          manejarInputCantidad={(id, v) => setCantidades({...cantidades, [id]: v === "" ? "" : parseInt(v)})}
          corregirInputVacio={(id) => { if (!cantidades[id]) setCantidades({...cantidades, [id]: 1}); }}
          agregarAlCarrito={() => agregarAlCarrito(p)}
          tajadaObj={extrasArroz.find(e => e.id === 'tajada')} yucaObj={extrasArroz.find(e => e.id === 'yuca')} huevoObj={extrasArroz.find(e => e.id === 'huevo')}
        />
      ))}
  </div>

  {/* --- SECCIÓN DE SALSAS (Siempre visible abajo) --- */}
  <div style={{ maxWidth: '850px', margin: '40px auto', background: 'white', padding: '35px', borderRadius: '35px', border: `1px solid ${MONO_AMARILLO}`, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
    <h3 style={{ color: MONO_NARANJA, textAlign: 'center', fontSize: '28px', fontWeight: '900', marginBottom: '25px' }}>🧂 ¿Qué salsas deseas?</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
      {salsas.map(s => (
        <button 
          key={s.nombre} 
          onClick={() => {
            if (!s.disponible) return;
            setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])
          }} 
          disabled={!s.disponible} 
          style={{ 
            padding: '15px 25px', 
            borderRadius: '50px', 
            border: 'none', 
            cursor: s.disponible ? 'pointer' : 'not-allowed', 
            background: salsasElegidas.includes(s.nombre) ? MONO_NARANJA : (s.disponible ? MONO_AMARILLO : '#f0f0f0'), 
            color: salsasElegidas.includes(s.nombre) ? 'white' : (s.disponible ? MONO_TEXTO : '#bbb'), 
            fontWeight: 'bold', 
            transition: '0.3s',
            fontSize: '18px'
          }}>
          {salsasElegidas.includes(s.nombre) && "✓ "} {s.nombre}
          {!s.disponible && "🚫"}
        </button>
      ))}
    </div>
  </div>
</main>

      {pedido.length > 0 && (
        <Carrito 
          pedido={pedido} setPedido={setPedido} total={pedido.reduce((acc, i) => acc + i.subtotal, 0)}
          nombre={nombre} setNombre={setNombre} direccion={direccion} setDireccion={setDireccion}
          metodoPago={metodoPago} setMetodoPago={setMetodoPago} enviarWhatsApp={enviarWhatsApp}
          vaciarCarrito={() => setPedido([])}
        />
      )}
    </div>
  );
}