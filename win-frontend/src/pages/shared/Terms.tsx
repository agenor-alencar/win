import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
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
              <h1 className="text-xl font-bold">Termos de Uso</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <FileText className="h-6 w-6 mr-3" />
              Termos de Uso do WIN Marketplace
            </CardTitle>
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2024
            </p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">
                  1. Aceitação dos Termos
                </h3>
                <p className="text-muted-foreground">
                  Ao acessar e usar o WIN Marketplace, você concorda em cumprir
                  e estar vinculado aos seguintes termos e condições de uso. Se
                  você não concordar com qualquer parte destes termos, não deve
                  usar nossos serviços.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  2. Sobre o Serviço
                </h3>
                <p className="text-muted-foreground">
                  O WIN é um marketplace local que conecta consumidores a lojas
                  físicas da região, oferecendo entrega rápida de produtos
                  diversos como ferragens, material elétrico, limpeza,
                  embalagens e autopeças.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  3. Cadastro e Conta
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Você deve fornecer informações precisas e atualizadas</li>
                  <li>
                    É necessário ter pelo menos 18 anos ou consentimento dos
                    pais
                  </li>
                  <li>
                    Você é responsável por manter a confidencialidade da sua
                    conta
                  </li>
                  <li>
                    Notifique-nos imediatamente sobre qualquer uso não
                    autorizado
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. Pedidos</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>
                    Todos os pedidos estão sujeitos à disponibilidade dos
                    produtos
                  </li>
                  <li>
                    Preços podem variar sem aviso prévio até a confirmação do
                    pedido
                  </li>
                  <li>
                    Você receberá um código de confirmação para cada entrega
                  </li>
                  <li>O pagamento deve ser feito no momento do pedido</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. Entrega</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>
                    Entregamos na região metropolitana com previsão de até 2
                    horas
                  </li>
                  <li>Frete grátis na primeira compra</li>
                  <li>
                    É necessário estar presente no endereço durante o horário
                    estimado
                  </li>
                  <li>O código de entrega deve ser fornecido ao entregador</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. Pagamentos</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Aceitamos PIX e cartões de crédito</li>
                  <li>
                    O pagamento é processado no momento da confirmação do pedido
                  </li>
                  <li>
                    Reembolsos são processados conforme nossa política de
                    devolução
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  7. Política de Devolução
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>
                    Produtos com defeito podem ser devolvidos em até 7 dias
                  </li>
                  <li>
                    Produtos devem estar em sua embalagem original e lacrados
                  </li>
                  <li>
                    Entre em contato conosco para iniciar o processo de
                    devolução
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">
                  8. Responsabilidades
                </h3>
                <p className="text-muted-foreground">
                  O WIN atua como intermediário entre consumidores e lojistas.
                  Não somos responsáveis pela qualidade dos produtos, que é de
                  responsabilidade exclusiva dos lojistas parceiros.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">9. Contato</h3>
                <p className="text-muted-foreground">
                  Para dúvidas sobre estes termos, entre em contato conosco:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                  <li>Email: suporte@winmarketplace.com.br</li>
                  <li>Telefone: (11) 3000-0000</li>
                  <li>WhatsApp: (11) 99000-0000</li>
                </ul>
              </section>
            </div>

            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Estes termos podem ser atualizados periodicamente. Continuando a
                usar nossos serviços após as mudanças, você aceita os novos
                termos.
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
