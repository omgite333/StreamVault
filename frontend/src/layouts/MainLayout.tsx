import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { ScrollToTop } from '../components/ScrollToTop'
import { PageLoader } from '../components/ui/page-loader'

export const MainLayout = () => (
  <div className="flex min-h-screen flex-col">
    <ScrollToTop />
    <Navbar />
    <main className="flex-1">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
)
