const MIN_PLATE_NUMBER = 6
const MAX_PLATE_NUMBER = 12

export function normalizePlate(raw = '') {
  return String(raw || '')
    .trim()
    .replace(/[^0-9A-ZĐa-zđ]/g, '')
    .toUpperCase()
}

function checkValidVehicleIdentity(vehicleIdentity) {
  let isValidVehicle = true

  function checkingValidPlateNumber(plateNumber) {
    return !/[^A-Z0-9Đ]/g.test(plateNumber)
  }

  const plate = normalizePlate(vehicleIdentity)

  if (!plate) return false

  // Kiểm tra biển số xe có chứa ký tự đặc biệt không
  const validPlateNumber = checkingValidPlateNumber(plate)
  if (!validPlateNumber) {
    return false
  }

  // checking contain valid serial character
  const specialSerialChar = 'KT,LD,DA,MK,MD,MĐ,TD,TĐ,HC,NG,QT,NN,CV,CD,LB,RM'.split(',')
  const normalSerialChar = ['A', 'B', 'C', 'D', 'Đ', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'R']

  const includedNormalSerialChars = normalSerialChar.filter((char) => plate.includes(char))
  const includedSpecialSerialChars = specialSerialChar.filter((char) => plate.includes(char))

  if (includedSpecialSerialChars.length > 0) {
    if (includedSpecialSerialChars.length !== 1) {
      isValidVehicle = false
    } else {
      const includedChar = includedSpecialSerialChars[0]
      const serialIndex = plate.indexOf(includedChar)

      // check is also contain normal serial characters
      const isContainRedundantNormalChar = includedNormalSerialChars.some((char) => {
        const index = plate.indexOf(char)
        return index < serialIndex
      })

      if (isContainRedundantNormalChar) {
        isValidVehicle = false
      }
    }
  } else if (includedNormalSerialChars.length === 1 || includedNormalSerialChars.length === 2) {
    // valid
  } else {
    isValidVehicle = false
  }

  // Nếu tổng số chữ lớn hơn 2 thì không hợp lệ
  const totalLetterCount = (plate.match(/[A-ZĐ]/g) || []).length
  if (totalLetterCount > 2) {
    isValidVehicle = false
  }

  if (plate.length < MIN_PLATE_NUMBER || plate.length > MAX_PLATE_NUMBER) {
    isValidVehicle = false
  }

  return isValidVehicle
}

export function validatePlateNumber(plate, prev = '') {
  const raw = plate || ''
  const p = normalizePlate(raw, prev)

  if (!p) return 'Vui lòng nhập biển số xe.'
  if (/[^0-9A-ZĐa-zđ]/.test(raw.trim())) {
    return 'Biển số chỉ được chứa chữ và số, vui lòng không nhập khoảng trắng hoặc ký tự đặc biệt.'
  }
  if (!/\d/.test(p)) {
    return 'Biển số xe không hợp lệ, vui lòng kiểm tra lại.'
  }
  if (!checkValidVehicleIdentity(p)) {
    return 'Biển số xe không hợp lệ, vui lòng kiểm tra lại.'
  }

  return ''
}

export const validatorPlateNumber = (value) => {
  const error = validatePlateNumber(value)

  if (error) {
    return Promise.reject(error)
  }

  return Promise.resolve()
}