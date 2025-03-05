import { notification } from 'antd'
import { chatStore, userStore } from '@/store'

export type ResponseData<T> = {
  code: number
  data: T
  message: string
}

export type RequestConfig = { timeout?: number }

function isResponseData<T>(obj: any): obj is ResponseData<T> {
  return 'code' in obj && 'data' in obj && 'message' in obj
}

// 기본 도메인 이름 접두사가 필요한지 확인
const getBaseUrl = (url: string) => {
  const baseURL = import.meta.env.VITE_APP_REQUEST_HOST
  if (/^http(s?):\/\//i.test(url)) return url
  return baseURL + url
}

//헤더에서 변환 수행
function correctHeaders(
  method = 'GET',
  headers: HeadersInit & {
    'Content-Type'?: string
  } = {}
) {
  if (headers['Content-Type'] === 'multipart/form-data') {
    delete headers['Content-Type']
    return headers
  }
  if ((method === 'GET' || method === 'DELETE') && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }
  if ((method === 'POST' || method === 'PUT') && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  return headers
}

// 객체인지 확인
const isPlainObject = (obj: any) => {
  if (!obj || Object.prototype.toString.call(obj) !== '[object Object]' || obj instanceof FormData) {
    return false
  }
  const proto = Object.getPrototypeOf(obj)
  if (!proto) return true
  const Ctor = Object.prototype.hasOwnProperty.call(proto, 'constructor') && proto.constructor
  return typeof Ctor === 'function' && Ctor === Object
}

// 요청 인터셉터
const interceptorsRequest = (config: { url: string; options?: RequestInit }) => {
  console.log('요청 인터셉터', config)
  const options = {
    ...config.options,
    headers: {
      ...config.options?.headers,
      token: userStore.getState().token
    }
  }
  return { ...options }
}

// 응답 인터셉터
const interceptorsResponse = async <T>(options: any, response: any): Promise<ResponseData<T>> => {
  console.log('응답 인터셉터:', options, response)
  let data: ResponseData<T> = await response.json()

  if (!isResponseData(data)) {
    data = {
      code: response.status === 200 ? 0 : response.status,
      data: (data as any)?.data ? (data as any).data : data,
      message: ''
    }
  }

  if (data.code) {
    if (response.status === 401 && data.code === 4001) {
      userStore.getState().logout()
      chatStore.getState().clearChats()
    }
    if (data.message) {
      notification.error({
        message: '실수',
        description: data.message ? data.message : '네트워크 요청 오류',
        style: {
          top: 60,
          zIndex: 1011
        }
      })
    }
  }
  return data
}

// 오류 인터셉터
const interceptorsErrorResponse = async (data: ResponseData<any>) => {
  notification.error({
    message: '실수',
    description: data.message ? data.message : '네트워크 요청 오류',
    style: {
      top: 60,
      zIndex: 1011
    }
  })
}

// 묻다
const request = <T>(
  url: string,
  options?: RequestInit | { [key: string]: any },
  config?: RequestConfig
): Promise<ResponseData<T>> => {
  // 시간 초과
  const { timeout = 15000 } = config || {}
  let timeoutId: string | number | NodeJS.Timeout | null | undefined = null

  if (typeof url !== 'string') throw new TypeError('url must be required and of string type!')
  url = getBaseUrl(url)

  const controller = new AbortController()
  const signal = controller.signal

  options = {
    method: 'GET',
    // 요청 컨트롤러
    signal,
    ...options,
    headers: correctHeaders(options?.method, options?.headers)
  }

  // 가져오기 요청 인터셉터
  options = interceptorsRequest({
    url,
    options
  })

  // 시간 초과 처리
  const timeoutPromise = (timeout: number): Promise<ResponseData<any>> => {
    if (timeout <= 0) {
      return new Promise(() => {
        // ======= 等待 =======
      })
    }
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        const data = { code: 504, data: [], message: '요청 시간이 초과되었습니다. 나중에 다시 시도해 주세요.' }
        interceptorsErrorResponse(data)
        controller.abort()
        resolve(data)
      }, timeout)
    })
  }

  // 요청 보내기
  const fetchPromise: Promise<ResponseData<T>> = new Promise((resolve, reject) => {
    fetch(url, options)
      .then(async (res) => {
        const response = await interceptorsResponse<T>(
          {
            url,
            options
          },
          res
        )
        await resolve(response)
      })
      .catch(async (error) => {
        if (error.name === 'AbortError') {
          // We know it's been canceled!
          return
        }
        const data = { code: 504, data: error, message: '네트워크에 이상이 있습니다. 나중에 다시 시도해 주세요.' }
        await interceptorsErrorResponse(data)
        await reject(data)
      })
      .finally(() => {
        timeoutId && clearTimeout(timeoutId)
      })
  })

  return Promise.race([timeoutPromise(timeout), fetchPromise])
}

const get = <T = unknown>(
  url: string,
  params: { [key: string]: any } | string = '',
  headers?: HeadersInit,
  config?: RequestConfig
) => {
  if (params && typeof params !== 'string' && isPlainObject(params)) {
    const tempArray: string[] = []
    for (const item in params) {
      if (item) {
        tempArray.push(`${item}=${params[item]}`)
      }
    }
    params = url.includes('?') ? tempArray.join('&') : `?${tempArray.join('&')}`
  }

  return request<T>(
    `${url}${params}`,
    {
      method: 'GET',
      headers
    },
    config
  )
}

const post = <T = unknown>(
  url: string,
  data?: { [key: string]: any } | string | any,
  headers?: HeadersInit,
  config?: RequestConfig
) => {
  let correctData = data
  if (isPlainObject(data)) {
    correctData = JSON.stringify(data)
  }
  return request<T>(
    url,
    {
      method: 'POST',
      headers,
      body: correctData
    },
    config
  )
}

const put = <T = unknown>(
  url: string,
  data?: { [key: string]: any } | string | any,
  headers?: HeadersInit,
  config?: RequestConfig
) => {
  let correctData = data
  if (isPlainObject(data)) {
    correctData = JSON.stringify(data)
  }
  return request<T>(
    url,
    {
      method: 'PUT',
      headers,
      body: correctData
    },
    config
  )
}

const del = <T = unknown>(
  url: string,
  params: { [key: string]: any } | string = '',
  headers?: HeadersInit,
  config?: RequestConfig
) => {
  if (params && typeof params !== 'string' && isPlainObject(params)) {
    const tempArray: string[] = []
    for (const item in params) {
      if (item) {
        tempArray.push(`${item}=${params[item]}`)
      }
    }
    params = url.includes('?') ? tempArray.join('&') : `?${tempArray.join('&')}`
  }

  return request<T>(
    `${url}${params}`,
    {
      method: 'DELETE',
      headers
    },
    config
  )
}

const postStreams = async <T>(
  url: string,
  data?: { [key: string]: any } | string | any,
  o?: {
    headers?: HeadersInit
    options?: { [key: string]: any }
  }
) => {
  const baseUrl = getBaseUrl(url)
  const options: { [key: string]: any } = interceptorsRequest({
    url,
    options: {
      method: 'POST',
      body: JSON.stringify(data),
      headers: correctHeaders('POST', o?.headers),
      ...o?.options
    }
  })
  const response = await fetch(baseUrl, options)
  if (
    response.headers.has('Content-Type') &&
    response.headers.get('Content-Type')?.includes('application/json')
  ) {
    const responseJson = await interceptorsResponse<T>(
      {
        url,
        options
      },
      response
    )
    return responseJson
  }
  return response
}

export default {
  get,
  post,
  put,
  del,
  postStreams
}
