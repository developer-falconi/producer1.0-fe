import React from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

interface MercadoPagoButtonProps {
  preferenceId: string | null;
  publicKey: string;
}

const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = ({ preferenceId, publicKey }) => {
  if (publicKey) {
    initMercadoPago(publicKey, {
      locale: 'es-AR',
    });
  } else {
    console.error(
      'Error: Mercado Pago Public Key (publicKey) is missing. ' +
      'The Mercado Pago Button will not work correctly. ' +
      'Please ensure it is set in your .env file and the project is rebuilt if necessary.'
    );
  }

  const initialization: any = { redirectMode: 'self', preferenceId }

  const handleOnSubmit = async () => {
    // This callback is triggered when the user clicks the Wallet Brick button.
    // It signifies the initiation of the payment flow from the frontend.
    // Actual payment processing and redirection are handled by Mercado Pago.
    // You might log this event or update UI if needed before redirection.
    console.log('Mercado Pago Wallet Brick: Payment process initiated by user.');
    // Typically, no navigation or API calls are made from here by your application code,
    // as Mercado Pago handles the next steps.
  };

  const handleOnReady = async () => {
    // This callback is triggered when the Wallet Brick has loaded and is ready for user interaction.
    // Useful for hiding any loading indicators you might have for the payment button itself.
    console.log('Mercado Pago Wallet Brick: Ready.');
  };

  const handleOnError = async (error: any) => {
    // This callback is triggered for any errors encountered by the Wallet Brick.
    // Examples: Invalid preferenceId, network issues loading the Brick, misconfiguration.
    console.error('Mercado Pago Wallet Brick Error:', error);
    // For users, you might want to display a user-friendly message:
    // alert('Hubo un problema al cargar el botón de pago. Por favor, intenta de nuevo más tarde.');
    // Or log detailed errors to your monitoring service.
  };

  if (!publicKey) {
    return (
      <div style={{ padding: '10px', border: '1px solid red', color: 'red', borderRadius: '4px' }}>
        Error de configuración: La clave pública de Mercado Pago no está disponible.
        El botón de pago no puede mostrarse.
      </div>
    );
  }

  if (!preferenceId) {
    console.warn('MercadoPagoButton: preferenceId is null or undefined. Wallet Brick will not render.');
    return (
      <div style={{ fontStyle: 'italic', padding: '10px', color: 'gray' }}>
        Preparando botón de pago... (Esperando ID de preferencia)
      </div>
    );
  }

  return (
    <div className="mercadopago-button-container w-full">
      <Wallet
        initialization={initialization}
        customization={{ theme: 'dark', valueProp: 'smart_option' }}
        onSubmit={handleOnSubmit}
        onReady={handleOnReady}
        onError={handleOnError}
      />
    </div>
  );
};

export default MercadoPagoButton;