import React, { useState, useEffect } from 'react';

// 🔴 CONTROL DE INVENTARIO: Escribe el ID del producto entre corchetes
// Ejemplo: const agotados = [1, 5]; // Empanada y Arroz agotados
const agotados = ["Carne", "Pollo"]; 

const productosBase = [
  // --- EMPANADAS ---
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, tieneSabor: true, opciones: ["Carne", "Pollo", "Arroz"], imagen: "/empanada.jpg" },
  
  // --- PAPAS RELLENAS ---
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, tieneSabor: true, opciones: ["Carne", "Huevo"], imagen: "/papa-rellena.jpg" },
  
  // --- OTROS FRITOS ---
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg" },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg" },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.jpg" },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.jpg" },

  // --- ARROZ (Día actual) ---
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true },

  // --- JUGOS (Por sabor y tamaño) ---
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

export default function App() {
  const [pedido, setPedido] = useState([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [sabores, setSabores] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  
  // ✅ ESTADO PARA EL HUEVO COCIDO
  const [conHuevo, setConHuevo] = useState(false);

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  const agregarAlCarrito = (p) => {
    const cant = cantidades[p.id] || 1;
    const sabor = sabores[p.id] || (p.tieneSabor ? p.opciones[0] : "");
    let precioBase = p.precio;
    let nombreFinal = p.nombre;
    let detallesExtra = "";

    // ✅ LÓGICA DEL ARROZ CON HUEVO
    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Por favor elige Tajadas o Yuca");
      if (conHuevo) precioBase += 1000;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})`;
    }

    // ✅ LÓGICA DE PRECIOS DE JUGOS
    if (p.esJugo) {
      const tamano = tamanosJugo[p.id] || "Mediano";
      precioBase = p.precios[tamano];
      nombreFinal = `${p.nombre} (${tamano})`;
    }

    if (p.tieneSabor && !sabor) return alert("Por favor elige el sabor");

    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: nombreFinal,
      precioUnitario: precioBase,
      saborElegido: sabor,
      detallesArroz: detallesExtra, // Guardamos los detalles del arroz
      cantidad: cant,
      subtotal: precioBase * cant
    }]);

    // Opcional: Resetear campos de arroz
    if (p.esArroz) {
      setAcompañanteArroz("");
      setConHuevo(false);
    }
  };

  const eliminarItem = (id) => setPedido(pedido.filter(i => i.idUnico !== id));
  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("Tu carrito está vacío.");
    if (!nombre || !direccion || !metodoPago) return alert("Completa Nombre, Dirección y Pago");

    const lista = pedido.map(i => `- ${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}: $${i.subtotal.toLocaleString('es-CO')}`).join('\n');
    const mensaje = `¡Hola! Soy ${nombre}. Mi pedido para Fritos El Mono es:\n\n${lista}\n\n*Total a pagar: $${total.toLocaleString('es-CO')}*\n📍 Dir: ${direccion}\n💰 Pago: ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  const naranjaFritos = "#f97316";

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: "#fffbeb", minHeight: '100vh', padding: '15px', color: '#333' }}>
      <header style={{ textAlign: 'center', background: 'white', padding: '20px', borderRadius: '25px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{ height: '80px', borderRadius: '50%', marginBottom: '10px' }} />
        <h1 style={{ color: naranjaFritos, margin: 0, fontSize: '28px' }}>Fritos El Mono </h1>
        <p>Hoy Arroz de <strong>{tipoArrozHoy}</strong> 🐒🥟</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', maxWidth: '1100px', margin: '0 auto 60px' }}>
        {productosBase.map(p => {
          const estaAgotado = agotados.includes(p.id);
          const precioAMostrar = p.esJugo && tamanosJugo[p.id] ? p.precios[tamanosJugo[p.id]] : p.precio;
          const precioFinalCard = precioAMostrar + (p.esArroz && conHuevo ? 1000 : 0);
          
          return (
            <div key={p.id} style={{ background: 'white', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.05)', textAlign: 'left', position: 'relative', border: '1px solid #eee' }}>
              <img src={p.esArroz ? (tipoArrozHoy === "Pollo" ? "/arroz-pollo.jpg" : "/arroz-cerdo.jpg") : p.imagen} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '18px' }} alt={p.nombre} />
              
              {estaAgotado && (
                <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,0,0,0.8)', color: 'white', padding: '8px 15px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>AGOTADO</div>
              )}

              <h3 style={{ margin: '15px 0 5px', fontSize: '22px' }}>{p.nombre}</h3>
              <p style={{ color: naranjaFritos, fontWeight: 800, fontSize: '26px', margin: '0 0 15px 0' }}>${precioFinalCard.toLocaleString('es-CO')}</p>

              {!estaAgotado && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* ✅ ADICIÓN DE HUEVO EN ARROZ */}
                  {p.esArroz && (
                    <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                      <label style={{fontSize: '14px', fontWeight: 'bold', color: '#431407', display: 'block', marginBottom: '8px'}}>¿Tajada o Yuca?</label>
                      <select value={acompañanteArroz} onChange={(e) => setAcompañanteArroz(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '8px', border: `2px solid ${naranjaFritos}`}}>
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

                  {/* ✅ PRECIOS DE JUGOS POR TAMAÑO */}
                  {p.esJugo && (
                    <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `2px solid ${naranjaFritos}`, fontSize: '16px' }}>
                      <option value="">-- Elige el Tamaño --</option>
                      {Object.keys(p.precios).map(t => <option key={t} value={t}>{t} - ${p.precios[t].toLocaleString('es-CO')}</option>)}
                    </select>
                  )}

                  {p.tieneSabor && (
                    <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}>
                      <option value="">-- Elige el Sabor --</option>
                      {p.opciones.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                    <label style={{fontWeight: 'bold', color: '#666'}}>Cantidad:</label>
                    <input type="number" min="1" defaultValue="1" onChange={(e) => setCantidades({...cantidades, [p.id]: parseInt(e.target.value) || 1})} style={{ width: '70px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center', fontSize: '16px' }} />
                  </div>

                  <button onClick={() => agregarAlCarrito(p)} style={{ background: naranjaFritos, color: 'white', border: 'none', width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 800, fontSize: '18px', cursor: 'pointer', marginTop: '10px', boxShadow: `0 4px 14px ${naranjaFritos}40` }}>
                    Añadir al Pedido 🥟
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pedido.length > 0 && (
        <div style={{ marginTop: '30px', background: 'white', padding: '30px', borderRadius: '32px', border: `3px solid ${naranjaFritos}`, maxWidth: '700px', margin: '0 auto 100px', boxShadow: '0 15px 50px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#111827', marginTop: 0, fontSize: '28px', fontWeight: 800 }}>🛒 Tu Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
              <span>
                <strong style={{fontSize: '18px'}}>{item.cantidad}x</strong> {item.nombre} {item.saborElegido ? `(${item.saborElegido})` : ''} 
                {item.detallesArroz && <br/>}<small style={{color: '#666'}}>{item.detallesArroz}</small>
              </span>
              <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                <span style={{fontWeight: 'bold', fontSize: '18px'}}>${item.subtotal.toLocaleString('es-CO')}</span>
                <button onClick={() => eliminarItem(item.idUnico)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold' }}>✕</button>
              </div>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: naranjaFritos, fontSize: '36px', fontWeight: 800, borderTop: '2px solid #fed7aa', paddingTop: '15px' }}>Total: ${total.toLocaleString('es-CO')}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', maxWidth: '500px', margin: '20px auto 0' }}>
            <input type="text" placeholder="Tu Nombre" onChange={(e) => setNombre(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: '2px solid #fed7aa', fontSize: '16px' }} />
            <input type="text" placeholder="Dirección en Carepa" onChange={(e) => setDireccion(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: '2px solid #fed7aa', fontSize: '16px' }} />
            
            <select onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '15px', borderRadius: '12px', border: '2px solid #fed7aa', fontSize: '16px', background: 'white' }}>
              <option value="">¿Cómo pagas?</option>
              <option value="Efectivo">Efectivo (al recibir)</option>
              <option value="Nequi">Nequi / Ahorro a la mano</option>
            </select>

            <button onClick={enviarWhatsApp} style={{ background: '#16a34a', color: 'white', border: 'none', width: '100%', padding: '18px', borderRadius: '15px', fontWeight: 800, fontSize: '20px', cursor: 'pointer', marginTop: '15px', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)' }}>
              Confirmar por WhatsApp 📲
            </button>
          </div>
        </div>
      )}
    </div>
  );
}