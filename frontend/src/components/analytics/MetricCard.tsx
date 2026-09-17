import { cn } from '../../lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200 bg-white p-6 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        {Icon && <Icon className="h-5 w-5 text-zinc-400" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-semibold tracking-tight text-zinc-900">
          {value}
        </p>
        {trend && trendValue && (
          <span
            className={cn(
              'text-sm font-medium',
              trend === 'up'
                ? 'text-emerald-600'
                : trend === 'down'
                  ? 'text-red-600'
                  : 'text-zinc-500',
            )}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'} {trendValue}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
    </div>
  )
}
