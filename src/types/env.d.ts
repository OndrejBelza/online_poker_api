declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    APP_URL: string;
    MONGO_URL: string;
    SESSION_SECRET: string;
  }
}