import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa-huevo.jpg", disponible: true },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.jpg", disponible: true },
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.jpg", disponible: true },
  { id: "8", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelo.jpg", disponible: true },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", esDesayuno: true, imagen: "/desayuno.jpg", disponible: true },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", esDesayuno: true, imagen: "/desayuno-especial.jpg", disponible: true },
  { id: "5", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", esArroz: true, imagen: "/arroz-pollo.jpg", disponible: true },
  { id: "6", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", imagen: "/jugo-natural.jpg", disponible: true, opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", imagen: "/coca-cola.jpg", disponible: true, tamanos: [{ nombre: "Mini 250ml", precio: 2500, disponible: true }, { nombre: "Personal 400ml", precio: 3500, disponible: true }, { nombre: "Familiar 1.5L", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", imagen: "/pony.jpg", disponible: true, tamanos: [{ nombre: "Mini 250ml", precio: 2500, disponible: true }, { nombre: "Personal 400ml", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", imagen: "/agua.jpg", disponible: true }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Tajada de Queso", disponible: true, precio: 1000 }
];

const salsasBase = [
  { id: "s1", nombre: "Pique", disponible: true },
  { id: "s2", nombre: "Salsa Roja", disponible: true },
  { id: "s3", nombre: "Salsa Rosada", disponible: true },
  { id: "s4", nombre: "Suero", disponible: true },
  { id: "s5", nombre: "Suero Picante", disponible: true }
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
  const [productos, setProductos] = useState([]);
  const [extrasArroz, setExtrasArroz] = useState([]);
  const [salsas, setSalsas] = useState([]);
  const [notificacion, setNotificacion] = useState("");
  const [pedido, setPedido] = useState(() => {
    try {
      const guardado = localStorage.getItem("carrito_mono");
      return guardado ? JSON.parse(guardado) : [];
    } catch (e) { return []; }
  });

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [sabores, setSabores] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [tamanosBebida, setTamanosBebida] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);
  const [conQueso, setConQueso] = useState(false);
  const [salsasElegidas, setSalsasElegidas] = useState([]);

  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  const productosMostrar = productos.length > 0 ? productos : productosBase;
  const extrasArrozMostrar = extrasArroz.length > 0 ? extrasArroz : extrasArrozBase;
  const salsasMostrar = salsas.length > 0 ? salsas : salsasBase;

  useEffect(() => {
    localStorage.setItem("carrito_mono", JSON.stringify(pedido));
  }, [pedido]);

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (snap) => setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (snap) => setExtrasArroz(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSalsas = onSnapshot(collection(db, "salsas"), (snap) => setSalsas(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (snap) => {
      if (snap.exists()) setTiendaAbierta(snap.data().abierta);
    });
    return () => { unsubProd(); unsubExtras(); unsubSalsas(); unsubTienda(); };
  }, []);

  const actualizarDoc = (coleccion, id, datos) => updateDoc(doc(db, coleccion, id), datos).catch(e => console.error(e));

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("El carrito está vacío");
    if (!nombre || !direccion || !metodoPago) return alert("Llena tus datos de entrega");
    const listaFritos = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}`).join('\n');
    const mensaje = `¡Hola! Pedido Fritos El Mono 🐒:\n\n${listaFritos}\n\n🧂 Salsas: ${salsasElegidas.join(', ') || 'Ninguna'}\n\n*Total: $${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString('es-CO')}*\n👤 Cliente: ${nombre}\n📍 Dirección: ${direccion}\n💰 Pago: ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(mensaje)}`);
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return;
    try {
      const cant = Number(cantidades[p.id] || 1);
      let precioBase = Number(p.precio || 0);
      let sabor = "";
      let detallesExtra = "";

      if (p.esArroz) {
        if (!acompañanteArroz) return alert("Elige Tajadas o Yuca");
        sabor = `Arroz de ${tipoArrozHoy}`;
        const h = extrasArrozMostrar.find(e => e.id === 'huevo') || { precio: 1000, disponible: true };
        const q = extrasArrozMostrar.find(e => e.id === 'queso') || { precio: 1000, disponible: true };
        if (conHuevo && h.disponible) precioBase += Number(h.precio);
        if (conQueso && q.disponible) precioBase += Number(q.precio);
        detallesExtra = `(Con ${acompañanteArroz}${conHuevo && h.disponible ? ' + Huevo' : ''}${conQueso && q.disponible ? ' + Queso' : ''})`;
      } else if (p.opciones && !p.esArroz) {
        sabor = sabores[p.id];
        if (!sabor) return alert("Por favor elige un sabor");
      }

      if (p.tamanos) {
        const tam = tamanosBebida[p.id];
        if (!tam) return alert("Por favor elige el tamaño");
        const tObj = p.tamanos.find(t => t.nombre === tam);
        if (tObj) precioBase = Number(tObj.precio);
        detallesExtra = `(${tam})`;
      }

      setPedido(prev => [...prev, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioBase, saborElegido: sabor, detallesArroz: detallesExtra, cantidad: cant, subtotal: precioBase * cant }]);
      setNotificacion(`¡${p.nombre} añadido! 🥟`);
      setTimeout(() => setNotificacion(""), 2000);
      setCantidades({...cantidades, [p.id]: 1});
    } catch (e) { alert("Error al añadir"); }
  };

  const accesoSecreto = () => {
    const clave = window.prompt("🔐 PIN:");
    if (clave === "mono2026") setIsAdmin(true);
  };

  const restaurarBaseDeDatos = async () => {
    if(!window.confirm("¿Sincronizar todo?")) return;
    try {
      await setDoc(doc(db, "ajuste", "tienda"), { abierta: true });
      for (const p of productosBase) await setDoc(doc(db, "productos", p.id), p);
      for (const e of extrasArrozBase) await setDoc(doc(db, "extrasArroz", e.id), e);
      for (const s of salsasBase) await setDoc(doc(db, "salsas", s.id), s);
      alert("✅ Menú Sincronizado");
    } catch (e) { alert("Error"); }
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{width: '45px', height: '24px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'}}>
      <div style={{width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '24px' : '3px', transition: '0.3s'}}/>
    </div>
  );

  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <button onClick={() => setIsAdmin(false)} style={{padding:'10px 20px', borderRadius:'10px', cursor:'pointer', marginBottom:'20px'}}>← Volver</button>
          
          <div style={{background:'white', padding:'25px', borderRadius:'25px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', marginBottom:'20px'}}>
            <h1 style={{color: MONO_NARANJA}}>Admin 🐒</h1>
            <p>Negocio: <strong>{tiendaAbierta ? 'ABIERTO' : 'CERRADO'}</strong></p>
            <button onClick={() => actualizarDoc("ajuste", "tienda", { abierta: !tiendaAbierta })} style={{background: MONO_TEXTO, color:'white', padding:'12px', borderRadius:'10px', width:'100%'}}>{tiendaAbierta ? 'Cerrar Negocio' : 'Abrir Negocio'}</button>
          </div>

          <div style={{background:'white', borderRadius:'25px', padding:'20px', marginBottom:'20px'}}>
            <h3>Extras y Salsas</h3>
            {extrasArrozMostrar.concat(salsasMostrar).map(e => (
              <div key={e.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                <span>{e.nombre}</span>
                <MiniSwitch activo={e.disponible} onClick={() => actualizarDoc(e.id.startsWith('s') ? "salsas" : "extrasArroz", e.id, { disponible: !e.disponible })} />
              </div>
            ))}
          </div>

          <div style={{background:'white', borderRadius:'25px', padding:'20px'}}>
            <h3>Menú Principal</h3>
            {productosMostrar.map(p => (
              <div key={p.id} style={{padding:'15px 0', borderBottom:'2px solid #f0f0f0'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <strong>{p.nombre}</strong>
                  <MiniSwitch activo={p.disponible} onClick={() => actualizarDoc("productos", p.id, { disponible: !p.disponible })} />
                </div>
                
                {/* 🛠️ SWITCHES PARA SABORES (EMPANADAS/PAPAS) */}
                {p.opciones && (
                  <div style={{marginTop:'10px', background:'#f9f9f9', padding:'10px', borderRadius:'10px'}}>
                    <small>Gestionar Sabores:</small>
                    {p.opciones.map((opt, index) => (
                      <div key={index} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'5px'}}>
                        <span>{opt.nombre}</span>
                        <MiniSwitch activo={opt.disponible} onClick={() => {
                          const nuevasOp = [...p.opciones];
                          nuevasOp[index].disponible = !nuevasOp[index].disponible;
                          actualizarDoc("productos", p.id, { opciones: nuevasOp });
                        }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* 🛠️ SWITCHES PARA TAMAÑOS (BEBIDAS) */}
                {p.tamanos && (
                  <div style={{marginTop:'10px', background:'#f0f7ff', padding:'10px', borderRadius:'10px'}}>
                    <small>Gestionar Tamaños:</small>
                    {p.tamanos.map((tam, index) => (
                      <div key={index} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'5px'}}>
                        <span>{tam.nombre}</span>
                        <MiniSwitch activo={tam.disponible} onClick={() => {
                          const nuevosTam = [...p.tamanos];
                          nuevosTam[index].disponible = !nuevosTam[index].disponible;
                          actualizarDoc("productos", p.id, { tamanos: nuevosTam });
                        }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={restaurarBaseDeDatos} style={{marginTop:'30px', color:'red', background:'none', border:'none', width:'100%', cursor:'pointer'}}>Sincronizar Datos 🔄</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{fontFamily: 'system-ui, sans-serif', backgroundColor: MONO_CREMA, minHeight: '100vh', paddingBottom: '120px', color: MONO_TEXTO}}>
      
      {notificacion && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: MONO_VERDE, color: 'white', padding: '15px 30px', borderRadius: '50px', zIndex: 3000, fontWeight: 'bold' }}>{notificacion}</div>
      )}

      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Banner" style={{width: '100%', height: '220px', objectFit: 'cover'}} />
        <h1 onDoubleClick={accesoSecreto} style={{color: MONO_NARANJA, margin: '15px 0', cursor:'pointer'}}>Fritos El Mono 🐒</h1>
        <p style={{paddingBottom: '20px'}}>Hoy Arroz de <strong>{tipoArrozHoy}</strong></p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
        {productosMostrar
          .filter(p => (p.categoria || (p.esArroz ? "Arroces" : p.esDesayuno ? "Desayunos" : "Fritos")) === categoriaActiva)
          .map(p => (
            <div key={p.id} style={{background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'}}>
              <img src={p.imagen} style={{width: '100%', height: '200px', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none'}} alt={p.nombre} />
              <div style={{padding: '20px', flexGrow: 1, display:'flex', flexDirection:'column'}}>
                <h3 style={{margin: '0 0 10px 0'}}>{p.nombre}</h3>
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '24px', marginBottom: '15px'}}>
                  {p.tamanos ? `$${p.tamanos[0].precio.toLocaleString()} - $${p.tamanos[p.tamanos.length-1].precio.toLocaleString()}` : `$${(Number(p.precio) || 0).toLocaleString()}`}
                </p>

                {p.esArroz && (
                  <div style={{background: MONO_AMARILLO, padding: '15px', borderRadius: '20px', marginBottom: '15px'}}>
                    <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width:'100%', padding:'10px', borderRadius:'10px', border:'1px solid #ddd', marginBottom:'10px'}}>
                      <option value="">¿Acompañante?</option>
                      <option value="Tajadas" disabled={!(extrasArrozMostrar.find(e=>e.id==='tajada')?.disponible)}>Tajadas {!(extrasArrozMostrar.find(e=>e.id==='tajada')?.disponible) && "(AGOTADO)"}</option>
                      <option value="Yuca" disabled={!(extrasArrozMostrar.find(e=>e.id==='yuca')?.disponible)}>Yuca {!(extrasArrozMostrar.find(e=>e.id==='yuca')?.disponible) && "(AGOTADO)"}</option>
                    </select>
                    {extrasArrozMostrar.find(e=>e.id==='huevo')?.disponible && <label style={{display:'block'}}><input type="checkbox" checked={conHuevo} onChange={(e) => setConHuevo(e.target.checked)} /> + Huevo</label>}
                    {extrasArrozMostrar.find(e=>e.id==='queso')?.disponible && <label style={{display:'block'}}><input type="checkbox" checked={conQueso} onChange={(e) => setConQueso(e.target.checked)} /> + Queso</label>}
                  </div>
                )}

                {/* ✅ CORRECCION: SOLO MOSTRAR SI NO ES ARROZ Y TIENE OPCIONES DISPONIBLES */}
                {p.opciones && !p.esArroz && (
                  <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} value={sabores[p.id] || ""} style={{width:'100%', padding:'12px', borderRadius:'15px', border:'1px solid #ddd', marginBottom:'15px'}}>
                    <option value="">-- Elige Sabor --</option>
                    {p.opciones.map(opt => <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre} {!opt.disponible && "(AGOTADO)"}</option>)}
                  </select>
                )}

                {p.tamanos && (
                  <select onChange={(e) => setTamanosBebida({...tamanosBebida, [p.id]: e.target.value})} value={tamanosBebida[p.id] || ""} style={{width:'100%', padding:'12px', borderRadius:'15px', border:`2px solid ${MONO_NARANJA}`, marginBottom:'15px', fontWeight:'bold'}}>
                    <option value="">-- Elige Presentación --</option>
                    {p.tamanos.map(t => <option key={t.nombre} value={t.nombre} disabled={!t.disponible}>{t.nombre} {!t.disponible && "(AGOTADO)"} - ${t.precio.toLocaleString()}</option>)}
                  </select>
                )}

                <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'auto'}}>
                  <div style={{display:'flex', alignItems:'center', background:'#f0f2f5', borderRadius:'15px', padding:'5px'}}>
                    <button onClick={() => { const val = (cantidades[p.id] || 1); if(val > 1) setCantidades({...cantidades, [p.id]: val - 1}) }} style={{width:'35px', height:'35px', border:'none', background:'white', borderRadius:'10px', fontWeight:'bold'}}>-</button>
                    <span style={{padding:'0 15px', fontWeight:'bold'}}>{cantidades[p.id] || 1}</span>
                    <button onClick={() => setCantidades({...cantidades, [p.id]: (cantidades[p.id] || 1) + 1})} style={{width:'35px', height:'35px', border:'none', background: MONO_NARANJA, color:'white', borderRadius:'10px', fontWeight:'bold'}}>+</button>
                  </div>
                  <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible || !tiendaAbierta} style={{flex:1, background: MONO_NARANJA, color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold', cursor:'pointer'}}>Añadir 🥟</button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{ maxWidth: '750px', margin: '40px auto', background: 'white', padding: '35px', borderRadius: '35px', border: `5px solid ${MONO_NARANJA}`, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <h2 style={{margin:0}}>Tu Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <span>{item.cantidad}x {item.nombre} <small>({item.saborElegido} {item.detallesArroz})</small></span>
              <div>
                <strong>${item.subtotal.toLocaleString()}</strong>
                <button onClick={() => setPedido(pedido.filter(i => i.idUnico !== item.idUnico))} style={{marginLeft:'10px', color:'red', border:'none', background:'none', cursor:'pointer'}}>✕</button>
              </div>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '32px' }}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '25px' }}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{padding:'15px', borderRadius:'15px', border:'1px solid #ddd'}} />
            <input type="text" placeholder="Dirección / Barrio" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{padding:'15px', borderRadius:'15px', border:'1px solid #ddd'}} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{padding:'15px', borderRadius:'15px', border:'1px solid #ddd'}}>
              <option value="">¿Cómo pagas?</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={enviarWhatsApp} style={{ background: MONO_VERDE, color: 'white', padding: '20px', borderRadius: '20px', fontWeight: 'bold', border:'none', fontSize:'18px', cursor:'pointer' }}>Confirmar Pedido 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}