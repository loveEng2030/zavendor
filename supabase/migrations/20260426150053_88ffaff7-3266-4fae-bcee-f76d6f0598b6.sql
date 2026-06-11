-- 1) Make orders.user_id NOT NULL (existing rows already require it via INSERT policy)
-- First, delete any orphan rows defensively (none expected, but safe). We won't auto-delete; instead error if any exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.orders WHERE user_id IS NULL) THEN
    RAISE EXCEPTION 'Cannot enforce NOT NULL on orders.user_id: orphan rows with NULL user_id exist';
  END IF;
END $$;

ALTER TABLE public.orders ALTER COLUMN user_id SET NOT NULL;

-- 2) Recreate orders SELECT policies scoped to authenticated only
DROP POLICY IF EXISTS "Users view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;

CREATE POLICY "Users view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3) Tighten receipts upload policy to enforce per-user folder
DROP POLICY IF EXISTS "Authenticated upload receipts" ON storage.objects;

CREATE POLICY "Authenticated upload receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);