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

// --- 📋 DATOS INICIALES ---
const productosBase = [
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: 2, nombre: "Papa Rellena", precio: 2500, imagen: "/papa-rellena.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: 3, nombre: "Pastel de Pollo", precio: 2500, imagen: "/pastel-pollo.png", disponible: true, categoria: "fritos" },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.png", disponible: true, categoria: "fritos" },
  { id: 7, nombre: "Palitos de Queso", precio: 2000, imagen: "/palito-queso.png", disponible: true, categoria: "fritos" },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.png", disponible: true, categoria: "fritos" },
  { id: 10, nombre: "Agua Cielo 620 mL", precio: 2000, imagen: "/agua.png", disponible: true, categoria: "bebidas" },
  { id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.png", disponible: true, categoria: "bebidas", opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: 11, nombre: "Coca-Cola", esJugo: true, precio: 0, imagen: "/cocacola.png", disponible: true, categoria: "bebidas", tamanos: [{ nombre: "Mini 250 mL", precio: 2000, disponible: true }, { nombre: "Personal 400 mL", precio: 3500, disponible: true }, { nombre: "Mediana 1.5 L", precio: 6500, disponible: true }] },
  { id: 14, nombre: "Pony Malta", esJugo: true, precio: 0, imagen: "/malta.png", disponible: true, categoria: "bebidas", tamanos: [{ nombre: "Mini 250 mL", precio: 2000, disponible: true }, { nombre: "Personal 400 mL", precio: 3500, disponible: true }] },
  { id: 12, nombre: "Desayuno Tradicional", precio: 8000, esDesayuno: true, tipo: "tradicional", imagen: "/desayuno-huevo.png", disponible: true, categoria: "desayunos" },
  { id: 13, nombre: "Desayuno Especial", precio: 10000, esDesayuno: true, tipo: "especial", imagen: "/desayuno-carne.png", disponible: true, categoria: "desayunos" },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, imagen: "/arroz-pollo.png", disponible: true, categoria: "arroces" }
];

const salsasBase = [
  { nombre: "Pique", disponible: true, imagen: "/pique.png" },
  { nombre: "Salsa Roja", disponible: true, imagen: "/salsa-roja.png" },
  { nombre: "Salsa Rosada", disponible: true, imagen: "/salsa-rosada.png" },
  { nombre: "Suero", disponible: true, imagen: "/suero.png" },
  { nombre: "Suero Picante", disponible: true, imagen: "/suero-picante.png" }
];

const extrasArrozBase = [
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Queso Extra", disponible: true, precio: 1000 }
];

