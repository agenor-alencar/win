import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/Api";
import { MerchantLayout } from "@/components/MerchantLayout";

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  sku?: string;
  categoria?: {
    id: string;
    nome: string;
  };
  imagemPrincipal?: string;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lojistaId, setLojistaId] = useState<string | null>(null);

  // Buscar ID do lojista do usuário logado
  useEffect(() => {
    const fetchLojistaId = async () => {
      if (!user?.email) {
        console.log("User email não disponível");
        return;
      }
      
      try {
        console.log("Buscando lojista para:", user.email);
        // Busca o lojista logado diretamente
        const lojistaResponse = await api.get(`/api/v1/lojistas/me`);
        console.log("Lojista encontrado:", lojistaResponse.data);
        setLojistaId(lojistaResponse.data.id);
      } catch (error: any) {
        console.error("Erro ao buscar dados do lojista:", error);
        console.error("Detalhes do erro:", error.response?.data);
        toast({
          title: "Erro ao identificar lojista",
          description: error.response?.data?.message || "Não foi possível carregar seus dados de lojista.",
          variant: "destructive",
        });
      }
    };

    fetchLojistaId();
  }, [user, toast]);

  // Carregar produtos do lojista
  useEffect(() => {
    const fetchProdutos = async () => {
      if (!lojistaId) {
        console.log("LojistaId não disponível ainda");
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Carregando produtos do lojista:", lojistaId);
        const response = await api.get(`/api/v1/produtos/lojista/${lojistaId}`);
        console.log("Produtos carregados:", response.data);
        setProdutos(response.data);
        setFilteredProdutos(response.data);
      } catch (error: any) {
        console.error("Erro ao carregar produtos:", error);
        console.error("Detalhes:", error.response?.data);
        
        // Se não houver produtos, não mostrar erro
        if (error.response?.status === 404 || error.response?.data?.length === 0) {
          setProdutos([]);
          setFilteredProdutos([]);
        } else {
          toast({
            title: "Erro ao carregar produtos",
            description: error.response?.data?.message || "Tente novamente mais tarde.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProdutos();
  }, [lojistaId, toast]);

  // Filtrar produtos por busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProdutos(produtos);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(query) ||
        p.descricao?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.categoria?.nome.toLowerCase().includes(query)
    );
    setFilteredProdutos(filtered);
  }, [searchQuery, produtos]);

  // Ativar/Desativar produto
  const toggleProdutoStatus = async (produtoId: string, ativo: boolean) => {
    try {
      const endpoint = ativo ? `/produtos/${produtoId}/desativar` : `/produtos/${produtoId}/ativar`;
      await api.patch(endpoint);
      
      // Atualizar lista local
      setProdutos(produtos.map(p => 
        p.id === produtoId ? { ...p, ativo: !ativo } : p
      ));
      
      toast({
        title: ativo ? "Produto desativado" : "Produto ativado",
        description: `O produto foi ${ativo ? "desativado" : "ativado"} com sucesso.`,
      });
    } catch (error: any) {
      console.error("Erro ao alterar status do produto:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível alterar o status do produto.",
        variant: "destructive",
      });
    }
  };

  // Deletar produto (desativar permanentemente)
  const deleteProduto = async (produtoId: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja deletar o produto "${nome}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/v1/produtos/${produtoId}`);
      
      // Remover da lista local
      setProdutos(produtos.filter(p => p.id !== produtoId));
      
      toast({
        title: "Produto deletado",
        description: "O produto foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao deletar produto:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível deletar o produto.",
        variant: "destructive",
      });
    }
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-6 w-6 text-[#3DBEAB]" />
                Meus Produtos
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie seu catálogo de produtos
              </p>
            </div>
            <Link to="/merchant/products/new">
              <Button className="bg-[#3DBEAB] hover:bg-[#3DBEAB]/90">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, descrição, SKU ou categoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredProdutos.length} produto{filteredProdutos.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#3DBEAB]" />
              </div>
            ) : filteredProdutos.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchQuery ? "Nenhum produto encontrado" : "Você ainda não tem produtos cadastrados"}
                </p>
                {!searchQuery && (
                  <Link to="/merchant/products/new">
                    <Button className="mt-4 bg-[#3DBEAB] hover:bg-[#3DBEAB]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Produto
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {produto.imagemPrincipal ? (
                              <img
                                src={produto.imagemPrincipal}
                                alt={produto.nome}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {produto.nome}
                            </p>
                            {produto.sku && (
                              <p className="text-sm text-gray-500">SKU: {produto.sku}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {produto.categoria?.nome || (
                          <span className="text-gray-400 italic">Sem categoria</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {produto.preco.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={produto.estoque > 0 ? "default" : "destructive"}
                        >
                          {produto.estoque} un.
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={produto.ativo ? "default" : "secondary"}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/merchant/products/edit/${produto.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleProdutoStatus(produto.id, produto.ativo)}>
                              {produto.ativo ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteProduto(produto.id, produto.nome)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}
