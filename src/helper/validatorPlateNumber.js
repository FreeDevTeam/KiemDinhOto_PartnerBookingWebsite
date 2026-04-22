export function normalizePlate(raw = '') {
  return String(raw || '')
    .trim()
    .replace(/[^0-9A-ZĐa-zđ]/g, '')
    .toUpperCase()
}

function checkValidVehicleIdentity(vehicleIdentity, vehicleType, plateColor) {
  let isValidVehicle = true;
  
  function checkingValidPlateNumber(plateNumber) {
    return !/[^A-Z0-9Đ]/g.test(plateNumber);
  }
  // Kiểm tra biển số xe có chứa ký tự đặc biệt không
  const validPlateNumber = checkingValidPlateNumber(vehicleIdentity);
  if (!validPlateNumber) {
    return (isValidVehicle = false);
  }

  // checking contain valid serial character
  const specialSerialChar = 'KT,LD,DA,MK,MD,MĐ,TD,TĐ,HC,NG,QT,NN,CV,CD,LB,RM'.split(',');
  const normalSerialChar = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'R'];

  // Bổ sung: ký hiệu biển quân đội được đứng đầu chuỗi
  const militaryPrefix = [
    'TM', 'TC', 'TH', 'TT', 'TK', 'TN',
    'KA', 'KB', 'KC', 'KD', 'KV', 'KP', 'KK', 'KT',
    'AA', 'AB', 'AC', 'AD',
    'QA', 'QH', 'QB', 'QC', 'QM',
    'BL',
    'BB', 'BC', 'BK', 'BP', 'BH', 'BT',
    'HA', 'HB', 'HC', 'HE', 'HD', 'HH', 'HT', 'HQ', 'HN',
    'PA', 'PG', 'PK', 'PQ', 'PM', 'PX',
    'AV', 'AT', 'AN', 'AX', 'AM',
    'VT', 'CA', 'CB', 'CD', 'CH', 'CK', 'CM', 'CN', 'CP', 'CT', 'CV',
    'PP'
  ];

  // Nếu biển bắt đầu bằng prefix quân đội thì cho đi theo nhánh riêng
  const matchedMilitaryPrefix = militaryPrefix.find(prefix => vehicleIdentity.startsWith(prefix));
  if (matchedMilitaryPrefix) {
    const numberPart = vehicleIdentity.slice(matchedMilitaryPrefix.length);

    // Biển quân đội: phía sau prefix phải là số
    if (!/^\d+$/.test(numberPart)) {
      isValidVehicle = false;
    }

    // checking plate number length
    const MAX_LENGTH = 12;
    const MIN_LENGTH = 4;

    if (vehicleIdentity.length < MIN_LENGTH || vehicleIdentity.length > MAX_LENGTH) {
      isValidVehicle = false;
    }

    return isValidVehicle;
  }

  const includedNormalSerialChars = normalSerialChar.filter(char => vehicleIdentity.includes(char));
  const includedSpecialSerialChars = specialSerialChar.filter(char => vehicleIdentity.includes(char));
  let serialIndex = -1;
  let serialLength = 0;

  if (includedSpecialSerialChars.length > 0) {
    if (includedSpecialSerialChars.length !== 1) {
      isValidVehicle = false;
    } else {
      const includedChar = includedSpecialSerialChars[0];
      serialIndex = vehicleIdentity.indexOf(includedChar);
      serialLength = includedChar.length;

      const isContainRedundantNormalChar = includedNormalSerialChars.some(char => {
        const index = vehicleIdentity.indexOf(char);
        return index >= 0 && index < serialIndex;
      });

      if (isContainRedundantNormalChar) {
        isValidVehicle = false;
      }
    }
  } else if (includedNormalSerialChars.length === 1 || includedNormalSerialChars.length === 2) {
    serialIndex = vehicleIdentity.indexOf(includedNormalSerialChars[0]);
    serialLength = (vehicleIdentity.match(/[A-ZĐ]/g) || []).length;
  } else {
    isValidVehicle = false;
  }

  const totalLetterCount = (vehicleIdentity.match(/[A-ZĐ]/g) || []).length;

  // Chỉ cho phép 1 hoặc 2 chữ cái
  if (totalLetterCount > 2 || totalLetterCount === 0) {
    isValidVehicle = false;
  }

  // Nếu có 2 chữ thì phải đứng liền nhau
  if (totalLetterCount === 2) {
    const firstIndex = vehicleIdentity.search(/[A-ZĐ]/);
    const secondIndexRelative = vehicleIdentity.slice(firstIndex + 1).search(/[A-ZĐ]/);

    if (firstIndex === -1 || secondIndexRelative === -1) {
      isValidVehicle = false;
    } else {
      const secondIndex = firstIndex + 1 + secondIndexRelative;
      if (secondIndex - firstIndex !== 1) {
        isValidVehicle = false;
      }
    }
  }

  // Chữ đầu tiên phải bắt đầu sau đúng 2 ký tự đầu
  const firstLetterIndex = vehicleIdentity.search(/[A-ZĐ]/);
  if (firstLetterIndex !== 2) {
    isValidVehicle = false;
  }

  // Bổ sung: 2 ký tự đầu phải là số
  const firstTwoChars = vehicleIdentity.slice(0, 2);
  if (!/^\d{2}$/.test(firstTwoChars)) {
    isValidVehicle = false;
  }

  // Bổ sung: phần sau seri phải toàn là số
  if (serialIndex >= 0) {
    const numberPart = vehicleIdentity.slice(serialIndex + serialLength);
    if (!/^\d+$/.test(numberPart)) {
      isValidVehicle = false;
    }
  }

  // checking plate number length
  const MAX_LENGTH = 12;
  const MIN_LENGTH = 6;

  if (vehicleIdentity.length < MIN_LENGTH || vehicleIdentity.length > MAX_LENGTH) {
    isValidVehicle = false;
  }

  return isValidVehicle;
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