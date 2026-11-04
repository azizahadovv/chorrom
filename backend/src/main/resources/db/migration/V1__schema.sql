-- CHORROM bazasi (eski Supabase sxemasidan; auth/RLS o'rniga ruxsatlar backend'da tekshiriladi)

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Admin panel foydalanuvchilari
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'seller')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  slug text NOT NULL UNIQUE,
  image text,
  icon text DEFAULT 'Package',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  meta_title_uz text,
  meta_title_ru text,
  meta_description_uz text,
  meta_description_ru text,
  meta_keywords text,
  is_indexed boolean DEFAULT true,
  is_followed boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  slug text UNIQUE,
  description_uz text,
  description_ru text,
  full_description_uz text,
  full_description_ru text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price numeric,
  original_price numeric,
  images text[] DEFAULT '{}',
  materials text[] DEFAULT '{}',
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  is_negotiable boolean DEFAULT false,
  in_stock boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  meta_title_uz text,
  meta_title_ru text,
  meta_description_uz text,
  meta_description_ru text,
  meta_keywords text,
  is_indexed boolean DEFAULT true,
  is_followed boolean DEFAULT true,
  -- CHORROM texnik maydonlari
  brand text,
  chips_uz text[] DEFAULT '{}',
  chips_ru text[] DEFAULT '{}',
  place text,
  calc_material text,
  calc_series text,
  chambers text,
  thickness text,
  uw_value text,
  sound_db text,
  warranty_years text,
  suitable_uz text,
  suitable_ru text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON products (category_id);
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Saytdagi har bir matn/rasm (kalit → UZ/RU qiymat) va ro'yxatlar (list:<nom>, JSON)
CREATE TABLE site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value_uz text,
  value_ru text,
  content_type text DEFAULT 'text',
  page text,
  section text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text DEFAULT 'CHORROM',
  logo_url text,
  favicon_url text,
  contact_phone text,
  whatsapp_number text,
  working_hours_uz text,
  working_hours_ru text,
  address_uz text,
  address_ru text,
  seo_title text,
  seo_description text,
  default_language text DEFAULT 'uz',
  languages_enabled text[] DEFAULT ARRAY['uz', 'ru'],
  primary_domain text DEFAULT 'https://chorrom.uz',
  short_description_uz text,
  short_description_ru text,
  social_facebook text,
  social_instagram text,
  social_telegram text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Yopiq sozlamalar (Telegram bot tokeni va h.k.) — faqat xodimlar o'qiydi
CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Saytdagi barcha formalar
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  phone text NOT NULL CHECK (phone ~ '^[+]998[0-9]{9}$'),
  topic text NOT NULL DEFAULT '',
  page text,
  calc jsonb,
  details jsonb,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done', 'spam')),
  note text,
  ip text,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_created_at_idx ON leads (created_at DESC);
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Narx sozlamalari (bitta qator). Tuzilmasi: frontend src/lib/pricing.ts → PriceConfig
CREATE TABLE price_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER price_settings_updated_at BEFORE UPDATE ON price_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO system_settings (site_name, primary_domain, seo_title) VALUES
  ('CHORROM', 'https://chorrom.uz', 'CHORROM — deraza va eshiklar, Buxoro');
