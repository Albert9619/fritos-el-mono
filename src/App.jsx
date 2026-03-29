// --- Busca productosBase y reemplázalo por este ---
const productosBase = [
  // FRITOS
  { id: 1, nombre: "Empanada Crujiente", precio: 1500, imagen: "/empanada.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Pollo", disponible: true }, { nombre: "Arroz", disponible: true }] },
  { id: 2, nombre: "Papa Rellena de la Casa", precio: 2500, imagen: "/papa-rellena.png", disponible: true, categoria: "fritos", opciones: [{ nombre: "Carne", disponible: true }, { nombre: "Huevo", disponible: true }] },
  { id: 3, nombre: "Pastel de Pollo Hojaldrado", precio: 2500, imagen: "/pastel-pollo.png", disponible: true, categoria: "fritos" },
  { id: 4, nombre: "Arepa con Huevo y Carne", precio: 3500, imagen: "/arepa-huevo.png", disponible: true, categoria: "fritos" },
  { id: 7, nombre: "Palitos de Queso Costeño", precio: 2000, imagen: "/palito-queso.png", disponible: true, categoria: "fritos" },
  { id: 8, nombre: "Buñuelos Calientitos", precio: 1000, imagen: "/buñuelo.png", disponible: true, categoria: "fritos" },
  
  // BEBIDAS
  { id: 6, nombre: "Jugo Natural Helado", esJugo: true, precio: 0, imagen: "/jugo-natural.png", disponible: true, categoria: "bebidas", opciones: [{ nombre: "Avena", disponible: true }, { nombre: "Maracuyá", disponible: true }], tamanos: [{ nombre: "Pequeño", precio: 1000, disponible: true }, { nombre: "Mediano", precio: 1500, disponible: true }, { nombre: "Grande", precio: 2000, disponible: true }] },

  // DESAYUNOS (Nuevos)
  { 
    id: 12, 
    nombre: "Desayuno Tradicional", 
    precio: 8000, 
    esDesayuno: true, 
    tipo: "tradicional", 
    imagen: "/desayuno-huevo.png", 
    disponible: true, 
    categoria: "desayunos" 
  },
  { 
    id: 13, 
    nombre: "Desayuno Especial", 
    precio: 10000, 
    esDesayuno: true, 
    tipo: "especial", 
    imagen: "/desayuno-carne.png", 
    disponible: true, 
    categoria: "desayunos" 
  }
];

// --- Dentro de tu función App(), añade estos nuevos estados ---
const [opcionesDesayuno, setOpcionesDesayuno] = useState({}); // Para guardar acompañante, huevo o carne, y jugo

// --- Actualiza la función agregarAlCarrito para los desayunos ---
const agregarAlCarrito = (p) => {
  if (!tiendaAbierta) return toast.error("Cerrado");
  const cant = cantidades[p.id] || 1;
  let precioFinal = p.precio || 0;
  let detallesExtra = "";

  if (p.esJugo) {
    const tam = p.tamanos.find(t => t.nombre === (tamanosJugo[p.id] || "Pequeño"));
    precioFinal = tam.precio;
  }
  
  if (p.esDesayuno) {
    const opt = opcionesDesayuno[p.id] || {};
    if (!opt.acompañante || !opt.jugo || (p.tipo === 'tradicional' && !opt.huevo) || (p.tipo === 'especial' && !opt.proteina)) {
      return toast.error("Por favor completa todas las opciones del desayuno");
    }
    detallesExtra = `(${opt.acompañante} + ${opt.huevo || opt.proteina} + Jugo ${opt.jugo} + Queso)`;
  }

  setPedido([...pedido, { 
    idUnico: Date.now(), 
    nombre: p.nombre, 
    precioUnitario: precioFinal, 
    saborElegido: sabores[p.id] || "", 
    detallesArroz: detallesExtra, // Usamos el mismo campo para los detalles
    cantidad: cant, 
    subtotal: precioFinal * cant 
  }]);
  toast.success("🍳 ¡Desayuno listo!");
};

// --- En el render (donde están las pestañas), cambia "arroces" por "desayunos" ---
{["fritos", "bebidas", "desayunos"].map(cat => (
  <button key={cat} onClick={() => setCategoriaActiva(cat)} ...>
    {cat} {cat === "desayunos" ? "🍳" : ""}
  </button>
))}

// --- Y en el ProductCard añade la nueva prop ---
<ProductCard 
  // ... todas las demás props
  opcionesDesayuno={opcionesDesayuno} 
  setOpcionesDesayuno={setOpcionesDesayuno}
/>