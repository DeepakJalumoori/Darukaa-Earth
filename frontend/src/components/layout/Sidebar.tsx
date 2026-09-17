import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map as MapIcon, Leaf } from 'lucide-react'
import { cn } from '../../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: Leaf },
  { name: 'Map View', href: '/map', icon: MapIcon },
]

export function Sidebar() {
  return (
    <div className="flex w-64 flex-col border-r border-zinc-200 bg-zinc-50">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-xl font-bold tracking-tight text-emerald-700 flex items-center gap-2">
          <Leaf className="h-6 w-6" />
          Darukaa
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive
                        ? 'text-emerald-700'
                        : 'text-zinc-400 group-hover:text-zinc-500',
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
