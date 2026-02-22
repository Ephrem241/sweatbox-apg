-- Pro-Shop: products, orders, order_items. RLS: products public read; orders by user/admin.

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price_etb numeric NOT NULL CHECK (price_etb >= 0),
  category text NOT NULL DEFAULT 'gear',
  image_url text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'shipped', 'cancelled')),
  total_etb numeric NOT NULL CHECK (total_etb >= 0),
  chapa_tx_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_etb numeric NOT NULL CHECK (price_etb >= 0)
);

CREATE INDEX idx_orders_user ON public.orders (user_id);
CREATE INDEX idx_orders_created ON public.orders (created_at DESC);
CREATE INDEX idx_order_items_order ON public.order_items (order_id);

-- RLS products: anyone can read
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read products"
  ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL USING (public.is_admin());

-- RLS orders: user sees own, admins see all
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE USING (public.is_admin());

-- RLS order_items: read via order ownership
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert order items for own orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );
CREATE POLICY "Admins can read all order items"
  ON public.order_items FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert order items"
  ON public.order_items FOR INSERT WITH CHECK (public.is_admin());
