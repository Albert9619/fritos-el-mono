import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.jpg", disponible: true },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa-huevo.jpg", disponible: true },
  { id: "5", nombre: "Frito Extra 1", precio: 2000, categoria: "Fritos", imagen: "/frito5.jpg", disponible: true },
  { id: "6", nombre: "Frito Extra 2", precio: 2000, categoria: "Fritos", imagen: "/frito6.jpg", disponible: true },
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.jpg", disponible: true },
  { id: "8", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelo.jpg", disponible: true },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", esDesayuno: true, imagen: "/desayuno.jpg", disponible: true },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", esDesayuno: true, imagen: "/desayuno-especial.jpg", disponible: true },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", imagen: "/coca-cola.jpg", disponible: true, tamanos: [{ nombre: "Mini 250ml", precio: 2500, disponible: true }, { nombre: "Personal 400ml", precio: 3500, disponible: true }, { nombre: "Familiar 1.5L", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", imagen: "/pony.jpg", disponible: true, tamanos: [{ nombre: "Mini 250ml", precio: 2500, disponible: true }, { nombre: "Personal 400ml", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", imagen: "/agua.jpg", disponible: true },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", imagen: "/jugo-natural.jpg", disponible: true, opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", esArroz: true, imagen: "/arroz-pollo.jpg", disponible: true }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Tajada de Queso", disponible: true, precio: 1000 }
];

