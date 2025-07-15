/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchApi } from '@/libraries/fetch'
import { clientSchema } from '@/schemas/client'
import { IClient } from '@/types/client'
import { cn } from '@/utils/misc'
import { redirectWithToast } from '@/utils/toast.server'
import { useAuth0 } from '@auth0/auth0-react'
import { ActionFunctionArgs } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from '@remix-run/react'
import { AlertCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
    hostUrl: process.env.HOST_URL,
  }
}

export default function ClientEditPage() {
  const { apiUrl, nodeEnv, hostUrl } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const params = useParams()
  const navigate = useNavigate()
  const { getAccessTokenSilently, logout } = useAuth0()
  const [client, setClient] = useState<IClient>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [token, setToken] = useState<string>('')
  const [errorFields, setErrorFields] = useState<any>()

  const fetchClientDetail = async () => {
    try {
      const token = await getAccessTokenSilently()
      const response = await fetchApi(`${apiUrl}/clients/${params.id}`, token, nodeEnv)

      setClient(response)
      setToken(token)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      if (convertError.status === 401) {
        logout({ logoutParams: { returnTo: hostUrl } })
      }

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchClientDetail()
  }, [])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <div className="content-center">
      <Card className="card-center">
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="PUT">
            <input name="token" value={token} type="hidden" />
            <div className="mb-3">
              <Label className="required">Name</Label>
              <Input
                autoFocus
                name="name"
                defaultValue={client?.name}
                className={cn(errorFields?.name && 'input-error')}
              />
              {errorFields?.name && (
                <span className="error-message">{errorFields.name}</span>
              )}
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
                <AlertTitle className="mb-1">
                  Client ID must follow the following rules:
                </AlertTitle>
                <AlertDescription className="py-0">
                  <ul className="list-inside list-disc text-sm">
                    <li>Lowercase alphanumeric characters (a-z, 0-9)</li>
                    <li>Cannot start or end with a dash</li>
                    <li>
                      No underscores (_), uppercase letters, or other special characters
                    </li>
                    <li>Must be ≤ 63 characters in length</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
            <div className="mt-10 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/clients')}>
                Cancel
              </Button>
              <Button disabled={navigation.state === 'submitting'}>
                {navigation.state === 'submitting' ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const id = params.id as string

  const token = formData.get('token') as string
  const name = formData.get('name') as string
  const client_id = formData.get('client_id') as string

  const validated = clientSchema.safeParse({
    name,
    client_id,
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    await fetchApi(`${apiUrl}/clients/${id}`, token, nodeEnv, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        client_id,
      }),
    })

    return redirectWithToast('/clients', {
      type: 'success',
      title: 'Success',
      description: 'Client updated successfully',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(convertError.status === 401 ? '/logout' : `/clients/${id}`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
