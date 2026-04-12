import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS (PLAN B)
// ==========================================
const productosBase = [
  { id: "empanada", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "arepa", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa-huevo.jpg", disponible: true },
  { id: "papas", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "pastel", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.jpg", disponible: true },
  { id: "palito", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.jpg", disponible: true },
  { id: "buñuelo", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelo.jpg", disponible: true },
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
  const [productosFB, setProductosFB] = useState([]);
  const [extrasFB, setExtrasFB] = useState([]);
  const [salsasFB, setSalsasFB] = useState([]);
  const [notificacion, setNotificacion] = useState("");
  const [pedido, setPedido] = useState([]);

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

  // ✅ FILTRO MAESTRO: Evita duplicados comparando NOMBRES
  const obtenerListaLimpia = () => {
    const mapa = {};
    // Primero cargamos lo de la base (IDs 1, 2, 3...)
    productosBase.forEach(p => mapa[p.nombre] = p);
    // Luego sobreescribimos con lo de Firebase (IDs raros o empanada, etc)
    productosFB.forEach(p => {
      // Si el nombre ya existe en el mapa, actualizamos ese objeto con la info de FB
      if (mapa[p.nombre]) {
        mapa[p.nombre] = { ...mapa[p.nombre], ...p };
      } else {
        // Si es un producto nuevo de Firebase (ej. un Arroz con ID raro), lo añadimos
        mapa[p.nombre] = p;
      }
    });
    return Object.values(mapa);
  };

  const productosMostrar = obtenerListaLimpia();
  const extrasArrozMostrar = extrasFB.length > 0 ? extrasFB : extrasArrozBase;
  const salsasMostrar = salsasFB.length > 0 ? salsasFB : salsasBase;

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubExtras = onSnapshot(collection(db, "extrasArroz"), (s) => setExtrasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSalsas = onSnapshot(collection(db, "salsas"), (s) => setSalsasFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { if (s.exists()) setTiendaAbierta(s.data().abierta); });
    return () => { unsubProd(); unsubExtras(); unsubSalsas(); unsubTienda(); };
  }, []);

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
        if (!acompañanteArroz) return alert("Elige Tajadas o Yuca");
        sabor = `Arroz de ${tipoArrozHoy}`;
        const h = extrasArrozMostrar.find(e => e.id === 'huevo');
        const q = extrasArrozMostrar.find(e => e.id === 'queso');
        if (conHuevo && h?.disponible) precioBase += Number(h.precio);
        if (conQueso && q?.disponible) precioBase += Number(q.precio);
        detallesExtra = `(Con ${acompañanteArroz}${conHuevo && h?.disponible ? ' + Huevo' : ''}${conQueso && q?.disponible ? ' + Queso' : ''})`;
      } else if (p.opciones && p.categoria === "Fritos") {
        sabor = sabores[p.id];
        if (!sabor) return alert("Por favor elige un sabor");
      }

      if (p.tamanos) {
        const tam = tamanosBebida[p.id];
        if (!tam) return alert("Elige el tamaño");
        const tObj = p.tamanos.find(t => t.nombre === tam);
        if (tObj) precioBase = Number(tObj.precio);
        detallesExtra = `(${tam})`;
      }

      setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, precioUnitario: precioBase, saborElegido: sabor, detallesArroz: detallesExtra, cantidad: cant, subtotal: precioBase * cant }]);
      setNotificacion(`¡Añadido! 🥟`);
      setTimeout(() => setNotificacion(""), 2000);
      setCantidades({...cantidades, [p.id]: 1});
    } catch (e) { alert("Error"); }
  };

  const enviarWhatsApp = () => {
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.saborElegido ? '('+i.saborElegido+')' : ''} ${i.detallesArroz || ''}`).join('\n');
    const msg = `¡Hola! Pedido Fritos El Mono 🐒:\n\n${lista}\n\n🧂 Salsas: ${salsasElegidas.join(', ') || 'Ninguna'}\n\n*Total: $${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString('es-CO')}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{width: '45px', height: '24px', backgroundColor: activo ? MONO_VERDE : '#ccc', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'}}>
      <div style={{width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '24px' : '3px', transition: '0.3s'}}/>
    </div>
  );

  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <button onClick={() => setIsAdmin(false)}>← Volver</button>
        <h2 style={{color: MONO_NARANJA}}>Admin 🐒</h2>
        {productosMostrar.map(p => (
          <div key={p.id} style={{background:'white', padding:'15px', borderRadius:'15px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div><strong>{p.nombre}</strong><br/><small>ID: {p.id}</small></div>
            <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
          </div>
        ))}
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
        <h1 onDoubleClick={() => setIsAdmin(true)} style={{color: MONO_NARANJA, margin: '15px 0', cursor:'pointer'}}>Fritos El Mono 🐒</h1>
        <p style={{paddingBottom: '20px'}}>Hoy Arroz de <strong>{tipoArrozHoy}</strong></p>
      </header>

      {/* CATEGORIAS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX: 'auto', padding: '10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
        {productosMostrar
          .filter(p => (p.categoria || (p.esArroz ? "Arroces" : "Fritos")) === categoriaActiva)
          .map(p => (
            <div key={p.id} style={{background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'}}>
              <img src={p.imagen} style={{width: '100%', height: '200px', objectFit: 'cover', filter: !p.disponible ? 'grayscale(1)' : 'none'}} alt={p.nombre} />
              <div style={{padding: '20px', flexGrow: 1, display:'flex', flexDirection:'column'}}>
                <h3 style={{margin: '0 0 10px 0'}}>{p.nombre}</h3>
                <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '24px', marginBottom: '15px'}}>
                  {p.tamanos ? `$${p.tamanos.find(t=>t.disponible)?.precio.toLocaleString() || '---'}` : `$${(Number(p.precio) || 0).toLocaleString()}`}
                </p>

                {(p.esArroz || p.categoria === "Arroces") && (
                  <div style={{background: MONO_AMARILLO, padding: '15px', borderRadius: '20px', marginBottom: '15px'}}>
                    <select onChange={(e) => setAcompañanteArroz(e.target.value)} value={acompañanteArroz} style={{width:'100%', padding:'10px', borderRadius:'10px', border:'1px solid #ddd'}}>
                      <option value="">¿Tajada o Yuca?</option>
                      <option value="Tajadas">Tajadas</option><option value="Yuca">Yuca</option>
                    </select>
                  </div>
                )}

                {p.opciones && p.categoria === "Fritos" && (
                  <select onChange={(e) => setSabores({...sabores, [p.id]: e.target.value})} value={sabores[p.id] || ""} style={{width:'100%', padding:'12px', borderRadius:'15px', border:'1px solid #ddd', marginBottom:'15px'}}>
                    <option value="">-- Elige Sabor --</option>
                    {p.opciones.map(opt => <option key={opt.nombre} value={opt.nombre} disabled={!opt.disponible}>{opt.nombre}</option>)}
                  </select>
                )}

                {p.tamanos && (
                  <select onChange={(e) => setTamanosBebida({...tamanosBebida, [p.id]: e.target.value})} value={tamanosBebida[p.id] || ""} style={{width:'100%', padding:'12px', borderRadius:'15px', border:`2px solid ${MONO_NARANJA}`, marginBottom:'15px'}}>
                    <option value="">-- Elige Tamaño --</option>
                    {p.tamanos.map(t => <option key={t.nombre} value={t.nombre} disabled={!t.disponible}>{t.nombre}</option>)}
                  </select>
                )}

                <div style={{display:'flex', alignItems:'center', gap:'10px', marginTop:'auto'}}>
                  <div style={{display:'flex', alignItems:'center', background:'#f0f2f5', borderRadius:'15px', padding:'5px'}}>
                    <button onClick={() => setCantidades({...cantidades, [p.id]: (cantidades[p.id] || 1) - 1})} style={{width:'35px', height:'35px', border:'none', background:'white', borderRadius:'10px'}}>-</button>
                    <span style={{padding:'0 15px', fontWeight:'bold'}}>{cantidades[p.id] || 1}</span>
                    <button onClick={() => setCantidades({...cantidades, [p.id]: (cantidades[p.id] || 1) + 1})} style={{width:'35px', height:'35px', border:'none', background: MONO_NARANJA, color:'white', borderRadius:'10px'}}>+</button>
                  </div>
                  <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible} style={{flex:1, background: MONO_NARANJA, color: 'white', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 'bold'}}>Añadir 🥟</button>
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
              <strong>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}
          <h2 style={{ textAlign: 'right', color: MONO_NARANJA, fontSize: '32px' }}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '25px' }}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{padding:'15px', borderRadius:'15px', border:'1px solid #ddd'}} />
            <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{padding:'15px', borderRadius:'15px', border:'1px solid #ddd'}} />
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