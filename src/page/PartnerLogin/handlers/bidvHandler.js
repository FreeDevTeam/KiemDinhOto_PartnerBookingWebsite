import PartnerLoginService from '../../../services/partnerLoginService'
import { getPartnerConfig } from '../../../constants/partnerConfig'

export const handleBidvLogin = async (search = window.location.search) => {
  const config = getPartnerConfig('bidv')
  const genericError = config?.errorText || 'Tải dữ liệu thất bại.'

  try {
    const params = new URLSearchParams(search)
    const userId = (params.get('user_id') || '').trim()

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
