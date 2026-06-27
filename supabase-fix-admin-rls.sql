-- ═══════════════════════════════════════════════════════════════════════
-- TELOCORP — FIX / VERIFICACIÓN RLS ADMIN (órdenes y servicios)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query → Run
-- IDEMPOTENTE: seguro ejecutar múltiples veces.
--
-- ¿Cuándo usar este script?
--   Si en el panel admin el cambio de estado de una orden "no se guarda"
--   (vuelve al estado anterior al refrescar). Causa típica: faltan las
--   policies de UPDATE o la función is_admin() (migración v4 no aplicada).
-- ═══════════════════════════════════════════════════════════════════════

-- ═══ 1) Función is_admin() ═══
-- Devuelve TRUE si el usuario autenticado tiene email @telocg.com o role=admin.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND (email LIKE '%@telocg.com' OR raw_user_meta_data->>'role' = 'admin')
  );
$$;

-- ═══ 2) Policies de ORDERS (insert público, lectura, update/delete admin) ═══
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_read_admin" ON orders;
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
DROP POLICY IF EXISTS "orders_delete_admin" ON orders;
CREATE POLICY "orders_insert_public" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_read_admin"   ON orders FOR SELECT USING (true);
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "orders_delete_admin" ON orders FOR DELETE USING (is_admin());

-- ═══ 3) Policies de tablas transaccionales (repara / instala / lleva) ═══
ALTER TABLE repara_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage repara" ON repara_bookings;
DROP POLICY IF EXISTS "repara_insert_public" ON repara_bookings;
DROP POLICY IF EXISTS "repara_select_admin" ON repara_bookings;
DROP POLICY IF EXISTS "repara_update_admin" ON repara_bookings;
DROP POLICY IF EXISTS "repara_delete_admin" ON repara_bookings;
CREATE POLICY "repara_insert_public" ON repara_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "repara_select_admin" ON repara_bookings FOR SELECT USING (true);
CREATE POLICY "repara_update_admin" ON repara_bookings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "repara_delete_admin" ON repara_bookings FOR DELETE USING (is_admin());

ALTER TABLE instala_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage instala" ON instala_bookings;
DROP POLICY IF EXISTS "instala_insert_public" ON instala_bookings;
DROP POLICY IF EXISTS "instala_select_admin" ON instala_bookings;
DROP POLICY IF EXISTS "instala_update_admin" ON instala_bookings;
DROP POLICY IF EXISTS "instala_delete_admin" ON instala_bookings;
CREATE POLICY "instala_insert_public" ON instala_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "instala_select_admin" ON instala_bookings FOR SELECT USING (true);
CREATE POLICY "instala_update_admin" ON instala_bookings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "instala_delete_admin" ON instala_bookings FOR DELETE USING (is_admin());

ALTER TABLE lleva_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage lleva" ON lleva_requests;
DROP POLICY IF EXISTS "lleva_insert_public" ON lleva_requests;
DROP POLICY IF EXISTS "lleva_select_admin" ON lleva_requests;
DROP POLICY IF EXISTS "lleva_update_admin" ON lleva_requests;
DROP POLICY IF EXISTS "lleva_delete_admin" ON lleva_requests;
CREATE POLICY "lleva_insert_public" ON lleva_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "lleva_select_admin" ON lleva_requests FOR SELECT USING (true);
CREATE POLICY "lleva_update_admin" ON lleva_requests FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "lleva_delete_admin" ON lleva_requests FOR DELETE USING (is_admin());

-- ═══ 4) orders_history: cualquiera inserta, admin lee ═══
CREATE TABLE IF NOT EXISTS orders_history (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  action TEXT,
  changes JSONB DEFAULT '{}',
  admin_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_history_insert_public" ON orders_history;
DROP POLICY IF EXISTS "orders_history_select_admin" ON orders_history;
CREATE POLICY "orders_history_insert_public" ON orders_history FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_history_select_admin" ON orders_history FOR SELECT USING (is_admin());

-- ═══ 5) VERIFICACIÓN ═══
-- Listar policies de orders (debe incluir orders_update_admin):
--   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'orders';
-- Confirmar que tu usuario es admin (ejecutar AUTENTICADO desde la app, no aquí):
--   SELECT is_admin();
-- Ver usuarios admin existentes:
--   SELECT email FROM auth.users WHERE email LIKE '%@telocg.com';

-- ═══════════════════════════════════════════════════════════════════════
-- IMPORTANTE: El usuario admin DEBE tener email terminado en @telocg.com
-- (o raw_user_meta_data->>'role' = 'admin'). Si tu cuenta admin usa otro
-- dominio (gmail, etc.), is_admin() devolverá FALSE y NINGÚN cambio de
-- estado funcionará. Crea el usuario admin@telocg.com en:
--   Dashboard → Authentication → Users → Add user (marcar Auto Confirm)
-- ═══════════════════════════════════════════════════════════════════════
