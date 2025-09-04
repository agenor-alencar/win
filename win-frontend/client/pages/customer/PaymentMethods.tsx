import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Check,
  Shield,
  Smartphone,
  Star,
} from "lucide-react";
import Header from "../../components/Header";

interface PaymentMethod {
  id: string;
  type: "credit" | "pix";
  isDefault: boolean;
  // Credit card fields
  cardNumber?: string;
  cardName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  brand?: string;
  // PIX fields
  pixKey?: string;
  pixType?: "cpf" | "email" | "phone" | "random";
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "credit",
    cardNumber: "**** **** **** 1234",
    cardName: "JOÃO SILVA",
    expiryMonth: "12",
    expiryYear: "2027",
    brand: "visa",
    isDefault: true,
  },
  {
    id: "2",
    type: "credit",
    cardNumber: "**** **** **** 5678",
    cardName: "JOÃO SILVA",
    expiryMonth: "06",
    expiryYear: "2026",
    brand: "mastercard",
    isDefault: false,
  },
  {
    id: "3",
    type: "pix",
    pixKey: "joao.silva@email.com",
    pixType: "email",
    isDefault: false,
  },
];

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(mockPaymentMethods);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    type: "credit",
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      type: "credit",
      isDefault: false,
    });
    setEditingMethod(null);
  };

  const handleOpenDialog = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      setFormData(method);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSave = () => {
    if (editingMethod) {
      // Update existing method
      setPaymentMethods(
        paymentMethods.map((method) =>
          method.id === editingMethod.id
            ? { ...(formData as PaymentMethod) }
            : method,
        ),
      );
    } else {
      // Add new method
      const newMethod: PaymentMethod = {
        ...(formData as PaymentMethod),
        id: Date.now().toString(),
      };
      setPaymentMethods([...paymentMethods, newMethod]);
    }

    // If this is set as default, remove default from others
    if (formData.isDefault) {
      setPaymentMethods((prev) =>
        prev.map((method) => ({
          ...method,
          isDefault: method.id === formData.id,
        })),
      );
    }

    handleCloseDialog();
  };

  const handleDelete = (methodId: string) => {
    setPaymentMethods(
      paymentMethods.filter((method) => method.id !== methodId),
    );
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      })),
    );
  };

  const getBrandIcon = (brand?: string) => {
    switch (brand) {
      case "visa":
        return "💳";
      case "mastercard":
        return "💳";
      case "elo":
        return "💳";
      default:
        return "💳";
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showCategories={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <CreditCard className="h-8 w-8 mr-3" />
              Formas de Pagamento
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus cartões e métodos de pagamento
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Método
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingMethod ? "Editar Método" : "Novo Método de Pagamento"}
                </DialogTitle>
                <DialogDescription>
                  {editingMethod
                    ? "Atualize as informações do método"
                    : "Adicione um novo método de pagamento"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Tipo de Pagamento</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === "credit" && (
                  <>
                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardNumber: formatCardNumber(e.target.value),
                          })
                        }
                        maxLength={19}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        placeholder="JOÃO SILVA"
                        value={formData.cardName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cardName: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="expiryMonth">Mês</Label>
                        <Select
                          value={formData.expiryMonth}
                          onValueChange={(value) =>
                            setFormData({ ...formData, expiryMonth: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem
                                key={i + 1}
                                value={(i + 1).toString().padStart(2, "0")}
                              >
                                {(i + 1).toString().padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="expiryYear">Ano</Label>
                        <Select
                          value={formData.expiryYear}
                          onValueChange={(value) =>
                            setFormData({ ...formData, expiryYear: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="AAAA" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => (
                              <SelectItem
                                key={i}
                                value={(
                                  new Date().getFullYear() + i
                                ).toString()}
                              >
                                {new Date().getFullYear() + i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {formData.type === "pix" && (
                  <>
                    <div>
                      <Label>Tipo de Chave PIX</Label>
                      <Select
                        value={formData.pixType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, pixType: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="random">
                            Chave Aleatória
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="pixKey">Chave PIX</Label>
                      <Input
                        id="pixKey"
                        placeholder={
                          formData.pixType === "email"
                            ? "seu@email.com"
                            : formData.pixType === "phone"
                              ? "(11) 99999-9999"
                              : formData.pixType === "cpf"
                                ? "000.000.000-00"
                                : "Chave aleatória"
                        }
                        value={formData.pixKey || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, pixKey: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="isDefault">Definir como método padrão</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingMethod ? "Atualizar" : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {method.type === "credit" ? (
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        {getBrandIcon(method.brand)}
                      </div>
                    ) : (
                      <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        PIX
                      </div>
                    )}

                    <div>
                      {method.type === "credit" ? (
                        <>
                          <h3 className="font-semibold">{method.cardNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            {method.cardName} • Exp: {method.expiryMonth}/
                            {method.expiryYear}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold">PIX</h3>
                          <p className="text-sm text-muted-foreground">
                            {method.pixKey}
                          </p>
                        </>
                      )}
                    </div>

                    {method.isDefault && (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Padrão
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Tornar Padrão
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(method)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleDelete(method.id)}
                      disabled={method.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {paymentMethods.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum método cadastrado
                </h3>
                <p className="text-muted-foreground mb-6">
                  Adicione cartões ou PIX para facilitar suas compras
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Método
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Security Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Segurança Garantida
                  </h3>
                  <p className="text-blue-800 text-sm">
                    Utilizamos criptografia SSL e não armazenamos dados do seu
                    cartão. Todas as transações são processadas de forma segura.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Smartphone className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">
                    PIX Instantâneo
                  </h3>
                  <p className="text-green-800 text-sm">
                    Pagamentos via PIX são processados instantaneamente, sem
                    taxas e com total segurança.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
