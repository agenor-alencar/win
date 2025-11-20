import React, { useEffect } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

interface MercadoPagoWalletProps {
  preferenceId: string;
  onReady?: () => void;
  onError?: (error: any) => void;
}

const MercadoPagoWallet: React.FC<MercadoPagoWalletProps> = ({ 
  preferenceId, 
  onReady,
  onError 
}) => {
  useEffect(() => {
    // Inicializar Mercado Pago SDK com a Public Key
    const publicKey = (import.meta as any).env?.VITE_MERCADOPAGO_PUBLIC_KEY || "APP_USR-6c7ec393-e65b-47dc-906a-5f69e7097698";
    
    try {
      initMercadoPago(publicKey, {
        locale: "pt-BR",
      });
      
      if (onReady) {
        onReady();
      }
    } catch (error) {
      console.error("Erro ao inicializar Mercado Pago:", error);
      if (onError) {
        onError(error);
      }
    }
  }, [onReady, onError]);

  if (!preferenceId) {
    return (
      <div className="text-center text-gray-500 py-4">
        Carregando dados de pagamento...
      </div>
    );
  }

  return (
    <div className="mercadopago-wallet-container">
      <Wallet
        initialization={{ preferenceId }}
        onReady={() => {
          console.log("Botão de pagamento pronto!");
        }}
        onError={(error: any) => {
          console.error("Erro no Wallet:", error);
          if (onError) {
            onError(error);
          }
        }}
      />
    </div>
  );
};

export default MercadoPagoWallet;
