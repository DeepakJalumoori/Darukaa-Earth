import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'

export function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 1. Register
      await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
      })

      // 2. Auto-login
      const loginResponse = await api.post('/auth/login', { email, password })
      await login(loginResponse.data.access_token)
      navigate('/')
    } catch (err) {
      import('axios').then((axios) => {
        if (axios.default.isAxiosError(err)) {
          setError(
            err.response?.data?.detail ||
              'Registration failed. Please try again.',
          )
        } else {
          setError('Registration failed. Please try again.')
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left pane - branding */}
      <div className="hidden w-1/2 bg-emerald-900 lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-center">
          <Leaf className="h-16 w-16 text-emerald-400 mb-6" />
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
            Darukaa.Earth
          </h1>
          <p className="text-lg text-emerald-100 max-w-md">
            Advanced geospatial analytics for carbon and biodiversity projects.
          </p>
        </div>
      </div>

      {/* Right pane - register form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 sm:px-12 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden flex flex-col items-center">
            <Leaf className="h-10 w-10 text-emerald-600 mb-2" />
            <h1 className="text-2xl font-bold text-zinc-900">Darukaa.Earth</h1>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Start analyzing environmental projects today.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Full name
                </label>
                <div className="mt-1">
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Password (min. 8 characters)
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-zinc-300 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
