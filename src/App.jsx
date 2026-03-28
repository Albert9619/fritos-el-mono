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
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, imagen: "/arroz-pollo.png", disponible: true },
  { id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.png", disponible: true, opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 }
];

// --- En App.jsx ---

const salsasBase = [
  { nombre: "🔥 Pique", disponible: true },
  { nombre: "🍅 Salsa Roja", disponible: true },
  { nombre: "🍥 Salsa Rosada", disponible: true },
  { nombre: "🥛 Suero", disponible: true },
  { nombre: "🌶️ Suero Picante", disponible: true }
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

  const toggleProducto = (id) => setProductos(prev => prev.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  const cambiarPrecioProducto = (id, n) => setProductos(prev => prev.map(p => p.id === id ? { ...p, precio: parseInt(n) || 0 } : p));
  const toggleSabor = (pId, sNom) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, opciones: p.opciones.map(o => o.nombre === sNom ? { ...o, disponible: !o.disponible } : o) } : p));
  const toggleTamano = (pId, tNom) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, tamanos: p.tamanos.map(t => t.nombre === tNom ? { ...t, disponible: !t.disponible } : t) } : p));
  const cambiarPrecioTamano = (pId, tNom, n) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, tamanos: p.tamanos.map(t => t.nombre === tNom ? { ...t, precio: parseInt(n) || 0 } : t) } : p));
  const toggleExtraArroz = (id) => setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, disponible: !e.disponible } : e));
  const cambiarPrecioExtraArroz = (id, n) => setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, precio: parseInt(n) || 0 } : e));
  const toggleSalsa = (nom) => setSalsas(prev => prev.map(s => s.nombre === nom ? { ...s, disponible: !s.disponible } : s));

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Local cerrado");
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    let sabor = sabores[p.id] || "";
    let detallesExtra = "";

    if (p.opciones && !sabor) return toast.error(`Elige el sabor`);
    if (p.esJugo) {
      const tamElegido = tamanosJugo[p.id] || p.tamanos[0].nombre;
      const tamObj = p.tamanos.find(t => t.nombre === tamElegido);
      precioBase = tamObj ? tamObj.precio : 0;
      detallesExtra = `(${tamElegido})`;
    }
    if (p.esArroz) {
      if (!acompañanteArroz) return toast.error("Elige Tajada o Yuca");
      if (conHuevo) precioBase += 1000;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})`;
    }

    setPedido(prev => [...prev, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioBase, saborElegido: sabor, detallesArroz: detallesExtra, cantidad: cant, subtotal: precioBase * cant }]);
    toast.success("🥟 ¡Al pedido!");
  };

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return toast.error("Carrito vacío");
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

        <div style={{ maxWidth: '850px', margin: '40px auto', background: 'white', padding: '35px', borderRadius: '35px', border: `1px solid ${MONO_AMARILLO}` }}>
          <h3 style={{ color: MONO_NARANJA, textAlign: 'center', fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>🧂 Salsas</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {salsas.map(s => (
              <button key={s.nombre} onClick={() => setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])} disabled={!s.disponible} 
                style={{ padding: '14px 28px', borderRadius: '50px', border: 'none', cursor: s.disponible ? 'pointer' : 'not-allowed', background: salsasElegidas.includes(s.nombre) ? MONO_NARANJA : (s.disponible ? MONO_AMARILLO : '#f0f0f0'), color: salsasElegidas.includes(s.nombre) ? 'white' : (s.disponible ? MONO_TEXTO : '#bbb'), fontWeight: 'bold' }}>
                {salsasElegidas.includes(s.nombre) && "✓ "} {s.nombre} {!s.disponible && "🚫"}
              </button>
            ))}
          </div>
        </div>
      </main>

      {pedido.length > 0 && (
        <Carrito 
          pedido={pedido} setPedido={setPedido} total={pedido.reduce((acc, item) => acc + item.subtotal, 0)}
          nombre={nombre} setNombre={setNombre} direccion={direccion} setDireccion={setDireccion}
          metodoPago={metodoPago} setMetodoPago={setMetodoPago} enviarWhatsApp={enviarWhatsApp}
          vaciarCarrito={() => { if(window.confirm("¿Vaciar pedido?")) setPedido([]); }}
        />
      )}
    </div>
  );
}