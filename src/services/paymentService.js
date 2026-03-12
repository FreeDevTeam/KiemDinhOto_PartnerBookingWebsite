import Request from './request'

export default class PaymentService {
  static async getPaymentQRMethod(data) {
    return new Promise((resolve, reject) => {
      Request.send({
        method: 'POST',
        path: '/PaymentQR/user/getPublicPaymentMethod',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return reject(null)
        }
      }).catch(() => {
        return reject(null)
      })
    })
  }

  static async createPayment(data) {
    return new Promise((resolve, reject) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/CustomerSchedule/user/createPayment',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return reject(null)
        }
      }).catch(() => {
        return reject(null)
      })
    })
  }

  static async checkOrderStatus(orderId) {
    return new Promise((resolve, reject) => {
      Request.send({
        method: 'POST',
        path: '/Order/user/getOrderDetail',
        data: { id: orderId }
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return reject(null)
        }
      }).catch(() => {
        return reject(null)
      })
    })
  }
}
