# Region pages: expected `ft_providers.state` values (FT-GAP-6)

Internal. For Pat to check against the database; nothing here is published.

Region pages (`/categories/[category]/[region]`), the country hub "Browse by" section and the
`/search?country=XX&state=...` filter match `ft_providers.state` through the normalisation map in
`src/lib/regions.ts`. Matching ignores case, dots, apostrophes, extra spaces, accents, a trailing
postcode and a trailing country word ("NSW 2000, Australia" reads as "NSW").

## What the code does with the values

- A GB or AU region appears on the hub, and its category pages render, only when at least one
  provider of that country (`country_code` GB or AU) has a `state` value that matches it. Otherwise
  the region page is a 404. Today (May 2026 note on ft-41) GB and AU had `state` NULL everywhere, so
  no GB/AU region is shown until the values are filled in.
- MY region pages behave as before: all 16 are prebuilt and always render, matched at least on the
  state name (case-insensitive), with no country filter. The aliases below are added to that match.
- Pages with fewer than 10 providers stay `noindex,follow` (FT-GAP-24).
- GB and AU region pages are rendered on demand (not prebuilt).
- A value that matches no region (a city such as "London" or "Sydney", a county, a typo) is ignored:
  that provider still lists on the country and category pages, just not on a region page.

## Accepted forms (any case)

| Country | Region (URL slug) | Name | Also accepted |
|---|---|---|---|
| GB | england | England | ENG |
| GB | scotland | Scotland | SCT, Scot |
| GB | wales | Wales | WLS, Cymru |
| GB | northern-ireland | Northern Ireland | NI, NIR, N Ireland, N. Ireland |
| AU | new-south-wales | New South Wales | NSW |
| AU | victoria | Victoria | VIC |
| AU | queensland | Queensland | QLD |
| AU | western-australia | Western Australia | WA |
| AU | south-australia | South Australia | SA |
| AU | tasmania | Tasmania | TAS |
| AU | australian-capital-territory | Australian Capital Territory | ACT |
| AU | northern-territory | Northern Territory | NT |
| MY | johor | Johor | Johore, JHR, Johor Darul Takzim, Johor Darul Ta'zim |
| MY | kedah | Kedah | KDH, Kedah Darul Aman |
| MY | kelantan | Kelantan | KTN, Kelantan Darul Naim |
| MY | kuala-lumpur | Kuala Lumpur | KL, WP Kuala Lumpur, W.P. Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Federal Territory of Kuala Lumpur, FT Kuala Lumpur |
| MY | labuan | Labuan | WP Labuan, W.P. Labuan, Wilayah Persekutuan Labuan, Federal Territory of Labuan |
| MY | melaka | Melaka | Malacca, MLK |
| MY | negeri-sembilan | Negeri Sembilan | Negri Sembilan, N Sembilan, NSN |
| MY | pahang | Pahang | PHG, Pahang Darul Makmur |
| MY | penang | Penang | Pulau Pinang, P Pinang, PNG |
| MY | perak | Perak | PRK, Perak Darul Ridzuan |
| MY | perlis | Perlis | PLS |
| MY | putrajaya | Putrajaya | WP Putrajaya, W.P. Putrajaya, Wilayah Persekutuan Putrajaya, Federal Territory of Putrajaya |
| MY | sabah | Sabah | SBH |
| MY | sarawak | Sarawak | SWK |
| MY | selangor | Selangor | SGR, Selangor Darul Ehsan |
| MY | terengganu | Terengganu | Trengganu, TRG, Terengganu Darul Iman |

Values containing `%`, `_`, `*`, `"` or `\` are not used in the database filter.

## Queries for Pat (read-only)

```sql
-- 1. Every distinct stored value per country, with counts. Compare against the table above.
select country_code, state, count(*)
from ft_providers
where country_code in ('MY', 'GB', 'AU')
  and profile_status not in ('removed', 'opted_out')
group by 1, 2
order by 1, 3 desc;

-- 2. GB and AU providers that have any state at all (0 means no GB/AU region shows yet).
select country_code, count(*) filter (where state is not null) as with_state, count(*) as total
from ft_providers
where country_code in ('GB', 'AU')
group by 1;

-- 3. MY providers with a state but no country_code (MY pages still include them; GB/AU do not).
select state, count(*) from ft_providers
where country_code is null and state is not null group by 1 order by 2 desc;
```

Any value from query 1 that should belong to a region but is not in the table: add it to that
region's `aliases` in `src/lib/regions.ts` and a case to `src/lib/regions.test.ts`.
