module.exports = {
  apps: [
    {
      name: 'dshome-backend',
      cwd: '/opt/dshome/packages/backend',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://admin_dsdock:1Borabora2@localhost:5432/admin_dsdock',
      },
      output: '/var/log/dshome/backend/out.log',
      error: '/var/log/dshome/backend/error.log',
    },
    {
      name: 'dshome-admin',
      cwd: '/opt/dshome/packages/admin',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://dshome.dev/api',
      },
      output: '/var/log/dshome/admin/out.log',
      error: '/var/log/dshome/admin/error.log',
    },
  ],
};
