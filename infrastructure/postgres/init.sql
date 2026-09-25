CREATE TABLE IF NOT EXISTS products (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sku varchar(80) UNIQUE NOT NULL, name varchar(120) NOT NULL);
CREATE TABLE IF NOT EXISTS inventory (sku varchar(80) PRIMARY KEY, quantity integer NOT NULL);
CREATE TABLE IF NOT EXISTS orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), status varchar(30) NOT NULL, created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS payments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid, status varchar(30) NOT NULL, created_at timestamptz DEFAULT now());
INSERT INTO inventory(sku,quantity) VALUES ('sku-demo',100) ON CONFLICT (sku) DO NOTHING;
