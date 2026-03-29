import React from 'react';

export default function ProductCard({ 
  p, tiendaAbierta, hoveredCardId, setHoveredCardId, tamanosJugo, setTamanosJugo, 
  sabores, setSabores, acompañanteArroz, setAcompañanteArroz, conHuevo, setConHuevo, 
  cantidades, sumarCantidad, restarCantidad, manejarInputCantidad, corregirInputVacio, 
  agregarAlCarrito, tajadaObj, yucaObj, huevoObj
}) {
  const MONO_NARANJA = "#f97316";
  const MONO_AMARILLO = "#fef3c7";

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
        // 👇 ESTO ES LO MÁS IMPORTANTE 👇
        // Obligamos a la tarjeta a tener una altura mínima para que todas sean iguales
        minHeight: '520px', 
        display: 'flex', 
        flexDirection: 'column', // Contenido en columna
        boxShadow: isHovered && tiendaAbierta ? '0 15px 30px rgba(0,0,0,0.1)' : '0 8px 15px rgba(0,0,0,0.03)',
        border: isHovered && tiendaAbierta ? `2px solid ${MONO_NARANJA}` : `2px solid #f0f0f0`,
        transform: isHovered && tiendaAbierta ? 'translateY(-5px)' : 'translateY(0)'
      }}
    >
      {/* 📸 FOTO UNIFICADA A 180px */}
      <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative' }}>
        <img 
          src={p?.imagen} 
          alt={p?.nombre} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', // Recorta la foto para que llene el cuadro sin estirarse
            filter: todoAgotado ? 'grayscale(1)' : 'none',
            backgroundColor: '#f9f9f9'
          }} 
        />
        {todoAgotado && ( 
          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '8px 15px', borderRadius: '50px', fontWeight: 'bold', fontSize: '12px' }}>
            AGOTADO 🚫
          </div> 
        )}
      </div>

      {/* 📝 CUERPO DE LA TARJETA */}
      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Título y Precio con altura mínima para alinear lo de abajo */}
        <div style={{ minHeight: '90px', marginBottom: '15px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '800', color: MONO_TEXTO, lineHeight: '1.2' }}>
            {p?.nombre}
          </div>
          <p style={{ color: MONO_NARANJA, fontWeight: '900', fontSize: '24px', margin: '0' }}>
            {necesitaSeleccion ? "Selecciona tamaño" : `$${(precioMostrar || 0).toLocaleString('es-CO')}`}
          </p>
        </div>

        {/* ⚙️ OPCIONES (Selects, Checks, Cantidad) */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
          
          {/* ARROZ */}
          {p?.esArroz && (
            <div style={{ background: MONO_AMARILLO, padding: '10px', borderRadius: '15px', border: `1px solid rgba(249, 115, 22, 0.1)` }}>
              <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid #ddd`, fontSize: '14px' }}>
                <option value="">¿Tajada o Yuca?</option>
                <option value="Tajadas" disabled={!tajadaObj?.disponible}>Tajadas {!tajadaObj?.disponible ? "🚫" : ""}</option>
                <option value="Yuca" disabled={!yucaObj?.disponible}>Yuca {!yucaObj?.disponible ? "🚫" : ""}</option>
              </select>
              <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: huevoObj?.disponible ? 'pointer' : 'not-allowed', color: huevoObj?.disponible ? MONO_TEXTO : '#aaa' }}>
                <input type="checkbox" checked={conHuevo} disabled={!huevoObj?.disponible} onChange={(e) => setConHuevo(e.target.checked)} style={{ accentColor: MONO_NARANJA, width: '18px', height: '18px' }} /> 
                {huevoObj?.disponible ? `+ Huevo Extra ($${huevoObj?.precio})` : "🚫 Huevo Extra (Agotado)"}
              </label>
            </div>
          )}

          {/* SABORES */}
          {p?.opciones && (
            <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} value={sabores[p.id] || ""} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid #ddd`, fontSize: '14px' }}>
              <option value="">-- Elige el Sabor --</option>
              {p.opciones.map(opt => (
                <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre} {!opt.disponible ? "🚫" : ""}</option>
              ))}
            </select>
          )}

          {/* TAMAÑOS */}
          {p?.tamanos && (
            <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} value={tamanosJugo[p.id] || ""} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `2px solid ${MONO_NARANJA}`, fontSize: '14px', fontWeight: 'bold' }}>
              <option value="">-- Elije Tamaño --</option>
              {p.tamanos.map(tam => (
                <option key={tam.nombre} value={tam.nombre} disabled={!tam.disponible}>{tam.nombre} - ${tam.precio} {!tam.disponible ? "🚫" : ""}</option>
              ))}
            </select>
          )}
        </div>

        {/* 🛒 ACCIONES (Cantidad y Botón) */}
        <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
          
          {/* CANTIDAD */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9f9f9', padding: '8px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Cantidad:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => restarCantidad(p?.id)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: MONO_AMARILLO, border: 'none', color: MONO_NARANJA, fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
              <input type="number" min="1" value={cantidades[p?.id] || 1} onChange={(e) => manejarInputCantidad(p?.id, e.target.value)} onBlur={() => corregirInputVacio(p?.id)} style={{ width: '40px', textAlign: 'center', fontSize: '18px', fontWeight: '900', border: 'none', background: 'transparent' }} />
              <button onClick={() => sumarCantidad(p?.id)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: MONO_NARANJA, border: 'none', color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
            </div>
          </div>

          {/* BOTÓN AÑADIR */}
          <button 
            onClick={() => agregarAlCarrito(p)} 
            disabled={!tiendaAbierta || todoAgotado}
            style={{ 
              width: '100%', background: todoAgotado ? '#ccc' : MONO_NARANJA, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', 
              cursor: todoAgotado ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(249, 115, 22, 0.15)', transition: '0.2s'
            }}
          >
            {todoAgotado ? "Agotado" : "Añadir al Pedido 🥟"}
          </button>
        </div>
      </div>
    </div>
  );
}