import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  User,
  Building,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  // Dados básicos
  storeName: string;
  ownerName: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Contato
  phone: string;
  whatsapp: string;

  // Documentos
  cnpj: string;
  cpf: string;

  // Endereço
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;

  // Categoria e descrição
  category: string;
  description: string;

  // Termos
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export default function MerchantAuth() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: notifyError } = useNotification();

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    storeName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    whatsapp: "",
    cnpj: "",
    cpf: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    category: "",
    description: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      success("Login realizado com sucesso!", "Bem-vindo à sua loja");
      setTimeout(() => {
        window.location.href = "/merchant/dashboard";
      }, 1500);
    }, 2000);
  };

  const handleRegisterStep = (step: number) => {
    if (step < 4) {
      setCurrentStep(step + 1);
    } else {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      success(
        "Cadastro realizado com sucesso!",
        "Sua loja será analisada em até 24h",
      );
    }, 2000);
  };

  const categories = [
    "Ferragens e Materiais de Construção",
    "Eletrônicos e Informática",
    "Casa e Decoração",
    "Moda e Beleza",
    "Esportes e Lazer",
    "Automotivo",
    "Saúde e Bem-estar",
    "Livros e Papelaria",
    "Alimentação",
    "Outros",
  ];

  const states = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FFFE] to-[#E8F8F6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WIN Lojista</h1>
          <p className="text-gray-600">Gerencie sua loja online</p>
        </div>

        <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-gray-800">
              {activeTab === "login"
                ? "Entrar na sua conta"
                : "Cadastrar sua loja"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm">
                        Lembrar de mim
                      </Label>
                    </div>
                    <Link
                      to="/merchant/forgot-password"
                      className="text-sm text-[#3DBEAB] hover:underline"
                    >
                      Esqueci a senha
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#3DBEAB] hover:bg-[#3DBEAB]/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      Etapa {currentStep} de 4
                    </span>
                    <span className="text-sm text-gray-500">
                      {((currentStep / 4) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#3DBEAB] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                  {/* Etapa 1: Dados Básicos */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <Building className="h-8 w-8 text-[#3DBEAB] mx-auto mb-2" />
                        <h3 className="font-semibold">Dados da Loja</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="storeName">Nome da Loja *</Label>
                        <Input
                          id="storeName"
                          placeholder="Ex: Loja do João"
                          value={registerData.storeName}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              storeName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ownerName">
                          Nome do Proprietário *
                        </Label>
                        <Input
                          id="ownerName"
                          placeholder="João Silva"
                          value={registerData.ownerName}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              ownerName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regEmail">E-mail *</Label>
                        <Input
                          id="regEmail"
                          type="email"
                          placeholder="joao@loja.com"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="regPassword">Senha *</Label>
                          <Input
                            id="regPassword"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={registerData.password}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                password: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirmar Senha *
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Repita a senha"
                            value={registerData.confirmPassword}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 2: Contato e Documentos */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <Phone className="h-8 w-8 text-[#3DBEAB] mx-auto mb-2" />
                        <h3 className="font-semibold">Contato e Documentos</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input
                            id="phone"
                            placeholder="(11) 99999-9999"
                            value={registerData.phone}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                phone: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="whatsapp">WhatsApp</Label>
                          <Input
                            id="whatsapp"
                            placeholder="(11) 99999-9999"
                            value={registerData.whatsapp}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                whatsapp: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cnpj">CNPJ *</Label>
                          <Input
                            id="cnpj"
                            placeholder="00.000.000/0001-00"
                            value={registerData.cnpj}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                cnpj: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF do Proprietário *</Label>
                          <Input
                            id="cpf"
                            placeholder="000.000.000-00"
                            value={registerData.cpf}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                cpf: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 3: Endereço */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <MapPin className="h-8 w-8 text-[#3DBEAB] mx-auto mb-2" />
                        <h3 className="font-semibold">Endereço da Loja</h3>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cep">CEP *</Label>
                          <Input
                            id="cep"
                            placeholder="00000-000"
                            value={registerData.cep}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                cep: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="address">Endereço *</Label>
                          <Input
                            id="address"
                            placeholder="Rua, Avenida..."
                            value={registerData.address}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                address: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="number">Número *</Label>
                          <Input
                            id="number"
                            placeholder="123"
                            value={registerData.number}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                number: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="complement">Complemento</Label>
                          <Input
                            id="complement"
                            placeholder="Sala, Andar..."
                            value={registerData.complement}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                complement: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro *</Label>
                        <Input
                          id="neighborhood"
                          placeholder="Centro, Vila..."
                          value={registerData.neighborhood}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              neighborhood: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade *</Label>
                          <Input
                            id="city"
                            placeholder="São Paulo"
                            value={registerData.city}
                            onChange={(e) =>
                              setRegisterData({
                                ...registerData,
                                city: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado *</Label>
                          <Select
                            value={registerData.state}
                            onValueChange={(value) =>
                              setRegisterData({ ...registerData, state: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etapa 4: Categoria e Finalização */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <CheckCircle className="h-8 w-8 text-[#3DBEAB] mx-auto mb-2" />
                        <h3 className="font-semibold">Finalizar Cadastro</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria da Loja *</Label>
                        <Select
                          value={registerData.category}
                          onValueChange={(value) =>
                            setRegisterData({
                              ...registerData,
                              category: value,
                            })
                          }
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição da Loja</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva sua loja, produtos e diferenciais..."
                          rows={3}
                          value={registerData.description}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="acceptTerms"
                            checked={registerData.acceptTerms}
                            onCheckedChange={(checked) =>
                              setRegisterData({
                                ...registerData,
                                acceptTerms: checked as boolean,
                              })
                            }
                          />
                          <Label htmlFor="acceptTerms" className="text-sm">
                            Aceito os{" "}
                            <Link
                              to="/terms"
                              className="text-[#3DBEAB] hover:underline"
                            >
                              Termos de Uso
                            </Link>{" "}
                            *
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="acceptPrivacy"
                            checked={registerData.acceptPrivacy}
                            onCheckedChange={(checked) =>
                              setRegisterData({
                                ...registerData,
                                acceptPrivacy: checked as boolean,
                              })
                            }
                          />
                          <Label htmlFor="acceptPrivacy" className="text-sm">
                            Aceito a{" "}
                            <Link
                              to="/privacy"
                              className="text-[#3DBEAB] hover:underline"
                            >
                              Política de Privacidade
                            </Link>{" "}
                            *
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-6 pt-4 border-t">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                      >
                        Voltar
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={() => handleRegisterStep(currentStep)}
                      className="bg-[#3DBEAB] hover:bg-[#3DBEAB]/90 ml-auto"
                      disabled={isLoading}
                    >
                      {currentStep === 4
                        ? isLoading
                          ? "Finalizando..."
                          : "Finalizar Cadastro"
                        : "Próximo"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Já tem uma conta?{" "}
            <button
              onClick={() => setActiveTab("login")}
              className="text-[#3DBEAB] hover:underline"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
