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
  // FRITOS
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.png", disponible: true, categoria: "fritos" },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.png", disponible: true, categoria: "fritos" },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.png", disponible: true, categoria: "fritos" },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.png", disponible: true, categoria: "fritos" },
  
  // BEBIDAS
  { id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.png", disponible: true, categoria: "bebidas", opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },

  // DESAYUNOS
  { id: 12, nombre: "Desayuno Tradicional", precio: 8000, esDesayuno: true, tipo: "tradicional", imagen: "/desayuno-huevo.png", disponible: true, categoria: "desayunos" },
  { id: 13, nombre: "Desayuno Especial", precio: 10000, esDesayuno: true, tipo: "especial", imagen: "/desayuno-carne.png", disponible: true, categoria: "desayunos" }
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
  const [salsas, setSalsas] = useState(salsasBase);
  const [pedido, setPedido] = useState([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [sabores, setSabores] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [opcionesDesayuno, setOpcionesDesayuno] = useState({}); // Nuevo para desayunos
  const [salsasElegidas, setSalsasElegidas] = useState([]);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState("fritos");

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Cerrado");
    const cant = cantidades[p.id] || 1;
    let precioFinal = p.precio || 0;
    let detalleTxt = "";

    if (p.esJugo) {
      const tam = p.tamanos.find(t => t.nombre === (tamanosJugo[p.id] || "Pequeño"));
      precioFinal = tam.precio;
    }
    
    if (p.esDesayuno) {
      const opt = opcionesDesayuno[p.id] || {};
      if (!opt.acompañante || !opt.jugo || (p.tipo === 'tradicional' && !opt.huevo) || (p.tipo === 'especial' && !opt.proteina)) {
        return toast.error("Completa las opciones del desayuno");
      }
      detalleTxt = `(${opt.acompañante} + ${opt.huevo || opt.proteina} + Jugo ${opt.jugo} + Queso)`;
    }

    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioFinal, saborElegido: sabores[p.id] || "", detallesExtra: detalleTxt, cantidad: cant, subtotal: precioFinal * cant }]);
    toast.success("🍳 ¡Añadido!");
  };

  const enviarWhatsApp = () => {
    const total = pedido.reduce((acc, i) => acc + i.subtotal, 0);
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.saborElegido} ${i.detallesExtra}`).join('\n');
    const msg = `Pedido Fritos El Mono:\n${lista}\nSalsas: ${salsasElegidas.join(', ')}\nTotal: $${total.toLocaleString('es-CO')}\nCliente: ${nombre}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  if (isAdmin) return <AdminPanel setIsAdmin={setIsAdmin} tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta} productos={productos} setProductos={setProductos} salsas={salsas} />;

  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '100px' }}>
      <Toaster position="top-center" />
      <Header accesoSecreto={() => { const p = window.prompt("PIN:"); if (p === "mono2026") setIsAdmin(true); }} tipoArrozHoy={tipoArrozHoy} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* PESTAÑAS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {["fritos", "bebidas", "desayunos"].map(cat => (
            <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '10px 20px', borderRadius: '50px', border: `2px solid ${MONO_NARANJA}`, background: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_NARANJA, fontWeight: 'bold', cursor: 'pointer', textTransform: 'capitalize' }}>
              {cat} {cat === "desayunos" ? "🍳" : ""}
            </button>
          ))}
        </div>

        {/* PRODUCTOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {productos.filter(p => p.categoria === categoriaActiva).map(p => (
            <ProductCard 
              key={p.id} p={p} tiendaAbierta={tiendaAbierta} hoveredCardId={hoveredCardId} setHoveredCardId={setHoveredCardId}
              tamanosJugo={tamanosJugo} setTamanosJugo={setTamanosJugo} sabores={sabores} setSabores={setSabores}
              opcionesDesayuno={opcionesDesayuno} setOpcionesDesayuno={setOpcionesDesayuno}
              cantidades={cantidades} sumarCantidad={(id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1})}
              restarCantidad={(id) => setCantidades({...cantidades, [id]: Math.max(1, (cantidades[id] || 1) - 1)})}
              manejarInputCantidad={(id, v) => setCantidades({...cantidades, [id]: v === "" ? "" : parseInt(v)})}
              corregirInputVacio={(id) => { if (!cantidades[id]) setCantidades({...cantidades, [id]: 1}); }}
              agregarAlCarrito={() => agregarAlCarrito(p)}
            />
          ))}
        </div>

        {/* SALSAS */}
        <div style={{ maxWidth: '850px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '30px', border: `1px solid ${MONO_AMARILLO}` }}>
          <h3 style={{ textAlign: 'center', color: MONO_NARANJA, fontWeight: '900' }}>🧂 Salsas</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            {salsas.map(s => (
              <button key={s.nombre} onClick={() => setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', borderRadius: '50px', border: 'none', background: salsasElegidas.includes(s.nombre) ? MONO_NARANJA : MONO_AMARILLO, color: salsasElegidas.includes(s.nombre) ? 'white' : MONO_TEXTO, fontWeight: 'bold', cursor: 'pointer' }}>
                <img src={s.imagen} style={{ width: '20px', height: '20px', borderRadius: '50%' }} alt={s.nombre} /> {s.nombre}
              </button>
            ))}
          </div>
        </div>
      </main>

      {pedido.length > 0 && (
        <Carrito pedido={pedido} total={pedido.reduce((acc, i) => acc + i.subtotal, 0)} nombre={nombre} setNombre={setNombre} direccion={direccion} setDireccion={setDireccion} metodoPago={metodoPago} setMetodoPago={setMetodoPago} enviarWhatsApp={enviarWhatsApp} vaciarCarrito={() => setPedido([])} />
      )}
    </div>
  );
}