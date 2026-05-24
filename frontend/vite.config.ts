import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const publicHost = env.VITE_PUBLIC_HOST || 'localhost';
  const hmrClientPort = Number(env.VITE_HMR_CLIENT_PORT || 8080);
  const hmrProtocol = (env.VITE_HMR_PROTOCOL || 'ws') as 'ws' | 'wss';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'host.containers.internal',
        publicHost,
      ],
      hmr: {
        protocol: hmrProtocol,
        host: publicHost,
        clientPort: hmrClientPort,
      },
    },
  };
});
