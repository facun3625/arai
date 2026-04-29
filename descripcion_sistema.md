# Descripción Completa del Sistema — Araí Yerba Mate
### Plataforma de E-commerce a Medida

---

## RESUMEN EJECUTIVO

Araí Yerba Mate opera sobre una plataforma de comercio electrónico desarrollada completamente a medida, sin depender de soluciones genéricas como Shopify, WooCommerce o similares. Esto implica que cada funcionalidad fue diseñada, programada y adaptada específicamente al negocio. La plataforma cubre el ciclo completo: desde la presentación de productos hasta la gestión de pagos, envíos, clientes y análisis de datos.

---

## TECNOLOGÍA BASE

| Capa | Tecnología |
|---|---|
| Framework Web | Next.js 16 (React 19) |
| Base de Datos | PostgreSQL |
| ORM | Prisma |
| Autenticación | NextAuth.js |
| Estado global | Zustand |
| Estilos | Tailwind CSS 4 |
| Animaciones | Framer Motion |
| Email | React Email + Resend |
| Inteligencia Artificial | Groq SDK |
| Servidor | Node.js / PM2 |

---

## 1. SITIO WEB PÚBLICO

### 1.1 Página de Inicio (Home)

La página principal está construida para generar conversión desde el primer momento. Incluye:

- **Hero interactivo de 4 columnas** — Panel visual con accesos directos a las categorías principales: Arma tu blend, Yerba Mate, Hierbas, Accesorios. Cada columna tiene imagen de fondo, animación al hover y botón de acción. Las imágenes de cada columna son configurables desde el admin (Ajustes → Imágenes del Hero).
- **Banner de productos** — Imagen centrada con ancho máximo debajo del hero, configurable.
- **Sección "Nuestras Líneas"** — Grilla de banners de categorías con imágenes propias, nombre y link directo al catálogo filtrado por esa categoría.
- **Sección "Favoritos de la comunidad"** — Carrusel horizontal de productos más vendidos, con imagen, precio, descuento si aplica y botón de compra rápida.
- **Banda de beneficios** — Strip informativo con iconos: Envío Nacional, Pago Seguro, Calidad Certificada.
- **Suscripción a Newsletter** — Formulario de captura de email con validación y confirmación visual.
- **Pop-ups configurables** — El administrador puede activar pop-ups con imagen personalizada según la sección del sitio donde se muestra el usuario (home, tienda, producto, etc).

---

### 1.2 Tienda / Catálogo

Página de listado de todos los productos disponibles.

- **Filtro por categorías** — Sidebar izquierdo con todas las categorías activas y su conteo de productos. El filtro se sincroniza con la URL (`?categoria=yerba`) para que los links externos lleven directo a la categoría correcta. Las subcategorías aparecen anidadas bajo su categoría padre; seleccionar el padre muestra sus productos más los de todas sus subcategorías.
- **Grilla de productos** — Vista responsiva de 2 a 4 columnas según el dispositivo. Cada tarjeta muestra imagen, nombre, precio, precio tachado si hay descuento, y porcentaje de ahorro.
- **Ordenamiento** — Por productos destacados, precio menor a mayor, precio mayor a menor.
- **Acceso rápido** — Desde la home, cada banner de categoría redirige directo al catálogo ya filtrado.

---

### 1.3 Página de Producto

Página de detalle de cada producto.

- **Galería de imágenes** — Imagen principal destacada con miniaturas secundarias seleccionables.
- **Productos simples y con variantes** — El sistema soporta dos tipos de productos:
  - *Simple*: precio y stock únicos.
  - *Variable*: múltiples variantes con precio, stock e imágenes propios (ej: distintos tamaños, cortes o presentaciones).
- **Selector de variantes** — Botones o dropdowns dinámicos para elegir atributos (ej: tamaño, tipo). El precio y stock se actualizan en tiempo real al seleccionar.
- **Add-ons** — Opciones adicionales seleccionables (ej: accesorios opcionales que se suman al pedido).
- **Control de cantidad** — Botones + y - con validación de stock disponible.
- **Video** — Si el producto tiene video asociado, se muestra integrado en la página.
- **Botón "Agregar al carrito"** — Añade el producto con la variante y opciones seleccionadas.

