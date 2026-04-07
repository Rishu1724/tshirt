import { create } from 'zustand';

const loadCart = () => {
  try {
    const raw = localStorage.getItem('cart_items');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistCart = (items) => {
  localStorage.setItem('cart_items', JSON.stringify(items));
};

const useCartStore = create((set, get) => ({
  items: loadCart(),
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (product) => {
    const items = get().items;
    const existing = items.find((item) => item.product._id === product._id);

    const nextItems = existing
      ? items.map((item) =>
          item.product._id === product._id ? { ...item, qty: item.qty + 1 } : item
        )
      : [...items, { product, qty: 1 }];

    persistCart(nextItems);
    set({ items: nextItems });
  },

  updateQty: (productId, qty) => {
    const safeQty = Math.max(1, Number(qty) || 1);
    const nextItems = get().items.map((item) =>
      item.product._id === productId ? { ...item, qty: safeQty } : item
    );

    persistCart(nextItems);
    set({ items: nextItems });
  },

  removeItem: (productId) => {
    const nextItems = get().items.filter((item) => item.product._id !== productId);
    persistCart(nextItems);
    set({ items: nextItems });
  },

  clearCart: () => {
    persistCart([]);
    set({ items: [] });
  },
}));

export default useCartStore;
