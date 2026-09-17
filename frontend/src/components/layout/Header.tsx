import { LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-zinc-800">Darukaa.Earth</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <UserIcon className="h-4 w-4" />
          <span>{user?.full_name}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </header>
  )
}
