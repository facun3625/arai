--
-- PostgreSQL database dump
--

\restrict EuKEwitdmKLi0rjxU9QxIganHpSQb5FalFhfAmVrEZGD7O2NUZRuib7OiZepl08

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AbandonedCart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AbandonedCart" (
    id text NOT NULL,
    "userId" text,
    "sessionId" text,
    email text,
    phone text,
    name text,
    items text DEFAULT '[]'::text NOT NULL,
    total double precision DEFAULT 0 NOT NULL,
    "lastActive" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AbandonedCart" OWNER TO postgres;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    street text NOT NULL,
    number text NOT NULL,
    apartment text,
    city text NOT NULL,
    province text NOT NULL,
    "zipCode" text NOT NULL,
    dni text,
    phone text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Address" OWNER TO postgres;

--
-- Name: Attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Attribute" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    terms text NOT NULL,
    "isAddon" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Attribute" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Coupon" (
    id text NOT NULL,
    code text NOT NULL,
    "discountType" text DEFAULT 'PERCENTAGE'::text NOT NULL,
    "discountValue" double precision NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "minPurchaseAmount" double precision,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Coupon" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text,
    status text DEFAULT 'PENDING'::text NOT NULL,
    total double precision NOT NULL,
    subtotal double precision NOT NULL,
    "shippingCost" double precision NOT NULL,
    discount double precision DEFAULT 0 NOT NULL,
    "couponCode" text,
    "paymentMethod" text NOT NULL,
    "paymentProof" text,
    "shippingAddress" text NOT NULL,
    "contactEmail" text NOT NULL,
    "contactName" text NOT NULL,
    "contactLastName" text NOT NULL,
    "contactPhone" text NOT NULL,
    "contactDni" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    name text NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    image text
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: PointReward; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PointReward" (
    id text NOT NULL,
    title text NOT NULL,
    "pointsRequired" integer NOT NULL,
    "discountValue" double precision NOT NULL,
    "discountType" text DEFAULT 'FIXED'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PointReward" OWNER TO postgres;

--
-- Name: PointTransaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PointTransaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    amount integer NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PointTransaction" OWNER TO postgres;

--
-- Name: Popup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Popup" (
    id text NOT NULL,
    location text NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "imageUrl" text NOT NULL,
    "displayFrequency" text DEFAULT 'SESSION'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Popup" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    type text DEFAULT 'SIMPLE'::text NOT NULL,
    "videoUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    price double precision DEFAULT 0 NOT NULL,
    "compareAtPrice" double precision,
    stock integer DEFAULT 0 NOT NULL,
    "featuredImage" text,
    images text DEFAULT '[]'::text NOT NULL,
    weight double precision,
    width double precision,
    height double precision,
    length double precision,
    addons text DEFAULT '[]'::text NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: StoreSettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StoreSettings" (
    id text DEFAULT 'global'::text NOT NULL,
    "freeShippingThreshold" double precision DEFAULT 0 NOT NULL,
    "bankTransferDiscount" double precision DEFAULT 15 NOT NULL,
    "pointsEnabled" boolean DEFAULT false NOT NULL,
    "pointsRatio" double precision DEFAULT 0.01 NOT NULL,
    "instagramUrl" text,
    "facebookUrl" text,
    "xUrl" text,
    "youtubeUrl" text,
    "tiktokUrl" text,
    "whatsappNumber" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "maintenanceMode" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."StoreSettings" OWNER TO postgres;

--
-- Name: Subscriber; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subscriber" (
    id text NOT NULL,
    email text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Subscriber" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    "lastName" text,
    email text NOT NULL,
    password text,
    role text DEFAULT 'USER'::text NOT NULL,
    dni text,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    points integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Variant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Variant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    price double precision DEFAULT 0 NOT NULL,
    "compareAtPrice" double precision,
    stock integer DEFAULT 0 NOT NULL,
    images text DEFAULT '[]'::text NOT NULL,
    weight double precision,
    width double precision,
    height double precision,
    length double precision,
    attributes text DEFAULT '{}'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Variant" OWNER TO postgres;

--
-- Name: _CategoryToProduct; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_CategoryToProduct" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_CategoryToProduct" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: AbandonedCart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AbandonedCart" (id, "userId", "sessionId", email, phone, name, items, total, "lastActive", "createdAt", "updatedAt") FROM stdin;
cmms97pmz00600x1tgu3zlx41	\N	jd0rxq1mloa3mrlh9d47hd	facuarteaga@hotmail.com	2345235423	facundo diaz	[{"id":"cmms7cbff00070x4clbwwe00j","name":"\\tMix Relajante","price":3200,"image":"/uploads/b5804a6c-87d1-46f2-b31e-05c7ffbb8b4e.png","addons":{},"quantity":3}]	9600	2026-03-15 21:16:15.616	2026-03-15 21:15:50.795	2026-03-15 21:16:15.618
cmms96y2f005s0x1t0d3e6ca1	cmms6ix1n00000xi0xs4hegc4	7wuv1xowqz35uh4wp2ts8f	SuperAdmin	\N	SuperAdmin	[]	0	2026-03-15 21:16:38.708	2026-03-15 21:15:15.064	2026-03-15 21:16:38.709
cmms8lwle004y0x1tymixztop	\N	h29vmbvsrft9cpaudfljwk	asdf@asdf.com	2345	federico duas	[]	0	2026-03-15 20:59:52.387	2026-03-15 20:58:53.379	2026-03-15 20:59:52.388
\.


--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Address" (id, "userId", street, number, apartment, city, province, "zipCode", dni, phone, "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Attribute; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Attribute" (id, name, slug, terms, "isAddon", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, description, image, "createdAt", "updatedAt") FROM stdin;
cmms6x9gj00010x4c54hs95fg	Yerba	yerba		/uploads/e6bf9d01-e9c7-4f21-bc80-94b61370b906.jpg	2026-03-15 20:11:44.036	2026-03-15 20:11:44.036
cmms6z0k700020x4cv1xqe19x	Hierbas	hierbas		/uploads/c7166427-ec8c-478f-8786-5828224d9b13.jpg	2026-03-15 20:13:05.814	2026-03-15 20:13:05.814
cmms71zwq00030x4cfzrn6l5z	Packs	packs		/uploads/8fd1adfb-f846-4978-be29-4af665e9b77c.png	2026-03-15 20:15:24.938	2026-03-15 20:15:24.938
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Coupon" (id, code, "discountType", "discountValue", "isActive", "minPurchaseAmount", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", status, total, subtotal, "shippingCost", discount, "couponCode", "paymentMethod", "paymentProof", "shippingAddress", "contactEmail", "contactName", "contactLastName", "contactPhone", "contactDni", "createdAt", "updatedAt") FROM stdin;
cmms8n4jz005i0x1tlunt22m6	\N	PAID	23360	21600	5000	3240	\N	transferencia	/uploads/135739cc-1d79-48bd-b363-cf773c21d2a9.png	{"street":"asdfasdf","number":"asfas","apartment":"","city":"cordoba","province":"Santa Fe","zipCode":"2345"}	asdf@asdf.com	federico	duas	2345	2345	2026-03-15 20:59:50.351	2026-03-15 21:06:23.594
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productId", "variantId", name, quantity, price, image) FROM stdin;
cmms8n4jz005j0x1tqgr38d4y	cmms8n4jz005i0x1tlunt22m6	cmms7flpv00090x4c0bgdztta	\N	Mix Anti Oxidante	1	3200	/uploads/424c5d42-b3ed-4fad-be93-7945a5069cb7.png
cmms8n4jz005k0x1th7x9dob6	cmms8n4jz005i0x1tlunt22m6	cmms7dh2o00080x4cjx9k3awb	\N	\tMix Anti Acidez	1	3200	/uploads/1cefc5ac-4dd6-487a-93dc-7e08329bc782.png
cmms8n4jz005l0x1tiqk2hgae	cmms8n4jz005i0x1tlunt22m6	cmms7cbff00070x4clbwwe00j	\N	\tMix Relajante	1	3200	/uploads/b5804a6c-87d1-46f2-b31e-05c7ffbb8b4e.png
cmms8n4jz005m0x1tsd0xcsq3	cmms8n4jz005i0x1tlunt22m6	cmms77mtc00040x4cxt5lx1ck	\N	\tAraí Suave	1	12000	/uploads/9d28e29f-1a38-4c8a-bb34-f4f9e0e28943.png
\.


