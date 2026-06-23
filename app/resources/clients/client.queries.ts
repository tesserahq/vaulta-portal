import { fetchApi } from '@/libraries/fetch'
import { IQueryConfig, IQueryParams } from '../config'
import { IPaging } from '@/types/pagination'
import { IClient } from '@/types/client'
import { IClientInput } from './client.type'

export async function getClients(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<IClient>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const response = await fetchApi(`${apiUrl}/clients`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return response as Promise<IPaging<IClient>>
}

export async function getClient(config: IQueryConfig, id: string): Promise<IClient> {
  const { apiUrl, token, nodeEnv } = config
  const response = await fetchApi(`${apiUrl}/clients/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return response as Promise<IClient>
}

export async function createClient(config: IQueryConfig, body: IClientInput): Promise<IClient> {
  const { apiUrl, token, nodeEnv } = config
  const response = await fetchApi(`${apiUrl}/clients`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return response
}

export async function updateClient(
  config: IQueryConfig,
  id: string,
  body: Partial<IClientInput>
): Promise<IClient> {
  const { apiUrl, token, nodeEnv } = config
  const response = await fetchApi(`${apiUrl}/clients/${id}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  return response as Promise<IClient>
}

export async function deleteClient(config: IQueryConfig, id: string): Promise<{ message: string }> {
  const { apiUrl, token, nodeEnv } = config
  const response = await fetchApi(`${apiUrl}/clients/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })

  return response as Promise<{ message: string }>
}
