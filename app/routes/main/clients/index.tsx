import { AppPreloader } from '@/components/misc/AppPreloader'
import ModalDelete from '@/components/misc/DeleteConfirmation'
import EmptyContent from '@/components/misc/EmptyContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Separator from '@/components/ui/separator'
import { fetchApi } from '@/libraries/fetch'
import { IClient } from '@/types/client'
import { formatDateAgo } from '@/utils/date-format'
import { redirectWithToast } from '@/utils/toast.server'
import { useAuth0 } from '@auth0/auth0-react'
import type { ActionFunctionArgs } from 'react-router'
import { Link, useActionData, useLoaderData, useNavigate } from 'react-router'
import { format } from 'date-fns'
import { EllipsisVertical, EyeIcon, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useApp, NewButton } from 'tessera-ui'
import { useClients, useDeleteClient } from '@/resources/clients/client.hook'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
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

export default function ClientPage() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [clientDelete, setClientDelete] = useState<IClient>()
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)
  const { token, isLoadingIdenties } = useApp()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv }

  const { data, isLoading } = useClients(
    config,
    {
      page: pagination.page,
      size: pagination.size,
    },
    { enabled: !!token && !isLoadingIdenties }
  )

  const { mutateAsync: deleteClient } = useDeleteClient(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
    onError: () => {
      deleteConfirmationRef?.current?.updateConfig({ isLoading: false })
    },
  })

  const handleDelete = (client: IClient) => {
    deleteConfirmationRef.current?.open({
      title: 'Delete Client',
      description: `Are you sure you want to delete "${client.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteClient(client.id)
      },
    })
  }

  if (isLoading || isLoadingIdenties) {
    return <AppPreloader />
  }

  return (
    <div className="animate-slide-up page-content">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Clients</h1>
        <NewButton onClick={() => navigate('new')} label="New Client" />
      </div>

      <div className="mt-4">
        {data?.total === 0 ? (
          <EmptyContent
            image="/images/empty-client.png"
            title="Manage Your Clients with Ease"
            description="Add client info to keep everything in one place and make every interaction count.">
            <Button variant="black" onClick={() => navigate('new')}>
              Start Creating
            </Button>
          </EmptyContent>
        ) : (
          data?.items.map((client) => {
            return (
              <Card key={client.id} className="mb-2.5 shadow-card">
                <CardContent className="flex items-center gap-2 pt-4">
                  <div className="flex-1">
                    <Link
                      to={client.id}
                      className="mb-1 text-base font-medium text-black hover:text-primary
                        hover:underline dark:text-primary-foreground">
                      {client.name}
                    </Link>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        <span>Client ID : </span>
                        <span>{client.client_id}</span>
                      </div>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <span>Updated {formatDateAgo(client.updated_at)}</span>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <span>Created {format(client.created_at, 'dd MMM yyyy')}</span>
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
                        onClick={() => navigate(client.id)}>
                        <EyeIcon />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start"
                        onClick={() => navigate(`${client.id}/edit`)}>
                        <Pencil />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="group flex w-full justify-start hover:bg-red-500"
                        onClick={() => handleDelete(client)}>
                        <Trash2 className="group-hover:text-white" />
                        <span className="group-hover:text-white">Delete</span>
                      </Button>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
