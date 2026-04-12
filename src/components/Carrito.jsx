import React from 'react';

export default function Carrito({ pedido, setPedido, total, vaciarCarrito, nombre, setNombre, direccion, setDireccion, metodoPago, setMetodoPago, enviarWhatsApp }) {
  const MONO_NARANJA = "#f97316";
  const MONO_AMARILLO = "#fef3c7";
  const MONO_CREMA = "#fffbeb";
  const MONO_VERDE = "#16a34a";

  return (
    <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '40px auto 100px', background: 'white', padding: '40px', borderRadius: '35px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 45px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '30px', fontWeight: '900', margin: 0 }}>🛒 Tu Pedido</h2>
        {/* BOTÓN VACIAR CON PAPELERA */}
        <button 
          onClick={vaciarCarrito} 
          style={{ 
            background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', 
            padding: '10px 18px', borderRadius: '12px', fontWeight: 'bold', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
          }}
        >
          <span style={{fontSize: '20px'}}>🗑️</span> Vaciar
        </button>
      </div>

      {pedido.map(item => (
        <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '15px 0', alignItems: 'center' }}>
          <span style={{fontSize: '17px'}}>
            <strong>{item.cantidad}x</strong> {item.nombre} 
            <br />
            {/* Detalle del producto (Sabor o Extras) */}
            <small style={{color: '#666', fontSize: '13px', background: MONO_CREMA, padding: '2px 6px', borderRadius: '5px'}}>
              {item.detalle}
            </small>
          </span>
          <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
            <span style={{fontWeight: '900', fontSize: '19px'}}>${item.subtotal.toLocaleString('es-CO')}</span>
            <button 
              onClick={() => setPedido(pedido.filter(i => i.idUnico !== item.idUnico))} 
              style={{color: 'red', border: '1px solid #ffcccc', background: '#fff5f5', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%'}}
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '36px', fontWeight: '900', marginTop: '30px', borderTop: `3px dashed ${MONO_AMARILLO}`, paddingTop: '15px' }}>
        Total: ${total.toLocaleString('es-CO')}
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '25px' }}>
        <input type="text" placeholder="Tu Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: `1px solid #ddd`, fontSize: '17px' }} />
        <input type="text" placeholder="Dirección Exacta" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: `1px solid #ddd`, fontSize: '17px' }} />
        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: `1px solid #ddd`, fontSize: '17px' }}>
          <option value="">-- ¿Cómo pagas? --</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Nequi">Nequi</option>
        </select>
        <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', border: 'none', padding: '22px', borderRadius: '18px', fontWeight: '900', fontSize: '20px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)' }}>
          Enviar Pedido por WhatsApp 📲
        </button>
      </div>
    </div>
  );
}