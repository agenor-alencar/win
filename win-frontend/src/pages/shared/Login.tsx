import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Garante que o Label está importado
import { useAuth, RegisterData } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext"; // Importado apenas uma vez
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { maskCPF, maskPhone, validatePassword } from "@/lib/formatters";

// Schema de validação para o formulário de REGISTRO
const registerFormSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres." }),
  sobrenome: z.string().min(2, { message: "Sobrenome deve ter no mínimo 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "CPF deve estar no formato 000.000.000-00" }),
  senha: z.string()
    .min(8, { message: "Senha deve ter no mínimo 8 caracteres." })
    .refine((val) => validatePassword(val), {
      message: "Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número.",
    }),
  telefone: z.string()
    .optional()
    .refine((val) => !val || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(val), {
      message: "Telefone deve estar no formato (00) 00000-0000",
    }),
  dataNascimento: z.string().optional(),
});

// Componente interno para o formulário de REGISTRO
function RegisterFormComponent() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      nome: "",
      sobrenome: "",
      email: "",
      cpf: "",
      senha: "",
      telefone: "",
      dataNascimento: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    // Envia os dados como estão (com formatação visual)
    // O AuthContext vai remover a formatação antes de enviar ao backend
    const success = await register(values as RegisterData);
    if (success) {
      toast({
        title: "Sucesso!",
        description: "Sua conta foi criada e você foi logado.",
      });
      navigate("/");
    } else {
      toast({
        title: "Erro no Registro",
        description: "Não foi possível criar sua conta. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sobrenome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sobrenome</FormLabel>
              <FormControl>
                <Input placeholder="Seu sobrenome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seuemail@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input 
                  placeholder="000.000.000-00" 
                  {...field}
                  onChange={(e) => {
                    const masked = maskCPF(e.target.value);
                    field.onChange(masked);
                  }}
                  maxLength={14}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="********" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 8 caracteres com pelo menos 1 minúscula, 1 MAIÚSCULA e 1 número
              </p>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(00) 90000-0000" 
                  {...field}
                  onChange={(e) => {
                    const masked = maskPhone(e.target.value);
                    field.onChange(masked);
                  }}
                  maxLength={15}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dataNascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento (Opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Criar Conta
        </Button>
      </form>
    </Form>
  );
}

// Componente principal da página de Login, exportado como default
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // role select removed; role will be inferred from authenticated user profile
  const [error, setError] = useState("");

  const { login, isLoading, isAuthenticated } = useAuth();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const loginSuccess = await login(email, password);
      if (loginSuccess) {
        success("Login realizado com sucesso!", "Bem-vindo de volta!");
        // Após login, redirecionar baseado no perfil
        const stored = localStorage.getItem("win-user");
        let usr: any = null;
        try { usr = stored ? JSON.parse(stored) : null; } catch (e) { usr = null; }
        const userRole = usr?.role;
        
        // ADMIN sempre vai para /admin
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          // USER e LOJISTA vão para homepage
          // Usuário pode navegar manualmente para área de lojista clicando em "Venda no WIN"
          navigate("/");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
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
                  
                  {/* Removido o seletor de 'role' para o login de cliente */}

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
                 <RegisterFormComponent />
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