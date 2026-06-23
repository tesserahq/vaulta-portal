/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IQueryConfig, IQueryParams } from '../config'
import { createClient, deleteClient, getClient, getClients, updateClient } from './client.queries'
import { IClientInput } from './client.type'
import { IClient } from '@/types/client'
import { toast } from 'tessera-ui'

class QueryError extends Error {
  code?: string
  details?: unknown

  constructor(message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'QueryError'
    this.code = code
    this.details = details
  }
}

export const clientQueryKeys = {
  all: ['clients'] as const,
  lists: () => [...clientQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...clientQueryKeys.lists(), config, params] as const,
  details: () => [...clientQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientQueryKeys.details(), id] as const,
}

/**
 * Hook for fetching paginated clients
 */
export function useClients(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: clientQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getClients(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!config.token,
  })
}

/**
 * Hook to fetch a single client by ID
 */
export function useClient(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: clientQueryKeys.detail(id),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getClient(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!id && !!config.token,
  })
}

/**
 * Hook to create a client
 */
export function useCreateClient(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: IClient) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: IClientInput) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await createClient(config, body)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() })
      toast.success('Client created successfully', {
        duration: 3000,
      })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error('Failed to create client', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}

/**
 * Hook to update a client by ID
 */
export function useUpdateClient(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: IClient) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<IClientInput> }) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await updateClient(config, id, body)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.detail(variables.id) })

      options?.onSuccess?.(data)
    },
    onError(error) {
      toast.error('Failed to update client', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}

/**
 * Hook to delete a client by ID
 */
export function useDeleteClient(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await deleteClient(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: clientQueryKeys.lists() })
      queryClient.removeQueries({ queryKey: clientQueryKeys.detail(id) })
      toast.success('Client deleted successfully', {
        duration: 3000,
      })
      options?.onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to delete client', {
        description: error.message,
      })
      options?.onError?.(error)
    },
  })
}
