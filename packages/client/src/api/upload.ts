import type { AxiosRequestConfig } from 'axios'
import { service } from '~/utils'

export interface SingleProps {
  url: string
}

export interface UploadAlreadyProps {
  fileList: string[]
}

export function uploadSingle<T = SingleProps>(data: any, config?: AxiosRequestConfig<any>): Promise<T> {
  return service.post<any, T>('/uploadSingle', data, config)
}

export function uploadSingleBase64<T = SingleProps>(data: any): Promise<T> {
  return service.post<any, T>('/uploadSingleBase64', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

export function uploadWithHashName<T = SingleProps>(data: any): Promise<T> {
  return service.post<any, T>('/uploadWithHashName', data)
}

export function uploadAlready<T = UploadAlreadyProps>(params: {
  HASH: string
}): Promise<T> {
  return service.get<any, T>('/uploadAlready', {
    params,
  })
}

export function isFileExist<T = SingleProps>(params: {
  HASH: string
  suffix: string
}): Promise<T> {
  return service.get<any, T>('/isFileExist', {
    params,
  })
}

export function uploadChunk<T = SingleProps>(data: any, config?: AxiosRequestConfig<any>): Promise<T> {
  return service.post<any, T>('/uploadChunk', data, config)
}

export function mergeChunk<T = SingleProps>(data: {
  HASH: string
  suffix: string
  count: number
}): Promise<T> {
  return service.post<any, T>('/mergeChunk', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}
