import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS (PLAN B)
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.jpg", disponible: true },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa-huevo.jpg", disponible: true },
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.jpg", disponible: true },
  { id: "8", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelo.jpg", disponible: true },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", disponible: true },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", disponible: true },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", disponible: true, tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", disponible: true, tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }, { nombre: "Familiar", precio: 6500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", disponible: true, tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", disponible: true },
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", disponible: true }
];

const MONO_NARANJA = "#f97316";
const MONO_VERDE = "#16a34a";
const MONO_TEXTO = "#333333";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");
  const [productosFB, setProductosFB] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  // ✅ SOLUCIÓN AL ERROR: Definir tipo de arroz y funciones globales
  const hoy = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][new Date().getDay()];
  const tipoArrozHoy = ["lunes", "miércoles", "viernes"].includes(hoy) ? "Pollo" : "Cerdo";

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (s) => setProductosFB(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTienda = onSnapshot(doc(db, "ajuste", "tienda"), (s) => { if (s.exists()) setTiendaAbierta(s.data().abierta); });
    return () => { unsubProd(); unsubTienda(); };
  }, []);

  const fusionar = (base, fb) => {
    const mapa = {};
    base.forEach(p => mapa[p.id] = p);
    fb.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
    return Object.values(mapa);
  };

  const productosMostrar = fusionar(productosBase, productosFB);

  const guardarCambio = async (col, id, datos) => {
    try { await setDoc(doc(db, col, id), datos, { merge: true }); } 
    catch (e) { console.error("Error al guardar:", e); }
  };

  const enviarWhatsApp = () => {
    if (pedido.length === 0) return alert("Carrito vacío");
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos");
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre}`).join('\n');
    const msg = `¡Hola! Pedido Fritos El Mono 🐒:\n\n${lista}\n\n*Total: $${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  const accesoSecreto = () => {
    const pin = window.prompt("🔐 PIN de Administrador:");
    if (pin === "mono2026") setIsAdmin(true);
    else if (pin !== null) alert("PIN Incorrecto");
  };

  const MiniSwitch = ({ activo, onClick }) => (
    <div onClick={onClick} style={{width: '50px', height: '26px', backgroundColor: activo ? MONO_VERDE : '#cbd5e1', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'}}>
      <div style={{width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: activo ? '27px' : '3px', transition: '0.3s'}}/>
    </div>
  );

  if (isAdmin) {
    return (
      <div style={{padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif'}}>
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
            <h1 style={{color: MONO_NARANJA}}>Admin 🐒</h1>
            <button onClick={() => setIsAdmin(false)} style={{padding:'10px 20px', borderRadius:'12px', cursor:'pointer', border:'none', background:MONO_TEXTO, color:'white'}}>Cerrar</button>
          </div>

          {["Fritos", "Arroces", "Desayunos", "Bebidas"].map(cat => (
            <div key={cat} style={{marginBottom:'35px', background:'white', padding:'20px', borderRadius:'25px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
              <h2 style={{color: MONO_NARANJA, borderBottom:`2px solid #eee`, paddingBottom:'10px'}}>{cat}</h2>
              {productosMostrar.filter(p => (p.categoria || (p.id === 'lzEcQicq9WUrxw7FEaq7' ? 'Arroces' : 'Fritos')) === cat).map(p => (
                <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 0', borderBottom:'1px solid #f9f9f9'}}>
                  <span style={{fontWeight:'bold'}}>{p.nombre}</span>
                  <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    {/* EDITAR PRECIO */}
                    <div style={{display:'flex', alignItems:'center', background:'#f1f5f9', padding:'5px 10px', borderRadius:'10px'}}>
                      $ <input type="number" defaultValue={p.precio} onBlur={(e) => guardarCambio("productos", p.id, { precio: Number(e.target.value) })} style={{width:'80px', border:'none', background:'transparent', marginLeft:'5px', fontWeight:'bold'}} />
                    </div>
                    <MiniSwitch activo={p.disponible} onClick={() => guardarCambio("productos", p.id, { disponible: !p.disponible })} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{fontFamily: 'system-ui, sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px'}}>
      <header style={{textAlign: 'center', background: 'white', borderRadius: '0 0 40px 40px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{width: '100%', height: '200px', objectFit: 'cover'}} />
        <h1 onDoubleClick={accesoSecreto} style={{color: MONO_NARANJA, cursor:'pointer', margin:'15px 0'}}>Fritos El Mono 🐒</h1>
        <div style={{paddingBottom:'20px'}}>Arroz de Hoy: <strong>{tipoArrozHoy}</strong></div>
      </header>

      {/* CATEGORIAS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX:'auto', padding:'0 10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : MONO_TEXTO, fontWeight: 'bold', cursor:'pointer' }}>{cat}</button>
        ))}
      </div>

      {/* PRODUCTOS */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '0 20px', maxWidth:'1200px', margin:'0 auto'}}>
        {productosMostrar
          .filter(p => (p.categoria || (p.id === 'lzEcQicq9WUrxw7FEaq7' ? 'Arroces' : 'Fritos')) === categoriaActiva)
          .map(p => (
            <div key={p.id} style={{background: 'white', borderRadius: '30px', padding: '20px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column'}}>
              <h3 style={{margin: '0 0 10px 0'}}>{p.nombre}</h3>
              <p style={{color: MONO_NARANJA, fontWeight: '900', fontSize: '24px'}}>${p.precio.toLocaleString()}</p>
              <button 
                onClick={() => setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, subtotal: p.precio, cantidad: 1 }])} 
                disabled={!p.disponible || !tiendaAbierta} 
                style={{marginTop:'auto', background: MONO_NARANJA, color:'white', border:'none', padding:'15px', borderRadius:'18px', fontWeight:'bold', cursor:'pointer'}}
              >
                {p.disponible ? 'Añadir 🥟' : 'Agotado'}
              </button>
            </div>
          ))}
      </div>

      {/* CARRITO */}
      {pedido.length > 0 && (
        <div style={{maxWidth: '600px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '35px', border: `4px solid ${MONO_NARANJA}`}}>
          <h2 style={{marginTop:0}}>Tu Pedido</h2>
          {pedido.map(item => (
            <div key={item.idUnico} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
              <span>{item.cantidad}x {item.nombre}</span>
              <strong>${item.subtotal.toLocaleString()}</strong>
            </div>
          ))}
          <h2 style={{textAlign:'right', color: MONO_NARANJA, fontSize:'30px', marginTop:'20px'}}>Total: ${(pedido.reduce((acc, i) => acc + i.subtotal, 0)).toLocaleString()}</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
            <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{padding:'12px', borderRadius:'10px', border:'1px solid #ddd'}} />
            <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{padding:'12px', borderRadius:'10px', border:'1px solid #ddd'}} />
            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{padding:'12px', borderRadius:'10px', border:'1px solid #ddd'}}>
              <option value="">¿Cómo pagas?</option><option value="Efectivo">Efectivo</option><option value="Nequi">Nequi</option>
            </select>
            <button onClick={enviarWhatsApp} style={{background: MONO_VERDE, color:'white', padding:'18px', borderRadius:'15px', border:'none', fontWeight:'bold', cursor:'pointer', fontSize:'18px'}}>Confirmar Pedido 📲</button>
          </div>
        </div>
      )}
    </div>
  );
}