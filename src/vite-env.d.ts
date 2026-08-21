/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string
  readonly VITE_GA_IN_DEV?: string
  readonly VITE_GOOGLE_SITE_VERIFICATION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
