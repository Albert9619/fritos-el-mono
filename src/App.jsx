import React, { useState, useEffect } from 'react';

// ==========================================
// 🔴 CONFIGURACIÓN DE COLORES
// ==========================================
const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

// Datos iniciales (Luego vendrán de la base de datos)
const productosIniciales = [
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, tieneSabor: true, opciones: ["Carne", "Pollo", "Arroz"], imagen: "/empanada.jpg", disponible: true },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, tieneSabor: true, opciones: ["Carne", "Huevo"], imagen: "/papa-rellena.jpg", disponible: true },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg", disponible: true },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg", disponible: true },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.jpg", disponible: true },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.jpg", disponible: true },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, disponible: true },
  { 
    id: 6, 
    nombre: "Jugo Natural Helado", 
    esJugo: true, 
    tieneSabor: true, 
    opciones: ["Avena", "Maracuyá"], 
    precios: { "Pequeño": 1000, "Mediano": 1500, "Grande": 2000 },
    imagen: "/jugo-natural.jpg",
    disponible: true
  }
];

export default function App() {
  // --- DETECTAR SI ES ADMIN POR LA URL (?admin=true) ---
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') setIsAdmin(true);
  }, []);

  // --- ESTADOS GLOBALES ---
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState(productosIniciales);
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

  // --- LÓGICA DE DÍA ---
  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // --- FUNCIONES ADMIN ---
  const toggleDisponibilidad = (id) => {
    setProductos(productos.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  };

  const cambiarPrecio = (id, nuevoPrecio) => {
    setProductos(productos.map(p => p.id === id ? { ...p, precio: parseInt(nuevoPrecio) || 0 } : p));
  };

  // --- FUNCIONES CLIENTE ---
  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta || !p.disponible) return;
    const cant = cantidades[p.id] || 1;
    const sabor = sabores[p.id] || (p.tieneSabor ? p.opciones[0] : "");
    let precioBase = p.precio;
    let detallesExtra = "";

    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Por favor elige Tajadas o Yuca");
      if (conHuevo) precioBase += 1000;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})`;
    }
    if (p.esJugo) {
      const tamano = tamanosJugo[p.id] || "Mediano";
      precioBase = p.precios[tamano];
    }

    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: p.nombre + (p.esJugo ? ` (${tamanosJugo[p.id] || "Mediano"})` : ""),
      precioUnitario: precioBase,
      saborElegido: sabor,
      detallesArroz: detallesExtra,
      cantidad: cant,
      subtotal: precioBase * cant
    }]);
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("El carrito está vacío");
    const listaFritos = pedido.map(i => `- ${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''}`).join('\n');
    const mensaje = `¡Hola! Pedido El Mono:\n\n${listaFritos}\n\n*Total: $${total}*\n👤 ${nombre}\n📍 ${direccion}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  // ==========================================
  // 🟢 VISTA DE ADMINISTRADOR (EL TABLERO)
  // ==========================================
  if (isAdmin) {
    return (
      <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <nav style={{ background: MONO_TEXTO, color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Dashboard El Mono 🐒</h2>
          <button onClick={() => window.location.href = '/'} style={{ background: MONO_NARANJA, border: 'none', color: 'white', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Ver como Cliente</button>
        </nav>

        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 15px' }}>
          
          {/* CARD DE ESTADO GLOBAL */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
            <h3 style={{ marginTop: 0 }}>Estado del Negocio</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', borderRadius: '15px', background: tiendaAbierta ? '#dcfce7' : '#fee2e2' }}>
              <div style={{ flexGrow: 1 }}>
                <strong style={{ fontSize: '18px' }}>{tiendaAbierta ? 'LOCAL ABIERTO' : 'LOCAL CERRADO'}</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>Si cierras el local, los clientes no podrán añadir productos al carrito.</p>
              </div>
              <button onClick={() => setTiendaAbierta(!tiendaAbierta)} style={{ background: MONO_TEXTO, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                {tiendaAbierta ? 'Cerrar Ahora' : 'Abrir Ahora'}
              </button>
            </div>
          </div>

          {/* LISTA DE PRODUCTOS - GESTIÓN DE PRECIOS Y STOCK */}
          <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #eee', background: '#fcfcfc' }}>
              <h3 style={{ margin: 0 }}>Gestión de Productos</h3>
            </div>
            {productos.map(p => (
              <div key={p.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: '20px', borderBottom: '1px solid #eee', gap: '15px' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <strong style={{ fontSize: '16px' }}>{p.nombre}</strong>
                </div>
                
                {/* PRECIO */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#888' }}>$</span>
                  <input 
                    type="number" 
                    value={p.precio || ""} 
                    onChange={(e) => cambiarPrecio(p.id, e.target.value)}
                    style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}
                  />
                </div>

                {/* SWITCH DISPONIBILIDAD */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: p.disponible ? MONO_VERDE : '#e11d48', fontWeight: 'bold' }}>{p.disponible ? 'HAY' : 'AGOTADO'}</span>
                  <div 
                    onClick={() => toggleDisponibilidad(p.id)}
                    style={{ width: '50px', height: '26px', backgroundColor: p.disponible ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                  >
                    <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: p.disponible ? '27px' : '3px', transition: '0.3s' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🔵 VISTA DE CLIENTE (LA VITRINA)
  // ==========================================
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', color: MONO_TEXTO, paddingBottom: '60px' }}>
      
      <header style={{ textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <img src="/logo-fritos-el-mono.jpg" alt="Banner" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
        <div style={{ padding: '25px' }}>
          <h1 style={{ color: MONO_NARANJA, margin: 0, fontSize: '32px' }}>Fritos El Mono 🐒</h1>
          <p>Hoy Arroz de <strong>{tipoArrozHoy}</strong></p>
        </div>
      </header>

      {/* AVISO DE CERRADO */}
      {!tiendaAbierta && (
        <div style={{ maxWidth: '600px', margin: '0 auto 20px', background: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '15px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #f87171' }}>
          🔴 Actualmente estamos cerrados. ¡Vuelve pronto!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto', padding: '0 20px', opacity: tiendaAbierta ? 1 : 0.6 }}>
        {productos.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', position: 'relative' }}>
            <img src={p.imagen || "/arroz-pollo.jpg"} style={{ width: '100%', height: '180px', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none' }} />
            {!p.disponible && <div style={{ position: 'absolute', top: 10, right: 10, background: 'red', color: 'white', padding: '5px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>AGOTADO</div>}
            
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin: 0 }}>{p.nombre}</h3>
              <p style={{ color: MONO_NARANJA, fontWeight: 'bold', fontSize: '20px' }}>${p.precio.toLocaleString()}</p>
              
              {p.disponible && tiendaAbierta && (
                <button onClick={() => agregarAlCarrito(p)} style={{ width: '100%', background: MONO_NARANJA, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>Añadir</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER - ACCESO ADMIN PARA TI */}
      <footer style={{ textAlign: 'center', marginTop: '50px', padding: '20px', color: '#aaa', fontSize: '12px' }}>
        <p>📍 Carepa, Antioquia</p>
        <a href="/?admin=true" style={{ color: '#ddd', textDecoration: 'none' }}>Acceso Panel</a>
      </footer>
    </div>
  );
}