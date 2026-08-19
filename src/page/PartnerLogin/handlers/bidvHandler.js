import PartnerLoginService from '../../../services/partnerLoginService'
import { getPartnerConfig } from '../../../constants/partnerConfig'

export const handleBidvLogin = async (search = window.location.search) => {
  const config = getPartnerConfig('BIDV')
  const genericError = config?.errorText || 'Tải dữ liệu thất bại.'

  try {
    const params = new URLSearchParams(search)
    const rawUserId = (params.get('user_id') || '').trim()
    const userId = rawUserId ? decodeURIComponent(rawUserId) : ''

    if (!userId) {
      return { isSuccess: false, message: genericError }
    }

    const payload = {
      BIDVAppData: {
        user_id: userId
      }
    }

    const apiResult = await PartnerLoginService.loginByBIDVAppData(payload)

    if (!apiResult.isSuccess || !apiResult.data) {
      return { isSuccess: false, message: genericError }
    }

    const apiData = apiResult.data
    const userProfile = {
      phoneNumber: (apiData.phoneNumber || '').trim(),
      fullName: (apiData.fullName || '').trim(),
      username: (apiData.username || '').trim(),
      token: (apiData.token || '').trim()
    }

    return {
      isSuccess: true,
      userProfile
    }
  } catch (error) {
    console.error('[BIDV Handler] Login failed', error)
    return { isSuccess: false, message: genericError }
  }
}

export const handleBidvExit = async () => {
  // Theo tài liệu BIDV (Mục III & IX), sự kiện 'back_home' không yêu cầu truyền data
  const data = JSON.stringify({ a: 'back_home' })

  // 1. iOS: window.webkit.messageHandlers.appEvent.postMessage(data)
  if (window?.webkit?.messageHandlers?.appEvent?.postMessage) {
    window.webkit.messageHandlers.appEvent.postMessage(data)
    return
  }

  // 2. Android: window.android.appEvent(data)
  if (window?.android && typeof window.android.appEvent === 'function') {
    window.android.appEvent(data)
    return
  }

  // Hỗ trợ trường hợp chữ hoa cho đối tượng Android WebView
  if (window?.Android && typeof window.Android.appEvent === 'function') {
    window.Android.appEvent(data)
    return
  }
}

