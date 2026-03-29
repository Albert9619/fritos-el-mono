import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard';
import AdminPanel from './components/AdminPanel';

const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_TEXTO = "#333333";

const productosBase = [
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.png", disponible: true, categoria: "fritos" },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.png", disponible: true, categoria: "fritos" },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.png", disponible: true, categoria: "fritos" },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.png", disponible: true, categoria: "fritos" },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, imagen: "/arroz-pollo.png", disponible: true, categoria: "arroces" },
  { id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.png", disponible: true, categoria: "bebidas", opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: 10, nombre: "Gaseosa 350ml", precio: 2500, imagen: "/gaseosa.png", disponible: true, categoria: "bebidas" },
  { id: 11, nombre: "Agua Mineral", precio: 2000, imagen: "/agua.png", disponible: true, categoria: "bebidas" }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 }
];

const salsasBase = [
  { nombre: "🔥 Pique", disponible: true }, { nombre: "🍅 Salsa Roja", disponible: true }, { nombre: "🍥 Salsa Rosada", disponible: true }, { nombre: "🥛 Suero", disponible: true }, { nombre: "🌶️ Suero Picante", disponible: true }
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

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Cerrado");
    const cant = cantidades[p.id] || 1;
    let precioFinal = p.precio || 0;
    
    if (p.esJugo) {
      const tam = p.tamanos.find(t => t.nombre === (tamanosJugo[p.id] || "Pequeño"));
      precioFinal = tam.precio;
    }

    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioFinal, cantidad: cant, subtotal: precioFinal * cant }]);
    toast.success("Añadido");
  };

  if (isAdmin) return <AdminPanel setIsAdmin={setIsAdmin} tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta} productos={productos} setProductos={setProductos} salsas={salsas} extrasArroz={extrasArroz} />;

  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '100px' }}>
      <Toaster position="top-center" />
      <Header accesoSecreto={() => { const p = window.prompt("PIN:"); if (p === "mono2026") setIsAdmin(true); }} tipoArrozHoy={tipoArrozHoy} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        {/* PESTAÑAS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {["fritos", "bebidas", "arroces"].map(cat => (
            <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '10px 20px', borderRadius: '50px', border: `2px solid ${MONO_NARANJA}`, background: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_NARANJA, fontWeight: 'bold', cursor: 'pointer', textTransform: 'capitalize' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* GRILLA FILTRADA */}
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

        {/* SALSAS */}
        <div style={{ maxWidth: '850px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '30px', border: `1px solid ${MONO_AMARILLO}` }}>
          <h3 style={{ textAlign: 'center', color: MONO_NARANJA }}>🧂 Salsas</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {salsas.map(s => (
              <button key={s.nombre} onClick={() => setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', background: salsasElegidas.includes(s.nombre) ? MONO_NARANJA : MONO_AMARILLO, color: salsasElegidas.includes(s.nombre) ? 'white' : MONO_TEXTO, fontWeight: 'bold', cursor: 'pointer' }}>
                {s.nombre}
              </button>
            ))}
          </div>
        </div>
      </main>

      {pedido.length > 0 && (
        <Carrito pedido={pedido} total={pedido.reduce((acc, i) => acc + i.subtotal, 0)} nombre={nombre} setNombre={setNombre} direccion={direccion} setDireccion={setDireccion} metodoPago={metodoPago} setMetodoPago={setMetodoPago} vaciarCarrito={() => setPedido([])} />
      )}
    </div>
  );
}