import { PATH } from '../../constants/router'
import { MYF88_ENV } from '../../constants/Myf88LoginConstants'
import { getMyf88LoginRequestFromSearch, resolveMyf88LogoPath, persistMyf88LoginState } from '../../helper/Myf88LoginHelper'
import Myf88Service from '../../services/myf88Service'

const wait = (timeout) => new Promise((resolve) => {
  window.setTimeout(resolve, timeout)
})

const getFallbackField = (apiData = {}, appData = {}, keys = []) => {
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index]
    const apiValue = apiData?.[key]
    if (apiValue !== undefined && apiValue !== null && `${apiValue}`.trim()) {
      return `${apiValue}`.trim()
    }

    const appValue = appData?.[key]
    if (appValue !== undefined && appValue !== null && `${appValue}`.trim()) {
      return `${appValue}`.trim()
    }
  }

  return ''
}

export const getMyf88LoginViewModel = (search = window.location.search) => {
  const params = new URLSearchParams(search)

  return {
    logoPath: resolveMyf88LogoPath(params.get('logo')),
    fallbackLogoPath: '/logo.png',
    loadingText: 'Loading'
  }
}

export const runMyf88LoginFlow = async ({ search = window.location.search } = {}) => {
  const startedAt = Date.now()
  const flowPromise = (async () => {
    const loginRequest = getMyf88LoginRequestFromSearch(search)
 
    const appData = loginRequest.myf88AppData
    const loginPayload = {
      myF88AppData: appData
    }

    if (loginRequest.stationCode) {
      loginPayload.stationCode = loginRequest.stationCode
    }

    if (loginRequest.apikey) {
      loginPayload.apikey = loginRequest.apikey
    }

    const loginByMyf88Result = await Myf88Service.loginByMyf88AppData(loginPayload)

    if (!loginByMyf88Result.isSuccess || !loginByMyf88Result.data) {
      throw new Error(loginByMyf88Result.message || loginByMyf88Result.error || 'MYF88 login API failed')
    }

    const apiData = loginByMyf88Result.data
    const phoneNumber = getFallbackField(apiData, loginRequest.myf88AppData, ['phoneNumber', 'mobile', 'phone'])
    const fullName = getFallbackField(apiData, loginRequest.myf88AppData, ['fullName', 'fname', 'name'])
    const email = getFallbackField(apiData, loginRequest.myf88AppData, ['email'])
    const uuid = getFallbackField(apiData, loginRequest.myf88AppData, ['uuid'])
    const partnerSessionData = apiData?.partnerSessionData !== undefined ? apiData.partnerSessionData : (loginRequest.myf88AppData?.partnerSessionData || null)

    persistMyf88LoginState(
      {
        mobile: phoneNumber,
        fname: fullName,
        email,
        uuid,
        partnerSessionData
      },
      {
        uuid,
        phoneNumber,
        fullName,
        email,
        partnerSessionData
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
    wait(MYF88_ENV.TIMEOUT_MS).then(() => ({
      status: 'timeout'
    }))
  ])

  let flowResult = raceResult
  if (raceResult.status === 'timeout') {
    flowResult = await flowPromise.then((payload) => ({
      status: 'success',
      payload
    })).catch((error) => ({
      status: 'error',
      error
    }))
  }

  const remainingTime = Math.max(0, MYF88_ENV.MIN_LOADING_MS - (Date.now() - startedAt))
  if (remainingTime > 0) {
    await wait(remainingTime)
  }

  if (flowResult.status === 'error') {
    console.error('MYF88 login flow failed', flowResult.error)
    return flowResult
  }

  return {
    status: 'success',
    redirectTo: flowResult.payload.redirectTo,
    payload: flowResult.payload.payload
  }
}
