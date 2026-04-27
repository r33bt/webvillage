// apps/web/app/api/be/clusters/[id]/route.ts
// Brand Engine Slice 6: GET cluster + slots + score rollup + job status

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { fetchSlotsWithRollup, computeClusterRollup } from '@/lib/be-cluster-rollup'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createSupabaseServiceClient()

  const { data: cluster, error: cErr } = await sb
    .from('wv_be_clusters')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (cErr || !cluster) {
    return NextResponse.json({ error: 'cluster_not_found' }, { status: 404 })
  }

  const slots = await fetchSlotsWithRollup(id)
  const rollup = await computeClusterRollup(id, slots)

  // Latest job for this cluster
  const { data: job } = await sb
    .from('wv_be_jobs')
    .select('id, status, progress, last_error')
    .eq('job_type', 'cluster_generate')
    .filter('payload->>cluster_id', 'eq', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({
    cluster,
    slots,
    rollup,
    job: job
      ? {
          job_id: job.id,
          status: job.status,
          progress: job.progress ?? null,
          last_error: job.last_error ?? null,
        }
      : null,
  })
}
