import { AppPreloader } from '@/components/misc/AppPreloader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnalysisConfig } from '@/resources/analysis-configs/analysis-config.hook'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { DateTime, useApp } from 'tessera-ui'

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
  }
}

export default function AnalysisConfigOverviewPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const { token, isLoadingIdenties } = useApp()

  const analysisConfigID = params.analysisConfigID as string
  const config = { apiUrl: apiUrl!, token: token!, nodeEnv }

  const { data: analysisConfig, isLoading } = useAnalysisConfig(config, analysisConfigID, {
    enabled: !!token && !isLoadingIdenties,
  })

  if (isLoadingIdenties || isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <Card className="card-center animate-slide-up">
      <CardHeader>
        <CardTitle>Analysis Config Detail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="d-list">
          <div className="d-item">
            <div className="d-label">Name</div>
            <div className="d-content">{analysisConfig?.name}</div>
          </div>
          <div className="d-item">
            <div className="d-label">Provider</div>
            <div className="d-content">{analysisConfig?.provider}</div>
          </div>
          <div className="d-item">
            <div className="d-label">Default</div>
            <div className="d-content">
              {analysisConfig?.is_default ? <Badge variant="secondary">Yes</Badge> : 'No'}
            </div>
          </div>
          <div className="d-item">
            <div className="d-label">Provider Params</div>
            <div className="d-content">
              {analysisConfig?.provider_params &&
              Object.keys(analysisConfig.provider_params).length > 0 ? (
                <pre className="rounded bg-muted px-3 py-2 text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(analysisConfig.provider_params, null, 2)}
                </pre>
              ) : (
                '-'
              )}
            </div>
          </div>
          <div className="d-item">
            <div className="d-label">Created At</div>
            <div className="d-content">
              {analysisConfig?.created_at ? <DateTime date={analysisConfig.created_at} /> : '-'}
            </div>
          </div>
          <div className="d-item">
            <div className="d-label">Updated At</div>
            <div className="d-content">
              {analysisConfig?.updated_at ? <DateTime date={analysisConfig.updated_at} /> : '-'}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate('/analysis-configs')}>
          Back
        </Button>
        <Button onClick={() => navigate(`/analysis-configs/${analysisConfigID}/edit`)}>Edit</Button>
      </CardFooter>
    </Card>
  )
}
