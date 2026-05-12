# Guía de Despliegue y Mantenimiento de Producción - Araí

Última actualización: Mayo 2026

## 🏗 Arquitectura del Servidor

- **App Engine**: Next.js corriendo sobre **PM2** (Gestor de procesos)
- **Puerto de la App**: `3006` (no usar 3000 — lo usa Profly)
- **Base de Datos**: PostgreSQL en Docker (`arai-db`, interno — ver sección de IPs)
- **Proxy Inverso**: Nginx redirige `yerbamatearai.com.ar` → puerto `3006`
- **Ruta del Proyecto**: `/root/arai/arai`

---

## ⚠️ Problema conocido: IP de arai-db cambia al reiniciar

`arai-db` no tiene puerto mapeado al host, por lo que usa IP interna Docker que cambia tras cada reinicio del VPS.

**Fix rápido** (si los productos no aparecen tras un reinicio):
```bash
# 1. Ver IP actual del contenedor
docker inspect arai-db | grep IPAddress

# 2. Actualizar .env con la nueva IP (reemplazá X por la IP que encontraste)
sed -i 's/172.19.0.X/172.19.0.NUEVA/g' /root/arai/arai/.env

# 3. Reiniciar
pm2 restart arai
```

**Fix permanente** (mapear puerto fijo al host, hacerlo una sola vez):
```bash
# Ver volumen actual
docker inspect arai-db --format '{{json .Mounts}}' | python3 -m json.tool

# Anotar el "Name" del volumen, luego:
docker stop arai-db
docker rm arai-db
docker run -d \
  --name arai-db \
  -p 5433:5432 \
  -e POSTGRES_USER=arai_user \
  -e POSTGRES_PASSWORD=arai_prod_2026 \
  -e POSTGRES_DB=arai_db \
  -v arai_arai_pgdata:/var/lib/postgresql/data \
  postgres:15-alpine

# Actualizar .env para usar localhost en lugar de IP interna
sed -i 's|postgresql://arai_user:arai_prod_2026@172.19.0.[0-9]*:5432|postgresql://arai_user:arai_prod_2026@localhost:5433|g' /root/arai/arai/.env

pm2 restart arai
```

---

## 🚀 Proceso de Actualización Estándar

```bash
cd ~/arai/arai
git pull origin main
npx prisma db push
npm run build
pm2 restart arai
```

---

## 🛠 Borrón y Cuenta Nueva (si algo falla gravemente)

```bash
# 1. Backup del .env y uploads
cp ~/arai/arai/.env ~/arai/.env.backup
cp -r ~/arai/arai/public/uploads ~/arai/uploads.backup

# 2. Limpiar y clonar
rm -rf ~/arai/arai
git clone https://github.com/facun3625/arai.git ~/arai/arai

# 3. Restaurar
cp ~/arai/.env.backup ~/arai/arai/.env
cp -r ~/arai/uploads.backup ~/arai/arai/public/uploads

# 4. Instalar y buildear
cd ~/arai/arai
npm install
npx prisma db push
npm run build
PORT=3006 pm2 restart arai
```

---

## 🔑 Variables Críticas del .env

- **DATABASE_URL**: `postgresql://arai_user:arai_prod_2026@<IP_arai-db>:5432/arai_db?schema=public`
  - Si se hizo el fix permanente: `@localhost:5433`
- **OCA CUIT**: `30716229633`
- **OCA Operativa**: `410240`
- **Mercado Pago**: `ACCESS_TOKEN` debe empezar con `APP_USR-...`

---

## 📸 Gestión de Imágenes

Las imágenes se guardan en `public/uploads`.
> ⚠️ Si borrás la carpeta del proyecto, las imágenes se pierden. Siempre hacer backup de `public/uploads`.

---

## 🔍 Comandos de Auxilio

```bash
pm2 logs arai --lines 50          # Ver errores
pm2 status                         # Estado de todas las apps
docker ps -a                       # Estado de contenedores
docker inspect arai-db | grep IPAddress  # IP actual de la DB
netstat -tlpn                      # Ver puertos en uso
sudo systemctl reload nginx        # Reiniciar Nginx
free -h                            # Memoria disponible
df -h /                            # Espacio en disco
```

---

*Facundo Arteaga Sola - Araí Yerba Mate*
