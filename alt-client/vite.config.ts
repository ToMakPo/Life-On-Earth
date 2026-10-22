import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

import { FileNames } from './src/assets/data/update-json.ts'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		{
			name: 'write-lifeform-json',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					for (const fileName of FileNames) {
						if (req.url !== `/api/save-${fileName}` || req.method !== 'POST') continue

						const body = [] as string[]
						req.on('data', (chunk) => body.push(chunk))
						req.on('end', () => {
							try {
								const targetPath = path.resolve(path.resolve(), `src/assets/data/${fileName}.json`)

								const jsonData = JSON.parse(body.join(''))
								fs.writeFileSync(targetPath, JSON.stringify(jsonData, null, 2))

								res.statusCode = 200
								res.setHeader('Content-Type', 'application/json')
								res.end(JSON.stringify({ success: true }))
							} catch (error) {
								res.statusCode = 500
								res.end(JSON.stringify({ error: `Failed to write ${fileName} file` }))
							}
						})

						return
					}

					next() // Pass through all other requests normally
				})
			}
		}
	],
	server: {
		port: 3123
	}
})
