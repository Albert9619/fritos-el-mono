import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 

// Importamos tus piezas (asegúrate de que los nombres coincidan con tus archivos)
import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard'; 
import AdminPanel from './components/AdminPanel';

// ==========================================
// 🔴 DATOS BASE (Los de Fritos El Mono)
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

export default function App() {
  // --- ESTADOS ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState(productosBase);
  const [extrasArroz, setExtrasArroz] = useState(extrasArrozBase);
  const [salsas, setSalsas] = useState(salsasBase);
  const [pedido, setPedido] = useState([]);
  
  // Estados de selección (Lo que pedías: sabores, tamaños, etc.)
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
    if (!tiendaAbierta) return toast.error("Cerrado actualmente");
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    
    // Si es jugo, buscamos el precio del tamaño elegido
    if (p.esJugo && tamanosJugo[p.id]) {
      const tamObj = p.tamanos.find(t => t.nombre === tamanosJugo[p.id]);
      if (tamObj) precioBase = tamObj.precio;
    }

    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: p.nombre,
      precioUnitario: precioBase,
      cantidad: cant,
      subtotal: precioBase * cant,
      saborElegido: sabores[p.id] || ""
    }]);
    toast.success("¡Agregado!");
  };

  // --- OBJETOS DE APOYO PARA EL ARROZ ---
  const tajadaObj = extrasArroz.find(e => e.id === 'tajada') || { disponible: false };
  const yucaObj = extrasArroz.find(e => e.id === 'yuca') || { disponible: false };
  const huevoObj = extrasArroz.find(e => e.id === 'huevo') || { disponible: false, precio: 1000 };

  // ==========================================
  // 🟢 VISTA ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    return (
      <AdminPanel 
        setIsAdmin={setIsAdmin} 
        tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta}
        productos={productos} setProductos={setProductos}
        extrasArroz={extrasArroz} setExtrasArroz={setExtrasArroz}
        salsas={salsas} setSalsas={setSalsas}
      />
    );
  }

  // ==========================================
  // 🔵 VISTA CLIENTE
  // ==========================================
  return (
    <div style={{ backgroundColor: '#fffbeb', minHeight: '100vh', paddingBottom: '60px' }}>
      <Toaster position="bottom-center" />
      
      <Header accesoSecreto={accesoSecreto} tipoArrozHoy={tipoArrozHoy} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {productos.map(p => (
          <ProductCard 
            key={p.id} 
            p={p} 
            tiendaAbierta={tiendaAbierta}
            hoveredCardId={hoveredCardId} setHoveredCardId={setHoveredCardId}
            cantidades={cantidades}
            sumarCantidad={(id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1})}
            restarCantidad={(id) => setCantidades({...cantidades, [id]: Math.max(1, (cantidades[id] || 1) - 1)})}
            sabores={sabores} setSabores={setSabores}
            tamanosJugo={tamanosJugo} setTamanosJugo={setTamanosJugo}
            acompañanteArroz={acompañanteArroz} setAcompañanteArroz={setAcompañanteArroz}
            conHuevo={conHuevo} setConHuevo={setConHuevo}
            agregarAlCarrito={agregarAlCarrito}
            tajadaObj={tajadaObj} yucaObj={yucaObj} huevoObj={huevoObj}
          />
        ))}
      </div>

      {pedido.length > 0 && (
        <Carrito pedido={pedido} setPedido={setPedido} total={pedido.reduce((acc, i) => acc + i.subtotal, 0)} />
      )}
    </div>
  );
}