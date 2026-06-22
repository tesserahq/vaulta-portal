/* eslint-disable @typescript-eslint/no-explicit-any */
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

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
  }
}

export default function ClientPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { getAccessTokenSilently } = useAuth0()
  const navigate = useNavigate()
  const [clients, setClients] = useState<IClient[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [clientDelete, setClientDelete] = useState<IClient>()
  const [token, setToken] = useState<string>('')
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)

  const getClients = async (skip: number = 0, limit: number = 100) => {
    setIsLoading(true)

    try {
      const token = await getAccessTokenSilently()
      const response = await fetchApi(`${apiUrl}/clients?page=${skip}&size${limit}`, token, nodeEnv)

      setClients(response)
      setToken(token)
    } catch (error: any) {
      toast.error(error.message)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    getClients()
  }, [])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // refresh credentials
      getClients()
    }
  }, [actionData])

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Clients</h1>
        <Button onClick={() => navigate('new')}>New Client</Button>
      </div>

      <div className="mt-4">
        {clients.length === 0 && (
          <EmptyContent
            image="/images/empty-client.png"
            title="Manage Your Clients with Ease"
            description="Add client info to keep everything in one place and make every interaction count.">
            <Button variant="black" onClick={() => navigate('new')}>
              Start Creating
            </Button>
          </EmptyContent>
        )}
        {clients.map((client) => {
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
                      onClick={() => {
                        deleteRef.current?.onOpen()
                        setClientDelete(client)
                      }}>
                      <Trash2 className="group-hover:text-white" />
                      <span className="group-hover:text-white">Delete</span>
                    </Button>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ModalDelete
        ref={deleteRef}
        alert="Client"
        title={`Delete "${clientDelete?.name}" client?`}
        data={{
          token: token,
          name: clientDelete?.name,
          id: clientDelete?.id,
        }}
      />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { id, token, name } = Object.fromEntries(formData)

  try {
    if (request.method === 'DELETE') {
      await fetchApi(`${apiUrl}/clients/${id}`, token.toString(), nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Client ${name} deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(convertError.status === 401 ? '/logout' : '/clients', {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
