import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Store,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Truck,
  Shield,
  Headphones,
  TrendingUp,
  Clock,
  MapPin,
  CreditCard,
} from "lucide-react";
import Header from "../../components/Header";

const features = [
  {
    icon: Store,
    title: "Loja Online Completa",
    description:
      "Tenha sua própria loja virtual com design profissional e todas as funcionalidades necessárias.",
  },
  {
    icon: Users,
    title: "Alcance Milhares de Clientes",
    description:
      "Conecte-se com clientes locais que estão procurando exatamente o que você vende.",
  },
  {
    icon: Package,
    title: "Gestão Simplificada",
    description:
      "Gerencie produtos, estoque, pedidos e entregas tudo em um só lugar.",
  },
  {
    icon: DollarSign,
    title: "Pagamentos Seguros",
    description:
      "Receba pagamentos via PIX, cartão e outros métodos com total segurança.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description:
      "Acompanhe suas vendas, faturamento e performance com relatórios completos.",
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    description:
      "Nossa equipe está sempre pronta para ajudar você a vender mais.",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Aumente suas Vendas",
    description:
      "Venda 24/7 online e offline, expandindo seu alcance além da loja física.",
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    icon: Clock,
    title: "Economize Tempo",
    description:
      "Automatize processos e foque no que importa: fazer seu negócio crescer.",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: MapPin,
    title: "Entrega Local",
    description:
      "Atenda clientes da sua região com entrega rápida e econômica.",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    icon: CreditCard,
    title: "Sem Taxa de Adesão",
    description:
      "Comece a vender sem custos iniciais. Pague apenas sobre o que vender.",
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
];

const steps = [
  {
    number: "1",
    title: "Cadastre sua Loja",
    description:
      "Preencha seus dados e informações da empresa em poucos minutos.",
  },
  {
    number: "2",
    title: "Adicione Produtos",
    description: "Cadastre seus produtos com fotos e descrições detalhadas.",
  },
  {
    number: "3",
    title: "Configure Entregas",
    description: "Defina suas áreas de entrega e métodos de envio.",
  },
  {
    number: "4",
    title: "Comece a Vender",
    description: "Sua loja estará online e pronta para receber pedidos!",
  },
];

const testimonials = [
  {
    name: "João Silva",
    store: "Ferragens Silva",
    content:
      "Desde que entrei no WIN, minhas vendas aumentaram 300%. A plataforma é muito fácil de usar.",
    rating: 5,
  },
  {
    name: "Maria Santos",
    store: "Casa & Cia",
    content:
      "O suporte é excelente e consigo gerenciar tudo pelo celular. Recomendo para todos os lojistas.",
    rating: 5,
  },
  {
    name: "Carlos Oliveira",
    store: "TechStore Pro",
    content:
      "Plataforma completa com tudo que preciso. Os relatórios me ajudam muito na gestão.",
    rating: 5,
  },
];

export default function BecomeASeller() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Venda no WIN e Faça Seu Negócio Crescer
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100">
              Junte-se a milhares de lojistas que já vendem online com a gente.
              É fácil, rápido e sem complicação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/merchant/auth">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-4"
                >
                  Cadastrar Minha Loja
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => {
                  document.getElementById("como-funciona")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Ver Como Funciona
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Por que Vender no WIN?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos tudo que você precisa para vender online com sucesso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={index}
                  className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 ${benefit.bg} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <Icon className={`h-8 w-8 ${benefit.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Funcionalidades Completas
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para gerenciar seu negócio online
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#3DBEAB] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600">
              Em 4 passos simples você estará vendendo online
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              O que Nossos Lojistas Dizem
            </h2>
            <p className="text-xl text-gray-600">Histórias reais de sucesso</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.store}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre como vender no WIN
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Quanto custa para vender no WIN?
                </h3>
                <p className="text-gray-600">
                  O cadastro é totalmente gratuito. Você só paga uma pequena
                  taxa sobre as vendas realizadas, sem custos fixos mensais.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Como recebo os pagamentos?
                </h3>
                <p className="text-gray-600">
                  Os pagamentos são transferidos automaticamente para sua conta
                  bancária ou PIX em até 2 dias úteis após a confirmação da
                  venda.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Preciso ter CNPJ para vender?
                </h3>
                <p className="text-gray-600">
                  Sim, é necessário ter CNPJ ativo para vender na plataforma.
                  Isso garante segurança tanto para você quanto para os
                  clientes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Como funcionam as entregas?
                </h3>
                <p className="text-gray-600">
                  Você pode usar nossos entregadores parceiros ou fazer entregas
                  por conta própria. Definimos juntos a melhor estratégia para
                  sua região.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Quanto tempo leva para aprovar minha loja?
                </h3>
                <p className="text-gray-600">
                  A análise do cadastro leva até 24 horas úteis. Após aprovação,
                  você já pode começar a cadastrar produtos e vender.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Cadastre sua loja agora e comece a vender online hoje mesmo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/merchant/auth">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-4"
              >
                Cadastrar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Falar com Consultor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
