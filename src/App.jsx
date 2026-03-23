import React, { useState, useEffect } from 'react';

// 🔴 CONTROL DE INVENTARIO: Escribe el nombre del sabor o producto agotado aquí
// Ejemplo: const agotados = ["Carne", "Avena", "Grande"];
const agotados = []; 

const productosBase = [
  { 
    id: 1, 
    nombre: "Empanada Crujiente", 
    precio: 1500, 
    tieneSabor: true, 
    opciones: ["Carne", "Pollo", "Arroz"], 
    imagen: "/empanada.jpg" 
  },
  { 
    id: 2, 
    nombre: "Papa Rellena de la Casa", 
    precio: 2500, 
    tieneSabor: true, 
    opciones: ["Carne", "Huevo"], 
    imagen: "/papa-rellena.jpg" 
  },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg" },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg" },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true },
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

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const hoy = diasSemana[new Date().getDay()];
  const esDiaPollo = ["lunes", "miércoles", "viernes"].includes(hoy);
  const tipoArrozHoy = esDiaPollo ? "Pollo" : "Cerdo";

  const productos = productosBase.map(p => {
    if (p.esArroz) {
      return { ...p, imagen: esDiaPollo ? "/arroz-pollo.jpg" : "/arroz-cerdo.jpg" };
    }
    return p;
  });

  const agregarAlCarrito = (p) => {
    const cant = cantidades[p.id] || 1;
    const sabor = sabores[p.id] || (p.tieneSabor ? p.opciones[0] : "");
    let precioFinal = p.precio;
    let nombreFinal = p.nombre;
    let detallesExtra = "";

    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Por favor elige si quieres Tajadas o Yuca");
      if (conHuevo) precioFinal += 1000;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})`;
    }

    if (p.esJugo) {
      const tamano = tamanosJugo[p.id] || "Mediano";
      precioFinal = p.precios[tamano];
      nombreFinal = `${p.nombre} (${tamano})`;
    }

    if (p.tieneSabor && !sabor) return alert("Por favor elige el sabor");
    if (agotados.includes(sabor) || agotados.includes(p.nombre)) return alert("Este producto está agotado");

    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: nombreFinal,
      precio: precioFinal,
      saborElegido: sabor,
      detallesArroz: detallesExtra,
      cantidad: cant,
      subtotal: precioFinal * cant
    }]);
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("Tu carrito está vacío.");
    if (!nombre || !direccion || !metodoPago) return alert("Completa tus datos de entrega.");

    const lista = pedido.map(i => `- ${i.cantidad} ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}: $${i.subtotal.toLocaleString('es-CO')}`).join('\n');
    const mensajeCompleto = `¡Hola! Soy ${nombre}. Mi pedido para Fritos El Mono es:\n\n${lista}\n\n*Total a pagar: $${total.toLocaleString('es-CO')}*\n\n📍 *Dirección:* ${direccion}\n💰 *Pago:* ${metodoPago}\n\n¡Gracias! 🐒🥟`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensajeCompleto)}`);
  };

  const naranjaFritos = "#f97316";
  const cremaFritos = "#fffbeb";

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: cremaFritos, minHeight: '100vh', color: '#1f2937' }}>
      
      <header style={{ background: 'white', padding: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{ height: '60px', borderRadius: '50%' }} />
          <div style={{textAlign: 'left'}}>
            <h1 style={{ color: naranjaFritos, margin: 0, fontSize: '24px', fontWeight: 800 }}>Fritos El Mono</h1>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>¡El sabor de Carepa! 🐒</p>
          </div>
        </div>
      </header>

      <section style={{ padding: '30px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>Nuestro Menú Calientito</h2>
        <p>Hoy es <span style={{color: naranjaFritos, fontWeight: 700}}>{hoy}</span>. Arroz de <strong>{tipoArrozHoy}</strong>.</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', maxWidth: '1100px', margin: '0 auto', padding: '0 20px 50px' }}>
        {productos.map(p => {
          const estaAgotado = agotados.includes(p.nombre);
          return (
            <div key={p.id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', position: 'relative' }}>
                <img src={p.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.nombre} />
                {estaAgotado && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '20px', border: '3px solid #dc2626', padding: '5px 15px', borderRadius: '10px' }}>AGOTADO</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '20px', textAlign: 'left', flexGrow: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{p.nombre}</h3>
                <p style={{ color: naranjaFritos, fontWeight: 800, fontSize: '22px', margin: '0 0 15px 0' }}>${p.precio.toLocaleString('es-CO')}</p>

                {!estaAgotado && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {p.tieneSabor && (
                      <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        {p.opciones.map(opt => (
                          <option key={opt} value={opt} disabled={agotados.includes(opt)}>
                            {opt} {agotados.includes(opt) ? "--- (AGOTADO)" : ""}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {p.esArroz && (
                      <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '10px' }}>
                        <select onChange={(e) => setAcompañanteArroz(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '5px' }}>
                          <option value="">¿Tajada o Yuca?</option>
                          <option value="Tajadas">Tajadas</option>
                          <option value="Yuca">Yuca</option>
                        </select>
                        <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <input type="checkbox" onChange={(e) => setConHuevo(e.target.checked)} /> + Huevo ($1.000)
                        </label>
                      </div>
                    )}

                    {p.esJugo && (
                      <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>
                        {Object.keys(p.precios).map(t => <option key={t} value={t}>{t} - ${p.precios[t]}</option>)}
                      </select>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{fontWeight: 600, fontSize: '14px'}}>Cant:</label>
                      <input type="number" min="1" defaultValue="1" onChange={(e) => setCantidades({...cantidades, [p.id]: parseInt(e.target.value) || 1})} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} />
                    </div>

                    <button onClick={() => agregarAlCarrito(p)} style={{ background: naranjaFritos, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}>
                      Añadir 🥟
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto 100px', padding: '0 20px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>🛒 Tu Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>{item.cantidad}x {item.nombre} <small>({item.saborElegido})</small></span>
              <button onClick={() => setPedido(pedido.filter(i => i.idUnico !== item.idUnico))} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          ))}
          <h3 style={{ textAlign: 'right', fontSize: '28px', marginTop: '20px' }}>Total: ${total.toLocaleString('es-CO')}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <input type="text" placeholder="Nombre" onChange={(e) => setNombre(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
            <input type="text" placeholder="Dirección en Carepa" onChange={(e) => setDireccion(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
            <select onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
              <option value="">Pago...</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi">Nequi/Ahorro a la mano</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: '#16a34a', color: 'white', padding: '15px', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '18px' }}>
              Confirmar por WhatsApp 📲
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}