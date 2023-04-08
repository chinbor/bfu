import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import Qs from 'qs'

interface Response {
  code: number
  message: string | null
  success: boolean
  data: any
}

export const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  transformRequest(data, headers) {
    const contentType = headers['Content-Type']

    if (contentType === 'application/x-www-form-urlencoded')
      return Qs.stringify(data)

    return data
  },
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse<Response>) => {
    const { message, data, code } = response.data

    if (!+code)
      return data

    return Promise.reject(new Error(message || '一些不可预期错误'))
  },
  (error) => {
    return Promise.reject(error)
  },
)
