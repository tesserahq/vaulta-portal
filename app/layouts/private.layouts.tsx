import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { SITE_CONFIG } from '@/utils/config/site.config'
import { useRequestInfo } from '@/hooks/useRequestInfo'
import { BrainCircuit, Users } from 'lucide-react'
import { Outlet, useLocation, useNavigate, useParams, useSubmit } from 'react-router'
import { Layout, type MainItemProps } from 'tessera-ui'

export default function PrivateLayout() {
  const requestInfo = useRequestInfo()
  const submit = useSubmit()
  const navigate = useNavigate()
  const params = useParams()
  const { pathname } = useLocation()
  const isEditPage = pathname.includes('edit')
  const shouldCollapseSidebar =
    (Boolean(params['clientID']) || Boolean(params['analysisConfigID'])) && !isEditPage

  const onSetTheme = (theme: string) => {
    submit(
      { theme },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      }
    )
  }

  const menuItems: MainItemProps[] = [
    { title: 'Clients', path: '/clients', icon: Users },
    { title: 'Analysis Configs', path: '/analysis-configs', icon: BrainCircuit },
  ]

  return (
    <Layout.Main menuItems={menuItems} collapseSidebar={shouldCollapseSidebar}>
      <Layout.Header
        actionLogout={() => navigate('/logout')}
        actionProfile={() => {}}
        defaultAvatar=""
        onSetTheme={onSetTheme}
        defaultLogo={'/images/logo.png'}
        selectedTheme={requestInfo.userPrefs.theme || 'system'}
        title={SITE_CONFIG.siteTitle}
      />
      <Outlet />
    </Layout.Main>
  )
}