--
-- Data for Name: PointReward; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PointReward" (id, title, "pointsRequired", "discountValue", "discountType", "isActive", "createdAt", "updatedAt") FROM stdin;
cmms85xso001c0x1tl5b5vv0x	cupon	10	10	PERCENTAGE	t	2026-03-15 20:46:28.44	2026-03-15 20:46:28.44
\.


--
-- Data for Name: PointTransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PointTransaction" (id, "userId", "orderId", amount, description, "createdAt") FROM stdin;
\.


--
-- Data for Name: Popup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Popup" (id, location, "isActive", "imageUrl", "displayFrequency", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, slug, description, type, "videoUrl", "createdAt", "updatedAt", price, "compareAtPrice", stock, "featuredImage", images, weight, width, height, length, addons) FROM stdin;
cmms77mtc00040x4cxt5lx1ck	\tAraí Suave	ara-suave		SIMPLE		2026-03-15 20:19:47.905	2026-03-15 20:19:47.905	12000	\N	100		["/uploads/9d28e29f-1a38-4c8a-bb34-f4f9e0e28943.png"]	\N	\N	\N	\N	[]
cmms78j9r00050x4czqk3wrz1	\tAraí 900 Días	ara-900-das		SIMPLE		2026-03-15 20:20:29.967	2026-03-15 20:20:29.967	12000	\N	100		["/uploads/36f3e399-4552-4fc5-b64b-9cd72dd916cd.png"]	\N	\N	\N	\N	[]
cmms79ugh00060x4cmbxuakw7	\tAraí Selección Especial	ara-seleccin-especial		SIMPLE		2026-03-15 20:21:31.121	2026-03-15 20:21:31.121	12000	\N	100		["/uploads/30fbd20c-cf51-441a-82a0-b6ac868164dd.png"]	\N	\N	\N	\N	[]
cmms7cbff00070x4clbwwe00j	\tMix Relajante	mix-relajante		SIMPLE		2026-03-15 20:23:26.427	2026-03-15 20:23:26.427	3200	\N	100		["/uploads/b5804a6c-87d1-46f2-b31e-05c7ffbb8b4e.png"]	\N	\N	\N	\N	[]
cmms7dh2o00080x4cjx9k3awb	\tMix Anti Acidez	mix-anti-acidez		SIMPLE		2026-03-15 20:24:20.4	2026-03-15 20:24:20.4	3200	\N	111		["/uploads/1cefc5ac-4dd6-487a-93dc-7e08329bc782.png"]	\N	\N	\N	\N	[]
cmms7flpv00090x4c0bgdztta	Mix Anti Oxidante	mix-anti-oxidante		SIMPLE		2026-03-15 20:25:59.731	2026-03-15 20:25:59.731	3200	3500	100		["/uploads/424c5d42-b3ed-4fad-be93-7945a5069cb7.png"]	\N	\N	\N	\N	[]
\.


