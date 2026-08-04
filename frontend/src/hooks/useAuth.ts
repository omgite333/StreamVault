import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService, type UpdateProfilePayload, type ChangePasswordPayload } from '../services/auth.service'
import { useToast } from '../components/ui/toast-context'
import { useAuthStore } from '../store/auth.store'
import type { LoginInput, RegisterInput } from '../validations/auth'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user, accessToken, isAuthenticated, setAuth, setUser, logout } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken)
      queryClient.setQueryData(['me'], data.data.user)
      toast({ title: 'Welcome back', variant: 'success' })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken)
      queryClient.setQueryData(['me'], data.data.user)
      toast({ title: 'Account created', description: 'You are now signed in.', variant: 'success' })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
      toast({ title: 'Signed out', description: 'See you soon!', variant: 'info' })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateMe(payload),
    onSuccess: ({ data }) => {
      setUser(data.data.user)
      queryClient.setQueryData(['me'], data.data.user)
      toast({ title: 'Profile updated', variant: 'success' })
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
    onSuccess: () => {
      toast({ title: 'Password changed', variant: 'success' })
    },
  })

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await authService.me()
      setUser(data.data.user)
      return data.data.user
    },
    enabled: isAuthenticated && !user,
    retry: false,
  })

  return {
    user,
    accessToken,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    meQuery,
  }
}
