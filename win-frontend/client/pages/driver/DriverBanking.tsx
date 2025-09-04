import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Banknote,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  DollarSign,
  Clock,
  User,
  Truck,
  Navigation,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";

export default function DriverBanking() {
  const { success } = useNotification();

  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 1,
      bankName: "Nubank",
      agency: "0001",
      account: "12345678-9",
      accountType: "corrente",
      holderName: "Carlos Silva",
      holderDocument: "123.456.789-00",
      isPrimary: true,
    },
  ]);

  const [newAccount, setNewAccount] = useState({
    bankName: "",
    agency: "",
    account: "",
    accountType: "corrente",
    holderName: "",
    holderDocument: "",
    isPrimary: false,
  });

  const [showNewAccountForm, setShowNewAccountForm] = useState(false);

  const addAccount = () => {
    const id = bankAccounts.length + 1;
    setBankAccounts([...bankAccounts, { ...newAccount, id }]);
    setShowNewAccountForm(false);
    setNewAccount({
      bankName: "",
      agency: "",
      account: "",
      accountType: "corrente",
      holderName: "",
      holderDocument: "",
      isPrimary: false,
    });
    success(
      "Conta bancária adicionada!",
      "Agora você pode receber seus pagamentos",
    );
  };

  const removeAccount = (id: number) => {
    setBankAccounts(bankAccounts.filter((account) => account.id !== id));
    success("Conta bancária removida!", "");
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F8FFFE", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <header
        className="bg-white shadow-sm p-4"
        style={{ borderBottom: "1px solid #E1F5FE" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/driver/profile">
              <Button
                variant="ghost"
                size="icon"
                style={{ borderRadius: "12px", color: "#666666" }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Banknote className="h-8 w-8 mr-3" style={{ color: "#3DBEAB" }} />
            <div>
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#333333",
                }}
              >
                Contas Bancárias
              </h1>
              <p style={{ fontSize: "12px", color: "#666666" }}>
                Gerencie suas contas para recebimento
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowNewAccountForm(true)}
            style={{
              background: "linear-gradient(135deg, #3DBEAB 0%, #2D9CDB 100%)",
              borderRadius: "12px",
              color: "white",
              border: "none",
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card style={{ borderRadius: "16px", border: "1px solid #E3F2FD" }}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#E8F5E8" }}
                >
                  <DollarSign
                    className="h-6 w-6"
                    style={{ color: "#10B981" }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Saldo Disponível
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#10B981",
                    }}
                  >
                    R$ 450,30
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "16px", border: "1px solid #FEF3C7" }}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#FEF3C7" }}
                >
                  <Clock className="h-6 w-6" style={{ color: "#F59E0B" }} />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>
                    Aguardando
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#F59E0B",
                    }}
                  >
                    R$ 180,50
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderRadius: "16px", border: "1px solid #DBEAFE" }}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#DBEAFE" }}
                >
                  <CheckCircle
                    className="h-6 w-6"
                    style={{ color: "#3B82F6" }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#666666" }}>Este Mês</p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#3B82F6",
                    }}
                  >
                    R$ 2.890,80
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing Bank Accounts */}
        <Card
          className="mb-6"
          style={{ borderRadius: "16px", border: "1px solid #E1F5FE" }}
        >
          <CardHeader>
            <CardTitle style={{ fontSize: "16px", color: "#333333" }}>
              Suas Contas Bancárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 rounded-lg ${
                  account.isPrimary ? "border-2" : "border"
                }`}
                style={{
                  borderColor: account.isPrimary ? "#3DBEAB" : "#E1F5FE",
                  backgroundColor: account.isPrimary ? "#F0FDF4" : "#FFFFFF",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#333333",
                          }}
                        >
                          {account.bankName}
                        </h4>
                        <p style={{ fontSize: "12px", color: "#666666" }}>
                          Ag: {account.agency} | Conta: {account.account} (
                          {account.accountType})
                        </p>
                        <p style={{ fontSize: "12px", color: "#888888" }}>
                          {account.holderName} - {account.holderDocument}
                        </p>
                      </div>
                      {account.isPrimary && (
                        <div className="flex items-center">
                          <CheckCircle
                            className="h-4 w-4 mr-1"
                            style={{ color: "#10B981" }}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#10B981",
                            }}
                          >
                            Principal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ borderRadius: "8px" }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!account.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAccount(account.id)}
                        style={{ borderRadius: "8px", color: "#EF4444" }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* New Account Form */}
        {showNewAccountForm && (
          <Card style={{ borderRadius: "16px", border: "2px solid #3DBEAB" }}>
            <CardHeader>
              <CardTitle style={{ fontSize: "16px", color: "#333333" }}>
                Adicionar Nova Conta Bancária
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nome do Banco *</Label>
                  <Select
                    value={newAccount.bankName}
                    onValueChange={(value) =>
                      setNewAccount({ ...newAccount, bankName: value })
                    }
                  >
                    <SelectTrigger style={{ borderRadius: "8px" }}>
                      <SelectValue placeholder="Selecione o banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Banco do Brasil">
                        Banco do Brasil (001)
                      </SelectItem>
                      <SelectItem value="Bradesco">Bradesco (237)</SelectItem>
                      <SelectItem value="Caixa Econômica Federal">
                        Caixa Econômica Federal (104)
                      </SelectItem>
                      <SelectItem value="Itaú">Itaú (341)</SelectItem>
                      <SelectItem value="Santander">Santander (033)</SelectItem>
                      <SelectItem value="Nubank">Nubank (260)</SelectItem>
                      <SelectItem value="Inter">Inter (077)</SelectItem>
                      <SelectItem value="PicPay">PicPay (380)</SelectItem>
                      <SelectItem value="C6 Bank">C6 Bank (336)</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Tipo de Conta *</Label>
                  <Select
                    value={newAccount.accountType}
                    onValueChange={(value) =>
                      setNewAccount({ ...newAccount, accountType: value })
                    }
                  >
                    <SelectTrigger style={{ borderRadius: "8px" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                      <SelectItem value="poupanca">Conta Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agency">Agência *</Label>
                  <Input
                    id="agency"
                    placeholder="1234 ou 1234-5"
                    style={{ borderRadius: "8px" }}
                    value={newAccount.agency}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, agency: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account">Número da Conta *</Label>
                  <Input
                    id="account"
                    placeholder="12345678-9"
                    style={{ borderRadius: "8px" }}
                    value={newAccount.account}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, account: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holderName">Nome do Titular *</Label>
                  <Input
                    id="holderName"
                    placeholder="Carlos Silva"
                    style={{ borderRadius: "8px" }}
                    value={newAccount.holderName}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        holderName: e.target.value,
                      })
                    }
                  />
                  <p style={{ fontSize: "10px", color: "#666666" }}>
                    Deve ser exatamente como no banco
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holderDocument">CPF do Titular *</Label>
                  <Input
                    id="holderDocument"
                    placeholder="123.456.789-00"
                    style={{ borderRadius: "8px" }}
                    value={newAccount.holderDocument}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        holderDocument: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={newAccount.isPrimary}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      isPrimary: e.target.checked,
                    })
                  }
                  className="h-4 w-4 border-gray-300 rounded focus:ring-[#3DBEAB]"
                  style={{ accentColor: "#3DBEAB" }}
                />
                <Label htmlFor="isPrimary" style={{ fontSize: "12px" }}>
                  Definir como conta principal para recebimentos
                </Label>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: "#E8F4FD",
                  border: "1px solid #BFDBFE",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#1E40AF",
                    marginBottom: "8px",
                  }}
                >
                  Como funcionam os pagamentos:
                </h4>
                <ul style={{ fontSize: "12px", color: "#1E40AF" }}>
                  <li>• Receba suas comissões após cada entrega realizada</li>
                  <li>• Transferências processadas semanalmente às sextas</li>
                  <li>• A conta deve estar no seu CPF (mesmo do cadastro)</li>
                  <li>• Histórico completo disponível na aba "Histórico"</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewAccountForm(false);
                    setNewAccount({
                      bankName: "",
                      agency: "",
                      account: "",
                      accountType: "corrente",
                      holderName: "",
                      holderDocument: "",
                      isPrimary: false,
                    });
                  }}
                  style={{ borderRadius: "8px" }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={addAccount}
                  style={{
                    background:
                      "linear-gradient(135deg, #3DBEAB 0%, #2D9CDB 100%)",
                    borderRadius: "8px",
                    color: "white",
                    border: "none",
                  }}
                >
                  Adicionar Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50"
        style={{ borderColor: "#E1F5FE" }}
      >
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/driver/dashboard"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Truck className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Pedidos</span>
          </Link>
          <Link
            to="/driver/active"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Navigation className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Ativa</span>
          </Link>
          <Link
            to="/driver/history"
            className="flex flex-col items-center justify-center"
            style={{ color: "#666666" }}
          >
            <Clock className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>
              Histórico
            </span>
          </Link>
          <Link
            to="/driver/profile"
            className="flex flex-col items-center justify-center"
            style={{ color: "#3DBEAB" }}
          >
            <User className="h-5 w-5" />
            <span style={{ fontSize: "10px", marginTop: "2px" }}>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
