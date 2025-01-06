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
      })
    })
  }

}
