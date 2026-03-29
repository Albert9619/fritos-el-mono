import React from 'react';

export default function ProductCard({ 
  p, tiendaAbierta, hoveredCardId, setHoveredCardId, tamanosJugo, setTamanosJugo, 
  sabores, setSabores, opcionesDesayuno, setOpcionesDesayuno,
  acompañanteArroz, setAcompañanteArroz, conHuevo, setConHuevo, conQueso, setConQueso,
  cantidades, sumarCantidad, restarCantidad, agregarAlCarrito, huevoObj, quesoObj
}) {
  const MONO_NARANJA = "#f97316";
  const MONO_AMARILLO = "#fef3c7";

  const todoAgotado = !p?.disponible;
  
  let precioMostrar = p?.precio || 0;
  if (p?.tamanos) {
    const tam = tamanosJugo[p.id] || p.tamanos[0].nombre;
    const tamObj = p.tamanos.find(t => t.nombre === tam);
    precioMostrar = tamObj ? tamObj.precio : 0;
  }

  return (
    <div style={{ 
      background: 'white', borderRadius: '28px', overflow: 'hidden', transition: 'all 0.3s ease', 
      minHeight: '580px', display: 'flex', flexDirection: 'column', border: `2px solid #f0f0f0`,
      boxShadow: '0 8px 15px rgba(0,0,0,0.03)'
    }}>
      {/* 📸 FOTO UNIFICADA: objectFit 'cover' evita que se estire */}
      <div style={{ width: '100%', height: '200px', backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
        <img src={p?.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: todoAgotado ? 'grayscale(1)' : 'none' }} alt={p?.nombre} />
      </div>

      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ minHeight: '90px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '800' }}>{p?.nombre}</h3>
          <p style={{ color: MONO_NARANJA, fontWeight: '900', fontSize: '24px', margin: '0' }}>
            ${(precioMostrar || 0).toLocaleString('es-CO')}
          </p>
        </div>
        
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
          {p?.esDesayuno && (
            <div style={{ background: MONO_AMARILLO, padding: '10px', borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), acompañante: e.target.value}})} style={{ width: '100%', padding: '8px', borderRadius: '10px' }}>
                <option value="">¿Patacón o Arepa?</option>
                <option value="Patacón">Patacón 🍌</option><option value="Arepa">Arepa 🫓</option>
              </select>
              <select onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), [p.tipo === 'tradicional' ? 'huevo' : 'proteina']: e.target.value}})} style={{ width: '100%', padding: '8px', borderRadius: '10px' }}>
                <option value="">{p.tipo === 'tradicional' ? '¿Huevo Revuelto o Perico?' : '¿Carne o Pollo?'}</option>
                {p.tipo === 'tradicional' ? <><option value="Revueltos">Revueltos</option><option value="Pericos">Pericos</option></> : <><option value="Carne Desmechada">Carne</option><option value="Pollo Desmechado">Pollo</option></>}
              </select>
              <select onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), jugo: e.target.value}})} style={{ width: '100%', padding: '8px', borderRadius: '10px', border: `2px solid ${MONO_NARANJA}` }}>
                <option value="">Sabor de Jugo</option>
                <option value="Avena">Avena 🥛</option><option value="Maracuyá">Maracuyá 🍋</option>
              </select>
            </div>
          )}

          {p?.esArroz && (
            <div style={{ background: MONO_AMARILLO, padding: '12px', borderRadius: '15px' }}>
              <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width: '100%', padding: '10px', borderRadius: '10px' }}>
                <option value="">¿Tajada o Yuca?</option>
                <option value="Tajadas">Tajadas</option><option value="Yuca">Yuca</option>
              </select>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}><input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} /> +Huevo</label>
                <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}><input type="checkbox" checked={conQueso} onChange={(e) => setConQueso(e.target.checked)} /> +Queso</label>
              </div>
            </div>
          )}

          {p?.opciones && (
            <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '10px' }}><option value="">-- Selecciona Sabor --</option>{p.opciones.map(opt => ( <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre}</option> ))}</select>
          )}
          {p?.tamanos && (
            <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `2px solid ${MONO_NARANJA}`, fontWeight: 'bold' }}><option value="">-- Presentación --</option>{p.tamanos.map(tam => ( <option key={tam.nombre} value={tam.nombre} disabled={!tam.disponible}>{tam.nombre} - ${tam.precio}</option> ))}</select>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>Cant:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => restarCantidad(p?.id)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: MONO_AMARILLO, border: 'none' }}>-</button>
              <span style={{ fontWeight: '900' }}>{cantidades[p?.id] || 1}</span>
              <button onClick={() => sumarCantidad(p?.id)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: MONO_NARANJA, color: 'white', border: 'none' }}>+</button>
            </div>
          </div>
          <button onClick={() => agregarAlCarrito(p)} disabled={!tiendaAbierta || todoAgotado} style={{ width: '100%', background: todoAgotado ? '#ccc' : MONO_NARANJA, color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>{todoAgotado ? "Agotado" : "Añadir al Pedido 🥟"}</button>
        </div>
      </div>
    </div>
  );
}