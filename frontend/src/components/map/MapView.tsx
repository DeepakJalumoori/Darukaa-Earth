import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { api } from '../../lib/api'
import type { Site } from '../../types'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

interface MapViewProps {
  projectId?: string
  focusedSiteId?: string
  isDrawMode?: boolean
  onDrawComplete?: (geometry: unknown) => void
  onSiteClick?: (site: Site) => void
}

export function MapView({
  projectId,
  focusedSiteId,
  isDrawMode,
  onDrawComplete,
  onSiteClick,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const draw = useRef<MapboxDraw | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [error, setError] = useState<string | null>(null)

  // Refs to prevent stale closures in mapbox event listeners
  const sitesRef = useRef(sites)
  const onSiteClickRef = useRef(onSiteClick)
  const onDrawCompleteRef = useRef(onDrawComplete)

  useEffect(() => {
    sitesRef.current = sites
  }, [sites])
  useEffect(() => {
    onSiteClickRef.current = onSiteClick
  }, [onSiteClick])
  useEffect(() => {
    onDrawCompleteRef.current = onDrawComplete
  }, [onDrawComplete])

  // 1. Initialize map once
  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setError(
        'Mapbox Token Required. Please add VITE_MAPBOX_TOKEN to your environment configuration.',
      )
      return
    }

    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-0.09, 51.505],
      zoom: 2,
    })

    map.current = m

    m.addControl(new mapboxgl.NavigationControl(), 'top-right')

    m.on('load', () => {
      m.addSource('sites', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      m.addLayer({
        id: 'sites-fill',
        type: 'fill',
        source: 'sites',
        paint: { 'fill-color': '#10b981', 'fill-opacity': 0.4 },
      })

      m.addLayer({
        id: 'sites-outline',
        type: 'line',
        source: 'sites',
        paint: { 'line-color': '#047857', 'line-width': 2 },
      })

      m.on('click', 'sites-fill', (e) => {
        if (e.features && e.features[0]) {
          const siteId = e.features[0].properties?.id
          const clickedSite = sitesRef.current.find((s) => s.id === siteId)
          if (clickedSite && onSiteClickRef.current) {
            onSiteClickRef.current(clickedSite)
          }
        }
      })

      m.on('mouseenter', 'sites-fill', () => {
        m.getCanvas().style.cursor = 'pointer'
      })
      m.on('mouseleave', 'sites-fill', () => {
        m.getCanvas().style.cursor = ''
      })
    })

    return () => {
      m.remove()
      map.current = null
    }
  }, [])

  // 2. Handle Draw Control Lifecycle
  useEffect(() => {
    if (!map.current) return

    if (isDrawMode) {
      const d = new MapboxDraw({
        displayControlsDefault: false,
        controls: { polygon: true, trash: true },
        defaultMode: 'draw_polygon',
      })

      map.current.addControl(d, 'top-right')
      draw.current = d

      const handleDrawCreate = () => {
        const data = d.getAll()
        if (data && data.features.length > 0 && onDrawCompleteRef.current) {
          onDrawCompleteRef.current(data.features[0].geometry)
        }
      }

      map.current.on('draw.create', handleDrawCreate)

      return () => {
        if (map.current && draw.current) {
          map.current.off('draw.create', handleDrawCreate)
          map.current.removeControl(draw.current)
          draw.current = null
        }
      }
    }
  }, [isDrawMode])

  // 3. Fetch Sites when projectId changes
  useEffect(() => {
    if (!projectId) return

    const fetchSites = async () => {
      try {
        const response = await api.get<Site[]>(`/sites/project/${projectId}`)
        setSites(response.data)
      } catch (err) {
        console.error('Failed to load sites', err)
      }
    }

    fetchSites()
  }, [projectId])

  // 4. Update Map Data when sites change
  useEffect(() => {
    if (!map.current) return

    const updateSource = () => {
      const m = map.current
      if (!m || !m.isStyleLoaded()) return

      const source = m.getSource('sites') as mapboxgl.GeoJSONSource
      if (source) {
        const featureCollection = {
          type: 'FeatureCollection',
          features: sites.map((site) => ({
            type: 'Feature',
            geometry: site.geometry,
            properties: {
              id: site.id,
              name: site.name,
              area: site.area_hectares,
            },
          })),
        } as GeoJSON.FeatureCollection<GeoJSON.Geometry>

        source.setData(featureCollection)

        if (sites.length > 0 && !isDrawMode) {
          const bounds = new mapboxgl.LngLatBounds()
          sites.forEach((site) => {
            if (
              site.geometry.type === 'Polygon' ||
              site.geometry.type === 'MultiPolygon'
            ) {
              const coords = (
                site.geometry.type === 'Polygon'
                  ? site.geometry.coordinates[0]
                  : site.geometry.coordinates[0][0]
              ) as number[][]

              coords.forEach((coord: number[]) => {
                bounds.extend([coord[0], coord[1]])
              })
            }
          })

          m.fitBounds(bounds, { padding: 50, maxZoom: 14 })
        }
      }
    }

    if (map.current.isStyleLoaded()) {
      updateSource()
    } else {
      map.current.once('load', updateSource)
    }
  }, [sites, isDrawMode])

  // 5. Handle focused site
  useEffect(() => {
    if (
      focusedSiteId &&
      sites.length > 0 &&
      map.current &&
      map.current.isStyleLoaded()
    ) {
      const site = sites.find((s) => s.id === focusedSiteId)
      if (site) {
        const bounds = new mapboxgl.LngLatBounds()
        const coords = (
          site.geometry.type === 'Polygon'
            ? site.geometry.coordinates[0]
            : site.geometry.coordinates[0][0]
        ) as number[][]

        coords.forEach((coord: number[]) => {
          bounds.extend([coord[0], coord[1]])
        })

        map.current.fitBounds(bounds, { padding: 50, maxZoom: 16 })
      }
    }
  }, [focusedSiteId, sites])

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 rounded-xl border border-zinc-300">
        <div className="text-center p-6 max-w-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">
            Configuration Error
          </h3>
          <p className="mt-2 text-sm text-zinc-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-zinc-200">
      <div ref={mapContainer} className="absolute inset-0" />
      {isDrawMode && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-md shadow-md z-10 border border-zinc-200">
          <p className="text-sm font-medium text-emerald-700">
            Drawing Mode Active
          </p>
          <p className="text-xs text-zinc-500">
            Use the polygon tool on the right to draw a new site boundary.
          </p>
        </div>
      )}
    </div>
  )
}
