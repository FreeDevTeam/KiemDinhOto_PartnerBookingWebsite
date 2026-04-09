import React from 'react'
import { LocalStorageManager, SessionStorageManager } from '../helper/localStorage'
import { getUrlParamValue, smartParseParam } from '../helper/params'
import { PARAM_HOME_MINIAPP_CONSENT_MODE, PARAM_IS_HEADER_MINI_APP, PARAM_IS_WEB_VIEW, PARAM_REFER_STATION_ID, PARAM_REFER_USER_ID } from '../constants/params'
export const AppParamsContext = React.createContext(null)

const getFirstUrlParamValue = (paramKey, search) => {
  if (Array.isArray(paramKey)) {
    for (const key of paramKey) {
      const value = getUrlParamValue(key, search)
      if (value !== null && value !== undefined) return value
    }
    return null
  }

  return getUrlParamValue(paramKey, search)
}

const resolveParamsMiniAppSessionStorage = (config) => {
  // 1. param (raw)
  const param = getFirstUrlParamValue(config.paramKey)

  // có param thì lưu session (raw)
  if (param !== null && param !== undefined && config.storageKey) {
    SessionStorageManager.setItem(config.storageKey, param)
  }

  // 2. resolve raw theo thứ tự ưu tiên
  const raw = param ?? SessionStorageManager.getItem(config.storageKey) ?? smartParseParam(process.env?.[config.envKey]) ?? config.defaultValue

  // 3. parse giá trị cuối cùng
  return config.parser ? config.parser(raw) : raw
}

const resolveParamsMiniAppLocalStorage = (config) => {
  // 1. param (raw)
  const param = getFirstUrlParamValue(config.paramKey)

  // có param thì lưu local (raw)
  if (param !== null && param !== undefined && config.storageKey) {
    LocalStorageManager.setItem(config.storageKey, param)
  }

  // 2. resolve raw theo thứ tự ưu tiên
  const raw = param ?? LocalStorageManager.getItem(config.storageKey) ?? smartParseParam(process.env?.[config.envKey]) ?? config.defaultValue

  // 3. parse giá trị cuối cùng
  return config.parser ? config.parser(raw) : raw
}

/* =====================
 * PARAM MINI APP SCHEMA
 * ===================== */
const PARAMS_MINIAPP_SCHEMA_SESSION_STORAGE = {
  isWebView: {
    paramKey: PARAM_IS_WEB_VIEW,
    storageKey: PARAM_IS_WEB_VIEW,
    envKey: undefined,
    defaultValue: false,
    parser: (v) => v === true || v === 1
  },
  isHeaderMiniApp: {
    paramKey: PARAM_IS_HEADER_MINI_APP,
    storageKey: PARAM_IS_HEADER_MINI_APP,
    envKey: undefined,
    defaultValue: false,
    parser: (v) => v === true || v === 1
  },
  referUserId: {
    paramKey: PARAM_REFER_USER_ID,
    storageKey: PARAM_REFER_USER_ID,
    envKey: undefined,
    defaultValue: undefined,
    parser: (v) => v
  },
  referStationId: {
    paramKey: PARAM_REFER_STATION_ID,
    storageKey: PARAM_REFER_STATION_ID,
    envKey: undefined,
    defaultValue: undefined,
    parser: (v) => v
  },
  homeMiniappConsentMode: {
    paramKey: PARAM_HOME_MINIAPP_CONSENT_MODE,
    storageKey: PARAM_HOME_MINIAPP_CONSENT_MODE,
    envKey: "REACT_APP_HOME_MINIAPP_CONSENT_MODE" ,
    defaultValue: 1,
    parser: (v) => v
  }
}

const PARAMS_MINIAPP_SCHEMA_LOCAL_STORAGE = {}

const matchesParamKey = (config, paramKey) => {
  if (!config || !paramKey) return false
  if (Array.isArray(config.paramKey)) {
    return config.paramKey.includes(paramKey)
  }
  return config.paramKey === paramKey
}

