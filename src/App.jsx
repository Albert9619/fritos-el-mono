import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS (CÓDIGO BASE - SAGRADO)
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.png", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.png", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.png" },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/area-huevo.png" }, // Corregí el nombre según tu carpeta
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.png" },
  { id: "8", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelo.png" },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", imagen: "/desayuno-carne.png" },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", imagen: "/desayuno-huevo.png" },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", imagen: "/jugo-natural.png", tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", imagen: "/cocacola.png", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }, { nombre: "Familiar", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", imagen: "/malta.png", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", imagen: "/agua.png" },
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", imagen: "/arroz-pollo.png" }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Tajada de Queso", disponible: true, precio: 1000 }
];

const MONO_NARANJA = "#f97316";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");
  const [productosFB, setProductosFB] = useState([]);
  const [extrasFB, setExtrasFB] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [selecciones, setSelecciones] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [notificacion, setNotificacion] = useState("");

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { if (s.exists()) setTiendaAbierta(s.data().abierta); });
    return () => { unsubProd(); unsubExtras(); unsubTienda(); };
  }, []);

  useEffect(() => {
    const pedidoGuardado = localStorage.getItem("pedido_mono_storage");
    if (pedidoGuardado) setPedido(JSON.parse(pedidoGuardado));
  }, []);

  useEffect(() => {
    localStorage.setItem("pedido_mono_storage", JSON.stringify(pedido));
  }, [pedido]);

  const fusionar = (base, fb) => {
    const mapa = {};
    base.forEach(p => mapa[p.id] = p);
    fb.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
    return Object.values(mapa);
  };

  const productosMostrar = fusionar(productosBase, productosFB);
  const extrasMostrar = fusionar(extrasArrozBase, extrasFB);

  const guardarCambio = async (col, id, datos) => {
    try { await setDoc(doc(db, col, id), datos, { merge: true }); } 
    catch (e) { console.error("Error Firebase:", e); }
  };

  const agregarAlCarrito = (p) => {
    const sel = selecciones[p.id] || {};
    const cant = cantidades[p.id] || 1;
    if (p.opciones && !sel.sabor && p.categoria === "Fritos") return alert("Elige un sabor");
    if (p.tamanos && !sel.tamano) return alert("Elige el tamaño");
    let precioBase = p.precio || 0;
    if (sel.tamano) precioBase = sel.tamano.precio;
    const extrasPrice = (sel.extras || []).reduce((acc, id) => {
      const ex = extrasMostrar.find(e => e.id === id);
      return acc + (ex?.precio || 0);
    }, 0);
    const subtotal = (precioBase + extrasPrice) * cant;
    const detalle = `${sel.sabor || ''} ${sel.tamano?.nombre || ''} ${sel.extras ? ' Extras: '+sel.extras.join(', ') : ''}`;
    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, cantidad: cant, subtotal, detalle }]);
    setCantidades({ ...cantidades, [p.id]: 1 });
    setNotificacion(`¡${cant}x ${p.nombre} añadido! 🥟`);
    setTimeout(() => setNotificacion(""), 2000);
  };

  const vaciarCarrito = () => { if (window.confirm("¿Vaciar todo el pedido?")) setPedido([]); };

  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos de entrega");
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.detalle}`).join('\n');
    const totalP = pedido.reduce((acc, i) => acc + i.subtotal, 0);
    const msg = `¡Hola! Pedido Fritos El Mono 🐒:\n\n${lista}\n\n*Total: $${totalP.toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{ width: '46px', height: '24px', backgroundColor: activo ? MONO_VERDE : '#cbd5e1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s', flexShrink: 0 }}>
      <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '25px' : '3px', transition: '0.3s cubic-bezier(0.18, 0.89, 0.35, 1.15)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
    </div>
  );

  // 🟢 VISTA ADMIN (CORREGIDA CON TODOS LOS SWITCHES)
  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px', alignItems: 'center'}}>
            <h1 style={{color: MONO_NARANJA, margin: 0}}>Panel Admin 🐒</h1>
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
               <span style={{fontWeight:'bold'}}>Tienda:</span>
               <MiniSwitch activo={tiendaAbierta} onClick={() => guardarCambio("ajuste", "tienda", { abierta: !tiendaAbierta })} />
               <button onClick={() => setIsAdmin(false)} style={{padding:'10px 20px', borderRadius:'12px', background:MONO_TEXTO, color:'white', border:'none', cursor:'pointer'}}>Cerrar</button>
            </div>
          </div>

          {["Fritos", "Arroces", "Bebidas", "Desayunos"].map(cat => (
            <div key={cat} style={{background:'white', padding:'25px', borderRadius:'25px', marginBottom:'25px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
              <h2 style={{borderBottom:'2px solid #eee', paddingBottom:'10px', marginBottom:'15px'}}>{cat}</h2>
              {productosMostrar.filter(p => p.categoria === cat).map(p => (
                <div key={p.id} style={{padding:'15px 0', borderBottom:'1px solid #f8fafc'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <strong style={{fontSize:'17px'}}>{p.nombre}</strong>
                    <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                      {!p.tamanos && <div>$ <input type="number" defaultValue={p.precio} onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })} style={{width:'80px', padding:'5px', borderRadius:'8px', border:'1px solid #ddd'}} /></div>}
                      <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
                    </div>
                  </div>

                  {/* SWITCHES DE SABORES (PARA LOS FRITOS) */}
                  {p.opciones && cat === "Fritos" && (
                    <div style={{marginTop:'15px', display:'flex', flexWrap:'wrap', gap:'12px', background:'#f8fafc', padding:'12px', borderRadius:'15px'}}>
                      {p.opciones.map((opt, idx) => (
                        <div key={idx} style={{display:'flex', alignItems:'center', gap:'8px', background:'white', padding:'5px 12px', borderRadius:'12px', border:'1px solid #e2e8f0'}}>
                          <small style={{fontWeight:'bold'}}>{opt.nombre}</small>
                          <MiniSwitch activo={opt.disponible} onClick={() => {
                            const n = [...p.opciones]; n[idx].disponible = !n[idx].disponible;
                            guardarCambio("productos", p.id, { opciones: n });
                          }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SWITCHES DE TAMAÑOS Y PRECIOS (PARA BEBIDAS) */}
                  {p.tamanos && (
                    <div style={{marginTop:'15px', display:'grid', gap:'10px'}}>
                      {p.tamanos.map((t, idx) => (
                        <div key={idx} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f0f9ff', padding:'10px 15px', borderRadius:'15px'}}>
                          <small style={{fontWeight:'bold'}}>{t.nombre}</small>
                          <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                            <div style={{background:'white', padding:'3px 8px', borderRadius:'8px', border:'1px solid #bae6fd'}}>
                              $ <input type="number" defaultValue={t.precio} onBlur={(e) => {
                                const n = [...p.tamanos]; n[idx].precio = Number(e.target.value);
                                guardarCambio("productos", p.id, { tamanos: n });
                              }} style={{width:'65px', border:'none', textAlign:'center', fontWeight:'bold'}} />
                            </div>
                            <MiniSwitch activo={t.disponible} onClick={() => {
                              const n = [...p.tamanos]; n[idx].disponible = !n[idx].disponible;
                              guardarCambio("productos", p.id, { tamanos: n });
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 🔵 VISTA CLIENTE (VIRTUALIZADA CON DETALLES ESTÉTICOS Y PRECIO DINÁMICO)
  return (
    <div style={{fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px', color: MONO_TEXTO}}>
      <style>{`
        .card-mono { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-mono:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; }
        .img-mono { transition: transform 0.5s ease; }
        .card-mono:hover .img-mono { transform: scale(1.08); }
        .price-tag { transition: all 0.2s ease; }
      `}</style>

      {notificacion && (
        <div style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background: MONO_VERDE, color:'white', padding:'15px 30px', borderRadius:'50px', zIndex: 10000, fontWeight:'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.2)'}}>{notificacion}</div>
      )}

      {pedido.length > 0 && (
        <div onClick={() => document.getElementById('carrito_seccion')?.scrollIntoView({ behavior: 'smooth' })} style={{position: 'fixed', bottom: '30px', right: '30px', background: MONO_NARANJA, color: 'white', width: '75px', height: '75px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.5)', zIndex: 9999, cursor: 'pointer', border: '3px solid white'}}>🛒<span style={{position:'absolute', top:'-5px', right:'-5px', background:'red', color: 'white', fontSize:'14px', minWidth:'22px', height:'22px', borderRadius:'50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', border: '2px solid white'}}>{pedido.length}</span></div>
      )}

      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 50px 50px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{width: '100%', height: '250px', objectFit: 'cover'}} />
        <div style={{padding: '30px 0'}}>
            <h1 onDoubleClick={() => { const pin = window.prompt("🔐 PIN:"); if(pin === "mono2026") setIsAdmin(true); }} style={{color: MONO_NARANJA, cursor:'pointer', margin:'0', fontSize: '2.5rem', fontWeight: '900'}}>Fritos El Mono 🐒</h1>
            <div style={{display:'inline-block', marginTop: '15px', background: '#fff7ed', padding: '8px 25px', borderRadius: '25px', border: '1px solid #ffedd5', color: '#9a3412', fontWeight: 'bold'}}>
                🔥 Arroz de Hoy: <span style={{color: MONO_NARANJA}}>{tipoArrozHoy}</span>
            </div>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', overflowX:'auto', padding:'10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '15px 30px', borderRadius: '35px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : '#333', fontWeight: '900', cursor:'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: '0.3s' }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '30px', padding: '0 20px', maxWidth:'1300px', margin:'0 auto'}}>
        {productosMostrar.filter(p => (p.categoria || 'Fritos') === categoriaActiva).map(p => {
            const sel = selecciones[p.id] || {};
            const cant = cantidades[p.id] || 1;
            const esFavorito = p.id === "4" || p.id === "lzEcQicq9WUrxw7FEaq7";

            const precioUnitario = p.tamanos 
              ? (sel.tamano ? sel.tamano.precio : p.tamanos[0].precio)
              : (p.precio || 0);
            const precioTotalMostrado = precioUnitario * cant;

            return (
              <div key={p.id} className="card-mono" style={{background: 'white', borderRadius: '40px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 20px rgba(0,0,0,0.02)', border:'1px solid #f1f5f9', position: 'relative'}}>
                {esFavorito && (
                  <div style={{position:'absolute', top: '15px', left: '15px', zIndex: 10, background: '#ef4444', color: 'white', padding: '6px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: '900', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'}}>⭐ EL FAVORITO</div>
                )}
                <div style={{ width: '100%', height: '200px', borderRadius: '25px', overflow: 'hidden', marginBottom: '20px' }}>
                  <img src={p.imagen} alt={p.nombre} className="img-mono" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none' }} onError={(e) => {e.target.onerror = null; e.target.src = "/logo-fritos-el-mono.jpg";}} />
                </div>
                <h3 style={{margin: '0 0 5px 0', fontSize: '22px', fontWeight: '800'}}>{p.nombre}</h3>
                <p className="price-tag" style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '28px', margin:'0 0 20px 0'}}>${precioTotalMostrado.toLocaleString()}</p>
                {p.categoria === "Fritos" && p.opciones && (
                  <select onChange={(e) => setSelecciones({...selecciones, [p.id]: {...sel, sabor: e.target.value}})} style={{width:'100%', padding:'15px', borderRadius:'20px', border:'2px solid #f8fafc', marginBottom:'15px', background:'#f8fafc', fontWeight: 'bold', outline: 'none'}}>
                    <option value="">-- ¿Qué sabor quieres? --</option>
                    {p.opciones.filter(opt => opt.disponible).map(opt => <option key={opt.nombre} value={opt.nombre}>{opt.nombre}</option>)}
                  </select>
                )}
                {p.tamanos && (
                  <select onChange={(e) => {
                    const t = p.tamanos.find(x => x.nombre === e.target.value);
                    setSelecciones({...selecciones, [p.id]: {...sel, tamano: t}});
                  }} style={{width:'100%', padding:'15px', borderRadius:'20px', border:'2px solid #f8fafc', marginBottom:'15px', fontWeight: 'bold'}}>
                    <option value="">-- Elige el tamaño --</option>
                    {p.tamanos.filter(t => t.disponible).map(t => <option key={t.nombre} value={t.nombre}>{t.nombre}</option>)}
                  </select>
                )}
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'20px', marginBottom:'20px', background:'#f8fafc', padding:'12px', borderRadius:'25px'}}>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: Math.max(1, cant - 1)})} style={{width:'45px', height:'45px', borderRadius:'50%', border:'none', background:'white', fontWeight:'bold', fontSize: '20px', cursor:'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>-</button>
                   <span style={{fontWeight:'900', fontSize:'22px', minWidth: '35px', textAlign: 'center'}}>{cant}</span>
                   <button onClick={() => setCantidades({...cantidades, [p.id]: cant + 1})} style={{width:'45px', height:'45px', borderRadius:'50%', border:'none', background:MONO_NARANJA, color:'white', fontWeight:'bold', fontSize: '20px', cursor:'pointer', boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)'}}>+</button>
                </div>
                <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible || !tiendaAbierta} style={{marginTop:'auto', background: p.disponible ? MONO_NARANJA : '#cbd5e1', color:'white', border:'none', padding:'20px', borderRadius:'25px', fontWeight:'900', fontSize: '18px', cursor:'pointer', boxShadow: p.disponible ? '0 10px 20px rgba(249, 115, 22, 0.2)' : 'none'}}>Añadir al pedido 🛒</button>
              </div>
            );
        })}
      </div>

      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '800px', margin: '60px auto 100px', background: 'white', padding: '40px', borderRadius: '50px', border: `6px solid ${MONO_NARANJA}`, boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>🛒 Tu Pedido</h2>
            <button onClick={vaciarCarrito} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: 'bold', cursor:'pointer' }}>🗑️ Vaciar</button>
          </div>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f8fafc', padding: '20px 0', alignItems: 'center' }}>
              <span style={{fontSize: '18px'}}><strong>{item.cantidad}x</strong> {item.nombre} <br /><small style={{color: '#666', fontWeight: '600'}}>{item.detalle}</small></span>
              <strong style={{fontSize: '20px'}}>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '42px', fontWeight: '900', marginTop: '35px', borderTop: '4px dashed #eee', paddingTop: '20px' }}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
            <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '20px', borderRadius: '25px', border: '2px solid #f1f5f9', fontSize: '18px', outline: 'none' }} />
            <input type="text" placeholder="Dirección en Carepa" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ padding: '20px', borderRadius: '25px', border: '2px solid #f1f5f9', fontSize: '18px', outline: 'none' }} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ padding: '20px', borderRadius: '25px', border: '2px solid #f1f5f9', fontSize: '18px', fontWeight: 'bold' }}>
              <option value="">-- ¿Cómo vas a pagar? --</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', border: 'none', padding: '25px', borderRadius: '25px', fontWeight: '900', fontSize: '22px', cursor: 'pointer', boxShadow: '0 15px 30px rgba(22, 163, 74, 0.3)' }}>WhatsApp 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}