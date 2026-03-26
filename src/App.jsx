import React, { useState } from 'react';

// ==========================================
// 🔴 CONTROL DE INVENTARIO ( Carepa )
// ==========================================
// - ["Tajadas"] -> Bloquea solo tajadas en el arroz.
// - ["Yuca"] -> Bloquea solo yuca en el arroz.
// - ["Huevo Arroz"] -> Bloquea solo el huevo del arroz.
// - ["Suero"] -> Bloquea el Chip de Suero.
// - ["Empanada Crujiente Carne"] -> Bloquea solo ese sabor.
const agotados = ["Tajadas", "Huevo Arroz", "Suero"]; 

const productosBase = [
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, tieneSabor: true, opciones: ["Carne", "Pollo", "Arroz"], imagen: "/empanada.jpg" },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, tieneSabor: true, opciones: ["Carne", "Huevo"], imagen: "/papa-rellena.jpg" },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg" },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg" },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.jpg" },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.jpg" },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true },
  { 
    id: 6, 
    nombre: "Jugo Natural Helado", 
    esJugo: true, 
    tieneSabor: true, 
    opciones: ["Avena", "Maracuyá"], 
    precios: { "Pequeño": 1000, "Mediano": 1500, "Grande": 2000 },
    imagen: "/jugo-natural.jpg"
  }
];

const listadoSalsas = ["Pique", "Salsa Roja", "Salsa Rosada", "Suero", "Suero Picante"];

// ==========================================
// 🎨 PALETA DE COLORES "mono"
// ==========================================
const MONO_NARANJA = "#f97316"; // Naranja apetito
const MONO_AMARILLO = "#fef3c7"; // Amarillo suave arroz/chips
const MONO_CREMA = "#fffbeb";    // Fondo página
const MONO_VERDE = "#16a34a";   // Verde WhatsApp
const MONO_TEXTO = "#333333";

