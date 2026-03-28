import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 
import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard'; 
import AdminPanel from './components/AdminPanel';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, addDoc, updateDoc } from 'firebase/firestore'; 

// 1. 📋 TU LISTA ORIGINAL (Fuera de la función, esto está perfecto)
const PRODUCTOS_ANTERIORES = [
  { nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.jpg", disponible: true, categoria: "Fritos" },
  { nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.jpg", disponible: true, categoria: "Fritos" },
  { nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg", disponible: true, categoria: "Fritos" },
  { nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg", disponible: true, categoria: "Fritos" },
  { nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.jpg", disponible: true, categoria: "Fritos" },
  { nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.jpg", disponible: true, categoria: "Fritos" },
  { nombre: "Arroz Especial del Día", precio: 6000, disponible: true, categoria: "Arroz", esArroz: true },
  { nombre: "Jugo Natural Helado", precio: 2000, imagen: "/jugo-natural.jpg", disponible: true, categoria: "Bebidas", esJugo: true }
];

export default function App() {
  // Primero definimos todos los estados
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState([]);
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [cantidades, setCantidades] = useState({});
  
  const [pedido, setPedido] = useState(() => {
    const guardado = localStorage.getItem("pedidoMono");
    return guardado ? JSON.parse(guardado) : [];
  });

  // 📡 CONEXIÓN EN TIEMPO REAL
  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProductos(docs);
    });
    return () => unsubProd();
  }, []);

  // ⚡ FUNCIÓN DE INYECCIÓN
  const inyectarMenu = async () => {
    const idCarga = toast.loading("Subiendo menú a la nube...");
    try {
      for (const p of PRODUCTOS_ANTERIORES) {
        await addDoc(collection(db, "productos"), p);
      }
      toast.success("¡Menú cargado en Firebase! 🚀", { id: idCarga });
    } catch (e) {
      toast.error("Fallo la subida", { id: idCarga });
    }
  };

  // --- RENDERIZADO (Aquí es donde ocurre la magia) ---
  return (
    <div style={{ backgroundColor: '#fffbeb', minHeight: '100vh' }}>
      <Toaster position="top-center" />

      {/* 🔴 EL BOTÓN DE INYECCIÓN */}
      <button 
        onClick={inyectarMenu}
        style={{ 
          width: '100%', padding: '20px', background: 'red', color: 'white', 
          fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '18px' 
        }}
      >
        🔥 CLICK AQUÍ: SUBIR TODO EL MENÚ ANTERIOR A FIREBASE
      </button>

      <Header accesoSecreto={() => {
        const pin = window.prompt("PIN:");
        if (pin === "mono2026") setIsAdmin(true);
      }} />

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Aquí es donde deben ir los productos mapeados */}
          {productos.map(p => (
            <ProductCard 
              key={p.id} 
              p={p} 
              tiendaAbierta={tiendaAbierta}
              cantidades={cantidades}
              setCantidades={setCantidades}
              sumarCantidad={(id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1})}
              restarCantidad={(id) => setCantidades({...cantidades, [id]: Math.max(1, (cantidades[id] || 1) - 1)})}
              agregarAlCarrito={() => toast.success(`${p.nombre} al carrito`)}
            />
          ))}
          
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        <p>📍 Carepa, Antioquia | Fritos El Mono 2026</p>
      </footer>
    </div>
  );
}