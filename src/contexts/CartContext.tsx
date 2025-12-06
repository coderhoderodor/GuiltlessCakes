'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { Cart, CartItem, DeliveryAddress } from '@/types';
import { FREE_DELIVERY_MINIMUM, DELIVERY_FEE } from '@/lib/constants';

interface CartState extends Cart {
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { menuItemId: string; quantity: number } }
  | { type: 'SET_DELIVERY_DATE'; payload: string }
  | { type: 'SET_DELIVERY_WINDOW'; payload: string }
  | { type: 'SET_DELIVERY_ADDRESS'; payload: DeliveryAddress }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  deliveryDate: null,
  deliveryWindowId: null,
  deliveryAddress: null,
  isOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        (item) => item.menuItemId === action.payload.menuItemId
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.menuItemId === action.payload.menuItemId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          isOpen: true,
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
        isOpen: true,
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.menuItemId !== action.payload),
      };

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => item.menuItemId !== action.payload.menuItemId
          ),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.menuItemId === action.payload.menuItemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case 'SET_DELIVERY_DATE':
      return {
        ...state,
        deliveryDate: action.payload,
      };

    case 'SET_DELIVERY_WINDOW':
      return {
        ...state,
        deliveryWindowId: action.payload,
      };

    case 'SET_DELIVERY_ADDRESS':
      return {
        ...state,
        deliveryAddress: action.payload,
      };

    case 'CLEAR_CART':
      return {
        ...initialState,
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
}

interface CartContextType {
  cart: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  setDeliveryDate: (date: string) => void;
  setDeliveryWindow: (windowId: string) => void;
  setDeliveryAddress: (address: DeliveryAddress) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'guiltless-cakes-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: { ...parsed, isOpen: false } });
      } catch {
        // Invalid cart data, ignore
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (menuItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: menuItemId });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId, quantity } });
  };

  const setDeliveryDate = (date: string) => {
    dispatch({ type: 'SET_DELIVERY_DATE', payload: date });
  };

  const setDeliveryWindow = (windowId: string) => {
    dispatch({ type: 'SET_DELIVERY_WINDOW', payload: windowId });
  };

  const setDeliveryAddress = (address: DeliveryAddress) => {
    dispatch({ type: 'SET_DELIVERY_ADDRESS', payload: address });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const deliveryFee = subtotal >= FREE_DELIVERY_MINIMUM ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        setDeliveryDate,
        setDeliveryWindow,
        setDeliveryAddress,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        itemCount,
        subtotal,
        deliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
