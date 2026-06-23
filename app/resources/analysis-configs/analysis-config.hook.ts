/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IQueryConfig, IQueryParams } from '../config'
import {
  createAnalysisConfig,
  deleteAnalysisConfig,
  getAnalysisConfig,
  getAnalysisConfigs,
  getAnalysisConfigProviders,
  updateAnalysisConfig,
} from './analysis-config.queries'
import { IAnalysisConfigInput } from './analysis-config.type'
import { IAnalysisConfig } from './analysis-config.type'
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

export const analysisConfigQueryKeys = {
  all: ['analysis-configs'] as const,
  lists: () => [...analysisConfigQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...analysisConfigQueryKeys.lists(), config, params] as const,
  providers: (config: IQueryConfig) =>
    [...analysisConfigQueryKeys.all, 'providers', config] as const,
  details: () => [...analysisConfigQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...analysisConfigQueryKeys.details(), id] as const,
}

export function useAnalysisConfigs(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: analysisConfigQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getAnalysisConfigs(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useAnalysisConfig(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: analysisConfigQueryKeys.detail(id),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getAnalysisConfig(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!id && !!config.token,
  })
}

export function useAnalysisConfigProviders(
  config: IQueryConfig,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: analysisConfigQueryKeys.providers(config),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getAnalysisConfigProviders(config)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useCreateAnalysisConfig(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: IAnalysisConfig) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: IAnalysisConfigInput) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await createAnalysisConfig(config, body)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: analysisConfigQueryKeys.lists() })
      toast.success('Analysis config created successfully', { duration: 3000 })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error('Failed to create analysis config', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useUpdateAnalysisConfig(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: IAnalysisConfig) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<IAnalysisConfigInput> }) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await updateAnalysisConfig(config, id, body)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: analysisConfigQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: analysisConfigQueryKeys.detail(variables.id) })
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error('Failed to update analysis config', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useDeleteAnalysisConfig(
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

        return await deleteAnalysisConfig(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: analysisConfigQueryKeys.lists() })
      queryClient.removeQueries({ queryKey: analysisConfigQueryKeys.detail(id) })
      toast.success('Analysis config deleted successfully', { duration: 3000 })
      options?.onSuccess?.()
    },
    onError: (error) => {
      toast.error('Failed to delete analysis config', { description: error.message })
      options?.onError?.(error)
    },
  })
}
