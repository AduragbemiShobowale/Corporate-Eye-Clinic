import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'cec_cart'

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}
function saveCart(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

// Build a unique key for a cart line — same product with different
// prescription/color options is treated as a separate line item.
function lineKey(productId, options) {
  if (!options || Object.keys(options).length === 0) return productId
  return `${productId}::${JSON.stringify(options)}`
}

export function CartProvider({ children }) {
  const [items, setItems]       = useState(loadCart)   // [{ product, qty, options, key }]
  const [drawerOpen, setDrawer] = useState(false)

  useEffect(() => { saveCart(items) }, [items])

  // options = { re, le, color } for contact lenses, or undefined for normal products
  const addToCart = useCallback((product, options) => {
    const key = lineKey(product.id, options)
    setItems(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { product, qty: 1, options: options || null, key }]
    })
  }, [])

  const removeFromCart = useCallback((key) => {
    setItems(prev => prev.filter(i => i.key !== key))
  }, [])

  const updateQty = useCallback((key, qty) => {
    if (qty < 1) { removeFromCart(key); return }
    setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, total, count,
      addToCart, removeFromCart, updateQty, clearCart,
      drawerOpen, setDrawer,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)