<button 
  type="button" // <--- Esto evita que la página se recargue
  onClick={(e) => {
    e.preventDefault(); // <--- El "freno de mano" definitivo
    agregarAlCarrito(p);
  }}
  style={{ 
    background: MONO_NARANJA, 
    color: 'white', 
    border: 'none', 
    padding: '16px', 
    borderRadius: '15px', 
    fontWeight: 'bold', 
    fontSize: '18px', 
    cursor: 'pointer', 
    boxShadow: '0 4px 10px rgba(249, 115, 22, 0.2)' 
  }}
>
  Añadir al Pedido 🥟
</button>