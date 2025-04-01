import Request from './request'

export default class CustomerScheduleService {
  static async userUpdateSchedule(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: `/PartnerAPI/CustomerSchedule/user/updateSchedule`,
        data: data,
      }).then((result = {}) => {
        const { statusCode } = result
        if (statusCode === 200) {
          return resolve({ issSuccess: true })
        } else {
          return resolve({ issSuccess: false })
        }
      })
    })
  }
}