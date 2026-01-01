module.exports = {
  apps: [
    {
      name: 'ai-realtime-chat',
      script: 'npm',
      args: 'run dev',
      cwd: '/Users/avio/dev/sb-projects/concierge-ai',
      env: {
        NODE_ENV: 'development',
        PORT: 4024
      },
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      time: true
    }
  ]
};
