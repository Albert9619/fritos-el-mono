import React, { useState } from 'react';

// ==========================================
// 🔴 CONFIGURACIÓN INICIAL
// ==========================================
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

const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

export default function App() {
  // --- ESTADOS DE LA APP ---
  const [isAdmin, setIsAdmin] = useState(false); // Botón secreto cambia esto
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState(productosBase.map(p => ({ ...p, disponible: true })));
  const [salsasDisponibles, setSalsasDisponibles] = useState(listadoSalsas);
  
  // --- ESTADOS DEL PEDIDO ---
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

  // --- LÓGICA DE DÍA ---
  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // --- FUNCIONES ADMIN ---
  const toggleDisponibilidad = (id) => {
    setProductos(productos.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  };

  // --- FUNCIONES CLIENTE ---
  const manejarSalsa = (salsa) => {
    if (!tiendaAbierta) return;
    setSalsasElegidas(prev => prev.includes(salsa) ? prev.filter(s => s !== salsa) : [...prev, salsa]);
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return;
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

  // ==========================================
  // 🟢 VISTA DE ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    return (
      <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={() => setIsAdmin(false)} style={{ marginBottom: '20px', padding: '10px', borderRadius: '10px', border: 'none', background: MONO_TEXTO, color: 'white', fontWeight: 'bold' }}>← Volver al Menú</button>
          
          <div style={{ background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h1 style={{ color: MONO_NARANJA, margin: 0 }}>Panel de Control ⚙️</h1>
            <p>Gestiona el inventario de <strong>El Mono</strong></p>
            
            <div style={{ marginTop: '20px', padding: '20px', borderRadius: '15px', background: tiendaAbierta ? '#dcfce7' : '#fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>TIENDA: {tiendaAbierta ? '🟢 ABIERTA' : '🔴 CERRADA'}</span>
              <button onClick={() => setTiendaAbierta(!tiendaAbierta)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', background: MONO_TEXTO, color: 'white', cursor: 'pointer' }}>
                {tiendaAbierta ? 'Cerrar Local' : 'Abrir Local'}
              </button>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px', background: MONO_AMARILLO, fontWeight: 'bold' }}>Disponibilidad de Productos</div>
            {productos.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                <span>{p.nombre}</span>
                <div 
                  onClick={() => toggleDisponibilidad(p.id)}
                  style={{ width: '50px', height: '26px', backgroundColor: p.disponible ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                >
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: p.disponible ? '27px' : '3px', transition: '0.3s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🔵 VISTA DE CLIENTE
  // ==========================================
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', color: MONO_TEXTO, paddingBottom: '60px' }}>
      
      {/* BOTÓN SECRETO PARA ENTRAR AL ADMIN */}
      <div onClick={() => setIsAdmin(true)} style={{ position: 'fixed', bottom: 10, left: 10, zIndex: 1000, opacity: 0.1, cursor: 'pointer' }}>⚙️</div>

      <header style={{ textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative' }}>
        <img src="/logo-fritos-el-mono.jpg" alt="Banner Fritos El Mono" style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }} />
        <div style={{ padding: '25px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderTop: `5px solid ${MONO_NARANJA}` }}>
          <h1 style={{ color: MONO_NARANJA, margin: 0, fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px' }}>Fritos El Mono 🐒</h1>
          <p style={{ marginTop: '5px', fontSize: '18px', fontWeight: '600' }}>Hoy Arroz de <span style={{color: MONO_NARANJA}}>{tipoArrozHoy}</span></p>
        </div>
      </header>

      {/* AVISO DE TIENDA CERRADA */}
      {!tiendaAbierta && (
        <div style={{ maxWidth: '800px', margin: '-10px auto 30px', background: '#fee2e2', color: '#b91c1c', padding: '20px', borderRadius: '20px', textAlign: 'center', fontWeight: 'bold', border: '2px solid #ef4444' }}>
          🔴 Actualmente estamos fuera de servicio. ¡Vuelve pronto!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', opacity: tiendaAbierta ? 1 : 0.6 }}>
        {productos.map(p => {
          const isHovered = hoveredCardId === p.id;
          const agotado = !p.disponible;

          return (
            <div key={p.id} onMouseEnter={() => setHoveredCardId(p.id)} onMouseLeave={() => setHoveredCardId(null)} style={{ background: 'white', borderRadius: '28px', padding: '0', boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.12)' : '0 10px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', transform: isHovered && tiendaAbierta ? 'translateY(-8px)' : 'translateY(0)', border: isHovered && tiendaAbierta ? `2px solid ${MONO_NARANJA}` : `2px solid transparent`, display: 'flex', flexDirection: 'column' }}>
              <img src={p.esArroz ? "/arroz-pollo.jpg" : p.imagen} style={{ width: '100%', height: '210px', objectFit: 'cover', filter: agotado ? 'grayscale(1)' : 'none' }} alt={p.nombre} />
              {agotado && ( <div style={{ position: 'absolute', top: '0', right: '0', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '12px 25px', borderRadius: '0 0 0 25px', fontWeight: '900', fontSize: '14px', zIndex: 10 }}>AGOTADO 🚫</div> )}

              <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800' }}>{p.nombre}</h3>
                <p style={{ color: MONO_NARANJA, fontWeight: '900', fontSize: '26px', margin: '0 0 20px 0', paddingBottom: '10px', borderBottom: `2px dashed ${MONO_AMARILLO}` }}>
                  ${p.esJugo ? (p.precios[tamanosJugo[p.id] || "Mediano"]).toLocaleString('es-CO') : p.precio.toLocaleString('es-CO')}
                </p>
                
                {(!agotado && tiendaAbierta) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {p.esArroz && (
                      <div style={{ background: MONO_AMARILLO, padding: '15px', borderRadius: '18px', border: `1px solid rgba(249, 115, 22, 0.2)` }}>
                        <select onChange={(e) => setAcompañanteArroz(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid #ddd`, fontSize: '16px' }}>
                          <option value="">¿Tajada o Yuca?</option>
                          <option value="Tajadas">Tajadas 😋</option>
                          <option value="Yuca">Yuca 😋</option>
                        </select>
                        <label style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', cursor: 'pointer' }}>
                          <input type="checkbox" style={{ accentColor: MONO_NARANJA, width: '22px', height: '22px' }} onChange={(e) => setConHuevo(e.target.checked)} /> + Huevo ($1.000)
                        </label>
                      </div>
                    )}

                    {p.tieneSabor && (
                      <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid #ddd`, fontSize: '16px' }}>
                        <option value="">-- Elige el Sabor --</option>
                        {p.opciones.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}

                    {p.esJugo && (
                      <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `2px solid ${MONO_NARANJA}`, fontSize: '16px', fontWeight: 'bold' }}>
                        <option value="Mediano">-- Elige Tamaño --</option>
                        {Object.keys(p.precios).map(t => (
                          <option key={t} value={t}>{t} - ${p.precios[t].toLocaleString('es-CO')}</option>
                        ))}
                      </select>
                    )}

                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', background: '#fcfcfc', padding: '12px', borderRadius: '15px', border: '1px solid #eee'}}>
                      <label style={{fontSize: '16px', fontWeight: 'bold'}}>Cantidad:</label>
                      <input type="number" min="1" defaultValue="1" onChange={(e) => setCantidades({...cantidades, [p.id]: parseInt(e.target.value) || 1})} style={{ width: '70px', padding: '10px', borderRadius: '10px', border: `1px solid #ddd`, textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }} />
                    </div>
                    <button onClick={() => agregarAlCarrito(p)} style={{ background: MONO_NARANJA, color: 'white', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>Añadir al Pedido 🥟</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tiendaAbierta && (
        <div style={{ maxWidth: '850px', margin: '40px auto', background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: MONO_NARANJA, margin: '0 0 25px 0', fontSize: '26px', fontWeight: '900' }}>🧂 ¿Qué salsas deseas?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {listadoSalsas.map(s => {
              const seleccionada = salsasElegidas.includes(s);
              return (
                <button key={s} onClick={() => manejarSalsa(s)} style={{ padding: '14px 28px', borderRadius: '40px', fontSize: '17px', border: 'none', cursor: 'pointer', background: seleccionada ? MONO_NARANJA : MONO_AMARILLO, color: seleccionada ? 'white' : MONO_TEXTO, fontWeight: seleccionada ? 'bold' : 'normal', transition: 'all 0.2s' }}>
                  {seleccionada ? `✓ ${s}` : s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CARRITO Y FORMULARIO */}
      {pedido.length > 0 && tiendaAbierta && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '40px auto 60px', background: 'white', padding: '40px', borderRadius: '35px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 45px rgba(0,0,0,0.15)' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '25px' }}>🛒 Confirmar Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '15px 0', alignItems: 'center' }}>
              <span style={{fontSize: '17px'}}><strong>{item.cantidad}x</strong> {item.nombre} <small>{item.saborElegido} {item.detallesArroz}</small></span>
              <span style={{fontWeight: '900', fontSize: '20px'}}>${item.subtotal.toLocaleString('es-CO')}</span>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '38px', fontWeight: '900' }}>Total: ${total.toLocaleString('es-CO')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '25px' }}>
            <input type="text" placeholder="Tu Nombre Completo" onChange={(e) => setNombre(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: `1px solid #ddd`, fontSize: '17px' }} />
            <input type="text" placeholder="Dirección Exacta" onChange={(e) => setDireccion(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: `1px solid #ddd`, fontSize: '17px' }} />
            <select onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: `1px solid #ddd`, fontSize: '17px' }}>
              <option value="">-- ¿Cómo pagas? --</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi (Mono)">Nequi (Mono)</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', border: 'none', padding: '22px', borderRadius: '18px', fontWeight: '900', fontSize: '20px', cursor: 'pointer' }}>Enviar Pedido por WhatsApp 📲</button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '15px', background: 'white' }}>
        <p style={{ margin: 0 }}>📍 Carepa, Antioquia | Hecho con ❤️ para los clientes de El Mono</p>
      </footer>
    </div>
  );
}