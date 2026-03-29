{/* --- SECCIÓN DE DESAYUNOS --- */}
{p?.esDesayuno && (
  <div style={{ background: MONO_AMARILLO, padding: '12px', borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    
    {/* 1. Patacón o Arepa */}
    <select 
      onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), acompañante: e.target.value}})}
      style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #ddd' }}
    >
      <option value="">¿Patacón o Arepa?</option>
      <option value="Patacón">Patacón 🍌</option>
      <option value="Arepa">Arepa 🫓</option>
    </select>

    {/* 2. Huevo (Solo si es Tradicional) */}
    {p.tipo === "tradicional" && (
      <select 
        onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), huevo: e.target.value}})}
        style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #ddd' }}
      >
        <option value="">¿Cómo quieres los huevos?</option>
        <option value="Revueltos">Revueltos 🍳</option>
        <option value="Pericos">Pericos (Tomate y Cebolla) 🍅</option>
      </select>
    )}

    {/* 3. Proteína (Solo si es Especial) */}
    {p.tipo === "especial" && (
      <select 
        onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), proteina: e.target.value}})}
        style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #ddd' }}
      >
        <option value="">¿Carne o Pollo?</option>
        <option value="Carne Desmechada">Carne Desmechada 🥩</option>
        <option value="Pollo Desmechado">Pollo Desmechado 🍗</option>
      </select>
    )}

    {/* 4. Sabor de Jugo (Para ambos) */}
    <select 
      onChange={(e) => setOpcionesDesayuno({...opcionesDesayuno, [p.id]: {...(opcionesDesayuno[p.id] || {}), jugo: e.target.value}})}
      style={{ width: '100%', padding: '8px', borderRadius: '10px', border: `2px solid ${MONO_NARANJA}`, fontWeight: 'bold' }}
    >
      <option value="">Sabor del Jugo ($1.000)</option>
      <option value="Avena">Avena 🥛</option>
      <option value="Maracuyá">Maracuyá 🍋</option>
    </select>

    <div style={{ fontSize: '12px', color: MONO_NARANJA, fontWeight: 'bold', textAlign: 'center' }}>
      ✨ Incluye Queso Costeño ✨
    </div>
  </div>
)}