--
-- Data for Name: StoreSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StoreSettings" (id, "freeShippingThreshold", "bankTransferDiscount", "pointsEnabled", "pointsRatio", "instagramUrl", "facebookUrl", "xUrl", "youtubeUrl", "tiktokUrl", "whatsappNumber", "updatedAt", "maintenanceMode") FROM stdin;
global	0	15	t	0.001							2026-03-17 10:49:42.384	f
\.


--
-- Data for Name: Subscriber; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscriber" (id, email, "isActive", "createdAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, "lastName", email, password, role, dni, phone, "createdAt", "updatedAt", points) FROM stdin;
cmms6ix1n00000xi0xs4hegc4	SuperAdmin	\N	SuperAdmin	$2b$10$1DTlqub069q5IWFPOBqZse7ESdOajHwlBpsWAOo7JJt.LSV5Tt/wa	ADMIN	\N	\N	2026-03-15 20:00:34.763	2026-03-15 20:00:34.763	0
cmmuftalv00000xwocbir5t2f	Test	Arai	test@test.com	$2b$10$13lus.NdIsbOLeHtzNP7Q.4ygWINgicYSklBuXaaUgv4AdvgjW20i	TEST	\N	\N	2026-03-17 09:56:07.794	2026-03-17 10:46:54.504	0
\.


