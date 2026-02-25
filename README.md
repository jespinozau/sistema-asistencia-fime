# 🎓 Sistema de Asistencia Docente FIME V3.0

**Facultad de Ingeniería Mecánica y Eléctrica — Universidad Autónoma de Nuevo León**

Plataforma integral de control de asistencia docente con soporte para escenarios presenciales, virtuales y de contingencia.

---

## 🚀 Despliegue en GitHub Pages — Paso a Paso

### Prerrequisitos

- Cuenta de GitHub
- [Node.js](https://nodejs.org/) v18 o superior instalado en tu computadora
- [Git](https://git-scm.com/) instalado

### Paso 1 — Crear el repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Nombre del repositorio: `sistema-asistencia-fime` (o el que prefieras)
3. Selecciona **Public**
4. **NO** marques "Add a README" (ya incluimos uno)
5. Clic en **Create repository**

### Paso 2 — Configurar el nombre del repositorio en el proyecto

> ⚠️ **IMPORTANTE**: Si usaste un nombre diferente a `sistema-asistencia-fime`, debes cambiarlo en el archivo `vite.config.js`:

```js
// vite.config.js — línea 9
base: '/TU-NOMBRE-DE-REPO/',
```

### Paso 3 — Subir los archivos al repositorio

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar Git
git init

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "feat: Sistema de Asistencia Docente FIME V3.0"

# Conectar con tu repositorio (cambia la URL por la tuya)
git remote add origin https://github.com/TU-USUARIO/sistema-asistencia-fime.git

# Subir a GitHub
git branch -M main
git push -u origin main
```

### Paso 4 — Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Clic en **Settings** (pestaña superior)
3. En el menú lateral, clic en **Pages**
4. En **Source**, selecciona **GitHub Actions**
5. ¡Listo! El workflow ya está configurado en `.github/workflows/deploy.yml`

### Paso 5 — Esperar el despliegue

1. Ve a la pestaña **Actions** de tu repositorio
2. Verás el workflow "Deploy to GitHub Pages" ejecutándose
3. Espera a que termine (~2 minutos)
4. Tu aplicación estará disponible en:

```
https://TU-USUARIO.github.io/sistema-asistencia-fime/
```

### Paso 6 — Verificar

Abre la URL en un navegador (preferible Chrome en Android para simular las tablets). Verifica que:
- [x] La pantalla de selección de rol aparece
- [x] Puedes iniciar sesión como Admin (usuario: `admin`, contraseña: `admin123`)
- [x] La cámara funciona (requiere HTTPS — GitHub Pages lo incluye)
- [x] El GPS funciona (requiere HTTPS)

---

## 📁 Estructura del Proyecto

```
sistema-asistencia-fime/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← Despliegue automático
├── public/                     ← Archivos estáticos
├── src/
│   ├── App.jsx                 ← Componente principal (~3,956 líneas)
│   ├── main.jsx                ← Punto de entrada React
│   └── index.css               ← Estilos globales + Tailwind
├── .gitignore
├── index.html                  ← HTML base con meta tags PWA
├── package.json                ← Dependencias y scripts
├── postcss.config.js           ← Configuración PostCSS
├── tailwind.config.js          ← Configuración Tailwind CSS
├── vite.config.js              ← Configuración Vite + base path
└── README.md                   ← Este archivo
```

---

## 🔐 Credenciales por Defecto

| Rol | Usuario | Contraseña | Nota |
|-----|---------|------------|------|
| Administrador | `admin` | `admin123` | Primer login fuerza cambio de contraseña |
| Recursos Humanos | `rh` | `rh123` | Primer login fuerza cambio de contraseña |
| Prefectura | `prefectura` | `pref123` | Primer login fuerza cambio de contraseña |
| Checador | — | No. Empleado + PIN | Se registran desde Prefectura |
| Maestro | — | Selección de perfil | Se registran desde RH |

---

## 🧩 Características Principales

### 3 Escenarios de Asistencia
- **Presencial** — Firma digital + GPS + geofencing
- **Virtual** — Link seguro + evidencia fotográfica + device tracking
- **Contingencia** — Auto-registro con validación de firma biométrica

### 5 Roles con RBAC
- **Administrador** — Configuración total, modo demo, reset
- **Prefectura** — Checadores, contingencia, log de actividad
- **RH** — Alta de maestros (3 pasos), reportes CSV
- **Checador** — 4 pestañas (Presencial, Virtual, Revisión, Alertas)
- **Maestro** — Firma de asistencia, consulta de horarios

### Seguridad
- Contraseñas: 8-15 chars, mayúscula, minúscula, número, símbolo
- Cambio obligatorio cada 6 meses (enero/julio)
- PIN numérico de 4-6 dígitos para checadores
- Device tracking (IP + User Agent) con alertas de duplicados
- Log de actividad con 200 eventos

### Persistencia Offline-First
- localStorage con debounce 500ms (17 estados)
- Protección beforeunload + anti-swipe-back
- Banner de rol activo en todo momento
- Sobrevive recargas, cierres y pérdida de conexión

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# → http://localhost:5173/sistema-asistencia-fime/
```

### Build de producción

```bash
npm run build
npm run preview
```

---

## 📱 Hardware de Despliegue

15 tablets **UGEE UT3** distribuidas en 11 centros de trabajo:
- 14.25" pantalla táctil
- Android 14
- 8GB RAM + 256GB almacenamiento
- WiFi
- Batería de 10,000 mAh

---

## 📄 Licencia

Proyecto desarrollado para la Facultad de Ingeniería Mecánica y Eléctrica (FIME) de la Universidad Autónoma de Nuevo León (UANL). Todos los derechos reservados © 2026.
