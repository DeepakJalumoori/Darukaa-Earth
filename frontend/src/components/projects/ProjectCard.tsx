import { Link } from 'react-router-dom'
import type { Project } from '../../types'
import { Leaf, Trees, Combine, Calendar, ArrowRight } from 'lucide-react'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Determine icon and color based on project type
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'carbon':
        return {
          icon: Leaf,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          label: 'Carbon',
        }
      case 'biodiversity':
        return {
          icon: Trees,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          label: 'Biodiversity',
        }
      case 'mixed':
      default:
        return {
          icon: Combine,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          label: 'Mixed',
        }
    }
  }

  const typeInfo = getTypeInfo(project.project_type)
  const Icon = typeInfo.icon
  const formattedDate = new Date(project.created_at).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
  )

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 rounded-lg ${typeInfo.bg} ${typeInfo.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
            {typeInfo.label}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-zinc-900 line-clamp-1 mb-2">
          {project.name}
        </h3>

        <p className="text-sm text-zinc-600 line-clamp-2 mb-4 h-10">
          {project.description || 'No description provided.'}
        </p>

        <div className="flex items-center text-xs text-zinc-500">
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          Created {formattedDate}
        </div>
      </div>

      <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-100">
        <Link
          to={`/projects/${project.id}`}
          className="flex items-center justify-between w-full text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors group"
        >
          View Details
          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
