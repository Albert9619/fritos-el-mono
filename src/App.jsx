import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';

// 🎨 COLORES DE MARCA
const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_TEXTO = "#333333";

// --- DATOS INICIALES CON IMÁGENES LOCALES (.png) ---
const productosBase = [
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.png", disponible: true, categoria: "fritos" },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.png", disponible: true, categoria: "fritos" },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.png", disponible: true, categoria: "fritos" },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.png", disponible: true, categoria: "fritos" },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, imagen: "/arroz-pollo.png", disponible: true, categoria: "arroces" },
  { id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.png", disponible: true, categoria: "bebidas", opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 }
];

// --- CORRECCIÓN DE SALSAS (.png) ---
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
  const [categoriaActiva, setCategoriaActiva] = useState("fritos");

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // --- FUNCIONES ADMIN ---
  const toggleProducto = (id) => setProductos(prev => prev.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  const cambiarPrecioProducto = (id, n) => setProductos(prev => prev.map(p => p.id === id ? { ...p, precio: parseInt(n) || 0 } : p));
  const toggleSalsa = (nom) => setSalsas(prev => prev.map(s => s.nombre === nom ? { ...s, disponible: !s.disponible } : s));
  const toggleExtraArroz = (id) => setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, disponible: !e.disponible } : e));

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Local cerrado");
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    
    if (p.esJugo) {
      const tamElegido = tamanosJugo[p.id] || p.tamanos[0].nombre;
      const tamObj = p.tamanos.find(t => t.nombre === tamElegido);
      precioBase = tamObj ? tamObj.precio : 0;
    }
    if (p.esArroz) {
      if (!acompañanteArroz) return toast.error("Elige acompañante");
      if (conHuevo) precioBase += 1000;
    }

    setPedido(prev => [...prev, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioBase, saborElegido: sabores[p.id] || "", detallesArroz: p.esArroz ? `(${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})` : "", cantidad: cant, subtotal: precioBase * cant }]);
    toast.success("🥟 ¡Al pedido!");
  };

  if (isAdmin) return <AdminPanel setIsAdmin={setIsAdmin} tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta} productos={productos} toggleProducto={toggleProducto} cambiarPrecioProducto={cambiarPrecioProducto} salsas={salsas} toggleSalsa={toggleSalsa} extrasArroz={extrasArroz} toggleExtraArroz={toggleExtraArroz} />;

  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '100px' }}>
      <Toaster position="top-center" />
      <Header accesoSecreto={() => { const p = window.prompt("PIN:"); if (p === "mono2026") setIsAdmin(true); }} tipoArrozHoy={tipoArrozHoy} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        {/* PESTAÑAS (Filtrado) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {["fritos", "bebidas", "arroces"].map(cat => (
            <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '50px', border: `2px solid ${MONO_NARANJA}`, background: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_NARANJA, fontWeight: 'bold', cursor: 'pointer', textTransform: 'capitalize' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* GRILLA (Filtrada) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {productos.filter(p => p.categoria === categoriaActiva).map(p => (
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

        {/* --- SECCIÓN SALSAS PREMIUM (CON FOTOS MINI REDONDAS) --- */}
        <div style={{ maxWidth: '850px', margin: '40px auto', background: 'white', padding: '35px', borderRadius: '35px', border: `1px solid ${MONO_AMARILLO}` }}>
          <h3 style={{ color: MONO_NARANJA, textAlign: 'center', fontSize: '28px', fontWeight: '900', marginBottom: '25px' }}>🧂 ¿Qué salsas deseas?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {salsas.map(s => (
              <button key={s.nombre} onClick={() => setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])} disabled={!s.disponible} 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '50px', border: 'none', background: salsasElegidas.includes(s.nombre) ? MONO_NARANJA : (s.disponible ? MONO_AMARILLO : '#f0f0f0'), color: salsasElegidas.includes(s.nombre) ? 'white' : (s.disponible ? MONO_TEXTO : '#bbb'), fontWeight: 'bold' }}>
                <img src={s.imagen} alt={s.nombre} style={{ width: '25px', height: '25px', borderRadius: '50%', objectFit: 'cover', filter: s.disponible ? 'none' : 'grayscale(1)' }} />
                {s.nombre}
                {!s.disponible && "🚫"}
              </button>
            ))}
          </div>
        </div>
      </main> {/* <--- ¡CORRECCIÓN AQUÍ! main en lugar de div */}

      {pedido.length > 0 && (
        <Carrito pedido={pedido} total={pedido.reduce((acc, i) => acc + i.subtotal, 0)} nombre={nombre} setNombre={setNombre} direccion={direccion} setDireccion={setDireccion} metodoPago={metodoPago} setMetodoPago={setMetodoPago} vaciarCarrito={() => { if(window.confirm("¿Vaciar?")) setPedido([]); }} />
      )}
    </div>
  );
}