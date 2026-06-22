import {
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
  useLoaderData,
  useNavigate,
} from 'react-router'
import type { LinksFunction, LoaderFunctionArgs } from 'react-router'
import { AuthProvider } from 'tessera-ui'

// Import global CSS styles for the application
// The ?url query parameter tells the bundler to handle this as a URL import
import RootCSS from '@/styles/root.css?url'
import SpinnerCSS from '@/styles/customs/spinner.css?url'
import { SITE_CONFIG } from '@/constants/brand'
import { combineHeaders, getDomainUrl } from '@/utils/misc.server'
import { getToastSession } from '@/utils/toast.server'
import { getHints } from '@/hooks/useHints'
import { getTheme, Theme, useTheme } from '@/hooks/useTheme'
import i18nServer, { localeCookie } from '@/modules/i18n/i18n.server'
import { Toaster } from '@/components/ui/sonner'
import { ClientHintCheck } from '@/components/misc/ClientHints'
import { useNonce } from '@/hooks/useNonce'
import { useToast } from '@/hooks/useToast'
import { GenericErrorBoundary } from '@/components/misc/ErrorBoundary'
import { ProgressBar } from './components/misc/ProgressBar'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const handle = { i18n: ['translation'] }

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data ? `${SITE_CONFIG.siteTitle}` : `Error | ${SITE_CONFIG.siteTitle}`,
    },
    {
      name: 'description',
      content: SITE_CONFIG.siteDescription,
    },
  ]
}

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: RootCSS },
    { rel: 'stylesheet', href: SpinnerCSS },
  ]
}

export type LoaderData = Exclude<Awaited<ReturnType<typeof loader>>, Response>

export async function loader({ request }: LoaderFunctionArgs) {
  const user = null

  const locale = await i18nServer.getLocale(request)
  const { toast, headers: toastHeaders } = await getToastSession(request)
  const clientID = process.env.AUTH0_CLIENT_ID
  const domain = process.env.AUTH0_DOMAIN
  const audience = process.env.AUTH0_AUDIENCE
  const organizationID = process.env.AUTH0_ORGANIZATION_ID
  const hostUrl = process.env.HOST_URL
  const identiesApiUrl = process.env.IDENTIES_API_URL

  return data(
    {
      hostUrl,
      user,
      locale,
      toast,
      clientID,
      domain,
      audience,
      identiesApiUrl,
      organizationID,
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userPrefs: { theme: getTheme(request) },
      },
    } as const,
    {
      headers: combineHeaders({ 'Set-Cookie': await localeCookie.serialize(locale) }, toastHeaders),
    }
  )
}

function Document({
  children,
  nonce,
  lang = 'en',
  dir = 'ltr',
  theme = 'light',
}: {
  children: React.ReactNode
  nonce: string
  lang?: string
  dir?: 'ltr' | 'rtl'
  theme?: Theme
}) {
  return (
    <html
      lang={lang}
      dir={dir}
      className={`${theme} overflow-x-hidden`}
      style={{ colorScheme: theme }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
          rel="stylesheet"></link>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <Links />
      </head>
      <body className="h-auto w-full">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <Toaster closeButton position="top-right" theme={theme} richColors />
      </body>
    </html>
  )
}

export default function AppWithProviders() {
  const { locale, toast, clientID, domain, audience, hostUrl, identiesApiUrl, organizationID } =
    useLoaderData<typeof loader>()

  const nonce = useNonce()
  const theme = useTheme()
  const navigate = useNavigate()
  const { i18n } = useTranslation()

  // Updates the i18n instance language.
  useEffect(() => {
    if (locale) {
      i18n.changeLanguage(locale).catch(() => {})
    }
  }, [i18n, locale])

  // Renders toast (if any).
  useToast(toast)

  return (
    <Document nonce={nonce} theme={theme} lang={locale ?? 'en'}>
      <ProgressBar />
      <AuthProvider
        auth0={{
          domain: domain ?? '',
          clientId: clientID ?? '',
          audience: audience ?? '',
          organizationID: organizationID ?? '',
          redirectUri: hostUrl || 'http://localhost:3000',
        }}
        identiesApiUrl={identiesApiUrl ?? ''}
        onUnauthenticated={() => {
          navigate('/')
        }}
        requireAuth={false}>
        <Outlet />
      </AuthProvider>
    </Document>
  )
}

export function ErrorBoundary() {
  const nonce = useNonce()
  const theme = useTheme()

  return (
    <Document nonce={nonce} theme={theme}>
      <GenericErrorBoundary
        statusHandlers={{
          403: ({ error }) => <p>You are not allowed to do that: {error?.data.message}</p>,
        }}
      />
    </Document>
  )
}
