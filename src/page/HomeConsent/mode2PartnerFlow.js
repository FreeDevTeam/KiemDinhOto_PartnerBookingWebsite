import { getGtelpayUserInfo, resetGtelpayFlow } from '../../context/GtelpayContext'
import { getUrlParamValue } from '../../helper/params'

export const EMPTY_MODE2_USER_PROFILE = {
  uuid: '',
  phoneNumber: '',
  fullName: ''
}

const COMMON_PROFILE_QUERY_KEYS = {
  uuid: ['uuid', 'userId', 'user_id'],
  phoneNumber: ['phoneNumber', 'phone', 'mobile', 'phone_no'],
  fullName: ['fullName', 'name', 'full_name']
}

const normalizeStringValue = (value) => {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value).trim()
  return ''
}

const normalizeUserProfile = (value) => {
  const safeValue = value && typeof value === 'object' ? value : EMPTY_MODE2_USER_PROFILE

  return {
    uuid: normalizeStringValue(safeValue.uuid),
    phoneNumber: normalizeStringValue(safeValue.phoneNumber),
    fullName: normalizeStringValue(safeValue.fullName)
  }
}

const getRuntimeEnvValue = (key) => {
  if (!key) return undefined

  const runtimeValue = window?._env_?.[key]
  if (runtimeValue !== undefined) return runtimeValue

  return process.env?.[key]
}

const isEnabledRuntimeFlag = (key) => {
  const value = getRuntimeEnvValue(key)
  return value === true || value === 1 || value === '1'
}

const getFirstQueryParamValue = (keys, search) => {
  const normalizedKeys = Array.isArray(keys) ? keys : [keys]

  for (const key of normalizedKeys) {
    const value = getUrlParamValue(key, search)
    const normalizedValue = normalizeStringValue(value)

    if (normalizedValue) {
      return normalizedValue
    }
  }

  return ''
}

const mapGtelpayUserProfile = (userInfo) => {
  return normalizeUserProfile({
    uuid: userInfo?.uuid || userInfo?.rawData?.uuid,
    phoneNumber: userInfo?.phoneNumber,
    fullName: userInfo?.fullName
  })
}

const getZaloUserProfile = async ({ globalState, handleGetUserName, handleGetUserPhone }) => {
  let fullName = normalizeStringValue(globalState?.userName)
  let phoneNumber = normalizeStringValue(globalState?.phoneNumber)

  if (!fullName && handleGetUserName) {
    fullName = normalizeStringValue(await handleGetUserName())
  }

  if (!phoneNumber && handleGetUserPhone) {
    phoneNumber = normalizeStringValue(await handleGetUserPhone())
  }

  return normalizeUserProfile({
    fullName,
    phoneNumber
  })
}

const getGtelpayUserProfile = async () => {
  const gtelpayUserInfo = await getGtelpayUserInfo()
  return mapGtelpayUserProfile(gtelpayUserInfo)
}

const getPartnerQueryUserProfile = ({ search }) => {
  return normalizeUserProfile({
    uuid: getFirstQueryParamValue(COMMON_PROFILE_QUERY_KEYS.uuid, search),
    phoneNumber: getFirstQueryParamValue(COMMON_PROFILE_QUERY_KEYS.phoneNumber, search),
    fullName: getFirstQueryParamValue(COMMON_PROFILE_QUERY_KEYS.fullName, search)
  })
}

const pickRequiredParams = (keys = [], appParams = {}) => {
  return keys.reduce((result, key) => {
    result[key] = appParams?.[key]
    return result
  }, {})
}

const getMissingUserProfileFields = (userProfile, requiredFields = []) => {
  return requiredFields.filter((field) => !normalizeStringValue(userProfile?.[field]))
}

const getMissingRequiredParams = (requiredParams, requiredKeys = []) => {
  return requiredKeys.filter((key) => {
    const value = requiredParams?.[key]

    if (typeof value === 'string') {
      return !value.trim()
    }

    return value === undefined || value === null
  })
}

/*
 * Add new partner flows here.
 * Each flow can define:
 * - envKeys: runtime env flags used to detect the partner
 * - getUserProfile: load data from SDK or query params
 * - requiredUserProfileFields: fields that must exist before allowing Home
 * - requiredParamKeys/getRequiredParams: partner params that must be ready
 * - reset: optional hook for retry to clear caches or re-init SDK flow
 *
 * Example:
 * {
 *   key: 'newPartner',
 *   envKeys: ['REACT_APP_MINIAPP_NEW_PARTNER'],
 *   requiredUserProfileFields: ['fullName', 'phoneNumber'],
 *   requiredParamKeys: ['referUserId'],
 *   getUserProfile: async ({ search }) => ({ fullName: '', phoneNumber: '' }),
 *   getRequiredParams: ({ appParams }) => pickRequiredParams(['referUserId'], appParams)
 * }
 */
const MODE2_PARTNER_FLOWS = [
  {
    key: 'gtelpay',
    label: 'Gtelpay',
    envKeys: ['REACT_APP_MINIAPP_GTELPAY'],
    requiredUserProfileFields: ['fullName', 'phoneNumber'],
    requiredParamKeys: [],
    getUserProfile: getGtelpayUserProfile,
    getRequiredParams: ({ appParams }) => pickRequiredParams([], appParams),
    reset: () => resetGtelpayFlow()
  },
  {
    key: 'zalo',
    label: 'Zalo',
    envKeys: ['REACT_APP_ZALO_AUTH_ENABLE'],
    requiredUserProfileFields: ['fullName', 'phoneNumber'],
    requiredParamKeys: [],
    getUserProfile: getZaloUserProfile,
    getRequiredParams: ({ appParams }) => pickRequiredParams([], appParams)
  },
  {
    key: 'partnerParams',
    label: 'Partner Params',
    envKeys: [],
    requiredUserProfileFields: ['fullName', 'phoneNumber'],
    requiredParamKeys: [],
    getUserProfile: getPartnerQueryUserProfile,
    getRequiredParams: ({ appParams }) => pickRequiredParams([], appParams)
  }
]

export const getActiveMode2PartnerFlow = () => {
  return MODE2_PARTNER_FLOWS.find((flow) => flow.envKeys.some(isEnabledRuntimeFlag)) || MODE2_PARTNER_FLOWS[MODE2_PARTNER_FLOWS.length - 1]
}

export const resetMode2PartnerFlow = async () => {
  const flow = getActiveMode2PartnerFlow()

  if (flow?.reset) {
    await flow.reset()
  }

  return flow
}

export const resolveMode2PartnerData = async (context = {}) => {
  const flow = getActiveMode2PartnerFlow()
  const userProfile = normalizeUserProfile((await flow.getUserProfile?.(context)) || EMPTY_MODE2_USER_PROFILE)
  const requiredParams = flow.getRequiredParams ? await flow.getRequiredParams(context) : {}
  const missingUserProfileFields = getMissingUserProfileFields(userProfile, flow.requiredUserProfileFields)
  const missingRequiredParams = getMissingRequiredParams(requiredParams, flow.requiredParamKeys)

  return {
    flow,
    userProfile,
    requiredParams,
    missingUserProfileFields,
    missingRequiredParams,
    isComplete: missingUserProfileFields.length === 0 && missingRequiredParams.length === 0
  }
}
