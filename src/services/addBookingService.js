import Request from './request'
import addKeyLocalStorage from './../helper/localStorage'

export default class BookingService {
  static async AddBooking({ time, dateSchedule, email, fullnameSchedule, phone, licensePlates, notificationMethod }) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/CustomerSchedule/userInsertSchedule',
        data: {
          licensePlates: licensePlates,
          phone: phone,
          fullnameSchedule: fullnameSchedule,
          email: email,
          dateSchedule: dateSchedule,
          time: time,
          stationUrl: window.origin.split('://')[1],
          notificationMethod: notificationMethod
        }
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
  static async userCheckVehicleInfo(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/AppUserVehicle/user/fetchVehicleInfo',
        data
      }).then((result = {}) => {
        const { statusCode } = result
        if (statusCode === 200) {
          return resolve(result)
        } else {
          return resolve(result)
        }
      })
    })
  }
  static async getDetailIntroductionPage() {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/StationIntroduction/stationIntroductionDetail',
        data: {
          stationUrl: window.location.origin.split('://')[1]
        }
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async checkVihcleInfo() {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/StationIntroduction/stationIntroductionDetail',
        data: {
          stationUrl: window.location.origin.split('://')[1]
        }
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve(data)
        }
      })
    })
  }

  static async getScheduleDetail(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/CustomerSchedule/user/getDetailSchedule',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve({ isSuccess: true, data })
        } else {
          return resolve({ isSuccess: false })
        }
      })
    })
  }
  static async getDetailStation(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/Stations/user/getDetail',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async getStationList(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/Stations/user/getAllExternal',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }

  static async getDetailStation(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/Stations/user/getDetail',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async userGetHotNewList() {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/StationNews/user/getHighLightNews',
        data: {
          skip: 0,
          limit: 10,
          order:{
              key: 'ordinalNumber',
              value:"asc"
          }
        }
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async userGetLatestNew(skip) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/StationNews/user/getNewestList',
        data: {
          skip: skip || 0,
          limit: 10,
          stationsUrl: window.origin.split('://')[1],
        }
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async getPartnerPromotionNews(data={}) { // mặc định {} để có payload
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/StationNews/user/getPartnerPromotionNews',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async getPromotionNews(data={}) { // mặc định {} để có payload
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/StationNews/user/getPromotionNews',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async getZaloUserPhoneNumber(headers) {
    return new Promise((resolve) => {
      console.log("BookingService ~ returnnewPromise ~ headers:", headers)
      Request.sendZaloMiniApp({
        method: 'GET',
        headers: headers
      }).then((result = {}) => {
        const { statusCode, data } = result
        console.log("BookingService ~ returnnewPromise ~ result:", result)
        if (statusCode === 200) {
          return resolve(result)
        } else {
          return resolve(result)
        }
      })
    })
  }
  static async getBookingHours(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/Stations/user/getListScheduleTime',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          resolve(result)
        }
      })
    })
  }
  static async getMetaData(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/SystemConfigurations/getMetaData',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(result)
        } else {
          resolve(result)
        }
      })
    })
  }
  static async getBookingDate(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/Stations/user/getListScheduleDate',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          resolve(result)
        }
      })
    })
  }
  static async getList(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/HomePageConfig/user/getList',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(result)
        } else {
          return resolve(result)
        }
      })
    })
  }
  static async getBannerStationsList(filter) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/SystemPromoBanners/user/getList',
        data: filter
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async userGetPartnerUtilityNews(limit) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/StationNews/user/getPartnerUtilityNews',
        data: {
          skip: 0,
          limit: limit || 10,
          order:{
              key: 'ordinalNumber',
              value:"asc"
          }
        }
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async userGetRecruitmentNews(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/StationNews/user/getRecruitmentNews',
        data: data || {
          skip: 0,
          limit: 10,
          order:{
              key: 'ordinalNumber',
              value:"asc"
          }
        }
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async userGetExpertNews(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/StationNews/user/getExpertNews',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(data)
        } else {
          return resolve({})
        }
      })
    })
  }
  static async getStationAreaList() {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/Stations/user/getAllStationArea'
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(result)
        } else {
          return resolve(result)
        }
      })
    })
  }

  static async createSchedule(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/CustomerSchedule/user/createSchedule',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(result)
        } else {
          return resolve(result)
        }
      })
    })
  }

  static async createConsultantSchedule(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/CustomerSchedule/user/userCreateConsultant',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(result)
        } else {
          return resolve(result)
        }
      })
    })
  }

  static async findByHash(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/CustomerSchedule/user/findByHash',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve({ ...result, isSuccess: true })
        } else {
          return resolve({ isSuccess: false })
        }
      })
    })
  }

  static async reviewSchedule(data) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/CustomerReview/user/addReview',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(result)
        } else {
          return resolve(result)
        }
      })
    })
  }

  static async getMessageDetail(id) {
    const data = {
      id: parseInt(id)
    }
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/CustomerMessage/user/getDetailMessageById',
        data: data
      }).then((result = {}) => {
        const { statusCode, data } = result
        if (statusCode === 200) {
          return resolve(result)
        } else {
          return resolve(result)
        }
      })
    })
  }

  static async getBookingHistory(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/CustomerSchedule/user/getListSchedule',
        data
      }).then((result = {}) => {
        const { statusCode, data, message } = result

        if (statusCode === 200) {
          // kiểm tra : có phải lịch của user hãy không . nếu không bỏ qua nó
          // const user = JSON.parse(localStorage.getItem(addKeyLocalStorage('data')))
          // data.data = data.data.filter((item) => item.appUserId === user.appUserId)
          return resolve({ isSuccess: true, data })
        } else {
          return resolve({ isSuccess: false, message })
        }
      })
    })
  }

  static async getBookingHistoryImport(data = {} , cancelEvent) {
    return new Promise((resolve) => {
      Request.sendImportExport({
        method: 'POST',
        path: '/PartnerAPI/CustomerSchedule/user/getListSchedule',
        data,
        cancelEvent
      }).then((result = {}) => {
        const { statusCode, data, message } = result

        if (statusCode === 200) {
          // // kiểm tra : có phải lịch của user hãy không . nếu không bỏ qua nó
          // const user = JSON.parse(localStorage.getItem(addKeyLocalStorage('data')))
          // data.data = data.data.filter((item) => item.appUserId === user.appUserId)
          return resolve({ isSuccess: true, data })
        } else {
          return resolve({ isSuccess: false, message })
        }
      })
    })
  }

  static async getBookingDetail(id) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/CustomerSchedule/user/getDetailSchedule',
        data: {
          customerScheduleId: id
        }
      }).then((result = {}) => {
        const { statusCode, data, message } = result
        if (statusCode === 200) {
          return resolve({ isSuccess: true, data })
        } else {
          return resolve({ isSuccess: false, message })
        }
      })
    })
  }

  static async cancelBooking(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: '/PartnerAPI/CustomerSchedule/user/cancelSchedule',
        data
      }).then((result = {}) => {
        const { statusCode, data, message } = result
        if (statusCode === 200) {
          return resolve({ isSuccess: true, data })
        } else {
          return resolve({ isSuccess: false, message })
        }
      })
    })
  }

}
