import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Spinner } from '../components/ui/spinner'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'

export const OAuthCallbackPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params] = useSearchParams()

  useEffect(() => {
    const token = params.get('accessToken')
    const error = params.get('error')

    if (error) {
      navigate('/auth/login', { replace: true, state: { oauthError: error } })
      return
    }
    if (!token) {
      navigate('/auth/login', { replace: true, state: { oauthError: 'Google sign-in failed. Please try again.' } })
      return
    }

    const finish = async () => {
      useAuthStore.getState().setToken(token)
      try {
        const { data } = await authService.me()
        useAuthStore.getState().setAuth(data.data.user, token)
        queryClient.setQueryData(['me'], data.data.user)
        navigate('/dashboard', { replace: true })
      } catch {
        useAuthStore.getState().logout()
        navigate('/auth/login', { replace: true, state: { oauthError: 'Could not complete Google sign-in.' } })
      }
    }
    void finish()
  }, [navigate, params, queryClient])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Spinner />
      <p className="text-sm text-muted-foreground">Completing Google sign-in...</p>
    </div>
  )
}
