-- TELOCORP FIX RLS ADMIN
-- Ejecutar en Supabase Dashboard SQL Editor

-- 1) Funcion is_admin()
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

-- 2) Policies ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_read_admin" ON orders;
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
DROP POLICY IF EXISTS "orders_delete_admin" ON orders;
CREATE POLICY "orders_insert_public" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_read_admin" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "orders_delete_admin" ON orders FOR DELETE USING (is_admin());

-- 3) Policies REPARA
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

-- 4) Policies INSTALA
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

-- 5) Policies LLEVA
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

-- 6) orders_history
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
