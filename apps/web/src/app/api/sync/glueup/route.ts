// POST /api/sync/glueup
// Pulls members from a Glue Up organisation and upserts them as wv_listings.
//
// Requires: API key with 'write' scope for the target directory.
//
// Body:
//   { directory_slug: string }
//
// The directory must have glueup_org_id set and GLUEUP_API_KEY env var present.
//
// Glue Up API v2 docs: https://glueupapi.docs.apiary.io/
// Collections used: Membership Collection (/api/membership/memberships/)

import { NextResponse } from 'next/server'
import { getDirectory } from '@webvillage/engine'
import type { GlueUpMember, WvGlueUpSyncResult } from '@webvillage/engine'
import { verifyApiKey, apiError } from '@/lib/api-auth'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

const GLUEUP_BASE = 'https://app.glueup.com'
const PAGE_SIZE = 100

interface GlueUpMembershipsResponse {
  count: number
  next: string | null
  results: GlueUpApiMembership[]
}

interface GlueUpApiMembership {
  id: number
  member: {
    id: number
    name: string
    email: string | null
    phone: string | null
    website: string | null
    city: string | null
    country: string | null
    description: string | null
    logo: string | null
  }
  membership_type: { name: string } | null
  status: string
}

function slugify(str: string, suffix?: string): string {
  const base = str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
  return suffix ? `${base}-${suffix}` : base
}

async function fetchGlueUpPage(
  orgId: string,
  apiKey: string,
  page: number
): Promise<GlueUpMembershipsResponse> {
  const url = `${GLUEUP_BASE}/api/membership/memberships/?organization=${orgId}&page=${page}&page_size=${PAGE_SIZE}&status=active`
  const res = await fetch(url, {
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Glue Up API error ${res.status}: ${await res.text()}`)
  }

  return res.json() as Promise<GlueUpMembershipsResponse>
}

function mapGlueUpMember(m: GlueUpApiMembership): Omit<GlueUpMember, 'id'> & { id: number } {
  return {
    id: m.member.id,
    name: m.member.name,
    email: m.member.email,
    phone: m.member.phone,
    website: m.member.website,
    city: m.member.city,
    country: m.member.country,
    description: m.member.description,
    logo: m.member.logo,
    membership_type: m.membership_type?.name ?? null,
    status: m.status,
  }
}

export async function POST(request: Request) {
  // Auth — write scope required
  const auth = await verifyApiKey(request, undefined, 'write')
  if (!auth.ok) return auth.error

  let body: { directory_slug: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  if (!body.directory_slug) {
    return apiError("'directory_slug' is required", 400)
  }

  const directory = await getDirectory(body.directory_slug)
  if (!directory) {
    return apiError(`Directory '${body.directory_slug}' not found`, 404)
  }

  // Confirm the API key is authorised for this directory
  if (directory.id !== auth.directoryId) {
    return apiError('API key is not authorised for this directory', 403)
  }

  if (!directory.glueup_org_id) {
    return apiError('This directory does not have a Glue Up org ID configured', 422)
  }

  const glueupApiKey = process.env.GLUEUP_API_KEY
  if (!glueupApiKey) {
    return apiError('GLUEUP_API_KEY environment variable is not set', 500)
  }

  const supabase = createSupabaseServiceClient()

  // Insert sync log (running)
  const { data: logRow } = await supabase
    .from('wv_sync_logs')
    .insert({
      directory_id: directory.id,
      source: 'glueup',
      status: 'running',
    })
    .select('id')
    .single()

  const logId = logRow?.id

  const result: WvGlueUpSyncResult = {
    directory_id: directory.id,
    source: 'glueup',
    records_processed: 0,
    records_created: 0,
    records_updated: 0,
    records_skipped: 0,
    errors: [],
  }

  try {
    let page = 1
    let hasMore = true
    const allMembers: GlueUpMember[] = []

    // Paginate through all active members
    while (hasMore) {
      const resp = await fetchGlueUpPage(directory.glueup_org_id, glueupApiKey, page)
      allMembers.push(...resp.results.map(mapGlueUpMember))
      hasMore = resp.next !== null
      page++
      // Respect Glue Up rate limits
      if (hasMore) await new Promise((r) => setTimeout(r, 300))
    }

    // Upsert each member as a listing
    for (const member of allMembers) {
      result.records_processed++

      try {
        const baseSlug = slugify(member.name, String(member.id))

        // Check if listing exists (by custom_fields.glueup_member_id)
        const { data: existing } = await supabase
          .from('wv_listings')
          .select('id, slug')
          .eq('directory_id', directory.id)
          .contains('custom_fields', { glueup_member_id: member.id })
          .single()

        if (existing) {
          // Update
          await supabase
            .from('wv_listings')
            .update({
              name:         member.name,
              email:        member.email ?? null,
              phone:        member.phone ?? null,
              website:      member.website ?? null,
              city:         member.city ?? null,
              country:      member.country?.toUpperCase() ?? null,
              description:  member.description ?? null,
              logo_url:     member.logo ?? null,
              custom_fields: { glueup_member_id: member.id, membership_type: member.membership_type },
            })
            .eq('id', existing.id)

          result.records_updated++
        } else {
          // Create
          await supabase.from('wv_listings').insert({
            directory_id:   directory.id,
            slug:           baseSlug,
            name:           member.name,
            email:          member.email ?? null,
            phone:          member.phone ?? null,
            website:        member.website ?? null,
            city:           member.city ?? null,
            country:        member.country?.toUpperCase() ?? null,
            description:    member.description ?? null,
            logo_url:       member.logo ?? null,
            profile_status: 'unclaimed',
            custom_fields:  { glueup_member_id: member.id, membership_type: member.membership_type },
            consent_form_version: 'glueup-import-v1',
          })
          result.records_created++
        }
      } catch (memberErr) {
        result.records_skipped++
        result.errors.push(`Member ${member.id} (${member.name}): ${String(memberErr)}`)
      }
    }

    // Update sync log — completed
    if (logId) {
      await supabase
        .from('wv_sync_logs')
        .update({
          status: 'completed',
          records_processed: result.records_processed,
          records_created: result.records_created,
          records_updated: result.records_updated,
          records_skipped: result.records_skipped,
          completed_at: new Date().toISOString(),
        })
        .eq('id', logId)
    }

    return NextResponse.json({ data: result }, { status: 200 })

  } catch (err) {
    const message = String(err)

    if (logId) {
      await supabase
        .from('wv_sync_logs')
        .update({
          status: 'failed',
          error_message: message,
          records_processed: result.records_processed,
          completed_at: new Date().toISOString(),
        })
        .eq('id', logId)
    }

    console.error('[POST /api/sync/glueup]', err)
    return NextResponse.json(
      { error: 'Sync failed', detail: message, partial: result },
      { status: 500 }
    )
  }
}
