-- ═══════════════════════════════════════════════════════════════════════
-- TELOCORP — MIGRACIÓN v4.1 (incremental)
-- Nuevas tablas: drivers, notifications, orders_history
-- Nuevas columnas: services_catalog (price_min, price_max)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- IDEMPOTENTE: seguro ejecutar múltiples veces
-- ═══════════════════════════════════════════════════════════════════════

-- ═══ PARTE 1: NUEVAS TABLAS ═══

-- Conductores (TeloLleva) — gestionables desde admin
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  vehicle TEXT DEFAULT 'motorcycle',  -- motorcycle | car | van
  rating NUMERIC DEFAULT 5,
  jobs_completed INTEGER DEFAULT 0,
  avatar TEXT DEFAULT '🏍️',
  status TEXT DEFAULT 'available',     -- available | busy | offline
  zone TEXT DEFAULT '',                -- zona de operación
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificaciones internas (registro de cada solicitud de servicio)
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,                  -- order | repara | instala | lleva
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',       -- pending | notified | resolved
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de cambios de órdenes (audit trail para mantener historial al modificar)
CREATE TABLE IF NOT EXISTS orders_history (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  action TEXT,                         -- created | modified | status_change
  changes JSONB DEFAULT '{}',
  admin_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ PARTE 2: NUEVAS COLUMNAS ═══

-- Rango de precios sugerido para servicios (TeloInstala / TeloRepara)
ALTER TABLE services_catalog ADD COLUMN IF NOT EXISTS price_min INTEGER DEFAULT 0;
ALTER TABLE services_catalog ADD COLUMN IF NOT EXISTS price_max INTEGER DEFAULT 0;

-- Columnas adicionales en orders para gestión completa
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT '';

-- ═══ PARTE 3: DATOS SEMILLA — CONDUCTORES DEMO ═══

INSERT INTO drivers (id, name, phone, vehicle, rating, jobs_completed, avatar, status, zone)
SELECT v.id, v."name", v."phone", v."vehicle", v."rating"::numeric, v."jobs"::int, v."avatar", v."status", v."zone"
FROM (VALUES
  ('drv-1'::text, 'José Martínez'::text, '+18095551001'::text, 'motorcycle'::text, '4.9'::text, '342'::text, '🏍️'::text, 'available'::text, 'Santo Domingo Norte'::text),
  ('drv-2'::text, 'Carlos Ramírez'::text, '+18095551002'::text, 'motorcycle'::text, '4.7'::text, '198'::text, '🏍️'::text, 'available'::text, 'Santo Domingo Este'::text),
  ('drv-3'::text, 'María Peña'::text, '+18095551003'::text, 'car'::text, '4.8'::text, '256'::text, '🚗'::text, 'available'::text, 'Distrito Nacional'::text),
  ('drv-4'::text, 'Luis Castro'::text, '+18095551004'::text, 'van'::text, '4.6'::text, '124'::text, '🚐'::text, 'available'::text, 'Santiago'::text)
) AS v(id, "name", "phone", "vehicle", "rating", "jobs", "avatar", "status", "zone")
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE id = v.id);

-- Rango de precios para servicios existentes (basado en el precio actual +/- 30%)
UPDATE services_catalog
SET price_min = GREATEST(100, ROUND("price" * 0.7)),
    price_max = ROUND("price" * 1.5)
WHERE price_min = 0 AND price_max = 0 AND price > 0;

-- ═══ PARTE 4: RLS PARA NUEVAS TABLAS ═══

-- drivers: público lee, admin gestiona
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "drivers_select_public" ON drivers;
DROP POLICY IF EXISTS "drivers_modify_admin" ON drivers;
CREATE POLICY "drivers_select_public" ON drivers FOR SELECT USING (true);
CREATE POLICY "drivers_modify_admin" ON drivers FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- notifications: clientes insertan, admin lee/gestiona
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_insert_public" ON notifications;
DROP POLICY IF EXISTS "notifications_all_admin" ON notifications;
CREATE POLICY "notifications_insert_public" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_all_admin" ON notifications FOR SELECT USING (is_admin()) WITH CHECK (is_admin());

-- orders_history: admin lee todo, cualquiera inserta (para auditoría automática)
ALTER TABLE orders_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_history_insert_public" ON orders_history;
DROP POLICY IF EXISTS "orders_history_select_admin" ON orders_history;
CREATE POLICY "orders_history_insert_public" ON orders_history FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_history_select_admin" ON orders_history FOR SELECT USING (is_admin());

-- ═══ PARTE 5: ÍNDICES ═══

CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_orders_history_order ON orders_history(order_id);

-- ═══ PARTE 6: TRIGGER updated_at para drivers ═══
DROP TRIGGER IF EXISTS trg_drivers_updated ON drivers;
-- drivers no tiene updated_at, lo agregamos
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE TRIGGER trg_drivers_updated BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══ FIN MIGRACIÓN v4.1 ═══
