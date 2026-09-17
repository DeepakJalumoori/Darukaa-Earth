export interface User {
  id: string
  email: string
  full_name: string
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  project_type: 'carbon' | 'biodiversity' | 'mixed'
  created_at: string
  updated_at: string
}

// GeoJSON types
export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: number[][][] // Simplified for Polygon
}

export interface Site {
  id: string
  project_id: string
  name: string
  geometry: GeoJSONGeometry
  area_hectares: number | null
  created_at: string
  updated_at: string
}

export interface SiteAnalytics {
  id: string
  site_id: string
  recorded_date: string
  carbon_sequestration_tons: number | null
  biodiversity_index: number | null
  ndvi: number | null
  soil_moisture_pct: number | null
  canopy_cover_pct: number | null
}
