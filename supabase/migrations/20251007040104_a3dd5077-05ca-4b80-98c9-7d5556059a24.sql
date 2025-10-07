-- Create security definer function to check if user has access to a specific branch
CREATE OR REPLACE FUNCTION public.has_branch_access(_user_id uuid, _branch_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Admins have access to all branches
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  )
  OR
  -- Non-admins only have access to their assigned branches
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND branch_id = _branch_id
  )
$$;

-- Drop existing permissive policies and create restrictive ones

-- BRANCHES: Only admins can view branch data
DROP POLICY IF EXISTS "Anyone authenticated can view branches" ON public.branches;
CREATE POLICY "Admins can view all branches"
ON public.branches
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- QUOTATIONS: Restrict to admin/staff with branch access
DROP POLICY IF EXISTS "Authenticated users can view quotations" ON public.quotations;
CREATE POLICY "Users can view quotations in their branches"
ON public.quotations
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  OR 
  (has_role(auth.uid(), 'staff') AND has_branch_access(auth.uid(), branch_id))
);

DROP POLICY IF EXISTS "Admins and staff can manage quotations" ON public.quotations;
CREATE POLICY "Users can manage quotations in their branches"
ON public.quotations
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  OR 
  (has_role(auth.uid(), 'staff') AND has_branch_access(auth.uid(), branch_id))
)
WITH CHECK (
  has_role(auth.uid(), 'admin') 
  OR 
  (has_role(auth.uid(), 'staff') AND has_branch_access(auth.uid(), branch_id))
);

-- SALES: Branch-scoped access
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
CREATE POLICY "Users can view sales in their branches"
ON public.sales
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  OR 
  has_branch_access(auth.uid(), branch_id)
);

DROP POLICY IF EXISTS "Authenticated users can manage sales" ON public.sales;
CREATE POLICY "Users can manage sales in their branches"
ON public.sales
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  OR 
  has_branch_access(auth.uid(), branch_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin') 
  OR 
  has_branch_access(auth.uid(), branch_id)
);

-- SALE_ITEMS: Branch-scoped through sales relationship
DROP POLICY IF EXISTS "Anyone can view sale items" ON public.sale_items;
CREATE POLICY "Users can view sale items in their branches"
ON public.sale_items
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.id = sale_items.sale_id
      AND has_branch_access(auth.uid(), sales.branch_id)
  )
);

DROP POLICY IF EXISTS "Authenticated users can manage sale items" ON public.sale_items;
CREATE POLICY "Users can manage sale items in their branches"
ON public.sale_items
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.id = sale_items.sale_id
      AND has_branch_access(auth.uid(), sales.branch_id)
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.id = sale_items.sale_id
      AND has_branch_access(auth.uid(), sales.branch_id)
  )
);

-- STOCK_LOTS: Admin and branch-scoped staff only
DROP POLICY IF EXISTS "Authenticated users can view stock lots" ON public.stock_lots;
CREATE POLICY "Admin and staff can view stock lots in their branches"
ON public.stock_lots
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  (has_role(auth.uid(), 'staff') AND has_branch_access(auth.uid(), branch_id))
);

-- PURCHASE_ITEMS: Through purchases relationship
DROP POLICY IF EXISTS "Anyone can view purchase items" ON public.purchase_items;
CREATE POLICY "Admin and staff can view purchase items in their branches"
ON public.purchase_items
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  (has_role(auth.uid(), 'staff') AND EXISTS (
    SELECT 1 FROM public.purchases
    WHERE purchases.id = purchase_items.purchase_id
      AND has_branch_access(auth.uid(), purchases.branch_id)
  ))
);

DROP POLICY IF EXISTS "Admins and staff can manage purchase items" ON public.purchase_items;
CREATE POLICY "Admin and staff can manage purchase items in their branches"
ON public.purchase_items
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  (has_role(auth.uid(), 'staff') AND EXISTS (
    SELECT 1 FROM public.purchases
    WHERE purchases.id = purchase_items.purchase_id
      AND has_branch_access(auth.uid(), purchases.branch_id)
  ))
)
WITH CHECK (
  has_role(auth.uid(), 'admin')
  OR
  (has_role(auth.uid(), 'staff') AND EXISTS (
    SELECT 1 FROM public.purchases
    WHERE purchases.id = purchase_items.purchase_id
      AND has_branch_access(auth.uid(), purchases.branch_id)
  ))
);

-- PURCHASES: Branch-scoped access
DROP POLICY IF EXISTS "Authenticated users can view purchases" ON public.purchases;
CREATE POLICY "Admin and staff can view purchases in their branches"
ON public.purchases
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  (has_role(auth.uid(), 'staff') AND has_branch_access(auth.uid(), branch_id))
);

DROP POLICY IF EXISTS "Admins and staff can manage purchases" ON public.purchases;
CREATE POLICY "Admin and staff can manage purchases in their branches"
ON public.purchases
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  (has_role(auth.uid(), 'staff') AND has_branch_access(auth.uid(), branch_id))
)
WITH CHECK (
  has_role(auth.uid(), 'admin')
  OR
  (has_role(auth.uid(), 'staff') AND has_branch_access(auth.uid(), branch_id))
);

-- TRANSFERS: Admin and staff only
DROP POLICY IF EXISTS "Authenticated users can view transfers" ON public.transfers;
CREATE POLICY "Admin and staff can view transfers"
ON public.transfers
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  has_role(auth.uid(), 'staff')
);

-- QUOTATION_ITEMS: Through quotations relationship
DROP POLICY IF EXISTS "Anyone can view quotation items" ON public.quotation_items;
CREATE POLICY "Users can view quotation items in their branches"
ON public.quotation_items
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  (has_role(auth.uid(), 'staff') AND EXISTS (
    SELECT 1 FROM public.quotations
    WHERE quotations.id = quotation_items.quotation_id
      AND has_branch_access(auth.uid(), quotations.branch_id)
  ))
);

DROP POLICY IF EXISTS "Admins and staff can manage quotation items" ON public.quotation_items;
CREATE POLICY "Users can manage quotation items in their branches"
ON public.quotation_items
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  (has_role(auth.uid(), 'staff') AND EXISTS (
    SELECT 1 FROM public.quotations
    WHERE quotations.id = quotation_items.quotation_id
      AND has_branch_access(auth.uid(), quotations.branch_id)
  ))
)
WITH CHECK (
  has_role(auth.uid(), 'admin')
  OR
  (has_role(auth.uid(), 'staff') AND EXISTS (
    SELECT 1 FROM public.quotations
    WHERE quotations.id = quotation_items.quotation_id
      AND has_branch_access(auth.uid(), quotations.branch_id)
  ))
);

-- TRANSFER_ITEMS: Admin and staff only
DROP POLICY IF EXISTS "Anyone can view transfer items" ON public.transfer_items;
CREATE POLICY "Admin and staff can view transfer items"
ON public.transfer_items
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  has_role(auth.uid(), 'staff')
);

-- BRANCH_PRODUCTS: Branch-scoped access
DROP POLICY IF EXISTS "Authenticated users can view branch products" ON public.branch_products;
CREATE POLICY "Users can view branch products in their branches"
ON public.branch_products
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR
  has_branch_access(auth.uid(), branch_id)
);