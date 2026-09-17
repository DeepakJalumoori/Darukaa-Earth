import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { api } from '../../lib/api'
import type { Project } from '../../types'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (project: Project) => void
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [projectType, setProjectType] = useState<
    'carbon' | 'biodiversity' | 'mixed'
  >('carbon')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post<Project>('/projects', {
        name,
        description: description || null,
        project_type: projectType,
      })
      toast.success('Project created successfully!')
      onSuccess(response.data)
      // Reset form
      setName('')
      setDescription('')
      setProjectType('carbon')
      onClose()
    } catch (error) {
      toast.error('Failed to create project. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700"
          >
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
            placeholder="E.g., Amazon Reforestation Initiative"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-zinc-700"
          >
            Project Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={projectType}
            onChange={(e) =>
              setProjectType(
                e.target.value as 'carbon' | 'biodiversity' | 'mixed',
              )
            }
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 bg-white focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
          >
            <option value="carbon">Carbon Sequestration</option>
            <option value="biodiversity">Biodiversity Conservation</option>
            <option value="mixed">Mixed (Carbon & Biodiversity)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-700"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
            placeholder="Brief overview of the project's goals..."
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  )
}
