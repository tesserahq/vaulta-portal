/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fetchApi } from '@/libraries/fetch'
import { IClient } from '@/types/client'
import { useAuth0 } from '@auth0/auth0-react'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { Check, CheckCircle2Icon, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
    hostUrl: process.env.HOST_URL,
  }
}

export default function ClientDetailPage() {
  const { apiUrl, nodeEnv, hostUrl } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const { getAccessTokenSilently, logout } = useAuth0()
  const [client, setClient] = useState<IClient>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingRegenerate, setIsLoadingRegenerate] = useState<boolean>(false)
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const fetchClientDetail = async () => {
    try {
      const token = await getAccessTokenSilently()
      const response = await fetchApi(`${apiUrl}/clients/${params.id}`, token, nodeEnv)

      setClient(response)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      if (convertError.status === 401) {
        logout({ logoutParams: { returnTo: hostUrl } })
      }

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoading(false)
  }

  const regerateSecret = async () => {
    setIsLoadingRegenerate(true)

    try {
      const token = await getAccessTokenSilently()
      const response = await fetchApi(
        `${apiUrl}/clients/${params.id}/regenerate-secret`,
        token,
        nodeEnv,
        {
          method: 'POST',
          body: JSON.stringify({ client_id: params.client_id }),
        },
      )

      setClient(response)
      toast.success('Client secret regerated successfully')
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      if (convertError.status === 401) {
        logout({ logoutParams: { returnTo: hostUrl } })
      }

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoadingRegenerate(false)
  }

  useEffect(() => {
    fetchClientDetail()
  }, [])

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <div className="content-center">
      <Card className="card-center">
        <CardHeader>
          <CardTitle>Client Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {client?.secret && (
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
                      {client?.secret}
                    </span>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-5 w-5 dark:bg-transparent dark:text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(client?.secret || '')
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
          <div className="d-list">
            <div className="d-item">
              <div className="d-label">Name</div>
              <div className="d-content">{client?.name}</div>
            </div>
            <div className="d-item">
              <div className="d-label">Client ID</div>
              <div className="d-content">{client?.client_id}</div>
            </div>
            <div className="d-item">
              <div className="d-label">Created At</div>
              <div className="d-content">{format(client?.created_at || '', 'PPpp')}</div>
            </div>
            <div className="d-item">
              <div className="d-label">Updated At</div>
              <div className="d-content">{format(client?.updated_at || '', 'PPpp')}</div>
            </div>
            <div className="d-item">
              <div className="d-label">Secret Generated At</div>
              <div className="d-content">
                {format(client?.secret_generated_at || '', 'PPpp')}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => navigate(`/clients`)}>
            Back
          </Button>
          <Button disabled={isLoadingRegenerate} onClick={regerateSecret}>
            {isLoadingRegenerate ? 'Generating Secret...' : 'Regenerate Secret'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
