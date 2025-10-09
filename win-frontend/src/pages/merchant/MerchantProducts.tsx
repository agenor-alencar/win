import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image,
  Store,
  Settings,
  ShoppingBag,
  Upload,
  DollarSign,
  Hash,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

// Mock data
const products = [
  {
    id: 1,
    name: "Parafuso Phillips 3x20mm - Pacote com 100 unidades",
    price: 12.5,
    stock: 250,
    category: "Ferragens",
    status: "active",
    image: "/placeholder.svg",
    description: "Parafusos Phillips de alta qualidade para uso geral",
    sku: "PAR-001",
  },
  {
    id: 2,
    name: "Furadeira de Impacto 650W",
    price: 189.9,
    stock: 15,
    category: "Ferramentas",
    status: "active",
    image: "/placeholder.svg",
    description: "Furadeira profissional com mandril de 13mm",
    sku: "FUR-002",
  },
  {
    id: 3,
    name: "Chave de Fenda 6mm",
    price: 18.9,
    stock: 0,
    category: "Ferramentas",
    status: "inactive",
    image: "/placeholder.svg",
    description: "Chave de fenda com cabo emborrachado",
    sku: "CHA-003",
  },
];

const categories = [
  "Ferragens",
  "Ferramentas",
  "Elétrica",
  "Hidráulica",
  "Tintas",
  "Materiais de Construção",
];

