import React from 'react';
import { Toaster, toast } from 'react-hot-toast';

export default function AdminPanel({
  setIsAdmin,
  tiendaAbierta,
  setTiendaAbierta,
  productos,
  setProductos,
  toggleProducto,
  cambiarPrecioProducto,
}) {
  const MONO_NARANJA = "#f97316";
  const MONO_AMARILLO = "#fef3c7";
  const MONO_VERDE = "#16a34a";
  const MONO_TEXTO = "#333333";

  // 🔹 SWITCH reutilizable
  const MiniSwitch = ({ activo, onClick }) => (
    <div
      onClick={onClick}
      style={{
        width: '40px',
        height: '22px',
        backgroundColor: activo ? MONO_VERDE : '#ccc',
        borderRadius: '20px',
        position: 'relative',
        cursor: 'pointer',
        transition: '0.3s'
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          background: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '3px',
          left: activo ? '21px' : '3px',
          transition: '0.3s'
        }}
      />
    </div>
  );

  // 🔥 CREAR PRODUCTO
  const crearProducto = () => {
    const nombre = prompt("Nombre del producto:");
    if (!nombre) return;

    const precio = parseInt(prompt("Precio:")) || 0;
    const categoria = prompt("Categoría (fritos, bebidas, etc):") || "fritos";

    const nuevo = {
      id: Date.now(),
      nombre,
      precio,
      disponible: true,
      categoria,
      imagen: "/default.png"
    };

    setProductos(prev => [...prev, nuevo]);
    toast.success("Producto creado");
  };

  // ✏️ EDITAR NOMBRE
  const editarNombre = (id) => {
    const nuevoNombre = prompt("Nuevo nombre:");
    if (!nuevoNombre) return;

    setProductos(prev =>
      prev.map(p => p.id === id ? { ...p, nombre: nuevoNombre } : p)
    );

    toast.success("Nombre actualizado");
  };

  // 🖼️ EDITAR IMAGEN
  const editarImagen = (id) => {
    const nueva = prompt("URL de la imagen:");
    if (!nueva) return;

    setProductos(prev =>
      prev.map(p => p.id === id ? { ...p, imagen: nueva } : p)
    );

    toast.success("Imagen actualizada");
  };

  // ❌ ELIMINAR PRODUCTO
  const eliminarProducto = (id) => {
    const confirm = window.confirm("¿Eliminar producto?");
    if (!confirm) return;

    setProductos(prev => prev.filter(p => p.id !== id));
    toast.success("Producto eliminado");
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
      <Toaster position="top-center" />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 🔙 VOLVER */}
        <button
          onClick={() => setIsAdmin(false)}
          style={{
            marginBottom: '20px',
            padding: '10px 15px',
            borderRadius: '10px',
            border: 'none',
            background: MONO_TEXTO,
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ← Volver
        </button>

        {/* 🟢 ESTADO TIENDA */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: MONO_NARANJA }}>Estado de la tienda</h2>

          <button
            onClick={() => setTiendaAbierta(!tiendaAbierta)}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '15px',
              border: 'none',
              background: tiendaAbierta ? MONO_VERDE : 'red',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {tiendaAbierta ? '🟢 ABIERTA' : '🔴 CERRADA'}
          </button>
        </div>

        {/* ➕ CREAR PRODUCTO */}
        <button
          onClick={crearProducto}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '15px',
            border: 'none',
            background: MONO_NARANJA,
            color: 'white',
            fontWeight: 'bold',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
        >
          ➕ Agregar Producto
        </button>

        {/* 🍽️ LISTA DE PRODUCTOS */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          {productos.map(p => (
            <div
              key={p.id}
              style={{
                borderBottom: '1px solid #eee',
                padding: '15px'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{p.nombre}</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                    {p.categoria}
                  </p>
                </div>

                <MiniSwitch
                  activo={p.disponible}
                  onClick={() => toggleProducto(p.id)}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '10px',
                flexWrap: 'wrap'
              }}>
                <input
                  type="number"
                  value={p.precio}
                  onChange={(e) =>
                    cambiarPrecioProducto(p.id, e.target.value)
                  }
                  style={{ width: '90px', padding: '5px' }}
                />

                <button onClick={() => editarNombre(p.id)}>✏️ Nombre</button>
                <button onClick={() => editarImagen(p.id)}>🖼️ Imagen</button>
                <button onClick={() => eliminarProducto(p.id)}>❌ Eliminar</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}