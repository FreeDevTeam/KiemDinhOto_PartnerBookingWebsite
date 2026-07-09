import React from 'react'
import { LocalStorageManager } from '../helper/localStorage'
import { mergeUrlParams } from '../helper/UrlParamsHelper'

export const ConsentContext = React.createContext(null)

const STORAGE_KEY_CONSENT_USER_PROFILE = 'consentUserProfile'
const STORAGE_KEY_CONSENT_SESSION_STATE = 'consentSessionState'

const DEFAULT_CONSENT_USER_PROFILE = {
  username: '',
  phoneNumber: '',
  fullName: '',
  partnerSessionData: null,
  token: null
}

const normalizeUrlParamValue = (value) => {
  if (value === '' || value === null || value === undefined) return undefined
  return value
}

const normalizeConsentMode = (value) => {
  if (value === 1 || value === '1') return 1
  if (value === 2 || value === '2') return 2
  if (value === 3 || value === '3') return 3
  return undefined
}

const safeGetStorageItem = (key) => {
  try {
    return LocalStorageManager.getItem(key)
  } catch (error) {
    console.error(`ConsentContext: failed to read storage key "${key}"`, error)
    return null
  }
}

const trySetStorageItem = (key, value) => {
  try {
    LocalStorageManager.setItem(key, value)
    return true
  } catch (error) {
    console.error(`ConsentContext: failed to write storage key "${key}"`, error)
    return false
  }
}

const sanitizeStringValue = (value) => {
  if (typeof value === 'string') return value
  return ''
}

const sanitizeConsentUserProfile = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return DEFAULT_CONSENT_USER_PROFILE
  }

  return {
    username: sanitizeStringValue(value.username),
    phoneNumber: sanitizeStringValue(value.phoneNumber),
    fullName: sanitizeStringValue(value.fullName),
    partnerSessionData: value.partnerSessionData !== undefined ? value.partnerSessionData : null,
    token: value.token !== undefined ? value.token : null
  }
}

const sanitizeConsentSessionState = (value, fallbackConsentMode) => {
  const safeValue = !value || typeof value !== 'object' || Array.isArray(value) ? {} : value
  const storedConsentMode = normalizeConsentMode(safeValue.consentMode)
  const resolvedConsentMode = normalizeConsentMode(fallbackConsentMode ?? storedConsentMode)

  return {
    consentMode: resolvedConsentMode,
    hasAcceptedConsent: safeValue.hasAcceptedConsent === true && storedConsentMode === resolvedConsentMode,
    isLoading: safeValue.isLoading === true,
    isHydrated: true
  }
}

const buildInitialConsentState = (initialConsentMode) => {
  const storedConsentUserProfile = sanitizeConsentUserProfile(safeGetStorageItem(STORAGE_KEY_CONSENT_USER_PROFILE))
  const storedConsentSessionState = sanitizeConsentSessionState(safeGetStorageItem(STORAGE_KEY_CONSENT_SESSION_STATE), initialConsentMode)

  return {
    consentUserProfile: storedConsentUserProfile,
    consentSessionState: {
      ...storedConsentSessionState,
      isLoading: false,
      isHydrated: true
    }
  }
}

const isSameConsentUserProfile = (prev, next) => {
  return (
    prev.username === next.username &&
    prev.phoneNumber === next.phoneNumber &&
    prev.fullName === next.fullName &&
    JSON.stringify(prev.partnerSessionData) === JSON.stringify(next.partnerSessionData) &&
    prev.token === next.token
  )
}

const isSameConsentSessionState = (prev, next) => {
  return (
    prev.consentMode === next.consentMode &&
    prev.hasAcceptedConsent === next.hasAcceptedConsent &&
    prev.isLoading === next.isLoading &&
    prev.isHydrated === next.isHydrated
  )
}

