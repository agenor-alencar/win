import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { DataTable, Column, Action } from "../../components/admin/DataTable";
import { AdminModal } from "../../components/admin/AdminModal";
import {
  PlusIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const AdminDrivers: React.FC = () => {
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  const columns: Column[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Nome", sortable: true },
    { key: "phone", label: "Telefone", sortable: true },
    { key: "vehicle", label: "Veículo", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            status === "Aprovado"
              ? "bg-green-100 text-green-800"
              : status === "Pendente"
                ? "bg-yellow-100 text-yellow-800"
                : status === "Recusado"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      key: "rating",
      label: "Avaliação",
      render: (rating) => (
        <div className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="ml-1">{rating}</span>
        </div>
      ),
    },
    { key: "deliveries", label: "Entregas", sortable: true },
    { key: "createdAt", label: "Cadastro", sortable: true },
  ];

  const drivers = [
    {
      id: "3001",
      name: "Carlos Silva",
      phone: "(11) 99999-9999",
      vehicle: "Honda CG 160",
      status: "Aprovado",
      rating: "4.8",
      deliveries: 256,
      createdAt: "15/01/2024",
      email: "carlos@email.com",
      cpf: "123.456.789-00",
      cnh: "12345678901",
      address: "Rua das Entregas, 123 - São Paulo, SP",
      documents: {
        cnh: {
          number: "12345678901",
          validity: "15/06/2028",
          category: "A",
          status: "Aprovado",
          image: "/docs/cnh-carlos.jpg",
        },
        selfie: {
          status: "Aprovado",
          image: "/docs/selfie-carlos.jpg",
        },
        vehicle: {
          plate: "ABC-1234",
          model: "Honda CG 160",
          year: "2022",
          color: "Vermelha",
          status: "Aprovado",
          documents: "/docs/vehicle-carlos.pdf",
        },
      },
      performance: {
        monthDeliveries: 42,
        monthEarnings: 2850,
        averageTime: "28 min",
        completionRate: 98.5,
        rating: 4.8,
        totalDeliveries: 256,
      },
      availability: {
        monday: { start: "08:00", end: "18:00", available: true },
        tuesday: { start: "08:00", end: "18:00", available: true },
        wednesday: { start: "08:00", end: "18:00", available: true },
        thursday: { start: "08:00", end: "18:00", available: true },
        friday: { start: "08:00", end: "18:00", available: true },
        saturday: { start: "09:00", end: "15:00", available: true },
        sunday: { start: "", end: "", available: false },
      },
    },
    {
      id: "3002",
      name: "João Oliveira",
      phone: "(11) 88888-8888",
      vehicle: "Yamaha Factor 125",
      status: "Pendente",
      rating: "0.0",
      deliveries: 0,
      createdAt: "20/07/2024",
      email: "joao@email.com",
      cpf: "987.654.321-00",
      cnh: "09876543210",
      address: "Av. dos Motoqueiros, 456 - São Paulo, SP",
      documents: {
        cnh: {
          number: "09876543210",
          validity: "10/12/2026",
          category: "A",
          status: "Pendente",
          image: "/docs/cnh-joao.jpg",
        },
        selfie: {
          status: "Pendente",
          image: "/docs/selfie-joao.jpg",
        },
        vehicle: {
          plate: "XYZ-5678",
          model: "Yamaha Factor 125",
          year: "2021",
          color: "Azul",
          status: "Pendente",
          documents: "/docs/vehicle-joao.pdf",
        },
      },
      performance: {
        monthDeliveries: 0,
        monthEarnings: 0,
        averageTime: "0 min",
        completionRate: 0,
        rating: 0,
        totalDeliveries: 0,
      },
      availability: {
        monday: { start: "07:00", end: "19:00", available: true },
        tuesday: { start: "07:00", end: "19:00", available: true },
        wednesday: { start: "07:00", end: "19:00", available: true },
        thursday: { start: "07:00", end: "19:00", available: true },
        friday: { start: "07:00", end: "19:00", available: true },
        saturday: { start: "08:00", end: "16:00", available: true },
        sunday: { start: "", end: "", available: false },
      },
    },
    {
      id: "3003",
      name: "Pedro Santos",
      phone: "(11) 77777-7777",
      vehicle: "Honda Biz 125",
      status: "Recusado",
      rating: "0.0",
      deliveries: 0,
      createdAt: "18/07/2024",
      email: "pedro@email.com",
      cpf: "456.789.123-00",
      cnh: "56789012345",
      address: "Rua da Rejeição, 789 - São Paulo, SP",
      documents: {
        cnh: {
          number: "56789012345",
          validity: "20/01/2025",
          category: "A",
          status: "Recusado",
          image: "/docs/cnh-pedro.jpg",
          rejectionReason: "Documento vencido",
        },
        selfie: {
          status: "Recusado",
          image: "/docs/selfie-pedro.jpg",
          rejectionReason: "Foto não confere com a CNH",
        },
        vehicle: {
          plate: "DEF-9012",
          model: "Honda Biz 125",
          year: "2019",
          color: "Preta",
          status: "Aprovado",
          documents: "/docs/vehicle-pedro.pdf",
        },
      },
      performance: {
        monthDeliveries: 0,
        monthEarnings: 0,
        averageTime: "0 min",
        completionRate: 0,
        rating: 0,
        totalDeliveries: 0,
      },
      availability: {
        monday: { start: "06:00", end: "20:00", available: true },
        tuesday: { start: "06:00", end: "20:00", available: true },
        wednesday: { start: "06:00", end: "20:00", available: true },
        thursday: { start: "06:00", end: "20:00", available: true },
        friday: { start: "06:00", end: "20:00", available: true },
        saturday: { start: "07:00", end: "17:00", available: true },
        sunday: { start: "", end: "", available: false },
      },
    },
  ];

  const actions: Action[] = [
    {
      label: "Ver Detalhes",
      onClick: (driver) => {
        setSelectedDriver(driver);
        setShowDriverModal(true);
      },
      color: "primary",
    },
    {
      label: "Documentos",
      onClick: (driver) => {
        setSelectedDriver(driver);
        setShowDocumentsModal(true);
      },
      color: "secondary",
    },
    {
      label: "Aprovar",
      onClick: (driver) => {
        console.log("Approve driver:", driver.id);
      },
      color: "primary",
    },
    {
      label: "Recusar",
      onClick: (driver) => {
        console.log("Reject driver:", driver.id);
      },
      color: "danger",
    },
  ];

  const dayNames = {
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Gestão de Motoristas
            </h1>
            <p className="text-gray-600">
              Gerencie motoristas, aprovações e documentos
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow">
              <PlusIcon className="w-4 h-4" />
              <span>Novo Motorista</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckIcon className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-xl font-semibold text-[#111827]">267</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-semibold text-[#111827]">34</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XMarkIcon className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Recusados</p>
                <p className="text-xl font-semibold text-[#111827]">18</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <EyeIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-semibold text-[#111827]">319</p>
              </div>
            </div>
          </div>
        </div>

        {/* Drivers Table */}
        <DataTable
          columns={columns}
          data={drivers}
          actions={actions}
          itemsPerPage={10}
        />

        {/* Driver Details Modal */}
        <AdminModal
          isOpen={showDriverModal}
          onClose={() => {
            setShowDriverModal(false);
            setSelectedDriver(null);
          }}
          title="Detalhes do Motorista"
          size="xl"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDriverModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow">
                Aprovar Motorista
              </button>
            </div>
          }
        >
          {selectedDriver && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Informações Pessoais
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Nome:</span>
                      <p className="font-medium">{selectedDriver.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">E-mail:</span>
                      <p className="font-medium">{selectedDriver.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Telefone:</span>
                      <p className="font-medium">{selectedDriver.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">CPF:</span>
                      <p className="font-medium">{selectedDriver.cpf}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">CNH:</span>
                      <p className="font-medium">{selectedDriver.cnh}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Endereço:</span>
                      <p className="font-medium">{selectedDriver.address}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Veículo
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Modelo:</span>
                      <p className="font-medium">
                        {selectedDriver.documents.vehicle.model}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Placa:</span>
                      <p className="font-medium">
                        {selectedDriver.documents.vehicle.plate}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Ano:</span>
                      <p className="font-medium">
                        {selectedDriver.documents.vehicle.year}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Cor:</span>
                      <p className="font-medium">
                        {selectedDriver.documents.vehicle.color}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Performance
                </h4>
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      {selectedDriver.performance.totalDeliveries}
                    </p>
                    <p className="text-xs text-gray-600">Total Entregas</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      {selectedDriver.performance.monthDeliveries}
                    </p>
                    <p className="text-xs text-gray-600">Este Mês</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      R$ {selectedDriver.performance.monthEarnings}
                    </p>
                    <p className="text-xs text-gray-600">Ganhos/Mês</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      {selectedDriver.performance.completionRate}%
                    </p>
                    <p className="text-xs text-gray-600">Taxa Conclusão</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-lg font-semibold text-[#111827]">
                      {selectedDriver.performance.rating} ★
                    </p>
                    <p className="text-xs text-gray-600">Avaliação</p>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Disponibilidade
                </h4>
                <div className="space-y-2">
                  {Object.entries(selectedDriver.availability).map(
                    ([day, schedule]) => (
                      <div
                        key={day}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm font-medium">
                          {dayNames[day as keyof typeof dayNames]}
                        </span>
                        <span className="text-sm text-gray-600">
                          {(schedule as any).available
                            ? `${(schedule as any).start} - ${(schedule as any).end}`
                            : "Indisponível"}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </AdminModal>

        {/* Documents Modal */}
        <AdminModal
          isOpen={showDocumentsModal}
          onClose={() => {
            setShowDocumentsModal(false);
            setSelectedDriver(null);
          }}
          title="Verificação de Documentos"
          size="xl"
          actions={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDocumentsModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Recusar
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#3DBEAB] to-[#2D9CDB] text-white rounded-lg hover:shadow-lg transition-shadow">
                Aprovar Todos
              </button>
            </div>
          }
        >
          {selectedDriver && (
            <div className="space-y-6">
              {/* CNH */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Carteira Nacional de Habilitação
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedDriver.documents.cnh.status === "Aprovado"
                        ? "bg-green-100 text-green-800"
                        : selectedDriver.documents.cnh.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedDriver.documents.cnh.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Número:</span>
                    <p className="font-medium">
                      {selectedDriver.documents.cnh.number}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Validade:</span>
                    <p className="font-medium">
                      {selectedDriver.documents.cnh.validity}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Categoria:</span>
                    <p className="font-medium">
                      {selectedDriver.documents.cnh.category}
                    </p>
                  </div>
                </div>
                {selectedDriver.documents.cnh.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-600">
                      <strong>Motivo da rejeição:</strong>{" "}
                      {selectedDriver.documents.cnh.rejectionReason}
                    </p>
                  </div>
                )}
                <div className="mt-3">
                  <img
                    src={selectedDriver.documents.cnh.image}
                    alt="CNH"
                    className="w-full max-w-md mx-auto border border-gray-200 rounded-lg"
                    onError={(e) => {
                      (e.target as any).src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVMMTc1IDEyNUgxMjVWNzVaIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0xNzUgNzVMMTI1IDEyNUgxNzVWNzVaIiBmaWxsPSIjRTVFN0VCIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3Mjg0IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+Q05IPC90ZXh0Pgo8L3N2Zz4K";
                    }}
                  />
                </div>
              </div>

              {/* Selfie */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Selfie</h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedDriver.documents.selfie.status === "Aprovado"
                        ? "bg-green-100 text-green-800"
                        : selectedDriver.documents.selfie.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedDriver.documents.selfie.status}
                  </span>
                </div>
                {selectedDriver.documents.selfie.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded-lg mb-3">
                    <p className="text-sm text-red-600">
                      <strong>Motivo da rejeição:</strong>{" "}
                      {selectedDriver.documents.selfie.rejectionReason}
                    </p>
                  </div>
                )}
                <div className="mt-3">
                  <img
                    src={selectedDriver.documents.selfie.image}
                    alt="Selfie"
                    className="w-32 h-32 mx-auto object-cover border border-gray-200 rounded-lg"
                    onError={(e) => {
                      (e.target as any).src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjY0IiBjeT0iNDgiIHI9IjE2IiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0zMiA5NkMzMiA4MC41MzYgNDguNTM2IDY0IDY0IDY0Qzc5LjQ2NCA2NCA5NiA4MC41MzYgOTYgOTZWMTI4SDMyVjk2WiIgZmlsbD0iI0U1RTdFQiIvPgo8L3N2Zz4K";
                    }}
                  />
                </div>
              </div>

              {/* Vehicle Documents */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Documentos do Veículo
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedDriver.documents.vehicle.status === "Aprovado"
                        ? "bg-green-100 text-green-800"
                        : selectedDriver.documents.vehicle.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedDriver.documents.vehicle.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Placa:</span>
                    <p className="font-medium">
                      {selectedDriver.documents.vehicle.plate}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Modelo:</span>
                    <p className="font-medium">
                      {selectedDriver.documents.vehicle.model}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ano:</span>
                    <p className="font-medium">
                      {selectedDriver.documents.vehicle.year}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Cor:</span>
                    <p className="font-medium">
                      {selectedDriver.documents.vehicle.color}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <a
                    href={selectedDriver.documents.vehicle.documents}
                    className="flex items-center space-x-2 text-[#3DBEAB] hover:text-[#2D9CDB]"
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Ver documentos do veículo</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </AdminModal>
      </div>
    </AdminLayout>
  );
};

export default AdminDrivers;
