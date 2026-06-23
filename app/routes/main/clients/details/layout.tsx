import useBreadcrumb from '@/hooks/useBreadcrumb'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'
import { useClient } from '@/resources/clients/client.hook'

export function loader({ params }: { params: { clientID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.clientID }
}

export default function CredentialDetailLayout() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/clients/${params.clientID}/overview`,
      icon: FileText,
    },
  ]

  const {
    data: client,
    isLoading,
    error,
  } = useClient({ apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }, params.clientID as string, {
    enabled: !!token,
  })

  const breadcrumbs = useBreadcrumb({
    pathname,
    params,
    apiUrl,
    nodeEnv,
    token: token ?? undefined,
  })

  const clientID = params.clientID

  if (!isLoading && (error || !client)) {
    return (
      <EmptyContent
        title="Client Not Found"
        image="/images/empty-client.png"
        description={`We can't find client with ID ${params.clientID}. ${(error as Error)?.message ?? ''}`}>
        <Button onClick={() => navigate('/clients')}>Back to Clients</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length === 0 || !token || !clientID}>
      <div className="max-w-screen-2xl mx-auto">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
