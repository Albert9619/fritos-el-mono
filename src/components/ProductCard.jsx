import React from 'react';

export default function ProductCard({ 
  p, tiendaAbierta, hoveredCardId, setHoveredCardId, tamanosJugo, setTamanosJugo, 
  sabores, setSabores, acompañanteArroz, setAcompañanteArroz, conHuevo, setConHuevo, 
  cantidades, sumarCantidad, restarCantidad, manejarInputCantidad, corregirInputVacio, 
  agregarAlCarrito, tajadaObj, yucaObj, huevoObj
}) {
  const MONO_NARANJA = "#f97316";
  const MONO_AMARILLO = "#fef3c7";
  const MONO_TEXTO = "#333333";

  const todoAgotado = !p?.disponible;
  const isHovered = hoveredCardId === p?.id;
  
  // LÓGICA DE PRECIO
  let precioMostrar = p?.precio || 0;
  let necesitaSeleccion = false;

  if (p?.esJugo && p?.tamanos) {
    const tamSeleccionado = tamanosJugo[p.id];
    if (tamSeleccionado) {
      const tamObj = p.tamanos.find(t => t.nombre === tamSeleccionado);
      precioMostrar = tamObj ? tamObj.precio : 0;
    } else {
      precioMostrar = 0;
      necesitaSeleccion = true;
    }
  }

  return (
    <div 
      onMouseEnter={() => setHoveredCardId(p?.id)} 
      onMouseLeave={() => setHoveredCardId(null)} 
      style={{ 
        background: 'white', 
        borderRadius: '28px', 
        overflow: 'hidden', 
        transition: 'all 0.3s ease',
        // --- 📏 ALTURA FIJA PARA TODAS LAS TARJETAS ---
        height: '580px', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: isHovered && tiendaAbierta ? '0 15px 30px rgba(0,0,0,0.1)' : '0 8px 15px rgba(0,0,0,0.03)',
        border: isHovered && tiendaAbierta ? `2px solid ${MONO_NARANJA}` : `2px solid #f0f0f0`,
        transform: isHovered && tiendaAbierta ? 'translateY(-5px)' : 'translateY(0)',
        width: '100%'
      }}
    >
      {/* 📸 CONTENEDOR DE IMAGEN (ALTURA BLOQUEADA) */}
      <div style={{ width: '100%', height: '200px', overflow: 'hidden', backgroundColor: '#f9f9f9', position: 'relative' }}>
        <img 
          src={p?.imagen} 
          alt={p?.nombre} 
          style={{ 
            width: '100%', 
            height: '100%', 
            // 'cover' hará que el arroz se vea igual de cerca que los fritos
            objectFit: 'cover', 
            filter: todoAgotado ? 'grayscale(1)' : 'none'
          }} 
        />
        {todoAgotado && ( 
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '8px 15px', borderRadius: '50px', fontWeight: 'bold', fontSize: '12px' }}>
            AGOTADO 🚫
          </div> 
        )}
      </div>

      {/* 📝 CONTENIDO */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        {/* Título y Precio */}
        <div style={{ height: '80px', marginBottom: '10px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '800', color: MONO_TEXTO, lineHeight: '1.2' }}>
            {p?.nombre}
          </h3>
          <p style={{ color: MONO_NARANJA, fontWeight: '900', fontSize: '24px', margin: '0' }}>
            {necesitaSeleccion ? "Selecciona tamaño" : `$${(precioMostrar || 0).toLocaleString('es-CO')}`}
          </p>
        </div>

        {/* ⚙️ SECCIÓN DE OPCIONES (Ajustada para el arroz) */}
        <div style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
          
          {/* --- SECCIÓN DE ARROZ ACTUALIZADA --- */}
{p?.esArroz && (
  <div style={{ background: MONO_AMARILLO, padding: '12px', borderRadius: '15px', border: `1px solid rgba(249, 115, 22, 0.1)` }}>
    <select 
      onChange={(e) => setAcompañanteArroz(e.target.value)} 
      value={acompañanteArroz} 
      style={{width: '100%', padding: '8px', borderRadius: '10px', border: `1px solid #ddd`, fontSize: '14px', marginBottom: '10px' }}
    >
      <option value="">¿Tajada o Yuca?</option>
      <option value="Tajadas" disabled={!tajadaObj?.disponible}>Tajadas {!tajadaObj?.disponible ? "🚫" : ""}</option>
      <option value="Yuca" disabled={!yucaObj?.disponible}>Yuca {!yucaObj?.disponible ? "🚫" : ""}</option>
    </select>

    {/* Casilla de Huevo */}
    <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
      <input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} style={{ accentColor: MONO_NARANJA, width: '18px', height: '18px' }} /> 
      + Huevo Extra ($1.000)
    </label>

    {/* Casilla de Queso (LA NUEVA OPCIÓN) */}
    <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      <input 
        type="checkbox" 
        checked={conQueso} 
        onChange={(e) => setConQueso(e.target.checked)} 
        disabled={!quesoObj?.disponible} // Por si se acaba el queso
        style={{ accentColor: MONO_NARANJA, width: '18px', height: '18px' }} 
      /> 
      {quesoObj?.disponible ? `+ Queso Extra ($1.000)` : "🚫 Queso Agotado"}
    </label>
  </div>
)}
          {p?.opciones && (
            <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} value={sabores[p.id] || ""} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid #ddd`, fontSize: '15px' }}>
              <option value="">-- Elige el Sabor --</option>
              {p.opciones.map(opt => (
                <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre}</option>
              ))}
            </select>
          )}

          {p?.tamanos && (
            <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} value={tamanosJugo[p.id] || ""} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `2px solid ${MONO_NARANJA}`, fontSize: '15px', fontWeight: 'bold' }}>
              <option value="">-- Elije Tamaño --</option>
              {p.tamanos.map(tam => (
                <option key={tam.nombre} value={tam.nombre} disabled={!tam.disponible}>{tam.nombre} - ${tam.precio}</option>
              ))}
            </select>
          )}
        </div>

        {/* 🛒 ACCIONES AL FINAL */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9f9f9', padding: '10px', borderRadius: '15px', border: '1px solid #eee', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Cantidad:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => restarCantidad(p?.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: MONO_AMARILLO, border: 'none', color: MONO_NARANJA, fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
              <span style={{ fontSize: '18px', fontWeight: '900', width: '30px', textAlign: 'center' }}>{cantidades[p?.id] || 1}</span>
              <button onClick={() => sumarCantidad(p?.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: MONO_NARANJA, border: 'none', color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
            </div>
          </div>

          <button 
            onClick={() => agregarAlCarrito(p)} 
            style={{ 
              width: '100%', background: MONO_NARANJA, color: 'white', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: 'bold', fontSize: '17px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
            }}
          >
            Añadir al Pedido 🥟
          </button>
        </div>
      </div>
    </div>
  );
}