---

### 1.4 Carrito de Compras

El carrito es persistente (se guarda entre sesiones) y está disponible desde cualquier página.

- **Drawer lateral** — Se abre desde el ícono del header sin salir de la página actual.
- **Listado de items** — Con imagen, nombre, variante elegida, precio unitario y cantidad modificable.
- **Eliminar items** — Botón para quitar productos individualmente o vaciar todo.
- **Progreso de envío gratis** — Barra visual que indica cuánto falta para alcanzar el umbral de envío gratis.
- **Resumen** — Subtotal actualizado en tiempo real.
- **Botón de checkout** — Redirige al proceso de compra.

---

### 1.5 Checkout (Proceso de Compra en 3 Pasos)

El checkout guía al cliente paso a paso de forma clara.

#### Paso 1: Información de Contacto y Dirección

- Campos: email, nombre, apellido, teléfono, DNI/CUIT.
- Dirección completa: calle, número, piso/dpto, código postal, ciudad, provincia.
- Si el usuario tiene cuenta, sus direcciones guardadas aparecen para pre-completar el formulario con un click.
- Opción de guardar la dirección para compras futuras.
- Campo de cupón de descuento con validación en tiempo real.
- Validación de zonas restringidas: si el código postal tiene restricción de venta o envío, el sistema avisa y muestra el mensaje correspondiente (por ejemplo, datos de la sucursal física alternativa).

#### Paso 2: Método de Envío

- **Cálculo automático con OCA** — El sistema consulta en tiempo real el costo de envío a domicilio y a sucursal OCA según el código postal del cliente.
- **Retiro en sucursal OCA** — Listado de sucursales disponibles según el CP, con nombre y dirección.
- **Envío gratis** — Se aplica automáticamente si el total supera el umbral configurado en el admin.
- **Envío a acordar** — Opción para casos especiales o zonas no cubiertas.
- **Cadetería local** — Para zonas con restricción de shipping pero no de venta.
- Estimación de días de entrega según OCA.

#### Paso 3: Método de Pago

- **Transferencia Bancaria** — Muestra CBU y Alias configurados en el admin. Aplica descuento porcentual configurable (ej: 15% OFF). Permite upload opcional del comprobante.
- **MercadoPago** — Redirige al checkout de MercadoPago. Acepta tarjetas de crédito, débito, dinero en cuenta. Retorna con confirmación de pago.
- **PayPal** — Redirige al checkout de PayPal. Ideal para pagos internacionales.
- **Modo** — Billetera digital. Abre un modal con QR para escanear desde la app.
- **Nave de Galicia** — Redirige al checkout de Nave para pagar con cuenta bancaria Galicia.

---

### 1.6 Confirmación y Estados de Pago

- `/checkout/success` — Confirmación exitosa. Muestra resumen de la orden.
- `/checkout/pending` — Pago en proceso (transferencia, MercadoPago pendiente).
- `/checkout/failure` — Error en el pago con opción de reintentar.

Independientemente del resultado, se genera la orden en la base de datos y se envía un email de confirmación automático al cliente.

---

### 1.7 Área "Mi Cuenta" (Clientes Registrados)

Sección privada accesible solo con login.

- **Dashboard personal** — Vista con resumen de pedidos recientes y accesos rápidos.
- **Mis Pedidos** — Historial completo de órdenes con estado en tiempo real (Pendiente, En Proceso, Enviado, Entregado, Cancelado).
- **Detalle de Pedido** — Items comprados, dirección de entrega, método de pago, número de seguimiento OCA si aplica.
- **Mi Perfil** — Edición de datos personales: nombre, apellido, email, teléfono, DNI. Cambio de contraseña.
- **Mis Direcciones** — Guardar, editar y eliminar múltiples direcciones. Marcar una como predeterminada para el checkout.
- **Mis Cupones** — Ver cupones disponibles, historial de uso y canje de puntos por cupones.
- **Mis Puntos** — Saldo actual, historial de transacciones, y recompensas disponibles para canjear.

