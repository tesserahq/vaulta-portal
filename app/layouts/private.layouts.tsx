import { AppPreloader } from '@/components/misc/AppPreloader'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { SITE_CONFIG } from '@/utils/config/site.config'
import { useRequestInfo } from '@/hooks/useRequestInfo'
import { useAuth0 } from '@auth0/auth0-react'
import { Home, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLoaderData, useSubmit } from 'react-router'
import { Layout, type MainItemProps, TesseraProvider } from 'tessera-ui'

export function loader() {
  const identiesApiUrl = process.env.IDENTIES_API_URL

  // app host urls (used by the global header/app-switcher)
  const quoreHostUrl = process.env.QUORE_HOST_URL
  const looplyHostUrl = process.env.LOOPLY_HOST_URL
  const vaultaHostUrl = process.env.VAULTA_HOST_URL
  const identiesHostUrl = process.env.IDENTIES_HOST_URL
  const orchaHostUrl = process.env.ORCHA_HOST_URL
  const custosHostUrl = process.env.CUSTOS_HOST_URL
  const indexaHostUrl = process.env.INDEXA_HOST_URL
  const sendlyHostUrl = process.env.SENDLY_HOST_URL

  return {
    identiesApiUrl,
    quoreHostUrl,
    looplyHostUrl,
    vaultaHostUrl,
    identiesHostUrl,
    orchaHostUrl,
    custosHostUrl,
    indexaHostUrl,
    sendlyHostUrl,
  }
}

export default function PrivateLayout() {
  const {
    identiesApiUrl,
    quoreHostUrl,
    looplyHostUrl,
    vaultaHostUrl,
    identiesHostUrl,
    orchaHostUrl,
    custosHostUrl,
    indexaHostUrl,
    sendlyHostUrl,
  } = useLoaderData<typeof loader>()

  const requestInfo = useRequestInfo()
  const submit = useSubmit()

  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [token, setToken] = useState<string>('')

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

  const fetchToken = async () => {
    const token = await getAccessTokenSilently()
    setToken(token)
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchToken().catch(() => {})
    }
  }, [isLoading, isAuthenticated])

  const appHostUrls = {
    quore: quoreHostUrl || '',
    looply: looplyHostUrl || '',
    vaulta: vaultaHostUrl || '',
    identies: identiesHostUrl || '',
    orcha: orchaHostUrl || '',
    custos: custosHostUrl || '',
    indexa: indexaHostUrl || '',
    sendly: sendlyHostUrl || '',
  }

  const menuItems: MainItemProps[] = [{ title: 'Clients', path: '/clients', icon: Users }]

  if (isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <TesseraProvider identiesApiUrl={identiesApiUrl || ''} token={token}>
      <Layout.Main menuItems={menuItems}>
        <Layout.Header
          appHostUrls={appHostUrls}
          actionLogout={() => {}}
          actionProfile={() => {}}
          defaultAvatar=""
          onSetTheme={onSetTheme}
          selectedTheme={requestInfo.userPrefs.theme || 'system'}
          title={SITE_CONFIG.siteTitle}
        />
        <Outlet />
      </Layout.Main>
    </TesseraProvider>
  )
}
