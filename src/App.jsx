import React, { useState, useEffect } from 'react';

// 🔴 CONTROL DE INVENTARIO: Escribe el ID del producto agotado aquí
const agotados = [1,]; 

const productosBase = [
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, tieneSabor: true, opciones: ["Carne", "Pollo", "Arroz"], imagen: "/empanada.jpg" },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, tieneSabor: true, opciones: ["Carne", "Huevo"], imagen: "/papa-rellena.jpg" },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg" },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg" },
  { 
    id: 5, 
    nombre: "Arroz Especial del Día", 
    precio: 6000, 
    esArroz: true, 
    // La imagen se define dinámicamente en el componente
  },
  { 
    id: 6, 
    nombre: "Jugo Natural Helado", 
    esJugo: true, 
    tieneSabor: true, 
    opciones: ["Avena", "Maracuyá"], 
    precios: { "Pequeño": 1000, "Mediano": 1500, "Grande": 2000 },
    imagen: "/jugo-natural.jpg"
  },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.jpg" },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.jpg" }
];

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

  // Cargar Google Fonts (Montserrat)
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Lógica de fecha y arroz
  const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const hoy = diasSemana[new Date().getDay()];
  const esDiaPollo = ["lunes", "miércoles", "viernes"].includes(hoy);
  const tipoArrozHoy = esDiaPollo ? "Pollo" : "Cerdo";

  // Productos con imagen de arroz dinámica
  const productos = productosBase.map(p => {
    if (p.esArroz) {
      return { ...p, imagen: esDiaPollo ? "/arroz-pollo.jpg" : "/arroz-cerdo.jpg" };
    }
    return p;
  });

  const agregarAlCarrito = (p) => {
    if (agotados.includes(p.id)) return;
    const cant = cantidades[p.id] || 1;
    const sabor = sabores[p.id] || "";
    let precioFinal = p.precio;
    let nombreFinal = p.nombre;
    let detallesExtra = "";

    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Por favor elige si quieres Tajadas o Yuca con tu arroz");
      if (conHuevo) precioFinal += 1000;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})`;
    }

    if (p.esJugo) {
      const tamano = tamanosJugo[p.id];
      if (!tamano) return alert("Por favor elige el tamaño del jugo");
      precioFinal = p.precios[tamano];
      nombreFinal = `${p.nombre} (${tamano})`;
    }

    if (p.tieneSabor && !sabor) return alert("Por favor elige el sabor");

    setPedido([...pedido, {
      idUnico: Date.now(), // Para eliminar correctamente
      nombre: nombreFinal,
      precio: precioFinal,
      saborElegido: sabor,
      detallesArroz: detallesExtra,
      cantidad: cant,
      subtotal: precioFinal * cant
    }]);

    // Opcional: Resetear campos de arroz
    if (p.esArroz) {
      setAcompañanteArroz("");
      setConHuevo(false);
    }
  };

  const eliminarItem = (idUnico) => {
    setPedido(pedido.filter(item => item.idUnico !== idUnico));
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("Tu carrito está vacío. ¡Antójate de algo!");
    if (!nombre || !direccion || !metodoPago) return alert("Por favor completa: Nombre, Dirección y Método de pago");

    const lista = pedido.map(i => `- ${i.cantidad} ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}: $${i.subtotal.toLocaleString('es-CO')}`).join('\n');
    const mensajeCompleto = `¡Hola! Soy ${nombre}. Mi pedido para Fritos El Mono es:\n\n${lista}\n\n*Total a pagar: $${total.toLocaleString('es-CO')}*\n\n📍 *Dirección de entrega:* ${direccion}\n💰 *Método de pago:* ${metodoPago}\n\n¡Muchas gracias! 🐒🥟`;
    
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensajeCompleto)}`);
  };

  // Estilos comunes
  const fritosFont = { fontFamily: "'Montserrat', sans-serif" };
  const naranjaFritos = "#f97316"; // Naranja vibrante
  const cremaFritos = "#fffbeb"; // Fondo suave

  return (
    <div style={{ ...fritosFont, padding: '0', backgroundColor: cremaFritos, minHeight: '100vh', textAlign: 'center', color: '#1f2937' }}>
      
      {/* HEADER ESTILIZADO */}
      <header style={{ background: 'white', padding: '15px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <img src="/logo-fritos-el-mono.jpg" alt="Logo Fritos El Mono" style={{ height: '70px', borderRadius: '50%' }} />
          <div style={{textAlign: 'left'}}>
            <h1 style={{ color: naranjaFritos, margin: 0, fontWeight: 800, fontSize: '28px', letterSpacing: '-1px' }}>Fritos El Mono</h1>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>¡El verdadero sabor de Carepa! 🐒🥟</p>
          </div>
        </div>
      </header>

      {/* SECCIÓN BIENVENIDA */}
      <section style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>Nuestro Menú Calientito</h2>
        <p style={{ fontSize: '18px', color: '#6b7280', margin: 0 }}>Hoy es <span style={{color: naranjaFritos, fontWeight: 700}}>{hoy}</span>. Prueba nuestro delicioso <strong style={{color: '#111827'}}>Arroz de {tipoArrozHoy}</strong>.</p>
      </section>

      {/* GRILLA DE PRODUCTOS MEJORADA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto 60px', padding: '0 20px' }}>
        {productos.map(p => {
          const estaAgotado = agotados.includes(p.id);
          const precioAMostrar = p.esJugo && tamanosJugo[p.id] ? p.precios[tamanosJugo[p.id]] : p.precio;
          const precioFinal = precioAMostrar + (p.esArroz && conHuevo ? 1000 : 0);
          
          return (
            <div key={p.id} style={{ 
              background: 'white', 
              borderRadius: '24px', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
              overflow: 'hidden', 
              display: 'flex', flexDirection: 'column', 
              border: '1px solid #f3f4f6',
              transition: 'transform 0.2s, boxShadow 0.2s',
              ':hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' } // Efecto hover (necesita CSS real, pero aquí lo ilustro)
            }}>
              {/* IMAGEN CON OVERLAY SI ESTÁ AGOTADO */}
              <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
                <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {estaAgotado && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                    <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '24px', border: '4px solid #dc2626', padding: '10px 20px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Agotado</span>
                  </div>
                )}
                {p.esArroz && conHuevo && !estaAgotado && (
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'white', padding: '5px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <img src="/huevo-cocido.jpg" alt="Extra Huevo" style={{ height: '50px', width: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* DETALLES PRODUCTO */}
              <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', textAlign: 'left' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 700, color: estaAgotado ? '#9ca3af' : '#111827' }}>{p.nombre}</h3>
                  <p style={{ color: estaAgotado ? '#9ca3af' : '#dc2626', fontWeight: 800, fontSize: '24px', margin: '0 0 20px 0' }}>
                    {estaAgotado ? "$ --.--" : `$${precioFinal.toLocaleString('es-CO')}`}
                  </p>

                  {!estaAgotado && (
                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {p.esArroz && (
                        <div style={{ background: cremaFritos, padding: '15px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                          <label style={{fontSize: '14px', fontWeight: 700, color: '#431407', display: 'block', marginBottom: '8px'}}>¿Tajada o Yuca?</label>
                          <select value={acompañanteArroz} onChange={(e) => setAcompañanteArroz(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: `2px solid ${naranjaFritos}`, fontSize: '16px', background: 'white'}}>
                            <option value="">-- Selecciona --</option>
                            <option value="Tajadas">Tajadas Amarillas</option>
                            <option value="Yuca">Yuca Cocida</option>
                          </select>
                          <label style={{fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '12px', color: '#431407'}}>
                            <input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} style={{width: '18px', height: '18px', accentColor: naranjaFritos}} />
                            Adicionar Huevo Cocido (+$1.000)
                          </label>
                        </div>
                      )}
                      {p.esJugo && (
                        <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `2px solid ${naranjaFritos}`, fontSize: '16px', background: 'white' }}>
                          <option value="">-- Elige el Tamaño --</option>
                          {Object.keys(p.precios).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      )}
                      {p.tieneSabor && (
                        <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', background: 'white' }}>
                          <option value="">-- Elige el Sabor --</option>
                          {p.opciones.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                        <label style={{fontWeight: 700, color: '#4b5563'}}>Cantidad:</label>
                        <input type="number" min="1" defaultValue="1" onChange={(e) => setCantidades({...cantidades, [p.id]: parseInt(e.target.value) || 1})} style={{ width: '70px', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', textAlign: 'center', fontSize: '16px' }} />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => agregarAlCarrito(p)} 
                  disabled={estaAgotado}
                  style={{ 
                    background: estaAgotado ? '#d1d5db' : naranjaFritos, 
                    color: 'white', border: 'none', padding: '16px', borderRadius: '16px', 
                    cursor: estaAgotado ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '18px', width: '100%', transition: 'background 0.2s',
                    boxShadow: estaAgotado ? 'none' : `0 4px 14px ${naranjaFritos}40`
                  }}
                >
                  {estaAgotado ? "No Disponible" : "Añadir al Pedido 🥟"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECCIÓN DEL CARRITO (FIJA ABAJO EN MÓVIL, MODAL O SECCIÓN NORMAL) */}
      <div id="carrito" style={{ padding: '0 20px 100px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 15px 50px rgba(0,0,0,0.1)', border: `4px dashed ${naranjaFritos}` }}>
          <h2 style={{ color: '#111827', marginTop: 0, fontSize: '32px', fontWeight: 800, marginBottom: '30px' }}>🛒 Tu Carta de Pedido</h2>
          
          {pedido.length === 0 ? (
            <div style={{padding: '30px', color: '#6b7280', fontStyle: 'italic', background: cremaFritos, borderRadius: '16px'}}>
              ¡Tu carrito está vacío! Antójate de los mejores fritos de Carepa arriba.
            </div>
          ) : (
            <div style={{textAlign: 'left', marginBottom: '30px'}}>
              {pedido.map((item) => (
                <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{fontSize: '16px', color: '#111827'}}>
                    <strong style={{fontSize: '18px', color: naranjaFritos}}>{item.cantidad}</strong> x {item.nombre} {item.saborElegido ? `(${item.saborElegido})` : ''} <br/> 
                    <small style={{color: '#6b7280', fontSize: '14px'}}>{item.detallesArroz}</small>
                  </span>
                  <span style={{fontWeight: 700, fontSize: '18px', color: '#111827', display: 'flex', alignItems: 'center', gap: '15px'}}>
                    ${item.subtotal.toLocaleString('es-CO')}
                    <button onClick={() => eliminarItem(item.idUnico)} style={{color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '20px', padding: '5px'}}>✕</button>
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div style={{borderTop: `3px solid ${naranjaFritos}`, paddingTop: '20px', marginBottom: '30px', textAlign: 'right'}}>
            <h3 style={{ fontSize: '36px', margin: 0, color: '#111827', fontWeight: 800 }}>Total: ${total.toLocaleString('es-CO')}</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', margin: '0 auto 30px' }}>
            <input type="text" placeholder="Tu nombre completo" onChange={(e) => setNombre(e.target.value)} style={{ padding: '18px', borderRadius: '12px', border: '2px solid #fed7aa', fontSize: '16px', width: '100%', boxSizing: 'border-box' }} />
            <input type="text" placeholder="Dirección exacta en Carepa" onChange={(e) => setDireccion(e.target.value)} style={{ padding: '18px', borderRadius: '12px', border: '2px solid #fed7aa', fontSize: '16px', width: '100%', boxSizing: 'border-box' }} />
            <select onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '18px', borderRadius: '12px', border: '2px solid #fed7aa', fontSize: '16px', width: '100%', background: 'white', boxSizing: 'border-box' }}>
              <option value="">-- Método de pago --</option>
              <option value="Efectivo">Efectivo (Pago al recibir)</option>
              <option value="Transferencia">Transferencia (Nequi/Bancolombia)</option>
            </select>
          </div>

          {/* Botón de enviar dentro del carrito (opcional, ya tenemos el flotante) */}
          <button onClick={enviarWhatsApp} style={{ background: '#16a34a', color: 'white', padding: '20px', width: '100%', maxWidth: '500px', borderRadius: '20px', fontWeight: 800, fontSize: '22px', cursor: 'pointer', border: 'none', boxShadow: '0 10px 20px rgba(22, 163, 74, 0.3)' }}>
            Confirmar Pedido 📲
          </button>
        </div>
      </div>

      {/* BOTÓN FLOTANTE DE WHATSAPP (SIEMPRE VISIBLE) */}
      <button 
        onClick={enviarWhatsApp}
        style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          background: '#16a34a', 
          color: 'white', 
          border: 'none', 
          padding: '15px 25px', 
          borderRadius: '50px', 
          fontWeight: 800, 
          fontSize: '18px', 
          cursor: 'pointer', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <span>Pedir</span>
        <span style={{fontSize: '24px'}}>📲</span>
        {pedido.length > 0 && (
          <span style={{background: '#dc2626', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '14px', position: 'absolute', top: '-5px', right: '-5px'}}>
            {pedido.reduce((acc, item) => acc + item.cantidad, 0)}
          </span>
        )}
      </button>

      {/* FOOTER SENCILLO */}
      <footer style={{ padding: '30px', background: '#111827', color: 'white', fontSize: '14px' }}>
        Fritos El Mono - Carepa, Antioquia | © 2026
      </footer>

    </div>
  );
}