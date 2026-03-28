import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 
import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard'; 
import AdminPanel from './components/AdminPanel';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, addDoc } from 'firebase/firestore'; 

// 1. 📋 LISTA CORREGIDA
const PRODUCTOS_ANTERIORES = [
  { 
    nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.jpg", disponible: true, categoria: "Fritos",
    opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] 
  },
  { 
    nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.jpg", disponible: true, categoria: "Fritos",
    opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] 
  },
  { nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg", disponible: true, categoria: "Fritos", opciones: [] },
  { nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg", disponible: true, categoria: "Fritos", opciones: [] },
  { nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.jpg", disponible: true, categoria: "Fritos", opciones: [] },
  { nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.jpg", disponible: true, categoria: "Fritos", opciones: [] },
  { nombre: "Arroz Especial del Día", precio: 6000, disponible: true, categoria: "Arroz", esArroz: true, opciones: [] },
  { 
    nombre: "Jugo Natural Helado", precio: 2000, imagen: "/jugo-natural.jpg", disponible: true, categoria: "Bebidas", esJugo: true,
    opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }],
    tamanos: [
      { nombre: "Pequeño", precio: 1000, disponible: true },
      { nombre: "Mediano", precio: 1500, disponible: true },
      { nombre: "Grande", precio: 2000, disponible: true }
    ]
  }
];

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState([]);
  const [cantidades, setCantidades] = useState({});
  
  // 🟢 ESTOS SON LOS CABLES QUE FALTABAN:
  const [sabores, setSabores] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);

  const [pedido, setPedido] = useState(() => {
    const guardado = localStorage.getItem("pedidoMono");
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    const unsubProd = onSnapshot(collection(db, "productos"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProductos(docs);
    });
    return () => unsubProd();
  }, []);

  const inyectarMenu = async () => {
    const idCarga = toast.loading("Subiendo menú...");
    try {
      for (const p of PRODUCTOS_ANTERIORES) {
        await addDoc(collection(db, "productos"), p);
      }
      toast.success("¡Menú cargado!", { id: idCarga });
    } catch (e) { toast.error("Error"); }
  };

  return (
    <div style={{ backgroundColor: '#fffbeb', minHeight: '100vh' }}>
      <Toaster position="top-center" />
      <button onClick={inyectarMenu} style={{ width: '100%', padding: '20px', background: 'red', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
        🔥 CLICK AQUÍ: SUBIR MENÚ COMPLETO
      </button>

      <Header accesoSecreto={() => {
        const pin = window.prompt("PIN:");
        if (pin === "mono2026") setIsAdmin(true);
      }} />

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {productos.map(p => (
            <ProductCard 
              key={p.id} p={p} tiendaAbierta={tiendaAbierta}
              cantidades={cantidades}
              sumarCantidad={(id) => setCantidades({...cantidades, [id]: (cantidades[id] || 1) + 1})}
              restarCantidad={(id) => setCantidades({...cantidades, [id]: Math.max(1, (cantidades[id] || 1) - 1)})}
              sabores={sabores} setSabores={setSabores}
              tamanosJugo={tamanosJugo} setTamanosJugo={setTamanosJugo}
              acompañanteArroz={acompañanteArroz} setAcompañanteArroz={setAcompañanteArroz}
              conHuevo={conHuevo} setConHuevo={setConHuevo}
              agregarAlCarrito={() => toast.success(`${p.nombre} agregado`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}