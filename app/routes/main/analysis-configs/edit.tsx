/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { analysisConfigSchema } from '@/schemas/analysis-config'
import {
  useAnalysisConfig,
  useAnalysisConfigProviders,
  useUpdateAnalysisConfig,
} from '@/resources/analysis-configs/analysis-config.hook'
import { cn } from '@/utils/misc'
import { useEffect, useState } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useApp } from 'tessera-ui'

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
  }
}

export default function AnalysisConfigEditPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const { token, isLoadingIdenties } = useApp()
  const [errorFields, setErrorFields] = useState<any>()
  const [providerParamsText, setProviderParamsText] = useState('{}')
  const [isDefault, setIsDefault] = useState(false)
  const [provider, setProvider] = useState('')

  const analysisConfigID = params.analysisConfigID as string
  const config = { apiUrl: apiUrl!, token: token!, nodeEnv }

  const { data: analysisConfig, isLoading } = useAnalysisConfig(config, analysisConfigID, {
    enabled: !!token && !isLoadingIdenties,
  })

  const { data: providers, isLoading: isLoadingProviders } = useAnalysisConfigProviders(config, {
    enabled: !!token && !isLoadingIdenties,
  })

  useEffect(() => {
    if (analysisConfig) {
      console.log('analysis ', analysisConfig)

      setIsDefault(analysisConfig.is_default)
      setProvider(analysisConfig.provider)
      setProviderParamsText(JSON.stringify(analysisConfig.provider_params ?? {}, null, 2))
    }
  }, [analysisConfig, providers])

  const { mutateAsync: updateConfig, isPending } = useUpdateAnalysisConfig(config, {
    onSuccess: () => {
      toast.success('Analysis config updated successfully')
      navigate('/analysis-configs')
    },
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string

    let parsedParams: Record<string, unknown> = {}
    try {
      parsedParams = JSON.parse(providerParamsText || '{}')
    } catch {
      setErrorFields((prev: any) => ({
        ...prev,
        provider_params: ['Provider params must be valid JSON'],
      }))
      return
    }

    const validated = analysisConfigSchema.safeParse({
      name,
      provider,
      is_default: isDefault,
      provider_params: parsedParams,
    })

    if (!validated.success) {
      setErrorFields(validated.error.flatten().fieldErrors)
      return
    }

    setErrorFields(null)
    await updateConfig({ id: analysisConfigID, body: validated.data })
  }

  if (isLoadingIdenties || isLoading || isLoadingProviders) {
    return <AppPreloader />
  }

  return (
    <div className="content-center pt-5">
      <Card className="card-center">
        <CardHeader>
          <CardTitle>Edit Analysis Config</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Label className="required">Name</Label>
              <Input
                autoFocus
                name="name"
                defaultValue={analysisConfig?.name}
                className={cn(errorFields?.name && 'input-error')}
              />
              {errorFields?.name && <span className="error-message">{errorFields.name[0]}</span>}
            </div>

            <div className="mb-3">
              <Label className="required">Provider</Label>
              <Select
                value={provider}
                onValueChange={(value) => {
                  if (value) setProvider(value)
                }}>
                <SelectTrigger className={cn(errorFields?.provider && 'input-error')}>
                  <SelectValue
                    placeholder={isLoadingProviders ? 'Loading providers...' : 'Select a provider'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {providers?.items.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorFields?.provider && (
                <span className="error-message">{errorFields.provider[0]}</span>
              )}
            </div>

            <div className="mb-3">
              <Label>Provider Params (JSON)</Label>
              <Textarea
                rows={4}
                value={providerParamsText}
                onChange={(e) => setProviderParamsText(e.target.value)}
                className={cn('font-mono text-sm', errorFields?.provider_params && 'input-error')}
                placeholder="{}"
              />
              {errorFields?.provider_params && (
                <span className="error-message">{errorFields.provider_params[0]}</span>
              )}
            </div>

            <div className="mb-3 flex items-center gap-3">
              <Switch id="is_default" checked={isDefault} onCheckedChange={setIsDefault} />
              <Label htmlFor="is_default" className="mb-0">
                Set as default
              </Label>
            </div>

            <div className="mt-10 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/analysis-configs')}>
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
