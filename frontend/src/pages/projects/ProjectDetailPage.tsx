import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Map as MapIcon,
  Loader2,
  Leaf,
  Trees,
  Combine,
} from 'lucide-react'
import { api } from '../../lib/api'
import type { Project, Site } from '../../types'
import toast from 'react-hot-toast'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchData(id)
    }
  }, [id])

  const fetchData = async (projectId: string) => {
    try {
      const [projectRes, sitesRes] = await Promise.all([
        api.get<Project>(`/projects/${projectId}`),
        api.get<Site[]>(`/sites/project/${projectId}`),
      ])
      setProject(projectRes.data)
      setSites(sitesRes.data)
    } catch (error) {
      console.error('Failed to load project details:', error)
      toast.error('Failed to load project details.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-zinc-900">
          Project not found
        </h2>
        <Link
          to="/"
          className="mt-4 inline-block text-emerald-600 hover:underline"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'carbon':
        return <Leaf className="h-5 w-5 text-emerald-600" />
      case 'biodiversity':
        return <Trees className="h-5 w-5 text-blue-600" />
      case 'mixed':
      default:
        return <Combine className="h-5 w-5 text-purple-600" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Back link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {getTypeIcon(project.project_type)}
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              {project.name}
            </h1>
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 capitalize">
              {project.project_type}
            </span>
          </div>
          <p className="text-zinc-600 max-w-2xl">
            {project.description || 'No description provided for this project.'}
          </p>
        </div>
        <Link
          to={`/map?project=${project.id}`}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors shrink-0"
        >
          <MapIcon className="mr-2 h-4 w-4" />
          View on Map
        </Link>
      </div>

      {/* Sites Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">
            Sites in this Project
          </h2>
        </div>

        {sites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <MapIcon className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-sm font-medium text-zinc-900">
              No sites added
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              This project doesn't have any geographic sites mapped yet.
            </p>
            <div className="mt-6">
              <Link
                to={`/map?project=${project.id}&action=draw`}
                className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-300 shadow-sm hover:bg-zinc-50 transition-colors"
              >
                <MapIcon className="mr-2 h-4 w-4 text-zinc-400" />
                Draw Site on Map
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <ul className="divide-y divide-zinc-200">
              {sites.map((site) => (
                <li
                  key={site.id}
                  className="p-4 sm:px-6 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600 truncate">
                        {site.name}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                        Area:{' '}
                        {site.area_hectares
                          ? `${site.area_hectares.toFixed(2)} ha`
                          : 'Calculating...'}
                      </p>
                    </div>
                    <div className="ml-2 shrink-0 flex gap-2">
                      <Link
                        to={`/map?project=${project.id}&site=${site.id}`}
                        className="inline-flex items-center rounded bg-white px-2 py-1 text-xs font-medium text-zinc-600 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50"
                      >
                        View Map
                      </Link>
                      <Link
                        to={`/analytics/${site.id}`}
                        className="inline-flex items-center rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100"
                      >
                        View Analytics
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
