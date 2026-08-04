import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { ProtectedRoute } from '../components/protected/ProtectedRoute'
import { AdminRoute } from '../components/protected/AdminRoute'
import { HomePage } from '../pages/HomePage'
import { AboutPage } from '../pages/AboutPage'
import { ContactPage } from '../pages/ContactPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ProfilePage } from '../pages/ProfilePage'
import { CourseListPage } from '../pages/CourseListPage'
import { CourseDetailsPage } from '../pages/CourseDetailsPage'
import { VideoPlayerPage } from '../pages/VideoPlayerPage'
import { ContinueWatchingPage } from '../pages/ContinueWatchingPage'
import { OAuthCallbackPage } from '../pages/OAuthCallbackPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { ManageCoursesPage } from '../pages/admin/ManageCoursesPage'
import { CreateCoursePage } from '../pages/admin/CreateCoursePage'
import { UploadVideoPage } from '../pages/admin/UploadVideoPage'
import { ManageUsersPage } from '../pages/admin/ManageUsersPage'
import { AnalyticsPage } from '../pages/admin/AnalyticsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'oauth/callback', element: <OAuthCallbackPage /> },
      { path: 'courses', element: <CourseListPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'continue-watching', element: <ContinueWatchingPage /> },
          { path: 'courses/:courseId', element: <CourseDetailsPage /> },
          { path: 'courses/:courseId/videos/:videoId', element: <VideoPlayerPage /> },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        element: <AdminRoute />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'courses', element: <ManageCoursesPage /> },
          { path: 'courses/new', element: <CreateCoursePage /> },
          { path: 'upload', element: <UploadVideoPage /> },
          { path: 'users', element: <ManageUsersPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
