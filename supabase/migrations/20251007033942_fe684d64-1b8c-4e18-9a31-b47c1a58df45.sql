-- Add commission_rate column to branches table for consignment shops
ALTER TABLE public.branches 
ADD COLUMN commission_rate numeric DEFAULT 0.15 CHECK (commission_rate >= 0 AND commission_rate <= 1);

COMMENT ON COLUMN public.branches.commission_rate IS 'Commission rate for consignment branches (0-1 representing 0-100%)';