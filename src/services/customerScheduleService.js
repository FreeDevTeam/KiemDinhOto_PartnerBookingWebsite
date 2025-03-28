import Request from './request'

export default class CustomerScheduleService {
  static async userUpdateSchedule(data,token) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/CustomerSchedule/user/updateSchedule',
        data: data,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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