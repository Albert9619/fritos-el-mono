import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 

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
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arrepa-huevo.jpg", disponible: true },
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
const MONO_TEXTO = "#333333";

export default function App() {
  // ⚙️ ESTADOS
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

  // --- FUNCIONES ---
  const accesoSecreto = () => {
    const clave = window.prompt("🔐 PIN:");
    if (clave === "mono2026") setIsAdmin(true);
  };

  const agregarAlCarrito = (p) => {
    const cant = cantidades[p.id] || 1;
    let precioFinal = p.precio;
    
    if (p.esJugo && tamanosJugo[p.id]) {
        const tam = p.tamanos.find(t => t.nombre === tamanosJugo[p.id]);
        if (tam) precioFinal = tam.precio;
    }

    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: p.nombre,
      precioUnitario: precioFinal,
      cantidad: cant,
      subtotal: precioFinal * cant
    }]);
    toast.success("¡Agregado!");
  };

  // 🔵 VISTA (Simplificada para evitar errores)
  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '100px' }}>
      <Toaster position="top-center" />
      <header style={{ textAlign: 'center', padding: '40px', background: 'white', borderBottom: `5px solid ${MONO_NARANJA}` }}>
        <h1 onDoubleClick={accesoSecreto} style={{ color: MONO_NARANJA, cursor: 'pointer', userSelect: 'none' }}>
          Fritos El Mono 🐒
        </h1>
        <p>Hoy Arroz de: <strong>{tipoArrozHoy}</strong></p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '40px auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '0 20px' }}>
        {productos.map(p => (
          <div key={p.id} style={{ background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <h3>{p.nombre}</h3>
            <p style={{ color: MONO_NARANJA, fontWeight: 'bold', fontSize: '20px' }}>${p.precio.toLocaleString()}</p>
            <button 
              onClick={() => agregarAlCarrito(p)}
              style={{ width: '100%', padding: '10px', background: MONO_NARANJA, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
            >
              Añadir al Pedido
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}