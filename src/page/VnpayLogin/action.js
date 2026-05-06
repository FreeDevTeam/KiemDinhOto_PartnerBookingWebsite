import { PATH } from '../../constants/router'
import { VNPAY_ENV } from '../../constants/VnpayLoginConstants'
import {
  getVnpayLoginRequestFromSearch,
  persistVnpayLoginState,
  resolveVnpayLogoPath
} from '../../helper/VnpayLoginHelper'
import VnpayService from '../../services/vnpayService'

const wait = (timeout) => new Promise((resolve) => {
  window.setTimeout(resolve, timeout)
})

export const getVnpayLoginViewModel = (search = window.location.search) => {
  const params = new URLSearchParams(search)

  return {
    logoPath: resolveVnpayLogoPath(params.get('logo')),
    fallbackLogoPath: '/logo.png',
    loadingText: 'Loading'
  }
}

export const runVnpayLoginFlow = async ({ search = window.location.search } = {}) => {
  const startedAt = Date.now()
  const flowPromise = (async () => {
    const loginRequest = getVnpayLoginRequestFromSearch(search)
    const loginPayload = {
      stationCode: loginRequest.stationCode,
      vnpayAppData: {
        data: loginRequest.vnpayAppData.data // Only include the data field
      }
    }

    if (loginRequest.apikey) {
      loginPayload.apikey = loginRequest.apikey
    }

    const loginByVnpayResult = await VnpayService.loginByVnpayAppData(loginPayload)

    if (!loginByVnpayResult.isSuccess || !loginByVnpayResult.data) {
      throw new Error(loginByVnpayResult.message || loginByVnpayResult.error || 'VNPAY login API failed')
    }

    const apiData = loginByVnpayResult.data
    const phoneNumber = apiData.phoneNumber || ''
    const fullName = apiData.fullName || ''
    const email = apiData.email || ''

    persistVnpayLoginState(
      {
        mobile: phoneNumber,
        fname: fullName,
        email
      },
      {
        uuid: phoneNumber,
        phoneNumber,
        fullName,
        email
      }
    )

    return {
      status: 'success',
      redirectTo: PATH.HOME,
      payload: apiData
    }
  })()

  const raceResult = await Promise.race([
    flowPromise.then((payload) => ({
      status: 'success',
      payload
    })).catch((error) => ({
      status: 'error',
      error
    })),
    wait(VNPAY_ENV.TIMEOUT_MS).then(() => ({
      status: 'timeout'
    }))
  ])

  let flowResult = raceResult
  if (raceResult.status === 'timeout') {
    // Keep waiting after timeout to avoid showing false failure when API response is slow.
    flowResult = await flowPromise.then((payload) => ({
      status: 'success',
      payload
    })).catch((error) => ({
      status: 'error',
      error
    }))
  }

  const remainingTime = Math.max(0, VNPAY_ENV.MIN_LOADING_MS - (Date.now() - startedAt))
  if (remainingTime > 0) {
    await wait(remainingTime)
  }

  if (flowResult.status === 'error') {
    console.error('VNPAY login flow failed', flowResult.error)
    return flowResult
  }

  return {
    status: 'success',
    redirectTo: flowResult.payload.redirectTo,
    payload: flowResult.payload.payload
  }
}
