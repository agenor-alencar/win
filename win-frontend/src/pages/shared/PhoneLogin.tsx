import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { maskPhone } from "@/lib/formatters";

// Schema para entrada de telefone
const phoneFormSchema = z.object({
  telefone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
      message: "Telefone deve estar no formato (00) 00000-0000",
    })
    .transform((val) => {
      // Converter de (11) 98765-4321 para +5511987654321
      const digits = val.replace(/\D/g, "");
      return `+55${digits}`;
    }),
});

// Schema para entrada de OTP
const otpFormSchema = z.object({
  codigo: z
    .string()
    .length(6, { message: "Código deve ter exatamente 6 dígitos" })
    .regex(/^\d{6}$/, { message: "Código deve conter apenas números" }),
});

type PhoneFormValues = z.infer<typeof phoneFormSchema>;
type OtpFormValues = z.infer<typeof otpFormSchema>;

export function PhoneLogin() {
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [telefoneArmazenado, setTelefoneArmazenado] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const { requestOtpCode, verifyOtpCode, isLoading } = useAuth();
  const { error: notifyError, success: notifySuccess } = useNotification();
  const navigate = useNavigate();

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { telefone: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { codigo: "" },
  });

  // Timer para reenvio de código
  useEffect(() => {
    if (stage === "otp" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, stage]);

  // Formatar tempo em MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const onPhoneSubmit = async (values: PhoneFormValues) => {
    const result = await requestOtpCode(values.telefone);
    if (result.success) {
      setTelefoneArmazenado(values.telefone);
      setStage("otp");
      setTimeLeft(300);
      setCanResend(false);
      setAttempts(0);
      notifySuccess(
        "Código enviado!",
        `Um código foi enviado para ${values.telefone}`
      );
    } else {
      notifyError("Erro", result.error || "Não foi possível enviar o código");
    }
  };

  const onOtpSubmit = async (values: OtpFormValues) => {
    if (attempts >= 3) {
      notifyError(
        "Limite atingido",
        "Máximo de tentativas excedido. Solicite um novo código."
      );
      setStage("phone");
      otpForm.reset();
      setAttempts(0);
      return;
    }

    const result = await verifyOtpCode(telefoneArmazenado, values.codigo);
    if (result.success) {
      notifySuccess("Sucesso!", "Login realizado com sucesso!");
      // Redirect baseado no perfil do usuário
      const stored = localStorage.getItem("win-user");
      let usr: any = null;
      try {
        usr = stored ? JSON.parse(stored) : null;
      } catch (e) {
        usr = null;
      }
      const userRole = usr?.role;

      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        notifyError(
          "Limite atingido",
          "Máximo de 3 tentativas. Solicite um novo código."
        );
      } else {
        notifyError(
          "Código inválido",
          `Tentativa ${newAttempts} de 3. ${result.error || "Verifique o código e tente novamente."}`
        );
      }
    }
  };

  const handleResendCode = async () => {
    const result = await requestOtpCode(telefoneArmazenado);
    if (result.success) {
      setTimeLeft(300);
      setCanResend(false);
      setAttempts(0);
      otpForm.reset();
      notifySuccess("Código reenviado!", "Um novo código foi enviado para seu telefone");
    } else {
      notifyError("Erro", result.error || "Não foi possível reenviar o código");
    }
  };

  if (stage === "phone") {
    return (
      <Form {...phoneForm}>
        <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
          <FormField
            control={phoneForm.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>📱 Número de Telefone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(00) 00000-0000"
                    {...field}
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value);
                      field.onChange(masked);
                    }}
                    maxLength={15}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">
                  Formato: (XX) XXXXX-XXXX
                </p>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Enviando..." : "📤 Enviar Código"}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">✅ Código enviado para:</p>
        <p className="font-semibold text-base">{telefoneArmazenado}</p>
      </div>

      <Form {...otpForm}>
        <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
          <FormField
            control={otpForm.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Verificação</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  >
                    <InputOTPGroup className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-12 h-12 text-xl"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-center text-sm">
            {!canResend ? (
              <p className="text-muted-foreground">
                ⏱️ Expira em: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <Button
                type="button"
                variant="link"
                onClick={handleResendCode}
                disabled={isLoading}
                className="p-0"
              >
                🔄 Reenviar Código
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Tentativa {attempts + 1} de 3
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || attempts >= 3}>
            {isLoading ? "Validando..." : "✓ Validar Código"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setStage("phone");
              phoneForm.reset();
              otpForm.reset();
              setAttempts(0);
            }}
            disabled={isLoading}
          >
            ← Voltar
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default PhoneLogin;
