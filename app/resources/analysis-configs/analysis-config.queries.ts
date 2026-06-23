import { fetchApi } from '@/libraries/fetch'
import { IQueryConfig, IQueryParams } from '../config'
import { IPaging } from '@/types/pagination'
import {
  IAnalysisConfig,
  IAnalysisConfigInput,
  IAnalysisConfigProvider,
} from './analysis-config.type'

export async function getAnalysisConfigs(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<IAnalysisConfig>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const response = await fetchApi(`${apiUrl}/analysis-configs`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return response as Promise<IPaging<IAnalysisConfig>>
}

export async function getAnalysisConfig(
  config: IQueryConfig,
  id: string
): Promise<IAnalysisConfig> {
  const { apiUrl, token, nodeEnv } = config
  const response = await fetchApi(`${apiUrl}/analysis-configs/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return response as Promise<IAnalysisConfig>
}

export async function getAnalysisConfigProviders(
  config: IQueryConfig
): Promise<IPaging<IAnalysisConfigProvider>> {
  const { apiUrl, token, nodeEnv } = config
  const response = await fetchApi(`${apiUrl}/analysis-configs/providers`, token, nodeEnv, {
    method: 'GET',
  })

  return response as Promise<IPaging<IAnalysisConfigProvider>>
}

export async function createAnalysisConfig(
  config: IQueryConfig,
  body: IAnalysisConfigInput
): Promise<IAnalysisConfig> {
  const { apiUrl, token, nodeEnv } = config
  const response = await fetchApi(`${apiUrl}/analysis-configs`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return response
}

export async function updateAnalysisConfig(
  config: IQueryConfig,
  id: string,
  body: Partial<IAnalysisConfigInput>
): Promise<IAnalysisConfig> {
  const { apiUrl, token, nodeEnv } = config
  const response = await fetchApi(`${apiUrl}/analysis-configs/${id}`, token, nodeEnv, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })

  return response as Promise<IAnalysisConfig>
}

export async function deleteAnalysisConfig(
  config: IQueryConfig,
  id: string
): Promise<{ message: string }> {
  const { apiUrl, token, nodeEnv } = config
  const response = await fetchApi(`${apiUrl}/analysis-configs/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })

  return response as Promise<{ message: string }>
}
