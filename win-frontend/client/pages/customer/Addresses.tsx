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
  MapPin,
  Plus,
  Edit,
  Trash2,
  Home,
  Building,
  Navigation,
  Check,
} from "lucide-react";
import Header from "../../components/Header";

interface Address {
  id: string;
  name: string;
  type: "home" | "work" | "other";
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: "1",
    name: "Casa",
    type: "home",
    street: "Rua das Flores",
    number: "123",
    complement: "Apt 45",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipcode: "01000-000",
    isDefault: true,
  },
  {
    id: "2",
    name: "Trabalho",
    type: "work",
    street: "Av. Paulista",
    number: "1000",
    complement: "Sala 1205",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipcode: "01310-100",
    isDefault: false,
  },
];

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    name: "",
    type: "home",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "SP",
    zipcode: "",
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "home",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "SP",
      zipcode: "",
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
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
    if (editingAddress) {
      // Update existing address
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id ? { ...(formData as Address) } : addr,
        ),
      );
    } else {
      // Add new address
      const newAddress: Address = {
        ...(formData as Address),
        id: Date.now().toString(),
      };
      setAddresses([...addresses, newAddress]);
    }

    // If this is set as default, remove default from others
    if (formData.isDefault) {
      setAddresses((prev) =>
        prev.map((addr) => ({ ...addr, isDefault: addr.id === formData.id })),
      );
    }

    handleCloseDialog();
  };

  const handleDelete = (addressId: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== addressId));
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      })),
    );
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "work":
        return <Building className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case "home":
        return "Casa";
      case "work":
        return "Trabalho";
      default:
        return "Outro";
    }
  };

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.number}${
      address.complement ? `, ${address.complement}` : ""
    } - ${address.neighborhood}, ${address.city}/${address.state} - ${
      address.zipcode
    }`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showCategories={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <MapPin className="h-8 w-8 mr-3" />
              Meus Endereços
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus endereços de entrega
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Endereço
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? "Editar Endereço" : "Novo Endereço"}
                </DialogTitle>
                <DialogDescription>
                  {editingAddress
                    ? "Atualize as informações do endereço"
                    : "Adicione um novo endereço de entrega"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Endereço</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Casa, Trabalho"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
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
                      <SelectItem value="home">Casa</SelectItem>
                      <SelectItem value="work">Trabalho</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="zipcode">CEP</Label>
                  <Input
                    id="zipcode"
                    placeholder="00000-000"
                    value={formData.zipcode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipcode: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      placeholder="Nome da rua"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      placeholder="123"
                      value={formData.number}
                      onChange={(e) =>
                        setFormData({ ...formData, number: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="complement">Complemento (opcional)</Label>
                  <Input
                    id="complement"
                    placeholder="Apt, sala, andar..."
                    value={formData.complement}
                    onChange={(e) =>
                      setFormData({ ...formData, complement: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    placeholder="Nome do bairro"
                    value={formData.neighborhood}
                    onChange={(e) =>
                      setFormData({ ...formData, neighborhood: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      placeholder="São Paulo"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) =>
                        setFormData({ ...formData, state: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                  <Label htmlFor="isDefault">
                    Definir como endereço padrão
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingAddress ? "Atualizar" : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {getAddressTypeIcon(address.type)}
                        <h3 className="font-semibold text-lg">
                          {address.name}
                        </h3>
                      </div>
                      <Badge variant="outline">
                        {getAddressTypeLabel(address.type)}
                      </Badge>
                      {address.isDefault && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Padrão
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-4">
                      {formatAddress(address)}
                    </p>

                    <div className="flex items-center space-x-4">
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Tornar Padrão
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Ver no Mapa
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleDelete(address.id)}
                      disabled={address.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {addresses.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum endereço cadastrado
                </h3>
                <p className="text-muted-foreground mb-6">
                  Adicione um endereço para receber suas compras
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Endereço
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Área de Entrega
                </h3>
                <p className="text-blue-800 text-sm">
                  Atendemos toda a região metropolitana com entrega em até 2
                  horas. Verifique se seu endereço está na nossa área de
                  cobertura durante o checkout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
