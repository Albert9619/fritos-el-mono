import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast'; 
import Header from './components/Header';
import Carrito from './components/Carrito';
import ProductCard from './components/ProductCard'; 
import AdminPanel from './components/AdminPanel';

// ==========================================
// 🔴 DATOS LOCALES "A PRUEBA DE ERRORES"
// ==========================================
const productosBase = [
  { 
    id: "empanada_1", nombre: "Empanada de Carne", precio: 2500, imagen: "/empanada.jpg", disponible: true,
    opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }],
    tamanos: [] 
  },
  { 
    id: "papa_1", nombre: "Papa Rellena", precio: 3000, imagen: "/papa-rellena.jpg", disponible: true,
    opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }],
    tamanos: [] 
  },
  { 
    id: "pastel_1", nombre: "Pastel de Pollo", precio: 2500, imagen: "/pastel-pollo.jpg", disponible: true, 
    opciones: [], tamanos: [] 
  },
  { 
    id: "arroz_1", nombre: "Arroz Especial", precio: 6000, esArroz: true, disponible: true, 
    opciones: [], tamanos: [] 
  },
  { 
    id: "jugo_1", nombre: "Jugo Natural", esJugo: true, precio: 0, imagen: "/jugo-natural.jpg", disponible: true,
    opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }],
    tamanos: [
      { nombre: "Pequeño", precio: 2000, disponible: true },
      { nombre: "Mediano", precio: 3000, disponible: true },
      { nombre: "Grande", precio: 4000, disponible: true }
    ]
  }
];

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiendaAbierta, setTiendaAbierta] = useState(true);
  const [productos, setProductos] = useState(productosBase);
  
  // 🛡️ ESTADOS CRITICOS PARA QUE PRODUCTCARD NO CRASHIE
  const [cantidades, setCantidades] = useState({});
  const [sabores, setSabores] = useState({});
  const [tamanosJugo, setTamanosJugo] = useState({});
  const [acompañanteArroz, setAcompañanteArroz] = useState("");
  const [conHuevo, setConHuevo] = useState(false);

  const [pedido, setPedido] = useState(() => {
    const guardado = localStorage.getItem("pedidoMono");
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    localStorage.setItem("pedidoMono", JSON.stringify(pedido));
  }, [pedido]);

  // --- CONTROLADOR ---
  const accesoSecreto = () => {
    const pin = window.prompt("🔐 PIN:");
    if (pin === "mono2026") setIsAdmin(true);
  };

  const agregarAlCarrito = (p) => {
    const cant = cantidades[p.id] || 1;
    const precioFinal = p.esJugo ? (tamanosJugo[p.id] ? p.tamanos.find(t => t.nombre === tamanosJugo[p.id]).precio : 0) : p.precio;
    
    setPedido([...pedido, {
      idUnico: Date.now(),
      nombre: p.nombre,
      precioUnitario: precioFinal,
      cantidad: cant,
      subtotal: precioFinal * cant
    }]);
    toast.success("¡Añadido!");
  };

  if (isAdmin) return <AdminPanel setIsAdmin={setIsAdmin} productos={productos} setProductos={setProductos} tiendaAbierta={tiendaAbierta} setTiendaAbierta={setTiendaAbierta} />;

  return (
    <div style={{ backgroundColor: '#fffbeb', minHeight: '100vh' }}>
      <Toaster position="top-center" />
      <Header accesoSecreto={accesoSecreto} tipoArrozHoy="Especial" />

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {productos.map(p => (
            <ProductCard 
              key={p.id} 
              p={p} 
              tiendaAbierta={tiendaAbierta}
              cantidades={cantidades} setCantidades={setCantidades}
              sabores={sabores} setSabores={setSabores}
              tamanosJugo={tamanosJugo} setTamanosJugo={setTamanosJugo}
              acompañanteArroz={acompañanteArroz} setAcompañanteArroz={setAcompañanteArroz}
              conHuevo={conHuevo} setConHuevo={setConHuevo}
              sumarCantidad={(id) => setCantidades(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }))}
              restarCantidad={(id) => setCantidades(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) - 1) }))}
              agregarAlCarrito={() => agregarAlCarrito(p)}
              // Props de seguridad para extras (aunque no los usemos ahora)
              tajadaObj={{disponible: true}} yucaObj={{disponible: true}} huevoObj={{precio: 1000}}
            />
          ))}
        </div>

        {pedido.length > 0 && <Carrito pedido={pedido} setPedido={setPedido} total={pedido.reduce((acc, i) => acc + i.subtotal, 0)} />}
      </main>
    </div>
  );
}