import Request from './request'

export default class TaxCdsService {
  static async lookupTaxCode(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/TaxCDSMstLookup/user/getList',
        data: data
      }).then((result = {}) => {
        const { statusCode, data, message, error } = result

        if (statusCode === 200) {
          return resolve({ isSuccess: true, data })
        } else {
          return resolve({ isSuccess: false, message, error })
        }
      })
    })
  }

  static async getTaxCodeLookupList(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/TaxCDSMstLookup/user/getList',
        data: data
      }).then((result = {}) => {
        const { statusCode, data, message, error } = result

        if (statusCode === 200) {
          return resolve({ isSuccess: true, data })
        } else {
          return resolve({ isSuccess: false, message, error })
        }
      })
    })
  }

  static async saveTaxCodeLookup(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/TaxCDSMstLookup/user/create',
        data: data
      }).then((result = {}) => {
        const { statusCode, data, message, error } = result

        if (statusCode === 200) {
          return resolve({ isSuccess: true, data })
        } else {
          return resolve({ isSuccess: false, message, error })
        }
      })
    })
  }

  static async deleteTaxCodeLookup(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/TaxCDSMstLookup/user/deleteById',
        data: data
      }).then((result = {}) => {
        const { statusCode, data, message, error } = result

        if (statusCode === 200) {
          return resolve({ isSuccess: true, data })
        } else {
          return resolve({ isSuccess: false, message, error })
        }
      })
    })
  }
}