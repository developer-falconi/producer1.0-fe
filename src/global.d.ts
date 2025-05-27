import { SDKConfig } from '@mercadopago/sdk-js';

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, config: SDKConfig) => {
      getDeviceId: () => Promise<string>;
    };
  }
}

export {};