export default function App() {
  const [productos, setProductos] = useState(() => {
    const g = localStorage.getItem('productos_mono');
    return g ? JSON.parse(g) : productosBase;
  });
  const [salsas, setSalsas] = useState(() => {
    const g = localStorage.getItem('salsas_mono');
    return g ? JSON.parse(g) : salsasBase;
  });
  const [extrasArroz, setExtrasArroz] = useState(() => {
    const g = localStorage.getItem('extras_mono');
    return g ? JSON.parse(g) : extrasArrozBase;
  });

  useEffect(() => { localStorage.setItem('productos_mono', JSON.stringify(productos)); }, [productos]);
  useEffect(() => { localStorage.setItem('salsas_mono', JSON.stringify(salsas)); }, [salsas]);
  useEffect(() => { localStorage.setItem('extras_mono', JSON.stringify(extrasArroz)); }, [extrasArroz]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [pedido, setPedido] = useState([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [sabores, setSabores] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [opcionesDesayuno, setOpcionesDesayuno] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);
  const [conQueso, setConQueso] = useState(false);
  const [salsasElegidas, setSalsasElegidas] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("fritos");

  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const hoy = dias[new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // --- 🔌 FUNCIONES ADMIN ---
  const toggleProducto = (id) => setProductos(prev => prev.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  const cambiarPrecioProducto = (id, n) => setProductos(prev => prev.map(p => p.id === id ? { ...p, precio: parseInt(n) || 0 } : p));
  const toggleSalsa = (nom) => setSalsas(prev => prev.map(s => s.nombre === nom ? { ...s, disponible: !s.disponible } : s));
  const toggleExtraArroz = (id) => setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, disponible: !e.disponible } : e));
  const cambiarPrecioExtraArroz = (id, n) => setExtrasArroz(prev => prev.map(e => e.id === id ? { ...e, precio: parseInt(n) || 0 } : e));
  const toggleSabor = (pId, saborNom) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, opciones: (p.opciones || []).map(o => o.nombre === saborNom ? { ...o, disponible: !o.disponible } : o) } : p));
  const toggleTamano = (pId, tamNom) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, tamanos: (p.tamanos || []).map(t => t.nombre === tamNom ? { ...t, disponible: !t.disponible } : t) } : p));
  const cambiarPrecioTamano = (pId, tamNom, n) => setProductos(prev => prev.map(p => p.id === pId ? { ...p, tamanos: (p.tamanos || []).map(t => t.nombre === tamNom ? { ...t, precio: parseInt(n) || 0 } : t) } : p));

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Cerrado");
    const cant = cantidades[p.id] || 1;
    let precioFinal = p.precio || 0;
    let det = "";
    if (p.tamanos) {
      const tam = p.tamanos.find(t => t.nombre === (tamanosJugo[p.id] || p.tamanos[0].nombre));
      precioFinal = tam?.precio || 0;
    }
    if (p.esDesayuno) {
      const opt = opcionesDesayuno[p.id] || {};
      if (!opt.acompañante || !opt.jugo) return toast.error("Elige las opciones");
      det = `(${opt.acompañante} + ${opt.huevo || opt.proteina || ''} + Jugo ${opt.jugo} + Queso)`;
    }
    if (p.esArroz) {
      if (!acompañanteArroz) return toast.error("Elige Tajada o Yuca");
      if (conHuevo) precioFinal += 1000;
      if (conQueso) precioFinal += 1000;
      det = `(${acompañanteArroz}${conHuevo ? '+Huevo' : ''}${conQueso ? '+Queso' : ''})`;
    }
    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioFinal, saborElegido: sabores[p.id] || "", detallesExtra: det, cantidad: cant, subtotal: precioFinal * cant }]);
    toast.success("🛒 ¡Añadido!");
  };

  if (isAdmin) return <AdminPanel setIsAdmin={setIsAdmin} tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta} productos={productos} toggleProducto={toggleProducto} cambiarPrecioProducto={cambiarPrecioProducto} toggleSabor={toggleSabor} toggleTamano={toggleTamano} cambiarPrecioTamano={cambiarPrecioTamano} extrasArroz={extrasArroz} toggleExtraArroz={toggleExtraArroz} cambiarPrecioExtraArroz={cambiarPrecioExtraArroz} salsas={salsas} toggleSalsa={toggleSalsa} />;

  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '100px' }}>
      <Toaster position="top-center" />
      <Header accesoSecreto={() => { const pin = window.prompt("PIN:"); if (pin === "mono2026") setIsAdmin(true); }} tipoArrozHoy={tipoArrozHoy} />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {["fritos", "bebidas", "desayunos", "arroces"].map(cat => (
            <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '10px 22px', borderRadius: '50px', border: `2px solid ${MONO_NARANJA}`, background: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_NARANJA, fontWeight: '900', cursor: 'pointer', textTransform: 'capitalize' }}>{cat}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {productos.filter(p => p.categoria === categoriaActiva).map(p => (
            <ProductCard key={p.id} p={p} tiendaAbierta={tiendaAbierta} hoveredCardId={null} setHoveredCardId={() => {}} tamanosJugo={tamanosJugo} setTamanosJugo={setTamanosJugo} sabores={sabores} setSabores={setSabores} opcionesDesayuno={opcionesDesayuno} setOpcionesDesayuno={setOpcionesDesayuno} acompañanteArroz={acompañanteArroz} setAcompañanteArroz={setAcompañanteArroz} conHuevo={conHuevo} setConHuevo={setConHuevo} conQueso={conQueso} setConQueso={setConQueso} cantidades={cantidades} sumarCantidad={(id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1})} restarCantidad={(id) => setCantidades({...cantidades, [id]: Math.max(1, (cantidades[id] || 1) - 1)})} agregarAlCarrito={() => agregarAlCarrito(p)} huevoObj={extrasArroz.find(e => e.id === 'huevo')} quesoObj={extrasArroz.find(e => e.id === 'queso')} />
          ))}
        </div>
        {/* --- 🧂 SECCIÓN SALSAS (RECUPERADA) --- */}
        <div style={{ maxWidth: '850px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '30px', border: `1px solid ${MONO_AMARILLO}` }}>
          <h3 style={{ textAlign: 'center', color: MONO_NARANJA, fontWeight: '900', fontSize: '28px', marginBottom: '20px' }}>🧂 ¿Qué salsas deseas?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {salsas.map(s => (
              <button key={s.nombre} onClick={() => setSalsasElegidas(prev => prev.includes(s.nombre) ? prev.filter(x => x !== s.nombre) : [...prev, s.nombre])} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '50px', border: 'none', background: salsasElegidas.includes(s.nombre) ? MONO_NARANJA : (s.disponible ? MONO_AMARILLO : '#f0f0f0'), color: salsasElegidas.includes(s.nombre) ? 'white' : (s.disponible ? MONO_TEXTO : '#aaa'), fontWeight: 'bold', cursor: s.disponible ? 'pointer' : 'not-allowed' }}>
                <img src={s.imagen} style={{ width: '22px', height: '22px', borderRadius: '50%' }} alt={s.nombre} /> {s.nombre} {!s.disponible && "🚫"}
              </button>
            ))}
          </div>
        </div>
      </main>
      {pedido.length > 0 && <Carrito pedido={pedido} total={pedido.reduce((acc, i) => acc + i.subtotal, 0)} nombre={nombre} setNombre={setNombre} direccion={direccion} setDireccion={setDireccion} metodoPago={metodoPago} setMetodoPago={setMetodoPago} vaciarCarrito={() => setPedido([])} />}
    </div>
  );
}