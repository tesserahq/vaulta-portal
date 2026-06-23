/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { clientSchema } from '@/schemas/client'
import { useClient, useUpdateClient } from '@/resources/clients/client.hook'
import { cn } from '@/utils/misc'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { AlertCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useApp } from 'tessera-ui'

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
  }
}

export default function ClientEditPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const { token, isLoadingIdenties } = useApp()
  const [errorFields, setErrorFields] = useState<any>()

  const clientID = params.clientID as string
  const config = { apiUrl: apiUrl!, token: token!, nodeEnv }

  const { data: client, isLoading } = useClient(config, clientID, {
    enabled: !!token && !isLoadingIdenties,
  })

  const { mutateAsync: updateClient, isPending } = useUpdateClient(config, {
    onSuccess: () => {
      toast.success('Client updated successfully')
      navigate('/clients')
    },
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const client_id = formData.get('client_id') as string

    const validated = clientSchema.safeParse({ name, client_id })

    if (!validated.success) {
      setErrorFields(validated.error.flatten().fieldErrors)
      return
    }

    setErrorFields(null)
    await updateClient({ id: clientID, body: { name, client_id } })
  }

  if (isLoadingIdenties || isLoading) {
    return <AppPreloader />
  }

  return (
    <div className="content-center pt-5">
      <Card className="card-center">
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Label className="required">Name</Label>
              <Input
                autoFocus
                name="name"
                defaultValue={client?.name}
                className={cn(errorFields?.name && 'input-error')}
              />
              {errorFields?.name && <span className="error-message">{errorFields.name}</span>}
            </div>
            <div className="mb-3">
              <Label className="required">Client ID</Label>
              <Input
                name="client_id"
                defaultValue={client?.client_id}
                className={cn(errorFields?.client_id && 'input-error')}
              />
              {errorFields?.client_id?.length > 0 && (
                <span className="error-message">{errorFields.client_id[0]}</span>
              )}
              <Alert
                variant={errorFields?.client_id?.length === 1 ? 'destructive' : 'warning'}
                className="mt-3">
                <AlertCircleIcon size={18} className="dark:text-blue-100" />
                <AlertTitle className="mb-1">Client ID must follow the following rules:</AlertTitle>
                <AlertDescription className="py-0">
                  <ul className="list-inside list-disc text-sm">
                    <li>Lowercase alphanumeric characters (a-z, 0-9)</li>
                    <li>Cannot start or end with a dash</li>
                    <li>No underscores (_), uppercase letters, or other special characters</li>
                    <li>Must be ≤ 63 characters in length</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
            <div className="mt-10 flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/clients')}>
                Cancel
              </Button>
              <Button disabled={isPending}>{isPending ? 'Updating...' : 'Update'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