const MONO_NARANJA = "#f97316";
const MONO_AMARILLO = "#fef3c7";
const MONO_CREMA = "#fffbeb";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");
  const [productosFB, setProductosFB] = useState([]);
  const [extrasFB, setExtrasFB] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [notificacion, setNotificacion] = useState("");

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [sabores, setSabores] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [tamanosBebida, setTamanosBebida] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);
  const [conQueso, setConQueso] = useState(false);

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { if (s.exists()) setTiendaAbierta(s.data().abierta); });
    return () => { unsubProd(); unsubExtras(); unsubTienda(); };
  }, []);

  const obtenerListaLimpia = () => {
    const mapa = {};
    productosBase.forEach(p => mapa[p.id] = p);
    productosFB.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
    return Object.values(mapa);
  };

  const productosMostrar = obtenerListaLimpia();
  const extrasArrozMostrar = extrasFB.length > 0 ? extrasFB : extrasArrozBase;

  const guardarCambio = async (col, id, datos) => {
    try { await setDoc(doc(db, col, id), datos, { merge: true }); } 
    catch (e) { console.error(e); }
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return;
    try {
      const cant = Number(cantidades[p.id] || 1);
      let precioBase = Number(p.precio || 0);
      let sabor = "";
      let detallesExtra = "";

      if (p.esArroz || p.categoria === "Arroces") {
        if (!acompañanteArroz) return alert("Elige Acompañante");
        const h = extrasArrozMostrar.find(e => e.id === 'huevo');
        const q = extrasArrozMostrar.find(e => e.id === 'queso');
        if (conHuevo && h?.disponible) precioBase += Number(h.precio);
        if (conQueso && q?.disponible) precioBase += Number(q.precio);
        detallesExtra = `(Con ${acompañanteArroz}${conHuevo ? ' + Huevo' : ''}${conQueso ? ' + Queso' : ''})`;
      } else if (p.opciones && p.categoria === "Fritos") {
        sabor = sabores[p.id];
        if (!sabor) return alert("Por favor elige un sabor");
      }

      if (p.tamanos) {
        const tam = tamanosBebida[p.id];
        if (!tam) return alert("Elige tamaño");
        const tObj = p.tamanos.find(t => t.nombre === tam);
        if (tObj) precioBase = Number(tObj.precio);
        detallesExtra = `(${tam})`;
      }

      setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, subtotal: precioBase * cant, cantidad: cant, saborElegido: sabor, detallesArroz: detallesExtra }]);
      setNotificacion("¡Añadido! 🥟");
      setTimeout(() => setNotificacion(""), 2000);
    } catch (e) { console.error(e); }
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{width: '45px', height: '24px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'}}>
      <div style={{width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '24px' : '3px', transition: '0.3s'}}/>
    </div>
  );

  // 🟢 VISTA ADMIN (CON CAMBIO DE PRECIOS)
  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <button onClick={() => setIsAdmin(false)} style={{padding:'10px', borderRadius:'10px', cursor:'pointer'}}>← Volver a la Tienda</button>
        <h2 style={{color: MONO_NARANJA}}>Panel de Administración 🐒</h2>
        
        {/* EDITAR PRODUCTOS */}
        <div style={{background:'white', padding:'20px', borderRadius:'20px', marginBottom:'20px'}}>
          <h3>Precios y Disponibilidad</h3>
          {productosMostrar.map(p => (
            <div key={p.id} style={{padding:'10px 0', borderBottom:'1px solid #eee'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{flex:1}}>
                  <strong>{p.nombre}</strong><br/>
                  <small style={{color:'gray'}}>ID: {p.id}</small>
                </div>
                
                {/* PRECIO (Si no tiene tamaños múltiples) */}
                {!p.tamanos && (
                  <input 
                    type="number" 
                    defaultValue={p.precio} 
                    onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })}
                    style={{width:'80px', padding:'8px', borderRadius:'8px', border:'1px solid #ddd', marginRight:'15px'}}
                  />
                )}
                
                <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
              </div>

              {/* EDITAR PRECIOS DE TAMAÑOS (Bebidas) */}
              {p.tamanos && (
                <div style={{marginTop:'10px', background:'#f9f9f9', padding:'10px', borderRadius:'10px'}}>
                  {p.tamanos.map((t, idx) => (
                    <div key={idx} style={{display:'flex', justifyContent:'space-between', marginTop:'5px', alignItems:'center'}}>
                      <span>{t.nombre}</span>
                      <input 
                        type="number" 
                        defaultValue={t.precio} 
                        onBlur={(e) => {
                          const nuevosTam = [...p.tamanos];
                          nuevosTam[idx].precio = Number(e.target.value);
                          guardarCambio("productos", p.id, { tamanos: nuevosTam });
                        }}
                        style={{width:'80px', padding:'5px', borderRadius:'5px', border:'1px solid #ccc'}}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* EDITAR EXTRAS DEL ARROZ */}
        <div style={{background:'white', padding:'20px', borderRadius:'20px'}}>
          <h3>Precios de Extras (Arroz)</h3>
          {extrasArrozMostrar.filter(e => e.id === 'huevo' || e.id === 'queso').map(e => (
            <div key={e.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0'}}>
              <span>{e.nombre}</span>
              <input 
                type="number" 
                defaultValue={e.precio} 
                onBlur={(ev) => guardarCambio("extrasArroz", e.id, { precio: Number(ev.target.value) })}
                style={{width:'80px', padding:'8px', borderRadius:'8px', border:'1px solid #ddd'}}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 🔵 VISTA CLIENTE (Igual que antes)
  return (
    <div style={{fontFamily: 'system-ui, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '120px', color: MONO_TEXTO}}>
      {/* ... Resto del código del cliente ... */}
      {notificacion && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: MONO_VERDE, color: 'white', padding: '15px 30px', borderRadius: '50px', zIndex: 3000, fontWeight: 'bold' }}>{notificacion}</div>
      )}

      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{width: '100%', height: '220px', objectFit: 'cover'}} />
        <h1 onDoubleClick={() => setIsAdmin(true)} style={{color: MONO_NARANJA, margin: '15px 0', cursor:'pointer'}}>Fritos El Mono 🐒</h1>
        <p style={{paddingBottom: '20px'}}>Hoy Arroz de <strong>{tipoArrozHoy}</strong></p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', cursor: 'pointer' }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '0 20px'}}>
        {productosMostrar
          .filter(p => (p.categoria || (p.esArroz ? "Arroces" : "Fritos")) === categoriaActiva)
          .map(p => (
            <div key={p.id} style={{background: 'white', borderRadius: '25px', overflow: 'hidden', padding: '15px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
              <img src={p.imagen} style={{width: '100%', height: '180px', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none', borderRadius: '15px'}} alt={p.nombre} />
              <h3 style={{margin: '15px 0 5px 0'}}>{p.nombre}</h3>
              <p style={{color: MONO_NARANJA, fontWeight: 'bold', fontSize: '20px'}}>${(p.precio || (p.tamanos ? p.tamanos[0].precio : 0)).toLocaleString()}</p>

              {(p.esArroz || p.categoria === "Arroces") && (
                <div style={{background: MONO_AMARILLO, padding: '10px', borderRadius: '15px', marginTop: '10px'}}>
                  <select onChange={(e) => setAcompañanteArroz(e.target.value)} style={{width:'100%', padding:'8px', borderRadius:'10px', border:'none'}}>
                    <option value="">¿Tajada o Yuca?</option>
                    <option value="Tajadas">Tajadas</option><option value="Yuca">Yuca</option>
                  </select>
                  <label style={{display:'block', marginTop:'5px'}}><input type="checkbox" onChange={(e) => setConHuevo(e.target.checked)} /> + Huevo Extra</label>
                  <label style={{display:'block'}}><input type="checkbox" onChange={(e) => setConQueso(e.target.checked)} /> + Queso Extra</label>
                </div>
              )}

              {p.opciones && p.categoria === "Fritos" && (
                <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} style={{width:'100%', padding:'12px', borderRadius:'15px', border:'1px solid #ddd', marginTop:'10px'}}>
                  <option value="">-- Elige Sabor --</option>
                  {p.opciones.map(opt => <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre}</option>)}
                </select>
              )}

              {p.tamanos && (
                <select onChange={(e) => setTamanosBebida({...tamanosBebida, [p.id]: e.target.value})} style={{width:'100%', padding:'12px', borderRadius:'15px', border:`2px solid ${MONO_NARANJA}`, marginTop:'10px'}}>
                  <option value="">-- Elige Tamaño --</option>
                  {p.tamanos.map(t => <option key={t.nombre} value={t.nombre} disabled={!t.disponible}>{t.nombre} - ${t.precio.toLocaleString()}</option>)}
                </select>
              )}

              <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'auto', paddingTop:'15px'}}>
                  <div style={{display:'flex', alignItems:'center', background:'#f0f2f5', borderRadius:'10px'}}>
                    <button onClick={() => setCantidades({...cantidades, [p.id]: (cantidades[p.id] || 1) - 1})} style={{padding:'5px 10px', border:'none', background:'none'}}>-</button>
                    <span style={{padding:'0 5px'}}>{cantidades[p.id] || 1}</span>
                    <button onClick={() => setCantidades({...cantidades, [p.id]: (cantidades[p.id] || 1) + 1})} style={{padding:'5px 10px', border:'none', background:'none'}}>+</button>
                  </div>
                  <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible} style={{flex:1, background: MONO_NARANJA, color:'white', border:'none', padding:'12px', borderRadius:'15px', fontWeight:'bold', cursor:'pointer'}}>Añadir 🥟</button>
              </div>
            </div>
          ))}
      </div>

      {pedido.length > 0 && (
        <div style={{maxWidth: '700px', margin: '40px auto', background: 'white', padding: '25px', borderRadius: '30px', border: `3px solid ${MONO_NARANJA}`, boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginTop:0}}>Tu Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
              <span>{item.cantidad}x {item.nombre} <small>({item.saborElegido} {item.detallesArroz})</small></span>
              <strong>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}
          <h2 style={{textAlign:'right', color: MONO_NARANJA}}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{padding:'12px', borderRadius:'10px', border:'1px solid #ddd'}} />
            <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{padding:'12px', borderRadius:'10px', border:'1px solid #ddd'}} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{padding:'12px', borderRadius:'10px', border:'1px solid #ddd'}}>
              <option value="">¿Cómo pagas?</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={() => {
               const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}`).join('\n');
               const msg = `¡Hola! Pedido Fritos El Mono 🐒:\n\n${lista}\n\n*Total: $${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
               window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
            }} style={{background: MONO_VERDE, color:'white', padding:'15px', borderRadius:'15px', border:'none', fontWeight:'bold', cursor:'pointer'}}>Confirmar Pedido 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}