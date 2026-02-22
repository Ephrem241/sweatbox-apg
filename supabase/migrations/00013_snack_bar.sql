-- Snack bar pre-orders: items and orders for pickup at locations.

CREATE TABLE public.snack_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_etb numeric NOT NULL CHECK (price_etb >= 0),
  image_url text,
  available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.snack_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'picked_up', 'cancelled')),
  pickup_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.snack_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snack_order_id uuid NOT NULL REFERENCES public.snack_orders(id) ON DELETE CASCADE,
  snack_item_id uuid NOT NULL REFERENCES public.snack_items(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_etb numeric NOT NULL CHECK (price_etb >= 0)
);

CREATE INDEX idx_snack_orders_user ON public.snack_orders (user_id);
CREATE INDEX idx_snack_orders_created ON public.snack_orders (created_at DESC);
CREATE INDEX idx_snack_order_items_order ON public.snack_order_items (snack_order_id);

-- RLS snack_items: anyone can read
ALTER TABLE public.snack_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read snack_items"
  ON public.snack_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage snack_items"
  ON public.snack_items FOR ALL USING (public.is_admin());

-- RLS snack_orders: user sees own, admins see all
ALTER TABLE public.snack_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own snack_orders"
  ON public.snack_orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own snack_orders"
  ON public.snack_orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can read all snack_orders"
  ON public.snack_orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update snack_orders"
  ON public.snack_orders FOR UPDATE USING (public.is_admin());

-- RLS snack_order_items
ALTER TABLE public.snack_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own snack_order_items"
  ON public.snack_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.snack_orders o WHERE o.id = snack_order_id AND o.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert snack_order_items for own orders"
  ON public.snack_order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.snack_orders o WHERE o.id = snack_order_id AND o.user_id = auth.uid()
    )
  );
CREATE POLICY "Admins can read all snack_order_items"
  ON public.snack_order_items FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert snack_order_items"
  ON public.snack_order_items FOR INSERT WITH CHECK (public.is_admin());
