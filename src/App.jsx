import React, { useState, useEffect } from 'react';

// 🔴 CONTROL DE INVENTARIO: Escribe el nombre del sabor o producto agotado aquí
const agotados = []; 

const productosBase = [
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, tieneSabor: true, opciones: ["Carne", "Pollo", "Arroz"], imagen: "/empanada.jpg" },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, tieneSabor: true, opciones: ["Carne", "Huevo"], imagen: "/papa-rellena.jpg" },
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
  const [sabores, setSabores] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  const agregarAlCarrito = (p) => {
    const sabor = sabores[p.id] || (p.tieneSabor ? p.opciones[0] : "");
    let precioFinal = p.precio;
    let nombreFinal = p.nombre;

    if (p.esArroz && !acompañanteArroz) return alert("Elige Tajadas o Yuca");
    if (p.esJugo) {
      const tamano = tamanosJugo[p.id] || "Mediano";
      precioFinal = p.precios[tamano];
      nombreFinal = `${p.nombre} (${tamano})`;
    }

    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: nombreFinal,
      precio: precioFinal,
      saborElegido: sabor,
      cantidad: 1,
      subtotal: precioFinal
    }]);
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (!nombre || !direccion) return alert("Escribe tu nombre y dirección");
    const lista = pedido.map(i => `- 1 ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''}`).join('\n');
    const mensaje = `¡Hola Fritos El Mono! Pedido de ${nombre}:\n\n${lista}\n\n*Total: $${total}*\n📍 Dir: ${direccion}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: "#fffbeb", minHeight: '100vh', padding: '15px' }}>
      <header style={{ textAlign: 'center', background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '2px solid #f97316' }}>
        <h1 style={{ color: '#f97316', margin: 0 }}>Fritos El Mono 🐒</h1>
        <p style={{margin: '5px 0 0 0'}}>Hoy Arroz de <strong>{tipoArrozHoy}</strong></p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {productosBase.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '20px', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <img src={p.esArroz ? "/arroz-pollo.jpg" : p.imagen} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '15px' }} alt={p.nombre} />
            <h3 style={{ margin: '10px 0' }}>{p.nombre}</h3>
            <p style={{ color: '#f97316', fontWeight: 'bold', fontSize: '20px', margin: '5px 0' }}>${p.esJugo ? p.precios[tamanosJugo[p.id] || "Mediano"] : p.precio}</p>

            {p.tieneSabor && (
              <select 
                value={sabores[p.id] || p.opciones[0]} 
                onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} 
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '10px' }}
              >
                {p.opciones.map(opt => (
                  <option key={opt} value={opt} disabled={agotados.includes(opt)}>
                    {opt} {agotados.includes(opt) ? " (AGOTADO)" : ""}
                  </option>
                ))}
              </select>
            )}

            {p.esArroz && (
              <select onChange={(e) => setAcompañanteArroz(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '10px' }}>
                <option value="">¿Tajada o Yuca?</option>
                <option value="Tajadas">Tajadas</option>
                <option value="Yuca">Yuca</option>
              </select>
            )}

            {p.esJugo && (
              <select 
                value={tamanosJugo[p.id] || "Mediano"} 
                onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} 
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '10px' }}
              >
                {Object.keys(p.precios).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}

            <button onClick={() => agregarAlCarrito(p)} style={{ background: '#f97316', color: 'white', border: 'none', width: '100%', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              Añadir 🥟
            </button>
          </div>
        ))}
      </div>

      {pedido.length > 0 && (
        <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '20px', border: '2px solid #f97316' }}>
          <h3>🛒 Tu Pedido</h3>
          {pedido.map(item => <p key={item.idUnico} style={{borderBottom: '1px solid #eee', paddingBottom: '5px'}}>{item.nombre} {item.saborElegido ? `(${item.saborElegido})` : ''} - ${item.precio}</p>)}
          <h2 style={{ textAlign: 'right' }}>Total: ${total}</h2>
          <input type="text" placeholder="Tu Nombre" onChange={(e) => setNombre(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
          <input type="text" placeholder="Dirección exacta" onChange={(e) => setDireccion(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} />
          <button onClick={enviarWhatsApp} style={{ background: '#16a34a', color: 'white', border: 'none', width: '100%', padding: '15px', borderRadius: '10px', fontWeight: 'bold', fontSize: '18px' }}>
            Pedir por WhatsApp 📲
          </button>
        </div>
      )}
    </div>
  );
}