import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/login" className="flex items-center mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="hidden sm:block">Voltar</span>
              </Link>
              <h1 className="text-xl font-bold">Política de Privacidade</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Shield className="h-6 w-6 mr-3" />
              Política de Privacidade WIN
            </CardTitle>
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2024
            </p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">
                  1. Informações que Coletamos
                </h3>
                <p className="text-muted-foreground mb-3">
                  Coletamos as seguintes informações para fornecer nossos
                  serviços:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Nome completo e CPF/CNPJ</li>
                  <li>Endereço de email e telefone</li>
                  <li>Endereço de entrega</li>
                  <li>
                    Informações de pagamento (não armazenamos dados do cartão)
                  </li>
                  <li>Histórico de pedidos e preferências</li>
                  <li>Localização para otimizar entregas</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  2. Como Usamos suas Informações
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Processar e entregar seus pedidos</li>
                  <li>Comunicar sobre status de pedidos</li>
                  <li>Melhorar nossos serviços e experiência do usuário</li>
                  <li>Personalizar ofertas e recomendações</li>
                  <li>Cumprir obrigações legais e fiscais</li>
                  <li>Prevenir fraudes e garantir segurança</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  3. Compartilhamento de Dados
                </h3>
                <p className="text-muted-foreground mb-3">
                  Seus dados podem ser compartilhados apenas nas seguintes
                  situações:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Com lojistas parceiros para processar seus pedidos</li>
                  <li>Com entregadores para realizar a entrega</li>
                  <li>
                    Com processadores de pagamento (de forma segura e
                    criptografada)
                  </li>
                  <li>Quando exigido por lei ou ordem judicial</li>
                  <li>Para proteger nossos direitos e prevenir fraudes</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  4. Proteção de Dados
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>
                    Utilizamos criptografia SSL para proteger suas informações
                  </li>
                  <li>Servidores seguros com acesso restrito e monitorado</li>
                  <li>Backups regulares e protocolos de segurança rigorosos</li>
                  <li>Treinamento regular da equipe sobre proteção de dados</li>
                  <li>Auditorias de segurança periódicas</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Seus Direitos</h3>
                <p className="text-muted-foreground mb-3">
                  De acordo com a LGPD, você tem os seguintes direitos:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Acessar seus dados pessoais que possuímos</li>
                  <li>
                    Corrigir dados incompletos, inexatos ou desatualizados
                  </li>
                  <li>Solicitar a exclusão de dados desnecessários</li>
                  <li>Revogar consentimento a qualquer momento</li>
                  <li>Portabilidade dos dados para outro fornecedor</li>
                  <li>Informações sobre com quem compartilhamos seus dados</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Cookies</h3>
                <p className="text-muted-foreground">
                  Utilizamos cookies para melhorar sua experiência em nosso
                  site, lembrar suas preferências e analisar o tráfego. Você
                  pode desabilitar cookies nas configurações do seu navegador,
                  mas isso pode afetar a funcionalidade do site.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  7. Retenção de Dados
                </h3>
                <p className="text-muted-foreground">
                  Mantemos seus dados pelo tempo necessário para fornecer nossos
                  serviços e cumprir obrigações legais. Dados de transações são
                  mantidos conforme exigido pela legislação fiscal (geralmente 5
                  anos).
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  8. Menores de Idade
                </h3>
                <p className="text-muted-foreground">
                  Nossos serviços são destinados a maiores de 18 anos. Não
                  coletamos intencionalmente dados de menores de idade sem
                  consentimento dos pais ou responsáveis.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  9. Atualizações desta Política
                </h3>
                <p className="text-muted-foreground">
                  Esta política pode ser atualizada ocasionalmente.
                  Notificaremos sobre mudanças significativas por email ou
                  através do aplicativo.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">10. Contato</h3>
                <p className="text-muted-foreground">
                  Para exercer seus direitos ou esclarecer dúvidas sobre
                  privacidade:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                  <li>Email: privacidade@winmarketplace.com.br</li>
                  <li>Telefone: (11) 3000-0000</li>
                  <li>Encarregado de Dados: dpo@winmarketplace.com.br</li>
                </ul>
              </section>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Ao usar nossos serviços, você
                confirma que leu e compreendeu esta política de privacidade e
                concorda com o tratamento de seus dados conforme descrito.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button asChild size="lg">
            <Link to="/login">Voltar ao Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
