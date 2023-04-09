import type { AxiosRequestConfig } from 'axios'
import { service } from '~/utils'

export interface SingleProps {
  url: string
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
