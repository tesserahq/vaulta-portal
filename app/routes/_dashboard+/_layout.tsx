/* eslint-disable @typescript-eslint/no-explicit-any */
import Header from '@/components/misc/Header'
import SidebarPanel, { IMenuItemProps } from '@/components/misc/Sidebar/SidebarPanel'
import SidebarPanelMin from '@/components/misc/Sidebar/SidebarPanelMin'
import { fetchApi } from '@/libraries/fetch'
import '@/styles/customs/sidebar.css'
import { IUser } from '@/types/user'
import { cn } from '@/utils/misc'
import { useAuth0 } from '@auth0/auth0-react'
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react'
import { Home, Users } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const identitiesApiUrl = process.env.IDENTITIES_API_URL

  return { apiUrl, nodeEnv, identitiesApiUrl }
}

export default function Layout() {
  const { identitiesApiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const [isExpanded, setIsExpanded] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { getAccessTokenSilently } = useAuth0()
  const navigate = useNavigate()
  const [user, setUser] = useState<IUser>()

  const menuItems: IMenuItemProps[] = [
    {
      title: 'Home',
      path: `/home`,
      icon: <Home size={18} />,
    },
    {
      title: 'Clients',
      path: '/clients',
      icon: <Users size={18} />,
    },
  ]

  const onResize = useCallback(() => {
    if (containerRef.current) {
      if (containerRef.current.offsetWidth <= 1280) {
        setIsExpanded(false)
      }
    }
  }, [])

  const fetchUser = async () => {
    try {
      const token = await getAccessTokenSilently()
      const user = await fetchApi(`${identitiesApiUrl}/user`, token, nodeEnv!)
      setUser(user)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      if (convertError.status === 401) {
        navigate('/logout')
      }

      toast.error(`${convertError.status} - ${convertError.error}`)
    }
  }

  useEffect(() => {
    onResize()

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('has-min-sidebar is-header-blur', isExpanded && 'is-sidebar-open')}>
      <div id="root" className="min-h-100vh flex grow">
        <div className="sidebar print:hidden">
          <SidebarPanel
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            menuItems={menuItems}
          />
          <SidebarPanelMin
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            menuItems={menuItems}
          />
        </div>

        <Header
          user={user!}
          withSidebar
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />

        <main className="main-content w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
