import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  store: string;
  lojistaId?: string; // ID do lojista para sugestões
  inStock: boolean;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: Omit<CartItem, "quantity"> & { quantity?: number };
    }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  createOrder: (usuarioId: string, enderecoEntrega: any, pagamento?: any) => Promise<any>;
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
      return { items: [], total: 0, itemCount: 0 };

    case "LOAD_CART":
      return calculateTotals({ ...state, items: action.payload });

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
  });

  // Rastrear usuário atual para detectar mudanças
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id;
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    return null;
  });

  // Função para obter a chave do carrinho baseada no usuário
  const getCartKey = (userId: string | null) => {
    if (userId) {
      return `win-cart-${userId}`;
    }
    return "win-cart-guest"; // Carrinho para usuário não logado
  };

  // Detectar mudanças no usuário logado
  useEffect(() => {
    const checkUserChange = () => {
      const user = localStorage.getItem("user");
      let newUserId: string | null = null;
      
      if (user) {
        try {
          const userData = JSON.parse(user);
          newUserId = userData.id;
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

      if (newUserId !== currentUserId) {
        setCurrentUserId(newUserId);
      }
    };

    // Verificar mudanças no localStorage periodicamente
    const interval = setInterval(checkUserChange, 500);
    
    // Verificar também em eventos de storage
    window.addEventListener("storage", checkUserChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkUserChange);
    };
  }, [currentUserId]);

  // Carregar carrinho quando o usuário mudar
  useEffect(() => {
    const cartKey = getCartKey(currentUserId);
    const storedCart = localStorage.getItem(cartKey);
    
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        dispatch({ type: "LOAD_CART", payload: items });
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        dispatch({ type: "CLEAR_CART" });
      }
    } else {
      // Limpar carrinho se não houver dados para este usuário
      dispatch({ type: "CLEAR_CART" });
    }
  }, [currentUserId]);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    const cartKey = getCartKey(currentUserId);
    localStorage.setItem(cartKey, JSON.stringify(state.items));
  }, [state.items, currentUserId]);

  const addItem = (
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
    const cartKey = getCartKey(currentUserId);
    localStorage.removeItem(cartKey);
  };

  // Criar pedido no backend (POST /api/v1/pedidos)
  const createOrder = async (usuarioId: string, enderecoEntrega: any, pagamento?: any) => {
    if (state.items.length === 0) {
      throw new Error("Carrinho vazio");
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/v1/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          usuarioId: usuarioId,
          enderecoEntrega: enderecoEntrega,
          pagamento: pagamento || null,
          desconto: 0,
          frete: 0,
          observacoes: null,
          itens: state.items.map((item) => ({
            produtoId: item.id,
            quantidade: item.quantity,
            precoUnitario: item.price,
            variacaoId: null,
            observacoes: null,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Erro ao criar pedido: ${response.status}`
        );
      }

      const pedido = await response.json();

      // Limpar carrinho após criar pedido
      clearCart();

      return pedido;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQuantity, clearCart, createOrder }}
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
