import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BarChart3, BookOpen, FolderPlus, PlayCircle, Upload, Users } from 'lucide-react'
import { adminService } from '../../services/admin.service'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { usePageTitle } from '../../hooks/usePageTitle'

const quickActions = [
  { to: '/admin/courses/new', label: 'Create Course', icon: FolderPlus },
  { to: '/admin/upload', label: 'Upload Video', icon: Upload },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/analytics', label: 'View Analytics', icon: BarChart3 },
]

export const AdminDashboardPage = () => {
  usePageTitle('Admin Dashboard')
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => (await adminService.getAnalytics()).data.data,
  })

  const stats = [
    { label: 'Total Courses', value: data?.totalCourses, icon: BookOpen },
    { label: 'Total Videos', value: data?.totalVideos, icon: PlayCircle },
    { label: 'Total Users', value: data?.totalUsers, icon: Users },
    { label: 'Total Views', value: data?.totalViews, icon: BarChart3 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold">{value ?? 0}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <p className="font-medium">{label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Manage Courses</h2>
        <Link to="/admin/courses">
          <Button variant="outline">Go to Courses</Button>
        </Link>
      </section>
    </div>
  )
}
