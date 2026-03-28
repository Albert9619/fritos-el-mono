import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 
import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard'; 
import AdminPanel from './components/AdminPanel';

// ==========================================
// 🔴 DATOS LOCALES (Los de Carepa de toda la vida)
// ==========================================
const productosBase = [
  { 
    id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.jpg", disponible: true,
    opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] 
  },
  { 
    id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.jpg", disponible: true,
    opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] 
  },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.jpg", disponible: true },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.jpg", disponible: true },
  { id: 5, nombre: "Arroz Especial del Día", precio: 6000, esArroz: true, disponible: true },
  { 
    id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.jpg", disponible: true,
    opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }],
    tamanos: [
      { nombre: "Pequeño", precio: 1000, disponible: true },
      { nombre: "Mediano", precio: 1500, disponible: true },
      { nombre: "Grande", precio: 2000, disponible: true }
    ]
  }
];

const MONO_CREMA = "#fffbeb";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  
  // 🟢 El estado ahora es 100% LOCAL
  const [productos, setProductos] = useState(productosBase);
  const [cantidades, setCantidades] = useState({});
  const [sabores, setSabores] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);

  const [pedido, setPedido] = useState(() => {
    const guardado = localStorage.getItem("pedidoMono");
    return guardado ? JSON.parse(guardado) : [];
  });

  // Persistencia del carrito
  useEffect(() => {
    localStorage.setItem("pedidoMono", JSON.stringify(pedido));
  }, [pedido]);

  // --- FUNCIONES DEL CONTROLADOR ---
  const accesoSecreto = () => {
    const pin = window.prompt("🔐 PIN de Admin:");
    if (pin === "mono2026") {
      setIsAdmin(true);
      toast.success("Modo Admin Activado");
    }
  };

  const toggleProducto = (id) => {
    setProductos(productos.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  };

  const cambiarPrecioProducto = (id, nuevoPrecio) => {
    setProductos(productos.map(p => p.id === id ? { ...p, precio: parseInt(nuevoPrecio) || 0 } : p));
  };

  const agregarAlCarrito = (p) => {
    if (!tiendaAbierta) return toast.error("Cerrado");
    const cant = cantidades[p.id] || 1;
    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: p.nombre,
      precioUnitario: p.precio || 0,
      cantidad: cant,
      subtotal: (p.precio || 0) * cant
    }]);
    toast.success(`${p.nombre} agregado!`);
  };

  // ==========================================
  // 🟢 VISTA ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    return (
      <AdminPanel 
        setIsAdmin={setIsAdmin} 
        tiendaAbierta={tiendaAbierta} 
        setTiendaAbierta={setTiendaAbierta}
        productos={productos}
        toggleProducto={toggleProducto}
        cambiarPrecioProducto={cambiarPrecioProducto}
        extrasArroz={[]} // Simplificado por ahora
        salsas={[]} // Simplificado por ahora
      />
    );
  }

  // ==========================================
  // 🔵 VISTA CLIENTE
  // ==========================================
  return (
    <div style={{ backgroundColor: MONO_CREMA, minHeight: '100vh' }}>
      <Toaster position="top-center" />
      
      <Header accesoSecreto={accesoSecreto} tipoArrozHoy="Especial" />

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {productos.map(p => (
            <ProductCard 
              key={p.id} 
              p={p} 
              tiendaAbierta={tiendaAbierta}
              cantidades={cantidades}
              setCantidades={setCantidades}
              sabores={sabores} setSabores={setSabores}
              tamanosJugo={tamanosJugo} setTamanosJugo={setTamanosJugo}
              sumarCantidad={(id) => setCantidades(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }))}
              restarCantidad={(id) => setCantidades(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) - 1) }))}
              agregarAlCarrito={() => agregarAlCarrito(p)}
              acompañanteArroz={acompañanteArroz} setAcompañanteArroz={setAcompañanteArroz}
              conHuevo={conHuevo} setConHuevo={setConHuevo}
            />
          ))}
        </div>

        {pedido.length > 0 && (
          <Carrito pedido={pedido} setPedido={setPedido} total={pedido.reduce((acc, i) => acc + i.subtotal, 0)} />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        <p>📍 Carepa, Antioquia | Hecho para El Mono 🐒</p>
      </footer>
    </div>
  );
}