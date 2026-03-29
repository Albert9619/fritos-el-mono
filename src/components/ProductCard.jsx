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
  
  // 🥤 LÓGICA DE PRECIO DINÁMICO
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
        background: 'white', borderRadius: '28px', padding: '0', 
        boxShadow: isHovered && tiendaAbierta ? '0 20px 40px rgba(0,0,0,0.12)' : '0 10px 20px rgba(0,0,0,0.05)', 
        position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', 
        transform: isHovered && tiendaAbierta ? 'translateY(-8px)' : 'translateY(0)', 
        border: isHovered && tiendaAbierta ? `2px solid ${MONO_NARANJA}` : `2px solid transparent`, 
        display: 'flex', flexDirection: 'column', height: '100%'
      }}
    >
      {/* 📸 IMAGEN UNIFICADA */}
      <img 
        src={p?.imagen} 
        alt={p?.nombre} 
        style={{ 
          width: '100%', 
          height: '200px', // Altura fija para que todas las tarjetas se vean iguales
          objectFit: 'cover', // Corta la imagen para llenar el cuadro sin estirarla
          filter: todoAgotado ? 'grayscale(1)' : 'none',
          transition: 'all 0.3s ease',
          backgroundColor: '#f9f9f9'
        }} 
      />
      
      {todoAgotado && ( 
        <div style={{ position: 'absolute', top: '0', right: '0', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '12px 25px', borderRadius: '0 0 0 25px', fontWeight: '900', fontSize: '14px', zIndex: 10 }}>
          AGOTADO 🚫
        </div> 
      )}

      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Título con altura mínima para alinear precios */}
        <div style={{ minHeight: '60px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '800', lineHeight: '1.2' }}>{p?.nombre}</h3>
        </div>
        
        {/* 💰 VISUALIZACIÓN DEL PRECIO */}
        <p style={{ 
          color: MONO_NARANJA, 
          fontWeight: '900', 
          fontSize: '26px', 
          margin: '0 0 20px 0', 
          paddingBottom: '10px', 
          borderBottom: `2px dashed ${MONO_AMARILLO}` 
        }}>
          {necesitaSeleccion ? "Selecciona tamaño" : `$${(precioMostrar || 0).toLocaleString('es-CO')}`}
        </p>
        
        {!todoAgotado && tiendaAbierta && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: 'auto' }}>
            
            {/* OPCIONES DE ARROZ */}
            {p?.esArroz && (
              <div style={{ background: MONO_AMARILLO, padding: '15px', borderRadius: '18px', border: `1px solid rgba(249, 115, 22, 0.2)` }}>
                <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid #ddd`, fontSize: '16px' }}>
                  <option value="">¿Tajada o Yuca?</option>
                  <option value="Tajadas" disabled={!tajadaObj?.disponible}>Tajadas {!tajadaObj?.disponible ? "(AGOTADO)" : "😋"}</option>
                  <option value="Yuca" disabled={!yucaObj?.disponible}>Yuca {!yucaObj?.disponible ? "(AGOTADO)" : "😋"}</option>
                </select>
                {!huevoObj?.disponible ? (
                  <p style={{ color: 'red', fontSize: '14px', margin: '8px 0 0 0', fontWeight: 'bold', textAlign: 'center' }}>🚫 Huevo Agotado</p>
                ) : (
                  <label style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} style={{ accentColor: MONO_NARANJA, width: '22px', height: '22px' }} /> 
                    + Huevo (${(huevoObj?.precio || 0).toLocaleString('es-CO')})
                  </label>
                )}
              </div>
            )}

            {/* OPCIONES DE SABOR */}
            {p?.opciones && (
              <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} value={sabores[p.id] || ""} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid #ddd`, fontSize: '16px' }}>
                <option value="">-- Elige el Sabor --</option>
                {p.opciones.map(opt => (
                  <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>
                    {opt.nombre} {!opt.disponible ? "(AGOTADO)" : ""}
                  </option>
                ))}
              </select>
            )}

            {/* SELECTOR DE TAMAÑO */}
            {p?.tamanos && (
              <select 
                onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} 
                value={tamanosJugo[p.id] || ""} 
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `2px solid ${MONO_NARANJA}`, fontSize: '16px', fontWeight: 'bold' }}
              >
                <option value="">-- Elije Tamaño --</option>
                {p.tamanos.map(tam => (
                  <option key={tam.nombre} value={tam.nombre} disabled={!tam.disponible}>
                    {tam.nombre} - ${(tam.precio || 0).toLocaleString('es-CO')} {!tam.disponible ? "🚫" : ""}
                  </option>
                ))}
              </select>
            )}

            {/* CANTIDAD */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fcfcfc', padding: '12px', borderRadius: '15px', border: '1px solid #eee'}}>
              <label style={{fontSize: '16px', fontWeight: 'bold', color: '#555'}}>Cantidad:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => restarCantidad(p?.id)} style={{ width: '35px', height: '35px', borderRadius: '50%', background: MONO_AMARILLO, border: 'none', color: MONO_NARANJA, fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                <input 
                  type="number" min="1" value={cantidades[p?.id] !== undefined ? cantidades[p?.id] : 1}
                  onChange={(e) => manejarInputCantidad(p?.id, e.target.value)} onBlur={() => corregirInputVacio(p?.id)}
                  style={{ width: '45px', textAlign: 'center', fontSize: '20px', fontWeight: '900', border: 'none', background: 'transparent', outline: 'none' }}
                />
                <button onClick={() => sumarCantidad(p?.id)} style={{ width: '35px', height: '35px', borderRadius: '50%', background: MONO_NARANJA, border: 'none', color: 'white', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
              </div>
            </div>

            {/* BOTÓN AÑADIR */}
            <button 
              onClick={() => agregarAlCarrito(p)} 
              style={{ background: MONO_NARANJA, color: 'white', border: 'none', textAlign: 'center', padding: '16px', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(249, 115, 22, 0.2)' }}
            >
              Añadir al Pedido 🥟
            </button>
          </div>
        )}
      </div>
    </div>
  );
}