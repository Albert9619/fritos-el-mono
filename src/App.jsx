import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 

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
  // --- ESTADOS PRINCIPALES ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState(productosBase);
  const [extrasArroz, setExtrasArroz] = useState(extrasArrozBase);
  const [salsas, setSalsas] = useState(salsasBase);

  // --- ESTADOS DE SELECCIÓN ---
  const [pedido, setPedido] = useState([]);
  const [sabores, setSabores] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [salsasElegidas, setSalsasElegidas] = useState([]);
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);

  // --- LÓGICA DE ADMINISTRADOR (Botones de apagar/encender) ---
  const toggleProducto = (id) => {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  };

  const toggleSalsa = (nombre) => {
    setSalsas(prev => prev.map(s => s.nombre === nombre ? { ...s, disponible: !s.disponible } : s));
  };

  const toggleExtraArroz = (id) => {
    setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, disponible: !e.disponible } : e));
  };

  // --- LÓGICA DE CLIENTE ---
  const manejarSalsa = (nombre) => {
    setSalsasElegidas(prev => 
      prev.includes(nombre) ? prev.filter(s => s !== nombre) : [...prev, nombre]
    );
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta || !p.disponible) return toast.error("No disponible");
    const cant = cantidades[p.id] || 1;
    let precioFinal = p.precio || 0;

    if (p.esJugo && tamanosJugo[p.id]) {
      const tam = p.tamanos.find(t => t.nombre === tamanosJugo[p.id]);
      if (tam) precioFinal = tam.precio;
    }

    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: p.nombre,
      precioUnitario: precioBase,
      cantidad: cant,
      subtotal: precioFinal * cant,
      saborElegido: sabores[p.id] || ""
    }]);
    toast.success("¡Directo al pedido!");
  };

  // ==========================================
  // 🟢 VISTA ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    return (
      <AdminPanel 
        setIsAdmin={setIsAdmin}
        tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta}
        productos={productos} toggleProducto={toggleProducto}
        salsas={salsas} toggleSalsa={toggleSalsa}
        extrasArroz={extrasArroz} toggleExtraArroz={toggleExtraArroz}
      />
    );
  }

  // ==========================================
  // 🔵 VISTA CLIENTE
  // ==========================================
  return (
    <div style={{ backgroundColor: '#fffbeb', minHeight: '100vh', paddingBottom: '100px' }}>
      <Toaster position="bottom-center" />
      <Header accesoSecreto={() => {
        const pin = window.prompt("PIN:");
        if (pin === "mono2026") setIsAdmin(true);
      }} />

      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        {/* GRILLA DE PRODUCTOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {productos.map(p => (
            <ProductCard 
              key={p.id} p={p} tiendaAbierta={tiendaAbierta}
              cantidades={cantidades}
              sumarCantidad={(id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1})}
              restarCantidad={(id) => setCantidades({...cantidades, [id]: Math.max(1, (cantidades[id] || 1) - 1)})}
              sabores={sabores} setSabores={setSabores}
              tamanosJugo={tamanosJugo} setTamanosJugo={setTamanosJugo}
              acompañanteArroz={acompañanteArroz} setAcompañanteArroz={setAcompañanteArroz}
              conHuevo={conHuevo} setConHuevo={setConHuevo}
              agregarAlCarrito={() => agregarAlCarrito(p)}
              // Props para que no falle el arroz
              tajadaObj={extrasArroz.find(e => e.id === 'tajada')}
              yucaObj={extrasArroz.find(e => e.id === 'yuca')}
              huevoObj={extrasArroz.find(e => e.id === 'huevo')}
            />
          ))}
        </div>

        {/* SECCIÓN DE SALSAS */}
        <div style={{ marginTop: '50px', background: 'white', padding: '30px', borderRadius: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
          <h3>🧂 ¿Qué salsas quieres?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
            {salsas.map(s => (
              <button
                key={s.nombre}
                disabled={!s.disponible}
                onClick={() => manejarSalsa(s.nombre)}
                style={{
                  padding: '12px 20px', borderRadius: '20px', border: 'none',
                  background: salsasElegidas.includes(s.nombre) ? '#f97316' : (s.disponible ? '#fef3c7' : '#eee'),
                  color: salsasElegidas.includes(s.nombre) ? 'white' : (s.disponible ? '#333' : '#aaa'),
                  cursor: s.disponible ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                {s.nombre} {!s.disponible && "🚫"}
              </button>
            ))}
          </div>
        </div>
      </main>

      {pedido.length > 0 && (
        <Carrito pedido={pedido} setPedido={setPedido} total={pedido.reduce((acc, i) => acc + i.subtotal, 0)} />
      )}
    </div>
  );
}