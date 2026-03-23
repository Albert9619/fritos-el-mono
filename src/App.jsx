import React, { useState, useEffect } from 'react';

// 🔴 CONTROL DE INVENTARIO: Escribe el sabor o producto entre comillas
// Ejemplo: const agotados = ["Carne", "Avena", "Grande"];
const agotados = ["Carne", "Pollo"]; 

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
  const [metodoPago, setMetodoPago] = useState("");
  const [sabores, setSabores] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  const agregarAlCarrito = (p) => {
    const cant = cantidades[p.id] || 1;
    const sabor = sabores[p.id] || (p.tieneSabor ? p.opciones[0] : "");
    let precioBase = p.precio;
    let nombreFinal = p.nombre;

    if (p.esArroz && !acompañanteArroz) return alert("Por favor elige Tajadas o Yuca");
    if (p.esJugo) {
      const tamano = tamanosJugo[p.id] || "Mediano";
      precioBase = p.precios[tamano];
      nombreFinal = `${p.nombre} (${tamano})`;
    }

    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: nombreFinal,
      precio: precioBase,
      saborElegido: sabor,
      cantidad: cant,
      subtotal: precioBase * cant
    }]);
  };

  const eliminarItem = (id) => setPedido(pedido.filter(i => i.idUnico !== id));
  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return alert("Completa Nombre, Dirección y Pago");
    const lista = pedido.map(i => `- ${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''}: $${i.subtotal}`).join('\n');
    const mensaje = `¡Hola! Pedido de ${nombre}:\n\n${lista}\n\n*Total: $${total}*\n📍 Dir: ${direccion}\n💰 Pago: ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: "#fffbeb", minHeight: '100vh', padding: '15px', color: '#333' }}>
      {/* 1. EL LOGO REINTEGRADO */}
      <header style={{ textAlign: 'center', background: 'white', padding: '20px', borderRadius: '25px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{ height: '80px', borderRadius: '50%', marginBottom: '10px' }} />
        <h1 style={{ color: '#f97316', margin: 0, fontSize: '28px' }}>Fritos El Mono </h1>
        <p>Hoy Arroz de <strong>{tipoArrozHoy}</strong> 🐒🥟</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
        {productosBase.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '20px', padding: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <img src={p.esArroz ? (tipoArrozHoy === "Pollo" ? "/arroz-pollo.jpg" : "/arroz-cerdo.jpg") : p.imagen} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '15px' }} alt={p.nombre} />
            <h3 style={{ margin: '10px 0' }}>{p.nombre}</h3>
            <p style={{ color: '#f97316', fontWeight: 'bold', fontSize: '22px' }}>${p.esJugo ? p.precios[tamanosJugo[p.id] || "Mediano"] : p.precio}</p>

            {p.tieneSabor && (
              <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '10px' }}>
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

            {/* 3. LA CANTIDAD REINTEGRADA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <label style={{fontWeight: 'bold'}}>Cant:</label>
              <input type="number" min="1" defaultValue="1" onChange={(e) => setCantidades({...cantidades, [p.id]: parseInt(e.target.value) || 1})} style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>

            <button onClick={() => agregarAlCarrito(p)} style={{ background: '#f97316', color: 'white', border: 'none', width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              Añadir al Pedido 🥟
            </button>
          </div>
        ))}
      </div>

      {pedido.length > 0 && (
        <div style={{ marginTop: '30px', background: 'white', padding: '25px', borderRadius: '25px', border: '2px solid #f97316', maxWidth: '600px', margin: '30px auto' }}>
          <h3 style={{fontSize: '24px'}}>🛒 Tu Pedido</h3>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
              <span>{item.cantidad}x {item.nombre} <small>({item.saborElegido})</small></span>
              <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                <span style={{fontWeight: 'bold'}}>${item.subtotal}</span>
                {/* 2. LA X PARA ELIMINAR REINTEGRADA */}
                <button onClick={() => eliminarItem(item.idUnico)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}>✕</button>
              </div>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: '#f97316' }}>Total: ${total}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            <input type="text" placeholder="Tu Nombre" onChange={(e) => setNombre(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
            <input type="text" placeholder="Dirección en Carepa" onChange={(e) => setDireccion(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
            
            {/* 4. MÉTODO DE PAGO REINTEGRADO */}
            <select onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: 'white' }}>
              <option value="">¿Cómo pagas?</option>
              <option value="Efectivo">Efectivo (al recibir)</option>
              <option value="Nequi">Nequi / Ahorro a la mano</option>
            </select>

            <button onClick={enviarWhatsApp} style={{ background: '#16a34a', color: 'white', border: 'none', width: '100%', padding: '18px', borderRadius: '15px', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer', marginTop: '10px' }}>
              Confirmar Pedido 📲
            </button>
          </div>
        </div>
      )}
    </div>
  );
}