import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { Background } from './components/Background'
import { useThemeStore } from './store/theme.store'

function App() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  return (
    <>
      <Background />
      <RouterProvider router={router} />
    </>
  )
}

export default App
