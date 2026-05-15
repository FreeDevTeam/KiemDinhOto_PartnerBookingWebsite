import Request from './request'

const normalizeTaxCdsItem = (item = {}) => {
  const taxCDSMstLookupId =
    item.taxCDSMstLookupId ||
    item.tax_cds_mst_lookup_id ||
    null

  return {
    ...item,

    taxCDSMstLookupId,

    taxCode: item.taxCode || item.tax_code || item.mst || item.taxNumber || '',
    taxpayerName: item.taxpayerName || item.name || item.taxpayer_name || item.companyName || '',
    name: item.name || item.taxpayerName || item.taxpayer_name || item.companyName || '',

    businessAddress: item.businessAddress || item.address || item.business_address || '',
    address:
      item.address ||
      item.businessAddress ||
      item.business_address ||
      item.taxRegistrationAddress ||
      item.tax_registration_address ||
      '',

    taxRegistrationAddress:
      item.taxRegistrationAddress ||
      item.tax_registration_address ||
      item.businessAddress ||
      item.address ||
      '',

    taxDepartment: item.taxDepartment || item.tax_department || '',
    identityNumber: item.identityNumber || item.identity_number || '',
    status: item.status || '',
    statusText: item.statusText || item.status_text || '',
    note: item.note || ''
  }
}

export default class TaxCdsService {
  static async lookupTaxCode(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/TaxCDSMstLookup/user/getList',
        data: {
          filter: {
            searchType: data.searchType
          },
          skip: 0,
          limit: 10,
          searchText: data.keyword,
          order: {
            key: 'createdAt',
            value: 'desc'
          }
        }
      })
        .then((result = {}) => {
          const { statusCode, data: responseData, message, error } = result

          if (statusCode === 200) {
            const list = Array.isArray(responseData?.data) ? responseData.data : []

            return resolve({
              isSuccess: true,
              data: list.map(normalizeTaxCdsItem),
              message
            })
          }

          return resolve({
            isSuccess: false,
            data: [],
            message: message || 'Không thể tra cứu mã số thuế. Vui lòng thử lại.',
            error
          })
        })
        .catch((error) => {
          return resolve({
            isSuccess: false,
            data: [],
            message: 'Không thể tra cứu mã số thuế. Vui lòng thử lại.',
            error
          })
        })
    })
  }

  static async getTaxCodeLookupList(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/TaxCDSMstLookup/user/getList',
        data: {
          filter: {
            appUserId: data.appUserId,
            searchType: data.searchType
          },
          skip: data.skip || 0,
          limit: data.limit || 10,
          searchText: data.searchText || '',
          order: data.order || {
            key: 'createdAt',
            value: 'desc'
          }
        }
      })
        .then((result = {}) => {
          const { statusCode, data: responseData, message, error } = result

          if (statusCode === 200) {
            const list = Array.isArray(responseData?.data) ? responseData.data : []

            return resolve({
              isSuccess: true,
              data: list.map(normalizeTaxCdsItem),
              total: responseData?.total || 0,
              message
            })
          }

          return resolve({
            isSuccess: false,
            data: [],
            total: 0,
            message: message || 'Không thể lấy dữ liệu tra cứu.',
            error
          })
        })
        .catch((error) => {
          return resolve({
            isSuccess: false,
            data: [],
            total: 0,
            message: 'Không thể lấy dữ liệu tra cứu.',
            error
          })
        })
    })
  }

  static async saveTaxCodeLookup(data = {}) {
    const items = Array.isArray(data.items) ? data.items : []

    if (!items.length) {
      return {
        isSuccess: true,
        data: null,
        message: ''
      }
    }

    return new Promise((resolve) => {
      Promise.all(
        items.map((item) => {
          const normalizedItem = normalizeTaxCdsItem(item)

          return Request.send({
            method: 'POST',
            path: '/TaxCDSMstLookup/user/create',
            data: {
              data: {
                appUserId: data.appUserId,
                searchType: data.searchType,
                keyword: data.keyword,
                taxCode: normalizedItem.taxCode,
                taxpayerName: normalizedItem.taxpayerName || normalizedItem.name,
                businessAddress: normalizedItem.businessAddress || normalizedItem.address,
                taxRegistrationAddress: normalizedItem.taxRegistrationAddress || normalizedItem.address,
                taxDepartment: normalizedItem.taxDepartment,
                identityNumber: normalizedItem.identityNumber,
                status: normalizedItem.status,
                statusText: normalizedItem.statusText,
                note: normalizedItem.note
              }
            }
          })
        })
      )
        .then((results = []) => {
          const failedResult = results.find((result = {}) => result.statusCode !== 200)

          if (!failedResult) {
            return resolve({
              isSuccess: true,
              data: results,
              message: ''
            })
          }

          return resolve({
            isSuccess: false,
            data: null,
            message: failedResult.message || 'Không thể lưu dữ liệu tra cứu.',
            error: failedResult.error
          })
        })
        .catch((error) => {
          return resolve({
            isSuccess: false,
            data: null,
            message: 'Không thể lưu dữ liệu tra cứu.',
            error
          })
        })
    })
  }

  static async deleteTaxCodeLookup(data = {}) {
    const id = data.id || data.taxCDSMstLookupId

    if (!id) {
      return {
        isSuccess: false,
        data: null,
        message: 'Không tìm thấy ID dữ liệu cần xoá.'
      }
    }

    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/TaxCDSMstLookup/user/deleteById',
        data: {
          id
        }
      })
        .then((result = {}) => {
          const { statusCode, data, message, error } = result

          if (statusCode === 200) {
            return resolve({
              isSuccess: true,
              data,
              message
            })
          }

          return resolve({
            isSuccess: false,
            data: null,
            message: message || 'Không thể xoá dữ liệu tra cứu.',
            error
          })
        })
        .catch((error) => {
          return resolve({
            isSuccess: false,
            data: null,
            message: 'Không thể xoá dữ liệu tra cứu.',
            error
          })
        })
    })
  }
}