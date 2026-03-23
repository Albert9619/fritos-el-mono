import React, { useState, useEffect } from 'react';

// 🔴 CONTROL DE INVENTARIO: Escribe el nombre del producto o salsa entre comillas
// Ejemplo: const agotados = ["Carne", "Avena", "Suero"]; 
const agotados = ["Carne", "Pollo"]; 

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
  
  // ✅ ESTADO PARA LAS SALSAS
  const [salsasElegidas, setSalsasElegidas] = useState([]);

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  const manejarSalsa = (salsa) => {
    if (salsasElegidas.includes(salsa)) {
      setSalsasElegidas(salsasElegidas.filter(s => s !== salsa));
    } else {
      setSalsasElegidas([...salsasElegidas, salsa]);
    }
  };

  const agregarAlCarrito = (p) => {
    const cant = cantidades[p.id] || 1;
    const sabor = sabores[p.id] || (p.tieneSabor ? p.opciones[0] : "");
    let precioBase = p.precio;
    let nombreFinal = p.nombre;
    let detallesExtra = "";

    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Elige Tajadas o Yuca");
      if (conHuevo) precioBase += 1000;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})`;
    }

    if (p.esJugo) {
      const tamano = tamanosJugo[p.id] || "Mediano";
      precioBase = p.precios[tamano];
      nombreFinal = `${p.nombre} (${tamano})`;
    }

    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: nombreFinal,
      precioUnitario: precioBase,
      saborElegido: sabor,
      detallesArroz: detallesExtra,
      cantidad: cant,
      subtotal: precioBase * cant
    }]);
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("Tu carrito está vacío.");
    if (!nombre || !direccion || !metodoPago) return alert("Completa tus datos.");

    const listaFritos = pedido.map(i => `- ${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}`).join('\n');
    const listaSalsas = salsasElegidas.length > 0 ? `\n\n🧂 *Salsas:* ${salsasElegidas.join(', ')}` : "\n\n🧂 *Salsas:* Ninguna";
    
    const mensaje = `¡Hola! Pedido para Fritos El Mono:\n\n${listaFritos}${listaSalsas}\n\n*Total: $${total.toLocaleString('es-CO')}*\n\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  const naranjaFritos = "#f97316";

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: "#fffbeb", minHeight: '100vh', padding: '15px', color: '#333' }}>
      <header style={{ textAlign: 'center', background: 'white', padding: '20px', borderRadius: '25px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{ height: '70px', borderRadius: '50%', marginBottom: '10px' }} />
        <h1 style={{ color: naranjaFritos, margin: 0 }}>Fritos El Mono</h1>
        <p>Hoy Arroz de <strong>{tipoArrozHoy}</strong> 🥟</p>
      </header>

      {/* PRODUCTOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
        {productosBase.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 15px rgba(0,0,0,0.05)' }}>
            <img src={p.esArroz ? (tipoArrozHoy === "Pollo" ? "/arroz-pollo.jpg" : "/arroz-cerdo.jpg") : p.imagen} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '15px' }} alt={p.nombre} />
            <h3 style={{ margin: '15px 0 5px' }}>{p.nombre}</h3>
            <p style={{ color: naranjaFritos, fontWeight: 800, fontSize: '24px', margin: '0 0 10px 0' }}>${p.precio.toLocaleString('es-CO')}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {p.esArroz && (
                <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '10px' }}>
                  <select onChange={(e) => setAcompañanteArroz(e.target.value)} style={{width: '100%', padding: '8px', marginBottom: '8px'}}>
                    <option value="">¿Tajada o Yuca?</option>
                    <option value="Tajadas">Tajadas</option>
                    <option value="Yuca">Yuca</option>
                  </select>
                  <label style={{fontSize: '13px'}}><input type="checkbox" onChange={(e) => setConHuevo(e.target.checked)} /> + Huevo ($1.000)</label>
                </div>
              )}
              {p.tieneSabor && (
                <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>
                  {p.opciones.map(opt => <option key={opt} value={opt} disabled={agotados.includes(opt)}>{opt} {agotados.includes(opt) ? "(AGOTADO)" : ""}</option>)}
                </select>
              )}
              {p.esJugo && (
                <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>
                  {Object.keys(p.precios).map(t => <option key={t} value={t}>{t} - ${p.precios[t]}</option>)}
                </select>
              )}
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <label style={{fontSize: '14px', fontWeight: 'bold'}}>Cant:</label>
                <input type="number" min="1" defaultValue="1" onChange={(e) => setCantidades({...cantidades, [p.id]: parseInt(e.target.value) || 1})} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <button onClick={() => agregarAlCarrito(p)} style={{ background: naranjaFritos, color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Añadir 🥟</button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ SECCIÓN DE SALSAS */}
      <div style={{ maxWidth: '800px', margin: '40px auto', background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 8px 15px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: naranjaFritos }}>🧂 ¿Qué salsas deseas? (Gratis)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          {listadoSalsas.map(salsa => {
            const salsaAgotada = agotados.includes(salsa);
            return (
              <label key={salsa} style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', 
                background: salsaAgotada ? '#f3f4f6' : cremaFritos, borderRadius: '10px', 
                cursor: salsaAgotada ? 'not-allowed' : 'pointer', color: salsaAgotada ? '#9ca3af' : '#333'
              }}>
                <input 
                  type="checkbox" 
                  disabled={salsaAgotada} 
                  onChange={() => manejarSalsa(salsa)} 
                  checked={salsasElegidas.includes(salsa)} 
                  style={{ accentColor: naranjaFritos }}
                />
                {salsa} {salsaAgotada ? "(X)" : ""}
              </label>
            );
          })}
        </div>
      </div>

      {/* CARRITO */}
      {pedido.length > 0 && (
        <div style={{ maxWidth: '700px', margin: '0 auto 100px', background: 'white', padding: '30px', borderRadius: '32px', border: `3px solid ${naranjaFritos}` }}>
          <h2 style={{ margin: '0 0 20px 0' }}>🛒 Tu Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>{item.cantidad}x {item.nombre} <small>{item.detallesArroz}</small></span>
              <span style={{fontWeight: 'bold'}}>${item.subtotal.toLocaleString('es-CO')}</span>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: naranjaFritos }}>Total: ${total.toLocaleString('es-CO')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <input type="text" placeholder="Tu Nombre" onChange={(e) => setNombre(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #ddd' }} />
            <input type="text" placeholder="Dirección en Carepa" onChange={(e) => setDireccion(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #ddd' }} />
            <select onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #ddd', background: 'white' }}>
              <option value="">¿Cómo pagas?</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi">Nequi</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: '#16a34a', color: 'white', padding: '18px', borderRadius: '15px', fontWeight: 800, fontSize: '18px', border: 'none', cursor: 'pointer' }}>Confirmar por WhatsApp 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}