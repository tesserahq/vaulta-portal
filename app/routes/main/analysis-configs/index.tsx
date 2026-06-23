import { AppPreloader } from '@/components/misc/AppPreloader'
import EmptyContent from '@/components/misc/EmptyContent'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Separator from '@/components/ui/separator'
import { formatDateAgo } from '@/utils/date-format'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import {
  useAnalysisConfigs,
  useDeleteAnalysisConfig,
} from '@/resources/analysis-configs/analysis-config.hook'
import { IAnalysisConfig } from '@/resources/analysis-configs/analysis-config.type'
import { format } from 'date-fns'
import { EllipsisVertical, EyeIcon, Pencil, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router'
import { useApp, NewButton } from 'tessera-ui'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'

export async function loader({ request }: { request: Request }) {
  const pagination = ensureCanonicalPagination(request, {
    defaultSize: 25,
    defaultPage: 1,
  })

  if (pagination instanceof Response) {
    return pagination
  }

  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, pagination }
}

export default function AnalysisConfigsPage() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const { token, isLoadingIdenties } = useApp()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv }

  const { data, isLoading } = useAnalysisConfigs(
    config,
    { page: pagination.page, size: pagination.size },
    { enabled: !!token && !isLoadingIdenties }
  )

  const { mutateAsync: deleteConfig } = useDeleteAnalysisConfig(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
    onError: () => {
      deleteConfirmationRef.current?.updateConfig({ isLoading: false })
    },
  })

  const handleDelete = (config: IAnalysisConfig) => {
    deleteConfirmationRef.current?.open({
      title: 'Delete Analysis Config',
      description: `Are you sure you want to delete "${config.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef.current?.updateConfig({ isLoading: true })
        await deleteConfig(config.id)
      },
    })
  }

  if (isLoading || isLoadingIdenties) {
    return <AppPreloader />
  }

  return (
    <div className="animate-slide-up page-content">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Analysis Configs</h1>
        <NewButton onClick={() => navigate('new')} label="New Config" />
      </div>

      <div className="mt-4">
        {data?.total === 0 ? (
          <EmptyContent
            image="/images/empty-client.png"
            title="No Analysis Configs Yet"
            description="Create an analysis config to define provider settings for your analyses.">
            <Button variant="black" onClick={() => navigate('new')}>
              Start Creating
            </Button>
          </EmptyContent>
        ) : (
          data?.items.map((item) => (
            <Card key={item.id} className="mb-2.5 shadow-card">
              <CardContent className="flex items-center gap-2 pt-4">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Link
                      to={item.id}
                      className="text-base font-medium text-black hover:text-primary hover:underline
                        dark:text-primary-foreground">
                      {item.name}
                    </Link>
                    {item.is_default && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <span>Provider: {item.provider}</span>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <span>Updated {formatDateAgo(item.updated_at)}</span>
                    <Separator orientation="vertical" className="mx-2 h-4" />
                    <span>Created {format(item.created_at, 'dd MMM yyyy')}</span>
                  </div>
                </div>
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
                      onClick={() => navigate(item.id)}>
                      <EyeIcon />
                      <span>View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex w-full justify-start"
                      onClick={() => navigate(`${item.id}/edit`)}>
                      <Pencil />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="group flex w-full justify-start hover:bg-red-500"
                      onClick={() => handleDelete(item)}>
                      <Trash2 className="group-hover:text-white" />
                      <span className="group-hover:text-white">Delete</span>
                    </Button>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
