import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import type { Site, SiteAnalytics } from '../../types'
import { MetricCard } from '../../components/analytics/MetricCard'
import { TimeSeriesChart } from '../../components/analytics/TimeSeriesChart'
import {
  Loader2,
  ArrowLeft,
  BarChart3,
  Leaf,
  Droplets,
  TreePine,
} from 'lucide-react'
import toast from 'react-hot-toast'

export function AnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [site, setSite] = useState<Site | null>(null)
  const [analytics, setAnalytics] = useState<SiteAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        const [siteRes, analyticsRes] = await Promise.all([
          api.get<Site>(`/sites/${id}`),
          api.get<SiteAnalytics[]>(`/analytics/site/${id}`),
        ])
        setSite(siteRes.data)
        setAnalytics(analyticsRes.data)
      } catch (error) {
        console.error('Failed to load analytics data:', error)
        toast.error('Failed to load analytics data.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <BarChart3 className="h-16 w-16 text-zinc-300 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900">Site Not Found</h2>
        <p className="mt-2 text-zinc-500">
          The site you are looking for does not exist or you do not have access.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  // Determine what data we have based on the first record (or check all if sparse)
  const hasCarbon = analytics.some((a) => a.carbon_sequestration_tons !== null)
  const hasBiodiversity = analytics.some((a) => a.biodiversity_index !== null)

  // Formatting data for charts
  const dates = analytics.map((a) =>
    new Date(a.recorded_date).toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    }),
  )

  const carbonData = analytics.map((a) => a.carbon_sequestration_tons || 0)
  const bioData = analytics.map((a) => a.biodiversity_index || 0)
  const ndviData = analytics.map((a) => a.ndvi || 0)
  const soilData = analytics.map((a) => a.soil_moisture_pct || 0)
  const canopyData = analytics.map((a) => a.canopy_cover_pct || 0)

  // Latest values for KPIs
  const latest = analytics[analytics.length - 1] || null
  const previous = analytics.length > 1 ? analytics[analytics.length - 2] : null

  const calculateTrend = (current: number | null, prev: number | null) => {
    if (current === null || prev === null || prev === 0)
      return { direction: 'neutral' as const, value: '' }
    const diff = current - prev
    const pct = (Math.abs(diff) / Math.abs(prev)) * 100
    return {
      direction:
        diff > 0
          ? ('up' as const)
          : diff < 0
            ? ('down' as const)
            : ('neutral' as const),
      value: `${pct.toFixed(1)}%`,
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/projects/${site.project_id}`)}
          className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-zinc-500" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
            <span>Project Analysis</span>
            <span>&bull;</span>
            <span className="text-emerald-600 font-medium">{site.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Site Analytics
          </h1>
        </div>
      </div>

      {analytics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-4 text-lg font-medium text-zinc-900">
            No Analytics Data Yet
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
            Analytics data for this site is currently being processed or
            simulated. Check back later.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hasCarbon && latest?.carbon_sequestration_tons !== null && (
              <MetricCard
                title="Carbon Sequestration"
                value={`${latest.carbon_sequestration_tons.toFixed(1)} t`}
                subtitle="Total estimated CO2e"
                icon={Leaf}
                trend={
                  calculateTrend(
                    latest.carbon_sequestration_tons,
                    previous?.carbon_sequestration_tons ?? null,
                  ).direction
                }
                trendValue={
                  calculateTrend(
                    latest.carbon_sequestration_tons,
                    previous?.carbon_sequestration_tons ?? null,
                  ).value
                }
              />
            )}
            {hasBiodiversity && latest?.biodiversity_index !== null && (
              <MetricCard
                title="Biodiversity Index"
                value={latest.biodiversity_index.toFixed(2)}
                subtitle="Relative species richness"
                icon={TreePine}
                trend={
                  calculateTrend(
                    latest.biodiversity_index,
                    previous?.biodiversity_index ?? null,
                  ).direction
                }
                trendValue={
                  calculateTrend(
                    latest.biodiversity_index,
                    previous?.biodiversity_index ?? null,
                  ).value
                }
              />
            )}
            {latest?.ndvi !== null && (
              <MetricCard
                title="NDVI Score"
                value={latest.ndvi.toFixed(3)}
                subtitle="Vegetation health indicator"
                icon={Leaf}
                trend={
                  calculateTrend(latest.ndvi, previous?.ndvi ?? null).direction
                }
                trendValue={
                  calculateTrend(latest.ndvi, previous?.ndvi ?? null).value
                }
              />
            )}
            {latest?.soil_moisture_pct !== null && (
              <MetricCard
                title="Soil Moisture"
                value={`${latest.soil_moisture_pct.toFixed(1)}%`}
                subtitle="Average saturation"
                icon={Droplets}
                trend={
                  calculateTrend(
                    latest.soil_moisture_pct,
                    previous?.soil_moisture_pct ?? null,
                  ).direction
                }
                trendValue={
                  calculateTrend(
                    latest.soil_moisture_pct,
                    previous?.soil_moisture_pct ?? null,
                  ).value
                }
              />
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {hasCarbon && (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <TimeSeriesChart
                  title="Carbon Sequestration Over Time"
                  labels={dates}
                  datasets={[
                    {
                      label: 'CO2e Tons',
                      data: carbonData,
                      borderColor: '#059669', // emerald-600
                      backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    },
                  ]}
                />
              </div>
            )}
            {hasBiodiversity && (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <TimeSeriesChart
                  title="Biodiversity Index Trend"
                  labels={dates}
                  datasets={[
                    {
                      label: 'Index Score',
                      data: bioData,
                      borderColor: '#0284c7', // sky-600
                      backgroundColor: 'rgba(2, 132, 199, 0.1)',
                    },
                  ]}
                />
              </div>
            )}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
              <TimeSeriesChart
                title="Environmental Health Metrics (NDVI, Soil Moisture, Canopy Cover)"
                labels={dates}
                datasets={[
                  {
                    label: 'NDVI (Scaled x100)',
                    data: ndviData.map((v) => v * 100), // Scale for visual comparison
                    borderColor: '#65a30d', // lime-600
                    backgroundColor: 'rgba(101, 163, 13, 0.1)',
                  },
                  {
                    label: 'Soil Moisture %',
                    data: soilData,
                    borderColor: '#2563eb', // blue-600
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  },
                  {
                    label: 'Canopy Cover %',
                    data: canopyData,
                    borderColor: '#4d7c0f', // lime-700
                    backgroundColor: 'rgba(77, 124, 15, 0.1)',
                  },
                ]}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
