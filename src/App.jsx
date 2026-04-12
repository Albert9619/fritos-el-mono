import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// ==========================================
// 🔴 DATOS MAESTROS (Revisa si terminan en .png o .jpg)
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.png" },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.png" },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.png" },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa-huevo.png" },
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.png" },
  { id: "8", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelo.png" },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", imagen: "/desayuno-carne.png" },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", imagen: "/desayuno-huevo.png" },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", imagen: "/cocacola.png", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "b2", nombre: "Pony Malta", precio: 0, categoria: "Bebidas", imagen: "/malta.png", tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }] },
  { id: "b3", nombre: "Agua Cielo", precio: 2000, categoria: "Bebidas", imagen: "/agua.png" },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", imagen: "/jugo-natural.png", tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }] },
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", imagen: "/arroz-pollo.png" }
];

// ... (Resto de constantes igual)
const MONO_NARANJA = "#f97316";
const MONO_VERDE = "#16a34a";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Fritos");
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [pedido, setPedido] = useState([]);
  const [selecciones, setSelecciones] = useState({});
  const [cantidades, setCantidades] = useState({});
  const [productosFB, setProductosFB] = useState([]);
  const [extrasFB, setExtrasFB] = useState([]);
  
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

  const fusionar = (base, fb) => {
    const mapa = {};
    base.forEach(p => mapa[p.id] = p);
    fb.forEach(p => { if (mapa[p.id]) mapa[p.id] = { ...mapa[p.id], ...p }; });
    return Object.values(mapa).filter(p => p.categoria === categoriaActiva);
  };

  const agregarAlCarrito = (p) => {
    const cant = cantidades[p.id] || 1;
    const subtotal = (p.precio || 0) * cant;
    setPedido([...pedido, { idUnico: Date.now(), nombre: p.nombre, cantidad: cant, subtotal }]);
    setCantidades({ ...cantidades, [p.id]: 1 });
  };

  if (isAdmin) return <div style={{padding:'20px'}}><h1>Admin 🐒</h1><button onClick={()=>setIsAdmin(false)}>Salir</button></div>;

  return (
    <div style={{fontFamily: 'sans-serif', backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '100px'}}>
      
      <header style={{textAlign: 'center', background: 'white', padding: '20px', borderRadius: '0 0 40px 40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
        <img src="/logo-fritos-el-mono.jpg" alt="Logo" style={{width: '120px', height: '120px', borderRadius: '50%'}} />
        <h1 onDoubleClick={() => { const p = window.prompt("PIN"); if(p === "mono2026") setIsAdmin(true); }} style={{color: MONO_NARANJA}}>Fritos El Mono 🐒</h1>
        <p>Arroz de Hoy: <strong>{tipoArrozHoy}</strong></p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : '#333', fontWeight: 'bold', cursor:'pointer' }}>{cat}</button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', padding: '20px'}}>
        {fusionar(productosBase, productosFB).map(p => {
          const cant = cantidades[p.id] || 1;
          return (
            <div key={p.id} style={{background: 'white', borderRadius: '25px', padding: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)'}}>
              
              {/* 🖼️ AREA DE IMAGEN CORREGIDA */}
              <div style={{ width: '100%', height: '180px', borderRadius: '20px', overflow: 'hidden', marginBottom: '15px', background: '#f0f0f0' }}>
                <img 
                  src={p.imagen} 
                  alt={p.nombre} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    // Si falla, muestra un texto gris en lugar del logo para saber qué falló
                    e.target.src = `https://via.placeholder.com/300x180?text=No+Existe:+${p.imagen}`;
                  }} 
                />
              </div>

              <h3>{p.nombre}</h3>
              <p style={{color: MONO_NARANJA, fontWeight: 'bold', fontSize: '20px'}}>${(p.precio || 0).toLocaleString()}</p>
              
              <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'15px', margin:'10px 0'}}>
                <button onClick={() => setCantidades({...cantidades, [p.id]: Math.max(1, cant - 1)})} style={{width:'30px', height:'30px', borderRadius:'50%', border:'none'}}>-</button>
                <span>{cant}</span>
                <button onClick={() => setCantidades({...cantidades, [p.id]: cant + 1})} style={{width:'30px', height:'30px', borderRadius:'50%', border:'none', background:MONO_NARANJA, color:'white'}}>+</button>
              </div>

              <button onClick={() => agregarAlCarrito(p)} disabled={!p.disponible || !tiendaAbierta} style={{width:'100%', background: MONO_NARANJA, color:'white', border:'none', padding:'12px', borderRadius:'15px', fontWeight:'bold', cursor:'pointer'}}>
                {p.disponible ? 'Añadir 🥟' : 'Agotado'}
              </button>
            </div>
          );
        })}
      </div>

      {/* SECCIÓN CARRITO (Opcional si usas el archivo aparte) */}
      {pedido.length > 0 && (
        <div id="carrito_seccion" style={{margin:'20px', padding:'20px', background:'white', borderRadius:'20px', border:`2px solid ${MONO_NARANJA}`}}>
          <h2>🛒 Tu Pedido</h2>
          {pedido.map(i => <div key={i.idUnico}>{i.cantidad}x {i.nombre} - ${i.subtotal.toLocaleString()}</div>)}
          <button onClick={() => window.alert("Enviando a WhatsApp...")} style={{width:'100%', background:MONO_VERDE, color:'white', padding:'15px', borderRadius:'15px', marginTop:'10px', border:'none', fontWeight:'bold'}}>WhatsApp 📲</button>
        </div>
      )}
    </div>
  );
}