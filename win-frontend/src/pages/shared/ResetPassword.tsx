import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/Api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token não fornecido");
      setIsValidating(false);
      return;
    }

    // Validar token ao carregar a página
    const validarToken = async () => {
      try {
        await api.get(`/api/v1/password-reset/validate/${token}`);
        setTokenValido(true);
      } catch (err: any) {
        console.error("Token inválido:", err);
        setError(
          err.response?.data?.message || 
          "Token inválido ou expirado. Solicite um novo reset de senha."
        );
      } finally {
        setIsValidating(false);
      }
    };

    validarToken();
  }, [token]);

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return {
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber,
      errors: {
        minLength: !hasMinLength,
        upperCase: !hasUpperCase,
        lowerCase: !hasLowerCase,
        number: !hasNumber,
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar senhas
    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    const validation = validatePassword(novaSenha);
    if (!validation.isValid) {
      setError("A senha não atende aos requisitos mínimos");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/api/v1/password-reset/confirm", {
        token,
        novaSenha,
      });
      
      setSuccess(true);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate("/login", { 
          state: { message: "Senha alterada com sucesso! Faça login com sua nova senha." }
        });
      }, 3000);
    } catch (err: any) {
      console.error("Erro ao resetar senha:", err);
      setError(
        err.response?.data?.message || 
        "Erro ao alterar senha. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(novaSenha);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validando token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">Token Inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => navigate("/forgot-password")}
            >
              Solicitar Novo Reset
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Senha alterada com sucesso!</strong>
                  <p className="mt-1 text-sm">
                    Redirecionando para o login...
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="novaSenha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {novaSenha && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1 text-sm">
                <p className="font-medium text-gray-700 mb-2">Requisitos da senha:</p>
                <div className={`flex items-center gap-2 ${passwordValidation.errors.minLength ? 'text-red-600' : 'text-green-600'}`}>
                  {passwordValidation.errors.minLength ? '✗' : '✓'} Mínimo 8 caracteres
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.errors.upperCase ? 'text-red-600' : 'text-green-600'}`}>
                  {passwordValidation.errors.upperCase ? '✗' : '✓'} Uma letra maiúscula
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.errors.lowerCase ? 'text-red-600' : 'text-green-600'}`}>
                  {passwordValidation.errors.lowerCase ? '✗' : '✓'} Uma letra minúscula
                </div>
                <div className={`flex items-center gap-2 ${passwordValidation.errors.number ? 'text-red-600' : 'text-green-600'}`}>
                  {passwordValidation.errors.number ? '✗' : '✓'} Um número
                </div>
                {confirmarSenha && (
                  <div className={`flex items-center gap-2 ${novaSenha !== confirmarSenha ? 'text-red-600' : 'text-green-600'}`}>
                    {novaSenha !== confirmarSenha ? '✗' : '✓'} Senhas coincidem
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading || 
                success || 
                !novaSenha || 
                !confirmarSenha || 
                novaSenha !== confirmarSenha ||
                !passwordValidation.isValid
              }
            >
              {isLoading ? "Alterando senha..." : "Alterar Senha"}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/login")}
              disabled={isLoading || success}
            >
              Voltar para o Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
