import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Package,
  CreditCard,
  Truck,
  Shield,
  Clock,
  Star,
  Users,
  FileText,
} from "lucide-react";
import Header from "../../components/Header";

const faqData = [
  {
    category: "Pedidos",
    icon: Package,
    questions: [
      {
        question: "Como acompanhar meu pedido?",
        answer:
          "Você pode acompanhar seu pedido na seção 'Meus Pedidos' no seu perfil ou usar o código de rastreamento enviado por e-mail. O código também fica disponível na página de detalhes do pedido.",
      },
      {
        question: "Posso cancelar meu pedido?",
        answer:
          "Sim! Você pode cancelar seu pedido gratuitamente até que ele seja confirmado pela loja. Após a confirmação, entre em contato conosco pelo chat ou telefone.",
      },
      {
        question: "Qual o prazo de entrega?",
        answer:
          "Na região metropolitana, entregamos em até 2 horas. O tempo pode variar dependendo da disponibilidade dos produtos e localização da loja.",
      },
      {
        question: "Como funciona o código de entrega?",
        answer:
          "Cada pedido gera um código único que você deve informar ao entregador. Esse código garante que apenas você receba o pedido.",
      },
    ],
  },
  {
    category: "Pagamento",
    icon: CreditCard,
    questions: [
      {
        question: "Quais formas de pagamento aceitas?",
        answer:
          "Aceitamos PIX (com aprovação instantânea) e cartões de crédito (Visa, Mastercard, Elo). O PIX é processado imediatamente.",
      },
      {
        question: "É seguro pagar pelo app?",
        answer:
          "Sim! Utilizamos criptografia SSL e não armazenamos dados do seu cartão. Trabalhamos com processadores certificados PCI DSS.",
      },
      {
        question: "Posso parcelar minha compra?",
        answer:
          "Sim! Cartões de crédito podem ser parcelados em até 12x sem juros, dependendo do valor da compra.",
      },
      {
        question: "Como funciona o reembolso?",
        answer:
          "Reembolsos são processados em até 5 dias úteis. PIX é devolvido na conta originária, cartão na próxima fatura.",
      },
    ],
  },
  {
    category: "Entrega",
    icon: Truck,
    questions: [
      {
        question: "Qual a área de entrega?",
        answer:
          "Atendemos toda a região metropolitana. Você pode verificar se sua região tem cobertura inserindo seu CEP na tela inicial.",
      },
      {
        question: "Frete grátis na primeira compra?",
        answer:
          "Sim! Todos os novos clientes têm frete grátis na primeira compra, independente do valor.",
      },
      {
        question: "Posso escolher o horário de entrega?",
        answer:
          "Atualmente trabalhamos com entrega expressa em até 2 horas. Em breve teremos agendamento de horário.",
      },
      {
        question: "E se eu não estiver em casa?",
        answer:
          "O entregador tentará contato por telefone. Se não conseguir, o pedido retorna e reagendamos a entrega sem custo.",
      },
    ],
  },
  {
    category: "Conta e Segurança",
    icon: Shield,
    questions: [
      {
        question: "Como criar uma conta?",
        answer:
          "Clique em 'Entrar' e depois 'Criar Conta'. Você precisa apenas de e-mail, senha e CPF/CNPJ.",
      },
      {
        question: "Esqueci minha senha",
        answer:
          "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções enviadas para seu e-mail.",
      },
      {
        question: "Como alterar meus dados?",
        answer:
          "Acesse seu perfil e clique em 'Editar'. Você pode alterar nome, endereço, telefone e preferências.",
      },
      {
        question: "Meus dados estão seguros?",
        answer:
          "Sim! Seguimos a LGPD e utilizamos criptografia avançada. Seus dados nunca são compartilhados sem autorização.",
      },
    ],
  },
];

const supportOptions = [
  {
    title: "Chat Online",
    description: "Suporte instantâneo por chat",
    icon: MessageSquare,
    availability: "24h",
    action: "Iniciar Chat",
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Telefone",
    description: "(11) 3000-0000",
    icon: Phone,
    availability: "Seg-Sex 8h-18h",
    action: "Ligar Agora",
    color: "bg-green-50 text-green-700",
  },
  {
    title: "E-mail",
    description: "suporte@winmarketplace.com.br",
    icon: Mail,
    availability: "Resposta em até 4h",
    action: "Enviar E-mail",
    color: "bg-purple-50 text-purple-700",
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaq, setFilteredFaq] = useState(faqData);
  const { success, error, warning, info } = useNotification();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredFaq(faqData);
      return;
    }

    const filtered = faqData
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(query.toLowerCase()) ||
            q.answer.toLowerCase().includes(query.toLowerCase()),
        ),
      }))
      .filter((category) => category.questions.length > 0);

    setFilteredFaq(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showCategories={false} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <HelpCircle className="h-10 w-10 mr-3 text-primary" />
            Central de Ajuda
          </h1>
          <p className="text-xl text-muted-foreground">
            Como podemos ajudar você hoje?
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por ajuda, como 'acompanhar pedido', 'pagamento'..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-14 text-lg"
            />
          </div>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${option.color}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-muted-foreground mb-1">
                    {option.description}
                  </p>
                  <Badge variant="secondary" className="mb-4">
                    {option.availability}
                  </Badge>
                  <br />
                  <Button className="w-full">{option.action}</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Notification Demo */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-6 w-6 mr-3" />
              Teste o Sistema de Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Experimente os diferentes tipos de notificações do sistema:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  success("Sucesso!", "Operação realizada com sucesso")
                }
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                Sucesso
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  error("Erro!", "Algo deu errado, tente novamente")
                }
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Erro
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  warning("Atenção!", "Verifique suas informações")
                }
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                Aviso
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  info("Informação", "Nova funcionalidade disponível")
                }
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Sections */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Perguntas Frequentes
          </h2>

          {filteredFaq.length > 0 ? (
            filteredFaq.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon className="h-6 w-6 mr-3" />
                      {category.category}
                      <Badge variant="secondary" className="ml-2">
                        {category.questions.length} perguntas
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem
                          key={faqIndex}
                          value={`item-${categoryIndex}-${faqIndex}`}
                        >
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-muted-foreground mb-6">
                  Não encontramos perguntas relacionadas à "{searchQuery}"
                </p>
                <Button onClick={() => handleSearch("")} variant="outline">
                  Ver todas as perguntas
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional Resources */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Recursos Adicionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Termos de Uso</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Leia nossos termos e condições
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/terms">Ver Termos</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Privacidade</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Como protegemos seus dados
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/privacy">Ver Política</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Para Lojistas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Saiba como vender no WIN
                </p>
                <Button variant="outline" size="sm">
                  Saiba Mais
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Avalie-nos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Conte sua experiência
                </p>
                <Button variant="outline" size="sm">
                  Avaliar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="mt-16 bg-muted/30 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">
            Ainda precisa de ajuda?
          </h3>
          <p className="text-muted-foreground mb-6">
            Nossa equipe está sempre pronta para ajudar você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              <MessageSquare className="h-4 w-4 mr-2" />
              Falar no Chat
            </Button>
            <Button variant="outline" size="lg">
              <Phone className="h-4 w-4 mr-2" />
              (11) 3000-0000
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
