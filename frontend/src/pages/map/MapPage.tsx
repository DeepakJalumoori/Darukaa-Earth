import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { MapView } from '../../components/map/MapView'
import { Modal } from '../../components/ui/Modal'
import { api } from '../../lib/api'
import type { Project, Site } from '../../types'
import { MapIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function MapPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const projectIdParam = searchParams.get('project')
  const siteIdParam = searchParams.get('site')
  const actionParam = searchParams.get('action')

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >(projectIdParam || undefined)
  const [isLoading, setIsLoading] = useState(true)

  // Draw state
  const isDrawMode = actionParam === 'draw' && !!selectedProjectId
  const [drawnGeometry, setDrawnGeometry] = useState<unknown>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newSiteName, setNewSiteName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Selected site state
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (projectIdParam) {
      setSelectedProjectId(projectIdParam)
    }
  }, [projectIdParam])

  const fetchProjects = async () => {
    try {
      const response = await api.get<Project[]>('/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to fetch projects', error)
      toast.error('Failed to load projects.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value
    setSelectedProjectId(newProjectId)
    if (newProjectId) {
      navigate(`/map?project=${newProjectId}`)
    } else {
      navigate('/map')
    }
  }

  const handleDrawComplete = (geometry: unknown) => {
    setDrawnGeometry(geometry)
    setIsCreateModalOpen(true)
  }

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId || !drawnGeometry) return

    setIsSaving(true)
    try {
      await api.post('/sites', {
        project_id: selectedProjectId,
        name: newSiteName,
        geometry: drawnGeometry,
      })
      toast.success('Site created successfully!')
      setIsCreateModalOpen(false)
      setNewSiteName('')
      setDrawnGeometry(null)
      // Turn off draw mode
      navigate(`/map?project=${selectedProjectId}`)
    } catch (error) {
      console.error('Failed to create site', error)
      toast.error('Failed to create site.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSiteClick = (site: Site) => {
    setSelectedSite(site)
    setIsSiteModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-7rem)] space-y-4">
      {/* Map Header / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <MapIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Interactive Map</h1>
            <p className="text-xs text-zinc-500">
              View and manage project sites globally.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId || ''}
            onChange={handleProjectSelect}
            className="block w-64 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
          >
            <option value="">-- Select a Project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {selectedProjectId && (
            <button
              onClick={() =>
                navigate(`/map?project=${selectedProjectId}&action=draw`)
              }
              disabled={isDrawMode}
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              Draw New Site
            </button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-zinc-200 relative">
        {!selectedProjectId ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 p-6 text-center z-10 bg-zinc-50 rounded-xl">
            <MapIcon className="h-16 w-16 text-zinc-300 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900">
              No Project Selected
            </h3>
            <p className="max-w-md mt-2">
              Select a project from the dropdown above to view its sites on the
              map, or to draw new boundaries.
            </p>
          </div>
        ) : (
          <MapView
            projectId={selectedProjectId}
            focusedSiteId={siteIdParam || undefined}
            isDrawMode={isDrawMode}
            onDrawComplete={handleDrawComplete}
            onSiteClick={handleSiteClick}
          />
        )}
      </div>

      {/* Create Site Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Save New Site"
      >
        <form onSubmit={handleSaveSite} className="space-y-4">
          <div>
            <label
              htmlFor="siteName"
              className="block text-sm font-medium text-zinc-700"
            >
              Site Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="siteName"
              required
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
              placeholder="E.g., North Sector Reforestation Area"
            />
          </div>
          <div className="bg-emerald-50 p-3 rounded-md text-sm text-emerald-800 flex items-start gap-2">
            <MapIcon className="h-5 w-5 shrink-0 mt-0.5" />
            <p>
              The polygon you drew has been captured successfully. Once saved,
              the exact area in hectares will be automatically calculated.
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false)
                setDrawnGeometry(null)
                setNewSiteName('')
              }}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !newSiteName.trim()}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Site
            </button>
          </div>
        </form>
      </Modal>

      {/* Site Detail Modal (Popup alternative) */}
      <Modal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        title="Site Details"
      >
        {selectedSite && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-zinc-500">Site Name</h4>
              <p className="mt-1 text-base text-zinc-900">
                {selectedSite.name}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-500">Area</h4>
              <p className="mt-1 text-base text-zinc-900">
                {selectedSite.area_hectares
                  ? `${selectedSite.area_hectares.toFixed(2)} hectares`
                  : 'Calculating...'}
              </p>
            </div>
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
              <button
                onClick={() => navigate(`/analytics/${selectedSite.id}`)}
                className="inline-flex items-center justify-center rounded-md bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                View Analytics
              </button>
              <button
                onClick={() => navigate(`/projects/${selectedProjectId}`)}
                className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                View Project
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