---

### 1.8 Otras Páginas

- **Videos** — Galería de videos de productos o contenido de marca.
- **Proceso Productivo** — Página informativa sobre el proceso de la yerba mate.

---

## 2. SISTEMA DE ADMINISTRACIÓN (Panel Admin)

Accesible desde `/admin`. Solo usuarios con rol ADMIN.

---

### 2.1 Dashboard Principal

Vista general del negocio en tiempo real:

- Ventas totales del período y tendencia comparativa.
- Cantidad de productos activos.
- Usuarios nuevos registrados.
- Tasa de conversión (visitantes vs compradores).
- Últimas órdenes recientes.
- Carritos abandonados activos.
- Distribución de órdenes por estado.

---

### 2.2 Gestión de Productos

CRUD completo de catálogo.

**Listado:**
- Tabla con todos los productos: nombre, categoría, precio, stock, tipo, estado.
- Búsqueda por nombre.
- Filtros por categoría.

**Crear / Editar Producto:**
- Nombre, slug (URL amigable), descripción.
- Tipo: Simple (precio único) o Variable (con variantes).
- Precio base y precio de comparación (para mostrar descuento tachado).
- Stock.
- Imagen destacada + galería de imágenes (múltiples).
- Dimensiones para cálculo de envío: peso, ancho, alto, largo.
- Asignación a una o múltiples categorías.
- Atributos y variantes (en productos variables).
- Add-ons disponibles.
- URL de video opcional.

**Variantes:**
- Por cada combinación de atributos (ej: Barbacuá 500g, Barbacuá 1kg), el admin define:
  - Precio propio.
  - Precio de comparación.
  - Stock propio.
  - Imágenes propias.
  - Dimensiones propias para envío.

---

### 2.3 Gestión de Categorías

- Crear, editar y eliminar categorías.
- Nombre, slug, descripción, imagen.
- **Subcategorías** — Cada categoría puede tener una categoría padre (un solo nivel de jerarquía). En el admin se selecciona la categoría padre desde un dropdown; solo las categorías raíz pueden ser padres (no hay abuelos). La tabla muestra las subcategorías indentadas debajo de su padre con un indicador visual.
- En la tienda, el sidebar muestra las categorías con sus subcategorías anidadas. Al clickear una categoría padre, se muestran los productos de esa categoría **más los de todas sus subcategorías**. Al clickear una subcategoría, se muestran solo sus productos.
- Las categorías (y subcategorías) sin productos no aparecen en el filtro de la tienda.

---

### 2.4 Gestión de Atributos

- Crear atributos como "Tamaño", "Tipo", "Presentación".
- Definir los términos (valores) de cada atributo: 500g, 1kg, Barbacuá, etc.
- Marcar un atributo como add-on (para opciones adicionales al producto).

---

### 2.5 Gestión de Pedidos

Vista y gestión completa de todas las órdenes.

- Listado con: ID de orden, cliente, fecha, estado, método de pago, total.
- Filtro por estado: Pendiente, Pagado, En Proceso, Enviado, Completado, Cancelado.
- Búsqueda por nombre de cliente o ID.

**Detalle de Orden:**
- Número de pedido secuencial con formato `#0001`, `#0009`, etc.
- Items comprados con nombre, cantidad, precio.
- Subtotal, costo de envío, descuento aplicado (con código de cupón si usó uno), total.
- Datos de contacto del cliente: dirección, DNI, teléfono y **email**.
- Método de pago y estado.
- Comprobante de transferencia (si subió).
- Sección OCA e-Pak (si el método de envío es OCA): muestra número de OR, botón para descargar el rótulo en PDF y botón "Registrar en OCA" para generar la etiqueta si aún no fue registrada.

**Acciones:**
- Cambiar estado de la orden.
- Registrar envío en OCA y descargar rótulo PDF directamente desde el panel.
- Eliminar orden.
- Enviar email de actualización al cliente.

---

