interface ImportMetaEnv {
  readonly VITE_APP_API_BE: string;
  readonly VITE_APP_MP_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}