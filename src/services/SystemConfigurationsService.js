import Request from "./request";

export default class SystemConfigurationsService {
  static async getPublicSystemConfigurations(data, newToken) {
    return new Promise(resolve => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/SystemConfigurations/user/getPublicSystemConfigurations',
        data: { ...data },
        query: null,
        headers: {
          Authorization: `Bearer ` + newToken,
        },
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve(null)
        }
      })
    })
  }
}