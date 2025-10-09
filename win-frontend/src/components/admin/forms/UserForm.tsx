import React, { useState } from "react";
import { AdminModal } from "../AdminModal";

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    type: "Cliente",
    password: "",
    confirmPassword: "",
    address: {
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
      name: "",
      email: "",
      phone: "",
      cpf: "",
      type: "Cliente",
      password: "",
      confirmPassword: "",
      address: {
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
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
        return formData.name && formData.email && formData.type;
      case 2:
        return (
          formData.phone &&
          formData.cpf &&
          formData.password &&
          formData.confirmPassword
        );
      case 3:
        return (
          formData.address.street &&
          formData.address.city &&
          formData.address.state
        );
      default:
        return false;
    }
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cadastrar Novo Usuário"
      size="lg"
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
              form="user-form"
              disabled={!canProceed()}
              className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === totalSteps ? "Cadastrar" : "Próximo"}
            </button>
          </div>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Etapa {currentStep} de {totalSteps}
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

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Informações Básicas
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Digite o e-mail"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Usuário *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => updateFormData("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
              >
                <option value="Cliente">Cliente</option>
                <option value="Lojista">Lojista</option>
                <option value="Motorista">Motorista</option>
                <option value="Admin">Administrador</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Contact & Security */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Contato e Segurança
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF *
              </label>
              <input
                type="text"
                required
                value={formData.cpf}
                onChange={(e) => updateFormData("cpf", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  updateFormData("confirmPassword", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                placeholder="Confirme a senha"
              />
              {formData.password &&
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    As senhas não coincidem
                  </p>
                )}
            </div>
          </div>
        )}

        {/* Step 3: Address */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>

            <div className="grid grid-cols-2 gap-4">
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
                  Número
                </label>
                <input
                  type="text"
                  value={formData.address.number}
                  onChange={(e) =>
                    updateFormData("address.number", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DBEAB] focus:border-transparent"
                  placeholder="123"
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
      </form>
    </AdminModal>
  );
};
