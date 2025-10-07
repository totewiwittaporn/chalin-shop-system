-- Add barcode column to products table
ALTER TABLE public.products 
ADD COLUMN barcode character varying UNIQUE;

-- Add index for faster barcode lookups
CREATE INDEX idx_products_barcode ON public.products(barcode);

COMMENT ON COLUMN public.products.barcode IS 'Product barcode for scanning';