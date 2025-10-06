-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE app_role AS ENUM ('admin', 'staff', 'consignment_owner');
CREATE TYPE branch_type AS ENUM ('MAIN', 'BRANCH', 'CONSIGNMENT');
CREATE TYPE purchase_status AS ENUM ('PENDING', 'RECEIVED', 'CANCELLED');
CREATE TYPE transfer_status AS ENUM ('PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED');
CREATE TYPE sale_status AS ENUM ('COMPLETED', 'CANCELLED', 'REFUNDED');
CREATE TYPE quotation_status AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE doc_type AS ENUM ('PURCHASE', 'TRANSFER', 'SALE', 'QUOTATION', 'INVOICE', 'DELIVERY');
CREATE TYPE stock_movement_type AS ENUM ('IN', 'OUT', 'TRANSFER', 'ADJUST');

-- ============================================
-- 1. Product Types (ประเภทสินค้า)
-- ============================================
CREATE TABLE product_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Branches (สาขา/ร้านฝาก)
-- ============================================
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type branch_type NOT NULL,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  
  -- Location info
  address_th TEXT,
  address_en TEXT,
  phone VARCHAR(50),
  
  -- Company info
  company_name_th TEXT,
  company_name_en TEXT,
  tax_id VARCHAR(50),
  
  -- Settings
  locale VARCHAR(10) DEFAULT 'th',
  currency VARCHAR(10) DEFAULT 'THB',
  date_format VARCHAR(50) DEFAULT 'DD/MM/YYYY',
  number_format VARCHAR(50) DEFAULT '1,234.56',
  
  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#000000',
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Products (สินค้า)
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  product_type_id UUID REFERENCES product_types(id) ON DELETE SET NULL,
  base_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Branch Products (สต็อกสินค้าต่อสาขา)
-- ============================================
CREATE TABLE branch_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 0 NOT NULL,
  min_stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, product_id)
);

-- ============================================
-- 5. Stock Lots (ล็อตสินค้า FIFO)
-- ============================================
CREATE TABLE stock_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  lot_date TIMESTAMPTZ DEFAULT NOW(),
  reference_doc_type doc_type,
  reference_doc_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Purchases (ซื้อสินค้า)
-- ============================================
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_no VARCHAR(100) UNIQUE NOT NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  supplier_name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  status purchase_status DEFAULT 'PENDING',
  total_amount DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  received_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. Transfers (โอนสินค้า)
-- ============================================
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_no VARCHAR(100) UNIQUE NOT NULL,
  from_branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  to_branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  transfer_date DATE NOT NULL,
  status transfer_status DEFAULT 'PENDING',
  notes TEXT,
  approved_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transfer_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_id UUID REFERENCES transfers(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. Sales (ขายสินค้า)
-- ============================================
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_no VARCHAR(100) UNIQUE NOT NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  sale_date DATE NOT NULL,
  customer_name TEXT,
  status sale_status DEFAULT 'COMPLETED',
  subtotal DECIMAL(15,2) DEFAULT 0,
  discount DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  unit_cost DECIMAL(15,2) DEFAULT 0,
  total_price DECIMAL(15,2) NOT NULL,
  total_cost DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. Quotations (ใบเสนอราคา)
-- ============================================
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_no VARCHAR(100) UNIQUE NOT NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  quotation_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  status quotation_status DEFAULT 'DRAFT',
  subtotal DECIMAL(15,2) DEFAULT 0,
  discount DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. Pricing (ราคาตามร้าน/ชนิด/สินค้า)
-- ============================================
CREATE TABLE standard_type_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_type_id UUID REFERENCES product_types(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE standard_product_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shop_type_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  product_type_id UUID REFERENCES product_types(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, product_type_id, effective_from)
);

CREATE TABLE shop_product_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, product_id, effective_from)
);

-- ============================================
-- 11. Document Numbering Settings
-- ============================================
CREATE TABLE doc_number_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  doc_type doc_type NOT NULL,
  prefix VARCHAR(50) NOT NULL,
  current_number INTEGER DEFAULT 0 NOT NULL,
  format VARCHAR(100) DEFAULT '{prefix}-{branchCode}-{YYYYMM}-{running}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, doc_type)
);

-- ============================================
-- 12. User Roles (ระบบสิทธิ์)
-- ============================================
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role, branch_id)
);

-- ============================================
-- Security Definer Function for Role Check
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================
-- RLS Policies
-- ============================================

-- Product Types
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product types" ON product_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage product types" ON product_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Branches
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view branches" ON branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage branches" ON branches FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins and staff can manage products" ON products FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- Branch Products
ALTER TABLE branch_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view branch products" ON branch_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and staff can manage branch products" ON branch_products FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- Stock Lots
ALTER TABLE stock_lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view stock lots" ON stock_lots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and staff can manage stock lots" ON stock_lots FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- Purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view purchases" ON purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and staff can manage purchases" ON purchases FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);
CREATE POLICY "Anyone can view purchase items" ON purchase_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and staff can manage purchase items" ON purchase_items FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- Transfers
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view transfers" ON transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and staff can manage transfers" ON transfers FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);
CREATE POLICY "Anyone can view transfer items" ON transfer_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and staff can manage transfer items" ON transfer_items FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- Sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view sales" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sales" ON sales FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'consignment_owner')
);
CREATE POLICY "Anyone can view sale items" ON sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sale items" ON sale_items FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'consignment_owner')
);

-- Quotations
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view quotations" ON quotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and staff can manage quotations" ON quotations FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);
CREATE POLICY "Anyone can view quotation items" ON quotation_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and staff can manage quotation items" ON quotation_items FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')
);

-- Pricing tables
ALTER TABLE standard_type_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_type_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_product_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view standard type prices" ON standard_type_prices FOR SELECT USING (true);
CREATE POLICY "Admins can manage standard type prices" ON standard_type_prices FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view standard product prices" ON standard_product_prices FOR SELECT USING (true);
CREATE POLICY "Admins can manage standard product prices" ON standard_product_prices FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view shop type prices" ON shop_type_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage shop type prices" ON shop_type_prices FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view shop product prices" ON shop_product_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage shop product prices" ON shop_product_prices FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Doc Number Settings
ALTER TABLE doc_number_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view doc settings" ON doc_number_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage doc settings" ON doc_number_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User Roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all roles" ON user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_types_updated_at BEFORE UPDATE ON product_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branch_products_updated_at BEFORE UPDATE ON branch_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_products_type ON products(product_type_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_branch_products_branch ON branch_products(branch_id);
CREATE INDEX idx_branch_products_product ON branch_products(product_id);
CREATE INDEX idx_stock_lots_branch_product ON stock_lots(branch_id, product_id);
CREATE INDEX idx_purchases_branch ON purchases(branch_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_transfers_from_branch ON transfers(from_branch_id);
CREATE INDEX idx_transfers_to_branch ON transfers(to_branch_id);
CREATE INDEX idx_sales_branch ON sales(branch_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_quotations_branch ON quotations(branch_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);