### 2.6 Gestión de Usuarios

- Listado completo de usuarios registrados.
- Información: nombre, email, rol, fecha de registro.
- Búsqueda por nombre o email.
- Cambiar contraseña de usuario.
- Eliminar usuario.

---

### 2.7 Marketing

#### Cupones de Descuento
- Crear cupones con código personalizado.
- Tipo: porcentaje (%) o monto fijo ($).
- Monto mínimo de compra para activarse.
- Asignar a un usuario específico o dejar público.
- Fecha de vencimiento opcional (`expiresAt`).
- Límite de usos total (`usageLimit`) y por usuario (`usageLimitPerUser`).
- Contador de usos actual (`usageCount`) visible en el admin.
- Activar/desactivar sin eliminar.

#### Pop-ups
- Crear pop-ups con imagen personalizada.
- Definir en qué sección del sitio se muestra (Home, Tienda, Producto, etc).
- Frecuencia: siempre, una vez por sesión, una sola vez.
- Activar/desactivar.

#### Recompensas (Sistema de Puntos)
- Crear recompensas que los clientes pueden canjear con sus puntos acumulados.
- Definir cuántos puntos se requieren.
- Tipo de descuento: porcentaje o monto fijo.

#### Campañas de Email
- Crear campañas de email marketing.
- Seleccionar audiencia: todos, solo suscriptores, solo clientes, etc.
- Definir asunto, contenido y botón de llamado a la acción.
- Envío masivo con un click.
- Historial de campañas enviadas con conteo de destinatarios.
- Estadísticas de audiencia: suscriptores activos, clientes únicos.

#### Suscriptores Newsletter
- Listado de todos los emails suscriptos.
- Exportar lista en CSV.
- Estado activo/inactivo.

---

### 2.8 Carritos Abandonados

- Listado de usuarios (registrados o anónimos) que iniciaron el checkout pero no completaron la compra.
- Información disponible: nombre, email, teléfono (si llenaron el paso 1), items en el carrito, total, última actividad.
- Permite recuperar clientes contactándolos directamente.
- Eliminar registros obsoletos.

---

### 2.9 Estadísticas

- Gráficos de ventas por período.
- Productos más vendidos.
- Análisis comparativo de períodos.
- Distribución de métodos de pago.

---

### 2.10 Configuración — Pagos

Panel unificado para configurar todos los métodos de pago:

| Método | Campos Configurables |
|---|---|
| Transferencia Bancaria | CBU, Alias, Descuento (%) |
| MercadoPago | Public Key, Access Token, Habilitado |
| PayPal | Client ID, Secret, Modo (sandbox/prod), Habilitado |
| Modo | Public Key, Private Key, Merchant ID, Modo, Habilitado |
| Nave de Galicia | Client ID, Client Secret, POS ID, Modo (sandbox/prod), Habilitado |

Cada método tiene un toggle de habilitación/deshabilitación sin necesidad de borrar las credenciales.

---

### 2.11 Configuración — Envíos

- Umbral de envío gratis (monto mínimo de compra).
- **OCA e-Pak** — Configuración completa para generar rótulos desde el admin:
  - Usuario y contraseña de e-Pak (`ocaUser`, `ocaPassword`)
  - Número de cuenta OCA (formato `XXXXXX/000`)
  - CUIT del comercio con guiones (requerido para obtener el centro de costo)
  - ID de operativa a domicilio e ID de operativa a sucursal (pueden ser distintas)
  - Dirección de origen del remitente: calle, número, piso, localidad, provincia, CP
  - Contacto y email del remitente para la orden de retiro
  - Franja horaria de retiro (1 = 8-17, 2 = 8-12, 3 = 14-17)
- DHL: Account Number, API Key, Site ID (preparado para integración futura).

---

### 2.12 Configuración — Zonas Restringidas

Sistema de restricciones por código postal:

- **BLOCK_SALE**: No permite completar la venta en esa zona. Muestra mensaje personalizado con alternativas (ej: dirección y teléfono de punto de venta físico).
- **BLOCK_SHIPPING**: Permite la venta pero no el envío estándar. Redirige a opciones de cadetería o envío a acordar.

