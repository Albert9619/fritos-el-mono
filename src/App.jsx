import React, { useState, useEffect } from 'react';
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
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.png", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.png", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.png", disponible: true },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.png", disponible: true },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.png", disponible: true },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.png", disponible: true },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, imagen: "/arroz.png", disponible: true },
  { id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.png", disponible: true, opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] }
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

  // --- FUNCIONES ADMIN ---
  const toggleProducto = (id) => setProductos(prev => prev.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  const cambiarPrecioProducto = (id, n) => setProductos(prev => prev.map(p => p.id === id ? { ...p, precio: parseInt(n) || 0 } : p));
  const toggleSabor = (pId, sNom) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, opciones: p.opciones.map(o => o.nombre === sNom ? { ...o, disponible: !o.disponible } : o) } : p));
  const toggleTamano = (pId, tNom) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, tamanos: p.tamanos.map(t => t.nombre === tNom ? { ...t, disponible: !t.disponible } : t) } : p));
  const cambiarPrecioTamano = (pId, tNom, n) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, tamanos: p.tamanos.map(t => t.nombre === tNom ? { ...t, precio: parseInt(n) || 0 } : t) } : p));
  const toggleExtraArroz = (id) => setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, disponible: !e.disponible } : e));
  const cambiarPrecioExtraArroz = (id, n) => setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, precio: parseInt(n) || 0 } : e));
  const toggleSalsa = (nom) => setSalsas(prev => prev.map(s => s.nombre === nom ? { ...s, disponible: !s.disponible } : s));

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Cerrado");
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    let sabor = sabores[p.id] || "";
    let detallesExtra = "";

    if (p.opciones && !sabor) return toast.error(`Elige sabor`);
    if (p.esJugo) {
      const tamElegido = tamanosJugo[p.id] || p.tamanos[0].nombre;
      const tamObj = p.tamanos.find(t => t.nombre === tamElegido);
      precioBase = tamObj ? tamObj.precio : 0;
      detallesExtra = `(${tamElegido})`;
    }
    if (p.esArroz) {
      if (!acompañanteArroz) return toast.error("Elige acompañante");
      if (conHuevo) precioBase += 1000;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})`;
    }

    setPedido(prev => [...prev, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioBase, saborElegido: sabor, detallesArroz: detallesExtra, cantidad: cant, subtotal: precioBase * cant }]);
    toast.success("🥟 ¡Añadido!");
  };

  const enviarWhatsApp = () => {
    const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.saborElegido} ${i.detallesArroz}`).join('\n');
    const msg = `Pedido Fritos El Mono:\n\n${lista}\n\nSalsas: ${salsasElegidas.join(', ') || 'Ninguna'}\nTotal: $${total.toLocaleString('es-CO')}\n\nCliente: ${nombre}\nDir: ${direccion}\nPago: ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  if (isAdmin) return (
    <AdminPanel 
      setIsAdmin={setIsAdmin} tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta}
      productos={productos} toggleProducto={toggleProducto} cambiarPrecioProducto={cambiarPrecioProducto}
      toggleSabor={toggleSabor} toggleTamano={toggleTamano} cambiarPrecioTamano={cambiarPrecioTamano}
      extrasArroz={extrasArroz} toggleExtraArroz={toggleExtraArroz} cambiarPrecioExtraArroz={cambiarPrecioExtraArroz}
      salsas={salsas} toggleSalsa={toggleSalsa}
    />
  );

  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '100px' }}>
      <Toaster position="top-center" />
      <Header accesoSecreto={() => { const p = window.prompt("PIN:"); if (p === "mono2026") setIsAdmin(true); }} tipoArrozHoy={tipoArrozHoy} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* GRILLA DE PRODUCTOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {productos.map(p => (
            <ProductCard 
              key={p.id} p={p} tiendaAbierta={tiendaAbierta}
              hoveredCardId={hoveredCardId} setHoveredCardId={setHoveredCardId}
              tamanosJugo={tamanosJugo} setTamanosJugo={setTamanosJugo}
              sabores={sabores} setSabores={setSabores}
              acompañanteArroz={acompañanteArroz} setAcompañanteArroz={setAcompañanteArroz}
              conHuevo={conHuevo} setConHuevo={setConHuevo}
              cantidades={cantidades}
              sumarCantidad={(id) => setCantidades(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }))}
              restarCantidad={(id) => setCantidades(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) - 1) }))}
              manejarInputCantidad={(id, v) => setCantidades(prev => ({ ...prev, [id]: v === "" ? "" : parseInt(v) }))}
              corregirInputVacio={(id) => { if (!cantidades[id]) setCantidades(prev => ({ ...prev, [id]: 1 })); }}
              agregarAlCarrito={() => agregarAlCarrito(p)}
              tajadaObj={extrasArroz.find(e => e.id === 'tajada')}
              yucaObj={extrasArroz.find(e => e.id === 'yuca')}
              huevoObj={extrasArroz.find(e => e.id === 'huevo')}
            />
          ))}
        </div>

      {/* --- SECCIÓN DE SALSAS PREMIUM (FOTOS GRANDES) --- */}
<div style={{ 
  maxWidth: '900px', 
  margin: '50px auto', 
  background: 'white', 
  padding: '40px', 
  borderRadius: '35px', 
  border: `1px solid ${MONO_AMARILLO}`, 
  boxShadow: '0 15px 35px rgba(0,0,0,0.08)' 
}}>
  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
    <h3 style={{ color: MONO_NARANJA, margin: 0, fontSize: '32px', fontWeight: '900' }}>
      🧂 ¿Qué salsas deseas?
    </h3>
    <p style={{ color: '#666', fontSize: '18px', marginTop: '5px' }}>Dale el toque final de sabor a tu pedido</p>
  </div>

  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', // <--- Diseño en grilla moderna
    gap: '20px', 
    justifyContent: 'center' 
  }}>
    {salsas.map(s => {
      const seleccionada = salsasElegidas.includes(s.nombre);
      const agotada = !s.disponible;
      
      return (
        <button 
          key={s.nombre} 
          onClick={() => {
            if (agotada) return;
            setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])
          }} 
          disabled={agotada} 
          style={{ 
            display: 'flex',
            flexDirection: 'column', // <--- Imagen arriba, texto abajo
            alignItems: 'center',
            padding: '15px', 
            borderRadius: '20px', 
            border: seleccionada ? `3px solid ${MONO_NARANJA}` : `2px solid #eee`, 
            cursor: agotada ? 'not-allowed' : 'pointer', 
            background: seleccionada ? MONO_AMARILLO : 'white', // <--- Fondo amarillo clarito al elegir
            color: MONO_TEXTO,
            fontWeight: 'bold', 
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: seleccionada ? '0 10px 20px rgba(249, 115, 22, 0.15)' : '0 5px 10px rgba(0,0,0,0.03)',
            transform: seleccionada ? 'translateY(-5px)' : 'translateY(0)'
          }}>
          
          {/* 📸 Imagen de la salsa ¡AHORA GRANDE! */}
          <img 
            src={s.imagen} 
            alt={s.nombre} 
            style={{ 
              width: '100px', // <--- De 25px a 100px. ¡4 veces más grande!
              height: '100px', 
              borderRadius: '15px', 
              objectFit: 'cover', 
              marginBottom: '10px',
              filter: s.disponible ? 'none' : 'grayscale(1)' 
            }} 
          />
          
          <span style={{ fontSize: '16px', textAlign: 'center' }}>{s.nombre}</span>
          
          {/* Indicador de selección visual */}
          {seleccionada && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: MONO_NARANJA, color: 'white', width: '25px', height: '25px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
              ✓
            </div>
          )}

          {agotada && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
              🚫
            </div>
          )}
        </button>
      );
    })}
  </div>
</div>
      {pedido.length > 0 && (
        <Carrito 
          pedido={pedido} setPedido={setPedido} total={pedido.reduce((acc, item) => acc + item.subtotal, 0)}
          nombre={nombre} setNombre={setNombre} direccion={direccion} setDireccion={setDireccion}
          metodoPago={metodoPago} setMetodoPago={setMetodoPago} enviarWhatsApp={enviarWhatsApp}
          vaciarCarrito={() => { if(window.confirm("¿Vaciar?")) setPedido([]); }}
        />
      )}
    </div>
  );
}