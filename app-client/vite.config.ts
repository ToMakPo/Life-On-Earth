import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		{
			name: 'write-lifeform-json',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					// Listen specifically for our save endpoint
					if (req.url === '/api/save-lifeform' && req.method === 'POST') {
						let body = ''
						req.on('data', (chunk) => (body += chunk))
						req.on('end', () => {
							try {
								// Resolve path relative to the root vite.config.ts file
								const targetPath = path.resolve(__dirname, 'src/assets/test-data/lifeform.json')

								// Parse the incoming body and write it pretty-printed to disk
								const jsonData = JSON.parse(body)
								fs.writeFileSync(targetPath, JSON.stringify(jsonData, null, 2))

								res.statusCode = 200
								res.setHeader('Content-Type', 'application/json')
								res.end(JSON.stringify({ success: true }))
							} catch (error) {
								res.statusCode = 500
								res.end(JSON.stringify({ error: 'Failed to write file' }))
							}
						})
					} else {
						next() // Pass through all other requests normally
					}
				})
			}
		}
	],
	server: {
		port: 3123
	}
})
