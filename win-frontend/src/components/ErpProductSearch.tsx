import React, { useState } from 'react';
import { erpApi, ErpProduct } from '@/lib/api/ErpApi';
import { useToast } from '@/hooks/use-toast';

interface ErpProductSearchProps {
  lojistaId: string;
  onImport: (product: ErpProduct) => void;
  disabled?: boolean;
}

export const ErpProductSearch: React.FC<ErpProductSearchProps> = ({
  lojistaId,
  onImport,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [erpSku, setErpSku] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundProduct, setFoundProduct] = useState<ErpProduct | null>(null);

  const handleSearch = async () => {
    if (!erpSku.trim()) {
      toast({
        title: 'Informe o código SKU do produto no ERP',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSearching(true);
      setFoundProduct(null);

      const product = await erpApi.buscarProdutoNoErp(lojistaId, erpSku.trim());

      if (product) {
        setFoundProduct(product);
        toast({
          title: 'Produto encontrado no ERP!',
        });
      } else {
        toast({
          title: 'Produto não encontrado no ERP',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar produto no ERP:', error);
      
      // ✅ Tratamento melhorado de erros
      let errorMessage = 'Erro ao buscar produto no ERP';
      let errorDescription = '';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Tempo esgotado ao conectar com o ERP';
        errorDescription = 'Verifique se o ERP está online e tente novamente.';
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Erro de conexão com o ERP';
        errorDescription = 'Verifique sua conexão com a internet ou se o ERP está configurado corretamente.';
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'Erro de autenticação no ERP';
        errorDescription = 'Suas credenciais do ERP podem estar inválidas. Acesse Configurações > ERP para atualizar.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Produto não encontrado no ERP';
        errorDescription = `O SKU "${erpSku.trim()}" não existe no seu sistema ERP.`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: errorMessage,
        description: errorDescription || 'Você pode criar o produto manualmente se preferir.',
        variant: 'destructive',
        duration: 6000,
      });
    } finally {
      setSearching(false);
    }
  };

  const handleImport = () => {
    if (foundProduct) {
      onImport(foundProduct);
      toast({
        title: 'Dados importados do ERP!',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Campo de busca */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Código SKU no ERP
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={erpSku}
            onChange={(e) => setErpSku(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite o SKU do produto no ERP"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={disabled || searching}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={disabled || searching || !erpSku.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Produto encontrado */}
      {foundProduct && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-2">
                Produto encontrado no ERP
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-green-800">
                <div>
                  <span className="font-medium">Nome:</span> {foundProduct.nome}
                </div>
                <div>
                  <span className="font-medium">SKU:</span> {foundProduct.sku}
                </div>
                <div>
                  <span className="font-medium">Preço:</span> R${' '}
                  {foundProduct.preco.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Estoque:</span>{' '}
                  {foundProduct.estoque} unidades
                </div>
                {foundProduct.marca && (
                  <div>
                    <span className="font-medium">Marca:</span> {foundProduct.marca}
                  </div>
                )}
                {foundProduct.categoria && (
                  <div>
                    <span className="font-medium">Categoria:</span>{' '}
                    {foundProduct.categoria}
                  </div>
                )}
                {foundProduct.codigoBarras && (
                  <div>
                    <span className="font-medium">Código de Barras:</span>{' '}
                    {foundProduct.codigoBarras}
                  </div>
                )}
                {foundProduct.pesoGramas && (
                  <div>
                    <span className="font-medium">Peso:</span>{' '}
                    {foundProduct.pesoGramas}g
                  </div>
                )}
              </div>
              {foundProduct.descricao && (
                <div className="mt-2 text-sm text-green-800">
                  <span className="font-medium">Descrição:</span>
                  <p className="mt-1">{foundProduct.descricao}</p>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleImport}
            disabled={disabled}
            className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            Importar Dados do ERP
          </button>
        </div>
      )}

      {/* Informação */}
      <div className="text-sm text-gray-600">
        <p>
          💡 <strong>Dica:</strong> Ao importar do ERP, os dados do produto
          (nome, descrição, preço, estoque) serão preenchidos automaticamente e o
          estoque será sincronizado periodicamente.
        </p>
      </div>
    </div>
  );
};
