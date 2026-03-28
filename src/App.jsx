import React, { useState } from 'react';

// ==========================================
// 🔴 DATOS BLINDADOS (Carepa)
// ==========================================
const productosBase = [
  { 
    id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.jpg", disponible: true,
    opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] 
  },
  { 
    id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.jpg", disponible: true,
    opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] 
  },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg", disponible: true },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg", disponible: true },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.jpg", disponible: true },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.jpg", disponible: true },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, disponible: true },
  { 
    id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.jpg", disponible: true,
    opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }],
    tamanos: [
      { nombre: "Pequeño", precio: 1000, disponible: true },
      { nombre: "Mediano", precio: 1500, disponible: true },
      { nombre: "Grande", precio: 2000, disponible: true }
    ]
  }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 }
];

const salsasBase = [
  { nombre: "Pique", disponible: true },
  { nombre: "Salsa Roja", disponible: true },
  { nombre: "Salsa Rosada", disponible: true },
  { nombre: "Suero", disponible: true },
  { nombre: "Suero Picante", disponible: true }
];

const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

export default function App() {
  // ==========================================
  // ⚙️ ESTADOS
  // ==========================================
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  
  const [productos, setProductos] = useState(productosBase);
  const [extrasArroz, setExtrasArroz] = useState(extrasArrozBase);
  const [salsas, setSalsas] = useState(salsasBase);

  const [pedido, setPedido] = useState([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [sabores, setSabores] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);
  const [salsasElegidas, setSalsasElegidas] = useState([]);
  
  // ✅ AQUÍ ESTÁ EL ESTADO QUE FALTABA
  const [hoveredCardId, setHoveredCardId] = useState(null); 

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  // --- ACCESO SEGURO ---
  const accesoSecreto = () => {
    const clave = window.prompt("🔐 Ingresa el PIN:");
    if (clave === "mono2026") {
      setIsAdmin(true);
    } else if (clave !== null) {
      alert("❌ PIN incorrecto.");
    }
  };

  // --- FUNCIONES ADMIN ---
  const toggleProducto = (id) => setProductos(productos.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  const cambiarPrecioProducto = (id, nuevoPrecio) => setProductos(productos.map(p => p.id === id ? { ...p, precio: parseInt(nuevoPrecio) || 0 } : p));
  
  const toggleSabor = (prodId, saborNombre) => {
    setProductos(productos.map(p => p.id === prodId && p.opciones ? { ...p, opciones: p.opciones.map(o => o.nombre === saborNombre ? { ...o, disponible: !o.disponible } : o) } : p));
  };
  
  const toggleTamano = (prodId, tamNombre) => {
    setProductos(productos.map(p => p.id === prodId && p.tamanos ? { ...p, tamanos: p.tamanos.map(t => t.nombre === tamNombre ? { ...t, disponible: !t.disponible } : t) } : p));
  };

  const toggleExtraArroz = (id) => setExtrasArroz(extrasArroz.map(e => e.id === id ? { ...e, disponible: !e.disponible } : e));
  const toggleSalsa = (nombre) => setSalsas(salsas.map(s => s.nombre === nombre ? { ...s, disponible: !s.disponible } : s));

  // --- FUNCIONES CLIENTE ---
  const manejarSalsa = (salsaObj) => {
    if (!tiendaAbierta || !salsaObj || !salsaObj.disponible) return;
    setSalsasElegidas(prev => prev.includes(salsaObj.nombre) ? prev.filter(s => s !== salsaObj.nombre) : [...prev, salsaObj.nombre]);
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return alert("El local está cerrado.");
    
    const cant = cantidades[p.id] || 1;
    let precioBase = p.precio || 0;
    let sabor = "";
    let detallesExtra = "";

    if (p.opciones) {
      sabor = sabores[p.id];
      if (!sabor) return alert(`Por favor elige un sabor para: ${p.nombre}`);
    }

    if (p.esArroz) {
      if (!acompañanteArroz) return alert("Por favor elige Tajadas o Yuca");
      const huevoExtra = extrasArroz.find(e => e.id === 'huevo');
      if (conHuevo && huevoExtra) precioBase += huevoExtra.precio;
      detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''})`;
    }

    if (p.esJugo && p.tamanos) {
      const tamNombre = tamanosJugo[p.id];
      if (!tamNombre) return alert("Por favor elige el tamaño del jugo");
      const tamObj = p.tamanos.find(t => t.nombre === tamNombre);
      if (tamObj) precioBase = tamObj.precio;
      detallesExtra = `(${tamNombre})`;
    }

    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: p.nombre,
      precioUnitario: precioBase,
      saborElegido: sabor,
      detallesArroz: detallesExtra,
      cantidad: cant,
      subtotal: precioBase * cant
    }]);
    
    setSabores({...sabores, [p.id]: ""});
    setTamanosJugo({...tamanosJugo, [p.id]: ""});
    setAcompañanteArroz("");
    setConHuevo(false);
  };

  const total = pedido.reduce((acc, item) => acc + item.subtotal, 0);

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("El carrito está vacío");
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos de envío");
    const listaFritos = pedido.map(i => `- ${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}`).join('\n');
    const mensaje = `¡Hola! Pedido Fritos El Mono:\n\n${listaFritos}\n\n🧂 Salsas: ${salsasElegidas.join(', ') || 'Ninguna'}\n\n*Total: $${total.toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  // ==========================================
  // 🟢 VISTA ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    const MiniSwitch = ({ activo, onClick }) => (
      <div onClick={onClick} style={{ width: '40px', height: '22px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
        <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '21px' : '3px', transition: '0.3s' }} />
      </div>
    );

    return (
      <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <button onClick={() => setIsAdmin(false)} style={{ marginBottom: '20px', padding: '10px 15px', borderRadius: '10px', border: 'none', background: MONO_TEXTO, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
            ← Volver a la Tienda
          </button>
          
          <div style={{ background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
            <h1 style={{ color: MONO_NARANJA, margin: '0 0 10px 0' }}>Panel de Control ⚙️</h1>
            <div style={{ padding: '20px', borderRadius: '15px', background: tiendaAbierta ? '#dcfce7' : '#fee2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '18px' }}>ESTADO: {tiendaAbierta ? '🟢 ABIERTO' : '🔴 CERRADO'}</strong>
              <button onClick={() => setTiendaAbierta(!tiendaAbierta)} style={{ background: MONO_TEXTO, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                {tiendaAbierta ? 'Cerrar Negocio' : 'Abrir Negocio'}
              </button>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ padding: '20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee' }}><h3 style={{ margin: 0 }}>Productos Principales</h3></div>
            {productos.map(p => (
              <div key={p.id} style={{ borderBottom: '2px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', gap: '10px' }}>
                  <strong style={{ fontSize: '16px', flexGrow: 1 }}>{p.nombre}</strong>
                  <input type="number" value={p.precio || ""} disabled={p.esJugo} onChange={(e) => cambiarPrecioProducto(p.id, e.target.value)} style={{ width: '70px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd', background: p.esJugo ? '#eee' : 'white' }} />
                  <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: p.disponible ? MONO_VERDE : 'red' }}>{p.disponible ? 'HAY' : 'AGOTADO'}</span>
                    <MiniSwitch activo={p.disponible} onClick={() => toggleProducto(p.id)} />
                  </div>
                </div>

                {p.opciones && (
                  <div style={{ padding: '10px 20px', background: '#fafafa', borderTop: '1px dashed #ddd' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>SABORES:</span>
                    {p.opciones.map(opt => (
                      <div key={opt.nombre} style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', paddingLeft: '15px' }}>
                        <span style={{ fontSize: '14px', color: opt.disponible ? '#333' : '#aaa' }}>- {opt.nombre}</span>
                        <MiniSwitch activo={opt.disponible} onClick={() => toggleSabor(p.id, opt.nombre)} />
                      </div>
                    ))}
                  </div>
                )}

                {p.tamanos && (
                  <div style={{ padding: '10px 20px', background: '#fafafa', borderTop: '1px dashed #ddd' }}>
                    <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>TAMAÑOS:</span>
                    {p.tamanos.map(tam => (
                      <div key={tam.nombre} style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', paddingLeft: '15px' }}>
                        <span style={{ fontSize: '14px', color: tam.disponible ? '#333' : '#aaa' }}>- {tam.nombre} (${tam.precio})</span>
                        <MiniSwitch activo={tam.disponible} onClick={() => toggleTamano(p.id, tam.nombre)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', paddingBottom: '10px' }}>
              <div style={{ padding: '15px 20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee' }}><h3 style={{ margin: 0 }}>Extras del Arroz</h3></div>
              {extrasArroz.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                  <span>{e.nombre}</span>
                  <MiniSwitch activo={e.disponible} onClick={() => toggleExtraArroz(e.id)} />
                </div>
              ))}
            </div>

            <div style={{ flex: '1 1 300px', background: 'white', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', paddingBottom: '10px' }}>
              <div style={{ padding: '15px 20px', background: MONO_AMARILLO, borderBottom: '1px solid #eee' }}><h3 style={{ margin: 0 }}>Salsas</h3></div>
              {salsas.map(s => (
                <div key={s.nombre} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                  <span>{s.nombre}</span>
                  <MiniSwitch activo={s.disponible} onClick={() => toggleSalsa(s.nombre)} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // 🔵 VISTA CLIENTE
  // ==========================================
  const tajadaObj = extrasArroz.find(e => e.id === 'tajada') || { disponible: false, precio: 0 };
  const yucaObj = extrasArroz.find(e => e.id === 'yuca') || { disponible: false, precio: 0 };
  const huevoObj = extrasArroz.find(e => e.id === 'huevo') || { disponible: false, precio: 1000 };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', color: MONO_TEXTO, paddingBottom: '60px' }}>
      
      <header style={{ textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <img src="/logo-fritos-el-mono.jpg" alt="Banner Fritos El Mono" style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }} />
        <div style={{ padding: '25px', background: 'rgba(255, 255, 255, 0.95)', borderTop: `5px solid ${MONO_NARANJA}` }}>
          <h1 onDoubleClick={accesoSecreto} style={{ color: MONO_NARANJA, margin: 0, fontSize: '36px', fontWeight: '900', userSelect: 'none', cursor: 'pointer' }}>
            Fritos El Mono 🐒
          </h1>
          <p style={{ marginTop: '5px', fontSize: '18px', fontWeight: '600' }}>Hoy Arroz de <span style={{color: MONO_NARANJA}}>{tipoArrozHoy}</span></p>
        </div>
      </header>

      {!tiendaAbierta && (
        <div style={{ maxWidth: '800px', margin: '0 auto 30px', background: '#fee2e2', color: '#b91c1c', padding: '20px', borderRadius: '20px', textAlign: 'center', fontWeight: 'bold', border: '2px solid #ef4444' }}>
          🔴 Actualmente estamos cerrados. ¡Vuelve pronto a hacer tu pedido!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', opacity: tiendaAbierta ? 1 : 0.6 }}>
        {productos.map(p => {
          const todoAgotado = !p.disponible;
          const isHovered = hoveredCardId === p.id;
          
          let precioMostrar = p.precio || 0;
          if (p.esJugo && p.tamanos) {
            const tamSeleccionado = tamanosJugo[p.id];
            if (tamSeleccionado) {
              const tamObj = p.tamanos.find(t => t.nombre === tamSeleccionado);
              precioMostrar = tamObj ? tamObj.precio : p.tamanos[0].precio;
            } else {
              precioMostrar = p.tamanos[0].precio;
            }
          }

          return (
            <div key={p.id} onMouseEnter={() => setHoveredCardId(p.id)} onMouseLeave={() => setHoveredCardId(null)} style={{ background: 'white', borderRadius: '28px', padding: '0', boxShadow: isHovered && tiendaAbierta ? '0 20px 40px rgba(0,0,0,0.12)' : '0 10px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', transform: isHovered && tiendaAbierta ? 'translateY(-8px)' : 'translateY(0)', border: isHovered && tiendaAbierta ? `2px solid ${MONO_NARANJA}` : `2px solid transparent`, display: 'flex', flexDirection: 'column' }}>
              <img src={p.esArroz ? "/arroz-pollo.jpg" : p.imagen} style={{ width: '100%', height: '210px', objectFit: 'cover', filter: todoAgotado ? 'grayscale(1)' : 'none' }} alt={p.nombre} />
              {todoAgotado && ( <div style={{ position: 'absolute', top: '0', right: '0', background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '12px 25px', borderRadius: '0 0 0 25px', fontWeight: '900', fontSize: '14px', zIndex: 10 }}>AGOTADO 🚫</div> )}

              <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800' }}>{p.nombre}</h3>
                <p style={{ color: MONO_NARANJA, fontWeight: '900', fontSize: '26px', margin: '0 0 20px 0', paddingBottom: '10px', borderBottom: `2px dashed ${MONO_AMARILLO}` }}>
                  ${precioMostrar.toLocaleString('es-CO')}
                </p>
                
                {!todoAgotado && tiendaAbierta && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    {p.esArroz && (
                      <div style={{ background: MONO_AMARILLO, padding: '15px', borderRadius: '18px', border: `1px solid rgba(249, 115, 22, 0.2)` }}>
                        <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid #ddd`, fontSize: '16px' }}>
                          <option value="">¿Tajada o Yuca?</option>
                          <option value="Tajadas" disabled={!tajadaObj.disponible}>Tajadas {!tajadaObj.disponible ? "(AGOTADO)" : "😋"}</option>
                          <option value="Yuca" disabled={!yucaObj.disponible}>Yuca {!yucaObj.disponible ? "(AGOTADO)" : "😋"}</option>
                        </select>
                        {!huevoObj.disponible ? (
                          <p style={{ color: 'red', fontSize: '14px', margin: '8px 0 0 0', fontWeight: 'bold', textAlign: 'center' }}>🚫 Huevo Agotado</p>
                        ) : (
                          <label style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} style={{ accentColor: MONO_NARANJA, width: '22px', height: '22px' }} /> 
                            + Huevo (${huevoObj.precio.toLocaleString()})
                          </label>
                        )}
                      </div>
                    )}

                    {p.opciones && (
                      <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} value={sabores[p.id] || ""} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid #ddd`, fontSize: '16px' }}>
                        <option value="">-- Elige el Sabor --</option>
                        {p.opciones.map(opt => (
                          <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>
                            {opt.nombre} {!opt.disponible ? "(AGOTADO)" : ""}
                          </option>
                        ))}
                      </select>
                    )}

                    {p.tamanos && (
                      <select onChange={(e) => setTamanosJugo({...tamanosJugo, [p.id]: e.target.value})} value={tamanosJugo[p.id] || ""} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `2px solid ${MONO_NARANJA}`, fontSize: '16px', fontWeight: 'bold' }}>
                        <option value="">-- Elije Tamaño --</option>
                        {p.tamanos.map(tam => (
                          <option key={tam.nombre} value={tam.nombre} disabled={!tam.disponible}>
                            {tam.nombre} - ${tam.precio.toLocaleString('es-CO')} {!tam.disponible ? "🚫" : ""}
                          </option>
                        ))}
                      </select>
                    )}

                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', background: '#fcfcfc', padding: '12px', borderRadius: '15px', border: '1px solid #eee'}}>
                      <label style={{fontSize: '16px', fontWeight: 'bold'}}>Cantidad:</label>
                      <input type="number" min="1" value={cantidades[p.id] || 1} onChange={(e) => setCantidades({...cantidades, [p.id]: parseInt(e.target.value) || 1})} style={{ width: '70px', padding: '10px', borderRadius: '10px', border: `1px solid #ddd`, textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }} />
                    </div>
                    <button onClick={() => agregarAlCarrito(p)} style={{ background: MONO_NARANJA, color: 'white', border: 'none', padding: '16px', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(249, 115, 22, 0.2)' }}>
                      Añadir al Pedido 🥟
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tiendaAbierta && (
        <div style={{ maxWidth: '850px', margin: '40px auto', background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: MONO_NARANJA, margin: '0 0 25px 0', fontSize: '26px', fontWeight: '900' }}>🧂 ¿Qué salsas deseas?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {salsas.map(salsaObj => {
              const seleccionada = salsasElegidas.includes(salsaObj.nombre);
              const agotada = !salsaObj.disponible;
              return (
                <button key={salsaObj.nombre} onClick={() => manejarSalsa(salsaObj)} disabled={agotada} style={{ padding: '14px 28px', borderRadius: '40px', fontSize: '17px', border: 'none', cursor: agotada ? 'not-allowed' : 'pointer', background: seleccionada ? MONO_NARANJA : (agotada ? '#f0f0f0' : MONO_AMARILLO), color: seleccionada ? 'white' : (agotada ? '#bbb' : MONO_TEXTO), fontWeight: seleccionada ? 'bold' : 'normal', transition: 'all 0.2s', boxShadow: seleccionada ? '0 5px 12px rgba(249, 115, 22, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)', transform: seleccionada ? 'scale(1.08)' : 'scale(1)', textDecoration: agotada ? 'line-through' : 'none' }}>
                  {seleccionada ? `✓ ${salsaObj.nombre}` : salsaObj.nombre} {agotada ? "🚫" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {pedido.length > 0 && tiendaAbierta && (
        <a href="#carrito_seccion" style={{ position: 'fixed', bottom: '25px', right: '25px', background: MONO_TEXTO, color: 'white', padding: '18px 30px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 8px 25px rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px' }}>
          🛒 Mi Pedido <span style={{ background: MONO_NARANJA, borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pedido.reduce((acc, item) => acc + item.cantidad, 0)}</span>
        </a>
      )}

      {pedido.length > 0 && tiendaAbierta && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '40px auto 60px', background: 'white', padding: '40px', borderRadius: '35px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 45px rgba(0,0,0,0.15)' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '25px' }}>🛒 Confirmar Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '15px 0', alignItems: 'center' }}>
              <span style={{fontSize: '17px'}}><strong>{item.cantidad}x</strong> {item.nombre} <small style={{background: MONO_CREMA, padding: '3px 8px', borderRadius: '6px'}}>{item.saborElegido} {item.detallesArroz}</small></span>
              <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                <span style={{fontWeight: '900', fontSize: '20px'}}>${item.subtotal.toLocaleString('es-CO')}</span>
                <button onClick={() => setPedido(pedido.filter(i => i.idUnico !== item.idUnico))} style={{color: 'red', border: '1px solid #ffcccc', background: '#fff5f5', cursor: 'pointer', width: '35px', height: '35px', borderRadius: '50%', fontWeight: '900'}}>X</button>
              </div>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '38px', fontWeight: '900', marginTop: '30px', borderTop: `3px dashed ${MONO_AMARILLO}`, paddingTop: '15px' }}>Total: ${total.toLocaleString('es-CO')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '25px' }}>
            <input type="text" placeholder="Tu Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: `1px solid #ddd`, fontSize: '17px', background: MONO_CREMA }} />
            <input type="text" placeholder="Dirección Exacta (Barrio / Referencia)" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: `1px solid #ddd`, fontSize: '17px', background: MONO_CREMA }} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '18px', borderRadius: '15px', border: `1px solid #ddd`, fontSize: '17px' }}>
              <option value="">-- ¿Cómo pagas? --</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Nequi (Mono)">Nequi (Mono)</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', border: 'none', padding: '22px', borderRadius: '18px', fontWeight: '900', fontSize: '20px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)' }}>Enviar Pedido por WhatsApp 📲</button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: '15px', borderTop: '1px solid #eee', background: 'white' }}>
        <p style={{ margin: 0, fontWeight: '600' }}>
          📍 Carepa, Antioquia | Hecho con ❤️ para los clientes de El Mono
        </p>
      </footer>
    </div>
  );
}