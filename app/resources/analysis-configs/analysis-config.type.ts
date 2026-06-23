export interface IAnalysisConfig {
  id: string
  name: string
  provider: string
  is_default: boolean
  provider_params: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface IAnalysisConfigInput {
  name: string
  provider: string
  is_default: boolean
  provider_params: Record<string, unknown>
}

export interface IAnalysisConfigProvider {
  id: string
  label: string
}
