import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  store: string;
  inStock: boolean;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  cartId: string | null; // Adicionado para rastrear o ID do carrinho no backend
}

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: Omit<CartItem, "quantity"> & { quantity?: number };
    }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: { items: CartItem[]; cartId: string } } // Payload agora inclui o ID do carrinho
  | { type: "SET_CART_ID"; payload: string }; // Ação para definir o ID do carrinho

const CartContext = createContext<{
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: item.quantity + (action.payload.quantity || 1),
              }
            : item,
        );
        return calculateTotals({ ...state, items: updatedItems }); // Passa o estado atualizado para calculateTotals
      } else {
        const newItem: CartItem = {
          ...action.payload,
          quantity: action.payload.quantity || 1,
        };
        const updatedItems = [...state.items, newItem];
        return calculateTotals({ ...state, items: updatedItems }); // Passa o estado atualizado para calculateTotals
      }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload,
      );
      return calculateTotals({ ...state, items: updatedItems }); // Passa o estado atualizado para calculateTotals
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        const updatedItems = state.items.filter(
          (item) => item.id !== action.payload.id,
        );
        return calculateTotals({ ...state, items: updatedItems }); // Passa o estado atualizado para calculateTotals
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item,
      );
      return calculateTotals({ ...state, items: updatedItems }); // Passa o estado atualizado para calculateTotals
    }

    case "CLEAR_CART":
      return { ...state, items: [], total: 0, itemCount: 0 }; // Mantém o cartId

    case "LOAD_CART":
      return {
        ...state,
        items: action.payload.items,
        cartId: action.payload.cartId,
      }; // Carrega o ID do carrinho

    case "SET_CART_ID":
      return { ...state, cartId: action.payload };

    default:
      return state;
  }
};

// Modifique a função calculateTotals para receber o estado completo
const calculateTotals = (state: CartState): CartState => {
  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  return { ...state, total, itemCount }; // Retorna o estado atualizado
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    cartId: null, // Inicializa o ID do carrinho como nulo
  });

  // Função para criar ou buscar o carrinho no backend
  const createOrGetCart = useCallback(async () => {
    const storedCartId = localStorage.getItem("win-cart-id");

    if (storedCartId) {
      try {
        // Buscar o carrinho existente no backend
        const response = await fetch(`/api/cart/${storedCartId}`);
        if (response.ok) {
          const data = await response.json();
          dispatch({ type: "LOAD_CART", payload: { items: data.items, cartId: storedCartId } });
          dispatch({ type: "SET_CART_ID", payload: storedCartId });
        } else {
          // Se o carrinho não existir mais no backend, remover do localStorage
          localStorage.removeItem("win-cart-id");
          // Criar um novo carrinho
          createNewCart();
        }
      } catch (error) {
        console.error("Error fetching cart from backend:", error);
        // Criar um novo carrinho em caso de erro
        createNewCart();
      }
    } else {
      // Criar um novo carrinho se não houver ID no localStorage
      createNewCart();
    }
  }, []);

  // Função auxiliar para criar um novo carrinho no backend
  const createNewCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("win-cart-id", data.cartId);
        dispatch({ type: "SET_CART_ID", payload: data.cartId });
      } else {
        console.error("Error creating cart on backend:", response.status);
      }
    } catch (error) {
      console.error("Error creating cart on backend:", error);
    }
  }, []);

  // Carregar o carrinho ao montar o componente
  useEffect(() => {
    createOrGetCart();
  }, [createOrGetCart]);

  // Função para salvar o carrinho no backend
  const saveCartToBackend = useCallback(async () => {
    if (state.cartId) {
      try {
        await fetch(`/api/cart/${state.cartId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: state.items }),
        });
      } catch (error) {
        console.error("Error saving cart to backend:", error);
      }
    }
  }, [state.cartId, state.items]);

  // Salvar o carrinho no backend sempre que ele mudar
  useEffect(() => {
    saveCartToBackend();
  }, [saveCartToBackend]);

  const addItem = async (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
  ) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
