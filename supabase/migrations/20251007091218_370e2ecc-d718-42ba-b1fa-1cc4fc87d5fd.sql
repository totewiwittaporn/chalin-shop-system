-- Fix quotation access control to properly restrict by branch
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view quotations in their branches" ON quotations;
DROP POLICY IF EXISTS "Users can manage quotations in their branches" ON quotations;

-- Create more explicit policies
-- Admins can see all quotations
CREATE POLICY "Admins can view all quotations"
ON quotations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Staff can only see quotations from their assigned branches
CREATE POLICY "Staff can view quotations from assigned branches"
ON quotations
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'staff'::app_role) 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND branch_id = quotations.branch_id
    AND role = 'staff'
  )
);

-- Admins can manage all quotations
CREATE POLICY "Admins can manage all quotations"
ON quotations
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Staff can manage quotations in their assigned branches
CREATE POLICY "Staff can manage quotations in assigned branches"
ON quotations
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'staff'::app_role)
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND branch_id = quotations.branch_id
    AND role = 'staff'
  )
)
WITH CHECK (
  has_role(auth.uid(), 'staff'::app_role)
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND branch_id = quotations.branch_id
    AND role = 'staff'
  )
);