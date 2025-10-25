/// <reference types="vite/client" />

interface ImportMetaEnv {
  // LLM API Configuration
  readonly VITE_LLM_API_KEY: string;
  readonly VITE_LLM_BASE_URL: string;

  // Voice Recognition Configuration
  readonly VITE_VOICE_APP_ID: string;
  readonly VITE_VOICE_API_SECRET: string;
  readonly VITE_VOICE_API_KEY: string;

  // Amap Configuration
  readonly VITE_AMAP_KEY: string;
  readonly VITE_AMAP_SECRET: string;

  // Supabase Configuration
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 高德地图全局类型声明
declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
  }
}

export {};