import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService, type UpdateProfilePayload, type ChangePasswordPayload } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'
import type { LoginInput, RegisterInput } from '../validations/auth'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const { user, accessToken, isAuthenticated, setAuth, setUser, logout } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken)
      queryClient.setQueryData(['me'], data.data.user)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken)
      queryClient.setQueryData(['me'], data.data.user)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateMe(payload),
    onSuccess: ({ data }) => {
      setUser(data.data.user)
      queryClient.setQueryData(['me'], data.data.user)
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
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
