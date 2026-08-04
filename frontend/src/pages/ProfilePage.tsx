import { useRef, useState } from 'react'
import { Camera, CircleCheck, KeyRound, Loader2, UserRound } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/auth.store'
import { uploadService } from '../services/upload.service'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Spinner } from '../components/ui/spinner'
import { formatDate } from '../lib/utils'

export const ProfilePage = () => {
  const user = useAuthStore((s) => s.user)
  const { updateProfile, changePassword, isUpdatingProfile, isChangingPassword } = useAuth()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name ?? '')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')

  if (!user) return null

  const handleAvatar = async (file: File | null) => {
    if (!file) return
    setAvatarUploading(true)
    setProfileMsg('')
    try {
      const fileType = file.type || 'image/png'
      const { data } = await uploadService.getUploadUrl({ fileType, folder: 'avatars' })
      const { url, key } = data.data
      const response = await uploadService.putObject(url, file, fileType)
      if (!response.ok) throw new Error('Avatar upload failed.')
      await updateProfile({ profileImage: key })
      setProfileMsg('Profile picture updated.')
    } catch (e) {
      setProfileMsg(e instanceof Error ? e.message : 'Avatar upload failed.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg('')
    try {
      await updateProfile({ name: name.trim() })
      setProfileMsg('Name updated.')
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : 'Could not update name.')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMsg('')
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    try {
      await changePassword({ currentPassword, newPassword })
      setPasswordMsg('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not change password.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/25 via-accent to-transparent" />
        <CardContent className="-mt-10 flex flex-wrap items-end gap-4">
          <div className="relative">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-primary/10 text-3xl font-bold text-primary shadow">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.name} className="size-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              aria-label="Change profile picture"
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
            >
              {avatarUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleAvatar(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-bold">{user.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserRound className="size-3.5" />
              {user.email}
            </p>
          </div>
          <Badge>{user.role === 'ADMIN' ? 'Administrator' : 'Student'}</Badge>
        </CardContent>
        <CardContent className="grid gap-3 border-t pt-5 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Member since</p>
            <p className="font-medium">{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Verified</p>
            <p className="flex items-center gap-1 font-medium">
              {user.isVerified ? (
                <>
                  <CircleCheck className="size-4 text-success" /> Yes
                </>
              ) : (
                'No'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>Update your display name or profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleNameSubmit} className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex gap-2">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                <Button type="submit" disabled={isUpdatingProfile || name.trim() === user.name}>
                  {isUpdatingProfile && <Spinner />}
                  Save
                </Button>
              </div>
            </form>
            {profileMsg && <p className="text-xs text-muted-foreground">{profileMsg}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              Password
            </CardTitle>
            <CardDescription>Use at least 8 characters.</CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordForm ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPasswordError('')
                  setPasswordMsg('')
                  setShowPasswordForm(true)
                }}
                className="w-full"
              >
                <KeyRound className="size-4" />
                Change password
              </Button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                {passwordMsg && <p className="text-xs text-success">{passwordMsg}</p>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword && <Spinner />}
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPasswordForm(false)}
                    disabled={isChangingPassword}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
