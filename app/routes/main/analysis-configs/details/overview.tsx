import { AppPreloader } from '@/components/misc/AppPreloader'
import { DetailContent } from '@/components/detail-content/detail-content'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  useAnalysisConfig,
  useDeleteAnalysisConfig,
} from '@/resources/analysis-configs/analysis-config.hook'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { DateTime, useApp } from 'tessera-ui'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'

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
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const analysisConfigID = params.analysisConfigID as string
  const config = { apiUrl: apiUrl!, token: token!, nodeEnv }

  const { data: analysisConfig, isLoading } = useAnalysisConfig(config, analysisConfigID, {
    enabled: !!token && !isLoadingIdenties,
  })

  const { mutateAsync: deleteConfig } = useDeleteAnalysisConfig(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
      navigate('/analysis-configs')
    },
    onError: () => {
      deleteConfirmationRef.current?.updateConfig({ isLoading: false })
    },
  })

  const handleDelete = () => {
    deleteConfirmationRef.current?.open({
      title: 'Delete Analysis Config',
      description: `Are you sure you want to delete "${analysisConfig?.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef.current?.updateConfig({ isLoading: true })
        await deleteConfig(analysisConfigID)
      },
    })
  }

  if (isLoadingIdenties || isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <>
      <DetailContent
        title="Analysis Config Detail"
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost">
                <EllipsisVertical />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-2">
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() => navigate(`/analysis-configs/${analysisConfigID}/edit`)}>
                <Pencil />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                className="group flex w-full justify-start hover:bg-red-500"
                onClick={handleDelete}>
                <Trash2 className="group-hover:text-white" />
                <span className="group-hover:text-white">Delete</span>
              </Button>
            </PopoverContent>
          </Popover>
        }>
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
      </DetailContent>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </>
  )
}