export default function MerchantProducts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { success, error: notifyError } = useNotification();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    sku: "",
    image: null,
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    success("Produto adicionado!", "Produto criado com sucesso");
    setShowAddProduct(false);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      sku: "",
      image: null,
    });
  };

  const toggleProductStatus = (productId: number) => {
    success("Status atualizado!", "Produto foi ativado/desativado");
  };

  const deleteProduct = (productId: number) => {
    success("Produto removido!", "Produto foi excluído da loja");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || product.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { label: "Sem estoque", color: "#EF4444", bg: "#FEF2F2" };
    if (stock <= 10)
      return { label: "Estoque baixo", color: "#F59E0B", bg: "#FFF7ED" };
    return { label: "Em estoque", color: "#10B981", bg: "#F0FDF4" };
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <header
        className="border-b px-6 py-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-8 w-8 mr-3" style={{ color: "#3DBEAB" }} />
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#333333",
                }}
              >
                Gestão de Produtos
              </h1>
              <p style={{ fontSize: "12px", color: "#666666" }}>
                Gerencie o catálogo da sua loja
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowAddProduct(true)}
              className="h-12 text-white font-medium"
              style={{
                backgroundColor: "#3DBEAB",
                borderRadius: "12px",
                fontSize: "16px",
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-3 h-5 w-5"
              style={{ color: "#666666" }}
            />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
              style={{ borderRadius: "12px", fontSize: "16px" }}
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger
              className="w-full md:w-48 h-12"
              style={{ borderRadius: "12px" }}
            >
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger
              className="w-full md:w-48 h-12"
              style={{ borderRadius: "12px" }}
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Total de Produtos
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#333333",
                    }}
                  >
                    {products.length}
                  </p>
                </div>
                <Package className="h-8 w-8" style={{ color: "#3DBEAB" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Produtos Ativos
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#333333",
                    }}
                  >
                    {products.filter((p) => p.status === "active").length}
                  </p>
                </div>
                <Eye className="h-8 w-8" style={{ color: "#10B981" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Estoque Baixo
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#333333",
                    }}
                  >
                    {
                      products.filter((p) => p.stock <= 10 && p.stock > 0)
                        .length
                    }
                  </p>
                </div>
                <Package className="h-8 w-8" style={{ color: "#F59E0B" }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Sem Estoque
                  </p>
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#333333",
                    }}
                  >
                    {products.filter((p) => p.stock === 0).length}
                  </p>
                </div>
                <Package className="h-8 w-8" style={{ color: "#EF4444" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);

            return (
              <Card
                key={product.id}
                style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
              >
                <CardContent className="p-6">
                  <div className="relative mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <Badge
                        style={{
                          backgroundColor: stockStatus.bg,
                          color: stockStatus.color,
                          fontSize: "10px",
                        }}
                      >
                        {stockStatus.label}
                      </Badge>
                      <Badge
                        style={{
                          backgroundColor:
                            product.status === "active" ? "#F0FDF4" : "#FEF2F2",
                          color:
                            product.status === "active" ? "#10B981" : "#EF4444",
                          fontSize: "10px",
                        }}
                      >
                        {product.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#333333",
                          lineHeight: "1.4",
                        }}
                      >
                        {product.name}
                      </h3>
                      <p style={{ fontSize: "12px", color: "#666666" }}>
                        SKU: {product.sku} • {product.category}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ fontSize: "12px", color: "#666666" }}>
                          Preço
                        </p>
                        <p
                          style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "#3DBEAB",
                          }}
                        >
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontSize: "12px", color: "#666666" }}>
                          Estoque
                        </p>
                        <p
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: stockStatus.color,
                          }}
                        >
                          {product.stock} un
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                        className="flex-1"
                        style={{ borderRadius: "12px" }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProductStatus(product.id)}
                        style={{
                          borderRadius: "12px",
                          borderColor:
                            product.status === "active" ? "#F59E0B" : "#10B981",
                          color:
                            product.status === "active" ? "#F59E0B" : "#10B981",
                        }}
                      >
                        {product.status === "active" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                        style={{
                          borderRadius: "12px",
                          borderColor: "#EF4444",
                          color: "#EF4444",
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: "#E5E7EB" }}
            />
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#333333",
                marginBottom: "8px",
              }}
            >
              Nenhum produto encontrado
            </h3>
            <p style={{ fontSize: "16px", color: "#666666" }}>
              Não há produtos que correspondam aos filtros selecionados.
            </p>
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent
          style={{ borderRadius: "12px", maxWidth: "600px", maxHeight: "90vh" }}
          className="overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle style={{ fontSize: "24px", color: "#333333" }}>
              Adicionar Novo Produto
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Product Image */}
              <div>
                <Label style={{ fontSize: "16px", color: "#333333" }}>
                  Imagem do Produto
                </Label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center mt-2"
                  style={{ borderColor: "#E5E7EB", borderRadius: "12px" }}
                >
                  <Upload
                    className="h-12 w-12 mx-auto mb-4"
                    style={{ color: "#9CA3AF" }}
                  />
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#333333",
                      marginBottom: "4px",
                    }}
                  >
                    Clique para fazer upload
                  </p>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    PNG, JPG até 5MB
                  </p>
                </div>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label style={{ fontSize: "16px", color: "#333333" }}>
                    Nome do Produto *
                  </Label>
                  <Input
                    placeholder="Digite o nome do produto"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="h-12 mt-2"
                    style={{ borderRadius: "12px", fontSize: "16px" }}
                    required
                  />
                </div>

                <div>
                  <Label style={{ fontSize: "16px", color: "#333333" }}>
                    SKU *
                  </Label>
                  <div className="relative mt-2">
                    <Hash
                      className="absolute left-3 top-3 h-5 w-5"
                      style={{ color: "#6B7280" }}
                    />
                    <Input
                      placeholder="SKU do produto"
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, sku: e.target.value })
                      }
                      className="pl-10 h-12"
                      style={{ borderRadius: "12px", fontSize: "16px" }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label style={{ fontSize: "16px", color: "#333333" }}>
                  Descrição
                </Label>
                <Textarea
                  placeholder="Descreva o produto..."
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  className="mt-2 min-h-20"
                  style={{ borderRadius: "12px", fontSize: "16px" }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label style={{ fontSize: "16px", color: "#333333" }}>
                    Preço *
                  </Label>
                  <div className="relative mt-2">
                    <DollarSign
                      className="absolute left-3 top-3 h-5 w-5"
                      style={{ color: "#6B7280" }}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="pl-10 h-12"
                      style={{ borderRadius: "12px", fontSize: "16px" }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label style={{ fontSize: "16px", color: "#333333" }}>
                    Estoque *
                  </Label>
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    className="h-12 mt-2"
                    style={{ borderRadius: "12px", fontSize: "16px" }}
                    required
                  />
                </div>

                <div>
                  <Label style={{ fontSize: "16px", color: "#333333" }}>
                    Categoria *
                  </Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, category: value })
                    }
                  >
                    <SelectTrigger
                      className="h-12 mt-2"
                      style={{ borderRadius: "12px" }}
                    >
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddProduct(false)}
                className="flex-1 h-12"
                style={{ borderRadius: "12px", fontSize: "16px" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 text-white font-medium"
                style={{
                  backgroundColor: "#3DBEAB",
                  borderRadius: "12px",
                  fontSize: "16px",
                }}
              >
                Adicionar Produto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/merchant/dashboard"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Store className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>
              Dashboard
            </span>
          </Link>
          <Link
            to="/merchant/orders"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Package className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Pedidos</span>
          </Link>
          <Link
            to="/merchant/products"
            className="flex flex-col items-center justify-center"
            style={{ color: "#3DBEAB" }}
          >
            <ShoppingBag className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Produtos</span>
          </Link>
          <Link
            to="/merchant/profile"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Settings className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
