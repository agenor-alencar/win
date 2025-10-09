import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Mail, Lock, Phone, MapPin, FileText } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

export default function MerchantLogin() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    cnpj: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { success, error: notifyError } = useNotification();

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      success("Loja cadastrada com sucesso!", "Sua conta foi criada");
      setTimeout(() => {
        window.location.href = "/merchant/dashboard";
      }, 1500);
    }, 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#FFFFFF", fontFamily: "Inter, sans-serif" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Store className="h-12 w-12 mr-3" style={{ color: "#3DBEAB" }} />
            <div>
              <h1 className="text-4xl font-bold" style={{ color: "#3DBEAB" }}>
                WIN
              </h1>
              <p className="text-sm" style={{ color: "#333333" }}>
                Área da Empresa
              </p>
            </div>
          </div>
          <p style={{ color: "#666666", fontSize: "16px" }}>
            Gerencie sua loja no marketplace local
          </p>
        </div>

        <Card
          className="shadow-xl"
          style={{ borderRadius: "12px", border: "1px solid #E5E7EB" }}
        >
          <CardHeader className="text-center pb-4">
            <CardTitle style={{ fontSize: "24px", color: "#333333" }}>
              Acesso à Loja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList
                className="grid w-full grid-cols-2 mb-6"
                style={{ backgroundColor: "#F8F9FA", borderRadius: "12px" }}
              >
                <TabsTrigger
                  value="login"
                  style={{ borderRadius: "12px", fontSize: "16px" }}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  style={{ borderRadius: "12px", fontSize: "16px" }}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Cadastrar Loja
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="email"
                        style={{ fontSize: "16px", color: "#333333" }}
                      >
                        E-mail
                      </Label>
                      <div className="relative mt-2">
                        <Mail
                          className="absolute left-3 top-3 h-5 w-5"
                          style={{ color: "#6B7280" }}
                        />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              email: e.target.value,
                            })
                          }
                          className="pl-10 h-12"
                          style={{ borderRadius: "12px", fontSize: "16px" }}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="password"
                        style={{ fontSize: "16px", color: "#333333" }}
                      >
                        Senha
                      </Label>
                      <div className="relative mt-2">
                        <Lock
                          className="absolute left-3 top-3 h-5 w-5"
                          style={{ color: "#6B7280" }}
                        />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Sua senha"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          className="pl-10 h-12"
                          style={{ borderRadius: "12px", fontSize: "16px" }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-white font-medium"
                    style={{
                      backgroundColor: "#3DBEAB",
                      borderRadius: "12px",
                      fontSize: "16px",
                    }}
                  >
                    {isLoading ? "Entrando..." : "Entrar na Loja"}
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/merchant/forgot-password"
                      style={{ color: "#2D9CDB", fontSize: "16px" }}
                      className="hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label style={{ fontSize: "16px", color: "#333333" }}>
                        Nome da Loja *
                      </Label>
                      <div className="relative mt-2">
                        <Store
                          className="absolute left-3 top-3 h-5 w-5"
                          style={{ color: "#6B7280" }}
                        />
                        <Input
                          placeholder="Nome Fantasia"
                          value={registerData.storeName}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              storeName: e.target.value,
                            })
                          }
                          className="pl-10 h-12"
                          style={{ borderRadius: "12px", fontSize: "16px" }}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label style={{ fontSize: "16px", color: "#333333" }}>
                        Nome do Responsável *
                      </Label>
                      <Input
                        placeholder="Seu nome completo"
                        value={registerData.ownerName}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            ownerName: e.target.value,
                          })
                        }
                        className="h-12 mt-2"
                        style={{ borderRadius: "12px", fontSize: "16px" }}
                        required
                      />
                    </div>

                    <div>
                      <Label style={{ fontSize: "16px", color: "#333333" }}>
                        E-mail *
                      </Label>
                      <div className="relative mt-2">
                        <Mail
                          className="absolute left-3 top-3 h-5 w-5"
                          style={{ color: "#6B7280" }}
                        />
                        <Input
                          type="email"
                          placeholder="contato@loja.com"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              email: e.target.value,
                            })
                          }
                          className="pl-10 h-12"
                          style={{ borderRadius: "12px", fontSize: "16px" }}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label style={{ fontSize: "16px", color: "#333333" }}>
                        Telefone *
                      </Label>
                      <div className="relative mt-2">
                        <Phone
                          className="absolute left-3 top-3 h-5 w-5"
                          style={{ color: "#6B7280" }}
                        />
                        <Input
                          placeholder="(11) 99999-9999"
                          value={registerData.phone}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              phone: e.target.value,
                            })
                          }
                          className="pl-10 h-12"
                          style={{ borderRadius: "12px", fontSize: "16px" }}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label style={{ fontSize: "16px", color: "#333333" }}>
                        CNPJ *
                      </Label>
                      <div className="relative mt-2">
                        <FileText
                          className="absolute left-3 top-3 h-5 w-5"
                          style={{ color: "#6B7280" }}
                        />
                        <Input
                          placeholder="00.000.000/0001-00"
                          value={registerData.cnpj}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              cnpj: e.target.value,
                            })
                          }
                          className="pl-10 h-12"
                          style={{ borderRadius: "12px", fontSize: "16px" }}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label style={{ fontSize: "16px", color: "#333333" }}>
                        Senha *
                      </Label>
                      <div className="relative mt-2">
                        <Lock
                          className="absolute left-3 top-3 h-5 w-5"
                          style={{ color: "#6B7280" }}
                        />
                        <Input
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                          className="pl-10 h-12"
                          style={{ borderRadius: "12px", fontSize: "16px" }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-white font-medium mt-6"
                    style={{
                      backgroundColor: "#2D9CDB",
                      borderRadius: "12px",
                      fontSize: "16px",
                    }}
                  >
                    {isLoading ? "Criando conta..." : "Cadastrar Minha Loja"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p style={{ color: "#666666", fontSize: "12px" }}>
            Ao criar uma conta, você concorda com nossos{" "}
            <Link
              to="/terms"
              style={{ color: "#2D9CDB" }}
              className="hover:underline"
            >
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link
              to="/privacy"
              style={{ color: "#2D9CDB" }}
              className="hover:underline"
            >
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
