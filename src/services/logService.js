import Request from './request'

export default class LogService {
  static async recordClick(data) {
    return new Promise((resolve, reject) => {
      Request.send({
        method: 'POST',
        path: '/AppUserClickActivity/partner/trackingClick',
        data: data
      }).then((result = {}) => {
        const { statusCode } = result
        if (statusCode === 200) {
          return resolve({ issSuccess: true })
        } else {
          return reject({ issSuccess: false })
        }
      })
    })
  }

}
