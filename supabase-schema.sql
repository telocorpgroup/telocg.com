-- ═══════════════════════════════════════════════════════════
-- TeloSales — Schema para Supabase (v3 - con migraciones)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- ═══ MIGRACIÓN: Agregar columnas faltantes a tabla products ═══
-- (Ejecuta esto PRIMERO si ya tenías la tabla creada)
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS video TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- ═══ TABLAS (CREATE IF NOT EXISTS — seguro ejecutar múltiples veces) ═══

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tech',
  price NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sold INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 5,
  description TEXT,
  image TEXT,
  images JSONB DEFAULT '[]',
  video TEXT DEFAULT '',
  specs JSONB DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items JSONB NOT NULL,
  subtotal NUMERIC,
  discount NUMERIC DEFAULT 0,
  shipping NUMERIC DEFAULT 0,
  coupon TEXT,
  total NUMERIC NOT NULL,
  customer JSONB,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reparaciones
CREATE TABLE IF NOT EXISTS repara_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device TEXT,
  issue TEXT,
  brand TEXT,
  description TEXT,
  address TEXT,
  contact TEXT,
  customer JSONB,
  status TEXT DEFAULT 'pending',
  ticket TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de instalaciones
CREATE TABLE IF NOT EXISTS instala_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT,
  date TEXT,
  time TEXT,
  address TEXT,
  notes TEXT,
  tech TEXT,
  price NUMERIC,
  customer JSONB,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de envíos
CREATE TABLE IF NOT EXISTS lleva_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT,
  dest TEXT,
  item TEXT,
  details TEXT,
  vehicle TEXT,
  fare NUMERIC,
  schedule TEXT,
  customer JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de progreso educativo
CREATE TABLE IF NOT EXISTS educa_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course TEXT,
  lesson INTEGER,
  completed BOOLEAN DEFAULT true,
  student TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de certificados
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course TEXT,
  student TEXT,
  score INTEGER,
  cert_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  department TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ RLS (Drop existing policies first to avoid conflicts) ═══

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are editable by authenticated" ON products;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are editable by authenticated" ON products FOR ALL USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT USING (true);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage customers" ON customers;
CREATE POLICY "Anyone can manage customers" ON customers FOR ALL USING (true);

ALTER TABLE repara_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage repara" ON repara_bookings;
CREATE POLICY "Anyone can manage repara" ON repara_bookings FOR ALL USING (true);

ALTER TABLE instala_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage instala" ON instala_bookings;
CREATE POLICY "Anyone can manage instala" ON instala_bookings FOR ALL USING (true);

ALTER TABLE lleva_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage lleva" ON lleva_requests;
CREATE POLICY "Anyone can manage lleva" ON lleva_requests FOR ALL USING (true);

ALTER TABLE educa_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage educa" ON educa_progress;
CREATE POLICY "Anyone can manage educa" ON educa_progress FOR ALL USING (true);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage certs" ON certificates;
CREATE POLICY "Anyone can manage certs" ON certificates FOR ALL USING (true);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage leads" ON leads;
CREATE POLICY "Anyone can manage leads" ON leads FOR ALL USING (true);
