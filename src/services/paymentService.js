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

  // Chi tiết đơn hàng do Backend trả về (kèm orderItems và availablePaymentMethods của trạm)
  static async getOrderDetail(orderId) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/Order/user/getOrderDetail',
        data: { id: orderId }
      }).then((result) => {
        // Request.send không resolve khi mất kết nối nên cần caller tự giới hạn thời gian chờ
        return resolve(result || { isNetworkError: true })
      })
    })
  }
}
