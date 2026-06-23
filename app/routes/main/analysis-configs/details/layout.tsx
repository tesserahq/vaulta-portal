import useBreadcrumb from '@/hooks/useBreadcrumb'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'
import { useAnalysisConfig } from '@/resources/analysis-configs/analysis-config.hook'

export function loader({ params }: { params: { analysisConfigID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.analysisConfigID }
}

export default function AnalysisConfigDetailLayout() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/analysis-configs/${params.analysisConfigID}/overview`,
      icon: FileText,
    },
  ]

  const {
    data: analysisConfig,
    isLoading,
    error,
  } = useAnalysisConfig(
    { apiUrl: apiUrl!, token: token!, nodeEnv },
    params.analysisConfigID as string,
    { enabled: !!token }
  )

  const breadcrumbs = useBreadcrumb({
    pathname,
    params,
    apiUrl,
    nodeEnv,
    token: token ?? undefined,
  })

  const analysisConfigID = params.analysisConfigID

  if (!isLoading && (error || !analysisConfig)) {
    return (
      <EmptyContent
        title="Analysis Config Not Found"
        image="/images/empty-client.png"
        description={`We can't find analysis config with ID ${params.analysisConfigID}. ${(error as Error)?.message ?? ''}`}>
        <Button onClick={() => navigate('/analysis-configs')}>Back to Analysis Configs</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length === 0 || !token || !analysisConfigID}>
      <div className="max-w-screen-2xl mx-auto">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