export const ConsentContextProvider = ({ children, initialConsentMode }) => {
  const [consentState, setConsentState] = React.useState(() => buildInitialConsentState(initialConsentMode))

  const setConsentUserProfile = React.useCallback((value) => {
    setConsentState((prev) => {
      const nextValue = typeof value === 'function' ? value(prev.consentUserProfile) : value
      const nextConsentUserProfile = sanitizeConsentUserProfile(nextValue)

      if (isSameConsentUserProfile(prev.consentUserProfile, nextConsentUserProfile)) {
        return prev
      }

      const isSaved = trySetStorageItem(STORAGE_KEY_CONSENT_USER_PROFILE, nextConsentUserProfile)
      if (!isSaved) {
        return prev
      }

      return {
        ...prev,
        consentUserProfile: nextConsentUserProfile
      }
    })
  }, [])

  const updateConsentUserProfile = React.useCallback(
    (value) => {
      setConsentUserProfile((prev) => {
        const patch = typeof value === 'function' ? value(prev) : value
        return {
          ...prev,
          ...(patch || {})
        }
      })
    },
    [setConsentUserProfile]
  )

  const setConsentSessionState = React.useCallback((value) => {
    setConsentState((prev) => {
      const nextValue = typeof value === 'function' ? value(prev.consentSessionState) : value
      const nextConsentMode = normalizeConsentMode(nextValue?.consentMode ?? prev.consentSessionState.consentMode)
      const shouldResetAcceptedConsent =
        nextValue &&
        typeof nextValue === 'object' &&
        !Array.isArray(nextValue) &&
        Object.prototype.hasOwnProperty.call(nextValue, 'consentMode') &&
        !Object.prototype.hasOwnProperty.call(nextValue, 'hasAcceptedConsent') &&
        nextConsentMode !== prev.consentSessionState.consentMode
      const nextConsentSessionState = {
        ...sanitizeConsentSessionState(nextValue, prev.consentSessionState.consentMode),
        ...(shouldResetAcceptedConsent
          ? {
              hasAcceptedConsent: false
            }
          : {}),
        isHydrated: true
      }

      if (isSameConsentSessionState(prev.consentSessionState, nextConsentSessionState)) {
        return prev
      }

      const isSaved = trySetStorageItem(STORAGE_KEY_CONSENT_SESSION_STATE, {
        consentMode: nextConsentSessionState.consentMode,
        hasAcceptedConsent: nextConsentSessionState.hasAcceptedConsent,
        isLoading: nextConsentSessionState.isLoading
      })
      if (!isSaved) {
        return prev
      }

      return {
        ...prev,
        consentSessionState: nextConsentSessionState
      }
    })
  }, [])

  const updateConsentSessionState = React.useCallback(
    (value) => {
      setConsentSessionState((prev) => {
        const patch = typeof value === 'function' ? value(prev) : value
        const nextConsentMode = normalizeConsentMode(patch?.consentMode ?? prev.consentMode)
        const shouldResetAcceptedConsent =
          patch &&
          Object.prototype.hasOwnProperty.call(patch, 'consentMode') &&
          !Object.prototype.hasOwnProperty.call(patch, 'hasAcceptedConsent') &&
          nextConsentMode !== prev.consentMode

        return {
          ...prev,
          ...(patch || {}),
          ...(shouldResetAcceptedConsent
            ? {
                hasAcceptedConsent: false
              }
            : {})
        }
      })
    },
    [setConsentSessionState]
  )

  const hydrateConsentSession = React.useCallback(() => {
    const nextConsentState = buildInitialConsentState(initialConsentMode)
    trySetStorageItem(STORAGE_KEY_CONSENT_USER_PROFILE, nextConsentState.consentUserProfile)
    trySetStorageItem(STORAGE_KEY_CONSENT_SESSION_STATE, {
      consentMode: nextConsentState.consentSessionState.consentMode,
      hasAcceptedConsent: nextConsentState.consentSessionState.hasAcceptedConsent,
      isLoading: nextConsentState.consentSessionState.isLoading
    })
    setConsentState(nextConsentState)

    return nextConsentState
  }, [initialConsentMode])

  React.useEffect(() => {
    const normalizedConsentMode = normalizeConsentMode(initialConsentMode)

    setConsentState((prev) => {
      const nextConsentSessionState = {
        ...prev.consentSessionState,
        consentMode: normalizedConsentMode,
        hasAcceptedConsent: prev.consentSessionState.hasAcceptedConsent && prev.consentSessionState.consentMode === normalizedConsentMode,
        isHydrated: true
      }

      if (isSameConsentSessionState(prev.consentSessionState, nextConsentSessionState)) {
        return prev
      }

      const isSaved = trySetStorageItem(STORAGE_KEY_CONSENT_SESSION_STATE, {
        consentMode: nextConsentSessionState.consentMode,
        hasAcceptedConsent: nextConsentSessionState.hasAcceptedConsent,
        isLoading: nextConsentSessionState.isLoading
      })
      if (!isSaved) {
        return prev
      }

      return {
        ...prev,
        consentSessionState: nextConsentSessionState
      }
    })
  }, [initialConsentMode])

  const acceptConsentSession = React.useCallback(
    (value) => {
      const nextConsentUserProfile = value === undefined ? consentState.consentUserProfile : sanitizeConsentUserProfile(value)
      const nextConsentSessionState = {
        ...consentState.consentSessionState,
        hasAcceptedConsent: true,
        isLoading: false,
        isHydrated: true
      }

      if (!isSameConsentUserProfile(consentState.consentUserProfile, nextConsentUserProfile)) {
        const isProfileSaved = trySetStorageItem(STORAGE_KEY_CONSENT_USER_PROFILE, nextConsentUserProfile)
        if (!isProfileSaved) {
          return false
        }
      }

      const isSaved = trySetStorageItem(STORAGE_KEY_CONSENT_SESSION_STATE, {
        consentMode: nextConsentSessionState.consentMode,
        hasAcceptedConsent: nextConsentSessionState.hasAcceptedConsent,
        isLoading: nextConsentSessionState.isLoading
      })

      if (!isSaved) {
        return false
      }

      setConsentState((prev) => {
        const resolvedConsentSessionState = {
          ...prev.consentSessionState,
          hasAcceptedConsent: true,
          isLoading: false,
          isHydrated: true
        }

        if (isSameConsentSessionState(prev.consentSessionState, resolvedConsentSessionState)) {
          return prev
        }

        return {
          ...prev,
          consentUserProfile: nextConsentUserProfile,
          consentSessionState: resolvedConsentSessionState
        }
      })

      return true
    },
    [consentState.consentSessionState, consentState.consentUserProfile]
  )

  const buildConsentHref = React.useCallback(
    (href, extraParams = {}) => {
      const [pathname, rawSearch = ''] = href.split('?')
      const search = rawSearch ? `?${rawSearch}` : ''

      const queryString = mergeUrlParams(
        {
          ...extraParams,
          sdkUsername: normalizeUrlParamValue(consentState.consentUserProfile?.username),
          sdkPhoneNumber: normalizeUrlParamValue(consentState.consentUserProfile?.phoneNumber),
          sdkFullName: normalizeUrlParamValue(consentState.consentUserProfile?.fullName),
          sdkToken: normalizeUrlParamValue(consentState.consentUserProfile?.token)
        },
        search
      )

      return queryString ? `${pathname}?${queryString}` : pathname
    },
    [consentState.consentUserProfile]
  )

  const contextValue = React.useMemo(() => {
    const { consentUserProfile, consentSessionState } = consentState
    const isConsentEnabled = consentSessionState.consentMode === 1 || consentSessionState.consentMode === 2 || consentSessionState.consentMode === 3

    return {
      consentUserProfile,
      consentSessionState,
      isConsentHydrated: consentSessionState.isHydrated,
      shouldShowConsent: isConsentEnabled && !consentSessionState.hasAcceptedConsent,
      setConsentUserProfile,
      updateConsentUserProfile,
      setConsentSessionState,
      updateConsentSessionState,
      hydrateConsentSession,
      acceptConsentSession,
      buildConsentHref
    }
  }, [
    acceptConsentSession,
    consentState,
    hydrateConsentSession,
    setConsentSessionState,
    setConsentUserProfile,
    updateConsentSessionState,
    updateConsentUserProfile,
    buildConsentHref
  ])

  return React.createElement(
    ConsentContext.Provider,
    {
      value: contextValue
    },
    children
  )
}

export const useConsentContext = () => {
  const context = React.useContext(ConsentContext)
  if (!context) {
    throw new Error('useConsentContext must be used within ConsentContextProvider')
  }
  return context
}
