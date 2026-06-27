-- ═══════════════════════════════════════════════════════════════════════
-- TELOCORP — MIGRACIÓN v4.2 (configuración avanzada)
-- Nuevas columnas en site_settings para herramientas configurables
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- IDEMPOTENTE: seguro ejecutar múltiples veces
-- ═══════════════════════════════════════════════════════════════════════

-- ═══ Nuevas columnas de configuración ═══

-- Envío
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS delivery_time TEXT DEFAULT '24-48 horas';

-- Marketing & Conversión
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS exit_popup_enabled BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS popup_coupon_code TEXT DEFAULT 'PRIMERA10';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS popup_coupon_discount INTEGER DEFAULT 10;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_proof_enabled BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS flash_sale_enabled BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS upsell_enabled BOOLEAN DEFAULT true;

-- Quantity Breaks
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qty_break_3 INTEGER DEFAULT 5;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qty_break_5 INTEGER DEFAULT 10;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qty_break_10 INTEGER DEFAULT 15;

-- Métodos de Pago
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS cardnet_enabled BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS transfer_enabled BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS paypal_enabled BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS cardnet_message TEXT DEFAULT 'Recibirás tu link de pago en WhatsApp';

-- Chatbot
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS chatbot_enabled BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS chatbot_context TEXT DEFAULT '';

-- Analytics
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ga4_id TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS pixel_id TEXT DEFAULT '';

-- Banner Promocional
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS promo_banner_enabled BOOLEAN DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS promo_banner_text TEXT DEFAULT '';

-- ═══ FIN MIGRACIÓN v4.2 ═══
