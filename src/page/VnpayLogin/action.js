import { PATH } from '../../constants/router'
import { VNPAY_ENV } from '../../constants/vnpay'
import { getVnpayPayloadFromSearch, persistVnpayLoginState, resolveVnpayLogoPath } from '../../helper/vnpay'

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
    const { payload } = await getVnpayPayloadFromSearch(search)
    persistVnpayLoginState(payload)
    return payload
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

  if (raceResult.status === 'timeout') {
    return raceResult
  }

  const remainingTime = Math.max(0, VNPAY_ENV.MIN_LOADING_MS - (Date.now() - startedAt))
  if (remainingTime > 0) {
    await wait(remainingTime)
  }

  if (raceResult.status === 'error') {
    console.error('VNPAY login flow failed', raceResult.error)
    return raceResult
  }

  return {
    status: 'success',
    redirectTo: PATH.HOME,
    payload: raceResult.payload
  }
}
