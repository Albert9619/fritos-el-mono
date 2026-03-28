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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {productos.map(p => (
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

        {/* --- SECCIÓN SALSAS GRANDES --- */}
        <div style={{ maxWidth: '900px', margin: '50px auto', background: 'white', padding: '40px', borderRadius: '35px', border: `1px solid ${MONO_AMARILLO}` }}>
          <h3 style={{ color: MONO_NARANJA, textAlign: 'center', fontSize: '32px', fontWeight: '900', marginBottom: '30px' }}>🧂 ¿Qué salsas deseas?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            {salsas.map(s => (
              <button key={s.nombre} onClick={() => setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])} disabled={!s.disponible} 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', borderRadius: '25px', border: salsasElegidas.includes(s.nombre) ? `3px solid ${MONO_NARANJA}` : `2px solid #f0f0f0`, background: salsasElegidas.includes(s.nombre) ? MONO_AMARILLO : 'white', cursor: s.disponible ? 'pointer' : 'not-allowed' }}>
                <img src={s.imagen} alt={s.nombre} style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', marginBottom: '15px', filter: s.disponible ? 'none' : 'grayscale(1)' }} />
                <span>{s.nombre}</span>
                {salsasElegidas.includes(s.nombre) && <div style={{ position: 'absolute', top: '10px', right: '10px', background: MONO_NARANJA, color: 'white', width: '25px', height: '25px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
                {!s.disponible && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🚫</div>}
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