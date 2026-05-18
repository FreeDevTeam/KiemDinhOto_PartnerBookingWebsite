export const TAX_SEARCH_TYPE = {
  MST: 'MST',
  CCCD: 'CCCD'
}

export const TAX_SEARCH_TYPE_OPTIONS = [
  {
    value: TAX_SEARCH_TYPE.MST,
    label: 'Mã số thuế',
    placeholder: 'Nhập mã số thuế',
    maxLength: 13
  },
  {
    value: TAX_SEARCH_TYPE.CCCD,
    label: 'CCCD',
    placeholder: 'Nhập số CCCD',
    maxLength: 12
  }
]

export const validateTaxKeyword = ({ searchType, keyword }) => {
  if (!keyword) return 'Vui lòng nhập thông tin tra cứu'

  if (searchType === TAX_SEARCH_TYPE.MST && ![10, 13].includes(keyword.length)) {
    return 'Mã số thuế phải có 10 hoặc 13 số'
  }

  if (searchType === TAX_SEARCH_TYPE.CCCD && keyword.length !== 12) {
    return 'CCCD phải có 12 số'
  }

  return ''
}