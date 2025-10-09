import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("merchant"); // Função padrão
  const [error, setError] = useState("");

  const { login, register, isLoading, isAuthenticated, auth } = useAuth();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate(); // Inicialize useNavigate

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const loginSuccess = await login(email, password, role); // Passe a função como argumento
      if (loginSuccess) {
        success("Login realizado com sucesso!", "Bem-vindo de volta!");
        // Redirecionar com base na função do usuário
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "merchant") {
          navigate("/merchant");
        }
      } else {
        const errorMsg = "Email ou senha incorretos";
        setError(errorMsg);
        notifyError("Erro no login", errorMsg);
      }
    } catch (err) {
      const errorMsg = "Erro ao fazer login. Tente novamente.";
      setError(errorMsg);
      notifyError("Erro no login", errorMsg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      const errorMsg = "Nome é obrigatório";
      setError(errorMsg);
      notifyError("Campo obrigatório", errorMsg);
      return;
    }

    try {
      const registerSuccess = await register({
        nome: name,
        email,
        senha: password,
      });
      if (registerSuccess) {
        success("Conta criada com sucesso!", "Bem-vindo ao WIN Marketplace!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch (err) {
      const errorMsg = "Erro ao criar conta. Tente novamente.";
      setError(errorMsg);
      notifyError("Erro no cadastro", errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">WIN</h1>
          <p className="text-muted-foreground">Marketplace Local</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bem-vindo</CardTitle>
            <CardDescription>
              Entre na sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="merchant">Merchant</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome Completo</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="register-document">CPF/CNPJ</Label>
                    <Input
                      id="register-document"
                      type="text"
                      placeholder="000.000.000-00"
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div> */}

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Escolha uma senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Ao continuar, você concorda com nossos{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