export default function App() {
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

  // Estado para efecto hover en tarjetas (Desktop)
  const [hoveredCardId, setHoveredCardId] = useState(null);

  const listaAgotadosLimpios = agotados.map(a => a.toLowerCase().trim());
  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // Manejar chip de salsa (alternar seleccion)
  const manejarSalsa = (salsa) => {
    const salsaLimpia = salsa.toLowerCase().trim();
    if (listaAgotadosLimpios.includes(salsaLimpia)) return; // No hacer nada si esta agotada
    setSalsasElegidas(prev => prev.includes(salsa) ? prev.filter(s => s !== salsa) : [...prev, salsa]);
  };

  const agregarAlCarrito = (p) => {
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
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos de envío");
    const listaFritos = pedido.map(i => `- ${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}`).join('\n');
    const mensaje = `¡Hola! Pedido Fritos El Mono (Carepa):\n\n${listaFritos}\n\n🧂 Salsas: ${salsasElegidas.join(', ') || 'Ninguna'}\n\n*Total: $${total.toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', padding: '15px 15px 100px 15px', color: MONO_TEXTO }}>
      
      {/* 1. HEADER MODERNO */}
      <header style={{ textAlign: 'center', background: 'white', padding: '30px', borderRadius: '30px', marginBottom: '25px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: `1px solid rgba(249, 115, 22, 0.1)` }}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '15px', objectFit: 'cover', border: `6px solid ${MONO_NARANJA}`, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
        <h1 style={{ color: MONO_NARANJA, margin: 0, fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>Fritos El Mono 🐒</h1>
        <p style={{ marginTop: '5px', fontSize: '18px' }}>Carepa - Hoy Arroz de <strong>{tipoArrozHoy}</strong></p>
      </header>

      {/* PRODUCTOS GRID (App Effect cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto' }}>
        {productosBase.map(p => {
          const todoAgotado = listaAgotadosLimpios.includes(p.nombre.toLowerCase().trim());
          const isHovered = hoveredCardId === p.id;

          return (
            <div 
              key={p.id} 
              onMouseEnter={() => setHoveredCardId(p.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              style={{ 
                background: 'white', 
                borderRadius: '24px', // ✅ Más redondeado
                padding: '0', 
                boxShadow: isHovered ? '0 20px 35px rgba(0,0,0,0.1)' : '0 10px 20px rgba(0,0,0,0.05)', // ✅ Sombra sutil
                position: 'relative', 
                overflow: 'hidden', 
                transition: 'transform 0.3s ease, box-shadow 0.3s ease', // ✅ Micro-interaccion hover
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                border: isHovered ? `2px solid ${MONO_NARANJA}` : `2px solid transparent`, // ✅ Resaltado hover
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <img src={p.esArroz ? "/arroz-pollo.jpg" : p.imagen} style={{ width: '100%', height: '200px', objectFit: 'cover', borderBottom: '1px solid #eee', filter: todoAgotado ? 'grayscale(1)' : 'none' }} alt={p.nombre} />
              
              {/* ✅ BADGE AGOTADO MEJORADO */}
              {todoAgotado && (
                <div style={{ position: 'absolute', top: '0', right: '0', background: 'rgba(239, 68, 68, 0.95)', color: 'white', padding: '10px 20px', borderRadius: '0 0 0 20px', fontWeight: '800', fontSize: '14px', letterSpacing: '1px' }}>AGOTADO 🚫</div>
              )}

              <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '700' }}>{p.nombre}</h3>
                
                {/* PRECIO RESALTADO */}
                <p style={{ color: MONO_NARANJA, fontWeight: '800', fontSize: '24px', margin: '0 0 20px 0', borderBottom: `2px dashed ${MONO_AMARILLO}`, paddingBottom: '10px' }}>
                  ${p.esJugo ? (p.precios[tamanosJugo[p.id] || "Mediano"]).toLocaleString('es-CO') : p.precio.toLocaleString('es-CO')}
                </p>
                
                {!todoAgotado && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: 'auto' }}>
                    
                    {/* ✅ MEJORA ARROZ: Jerarquía visual */}
                    {p.esArroz && (
                      <div style={{ background: MONO_AMARILLO, padding: '15px', borderRadius: '15px', border: `1px solid rgba(249, 115, 22, 0.2)` }}>
                        <select onChange={(e) => setAcompañanteArroz(e.target.value)} style={{width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: `1px solid rgba(0,0,0,0.1)`, fontSize: '16px' }}>
                          <option value="">¿Tajada o Yuca?</option>
                          <option value="Tajadas" disabled={listaAgotadosLimpios.includes("tajadas")}>Tajadas {listaAgotadosLimpios.includes("tajadas") ? "(🚫 AGOTADO)" : "😋"}</option>
                          <option value="Yuca" disabled={listaAgotadosLimpios.includes("yuca")}>Yuca {listaAgotadosLimpios.includes("yuca") ? "(🚫 AGOTADO)" : "😋"}</option>
                        </select>
                        
                        {listaAgotadosLimpios.includes("huevo arroz") || listaAgotadosLimpios.includes("huevo") ? (
                          <p style={{ color: 'red', fontSize: '14px', margin: 0, fontWeight: 'bold', textAlign: 'center' }}>🚫 Adición de Huevo Agotada</p>
                        ) : (
                          <label style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" style={{ accentColor: MONO_NARANJA, width: '20px', height: '20px' }} onChange={(e) => setConHuevo(e.target.checked)} /> + Huevo ($1.000)</label>
                        )}
                      </div>
                    )}

                    {/* SELECTS ESTILIZADOS */}
                    {p.tieneSabor && (
                      <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid rgba(0,0,0,0.1)`, fontSize: '16px' }}>
                        <option value="">-- Elige el Sabor --</option>
                        {p.opciones.map(opt => {
                          const productoYSabor = `${p.nombre.toLowerCase().trim()} ${opt.toLowerCase().trim()}`;
                          const saborAgotado = listaAgotadosLimpios.includes(opt.toLowerCase().trim()) || listaAgotadosLimpios.includes(productoYSabor);
                          return <option key={opt} value={opt} disabled={saborAgotado}>{opt} {saborAgotado ? "(🚫 AGOTADO)" : ""}</option>;
                        })}
                      </select>
                    )}
                    {p.esJugo && (
                      <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid rgba(0,0,0,0.1)`, fontSize: '16px' }}>
                        {Object.keys(p.precios).map(t => <option key={t} value={t}>{t} - ${p.precios[t].toLocaleString('es-CO')}</option>)}
                      </select>
                    )}

                    {/* CANTIDAD Y BOTÓN (Micro-interacciones) */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', background: '#f9f9f9', padding: '10px', borderRadius: '15px'}}>
                      <label style={{fontSize: '16px', fontWeight: 'bold'}}>Cant:</label>
                      <input type="number" min="1" defaultValue="1" onChange={(e) => setCantidades({...cantidades, [p.id]: parseInt(e.target.value) || 1})} style={{ width: '60px', padding: '10px', borderRadius: '10px', border: `1px solid #ddd`, textAlign: 'center', fontSize: '16px' }} />
                    </div>
                    <button 
                      onClick={() => agregarAlCarrito(p)} 
                      style={{ 
                        background: isHovered ? '#ff8c3a' : MONO_NARANJA, // Micro-interaccion color
                        color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'background 0.2s ease'
                      }}
                    >
                      Añadir al Pedido 🥟
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ 2. SALSAS CHIPS (Tappable pills) */}
      <div style={{ maxWidth: '800px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <h3 style={{ color: MONO_NARANJA, margin: '0 0 20px 0', fontSize: '24px', fontWeight: '800' }}>🧂 ¿Qué salsas deseas? <span style={{fontSize: '16px', color: '#666', fontWeight: 'normal'}}>(Gratis)</span></h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {listadoSalsas.map(s => {
            const salsaLimpia = s.toLowerCase().trim();
            const salsaAgotada = listaAgotadosLimpios.includes(salsaLimpia);
            const estaSeleccionada = salsasElegidas.includes(s);

            // Estilos del Chip según estado
            let bgChip = MONO_AMARILLO;
            let textChip = MONO_TEXTO;
            let borderChip = `2px solid transparent`;
            let cursorChip = 'pointer';
            let opacChip = 1;

            if (estaSeleccionada) {
              bgChip = MONO_NARANJA;
              textChip = 'white';
            }
            if (salsaAgotada) {
              bgChip = '#eee';
              textChip = '#aaa';
              cursorChip = 'not-allowed';
              opacChip = 0.6;
            }

            return (
              <button 
                key={s} 
                onClick={() => manejarSalsa(s)}
                disabled={salsaAgotada}
                style={{ 
                  padding: '12px 24px', 
                  background: bgChip, 
                  color: textChip,
                  borderRadius: '30px', // Chip circular
                  cursor: cursorChip, 
                  opacity: opacChip,
                  border: borderChip,
                  fontWeight: estaSeleccionada ? 'bold' : 'normal',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  boxShadow: estaSeleccionada ? '0 4px 8px rgba(249, 115, 22, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                  transform: estaSeleccionada ? 'scale(1.05)' : 'scale(1)',
                  textDecoration: salsaAgotada ? 'line-through' : 'none'
                }}
              >
                {estaSeleccionada ? `✓ ${s}` : s} {salsaAgotada ? "(🚫)" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ 3. BOTÓN FLOTANTE CARRITO */}
      {pedido.length > 0 && (
        <a 
          href="#carrito_seccion"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: MONO_TEXTO, // Contraste
            color: 'white',
            padding: '15px 25px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '16px'
          }}
        >
          🛒 Ver mi Pedido 
          <span style={{ background: MONO_NARANJA, borderRadius: '50%', width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
            {pedido.reduce((acc, item) => acc + item.cantidad, 0)}
          </span>
        </a>
      )}

      {/* CARRITO Y CONFIRMACIÓN */}
      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '700px', margin: '0 auto 100px', background: 'white', padding: '35px', borderRadius: '30px', border: `4px solid ${MONO_NARANJA}`, boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 25px 0', fontSize: '28px', fontWeight: '800' }}>🛒 Mi Pedido (Mono Fritos)</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '12px 0', alignItems: 'center' }}>
              <span style={{fontSize: '16px'}}><strong>{item.cantidad}x</strong> {item.nombre} <small style={{color: '#666', background: MONO_CREMA, padding: '2px 5px', borderRadius: '5px'}}>{item.saborElegido} {item.detallesArroz}</small></span>
              <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                <span style={{fontWeight: '800', fontSize: '18px'}}>${item.subtotal.toLocaleString('es-CO')}</span>
                <button onClick={() => setPedido(pedido.filter(i => i.idUnico !== item.idUnico))} style={{color: 'red', border: `1px solid #ffcccc`, background: '#fff5f5', cursor: 'pointer', fontWeight: 'bold', width: '30px', height: '30px', borderRadius: '50%'}}>X</button>
              </div>
            </div>
          ))}
          
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '32px', fontWeight: '800', marginTop: '25px', padding: '10px 0', borderTop: `2px dashed ${MONO_AMARILLO}` }}>
            Total: ${total.toLocaleString('es-CO')}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <input type="text" placeholder="Tu Nombre Completo" onChange={(e) => setNombre(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: `1px solid #ddd`, fontSize: '16px', background: MONO_CREMA }} />
            <input type="text" placeholder="Dirección Exacta en Carepa (Barrio / Referencia)" onChange={(e) => setDireccion(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: `1px solid #ddd`, fontSize: '16px', background: MONO_CREMA }} />
            <select onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: `1px solid #ddd`, fontSize: '16px', background: 'white' }}>
              <option value="">-- ¿Cómo pagas? --</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi (Mono)">Nequi (Mono)</option>
            </select>
            
            {/* ✅ MEJORA BOTÓN WA: Verde WhatsApp */}
            <button 
              onClick={enviarWhatsApp} 
              style={{ 
                background: MONO_VERDE, // Verde WA
                color: 'white', border: 'none', padding: '18px', borderRadius: '15px', fontWeight: '800', fontSize: '18px', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 5px 15px rgba(22, 163, 74, 0.3)'
              }}
              onMouseEnter={(e) => e.target.style.background = '#128c3e'}
              onMouseLeave={(e) => e.target.style.background = MONO_VERDE}
            >
              Pedir por WhatsApp al Mono 📲
            </button>
          </div>
        </div>
      )}
    </div>
  );
}