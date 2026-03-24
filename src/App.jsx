import React, { useState, useEffect } from 'react';

// 🔴 CONTROL DE INVENTARIO: Escribe el nombre entre comillas para agotar
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
  const [salsasElegidas, setSalsasElegidas] = useState([]);

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  const manejarSalsa = (salsa) => {
    setSalsasElegidas(prev => prev.includes(salsa) ? prev.filter(s => s !== salsa) : [...prev, salsa]);
  };

  const agregarAlCarrito = (p) => {
    const cant = cantidades[p.id] || 1;
    const sabor = sabores[p.id] || (p.tieneSabor ? p.opciones[0] : "");
    let precioBase = p.precio;
    let detallesExtra = "";

    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Elige Tajadas o Yuca");
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
    if (pedido.length === 0) return alert("Carrito vacío");
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos de envío");
    const listaFritos = pedido.map(i => `- ${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}`).join('\n');
    const mensaje = `¡Hola! Pedido Fritos El Mono:\n\n${listaFritos}\n\n🧂 Salsas: ${salsasElegidas.join(', ') || 'Ninguna'}\n\n*Total: $${total}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: "#fffbeb", minHeight: '100vh', padding: '15px' }}>
      <header style={{ textAlign: 'center', background: 'white', padding: '20px', borderRadius: '25px', marginBottom: '20px' }}>
        <img
          src="/logo-fritos-el-mono.jpg"
          alt="Logo Fritos El Mono"
          style={{  width: '120px',  height: '120px',  borderRadius: '50%', marginBottom: '10px', objectFit: 'cover', border: '4px solid #f97316' }}
        />  
        <h1 style={{ color: '#f97316', margin: 0 }}>Fritos El Mono 🐒</h1>
        <p>Hoy Arroz de <strong>{tipoArrozHoy}</strong></p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {productosBase.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '20px', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <img src={p.esArroz ? "/arroz-pollo.jpg" : p.imagen} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '15px' }} alt={p.nombre} />
            <h3>{p.nombre}</h3>
            <p style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px' }}>${p.esJugo ? p.precios[tamanosJugo[p.id] || "Mediano"] : p.precio}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {p.esArroz && (
                <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '10px' }}>
                  <select onChange={(e) => setAcompañanteArroz(e.target.value)} style={{width: '100%', padding: '8px', marginBottom: '5px'}}><option value="">¿Tajada o Yuca?</option><option value="Tajadas">Tajadas</option><option value="Yuca">Yuca</option></select>
                  <label><input type="checkbox" onChange={(e) => setConHuevo(e.target.checked)} /> + Huevo ($1.000)</label>
                </div>
              )}
              {p.tieneSabor && (
                <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px' }}>
                  {p.opciones.map(opt => <option key={opt} value={opt} disabled={agotados.includes(opt)}>{opt} {agotados.includes(opt) ? "(X)" : ""}</option>)}
                </select>
              )}
              {p.esJugo && (
                <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px' }}>
                  {Object.keys(p.precios).map(t => <option key={t} value={t}>{t} - ${p.precios[t]}</option>)}
                </select>
              )}
              <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <label>Cant:</label>
                <input type="number" min="1" defaultValue="1" onChange={(e) => setCantidades({...cantidades, [p.id]: parseInt(e.target.value) || 1})} style={{ width: '50px' }} />
              </div>
              <button onClick={() => agregarAlCarrito(p)} style={{ background: '#f97316', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Añadir 🥟</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '800px', margin: '30px auto', background: 'white', padding: '20px', borderRadius: '20px' }}>
        <h3>🧂 Salsas Gratis</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {listadoSalsas.map(s => (
            <label key={s} style={{ padding: '8px', background: '#fef3c7', borderRadius: '10px', cursor: 'pointer', opacity: agotados.includes(s) ? 0.5 : 1 }}>
              <input type="checkbox" disabled={agotados.includes(s)} onChange={() => manejarSalsa(s)} /> {s} {agotados.includes(s) ? "(X)" : ""}
            </label>
          ))}
        </div>
      </div>

      {pedido.length > 0 && (
        <div style={{ maxWidth: '600px', margin: '30px auto', background: 'white', padding: '20px', borderRadius: '20px', border: '2px solid #f97316' }}>
          <h3>🛒 Tu Pedido</h3>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '5px 0' }}>
              <span>{item.cantidad}x {item.nombre} <small>{item.saborElegido}</small></span>
              <button onClick={() => setPedido(pedido.filter(i => i.idUnico !== item.idUnico))} style={{color: 'red', border: 'none', background: 'none'}}>✕</button>
            </div>
          ))}
          <h2 style={{ textAlign: 'right' }}>Total: ${total}</h2>
          <input type="text" placeholder="Nombre" onChange={(e) => setNombre(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
          <input type="text" placeholder="Dirección" onChange={(e) => setDireccion(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
          <select onChange={(e) => setMetodoPago(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px' }}>
            <option value="">Pago...</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Nequi">Nequi</option>
          </select>
          <button onClick={enviarWhatsApp} style={{ background: '#16a34a', color: 'white', border: 'none', width: '100%', padding: '15px', borderRadius: '10px', fontWeight: 'bold' }}>Confirmar 📲</button>
        </div>
      )}
    </div>
  );
}