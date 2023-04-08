import path from 'node:path'

export const PORT = 8000
export const UPLOAD_DIR = path.join(__dirname, 'upload')
export const HOST_NAME = `http://localhost:${PORT}`
export const MAX_SIZE = 200 * 1024 * 1024
