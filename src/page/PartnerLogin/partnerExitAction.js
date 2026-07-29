import { useCallback, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { getPartnerName } from '../../constants/partnerConfig'
import { initIhanoiBridge, handleIhanoiExit, isIhanoiSupported } from './handlers/ihanoiHandler'
import { handleBidvExit } from './handlers/bidvHandler'
import { handleDefaultExit } from './handlers/defaultExitHandler'

// ===== Dispatcher: switch theo partnerName =====
export const resolvePartnerExit = async ({ history } = {}) => {
  const partnerName = getPartnerName()

  switch (partnerName) {
    case 'IHANOI':
      return handleIhanoiExit()

    case 'BIDV':
      return handleBidvExit()

    default:
      break
  }

  // Fallback: check REACT_APP_THEME_NAME (cho IHANOI không qua login flow)
  const themeName = (process.env.REACT_APP_THEME_NAME || '').trim().toUpperCase()
  if (themeName === 'IHANOI') {
    return handleIhanoiExit()
  }

  // Default
  return handleDefaultExit({ history })
}

// ===== Hook cho components =====
export const usePartnerExit = () => {
  const history = useHistory()

  // Init bridge nếu cần (IHANOI)
  useEffect(() => {
    const themeName = (process.env.REACT_APP_THEME_NAME || '').trim().toUpperCase()
    const partnerName = getPartnerName()

    if (themeName === 'IHANOI' || partnerName === 'IHANOI') {
      if (isIhanoiSupported()) {
        initIhanoiBridge()
      }
    }
  }, [])

  const handleExit = useCallback(async () => {
    try {
      await resolvePartnerExit({ history })
    } catch (e) {
      console.error('[usePartnerExit] Exit failed:', e)
    }
  }, [history])

  return { handleExit }
}