---

### 2.13 Configuración — Plataformas / Redes Sociales

- URLs de Instagram, Facebook, X (Twitter), YouTube, TikTok.
- Número de WhatsApp (para botón flotante).
- **Botones del Header** — URLs para los botones "Franquicias" y "Mayoristas" que aparecen en la barra superior del sitio. Se abren en ventana nueva. Si no tienen URL configurada, los botones no se muestran.
- Modo Mantenimiento: bloquea el acceso al sitio público mientras se realizan cambios, sin afectar el panel admin.

---

### 2.14 Configuración — Analytics

- Google Analytics 4: Measurement ID.
- Meta Pixel (Facebook): Pixel ID.
- Ambos se inyectan automáticamente en el sitio cuando están configurados.

---

### 2.15 Base de Conocimiento (Chat IA)

- CRUD de documentos de conocimiento.
- El contenido de estos documentos alimenta al asistente de chat con IA.
- Permite mantener actualizado el contexto del chat sin modificar código.

---

## 3. INTEGRACIONES EXTERNAS

### 3.1 Pagos

| Plataforma | Modalidad | Mercado |
|---|---|---|
| MercadoPago | Redirección al checkout + webhook | Argentina |
| PayPal | Redirección al checkout | Internacional |
| Modo | SDK modal con QR | Argentina |
| Nave de Galicia | Redirección al checkout + webhook | Argentina (Banco Galicia) |
| Transferencia bancaria | Manual con upload de comprobante | Argentina |

Todos los webhooks están implementados: cuando el pago es confirmado por la plataforma, el sistema actualiza automáticamente el estado de la orden y puede enviar el email correspondiente.

---

### 3.2 Envíos — OCA

- Cotización en tiempo real del costo de envío a domicilio y a sucursal.
- Listado de sucursales cercanas al CP del cliente.
- Tracking de órdenes.
- Integración completa en el paso 2 del checkout.
- **Generación de rótulos desde el panel admin**: con un click el admin registra el envío en OCA (`IngresoORMultiplesRetiros`) y obtiene el número de OR. El rótulo PDF se descarga directamente desde el detalle del pedido (`GetPdfDeEtiquetasPorOrdenOrNumeroEnvio`). El número de OR queda guardado en el pedido.

---

### 3.3 Email Transaccional — Resend

Emails automáticos que se envían sin intervención manual:

- **Confirmación de orden** — Al completar la compra, el cliente recibe un email con resumen: items, total, dirección, método de pago.
- **Actualización de estado** — Cuando el admin cambia el estado de la orden (ej: "Tu pedido fue enviado"), el cliente recibe un email automático.
- **Campañas masivas** — El admin puede enviar emails de marketing a toda la base de clientes o segmentos específicos.

Los templates son diseñados en código (React Email) para ser visualmente consistentes con la marca.

---

### 3.4 Chat con Inteligencia Artificial

- Botón flotante en el sitio que abre un chat.
- El asistente se llama "Araí" y sigue un flujo de ventas consultivo: primero indaga la problemática del cliente, luego recomienda, muestra presentaciones disponibles antes del precio, incluye link directo al producto y, tras 3 intercambios, sugiere continuar por WhatsApp.
- Los links a productos dentro del chat son clickeables (se renderizan como "Ver producto →").
- Potenciado por Groq (modelo llama-3.3-70b-versatile, alta velocidad).
- El contenido del chat es completamente actualizable desde el panel admin (Base de Conocimiento) sin tocar código.

### 3.5 Botón flotante de WhatsApp

- Botón verde fijo en la esquina inferior derecha del sitio.
- Ícono SVG oficial de WhatsApp.
- El número se configura desde Admin → Redes Sociales. Si no hay número configurado, usa un número por defecto.

---

### 3.6 Analytics

- **Google Analytics 4** — Tracking de páginas vistas, eventos de e-commerce (add to cart, purchase, etc).
- **Meta Pixel** — Conversiones y eventos para campañas de Facebook/Instagram Ads.
- Ambos se configuran con un ID desde el panel admin. Si están vacíos, no se cargan (no afectan performance).

