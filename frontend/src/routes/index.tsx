/* oxlint-disable react/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { ProtectedRoute } from '../components/protected/ProtectedRoute'
import { AdminRoute } from '../components/protected/AdminRoute'

const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })))
const AboutPage = lazy(() => import('../pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('../pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const CourseListPage = lazy(() => import('../pages/CourseListPage').then((m) => ({ default: m.CourseListPage })))
const CourseDetailsPage = lazy(() => import('../pages/CourseDetailsPage').then((m) => ({ default: m.CourseDetailsPage })))
const VideoPlayerPage = lazy(() => import('../pages/VideoPlayerPage').then((m) => ({ default: m.VideoPlayerPage })))
const ContinueWatchingPage = lazy(() =>
  import('../pages/ContinueWatchingPage').then((m) => ({ default: m.ContinueWatchingPage })),
)
const CommunityPage = lazy(() => import('../pages/CommunityPage').then((m) => ({ default: m.CommunityPage })))
const OAuthCallbackPage = lazy(() =>
  import('../pages/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage })),
)
const AdminDashboardPage = lazy(() =>
  import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const ManageCoursesPage = lazy(() =>
  import('../pages/admin/ManageCoursesPage').then((m) => ({ default: m.ManageCoursesPage })),
)
const CreateCoursePage = lazy(() =>
  import('../pages/admin/CreateCoursePage').then((m) => ({ default: m.CreateCoursePage })),
)
const UploadVideoPage = lazy(() =>
  import('../pages/admin/UploadVideoPage').then((m) => ({ default: m.UploadVideoPage })),
)
const ManageUsersPage = lazy(() =>
  import('../pages/admin/ManageUsersPage').then((m) => ({ default: m.ManageUsersPage })),
)
const ManageCommunityPage = lazy(() =>
  import('../pages/admin/ManageCommunityPage').then((m) => ({ default: m.ManageCommunityPage })),
)
const AnalyticsPage = lazy(() => import('../pages/admin/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })))

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
          { path: 'community', element: <CommunityPage /> },
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
          { path: 'community', element: <ManageCommunityPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
