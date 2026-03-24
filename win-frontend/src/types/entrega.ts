/**
 * Tipos para o sistema de Entrega (Uber Direct Integration)
 */

export type TipoPinValidacao = 'COLETA' | 'ENTREGA';

export interface DeliveryStatusUpdate {
  entregaId: string;
  status: string;
  timestamp: string;
  detalhes?: Record<string, unknown>;
}

export interface EntregaData {
  id: string;
  pedidoId: string;
  status: string;
  motorista?: {
    id: string;
    nome: string;
    placa: string;
    telefone?: string;
  };
  localizacao?: {
    latitude: number;
    longitude: number;
    endereco: string;
  };
  valores: {
    fretePago: number;
    valorCorrida: number;
    taxa: number;
  };
}

export interface PinValidacaoResponse {
  pinId: string;
  entregaId: string;
  tipo: TipoPinValidacao;
  validado: boolean;
  mensagem: string;
  tentativasRestantes: number;
  bloqueado: boolean;
  bloqueadoAte?: string;
  dataValidacao?: string;
}
