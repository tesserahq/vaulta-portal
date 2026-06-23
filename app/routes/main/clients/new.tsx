/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCreateClient } from '@/resources/clients/client.hook'
import { IClient } from '@/types/client'
import { clientSchema } from '@/schemas/client'
import { formatString } from '@/utils/format-string'
import { cn } from '@/utils/misc'
import { useNavigate, useLoaderData } from 'react-router'
import { AlertCircleIcon, Check, CheckCircle2Icon, Copy } from 'lucide-react'
import { useState } from 'react'
import { DateTime, useApp } from 'tessera-ui'

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
  }
}

export default function ClientNewPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const { token, isLoadingIdenties } = useApp()
  const [errorFields, setErrorFields] = useState<any>()
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [createdClient, setCreatedClient] = useState<IClient | null>(null)
  const [formValue, setFormValue] = useState<{ name: string; client_id: string }>({
    name: '',
    client_id: '',
  })

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv }

  const { mutate: createClient, isPending } = useCreateClient(config, {
    onSuccess: (data) => {
      setCreatedClient(data)
      setErrorFields(null)
      setFormValue({ name: '', client_id: '' })
    },
  })

  const onValidateClientID = (value: string) => {
    const errors: string[] = []

    if (!value) {
      errors.push('Cliend ID is required')
    }

    // 1. Must be lowercase alphanumeric characters (a-z, 0-9) and dash
    if (!/^[a-z0-9-]*$/.test(value)) {
      errors.push(
        'Client ID must contain only lowercase letters (a-z), numbers (0-9), no space and dashes (-).'
      )
    }

    // 2. Cannot start with a dash
    if (/^-/.test(value)) {
      errors.push('Client ID cannot start with a dash (-).')
    }

    // 3. Cannot end with a dash
    if (/-$/.test(value)) {
      errors.push('Client ID cannot end with a dash (-).')
    }

    // 5. Must be ≤ 63 characters in length
    if (value.length > 63) {
      errors.push('Client ID must be 63 characters or less.')
    }

    if (errors.length > 0) {
      setErrorFields((prev: any) => ({ ...prev, client_id: errors }))
    } else {
      setErrorFields((prev: any) => ({ ...prev, client_id: null }))
    }

    setFormValue({ ...formValue, client_id: value })
  }

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()

    const validated = clientSchema.safeParse(formValue)

    if (!validated.success) {
      setErrorFields(validated.error.flatten().fieldErrors)
      return
    }

    if (!isLoadingIdenties && token) {
      createClient(formValue)
    }
  }

  return (
    <div className="content-center pt-5">
      <Card className="card-center">
        <CardHeader>
          <CardTitle>Create Client</CardTitle>
        </CardHeader>
        <CardContent>
          {createdClient ? (
            <>
              <Alert variant="success" className="mb-3">
                <CheckCircle2Icon size={18} className="dark:text-green-100" />
                <AlertTitle>
                  Make sure to copy your personal token now. You won&apos;t be able to see it again!
                </AlertTitle>
                <AlertDescription>
                  <div className="flex items-center gap-2">
                    <div
                      className="mt-2 flex items-center justify-between rounded-lg bg-green-100 px-3
                        py-2 text-sm dark:bg-green-600">
                      <span className="font-mono font-medium dark:text-white">
                        {createdClient.secret}
                      </span>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2 h-5 w-5 dark:bg-transparent dark:text-white"
                              onClick={() => {
                                navigator.clipboard.writeText(createdClient.secret || '')
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
              <h3 className="mb-2 text-base font-medium">Client Details</h3>
              <div className="d-list">
                <dl className="d-item">
                  <dt className="d-label">Name</dt>
                  <dd className="d-content">{createdClient.name}</dd>
                </dl>
                <dl className="d-item">
                  <dt className="d-label">Client ID</dt>
                  <dd className="d-content">{createdClient.client_id}</dd>
                </dl>
                <dl className="d-item">
                  <dt className="d-label">Created At</dt>
                  <dd className="d-content">
                    {createdClient.created_at ? <DateTime date={createdClient.created_at} /> : '-'}
                  </dd>
                </dl>
                <dl className="d-item">
                  <dt className="d-label">Updated At</dt>
                  <dd className="d-content">
                    {createdClient.updated_at ? <DateTime date={createdClient.updated_at} /> : '-'}
                  </dd>
                </dl>
              </div>
              <div className="mt-3 flex justify-end">
                <Button type="button" variant="secondary" onClick={() => navigate('/clients')}>
                  Back
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <Label className="required">Name</Label>
                <Input
                  name="name"
                  autoFocus
                  value={formValue.name}
                  onChange={(e) => {
                    setFormValue({
                      name: e.target.value,
                      client_id: formatString('kebab-case', e.target.value),
                    })
                    setErrorFields({ ...errorFields, client_id: null })
                  }}
                  className={cn(errorFields?.name && 'input-error')}
                />
                {errorFields?.name && <span className="error-message">{errorFields.name}</span>}
              </div>
              <div className="mb-3">
                <Label className="required">Client ID</Label>
                <Input
                  name="client_id"
                  value={formValue.client_id}
                  onChange={(e) => onValidateClientID(e.target.value)}
                  className={cn(errorFields?.client_id && 'input-error')}
                />
                {errorFields?.client_id?.length > 0 && (
                  <span className="error-message !normal-case">{errorFields.client_id[0]}</span>
                )}
                <Alert variant="warning" className="mt-3">
                  <AlertCircleIcon size={18} className="dark:text-blue-100" />
                  <AlertTitle className="mb-1">
                    Client ID must follow the following rules:
                  </AlertTitle>
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
              <div className="mt-10 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => navigate('/clients')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    !formValue.name ||
                    !formValue.client_id ||
                    errorFields?.client_id?.length > 0
                  }>
                  {isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