--
-- Data for Name: Variant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Variant" (id, "productId", price, "compareAtPrice", stock, images, weight, width, height, length, attributes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _CategoryToProduct; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_CategoryToProduct" ("A", "B") FROM stdin;
cmms6x9gj00010x4c54hs95fg	cmms77mtc00040x4cxt5lx1ck
cmms6x9gj00010x4c54hs95fg	cmms78j9r00050x4czqk3wrz1
cmms6x9gj00010x4c54hs95fg	cmms79ugh00060x4cmbxuakw7
cmms6z0k700020x4cv1xqe19x	cmms7cbff00070x4clbwwe00j
cmms6z0k700020x4cv1xqe19x	cmms7dh2o00080x4cjx9k3awb
cmms6z0k700020x4cv1xqe19x	cmms7flpv00090x4c0bgdztta
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
00a3807f-d24d-49da-a482-a1495139cc6a	93c26628c3fee637b34e13d7808a6a04cbb97b48b8072d943d191655d481273c	2026-03-15 20:00:16.116987+00	20260315200016_init_postgresql	\N	\N	2026-03-15 20:00:16.108005+00	1
\.


--
-- Name: AbandonedCart AbandonedCart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AbandonedCart"
    ADD CONSTRAINT "AbandonedCart_pkey" PRIMARY KEY (id);


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: Attribute Attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attribute"
    ADD CONSTRAINT "Attribute_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PointReward PointReward_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PointReward"
    ADD CONSTRAINT "PointReward_pkey" PRIMARY KEY (id);


--
-- Name: PointTransaction PointTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PointTransaction"
    ADD CONSTRAINT "PointTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Popup Popup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Popup"
    ADD CONSTRAINT "Popup_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: StoreSettings StoreSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StoreSettings"
    ADD CONSTRAINT "StoreSettings_pkey" PRIMARY KEY (id);


--
-- Name: Subscriber Subscriber_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscriber"
    ADD CONSTRAINT "Subscriber_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Variant Variant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Variant"
    ADD CONSTRAINT "Variant_pkey" PRIMARY KEY (id);


--
-- Name: _CategoryToProduct _CategoryToProduct_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CategoryToProduct"
    ADD CONSTRAINT "_CategoryToProduct_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AbandonedCart_lastActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AbandonedCart_lastActive_idx" ON public."AbandonedCart" USING btree ("lastActive");


--
-- Name: AbandonedCart_sessionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AbandonedCart_sessionId_key" ON public."AbandonedCart" USING btree ("sessionId");


--
-- Name: Attribute_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Attribute_slug_key" ON public."Attribute" USING btree (slug);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: Popup_location_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Popup_location_key" ON public."Popup" USING btree (location);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: Subscriber_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Subscriber_email_key" ON public."Subscriber" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _CategoryToProduct_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_CategoryToProduct_B_index" ON public."_CategoryToProduct" USING btree ("B");


--
-- Name: AbandonedCart AbandonedCart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AbandonedCart"
    ADD CONSTRAINT "AbandonedCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Coupon Coupon_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PointTransaction PointTransaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PointTransaction"
    ADD CONSTRAINT "PointTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Variant Variant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Variant"
    ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _CategoryToProduct _CategoryToProduct_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CategoryToProduct"
    ADD CONSTRAINT "_CategoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _CategoryToProduct _CategoryToProduct_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CategoryToProduct"
    ADD CONSTRAINT "_CategoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict EuKEwitdmKLi0rjxU9QxIganHpSQb5FalFhfAmVrEZGD7O2NUZRuib7OiZepl08

