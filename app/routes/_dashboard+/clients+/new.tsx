/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fetchApi } from '@/libraries/fetch'
import { clientSchema } from '@/schemas/client'
import { cn } from '@/utils/misc'
import { redirectWithToast } from '@/utils/toast.server'
import { useAuth0 } from '@auth0/auth0-react'
import { ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useNavigate, useNavigation } from '@remix-run/react'
import { AlertCircleIcon, Check, CheckCircle2Icon, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function ClientNewPage() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const actionData = useActionData<typeof action>()
  const [errorFields, setErrorFields] = useState<any>()
  const [token, setToken] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const { getAccessTokenSilently } = useAuth0()
  const [formValue, setFormValue] = useState<{ name: string; client_id: string }>({
    name: '',
    client_id: '',
  })

  const fetchToken = async () => {
    const token = await getAccessTokenSilently()

    if (token) setToken(token)
  }

  useEffect(() => {
    fetchToken()
  }, [])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }

    if (actionData?.success) {
      toast.success('Client created successfully')
      setErrorFields(null)
      setFormValue({ name: '', client_id: '' })
    }
  }, [actionData])

  return (
    <div className="content-center">
      <Card className="card-center">
        <CardHeader>
          <CardTitle>Create Client</CardTitle>
        </CardHeader>
        <CardContent>
          {actionData?.success && (
            <Alert variant="success" className="mb-3">
              <CheckCircle2Icon size={18} className="dark:text-green-100" />
              <AlertTitle>
                Make sure to copy your personal token now. You won&apos;t be able to see
                it again!
              </AlertTitle>
              <AlertDescription>
                <div className="flex items-center gap-2">
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-green-100 px-3 py-2 text-sm dark:bg-green-600">
                    <span className="font-mono font-medium dark:text-white">
                      {actionData?.data?.secret}
                    </span>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-5 w-5 dark:bg-transparent dark:text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(actionData?.data?.secret)
                              setIsCopied(true)

                              setTimeout(() => setIsCopied(false), 2000)
                            }}>
                            {isCopied ? <Check /> : <Copy />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="font-sans">Copy token</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Form method="POST">
            <input name="token" type="hidden" value={token} />
            <div className="mb-3">
              <Label className="required">Name</Label>
              <Input
                name="name"
                autoFocus
                value={formValue.name}
                onChange={(e) => setFormValue({ ...formValue, name: e.target.value })}
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
                value={formValue.client_id}
                onChange={(e) =>
                  setFormValue({ ...formValue, client_id: e.target.value })
                }
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
            <div className="mt-10 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/clients')}>
                Cancel
              </Button>
              <Button disabled={navigation.state === 'submitting'}>
                {navigation.state === 'submitting' ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
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
    const response = await fetchApi(`${apiUrl}/clients`, token, nodeEnv, {
      method: 'POST',
      body: JSON.stringify({
        name,
        client_id,
      }),
    })

    return { success: true, data: response }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(convertError.status === 401 ? '/logout' : '/clients/new', {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
