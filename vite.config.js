import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: Cambia 'sistema-asistencia-fime' por el nombre exacto de tu repositorio en GitHub
  // Si tu repo es: https://github.com/tu-usuario/sistema-asistencia-fime
  // Entonces base debe ser: '/sistema-asistencia-fime/'
  base: '/sistema-asistencia-fime/',
})
