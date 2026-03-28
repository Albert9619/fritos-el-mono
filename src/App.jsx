import React, { useState, useEffect } from 'react';

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

const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

export default function App() {
  // ==========================================
  // ⚙️ ESTADOS
  // ==========================================
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

  // --- ACCESO SEGURO ---
  const accesoSecreto = () => {
    const clave = window.prompt("🔐 Ingresa el PIN:");
    if (clave === "mono2026") {
      setIsAdmin(true);
    } else if (clave !== null) {
      alert("❌ PIN incorrecto.");
    }
  };

  // --- FUNCIONES ADMIN ---
  const toggleProducto = (id) => setProductos(productos.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  const cambiarPrecioProducto = (id, nuevoPrecio) => setProductos(productos.map(p => p.id === id ? { ...p, precio: parseInt(nuevoPrecio) || 0 } : p));
  
  const toggleSabor = (prodId, saborNombre) => {
    setProductos(productos.map(p => p.id === prodId && p.opciones ? { ...p, opciones: p.opciones.map(o => o.nombre === saborNombre ? { ...o, disponible: !o.disponible } : o) } : p));
  };

  // --- FUNCIONES CLIENTE ---
  const manejarSalsa = (salsaObj) => {
    if (!tiendaAbierta || !salsaObj || !salsaObj.disponible) return;
    setSalsasElegidas(prev => prev.includes(salsaObj.nombre) ? prev.filter(s => s !== salsaObj.nombre) : [...prev, salsaObj.nombre]);
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return alert("El local está cerrado.");
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    let sabor = sabores[p.id] || "";

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
      saborElegido: sabor
    }]);
    
    // Reset temporal
    setCantidades({...cantidades, [p.id]: 1});
    alert("✅ Agregado al pedido");
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  // ==========================================
  // 🟢 VISTA ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    const MiniSwitch = ({ activo, onClick }) => (
      <div onClick={onClick} style={{ width: '40px', height: '22px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
        <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '21px' : '3px', transition: '0.3s' }} />
      </div>
    );

    return (
      <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <button onClick={() => setIsAdmin(false)} style={{ marginBottom: '20px', padding: '10px 15px', borderRadius: '10px', border: 'none', background: MONO_TEXTO, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
            ← Volver a la Tienda
          </button>
          <div style={{ background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
            <h1 style={{ color: MONO_NARANJA, margin: '0 0 10px 0' }}>Panel de Control ⚙️</h1>
            <button onClick={() => setTiendaAbierta(!tiendaAbierta)} style={{ background: MONO_TEXTO, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              {tiendaAbierta ? 'Cerrar Negocio' : 'Abrir Negocio'}
            </button>
          </div>
          {/* Aquí iría el resto de tu lista de productos para el admin */}
          <div style={{ background: 'white', borderRadius: '25px', padding: '20px' }}>
             {productos.map(p => (
               <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                 <span>{p.nombre}</span>
                 <MiniSwitch activo={p.disponible} onClick={() => toggleProducto(p.id)} />
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🔵 VISTA CLIENTE
  // ==========================================
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', color: MONO_TEXTO, paddingBottom: '60px' }}>
      <header style={{ textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '25px', borderTop: `5px solid ${MONO_NARANJA}` }}>
          <h1 onDoubleClick={accesoSecreto} style={{ color: MONO_NARANJA, margin: 0, fontSize: '36px', fontWeight: '900', cursor: 'pointer', userSelect: 'none' }}>
            Fritos El Mono 🐒
          </h1>
          <p>Hoy Arroz de <span style={{ color: MONO_NARANJA }}>{tipoArrozHoy}</span></p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {productos.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '28px', padding: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: 0 }}>{p.nombre}</h3>
            <p style={{ color: MONO_NARANJA, fontWeight: '900', fontSize: '24px' }}>${(p.precio || 0).toLocaleString('es-CO')}</p>
            <button 
              disabled={!p.disponible || !tiendaAbierta}
              onClick={() => agregarAlCarrito(p)}
              style={{ width: '100%', padding: '12px', background: p.disponible ? MONO_NARANJA : '#ccc', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {p.disponible ? 'Añadir al Pedido 🥟' : 'AGOTADO'}
            </button>
          </div>
        ))}
      </div>

      {pedido.length > 0 && (
        <div style={{ position: 'fixed', bottom: '25px', right: '25px', background: MONO_TEXTO, color: 'white', padding: '15px 25px', borderRadius: '50px' }}>
          🛒 Pedido: {pedido.length} | Total: ${total.toLocaleString('es-CO')}
        </div>
      )}
    </div>
  );
}