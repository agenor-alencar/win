import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  Truck,
  Shield,
  AlertCircle,
} from "lucide-react";

export default function DriverPendingApproval() {
  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{
        backgroundColor: "#F8FFFE",
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(135deg, #F8FFFE 0%, #F0F9FF 100%)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
            }}
          >
            <Clock className="h-10 w-10" style={{ color: "#F59E0B" }} />
          </div>

          <h1 className="text-3xl font-bold mb-4" style={{ color: "#333333" }}>
            Cadastro em Análise
          </h1>

          <p className="text-lg mb-2" style={{ color: "#666666" }}>
            Seu cadastro está sendo analisado pela nossa equipe de segurança
          </p>

          <p className="text-sm" style={{ color: "#666666" }}>
            Entraremos em contato em breve. Você receberá uma notificação assim
            que for aprovado para realizar entregas.
          </p>
        </div>

        {/* Status Card */}
        <Card
          className="mb-8 shadow-lg"
          style={{ borderRadius: "16px", border: "1px solid #FED7AA" }}
        >
          <CardContent className="p-8">
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#FFF7ED" }}
              >
                <FileText className="h-8 w-8" style={{ color: "#F59E0B" }} />
              </div>

              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "#333333" }}
              >
                Análise de Documentos
              </h3>

              <p className="text-sm mb-6" style={{ color: "#666666" }}>
                Nossa equipe está verificando seus documentos e informações para
                garantir a segurança de todos.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle
                    className="h-5 w-5"
                    style={{ color: "#10B981" }}
                  />
                  <span className="text-sm" style={{ color: "#059669" }}>
                    Cadastro recebido
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <Clock className="h-5 w-5" style={{ color: "#F59E0B" }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#D97706" }}
                  >
                    Verificação de documentos em andamento
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-3 opacity-50">
                  <div
                    className="w-5 h-5 rounded-full border-2"
                    style={{ borderColor: "#D1D5DB" }}
                  />
                  <span className="text-sm" style={{ color: "#9CA3AF" }}>
                    Aprovação final
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card
          className="mb-8 shadow-lg"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardContent className="p-6">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "#333333" }}
            >
              O que acontece agora?
            </h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#10B981" }}
                >
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium" style={{ color: "#333333" }}>
                    Verificação de Documentos
                  </p>
                  <p className="text-sm" style={{ color: "#666666" }}>
                    Nossa equipe analisa sua CNH, fotos e dados pessoais
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#F59E0B" }}
                >
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium" style={{ color: "#333333" }}>
                    Background Check
                  </p>
                  <p className="text-sm" style={{ color: "#666666" }}>
                    Verificação de antecedentes para garantir segurança
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#D1D5DB" }}
                >
                  <span className="text-gray-500 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium" style={{ color: "#9CA3AF" }}>
                    Aprovação Final
                  </p>
                  <p className="text-sm" style={{ color: "#9CA3AF" }}>
                    Ativação da conta e liberação para entregas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimated Time */}
        <Card
          className="mb-8 shadow-lg"
          style={{ borderRadius: "16px", border: "1px solid #F0FDF4" }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6" style={{ color: "#10B981" }} />
                <div>
                  <p className="font-medium" style={{ color: "#333333" }}>
                    Tempo estimado
                  </p>
                  <p className="text-sm" style={{ color: "#666666" }}>
                    Análise completa em até 48h úteis
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: "#10B981" }}>
                  48h
                </p>
                <p className="text-xs" style={{ color: "#059669" }}>
                  dias úteis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card
          className="mb-8 shadow-lg"
          style={{ borderRadius: "16px", border: "1px solid #FEF2F2" }}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle
                className="h-6 w-6 flex-shrink-0 mt-1"
                style={{ color: "#EF4444" }}
              />
              <div>
                <h3 className="font-semibold mb-2" style={{ color: "#333333" }}>
                  Precisa de ajuda?
                </h3>
                <p className="text-sm mb-4" style={{ color: "#666666" }}>
                  Se você tiver dúvidas sobre seu cadastro ou precisar enviar
                  documentos adicionais, entre em contato conosco.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" style={{ color: "#6B7280" }} />
                    <span className="text-sm" style={{ color: "#333333" }}>
                      (11) 3000-0000
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" style={{ color: "#6B7280" }} />
                    <span className="text-sm" style={{ color: "#333333" }}>
                      motoristas@winmarketplace.com.br
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center space-y-4">
          <Button
            asChild
            variant="outline"
            className="w-full h-12"
            style={{
              borderRadius: "12px",
              fontSize: "16px",
              borderColor: "#3DBEAB",
              color: "#3DBEAB",
            }}
          >
            <Link to="/driver/login">Voltar ao Login</Link>
          </Button>

          <p className="text-xs" style={{ color: "#666666" }}>
            Você será notificado por e-mail e SMS quando seu cadastro for
            aprovado
          </p>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-8">
          <div
            className="inline-flex items-center px-4 py-2 rounded-full"
            style={{ backgroundColor: "#F0F9FF" }}
          >
            <Truck className="h-4 w-4 mr-2" style={{ color: "#2D9CDB" }} />
            <span className="text-sm font-medium" style={{ color: "#1E40AF" }}>
              WIN - Entregas Seguras e Confiáveis
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
