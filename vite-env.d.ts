interface ImportMetaEnv {
  readonly VITE_APP_API_BE: string;
  readonly VITE_APP_MP_PUBLIC_KEY: string;
  readonly VITE_APP_AES_SECRET_KEY_HEX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}