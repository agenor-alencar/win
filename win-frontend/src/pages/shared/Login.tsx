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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Eye, EyeOff, X } from "lucide-react";

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
  confirmarSenha: z.string(),
  telefone: z.string()
    .optional()
    .refine((val) => !val || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(val), {
      message: "Telefone deve estar no formato (00) 00000-0000",
    }),
  dataNascimento: z.string().optional(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

// Componente interno para o formulário de REGISTRO
function RegisterFormComponent() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      nome: "",
      sobrenome: "",
      email: "",
      cpf: "",
      senha: "",
      confirmarSenha: "",
      telefone: "",
      dataNascimento: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    // Remove o campo confirmarSenha antes de enviar
    const { confirmarSenha, ...registerData } = values;
    
    // Envia os dados como estão (com formatação visual)
    // O AuthContext vai remover a formatação antes de enviar ao backend
    const success = await register(registerData as RegisterData);
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
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="********" 
                    {...field} 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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
          name="confirmarSenha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********" 
                    {...field} 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
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
  const REMEMBER_EMAIL_KEY = "win-user-remember-email";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [hasSavedEmail, setHasSavedEmail] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  // role select removed; role will be inferred from authenticated user profile
  const [error, setError] = useState("");

  const { login, isLoading, isAuthenticated } = useAuth();
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (!savedEmail) {
      return;
    }

    setEmail(savedEmail);
    setRememberEmail(true);
    setHasSavedEmail(true);
  }, []);

  const clearRememberedEmail = () => {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
    setEmail("");
    setRememberEmail(false);
    setHasSavedEmail(false);
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const loginResult = await login(normalizedEmail, password);
      if (loginResult.success) {
        if (rememberEmail) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, normalizedEmail);
          setHasSavedEmail(true);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
          setHasSavedEmail(false);
        }

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
        const errorMsg = loginResult.error || "Email ou senha incorretos";
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
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                        disabled={isLoading}
                        className="pr-10"
                      />
                      {hasSavedEmail && (
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                          onClick={clearRememberedEmail}
                          aria-label="Limpar email salvo"
                          title="Limpar email salvo"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Removido o seletor de 'role' para o login de cliente */}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-email"
                      checked={rememberEmail}
                      onCheckedChange={(checked) => setRememberEmail(checked === true)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember-email" className="text-sm">
                      Lembrar email
                    </Label>
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