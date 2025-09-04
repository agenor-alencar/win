import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, User, Lock, AlertTriangle } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

export default function DriverLogin() {
  const [loginData, setLoginData] = useState({
    document: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: notifyError } = useNotification();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      if (loginData.document && loginData.password) {
        success("Login realizado com sucesso!", "Bem-vindo ao WIN Entregas");
        setTimeout(() => {
          window.location.href = "/driver/dashboard";
        }, 1500);
      } else {
        notifyError("Erro no login", "Verifique seus dados e tente novamente");
      }
    }, 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        backgroundColor: "#F8FFFE",
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg, #F8FFFE 0%, #F0F9FF 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div
              className="p-4 rounded-full mr-3"
              style={{
                background: "linear-gradient(135deg, #3DBEAB 0%, #2D9CDB 100%)",
              }}
            >
              <Truck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1
                className="text-4xl font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #3DBEAB 0%, #2D9CDB 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                WIN
              </h1>
              <p style={{ color: "#666666", fontSize: "14px" }}>
                Área do Motorista
              </p>
            </div>
          </div>
          <p style={{ color: "#666666", fontSize: "16px" }}>
            Faça entregas e ganhe dinheiro com o WIN
          </p>
        </div>

        <Card
          className="shadow-xl"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader className="text-center pb-4">
            <CardTitle style={{ fontSize: "24px", color: "#333333" }}>
              Entrar como Motorista
            </CardTitle>
            <p style={{ fontSize: "14px", color: "#666666" }}>
              Acesse sua conta para começar a trabalhar
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label
                  htmlFor="document"
                  style={{ fontSize: "16px", color: "#333333" }}
                >
                  CPF ou CNPJ *
                </Label>
                <div className="relative mt-2">
                  <User
                    className="absolute left-3 top-3 h-5 w-5"
                    style={{ color: "#6B7280" }}
                  />
                  <Input
                    id="document"
                    placeholder="000.000.000-00"
                    value={loginData.document}
                    onChange={(e) =>
                      setLoginData({ ...loginData, document: e.target.value })
                    }
                    className="pl-10 h-12"
                    style={{
                      borderRadius: "12px",
                      fontSize: "16px",
                      borderColor: "#E1F5FE",
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="password"
                  style={{ fontSize: "16px", color: "#333333" }}
                >
                  Senha *
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
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="pl-10 h-12"
                    style={{
                      borderRadius: "12px",
                      fontSize: "16px",
                      borderColor: "#E1F5FE",
                    }}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-white font-medium"
                style={{
                  background:
                    "linear-gradient(135deg, #3DBEAB 0%, #2D9CDB 100%)",
                  borderRadius: "12px",
                  fontSize: "16px",
                  border: "none",
                }}
              >
                {isLoading ? "Entrando..." : "Entrar como Motorista"}
              </Button>

              <div className="text-center space-y-3">
                <Link
                  to="/driver/forgot-password"
                  style={{ color: "#2D9CDB", fontSize: "14px" }}
                  className="hover:underline block"
                >
                  Esqueci minha senha
                </Link>

                <div className="border-t border-gray-200 pt-4">
                  <p style={{ fontSize: "14px", color: "#666666" }}>
                    Ainda não é motorista parceiro?
                  </p>
                  <Link to="/driver/register">
                    <Button
                      variant="outline"
                      className="w-full h-12 mt-2"
                      style={{
                        borderRadius: "12px",
                        fontSize: "16px",
                        borderColor: "#3DBEAB",
                        color: "#3DBEAB",
                      }}
                    >
                      Cadastrar-se como Motorista
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div
          className="mt-6 p-4 rounded-lg"
          style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
        >
          <div className="flex items-start">
            <AlertTriangle
              className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5"
              style={{ color: "#F59E0B" }}
            />
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#92400E",
                  fontWeight: "600",
                }}
              >
                Segurança WIN:
              </p>
              <p style={{ fontSize: "11px", color: "#92400E" }}>
                Todos os motoristas passam por verificação de documentos e
                background check para garantir entregas seguras.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p style={{ color: "#666666", fontSize: "12px" }}>
            Ao entrar, você concorda com nossos{" "}
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
