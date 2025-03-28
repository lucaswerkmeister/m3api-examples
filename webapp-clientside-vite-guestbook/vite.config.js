import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const __dirname = dirname( fileURLToPath( import.meta.url ) );

// https://vitejs.dev/config/
export default defineConfig( {
	build: {
		rollupOptions: {
			input: {
				main: resolve( __dirname, 'index.html' ),
				oauthCallback: resolve( __dirname, 'oauth-callback/index.html' ),
			},
		},
	},
	plugins: [ vue() ],
	server: {
		port: 8080,
		strictPort: true, // the port number is part of the OAuth callback URL
	},
} );
