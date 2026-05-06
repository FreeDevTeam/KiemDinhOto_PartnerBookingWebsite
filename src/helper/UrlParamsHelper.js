import { CheckApiKey } from './CheckApiKey'

/**
 * URL Param Manager
 * -----------------
 * File này gom tất cả logic liên quan đến query params từ URL.
 * Bao gồm:
 * - Lấy param với smart parse (số, boolean, null, JSON, string)
 * - Lấy tất cả params dưới dạng object
 * - Xoá param khỏi query
 * - Merge / build query string mới
 *
 * Dùng chung trong toàn project, tránh việc parse query lung tung ở nhiều chỗ.
 */

/**
 * Smart parser cho URL param
 * - "123" => number 123
 * - "true" => boolean true
 * - "false" => boolean false
 * - "null" / "undefined" / "" => null
 * - JSON object / array => parse JSON
 * - decode URI
 * - khác => string nguyên vẹn
 */
export const smartParseParam = (value) => {
  if (value === null || value === undefined) return null

  const trimmed = value.trim()

  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
    return null
  }

  if (trimmed === 'true') return true
  if (trimmed === 'false') return false

  if (!isNaN(trimmed) && trimmed !== '') {
    return Number(trimmed)
  }

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed)
    } catch {}
  }

  try {
    return decodeURIComponent(trimmed)
  } catch {
    return trimmed
  }
}

/**
 * Lấy giá trị param từ URL theo key, đã parse sẵn
 * Ví dụ: getUrlParamValue("referUserId"),
 * Mặc định lấy từ window.location.search, nếu truyền search của location.search của useLocaltion thì truyền vào
 */
export const getUrlParamValue = (key, search = window.location.search) => {
  const params = new URLSearchParams(search)
  const rawValue = params.get(key)
  return smartParseParam(rawValue)
}

/**
 * Lấy tất cả params từ URL, trả về object { key: parsedValue }
 * Mặc định lấy từ window.location.search, nếu truyền search của location.search của useLocaltion thì truyền vào
 */
export const getAllUrlParams = (search = window.location.search) => {
  const params = new URLSearchParams(search)
  const result = {}

  for (const [key, value] of params.entries()) {
    result[key] = smartParseParam(value)
  }

  return result
}

/**
 * Xoá các param khỏi query string
 * - keys: mảng key muốn xoá
 * - return: query string mới (không bao gồm ?)
 * Mặc định lấy từ window.location.search, nếu truyền search của location.search của useLocaltion thì truyền vào
 */
export const removeUrlParams = (keys = [], search = window.location.search) => {
  const params = new URLSearchParams(search)

  keys.forEach((key) => params.delete(key))

  return params.toString() // trả về "a=1&b=2"
}

/**
 * Merge params vào URL hiện tại
 * - newParams: object { key: value }
 * - return: query string mới (không bao gồm ?)
 * Mặc định lấy từ window.location.search, nếu truyền search của location.search của useLocaltion thì truyền vào
 */
export const mergeUrlParams = (newParams = {}, search = window.location.search) => {
  const params = new URLSearchParams(search)

  Object.entries(newParams).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      params.delete(key)
    } else {
      params.set(key, value.toString())
    }
  })

  return params.toString()
}

/**
 * Build query string từ object
 * - params: object { key: value }
 * - prefix: "?" hoặc "&" nếu muốn
 */
export const buildQueryString = (params = {}, prefix = '?') => {
  const urlParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      urlParams.set(key, value.toString())
    }
  })

  const str = urlParams.toString()
  return str ? `${prefix}${str}` : ''
}

/**
 * Append sdk params vào link nếu localStorage có đủ phoneNumber và apikey.
 * Nếu thiếu data hoặc lỗi truy cập localStorage, luôn trả về link gốc.
 */
export const AppendSdkPhoneApiParamsFromLocalStorage = (link) => {
  if (!link) {
    return link
  }

  try {
    const phoneNumber = (localStorage.getItem('phoneNumber') || '').trim()
    const apikey = (CheckApiKey() || '').trim()

    if (!phoneNumber || !apikey) {
      return link
    }

    const [pathname, rawSearch = ''] = link.split('?')
    const params = new URLSearchParams(rawSearch)

    params.set('sdkPhoneNumber', phoneNumber)
    params.set('phoneNumber', phoneNumber)
    params.set('apikey', apikey)

    const queryString = params.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  } catch (error) {
    return link
  }
}