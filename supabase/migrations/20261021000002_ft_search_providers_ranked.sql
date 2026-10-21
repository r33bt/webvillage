-- FindTraining FT-GAP-25: ranked provider search
-- NOT APPLIED. Apply via the Supabase SQL editor for the FindTraining project.
--
-- Search used to return every provider whose name, state or description contained each query
-- token, sorted by name only, so a provider named after the query could sit pages behind ones
-- that only mention it in their description. This function returns the matching provider ids,
-- ranked and paginated:
--   1  name contains the whole query as typed
--   2  name contains every token
--   3  every token appears somewhere in name, state or description (the old match rule)
--   4  category fallback, only when no provider matched at rank 1 or 2: providers in a category
--      whose name or slug contains every token (e.g. "leadership" -> Leadership & Management)
-- Ties are ordered by name. Paid tier and the featured flag do not affect the order.
-- Filters match searchProviders(): country, state (case-insensitive equality), delivery method,
-- category slug, and profile_status not removed/opted_out. Tokens shorter than 2 characters are
-- ignored; LIKE wildcards in the query are escaped.
--
-- The engine adapter (packages/engine/src/adapters/findtraining.ts, searchProviders) calls this
-- via RPC and falls back to the previous name-sorted query if the RPC errors (e.g. not applied).
--
-- rollback: DROP FUNCTION IF EXISTS ft_search_providers_ranked(text, text, text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION ft_search_providers_ranked(
  p_query        text,
  p_country_code text    DEFAULT NULL,
  p_state        text    DEFAULT NULL,
  p_delivery     text    DEFAULT NULL,
  p_category     text    DEFAULT NULL,
  p_limit        integer DEFAULT 20,
  p_offset       integer DEFAULT 0
)
RETURNS TABLE(provider_id uuid, search_rank integer, total_count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH tokens AS (
    SELECT
      array_agg(replace(replace(replace(t, '\', '\\'), '%', '\%'), '_', '\_')) AS pats
    FROM regexp_split_to_table(trim(coalesce(p_query, '')), '\s+') AS t
    WHERE length(t) >= 2
  ),
  phrase AS (
    SELECT array_to_string(pats, ' ') AS pat FROM tokens
  ),
  base AS (
    SELECT p.id, p.name, p.state, p.description
    FROM ft_providers p
    WHERE p.profile_status NOT IN ('removed', 'opted_out')
      AND (p_country_code IS NULL OR p.country_code = upper(trim(p_country_code)))
      AND (p_state IS NULL OR p.state ILIKE p_state)
      AND (p_delivery IS NULL OR p.delivery_methods @> ARRAY[p_delivery])
      AND (p_category IS NULL OR EXISTS (
        SELECT 1
        FROM ft_provider_categories pc
        JOIN ft_categories c ON c.id = pc.category_id
        WHERE pc.provider_id = p.id AND c.slug = p_category
      ))
  ),
  text_hits AS (
    SELECT
      b.id,
      CASE
        WHEN b.name ILIKE '%' || ph.pat || '%' THEN 1
        WHEN (SELECT bool_and(b.name ILIKE '%' || x || '%') FROM unnest(tk.pats) AS x) THEN 2
        ELSE 3
      END AS search_rank
    FROM base b
    CROSS JOIN tokens tk
    CROSS JOIN phrase ph
    WHERE tk.pats IS NOT NULL
      AND (
        SELECT bool_and(
          b.name ILIKE '%' || x || '%'
          OR coalesce(b.state, '') ILIKE '%' || x || '%'
          OR coalesce(b.description, '') ILIKE '%' || x || '%'
        )
        FROM unnest(tk.pats) AS x
      )
  ),
  category_hits AS (
    SELECT b.id, 4 AS search_rank
    FROM base b
    CROSS JOIN tokens tk
    WHERE tk.pats IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM text_hits th WHERE th.search_rank <= 2)
      AND NOT EXISTS (SELECT 1 FROM text_hits th WHERE th.id = b.id)
      AND EXISTS (
        SELECT 1
        FROM ft_provider_categories pc
        JOIN ft_categories c ON c.id = pc.category_id
        WHERE pc.provider_id = b.id
          AND (
            SELECT bool_and(c.name ILIKE '%' || x || '%' OR c.slug ILIKE '%' || x || '%')
            FROM unnest(tk.pats) AS x
          )
      )
  ),
  hits AS (
    SELECT id, search_rank FROM text_hits
    UNION ALL
    SELECT id, search_rank FROM category_hits
  )
  SELECT h.id, h.search_rank, count(*) OVER () AS total_count
  FROM hits h
  JOIN base b ON b.id = h.id
  ORDER BY h.search_rank, b.name, b.id
  LIMIT greatest(coalesce(p_limit, 20), 0)
  OFFSET greatest(coalesce(p_offset, 0), 0);
$$;

GRANT EXECUTE ON FUNCTION ft_search_providers_ranked(text, text, text, text, text, integer, integer)
  TO anon, authenticated;
