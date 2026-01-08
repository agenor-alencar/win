import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from "lucide-react";
import { CartSuggestions } from "../../components/CartSuggestions";

const Cart: React.FC = () => {
  const { state, removeItem, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (state.items.length > 0) {
      navigate("/checkout");
    }
  };

  const handleQuantityChange = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  // Agrupa produtos por loja
  const groupedByStore = state.items.reduce((acc, item) => {
    const storeName = item.store || "Loja Desconhecida";
    if (!acc[storeName]) {
      acc[storeName] = [];
    }
    acc[storeName].push(item);
    return acc;
  }, {} as Record<string, typeof state.items>);

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header simples */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link to="/" className="text-[#3DBEAB] hover:text-[#2D9CDB] font-semibold">
              ← Voltar para Home
            </Link>
          </div>
        </div>

        {/* Carrinho Vazio */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-600 mb-8">
              Adicione produtos ao carrinho para continuar comprando
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Começar a Comprar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = state.total;
  const shipping = 15.0; // Frete fixo por enquanto
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="text-[#3DBEAB] hover:text-[#2D9CDB] font-semibold">
            ← Continuar Comprando
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Meu Carrinho ({state.itemCount} {state.itemCount === 1 ? "item" : "itens"})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4"
              >
                {/* Imagem */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                {/* Informações */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Vendido por: {item.store}</p>
                  
                  <div className="flex items-center space-x-4">
                    {/* Controle de Quantidade */}
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id as number, item.quantity, -1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="px-4 py-2 text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id as number, item.quantity, 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Preço */}
                    <div className="text-right flex-1">
                      <p className="text-lg font-bold text-[#3DBEAB]">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        R$ {item.price.toFixed(2)} cada
                      </p>
                    </div>

                    {/* Botão Remover */}
                    <button
                      onClick={() => removeItem(item.id as number)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {!item.inStock && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ Produto indisponível no momento
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Botão Limpar Carrinho */}
            <button
              onClick={clearCart}
              className="w-full py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Limpar Carrinho
            </button>

            {/* Sugestões de produtos da mesma loja */}
            {Object.entries(groupedByStore).map(([storeName, items]) => {
              // Extrai lojistaId do primeiro item (assumindo que todos têm)
              const firstItem = items[0];
              const lojistaId = (firstItem as any).lojistaId; // Você precisará adicionar isso ao CartContext
              const productIds = items.map(item => String(item.id));
              
              // Por enquanto, vamos usar um ID fictício se não houver
              // TODO: Adicionar lojistaId aos itens do carrinho
              if (!lojistaId) return null;

              return (
                <div key={storeName} className="mt-6">
                  <CartSuggestions
                    lojistaId={lojistaId}
                    lojistaName={storeName}
                    excludeProductIds={productIds}
                  />
                </div>
              );
            })}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({state.itemCount} itens)</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span>R$ {shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-[#3DBEAB]">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={state.items.some((item) => !item.inStock)}
                className="w-full py-3 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Finalizar Compra</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Frete grátis acima de R$ 100</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Pagamento 100% seguro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>7 dias para devolução</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
