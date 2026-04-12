import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";

// IMPORTAMOS TUS COMPONENTES (Asegúrate que los nombres coincidan)
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Carrito from './components/Carrito';
import AdminPanel from './components/AdminPanel';

// ==========================================
// 🔴 DATOS MAESTROS (IDs CORREGIDOS SEGÚN TU FIREBASE)
// ==========================================
const productosBase = [
  { id: "1", nombre: "Empanada Crujiente", precio: 1500, categoria: "Fritos", imagen: "/empanada.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: "2", nombre: "Papa Rellena de la Casa", precio: 2500, categoria: "Fritos", imagen: "/papa-rellena.jpg", disponible: true, opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: "3", nombre: "Pastel de Pollo Hojaldrado", precio: 2500, categoria: "Fritos", imagen: "/pastel-pollo.jpg", disponible: true },
  { id: "4", nombre: "Arepa con Huevo y Carne", precio: 3500, categoria: "Fritos", imagen: "/arepa-huevo.jpg", disponible: true },
  { id: "7", nombre: "Palitos de Queso Costeño", precio: 2000, categoria: "Fritos", imagen: "/palito-queso.jpg", disponible: true },
  { id: "8", nombre: "Buñuelos Calientitos", precio: 1000, categoria: "Fritos", imagen: "/buñuelos.jpg", disponible: true },
  { id: "d1", nombre: "Desayuno Tradicional", precio: 8000, categoria: "Desayunos", disponible: true },
  { id: "d2", nombre: "Desayuno Especial", precio: 10000, categoria: "Desayunos", disponible: true },
  { id: "b1", nombre: "Coca-Cola", precio: 0, categoria: "Bebidas", disponible: true, tamanos: [{ nombre: "Mini", precio: 2500, disponible: true }, { nombre: "Personal", precio: 3500, disponible: true }, { nombre: "Familiar", precio: 6500, disponible: true }] },
  { id: "MMuffStcgfJe5ow5X4qV", nombre: "Jugo Natural Helado", precio: 0, categoria: "Bebidas", disponible: true, tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }] },
  { id: "lzEcQicq9WUrxw7FEaq7", nombre: "Arroz Especial del Día", precio: 6000, categoria: "Arroces", disponible: true }
];

const extrasArrozBase = [
  { id: 'tajada', nombre: "Tajadas", disponible: true, precio: 0 },
  { id: 'yuca', nombre: "Yuca", disponible: true, precio: 0 },
  { id: 'huevo', nombre: "Huevo Extra", disponible: true, precio: 1000 },
  { id: 'queso', nombre: "Tajada de Queso", disponible: true, precio: 1000 }
];

const MONO_NARANJA = "#f97316";
const MONO_VERDE = "#16a34a";

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

  // ✅ Lógica de arroz corregida
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
    return Object.values(mapa);
  };

  const productosMostrar = fusionar(productosBase, productosFB);
  const extrasMostrar = fusionar(extrasArrozBase, extrasFB);

  const agregarAlCarrito = (item) => {
    setPedido([...pedido, { ...item, idUnico: Date.now() }]);
    setNotificacion(`¡${item.cantidad}x ${item.nombre} añadido! 🥟`);
    setTimeout(() => setNotificacion(""), 2000);
  };

  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return alert("Faltan tus datos de entrega");
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.detalle || ''}`).join('\n');
    const total = pedido.reduce((acc, i) => acc + i.subtotal, 0);
    const msg = `Pedido Mono 🐒:\n\n${lista}\n\n*Total: $${total.toLocaleString()}*\n👤 ${nombre}\n📍 ${direccion}\n💰 ${metodoPago}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  if (isAdmin) {
    return (
      <AdminPanel 
        productos={productosMostrar} 
        extras={extrasMostrar} 
        tiendaAbierta={tiendaAbierta}
        setDoc={setDoc}
        db={db}
        setIsAdmin={setIsAdmin}
      />
    );
  }

  return (
    <div style={{backgroundColor: '#fffcf5', minHeight: '100vh', paddingBottom: '120px'}}>
      
      {/* 🔔 NOTIFICACIÓN TOAST */}
      {notificacion && (
        <div style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background: MONO_VERDE, color:'white', padding:'15px 30px', borderRadius:'50px', zIndex: 10000, fontWeight:'bold'}}>{notificacion}</div>
      )}

      {/* 🛒 BOTÓN FLOTANTE */}
      {pedido.length > 0 && (
        <div 
          onClick={() => document.getElementById('carrito_seccion')?.scrollIntoView({ behavior: 'smooth' })}
          style={{position: 'fixed', bottom: '30px', right: '30px', background: MONO_NARANJA, color: 'white', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.5)', zIndex: 9999, cursor: 'pointer'}}>
          🛒
          <span style={{position:'absolute', top:'0', right:'0', background:'red', color: 'white', fontSize:'14px', minWidth:'22px', height:'22px', borderRadius:'50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'}}>{pedido.length}</span>
        </div>
      )}

      <Header setIsAdmin={setIsAdmin} tipoArrozHoy={tipoArrozHoy} />

      {/* CATEGORÍAS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', overflowX:'auto', padding:'0 10px' }}>
        {["Fritos", "Desayunos", "Arroces", "Bebidas"].map(cat => (
          <button key={cat} onClick={() => setCategoriaActiva(cat)} style={{ padding: '12px 25px', borderRadius: '25px', border: 'none', backgroundColor: categoriaActiva === cat ? MONO_NARANJA : 'white', color: categoriaActiva === cat ? 'white' : '#333', fontWeight: 'bold', cursor:'pointer' }}>{cat}</button>
        ))}
      </div>

      {/* GRILLA DE PRODUCTOS */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px', padding: '0 20px', maxWidth:'1200px', margin:'0 auto'}}>
        {productosMostrar
          .filter(p => p.categoria === categoriaActiva)
          .map(p => (
            <ProductCard 
              key={p.id} 
              producto={p} 
              extras={extrasMostrar} 
              agregarAlCarrito={agregarAlCarrito} 
              tiendaAbierta={tiendaAbierta}
            />
          ))}
      </div>

      {pedido.length > 0 && (
        <Carrito 
          pedido={pedido} 
          setPedido={setPedido} 
          total={pedido.reduce((acc, i) => acc + i.subtotal, 0)} 
          vaciarCarrito={() => { if(window.confirm("¿Vaciar pedido?")) setPedido([]); }} 
          nombre={nombre} setNombre={setNombre} 
          direccion={direccion} setDireccion={setDireccion} 
          metodoPago={metodoPago} setMetodoPago={setMetodoPago}
          enviarWhatsApp={enviarWhatsApp}
        />
      )}
    </div>
  );
}