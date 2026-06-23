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
import {
  useAnalysisConfigProviders,
  useCreateAnalysisConfig,
} from '@/resources/analysis-configs/analysis-config.hook'
import { analysisConfigSchema } from '@/schemas/analysis-config'
import { cn } from '@/utils/misc'
import { useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router'
import { useApp } from 'tessera-ui'

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
  }
}

export default function AnalysisConfigNewPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const { token, isLoadingIdenties } = useApp()
  const [errorFields, setErrorFields] = useState<any>()
  const [formValue, setFormValue] = useState({
    name: '',
    provider: '',
    is_default: false,
    provider_params: '{}',
  })

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv }

  const { data: providers, isLoading: isLoadingProviders } = useAnalysisConfigProviders(config, {
    enabled: !!token && !isLoadingIdenties,
  })

  const { mutate: createConfig, isPending } = useCreateAnalysisConfig(config, {
    onSuccess: (data) => {
      setErrorFields(null)
      navigate(`/analysis-configs/${data.id}/overview`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let parsedParams: Record<string, unknown> = {}
    try {
      parsedParams = JSON.parse(formValue.provider_params || '{}')
    } catch {
      setErrorFields((prev: any) => ({
        ...prev,
        provider_params: ['Provider params must be valid JSON'],
      }))
      return
    }

    const validated = analysisConfigSchema.safeParse({
      name: formValue.name,
      provider: formValue.provider,
      is_default: formValue.is_default,
      provider_params: parsedParams,
    })

    if (!validated.success) {
      setErrorFields(validated.error.flatten().fieldErrors)
      return
    }

    if (!isLoadingIdenties && token) {
      createConfig(validated.data)
    }
  }

  if (isLoadingIdenties) {
    return <AppPreloader />
  }

  return (
    <div className="content-center pt-5">
      <Card className="card-center">
        <CardHeader>
          <CardTitle>Create Analysis Config</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <Label className="required">Name</Label>
              <Input
                name="name"
                autoFocus
                value={formValue.name}
                onChange={(e) => setFormValue({ ...formValue, name: e.target.value })}
                className={cn(errorFields?.name && 'input-error')}
              />
              {errorFields?.name && <span className="error-message">{errorFields.name[0]}</span>}
            </div>

            <div className="mb-3">
              <Label className="required">Provider</Label>
              <Select
                value={formValue.provider}
                onValueChange={(value) => setFormValue({ ...formValue, provider: value })}>
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
                name="provider_params"
                rows={4}
                value={formValue.provider_params}
                onChange={(e) => setFormValue({ ...formValue, provider_params: e.target.value })}
                className={cn('font-mono text-sm', errorFields?.provider_params && 'input-error')}
                placeholder="{}"
              />
              {errorFields?.provider_params && (
                <span className="error-message">{errorFields.provider_params[0]}</span>
              )}
            </div>

            <div className="mb-3 flex items-center gap-3">
              <Switch
                id="is_default"
                checked={formValue.is_default}
                onCheckedChange={(checked) => setFormValue({ ...formValue, is_default: checked })}
              />
              <Label htmlFor="is_default" className="mb-0">
                Set as default
              </Label>
            </div>

            <div className="mt-10 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/analysis-configs')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !formValue.name || !formValue.provider}>
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
