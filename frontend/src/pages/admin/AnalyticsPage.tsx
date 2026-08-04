import { useQuery } from '@tanstack/react-query'
import { BarChart3, BookOpen, PlayCircle, Users } from 'lucide-react'
import { adminService } from '../../services/admin.service'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { usePageTitle } from '../../hooks/usePageTitle'

export const AnalyticsPage = () => {
  usePageTitle('Analytics')
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">High-level platform metrics.</p>
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

      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Detailed charts, per-course metrics, and view trends arrive in a future phase.
        </CardContent>
      </Card>
    </div>
  )
}
