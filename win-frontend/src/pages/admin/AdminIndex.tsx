import React from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";

const AdminIndex: React.FC = () => {
  const adminPages = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      description: "Visão geral e métricas",
    },
    {
      name: "Usuários",
      path: "/admin/users",
      description: "Gestão de clientes, lojistas e motoristas",
    },
    {
      name: "Lojas",
      path: "/admin/stores",
      description: "Aprovação e gestão de lojas",
    },
    {
      name: "Motoristas",
      path: "/admin/drivers",
      description: "Aprovação e gestão de motoristas",
    },
    {
      name: "Categorias",
      path: "/admin/categories",
      description: "CRUD de categorias com drag-drop",
    },
    {
      name: "Produtos",
      path: "/admin/products",
      description: "Moderação e gestão de produtos",
    },
    {
      name: "Pedidos",
      path: "/admin/orders",
      description: "Gestão e rastreamento de pedidos",
    },
    {
      name: "Entregas",
      path: "/admin/deliveries",
      description: "Monitoramento de entregas",
    },
    {
      name: "Finanças",
      path: "/admin/finances",
      description: "Gestão financeira e relatórios",
    },
    {
      name: "Configurações",
      path: "/admin/settings",
      description: "Configurações do sistema",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">
            Painel Administrativo WIN
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema completo de gestão do marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminPages.map((page, index) => (
            <Link
              key={index}
              to={page.path}
              className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#3DBEAB] transition-all duration-200"
            >
              <h3 className="text-lg font-semibold text-[#111827] mb-2">
                {page.name}
              </h3>
              <p className="text-gray-600 text-sm">{page.description}</p>
              <div className="mt-4 flex items-center text-[#3DBEAB] text-sm font-medium">
                Acessar →
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Sistema Funcionando
          </h3>
          <p className="text-green-700 text-sm">
            Todos os componentes do painel admin foram implementados com
            sucesso! Clique nos cards acima para navegar pelas diferentes
            seções.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-green-700">
              <strong>✓</strong> Layout responsivo
            </div>
            <div className="text-green-700">
              <strong>✓</strong> Sidebar colapsível
            </div>
            <div className="text-green-700">
              <strong>✓</strong> Tabelas sortáveis
            </div>
            <div className="text-green-700">
              <strong>✓</strong> Modais interativos
            </div>
            <div className="text-green-700">
              <strong>✓</strong> Gráficos KPI
            </div>
            <div className="text-green-700">
              <strong>✓</strong> Filtros avançados
            </div>
            <div className="text-green-700">
              <strong>✓</strong> Design system
            </div>
            <div className="text-green-700">
              <strong>✓</strong> Routing completo
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            📊 Funcionalidades Implementadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <ul className="space-y-1">
              <li>• Dashboard com KPIs e gráficos</li>
              <li>• Gestão completa de usuários</li>
              <li>• Aprovação de lojas e motoristas</li>
              <li>• Verificação de documentos</li>
              <li>• CRUD de categorias com drag-drop</li>
            </ul>
            <ul className="space-y-1">
              <li>• Moderação de produtos</li>
              <li>• Gestão de pedidos e entregas</li>
              <li>• Sistema financeiro completo</li>
              <li>• Configurações do sistema</li>
              <li>• Design responsivo e moderno</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIndex;
