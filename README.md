# SCEGMAN — Sistema Centralizado de Gestión y Mantenimiento

Aplicación web (React + TypeScript + Vite) con versión empaquetada para Android (APK).

## Requisitos previos

- **PC / Web**: Node.js 20+ y npm
- **Android**: JDK 21, Android SDK (`platforms/android-36` y `build-tools/36.0.0`)

---

## 1. Ejecutar y compilar para PC (Web)

Desde la carpeta raíz del proyecto:

```powershell
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (http://localhost:5173)
npm run dev

# Compilar versión de producción (genera carpeta dist/)
npm run build
```

> **Nota en Windows PowerShell**: Si la política de ejecución bloquea `npm`, usa `npm.cmd` en su lugar (por ejemplo: `npm.cmd install`, `npm.cmd run dev`, `npm.cmd run build`).

---

## 2. Compilar para Android (APK)

### Opción rápida (compila web + sincroniza assets + genera APK)

```powershell
powershell -ExecutionPolicy Bypass -File .\scegman-android\sync-and-build-apk.ps1
```

Esto genera el archivo instalable en:
- `scegman-android\SCEGMAN-v1.0.apk`

### Opción manual

1. Compilar la web y copiar `dist/` a los assets de Android:

```powershell
npm.cmd run build
New-Item -ItemType Directory -Force -Path .\scegman-android\app\src\main\assets\www | Out-Null
Copy-Item -Recurse -Force .\dist\* .\scegman-android\app\src\main\assets\www\
```

2. Compilar el APK con Gradle:

```powershell
cd .\scegman-android
.\gradlew.bat assembleDebug
```

El APK compilado quedará en `scegman-android\app\build\outputs\apk\debug\app-debug.apk`.
