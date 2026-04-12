import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import Carrito from './Carrito'; // ✅ IMPORTAMOS TU COMPONENTE

// (Datos base y funciones de lógica se mantienen igual)
const productosBase = [/* ...tus productos... */];
const extrasArrozBase = [/* ...tus extras... */];

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

  // Firebase Effects... (se mantienen)

  const total = pedido.reduce((acc, i) => acc + i.subtotal, 0);

  const vaciarCarrito = () => {
    if (window.confirm("¿Seguro que quieres borrar el pedido?")) setPedido([]);
  };

  const enviarWhatsApp = () => {
    if (!nombre || !direccion || !metodoPago) return alert("Faltan datos");
    const lista = pedido.map(i => `-${i.cantidad}x ${i.nombre} ${i.detalle || ''}`).join('\n');
    const msg = `Pedido Mono 🐒:\n\n${lista}\n\nTotal: $${total.toLocaleString()}\n👤 ${nombre}\n📍 ${direccion}`;
    window.open(`https://wa.me/573148686455?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div style={{fontFamily:'sans-serif', backgroundColor:'#fffcf5', minHeight:'100vh', paddingBottom:'100px'}}>
      
      {/* 🔔 NOTIFICACIÓN TIPO TOAST */}
      {notificacion && (
        <div style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', background: MONO_VERDE, color:'white', padding:'15px 30px', borderRadius:'50px', zIndex: 9999, fontWeight:'bold'}}>{notificacion}</div>
      )}

      {/* 🛒 BOTÓN FLOTANTE (FAB) */}
      {pedido.length > 0 && (
        <a href="#carrito_seccion" style={{
          position: 'fixed', bottom: '30px', right: '30px', 
          background: MONO_NARANJA, color: 'white', width: '70px', height: '70px', 
          borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', 
          fontSize: '30px', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.4)', 
          zIndex: 1000, textDecoration: 'none', transition: '0.3s'
        }}>
          🛒 <span style={{position:'absolute', top:'5px', right:'5px', background:'red', fontSize:'14px', padding:'3px 7px', borderRadius:'50%'}}>{pedido.length}</span>
        </a>
      )}

      {/* HEADER Y CATEGORIAS (se mantienen) */}
      {/* GRILLA DE PRODUCTOS (se mantienen) */}

      {/* 📥 USAMOS EL COMPONENTE CARRITO SI HAY PEDIDO */}
      {pedido.length > 0 && (
        <Carrito 
          pedido={pedido} setPedido={setPedido} total={total} 
          vaciarCarrito={vaciarCarrito} nombre={nombre} setNombre={setNombre} 
          direccion={direccion} setDireccion={setDireccion} 
          metodoPago={metodoPago} setSetMetodoPago={setMetodoPago}
          enviarWhatsApp={enviarWhatsApp}
        />
      )}
    </div>
  );
}