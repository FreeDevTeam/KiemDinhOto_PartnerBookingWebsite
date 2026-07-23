import PartnerLoginService from '../../../services/partnerLoginService'
import { getPartnerConfig } from '../../../constants/partnerConfig'

const getAllRawParams = (search) => {
  const params = new URLSearchParams(search)
  const result = {}
  for (const [key, value] of params.entries()) {
    result[key] = value.trim()
  }
  return result
}

export const handleMyf88Login = async (search = window.location.search) => {
  const config = getPartnerConfig('myf88')
  const genericError = config?.errorText || 'Tải dữ liệu thất bại.'

  try {
    const rawParams = getAllRawParams(search)
    const searchParams = new URLSearchParams(search)

    const stationCode = rawParams.clientId || rawParams.stationCode || ''
    const apikey = searchParams.get('apikey') || searchParams.get('apiKey') || ''

    const payload = { myF88AppData: rawParams }
    if (stationCode) payload.stationCode = stationCode
    if (apikey) payload.apikey = apikey

    const apiResult = await PartnerLoginService.loginByPartnerAppData(payload)

    if (!apiResult.isSuccess || !apiResult.data) {
      return { isSuccess: false, message: genericError }
    }

    const apiData = apiResult.data
    const userProfile = {
      phoneNumber: (apiData.phoneNumber || apiData.mobile || rawParams.mobile || '').trim(),
      fullName: (apiData.fullName || apiData.fname || rawParams.fname || '').trim(),
      username: (apiData.username || '').trim(),
      token: (apiData.token || rawParams.token || '').trim()
    }

    return { isSuccess: true, userProfile }
  } catch (error) {
    console.error('[F88 Handler] Login failed', error)
    return { isSuccess: false, message: genericError }
  }
}
