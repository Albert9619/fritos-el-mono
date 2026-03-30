import React from 'react';

export default function ProductCard({ 
  p, tiendaAbierta, tamanosJugo, setTamanosJugo, sabores, setSabores, opcionesDesayuno, setOpcionesDesayuno,
  acompañanteArroz, setAcompañanteArroz, conHuevo, setConHuevo, conQueso, setConQueso,
  cantidades, sumarCantidad, restarCantidad, agregarAlCarrito
}) {
  const MONO_NARANJA = "#f97316";
  const MONO_AMARILLO = "#fef3c7";
  const todoAgotado = !p?.disponible;
  
  // 💰 LÓGICA DE PRECIO
  let precioMostrar = p?.precio || 0;
  if (p?.tamanos) {
    const tam = tamanosJugo[p.id] || p.tamanos[0].nombre;
    const tamObj = p.tamanos.find(t => t.nombre === tam);
    precioMostrar = tamObj ? tamObj.precio : 0;
  }

  if (p?.esDesayuno && opcionesDesayuno?.[p.id]?.agrandarJugo) {
    precioMostrar += 1000;
  }

  // 🧐 ESTO ES LO QUE ARREGLA EL AGUA Y EL PASTEL
  const tieneOpciones = p?.esDesayuno || p?.esArroz || p?.opciones || p?.tamanos;

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '28px', 
      overflow: 'hidden', 
      // 👇 CAMBIO AQUÍ: Ya no es 600px fijo. Ahora es dinámico.
      minHeight: tieneOpciones ? '560px' : '380px', 
      display: 'flex', 
      flexDirection: 'column', 
      border: `2px solid #f0f0f0`, 
      boxShadow: '0 8px 15px rgba(0,0,0,0.03)',
      transition: 'all 0.3s ease'
    }}>
      
      {/* 📸 FOTO */}
      <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
        <img 
          src={p?.imagen} 
          loading="lazy" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: todoAgotado ? 'grayscale(1)' : 'none' }} 
          alt={p?.nombre} 
        />
      </div>

      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* 🏷️ TÍTULO Y PRECIO */}
        <div style={{ marginBottom: tieneOpciones ? '15px' : '5px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '19px', fontWeight: '800' }}>{p?.nombre}</h3>
          <p style={{ color: MONO_NARANJA, fontWeight: '900', fontSize: '22px', margin: '0' }}>
            ${(precioMostrar || 0).toLocaleString('es-CO')}
          </p>
        </div>
        
        {/* 🛠️ OPCIONES (Solo si tiene) */}
        {tieneOpciones && (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
            {p?.esDesayuno && (
              <div style={{ background: MONO_AMARILLO, padding: '10px', borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), acompañante: e.target.value}})} style={{ width: '100%', padding: '8px', borderRadius: '10px' }}>
                  <option value="">¿Patacón o Arepa?</option>
                  <option value="Patacón">Patacón 🍌</option><option value="Arepa">Arepa 🫓</option>
                </select>
                <select onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), [p.tipo === 'tradicional' ? 'huevo' : 'proteina']: e.target.value}})} style={{ width: '100%', padding: '8px', borderRadius: '10px' }}>
                  <option value="">¿Cómo los quieres?</option>
                  {p.tipo === 'tradicional' ? <><option value="Revueltos">Revueltos</option><option value="Pericos">Pericos</option></> : <><option value="Carne Desmechada">Carne</option><option value="Pollo Desmechado">Pollo</option></>}
                </select>
                <select onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), jugo: e.target.value}})} style={{ width: '100%', padding: '8px', borderRadius: '10px' }}>
                  <option value="">Sabor del Jugo</option>
                  <option value="Avena">Avena 🥛</option><option value="Maracuyá">Maracuyá 🍋</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: MONO_NARANJA }}>
                  <input type="checkbox" checked={opcionesDesayuno[p.id]?.agrandarJugo || false} onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), agrandarJugo: e.target.checked}})} />
                  🥤 Agrandar Jugo (+$1.000)
                </label>
              </div>
            )}
            {p?.opciones && <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '10px' }}><option value="">-- Sabor --</option>{p.opciones.map(opt => ( <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre}</option> ))}</select>}
            {p?.tamanos && <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `2px solid ${MONO_NARANJA}`, fontWeight: 'bold' }}><option value="">-- Presentación --</option>{p.tamanos.map(tam => ( <option key={tam.nombre} value={tam.nombre} disabled={!tam.disponible}>{tam.nombre} - ${tam.precio}</option> ))}</select>}
          </div>
        )}

        {/* 🛒 FOOTER */}
        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Cant:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => restarCantidad(p?.id)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#eee', border: 'none' }}>-</button>
              <span style={{ fontWeight: '900', fontSize: '18px' }}>{cantidades[p?.id] || 1}</span>
              <button onClick={() => sumarCantidad(p?.id)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: MONO_NARANJA, color: 'white', border: 'none' }}>+</button>
            </div>
          </div>
          <button onClick={() => agregarAlCarrito(p)} disabled={!tiendaAbierta || todoAgotado} style={{ width: '100%', background: todoAgotado ? '#ccc' : MONO_NARANJA, color: 'white', border: 'none', padding: '14px', borderRadius: '16px', fontWeight: '900' }}>
            {todoAgotado ? "AGOTADO" : "AÑADIR AL PEDIDO"}
          </button>
        </div>
      </div>
    </div>
  );
}