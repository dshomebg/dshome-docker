module.exports = {
  apps: [{
    name: "dshome-backend",
    cwd: "/opt/dshome",
    script: "pnpm",
    args: "--filter @dshome/backend dev",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://admin_dsdock:1Borabora2@localhost:5432/admin_dsdock",
      REDIS_URL: "redis://localhost:6379",
      MEILISEARCH_URL: "http://localhost:7700",
      MEILISEARCH_MASTER_KEY: "dshome_master_key_2024",
      API_PORT: "4000",
      JWT_SECRET: "dshome_jwt_secret_production_2024_change_this",
      JWT_ACCESS_EXPIRATION: "15m",
      JWT_REFRESH_EXPIRATION: "7d",
      IMAGES_PATH: "/home/admin/web/dshome.dev/public_html/images",
      IMAGES_BASE_URL: "https://dshome.dev/images",
      API_URL: "https://dshome.dev/api",
      LOG_LEVEL: "info",
      DEFAULT_CURRENCY: "EUR",
      DEFAULT_LOCALE: "bg"
    },
    error_file: "/var/log/dshome/backend/error.log",
    out_file: "/var/log/dshome/backend/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
};