---

## 4. SISTEMA DE PUNTOS Y FIDELIZACIÓN

- Cada compra completada suma puntos al cliente según un ratio configurable (ej: $1 = 1 punto).
- El cliente puede ver su saldo y el historial de transacciones en "Mi Cuenta > Mis Puntos".
- El admin define "Recompensas": cuántos puntos se necesitan para canjear un descuento.
- Al canjear, el sistema genera un cupón de descuento único y lo asigna al cliente.
- El saldo se descuenta automáticamente.

---

## 5. AUTENTICACIÓN Y CUENTAS DE USUARIO

- Registro con email y contraseña.
- Login persistente (la sesión se mantiene entre visitas).
- Hash seguro de contraseñas (bcrypt).
- Roles: ADMIN y USER.
- Si el usuario no está registrado puede comprar igual (checkout como invitado).
- Si está registrado, sus datos y direcciones se pre-completan en el checkout.

---

## 6. MODELO DE DATOS — BASE DE DATOS

La base de datos PostgreSQL tiene los siguientes modelos principales:

| Modelo | Descripción |
|---|---|
| User | Clientes y administradores |
| Product | Catálogo de productos |
| Variant | Variantes de un producto (precio/stock/atributos propios) |
| Category | Categorías del catálogo (con soporte de subcategorías via parentId) |
| Attribute | Atributos (Tamaño, Tipo, etc) y sus valores |
| Address | Direcciones guardadas por usuario |
| Order | Órdenes de compra |
| OrderItem | Items dentro de una orden |
| Coupon | Cupones de descuento |
| StoreSettings | Configuración global del sistema |
| Popup | Pop-ups configurables |
| PointReward | Recompensas del sistema de puntos |
| PointTransaction | Historial de movimientos de puntos |
| Subscriber | Suscriptores al newsletter |
| AbandonedCart | Carritos no completados |
| SentCampaign | Historial de campañas de email |
| ZipCodeRestriction | Restricciones por código postal |
| KnowledgeDocument | Documentos para el chat IA |

---

## 7. RESUMEN CUANTITATIVO

| Categoría | Cantidad |
|---|---|
| Páginas públicas | 18 páginas |
| Secciones del panel admin | 12 secciones principales |
| Endpoints de API | 50+ endpoints |
| Integraciones de pago | 5 plataformas |
| Modelos de base de datos | 18 modelos |
| Integraciones de envío | OCA (implementado), DHL (preparado) |
| Integraciones de analytics | Google Analytics 4 + Meta Pixel |
| Secciones "Mi Cuenta" | 6 subsecciones |
| Templates de email | 3 templates |

---

## 8. CARACTERÍSTICAS DIFERENCIALES

- **Desarrollo 100% a medida** — No depende de plataformas de terceros como Shopify o WooCommerce. El código pertenece al negocio.
- **Sin comisiones por venta** — A diferencia de plataformas SaaS, no hay porcentaje retenido por el sistema.
- **Configuración total desde el admin** — Precios, envíos, pagos, descuentos, analytics, textos, pop-ups y más; todo sin tocar código.
- **Multi-método de pago** — 5 métodos de cobro distintos, todos configurables y habilitables/deshabilitables individualmente.
- **Soporte completo para productos variables** — Variantes con precio, stock e imágenes propias, indistinguibles de un producto simple para el cliente.
- **Sistema de fidelización integrado** — Puntos, recompensas y cupones gestionados en el mismo sistema.
- **Marketing incluido** — Campañas de email, pop-ups y newsletter en el mismo panel, sin herramienta externa.
- **Chat con IA** — Asistente virtual con base de conocimiento actualizable desde el admin.
- **Carritos abandonados** — Recuperación activa de clientes que no completaron la compra.
- **Restricciones geográficas** — Control granular de zonas de venta y envío por código postal.
- **Modo mantenimiento** — Permite pausar el sitio sin perder configuración ni datos.
