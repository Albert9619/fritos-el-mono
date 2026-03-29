import React from 'react';

export default function ProductCard({ 
  p, tiendaAbierta, hoveredCardId, setHoveredCardId, tamanosJugo, setTamanosJugo, 
  sabores, setSabores, acompañanteArroz, setAcompañanteArroz, conHuevo, setConHuevo, conQueso, setConQueso,
  cantidades, sumarCantidad, restarCantidad, manejarInputCantidad, corregirInputVacio, 
  agregarAlCarrito, tajadaObj, yucaObj, huevoObj, quesoObj
}) {
  const MONO_NARANJA = "#f97316";
  const MONO_AMARILLO = "#fef3c7";

  const todoAgotado = !p?.disponible;
  const isHovered = hoveredCardId === p?.id;
  
  let precioMostrar = p?.precio || 0;
  let necesitaSeleccion = false;

  if (p?.esJugo && p?.tamanos) {
    const tam = tamanosJugo[p.id] || "Pequeño";
    const tamObj = p.tamanos.find(t => t.nombre === tam);
    precioMostrar = tamObj ? tamObj.precio : 0;
  }

  return (
    <div 
      onMouseEnter={() => setHoveredCardId(p?.id)} onMouseLeave={() => setHoveredCardId(null)} 
      style={{ 
        background: 'white', borderRadius: '28px', overflow: 'hidden', transition: 'all 0.3s ease', 
        minHeight: '560px', display: 'flex', flexDirection: 'column',
        boxShadow: isHovered && tiendaAbierta ? '0 15px 30px rgba(0,0,0,0.1)' : '0 8px 15px rgba(0,0,0,0.03)',
        border: isHovered && tiendaAbierta ? `2px solid ${MONO_NARANJA}` : `2px solid #f0f0f0`,
        transform: isHovered && tiendaAbierta ? 'translateY(-5px)' : 'translateY(0)'
      }}
    >
      <div style={{ width: '100%', height: '180px', backgroundColor: '#f9f9f9' }}>
        <img src={p?.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: todoAgotado ? 'grayscale(1)' : 'none' }} alt={p?.nombre} />
      </div>

      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ minHeight: '90px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '800' }}>{p?.nombre}</h3>
          <p style={{ color: MONO_NARANJA, fontWeight: '900', fontSize: '24px', margin: '0' }}>
            ${(precioMostrar || 0).toLocaleString('es-CO')}
          </p>
        </div>
        
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
          {p?.esArroz && (
            <div style={{ background: MONO_AMARILLO, padding: '10px', borderRadius: '15px' }}>
              <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #ddd' }}>
                <option value="">¿Tajada o Yuca?</option>
                <option value="Tajadas" disabled={!tajadaObj?.disponible}>Tajadas</option>
                <option value="Yuca" disabled={!yucaObj?.disponible}>Yuca</option>
              </select>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} /> +Huevo
                </label>
                <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={conQueso} onChange={(e) => setConQueso(e.target.checked)} /> +Queso
                </label>
              </div>
            </div>
          )}

          {p?.opciones && (
            <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} value={sabores[p.id] || ""} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}>
              <option value="">-- Elige el Sabor --</option>
              {p.opciones.map(opt => ( <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre}</option> ))}
            </select>
          )}

          {p?.tamanos && (
            <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} value={tamanosJugo[p.id] || ""} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `2px solid ${MONO_NARANJA}`, fontWeight: 'bold' }}>
              <option value="">-- Elije Tamaño --</option>
              {p.tamanos.map(tam => ( <option key={tam.nombre} value={tam.nombre} disabled={!tam.disponible}>{tam.nombre} - ${tam.precio}</option> ))}
            </select>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Cantidad:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => restarCantidad(p?.id)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: MONO_AMARILLO, border: 'none', cursor: 'pointer' }}>-</button>
              <span style={{ fontWeight: '900' }}>{cantidades[p?.id] || 1}</span>
              <button onClick={() => sumarCantidad(p?.id)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: MONO_NARANJA, color: 'white', border: 'none', cursor: 'pointer' }}>+</button>
            </div>
          </div>
          <button onClick={() => agregarAlCarrito(p)} disabled={!tiendaAbierta || todoAgotado} style={{ width: '100%', background: MONO_NARANJA, color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Añadir al Pedido 🥟</button>
        </div>
      </div>
    </div>
  );
}