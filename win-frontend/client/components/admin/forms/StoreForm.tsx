import React, { useState } from "react";
import { AdminModal } from "../AdminModal";

interface StoreFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storeData: any) => void;
}

export const StoreForm: React.FC<StoreFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    // Basic Info
    fantasyName: "",
    corporateName: "",
    cnpj: "",
    email: "",
    phone: "",
    whatsapp: "",
    // Owner Info
    ownerName: "",
    ownerCpf: "",
    ownerEmail: "",
    // Address
    address: {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
    // Business Info
    category: "",
    description: "",
    website: "",
    // Banking
    bankInfo: {
      bank: "",
      agency: "",
      account: "",
      accountType: "corrente",
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const categories = [
    "Eletrônicos",
    "Roupas & Moda",
    "Casa & Jardim",
    "Esportes & Lazer",
    "Beleza & Saúde",
    "Livros & Papelaria",
    "Brinquedos",
    "Automotivo",
    "Alimentação",
    "Ferramentas",
  ];

  const brazilianBanks = [
    "Banco do Brasil",
    "Bradesco",
    "Caixa Econômica Federal",
    "Itaú",
    "Santander",
    "Nubank",
    "Inter",
    "Sicoob",
    "Sicredi",
    "Banco Original",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      fantasyName: "",
      corporateName: "",
      cnpj: "",
      email: "",
      phone: "",
      whatsapp: "",
      ownerName: "",
      ownerCpf: "",
      ownerEmail: "",
      address: {
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      category: "",
      description: "",
      website: "",
      bankInfo: {
        bank: "",
        agency: "",
        account: "",
        accountType: "corrente",
      },
    });
    setCurrentStep(1);
    onClose();
  };

  const updateFormData = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.fantasyName &&
          formData.corporateName &&
          formData.cnpj &&
          formData.email
        );
      case 2:
        return formData.ownerName && formData.ownerCpf && formData.ownerEmail;
      case 3:
        return (
          formData.address.street &&
          formData.address.city &&
          formData.address.state
        );
      case 4:
        return formData.category;
      default:
        return false;
    }
  };

  const stepTitles = [
    "Dados da Empresa",
    "Dados do Responsável",
    "Endereço",
    "Categoria e Finalização",
  ];

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cadastrar Nova Loja"
      size="xl"
      actions={
        <div className="flex justify-between w-full">
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="store-form"
              disabled={!canProceed()}
              className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === totalSteps ? "Cadastrar Loja" : "Próximo"}
            </button>
          </div>
        </div>
      }
    >
      <form id="store-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {stepTitles[currentStep - 1]} - Etapa {currentStep} de{" "}
              {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% concluído
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Company Data */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Dados da Empresa
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Fantasia *
              </label>
              <input
                type="text"
                required
                value={formData.fantasyName}
                onChange={(e) => updateFormData("fantasyName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Como a loja será conhecida"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razão Social *
              </label>
              <input
                type="text"
                required
                value={formData.corporateName}
                onChange={(e) =>
                  updateFormData("corporateName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Nome oficial da empresa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cnpj}
                  onChange={(e) => updateFormData("cnpj", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="(11) 3333-3333"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => updateFormData("whatsapp", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Owner Data */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Dados do Responsável
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Responsável *
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => updateFormData("ownerName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Nome completo do responsável"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF do Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerCpf}
                  onChange={(e) => updateFormData("ownerCpf", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail do Responsável *
                </label>
                <input
                  type="email"
                  required
                  value={formData.ownerEmail}
                  onChange={(e) => updateFormData("ownerEmail", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="responsavel@email.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Address */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Endereço da Loja
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    updateFormData("address.zipCode", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="00000-000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address.number}
                  onChange={(e) =>
                    updateFormData("address.number", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.address.complement}
                  onChange={(e) =>
                    updateFormData("address.complement", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="Sala, andar..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rua/Avenida *
              </label>
              <input
                type="text"
                required
                value={formData.address.street}
                onChange={(e) =>
                  updateFormData("address.street", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Nome da rua"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bairro
              </label>
              <input
                type="text"
                value={formData.address.neighborhood}
                onChange={(e) =>
                  updateFormData("address.neighborhood", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Nome do bairro"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address.city}
                  onChange={(e) =>
                    updateFormData("address.city", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="Nome da cidade"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  required
                  value={formData.address.state}
                  onChange={(e) =>
                    updateFormData("address.state", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PR">Paraná</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="BA">Bahia</option>
                  <option value="GO">Goiás</option>
                  <option value="PE">Pernambuco</option>
                  <option value="CE">Ceará</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Category and Finalization */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Categoria e Informações Adicionais
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria Principal *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => updateFormData("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição da Loja
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Descreva sua loja e produtos..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website (opcional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="https://www.minhaloja.com"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-md font-semibold text-blue-800 mb-2">
                Próximos Passos
              </h4>
              <p className="text-blue-700 text-sm">
                Após o cadastro, nossa equipe analisará os dados da loja e
                entrará em contato para finalizar o processo de aprovação. Você
                receberá um e-mail com as instruções para configurar os dados
                bancários e começar a vender.
              </p>
            </div>
          </div>
        )}
      </form>
    </AdminModal>
  );
};
