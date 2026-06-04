import { CheckApiKey } from './CheckApiKey'

/**
 * URL Param Manager
 * -----------------
 * File này gom tất cả logic liên quan đến query params từ URL.
 * Bao gồm:
 * - Lấy param với smart parse
 * - Lấy tất cả params dưới dạng object
 * - Xoá param khỏi query
 * - Merge / build query string mới
 */

/**
 * Chỉ parse các số "bình thường":
 * - 0
 * - 123
 * - -123
 * - 12.34
 * - -12.34
 *
 * Không parse các kiểu:
 * - 00123
 * - +10
 * - .5
 * - 1.
 * - 1e3
 * - NaN
 * - Infinity
 * - 0x10
 */
const NORMAL_NUMBER_REGEX = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/

const isPlainObject = (value) => {
  return Object.prototype.toString.call(value) === '[object Object]'
}

const canParseAsNormalNumber = (value) => {
  if (!NORMAL_NUMBER_REGEX.test(value)) return false

  const parsed = Number(value)

  if (Number.isNaN(parsed)) return false
  if (!Number.isSafeInteger(parsed) && !value.includes('.')) return false

  return true
}

/**
 * Smart parser cho URL param
 *
 * Rules:
 * - null => null
 * - undefined => undefined
 * - '' / '   ' => ''
 * - 'null' => null
 * - 'undefined' => undefined
 * - 'true' / 'false' => boolean
 * - số thường => number
 * - JSON object / array => parse JSON
 * - còn lại => string nguyên bản
 *
 * NOTE:
 * URLSearchParams đã tự decode rồi, không decodeURIComponent thêm nữa.
 */
export const smartParseParam = (value) => {
  if (value === null) return null
  if (value === undefined) return undefined

  if (typeof value !== 'string') return value

  const trimmed = value.trim()

  if (trimmed === '') return ''

  if (trimmed === 'null') return null
  if (trimmed === 'undefined') return undefined

  if (trimmed === 'true') return true
  if (trimmed === 'false') return false

  if (canParseAsNormalNumber(trimmed)) {
    const parsedNumber = Number(trimmed)

    // Với integer thì chặn vượt safe integer
    if (Number.isInteger(parsedNumber) && !Number.isSafeInteger(parsedNumber)) {
      return value
    }

    return parsedNumber
  }

  const looksLikeJson = (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))

  if (looksLikeJson) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return value
    }
  }

  return value
}

/**
 * Serialize value để đưa lên URL sao cho parse lại đúng được
 */
export const serializeUrlParam = (value) => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value) || isPlainObject(value)) {
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * Lấy value cuối cùng nếu param bị lặp key
 * Ví dụ: ?a=1&a=2 => lấy 2
 */
const getLastParamValue = (params, key) => {
  const values = params.getAll(key)
  if (!values.length) return null
  return values[values.length - 1]
}

/**
 * Lấy giá trị param từ URL theo key, đã parse sẵn
 */
export const getUrlParamValue = (key, search = window.location.search) => {
  const params = new URLSearchParams(search)
  const rawValue = getLastParamValue(params, key)
  return smartParseParam(rawValue)
}

/**
 * Lấy tất cả params từ URL, trả về object { key: parsedValue }
 * Nếu duplicate key thì lấy value cuối cùng
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
 */
export const removeUrlParams = (keys = [], search = window.location.search) => {
  const params = new URLSearchParams(search)

  keys.forEach((key) => params.delete(key))

  return params.toString()
}

/**
 * Merge params vào URL hiện tại
 * - newParams: object { key: value }
 * - null / undefined => xoá key khỏi query
 * - object / array => JSON.stringify để parse ngược lại được
 * - return: query string mới (không bao gồm ?)
 */
export const mergeUrlParams = (newParams = {}, search = window.location.search) => {
  const params = new URLSearchParams(search)

  Object.entries(newParams).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      params.delete(key)
    } else {
      params.set(key, serializeUrlParam(value))
    }
  })

  return params.toString()
}

/**
 * Build query string từ object
 * - params: object { key: value }
 * - prefix: "?" hoặc "&" nếu muốn
 * - null / undefined => bỏ qua
 */
export const buildQueryString = (params = {}, prefix = '?') => {
  const urlParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      urlParams.set(key, serializeUrlParam(value))
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
