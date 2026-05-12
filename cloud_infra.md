# Infraestructura Cloud - VPS Hostinger

Última actualización: Mayo 2026

---

## 🖥 Servidor

| Recurso | Valor |
|---------|-------|
| RAM     | 6 GB  |
| CPU     | 4 cores |
| Disco   | 34 GB (24 GB usado — 69%) |
| Swap    | Desactivado |
| OS      | Linux (Hostinger VPS) |

> ⚠️ Disco al 69% — monitorear. Limpiar builds viejos si sube al 85%+:
> ```bash
> cd ~/arai/arai && rm -rf .next && npm run build
> docker system prune -f  # elimina imágenes/contenedores huérfanos
> ```

---

## 🐳 Contenedores Docker

| Nombre             | Imagen             | Puerto Host | Puerto Interno | Estado  | Usado por    |
|--------------------|--------------------|-------------|----------------|---------|--------------|
| `sgo-db`           | postgres:16        | 5432        | 5432           | ✅ Online | SGO (PM2)   |
| `arai-db`          | postgres:15        | ⚠️ ninguno  | 5432           | ✅ Online | Araí (PM2)  |
| `estudio_ferrer_db`| postgres:16        | 5435        | 5432           | ✅ Online | Ferrer (PM2)|
| `cravero-db`       | postgres:16        | 5436        | 5432           | ✅ Online | Cravero (PM2)|
| `profly-db`        | postgres:16        | ninguno     | 5432           | ✅ Online | Profly (Docker interno) |
| `profly-web`       | profly-web         | 3001        | 3000           | ✅ Online | Profly frontend |
| `profly-api`       | profly-api         | 3000        | —              | ✅ Online | Profly backend  |
| `arai-app`         | arai-arai-app      | —           | —              | ❌ Exited | Obsoleto — eliminar |

> ℹ️ `profly-db` sin puerto al host es correcto: `profly-web` y `profly-api` se comunican con ella por red Docker interna.
> ⚠️ `arai-db` sin puerto al host es un problema — ver guia_produccion.md para el fix permanente.

---

## ⚡ Apps PM2 (Next.js)

| ID | Nombre   | Puerto | Restarts | Base de Datos     | Ruta                    |
|----|----------|--------|----------|-------------------|-------------------------|
| 0  | arai     | 3006   | 1        | arai-db (Docker)  | /root/arai/arai         |
| 1  | sgo      | ?      | 0        | sgo-db (5432)     | /root/sgo/...           |
| 2  | penalva  | ?      | 0        | ?                 | /root/penalva/...       |
| 3  | ferrer   | ?      | 0        | estudio_ferrer_db (5435) | /root/ferrer/...  |
| 4  | cravero  | ?      | 0        | cravero-db (5436) | /root/cravero/...       |

> Para ver puertos de cada app: `pm2 show <nombre> | grep -i port`

---

## 🌐 Dominios y Nginx

| Dominio               | App     | Puerto interno |
|-----------------------|---------|----------------|
| yerbamatearai.com.ar  | arai    | 3006           |
| (completar)           | sgo     | ?              |
| (completar)           | penalva | ?              |
| (completar)           | ferrer  | ?              |
| (completar)           | cravero | ?              |
| (completar)           | profly  | 3000/3001      |

---

## 🔌 Puertos en uso (resumen)

| Puerto | Servicio         |
|--------|------------------|
| 3000   | profly-api       |
| 3001   | profly-web       |
| 3006   | arai (Next.js)   |
| 5432   | sgo-db           |
| 5433   | libre (reservar para arai-db fix) |
| 5434   | libre            |
| 5435   | estudio_ferrer_db|
| 5436   | cravero-db       |
| 80/443 | Nginx            |

---

## 🧹 Tareas Pendientes

- [ ] Fix permanente de `arai-db` → mapear al puerto 5433 (ver guia_produccion.md)
- [ ] Eliminar contenedor muerto `arai-app`: `docker rm arai-app`
- [ ] Completar puertos y dominios de sgo, penalva, ferrer, cravero
- [ ] Vigilar disco — actualmente al 69%
- [ ] Agregar nueva app al servidor (en preparación)

---

## 🆕 Agregar una nueva app al servidor

1. Clonar el repo en `/root/<nombre>/<nombre>`
2. Crear `.env` con las variables necesarias
3. Crear base de datos Docker:
   ```bash
   docker run -d \
     --name <nombre>-db \
     -p <PUERTO_LIBRE>:5432 \
     -e POSTGRES_USER=<user> \
     -e POSTGRES_PASSWORD=<pass> \
     -e POSTGRES_DB=<dbname> \
     -v <nombre>_pgdata:/var/lib/postgresql/data \
     postgres:16-alpine
   ```
4. Buildear y registrar en PM2:
   ```bash
   cd /root/<nombre>/<nombre>
   npm install
   npx prisma db push
   npm run build
   PORT=<PUERTO_LIBRE> pm2 start npm --name "<nombre>" -- start
   pm2 save
   ```
5. Configurar Nginx para el dominio (copiar bloque de otro sitio y ajustar puerto)
6. Actualizar este documento con el nuevo dominio y puertos

---

*Facundo Arteaga Sola*
