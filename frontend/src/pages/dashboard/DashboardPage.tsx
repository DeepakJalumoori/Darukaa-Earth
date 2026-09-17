import { useState, useEffect } from 'react'
import { Plus, FolderKanban, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'
import type { Project } from '../../types'
import { ProjectCard } from '../../components/projects/ProjectCard'
import { CreateProjectModal } from '../../components/projects/CreateProjectModal'
import toast from 'react-hot-toast'

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await api.get<Project[]>('/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [project, ...prev])
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Projects Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage and monitor your environmental projects.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <FolderKanban className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-4 text-lg font-medium text-zinc-900">
            No projects yet
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
            Get started by creating your first environmental project to track
            carbon, biodiversity, or mixed metrics.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center rounded-md bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  )
}
