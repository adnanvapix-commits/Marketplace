-- ============================================================
-- Fix: search_products_tiered sort order
-- Removes ::text casts from numeric/int columns so price and
-- quantity sort correctly (numeric order, not lexicographic).
-- Run this in Supabase SQL Editor.
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_products_tiered(
  p_q           text    DEFAULT '',
  p_category    text    DEFAULT '',
  p_condition   text    DEFAULT '',
  p_brand       text    DEFAULT '',
  p_location    text    DEFAULT '',
  p_min_price   numeric DEFAULT NULL,
  p_max_price   numeric DEFAULT NULL,
  p_min_qty     int     DEFAULT NULL,
  p_min_moq     int     DEFAULT NULL,
  p_sort        text    DEFAULT 'alpha',
  p_page        int     DEFAULT 1,
  p_page_size   int     DEFAULT 16
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset    int := (p_page - 1) * p_page_size;
  v_total     bigint;
  v_products  jsonb;
BEGIN
  -- Get total count
  SELECT COUNT(*)
  INTO v_total
  FROM public.products pr
  JOIN public.users u ON u.id = pr.user_id
  WHERE pr.is_active = true
    AND pr.is_blocked = false
    AND (p_q = '' OR pr.title ILIKE '%' || p_q || '%' OR pr.brand ILIKE '%' || p_q || '%')
    AND (p_category = '' OR pr.category = p_category)
    AND (p_condition = '' OR pr.condition = p_condition)
    AND (p_brand = '' OR pr.brand ILIKE '%' || p_brand || '%')
    AND (p_location = '' OR pr.location ILIKE '%' || p_location || '%')
    AND (p_min_price IS NULL OR pr.price >= p_min_price)
    AND (p_max_price IS NULL OR pr.price <= p_max_price)
    AND (p_min_qty IS NULL OR pr.quantity >= p_min_qty)
    AND (p_min_moq IS NULL OR pr.minimum_order_quantity <= p_min_moq);

  -- Get paginated results sorted by tier then user sort
  SELECT jsonb_agg(row_to_json(t))
  INTO v_products
  FROM (
    SELECT
      pr.*,
      jsonb_build_object('email', u.email, 'company_name', u.company_name) AS users
    FROM public.products pr
    JOIN public.users u ON u.id = pr.user_id
    WHERE pr.is_active = true
      AND pr.is_blocked = false
      AND (p_q = '' OR pr.title ILIKE '%' || p_q || '%' OR pr.brand ILIKE '%' || p_q || '%')
      AND (p_category = '' OR pr.category = p_category)
      AND (p_condition = '' OR pr.condition = p_condition)
      AND (p_brand = '' OR pr.brand ILIKE '%' || p_brand || '%')
      AND (p_location = '' OR pr.location ILIKE '%' || p_location || '%')
      AND (p_min_price IS NULL OR pr.price >= p_min_price)
      AND (p_max_price IS NULL OR pr.price <= p_max_price)
      AND (p_min_qty IS NULL OR pr.quantity >= p_min_qty)
      AND (p_min_moq IS NULL OR pr.minimum_order_quantity <= p_min_moq)
    ORDER BY
      -- Tier priority: elite=1, expert=2, beginner=3, unsubscribed=4
      CASE u.subscription_tier
        WHEN 'elite'    THEN 1
        WHEN 'expert'   THEN 2
        WHEN 'beginner' THEN 3
        ELSE 4
      END ASC,
      -- User-chosen secondary sort (no ::text casts — proper numeric/timestamp ordering)
      CASE WHEN p_sort = 'price_asc'                    THEN pr.price       END ASC,
      CASE WHEN p_sort = 'price_desc'                   THEN pr.price       END DESC,
      CASE WHEN p_sort = 'qty_desc'                     THEN pr.quantity    END DESC,
      CASE WHEN p_sort = 'newest'                       THEN pr.created_at  END DESC,
      CASE WHEN p_sort = 'alpha' OR p_sort IS NULL      THEN pr.title       END ASC
    LIMIT p_page_size
    OFFSET v_offset
  ) t;

  RETURN jsonb_build_object(
    'products',   COALESCE(v_products, '[]'::jsonb),
    'count',      v_total,
    'totalPages', CEIL(v_total::float / p_page_size),
    'page',       p_page
  );
END;
$$;
