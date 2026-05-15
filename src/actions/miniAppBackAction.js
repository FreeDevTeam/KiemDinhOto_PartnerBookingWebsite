import { PARAM_BACK_TO_HOME_MINI_APP_URL } from '../constants/params'
import { resolveParamsMiniAppLocalStorage } from '../context/AppParamsContext'
import { decodeLink } from '../helper/common'

export const resolveMiniAppBackUrl = () => {
  const backUrl = resolveParamsMiniAppLocalStorage({
    paramKey: PARAM_BACK_TO_HOME_MINI_APP_URL,
    storageKey: PARAM_BACK_TO_HOME_MINI_APP_URL,
    defaultValue: '',
    parser: (value) => `${value || ''}`.trim()
  })

  if (!backUrl) {
    return ''
  }

  try {
    return decodeLink(backUrl)
  } catch {
    try {
      return decodeURIComponent(backUrl)
    } catch {
      return backUrl
    }
  }
}

export const redirectByMiniAppBackUrl = () => {
  const resolvedBackUrl = resolveMiniAppBackUrl()

  if (!resolvedBackUrl) {
    return false
  }

  window.location.href = resolvedBackUrl
  return true
}
