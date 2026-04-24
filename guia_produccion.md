# Guía de Despliegue y Mantenimiento de Producción - Araí

Esta guía documenta la infraestructura y los pasos necesarios para actualizar el servidor sin errores, basada en la estabilización realizada el 17 de Marzo de 2026.

## 🏗 Arquitectura del Servidor

- **App Engine**: Next.js corriendo sobre **PM2** (Gestor de procesos).
- **Puerto de la App**: `3006` (Se cambió de 3000 para evitar conflictos con Profly).
- **Base de Datos**: PostgreSQL corriendo en Docker (`172.19.0.2:5432`).
- **Proxy Inverso**: Nginx redirige el tráfico de `yerbamatearai.com.ar` al puerto `3006`.
- **Ruta del Proyecto**: `/root/arai/arai`

---

## 🚀 Proceso de Actualización Estándar

Para subir cambios nuevos desde GitHub, seguí estos pasos exactos:

```bash
cd ~/arai/arai
git pull origin main
npx prisma db push
npm run build
pm2 restart arai
```

---

## 🛠 Qué hacer si algo falla ("Borrón y Cuenta Nueva")

Si el servidor se vuelve inestable o faltan binarios (como pasó hoy), la solución más segura es:

1. **Respaldar el .env**: `cp ~/arai/arai/.env ~/arai/.env.backup`
2. **Limpiar**: `rm -rf ~/arai/arai`
3. **Clonar**: `git clone https://github.com/facun3625/arai.git ~/arai/arai`
4. **Restaurar**: `cp ~/arai/.env.backup ~/arai/arai/.env`
5. **Permisos de Fotos**: 
   ```bash
   mkdir -p ~/arai/arai/public/uploads
   chmod -R 777 ~/arai/arai/public/uploads
   ```
6. **Instalar y Build**:
   ```bash
   cd ~/arai/arai
   npm install
   npx prisma@6.19.2 db push
   npm run build
   PORT=3006 pm2 restart arai
   ```

---

## 🔑 Variables Críticas del .env

Nunca compartas estas o las borres. Si OCA o Mercado Pago fallan, revisá estos formatos:

- **OCA CUIT**: `30716229633` (Sin guiones en el .env si el código lo formatea, o con guiones si la API lo pide).
- **OCA Operativa**: `410240` (Verificar que coincida con tu contrato).
- **Mercado Pago**: El `ACCESS_TOKEN` debe empezar con `APP_USR-...` para cobrar real.
- **DATABASE_URL**: Debe apuntar a la IP interna de Docker (`172.19.0.2`).

---

## 📸 Gestión de Imágenes

Las imágenes se guardan físicamente en `public/uploads`. 
> [!WARNING]
> Si borrás la carpeta del proyecto para reinstalar, las imágenes se pierden. Siempre hacé un backup de `public/uploads` si necesitás conservar las fotos subidas por los usuarios.

## 🔍 Comandos de Auxilio
- **Ver errores de la web**: `pm2 logs arai --lines 50`
- **Ver estado del servidor**: `pm2 status`
- **Verificar puertos**: `netstat -tlpn`
- **Reiniciar Nginx**: `sudo systemctl reload nginx`

---
*Documento creado para Facundo Arteaga Sola - Araí Yerba Mate.*