const findMiniAppParamConfig = (paramKey) => {
  if (!paramKey) return null

  if (PARAMS_MINIAPP_SCHEMA_SESSION_STORAGE[paramKey]) {
    return {
      contextKey: paramKey,
      config: PARAMS_MINIAPP_SCHEMA_SESSION_STORAGE[paramKey],
      storage: 'session'
    }
  }

  if (PARAMS_MINIAPP_SCHEMA_LOCAL_STORAGE[paramKey]) {
    return {
      contextKey: paramKey,
      config: PARAMS_MINIAPP_SCHEMA_LOCAL_STORAGE[paramKey],
      storage: 'local'
    }
  }

  const sessionEntry = Object.entries(PARAMS_MINIAPP_SCHEMA_SESSION_STORAGE).find(
    ([, config]) => matchesParamKey(config, paramKey) || config.storageKey === paramKey
  )

  if (sessionEntry) {
    return {
      contextKey: sessionEntry[0],
      config: sessionEntry[1],
      storage: 'session'
    }
  }

  const localEntry = Object.entries(PARAMS_MINIAPP_SCHEMA_LOCAL_STORAGE).find(
    ([, config]) => matchesParamKey(config, paramKey) || config.storageKey === paramKey
  )

  if (localEntry) {
    return {
      contextKey: localEntry[0],
      config: localEntry[1],
      storage: 'local'
    }
  }

  return null
}

const buildInitialParamsValue = () => {
  const params = {}

  Object.keys(PARAMS_MINIAPP_SCHEMA_SESSION_STORAGE).forEach((key) => {
    params[key] = resolveParamsMiniAppSessionStorage(PARAMS_MINIAPP_SCHEMA_SESSION_STORAGE[key])
  })

  Object.keys(PARAMS_MINIAPP_SCHEMA_LOCAL_STORAGE).forEach((key) => {
    params[key] = resolveParamsMiniAppLocalStorage(PARAMS_MINIAPP_SCHEMA_LOCAL_STORAGE[key])
  })

  return params
}

export const AppParamsContextProvider = (props) => {
  const [paramsValue, setParamsValue] = React.useState(() => buildInitialParamsValue())

  const checkUrlParamSaveContext = React.useCallback((paramKey, options = {}) => {
    if (!paramKey) return undefined

    const schema = findMiniAppParamConfig(paramKey)
    const config = schema?.config ?? { paramKey, storageKey: paramKey, parser: undefined }
    const contextKey = schema?.contextKey ?? paramKey

    const paramValue = getFirstUrlParamValue(config.paramKey, options.search)
    if (paramValue === null || paramValue === undefined) return undefined

    const parsedValue = config.parser ? config.parser(paramValue) : paramValue
    const storageMode = options.storage ?? 'auto'
    const storageType = storageMode === 'auto' ? schema?.storage : storageMode

    if (storageType === 'session' && config.storageKey) {
      SessionStorageManager.setItem(config.storageKey, paramValue)
    }

    if (storageType === 'local' && config.storageKey) {
      LocalStorageManager.setItem(config.storageKey, paramValue)
    }

    setParamsValue((prev) => {
      if (prev?.[contextKey] === parsedValue) return prev
      return {
        ...prev,
        [contextKey]: parsedValue
      }
    })

    return parsedValue
  }, [])

  const contextValue = React.useMemo(() => {
    return {
      ...paramsValue,
      checkUrlParam: checkUrlParamSaveContext,
      checkUrlParamSaveContext
    }
  }, [paramsValue, checkUrlParamSaveContext])

  // pass resolved params through context value
  return React.createElement(
    AppParamsContext.Provider,
    {
      value: contextValue
    },
    props.children
  )
}
export const useAppParamsContext = () => {
  const context = React.useContext(AppParamsContext)
  if (!context) {
    throw new Error('useAppParamsContext must be used within AppParamsContextProvider')
  }
  return context
}
