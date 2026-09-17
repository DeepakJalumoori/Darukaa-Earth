import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface TimeSeriesChartProps {
  title: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

export function TimeSeriesChart({
  title,
  labels,
  datasets,
}: TimeSeriesChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        color: '#3f3f46', // zinc-700
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'normal' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f4f4f5', // zinc-100
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  }

  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      fill: true,
      tension: 0.4, // smooth curves
      pointRadius: 2,
      pointHoverRadius: 5,
    })),
  }

  return (
    <div className="w-full h-72">
      <Line options={options} data={data} />
    </div>
  )
}
