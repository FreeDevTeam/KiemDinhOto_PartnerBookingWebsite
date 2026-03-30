import React, { useState, useEffect, useMemo, useCallback } from 'react'
import moment from 'moment'
import { Form, Input, Button, Spin, Select as SelectAntd, Row, Col } from 'antd'

import BookingSuccess from './BookingSuccessModal'
import PopupMessage from './PopupMessage'
import { changeTime } from '../../helper/changeTime'
import { validatorPlateNumber } from './../../helper/validatorPlateNumber'
import { getServiceTypeFilterByScheduleType, optionServiceType, SCHEDULE_TITLE, SCHEDULE_TYPE_MINIAPP } from '../../constants/serviceOption'
import { PATH } from '../../constants/router'
import {
  PAYMENT_SUB_TYPE,
  PAYMENT_TYPE,
  PLATE_COLOR,
  VEHICLE_SUB_CATEGORY,
  VEHICLE_SUB_TYPE,
  VIHCLE_CATEGORY_BUS,
  VIHCLE_CATEGORY_GROUP,
  VIHCLE_CATEGORY_MOOC,
  VIHCLE_CATEGORY_OTO,
  VIHCLE_CATEGORY_PICKUP,
  VIHCLE_CATEGORY_SPECIALIZED,
  VIHCLE_CATEGORY_TRUCK
} from '../../constants/global'
import BookingService, { fetchMetadataWithCache } from '../../services/addBookingService'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'

import BookingDatePicker from '../../components/BookingDatePicker'
import BookingHoursPicker from '../../components/BookingHoursPicker'
import { SCHEDULE_ERROR } from '../../constants/errorMessage'
import SystemConfigurationsService from '../../services/SystemConfigurationsService'
import MainLogo from '../../components/MainLogo'
import addKeyLocalStorage from '../../helper/localStorage'
import PaymentService from '../../services/paymentService'
import { detectPaymentCase } from './StationServicesSelect'
import {
  buildExternalPaymentUrl,
  buildPaymentBackUrl,
  getScheduleHashFromPayload,
  resolveExternalPaymentContext
} from './helper/paymentRedirectHelper'

const Gtel = window

// FUNC: Băm url để lấy các params trên url và trả về dạng mảng có object là key và value
export function getQueryParams(options = {}) {
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search)
    const result = {}
    for (const [key, value] of params.entries()) {
      result[key] = value
    }
    return result
  }
  return {}
}
function BookingPartnerForm({ form, zaloUserName, zaloUserPhone, gtelpayUser }) {
  const customStyles = {
    control: (base) => ({
      ...base,
      height: 48,
      minHeight: 35,
      fontSize: 14
    })
  }

  const SCHEDULE_BOOKING_TYPE = {
    SCHEDULE: 1,
    CONSULTANT: 2
  }

  // state dùng cho form
  const [scheduleCategory, setScheduleCategory] = useState(1)
  const [scheduleTypes, setScheduleTypes] = useState([])
  const [licensePlateColorList, setLicensePlateColorList] = useState(PLATE_COLOR)
  const [vehicleSubCategoryOptions, setVehicleSubCategoryOptions] = useState([])
  const [listStationArea, setListStationArea] = useState([])
  const [listStation, setListStation] = useState([])
  const [listBookingDate, setListBookingDate] = useState([])
  const [stationBookingConfig, setStationBookingConfig] = useState([])
  const [stationSelected, setStationSelected] = useState(null)
  const [isWorkdayLoading, setIsWorkdayLoading] = useState(false)
  const [workdaySelectedDate, setWorkdaySelectedDate] = useState(moment().format(DATE_DISPLAY_FORMAT))
  const [loadingHoursPicker, setLoadingHoursPicker] = useState(false)
  const [listBookingTime, setListBookingTime] = useState([])
  const [minMonthAvailable, setMinMonthAvailable] = useState(moment().format(DATE_DISPLAY_FORMAT))
  const [stationServices, setStationServices] = useState([])
  const [stationServiceOrder, setStationServiceOrder] = useState([])
  const [selectedServiceIds, setSelectedServiceIds] = useState([])
  const [workdayFilter, setWorkdayFilter] = useState({
    stationsId: null,
    startDate: moment().format(DATE_DISPLAY_FORMAT),
    endDate: moment().endOf('month').format(DATE_DISPLAY_FORMAT),
    vehicleType: VEHICLE_SUB_TYPE[0]?.vehicleType
  })
  const paramsScheduleTypeParams = (getQueryParams() || {})?.scheduleType
  const dataTheme = JSON.parse(localStorage.getItem(addKeyLocalStorage('dataTheme'))) || {}
  const selectedScheduleType = Form.useWatch('scheduleType', form)
  const watchedStationsId = Form.useWatch('stationsId', form)
  const watchedVntId = Form.useWatch('vntId', form)
  const watchedVehicleSubType = Form.useWatch('vehicleSubType', form)

  // khai báo các biến cho toàn trang
  const [isLoading, setIsLoading] = useState(false)

  // Kiểm tra các biển trong ENV
  const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1 // ==> dùng cho miniApp
  const MINIAPP_GTELPAY = window?._env_?.REACT_APP_MINIAPP_GTELPAY == '1' 
  const MINIAPP_ZALOPAY = window?._env_?.REACT_APP_MINIAPP_ZALOPAY == '1' // dùng để tích hợp thanh toán qua ZALOPAY

  // state này để lấy thông tin trên params và hiển thị cho lần đầu tiên
  const [dataBookingParam, setDataBookingParam] = useState({})
  const resolvedStationsId = watchedStationsId || dataBookingParam?.stationsId

  // state của các modal hiển thị thông báo
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scheduleTypePopUp, setScheduleTypePopUp] = useState([])
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // states cho phương thức thanh toán
  const [zalopayPaymentMethod, setZalopayPaymentMethod] = useState(null)

  // State lưu data thanh toán
  const [paymentData, setPaymentData] = useState(null)
  const stationServiceOrderMap = useMemo(() => {
    const orderMap = new Map()
    stationServiceOrder.forEach((serviceType, index) => {
      if (serviceType === undefined || serviceType === null) return
      orderMap.set(String(serviceType), index)
    })
    return orderMap
  }, [stationServiceOrder])

  const sortServicesByMetadataOrder = useCallback(
    (services = []) => {
      if (!Array.isArray(services) || services.length === 0) return []
      if (stationServiceOrderMap.size === 0) return [...services]

      const fallbackIndex = Number.MAX_SAFE_INTEGER
      return [...services].sort((a, b) => {
        const orderA = stationServiceOrderMap.get(String(a?.serviceType)) ?? fallbackIndex
        const orderB = stationServiceOrderMap.get(String(b?.serviceType)) ?? fallbackIndex

        if (orderA !== orderB) return orderA - orderB
        if (orderA === fallbackIndex && orderB === fallbackIndex) return 0

        const nameA = String(a?.serviceName || a?.label || '')
        const nameB = String(b?.serviceName || b?.label || '')
        return nameA.localeCompare(nameB, 'vi')
      })
    },
    [stationServiceOrderMap]
  )

  const filteredStationServices = useMemo(() => {
    if (!Array.isArray(stationServices) || stationServices.length === 0) return []

    const allowedServiceTypes = getServiceTypeFilterByScheduleType(selectedScheduleType)
    if (!Array.isArray(allowedServiceTypes) || allowedServiceTypes.length === 0) {
      return stationServices
    }

    const allowedServiceTypeSet = new Set(allowedServiceTypes.map((serviceType) => Number(serviceType)))
    return stationServices.filter((service) => allowedServiceTypeSet.has(Number(service?.serviceType)))
  }, [stationServices, selectedScheduleType])

  const handleOpenExternalPayment = (paymentPayloadOrOrderId) => {
    if (!paymentPayloadOrOrderId && !paymentData?.paymentUrl && !paymentData?.orderId) return

    const mergedPaymentData =
      paymentPayloadOrOrderId && typeof paymentPayloadOrOrderId === 'object'
        ? { ...paymentData, ...paymentPayloadOrOrderId }
        : paymentPayloadOrOrderId || paymentData

    const { url, scheduleHash, orderId, isConsultantBooking } = resolveExternalPaymentContext(mergedPaymentData)
    if (!url) return

    const backUrl = buildPaymentBackUrl({
      isConsultantBooking,
      orderId,
      scheduleHash,
      bookingDetailPath: PATH.BOOKING_DETAIL_NO_ID
    })
    const redirectUrl = buildExternalPaymentUrl({
      rawUrl: url,
      backUrl,
      themeName: process.env.REACT_APP_THEME_NAME
    })
    if (!redirectUrl) return
    setIsModalOpen(false)
    window.location.assign(redirectUrl)
  }

  const getPublicPaymentMethod = async () => {
    try {
      const data = await PaymentService.getPaymentQRMethod()
      if (data['zaloPay']) {
        return setZalopayPaymentMethod(data['zaloPay'])
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const getStationConfigByApiKey = async (paramsFromUrl) => {
    setIsLoading(true)
    const apiKey = paramsFromUrl?.apiKey || paramsFromUrl?.apikey || localStorage.getItem('apiKey') || process.env.REACT_APP_APIKEY || undefined

    try {
      if (!apiKey) {
        setDataBookingParam({ ...paramsFromUrl })
        return
      }

      const [stationConfig, stationByApiKey] = await Promise.all([
        SystemConfigurationsService.getStationConfigByApiKey({ apiKey: apiKey }),
        SystemConfigurationsService.getStationByApiKey(apiKey)
      ])

      const stationMiniAppLink = JSON.parse(stationConfig?.[0]?.stationMiniAppLink || '{}')
      const stationIdFromApiKey = stationByApiKey?.stationsId || stationByApiKey?.stationId

      setDataBookingParam({
        ...stationMiniAppLink,
        ...paramsFromUrl,
        stationsId: paramsFromUrl?.stationsId || stationIdFromApiKey || stationMiniAppLink?.stationsId
      })
    } catch (err) {
      setErrorMessage('Lấy thông tin cấu hình thất bại.')
      setIsModalErrOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const GtelBookingConsultantSchedule = (values) => {
    setIsLoading(true)
    const payload = {
      ...values,
      isImmediate: 1
    }
    BookingService.createOrderSchedule(payload)
      .then((result) => {
        const { error: rsMess, statusCode, data } = result
        if (statusCode !== 200) {
          setIsModalErrOpen(true)
          setErrorMessage(SCHEDULE_ERROR[rsMess] || SCHEDULE_ERROR.INVALID_REQUEST)
          return
        }
        const { paymentUrl } = data
        const customerScheduleId = data?.[0]
        // Gọi API thanh toán nếu ở môi trường GTEL
        if (MINIAPP_GTELPAY) {
          BookingService.createPayment({
            customerScheduleId,
            paymentMethodType: PAYMENT_TYPE.GTEL_PAY,
            paymentMethodSubType: PAYMENT_SUB_TYPE.GTEL_WEBINAPP
          }).then((result) => {
            const orderId = result?.data?.inAppGtelOrderId
            if (result?.isSuccess && orderId) {
              Gtel.GtelPayJSBridge?.payOrder({ order_id: orderId })
            }
          })
        }
        setScheduleTypePopUp(values.scheduleType)
        if (paymentUrl?.length > 0) {
          const scheduleHash = getScheduleHashFromPayload(data)
          setTimeout(() => {
            handleOpenExternalPayment({ paymentUrl, scheduleHash, customerScheduleId, isConsultantBooking: true })
          }, 500)
        }
        form.resetFields(['name', 'licensePlates', 'certificateSeries', 'time'])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const GtelCreateBookingSchedule = (values) => {
    setIsLoading(true)
    BookingService.createOrderSchedule(values)
      .then((result) => {
        const { error: rsMess, statusCode, data } = result

        if (statusCode !== 200) {
          setIsModalErrOpen(true)
          setErrorMessage(SCHEDULE_ERROR[rsMess] || SCHEDULE_ERROR.INVALID_REQUEST)
          return
        }
        const scheduleId = data?.[0]
        if (MINIAPP_GTELPAY && scheduleId) {
          BookingService.createPayment({
            customerScheduleId: scheduleId,
            stationServicesList: values['stationServicesList'],
            paymentMethodType: PAYMENT_TYPE.GTEL_PAY,
            paymentMethodSubType: PAYMENT_SUB_TYPE.GTEL_WEBINAPP
          }).then((result) => {
            const orderId = result?.data?.inAppGtelOrderId
            if (orderId) {
              Gtel.GtelPayJSBridge?.payOrder({ order_id: orderId })
            }
          })
        }
        form.resetFields(['name', 'licensePlates', 'certificateSeries', 'time'])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const bookingConsultantSchedule = (values) => {
    setIsLoading(true)
    BookingService.createConsultantSchedule(values)
      .then((result) => {
        const { error: rsMess, statusCode, data } = result
        if (statusCode !== 200) {
          setIsModalErrOpen(true)
          setErrorMessage(SCHEDULE_ERROR[rsMess] || SCHEDULE_ERROR.INVALID_REQUEST)
          return
        }
        const { customerScheduleId, paymentUrl } = data
        
        // Kiểm tra thanh toán tùy chọn
        const paymentCase = detectPaymentCase()
        
        // Hiển thị modal thành công + nút thanh toán, không navigate ngay
        if (paymentCase === 'onlinePayment' && selectedServiceIds.length > 0) {
          const scheduleData = buildScheduleData(values)
          const serviceData = buildServiceData('enableOnlinePayment')
          const paymentUrlFromRes = paymentUrl
          const scheduleHash = getScheduleHashFromPayload(data)
          setPaymentData({
            customerScheduleId,
            schedulingType: 'ONLINE_PAYMENT',
            isConsultantBooking: true,
            scheduleData,
            serviceData,
            paymentUrl: paymentUrlFromRes,
            scheduleHash
          })
          
          form.resetFields(['name', 'licensePlates', 'certificateSeries', 'time'])
          setScheduleTypePopUp(values.scheduleType)
          setIsModalOpen(true)
          setIsLoading(false)
          return
        }
        
        // Gọi API thanh toán nếu ở môi trường GTEL
        if (MINIAPP_GTELPAY) {
          BookingService.createPayment({
            customerScheduleId,
            paymentMethodType: PAYMENT_TYPE.GTEL_PAY
          }).then((result) => {
            const orderId = result?.data?.inAppGtelOrderId
            if (result?.isSuccess && orderId) {
              Gtel.GtelPayJSBridge?.payOrder({ order_id: orderId })
            }
          })
        }
        setScheduleTypePopUp(values.scheduleType)
        setIsModalOpen(true)
        if (paymentUrl?.length > 0) {
          const scheduleHash = getScheduleHashFromPayload(data)
          setTimeout(() => {
            handleOpenExternalPayment({ paymentUrl, scheduleHash, customerScheduleId, isConsultantBooking: true })
          }, 500)
        }
        form.resetFields(['name', 'licensePlates', 'certificateSeries', 'time'])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }


  // Hàm xử lý kết quả đặt lịch
  const handleBookingResult = (result, values, paymentCase, type = 'schedule') => {
    const { error: rsMess, statusCode, data } = result
    if (statusCode !== 200) {
      setIsModalErrOpen(true)
      setErrorMessage(SCHEDULE_ERROR[rsMess] || SCHEDULE_ERROR.INVALID_REQUEST)
      setIsLoading(false)
      return
    }
    if (!Array.isArray(data) || data.length === 0) {
      setIsModalErrOpen(true)
      setErrorMessage('Không nhận được mã lịch/đơn hàng')
      setIsLoading(false)
      return
    }
    const id = data[0]
    const paymentUrlFromRes = data?.paymentUrl
    const scheduleHashFromRes = getScheduleHashFromPayload(data)
    form.resetFields(['name', 'licensePlates', 'certificateSeries', 'time'])
    setScheduleTypePopUp(values.scheduleType)

    if (!paymentCase) {
      setIsModalOpen(true)
      setIsLoading(false)
      return
    }
    if (paymentCase === 'onlinePayment') {
      const scheduleData = buildScheduleData(values)
      const serviceData = buildServiceData('enableOnlinePayment')
      setPaymentData({
        orderId: id,
        schedulingType: 'ONLINE_PAYMENT',
        isConsultantBooking: false,
        scheduleData,
        serviceData,
        formValues: values,
        paymentUrl: paymentUrlFromRes,
        scheduleHash: scheduleHashFromRes
      })
      setIsModalOpen(true)
      setIsLoading(false)
      return
    }
    if (paymentCase === 'prepay') {
      const scheduleData = buildScheduleData(values)
      const serviceData = buildServiceData('enablePrepay')
      handleOpenExternalPayment({
        orderId: id,
        schedulingType: 'PREPAY',
        isConsultantBooking: false,
        scheduleData,
        serviceData,
        formValues: values,
        scheduleHash: scheduleHashFromRes
      })
      setIsLoading(false)
      return
    }
  }

  const createBookingSchedule = (values) => {
    const paymentCase = detectPaymentCase(stationServices, selectedServiceIds)
    setIsLoading(true)
    BookingService.createSchedule(values)
      .then((result) => handleBookingResult(result, values, paymentCase, 'schedule'))
      .catch((error) => {
        setIsModalErrOpen(true)
        setErrorMessage('Lỗi kết nối hoặc tạo lịch thất bại')
        setIsLoading(false)
      })
  }

  // Tạo order và xử lý thanh toán
  const createOrderScheduleAndPay = (values, paymentCase) => {
    setIsLoading(true)
    let data = { ...values }
    if (paymentCase === 'onlinePayment') {
      data.isImmediate = 1 // yêu cầu BE tạo lịch trước khi thanh toán
    }
    BookingService.createOrderSchedule(data)
      .then((result) => handleBookingResult(result, values, paymentCase, 'order'))
      .catch((error) => {
        setIsModalErrOpen(true)
        setErrorMessage('Lỗi kết nối hoặc tạo đơn hàng thất bại')
        setIsLoading(false)
      })
  }

  // Hàm helper: Xây dựng dữ liệu lịch hẹn
  const getScheduleTimeValue = (timeValue) => {
    if (typeof timeValue === 'string') return timeValue.trim()
    if (timeValue && typeof timeValue === 'object') {
      return String(timeValue.scheduleTime || '').trim()
    }
    return ''
  }

  const removeOptionalEmptyFields = (payload = {}) => {
    return Object.entries(payload).reduce((result, [key, value]) => {
      if (value === undefined || value === null) return result
      if (typeof value === 'string' && value.trim() === '' && key !== 'dateSchedule' && key !== 'time') return result
      if (Array.isArray(value) && value.length === 0) return result
      result[key] = value
      return result
    }, {})
  }

  const buildBookingPayload = (values = {}) => {
    const isConsultantBooking = scheduleCategory === SCHEDULE_BOOKING_TYPE.CONSULTANT
    const payload = {
      licensePlates: values.licensePlates,
      phone: values.phone,
      fullnameSchedule: values.name,
      email: values.email,
      vehicleType: workdayFilter.vehicleType,
      licensePlateColor: values.licensePlateColor,
      scheduleType: values.scheduleType,
      vehicleSubType: values.vehicleSubType,
      vehicleSubCategory: values.vehicleSubCategory,
      certificateSeries: values.certificateSeries
    }

    if (!isConsultantBooking && isShowStationDateTime.showStationField) {
      payload.stationsId = values.stationsId
    }
    if (!isConsultantBooking && isShowStationDateTime.showDateField) {
      payload.dateSchedule = workdaySelectedDate
    }
    if (!isConsultantBooking && isShowStationDateTime.showTimeField) {
      payload.time = getScheduleTimeValue(values?.time)
    }
    if (selectedServiceIds.length > 0) {
      payload.stationServicesList = selectedServiceIds
    }

    return removeOptionalEmptyFields(payload)
  }

  const buildScheduleData = (values) => {
    const isConsultantBooking = scheduleCategory === SCHEDULE_BOOKING_TYPE.CONSULTANT
    const scheduleData = {
      licensePlates: values.licensePlates,
      fullnameSchedule: values.name,
      email: values.email,
      phone: values.phone,
      scheduleType: values.scheduleType,
      vehicleType: workdayFilter.vehicleType,
      vehicleSubType: values.vehicleSubType,
      vehicleSubCategory: values.vehicleSubCategory,
      licensePlateColor: values.licensePlateColor,
      certificateSeries: values.certificateSeries
    }

    if (!isConsultantBooking && isShowStationDateTime.showDateField) {
      scheduleData.dateSchedule = workdaySelectedDate
    }
    if (!isConsultantBooking && isShowStationDateTime.showTimeField) {
      scheduleData.time = getScheduleTimeValue(values?.time)
    }

    return removeOptionalEmptyFields(scheduleData)
  }

  // Hàm helper: Xây dựng dữ liệu dịch vụ từ selectedServiceIds
  const buildServiceData = (serviceField = 'enableOnlinePayment') => {
    const selectedServiceId = selectedServiceIds.length > 0 ? selectedServiceIds[0] : null
    const selectedService = stationServices.find(s => s.stationServicesId === selectedServiceId)
    return selectedService ? {
      serviceName: selectedService.serviceName,
      servicePrice: selectedService.servicePrice || 0,
      stationServicesList: selectedServiceIds,
      [serviceField]: selectedService[serviceField] === 1
    } : {
      serviceName: '',
      servicePrice: 0,
      stationServicesList: []
    }
  }

  const handlePaymentInZaloPay = async (app_id, zp_trans_token) => {
    return window.zlpSdk.Payment.startCashier({
      orders: [
        {
          order_type: 1,
          order: {
            app_id: app_id,
            zp_trans_token: zp_trans_token
          }
        }
      ],
      callback: (data) => {
        switch (data.payment_event) {
          case 'PAYMENT_COMPLETED':
            // onOpen()
            break
          case 'PAYMENT_CANCEL':
            // onOpen()
            break
          default:
            console.log('Unhandled event:', data)
            break
        }
      }
    })
  }

  // const ZaloPayBookingConsultantSchedule = (values) => {
  //   setIsLoading(true)
  //   BookingService.createOrderSchedule(values)
  //     .then((result) => {
  //       const { error: rsMess, statusCode, data } = result
  //       if (statusCode !== 200) {
  //         setIsModalErrOpen(true)
  //         setErrorMessage(SCHEDULE_ERROR[rsMess] || SCHEDULE_ERROR.INVALID_REQUEST)
  //         return
  //       }
  //       const { paymentUrl } = data
  //       const customerScheduleId = data?.[0]
  //       // Gọi API thanh toán nếu ở môi trường GTEL
  //       if (MINIAPP_ZALOPAY) {
  //         BookingService.createPayment({
  //           customerScheduleId,
  //           paymentMethodType: zalopayPaymentMethod?.paymentMethodType,
  //           paymentMethodId: zalopayPaymentMethod?.paymentMethodId
  //         }).then((result) => {
  //           console.log('result', result)
  //           const app_id = result?.data?.app_id
  //           const zp_trans_token = result?.data?.zp_trans_token
  //           if (result?.isSuccess && app_id && zp_trans_token) {
  //             handlePaymentInZaloPay(app_id, zp_trans_token)
  //           }
  //         })
  //       }
  //       setScheduleTypePopUp(values.scheduleType)
  //       if (paymentUrl?.length > 0) {
  //         setTimeout(() => {
  //           window.open(paymentUrl, '_blank')
  //         }, 500)
  //       }
  //       form.resetFields(['name', 'licensePlates', 'certificateSeries', 'time'])
  //     })
  //     .finally(() => {
  //       setIsLoading(false)
  //     })
  // }

  const ZaloPayCreateBookingSchedule = (values) => {
    setIsLoading(true)
    BookingService.createOrderSchedule(values)
      .then((result) => {
        const { error: rsMess, statusCode, data } = result

        if (statusCode !== 200) {
          setIsModalErrOpen(true)
          setErrorMessage(SCHEDULE_ERROR[rsMess] || SCHEDULE_ERROR.INVALID_REQUEST)
          return
        }
        const scheduleId = data?.[0]
        if (MINIAPP_ZALOPAY && scheduleId) {
          BookingService.createPayment({
            customerScheduleId: scheduleId,
            stationServicesList: values['stationServicesList'],
            paymentMethodType: zalopayPaymentMethod?.paymentMethodType,
            paymentMethodId: zalopayPaymentMethod?.paymentMethodId
          }).then((result) => {
            const app_id = result?.data?.paymentQR?.paymentGatewayData?.app_id
            const zp_trans_token = result?.data?.paymentQR?.paymentGatewayData?.zp_trans_token
            if (app_id && zp_trans_token) {
              handlePaymentInZaloPay(app_id, zp_trans_token)
            }
          })
        }
        form.resetFields(['name', 'licensePlates', 'certificateSeries', 'time'])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const onFinish = (values) => {
    const data = buildBookingPayload(values)

    // Detect phương thức thanh toán dựa trên service được chọn
    const paymentCase = detectPaymentCase(stationServices, selectedServiceIds)

    // Miniapp environment (GTEL/ZALOPAY) luôn được ưu tiên trước
    if (scheduleCategory === SCHEDULE_BOOKING_TYPE.CONSULTANT && MINIAPP_GTELPAY) {
      GtelBookingConsultantSchedule(data)
    } else if (scheduleCategory === SCHEDULE_BOOKING_TYPE.SCHEDULE && MINIAPP_GTELPAY) {
      GtelCreateBookingSchedule(data)
    } else if (scheduleCategory === SCHEDULE_BOOKING_TYPE.SCHEDULE && MINIAPP_ZALOPAY) {
      ZaloPayCreateBookingSchedule(data)
    } else if (!paymentCase) {
      // Không có payment case từ service
      if (scheduleCategory === SCHEDULE_BOOKING_TYPE.CONSULTANT) {
        bookingConsultantSchedule(data)
      } else if (scheduleCategory === SCHEDULE_BOOKING_TYPE.SCHEDULE) {
        createBookingSchedule(data)
      }
    } else if (paymentCase === 'onlinePayment') {
      // Thanh toán tùy chọn: Tạo schedule + order, show modal có nút thanh toán
      createOrderScheduleAndPay(data, 'onlinePayment')
    } else if (paymentCase === 'prepay') {
      // Thanh toán bắt buộc: Tạo order, chuyển sang trang thanh toán
      createOrderScheduleAndPay(data, 'prepay')
    }
    getBookingDate()
  }

  const handleFillStationDateTime = () => {
    const stationsId = form.getFieldValue('stationsId')
    setWorkdayFilter((prev) => ({
      ...prev,
      stationsId: stationsId
    }))
  }

  const getMetaData = () => {
    fetchMetadataWithCache()
      .then((result) => {
        const { statusCode, data } = result
        const stationServiceMeta = data?.STATION_SERVICE || {}
        const nextStationServiceOrder = Object.values(stationServiceMeta)
          .map((item) => item?.serviceType)
          .filter((serviceType) => serviceType !== undefined && serviceType !== null)
        setStationServiceOrder(nextStationServiceOrder)
        if (statusCode === 200 && data?.SCHEDULE_TYPE) {
          const newValues = Object.values(data.SCHEDULE_TYPE).map((item) => ({
            value: item.scheduleType,
            requireScheduleDate: item?.requireScheduleDate,
            requireScheduleStation: item?.requireScheduleStation,
            requireScheduleTime: item?.requireScheduleTime,
            scheduleCategory: item?.scheduleCategory,
            priceTTDK: item?.priceTTDK,
            disabled: !item.scheduleTypeEnable,
            label: (
              <div className="d-flex ai-c j-sb w-100">
                <span className={item.scheduleTypeEnable ? '' : 'disable-item'}>{item.scheduleTypeName}</span>
              </div>
            )
          }))
          const scheduleTypeWithParams = newValues.find((item) => item.value === +form.getFieldValue('scheduleType'))
          setScheduleCategory(scheduleTypeWithParams?.scheduleCategory || SCHEDULE_BOOKING_TYPE.SCHEDULE)
          setScheduleTypes(newValues)
        } else {
          firstScheduleTypeHandler()
        }
      })
      .catch((err) => {
        firstScheduleTypeHandler()
      })
  }

  const getDisplayTextByScheduleTimeStatus = (element) => {
    const fullSchedule = element?.totalSchedule > 0 && element?.totalBookingSchedule >= element?.totalSchedule
    const hasBooking = !!element?.totalBookingSchedule
    const hasSchedule = !!element?.totalSchedule

    // if (disableBookingHour) {
    if (element?.scheduleTimeStatus === 0) {
      if (fullSchedule) {
        return <div style={{ color: 'var(--error-btn-color)' }}>Đã đầy</div>
      }

      if (hasBooking) {
        return `${element.totalBookingSchedule}`
      }

      return <div style={{ color: 'var(--error-btn-color)' }}>Ngưng nhận lịch</div>
    }

    if (hasSchedule || hasBooking) {
      return `${element.totalBookingSchedule || 0}/${element.totalSchedule}`
    }
    // }

    const isEnableBooking = stationBookingConfig.some((item) => item?.enableBooking)

    return isEnableBooking ? (
      <div style={{ color: 'var(--error-btn-color)' }}>Ngưng nhận lịch</div>
    ) : (
      `${element.totalBookingSchedule || 0} Lịch đang chờ`
    )
  }

  function getBookingHours(params) {
    setLoadingHoursPicker(true)
    BookingService.getBookingHours(params)
      .then((data) => {
        if (data.statusCode == 505) {
        } else {
          let tmp = data || []
          if (tmp.length > 0) {
            tmp.forEach((element) => {
              element.disabled = element.scheduleTimeStatus === 0 || element?.totalBookingSchedule >= element?.totalSchedule
              // const enableBookingHandler = stationBookingConfig.some((item) => {
              //   return item?.enableBooking
              // })
              element.label = (
                <div className="ai-c j-sb w-100">
                  <div>{changeTime(element.scheduleTime)}</div>
                  <div className="text-primary">{getDisplayTextByScheduleTimeStatus(element)}</div>
                </div>
              )
              element.value = element.disabled
            })
            const firstAvailableTime = tmp.find((item) => item.scheduleTimeStatus === 1 && item.totalBookingSchedule < item.totalSchedule)
            form.setFieldValue('time', firstAvailableTime?.scheduleTime)
            if (!firstAvailableTime) {
              form.setFieldValue('time', undefined)
            } else {
              form.setFieldValue('time', firstAvailableTime)
            }
            setListBookingTime(tmp)
          }
        }
      })
      .catch(() => {
        setErrorMessage('Lấy thông tin giờ hẹn thất bại.')
        setIsModalErrOpen(true)
        setLoadingHoursPicker(false)
      })
      .finally(() => {
        setLoadingHoursPicker(false)
      })
  }

  const getBookingDate = () => {
    setIsWorkdayLoading(true)
    BookingService.getBookingDate(workdayFilter)
      .then((data) => {
        if (data.statusCode == 505) {
        } else {
          if (data.length > 0) {
            let tmp = data || []
            if (tmp.length > 0) {
              tmp.forEach((element) => {
                if (element.scheduleDateStatus == 0) {
                  element.disabled = false
                }
                element.value = element.scheduleDate
              })
              setListBookingDate(tmp)

              const firstAvailableSchedule = tmp.find((item) => item.scheduleDateStatus === 1 && item.totalBookingSchedule < item.totalSchedule)
              form.setFieldValue('dateSchedule', firstAvailableSchedule?.scheduleDate)
              if (!firstAvailableSchedule?.scheduleDate) {
                form.setFieldValue('time', undefined)
              }
              setWorkdaySelectedDate(firstAvailableSchedule?.scheduleDate)
            }
          } else {
            setListBookingDate([])
          }
        }
      })
      .catch(() => {
        // setErrorMessage('Lấy thông tin ngày hẹn thất bại.')
        // setIsModalErrOpen(true)
        setIsWorkdayLoading(false)
      })
      .finally(() => {
        setIsWorkdayLoading(false)
      })
  }

  function getStations(filter = null, callback = null) {
    BookingService.getStationList(filter)
      .then((res) => {
        const stationList = (res?.data || []).map((station) => {
          const name = `${station.stationCode} - ${station.stationsAddress || station.stationsName}`
          let label = <div className="text-station-select">{name}</div>
          let disabled = false

          // Ưu tiên
          if (station.enablePriorityMode) {
            label = (
              <div className="text-station-select" style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div className="ai-c" style={{ display: 'inline-flex', paddingRight: '4px' }}>
                  <span className="priority-mode">Được ưu tiên</span>
                </div>
                {name}
              </div>
            )
          }

          // Check stationBookingConfig
          const bookingConfig = JSON.parse(station?.stationBookingConfig || '[]')
          setStationBookingConfig(bookingConfig || '[]')
          const hasBookingEnabled = bookingConfig.some((item) => item?.enableBooking)

          if (!hasBookingEnabled) {
            label = (
              <div className="text-station-select" style={{ display: 'flex', flexWrap: 'wrap' }}>
                {name}
              </div>
            )
            disabled = false
          }

          // Trạng thái trạm
          if (station.stationStatus === 0) {
            disabled = true
            label = (
              <div className="text-station-select" style={{ color: 'var(--error-btn-color)', display: 'flex', flexWrap: 'wrap' }}>
                <div
                  className="ai-c disable-station"
                  style={{
                    display: 'inline-flex',
                    border: '1px solid var(--error-btn-color)',
                    borderRadius: '4px',
                    marginRight: '4px'
                  }}>
                  <span style={{ padding: '0 2px' }}>Ngưng hoạt động</span>
                </div>
                {name}
              </div>
            )
          }

          return {
            ...station,
            label,
            value: station.stationsId,
            disabled
          }
        })

        if (typeof callback === 'function') {
          callback(stationList)
        } else {
          setListStation(stationList)
          const activeStations = stationList.filter((station) => station.stationStatus === 1)
          const priorityStation = activeStations.find((station) => station.enablePriorityMode === 1)
          const selectedStation = priorityStation || activeStations[0]
          setStationSelected(selectedStation?.stationsId)
          setWorkdaySelectedDate(undefined)

          const hasStationIdByConfig = stationList?.find((item) => item?.stationsId === dataBookingParam?.stationsId)
          if (dataBookingParam?.stationsId && hasStationIdByConfig) {
            setStationSelected(dataBookingParam?.stationsId)
            form.setFieldValue('stationsId', dataBookingParam?.stationsId)
          } else {
            form.setFieldValue('stationsId', selectedStation?.stationsId)
            form.setFieldValue('dateSchedule', undefined)
            form.setFieldValue('time', undefined)
          }
        }
      })
      .catch((err) => {
        setErrorMessage('Lấy thông tin trung tâm thất bại.')
        setIsModalErrOpen(true)
      })
  }

  const stringToRealValue = (value) => {
    switch (value) {
      case 'true':
        return true
      case 'false':
        return false
      case 'null':
        return null
      case 'undefined':
        return undefined
      case 'NaN':
        return NaN
      default:
        if (!isNaN(value) && value.trim() !== '') {
          return Number(value)
        }
        return value
    }
  }

  function getStationAreas() {
    return BookingService.getStationAreaList()
      .then((data) => {
        if (data?.statusCode === 505) {
          return null
        }
        // Lưu vào localStorage
        localStorage.setItem('stationAreas', JSON.stringify(data?.data))
        return data?.data
      })
      .catch((error) => {
        setErrorMessage('Lấy thông tin khu vực thất bại.')
        setIsModalErrOpen(true)
        return null
      })
  }

  const handleCategory = (evt) => {
    const categoryOptionsMap = {
      [VEHICLE_SUB_CATEGORY.CAR]: VIHCLE_CATEGORY_OTO,
      [VEHICLE_SUB_CATEGORY.PASSENGER]: VIHCLE_CATEGORY_BUS,
      [VEHICLE_SUB_CATEGORY.TRUCKER]: VIHCLE_CATEGORY_TRUCK,
      [VEHICLE_SUB_CATEGORY.GROUP]: VIHCLE_CATEGORY_GROUP,
      [VEHICLE_SUB_CATEGORY.ROMOOCL]: VIHCLE_CATEGORY_MOOC,
      [VEHICLE_SUB_CATEGORY.CAR_SPECIALIZED]: VIHCLE_CATEGORY_PICKUP,
      [VEHICLE_SUB_CATEGORY.ORTHER]: VIHCLE_CATEGORY_SPECIALIZED
    }
    const options = categoryOptionsMap[evt]
    setVehicleSubCategoryOptions(options)
    form.setFieldValue('vehicleSubCategory', options[0]?.value)
  }

  const firstScheduleTypeHandler = () => {
    setScheduleTypes(() => {
      const data = Object.keys(SCHEDULE_TYPE_MINIAPP).map((key) => {
        return {
          key: key,
          value: SCHEDULE_TYPE_MINIAPP[key],
          label: SCHEDULE_TITLE[SCHEDULE_TYPE_MINIAPP[key]].title
        }
      })
      return data
    })
  }

  //function lấy ra ngày đầu tiên có lịch làm
  async function findFirstAvailableDateRange(baseDateFilter) {
    let current = moment() // ngày hiện tại
    const endLimit = moment().add(1, 'year').endOf('year') // 31/12 năm sau

    while (current.isSameOrBefore(endLimit, 'month')) {
      const startDate = current.startOf('month').format('DD/MM/YYYY')
      const endDate = current.endOf('month').format('DD/MM/YYYY')

      const requestParams = {
        ...baseDateFilter,
        startDate,
        endDate
      }

      try {
        const data = await BookingService.getBookingDate(requestParams)
        const validDates = data?.filter((d) => d.scheduleDateStatus === 1) || []
        if (validDates.length > 0) {
          setMinMonthAvailable(requestParams.startDate)
          return requestParams
        }
      } catch (err) {
        console.error(`Lỗi khi gọi API tháng ${current.format('MM/YYYY')}:`, err)
        // Bạn có thể break nếu lỗi không thể phục hồi
      }

      current = current.add(1, 'month')
    }

    return null // Không tìm thấy tháng nào có ngày làm việc
  }

  // ------------USE EFFECT------------------
  useEffect(() => {
    const init = async () => {
      await Promise.all([loadInitialData(), loadStationAreas()])
      await handleParams()
      await finalizeSetup()
    }

    init()
  }, [])

  const loadInitialData = async () => {
    const [meta, payment] = await Promise.all([getMetaData(), getPublicPaymentMethod()])
    return { meta, payment }
  }

  const loadStationAreas = async () => {
    const cached = localStorage.getItem('stationAreas')
    if (cached) {
      setListStationArea(JSON.parse(cached))
    } else {
      const areas = await getStationAreas()
      if (areas) setListStationArea(areas)
    }
  }

  const handleParams = () => {
    const paramsFromUrl = getQueryParams()

    handleCategory(paramsFromUrl?.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value)

    Object.entries(paramsFromUrl).forEach(([key, raw]) => {
      let value = raw
      if (key !== 'phone') value = stringToRealValue(raw)
      if (key === 'phone' && ['null', 'undefined', 'NaN'].includes(raw)) {
        value = null
      }
      paramsFromUrl[key] = value
      // fillFormValue(key, value)
    })    // Normalize station param aliases and prioritize URL param for default station.
    const stationIdFromParam = [
      paramsFromUrl?.stationsId,
      paramsFromUrl?.stationsid,
      paramsFromUrl?.stationId,
      paramsFromUrl?.stationid
    ].find((value) => value !== undefined && value !== null && value !== '')
    if (stationIdFromParam !== undefined) {
      paramsFromUrl.stationsId = stationIdFromParam
    }

    getStationConfigByApiKey(paramsFromUrl)
  }

  const finalizeSetup = () => {
    setLicensePlateColorList(PLATE_COLOR)
  }

  useEffect(() => {
    if (watchedVntId) {
      getStations({
        filter: {
          stationArea: watchedVntId
        }
      })
    }
  }, [watchedVntId])

  useEffect(() => {
    const fetchData = async () => {
      // Lấy giá trị của stationsId từ form watch
      const stationsId = resolvedStationsId

      if (stationsId) {
        try {
          // Gọi hàm async để tìm tháng đầu tiên có lịch khả dụng
          const result = await findFirstAvailableDateRange({ ...workdayFilter, stationsId })

          // Nếu có kết quả, cập nhật lại workdayFilter
          if (result) {
            setWorkdayFilter(result)
          }
        } catch (err) {
          console.error('Error fetching available date range:', err)
        }
      }
    }

    // Gọi hàm fetchData
    fetchData()
  }, [resolvedStationsId]) // Dependency array theo stationsId

  useEffect(() => {
    if ((workdayFilter.vehicleType && workdayFilter.stationsId) || (workdayFilter.stationsId && watchedVehicleSubType)) {
      getBookingDate()
    }
  }, [workdayFilter, watchedVehicleSubType])

  useEffect(() => {
    if (workdayFilter.vehicleType && workdayFilter.stationsId && workdaySelectedDate) {
      getBookingHours({
        stationsId: workdayFilter.stationsId,
        date: workdaySelectedDate,
        vehicleType: workdayFilter.vehicleType
      })
    }
  }, [workdaySelectedDate, stationSelected])

  // Fetch danh sách dịch vụ trạm khi chọn trạm khác
  useEffect(() => {
    const stationsId = resolvedStationsId
    if (stationsId) {
      BookingService.getListStationService({ filter: { stationsId: stationsId } })
        .then((response) => {
          if (response?.isSuccess && response?.data?.data) {
            const activeServices = response.data.data.filter((item) => Number(item.isActive) === 1)
            setStationServices(sortServicesByMetadataOrder(activeServices))
            setSelectedServiceIds([])
            form.setFieldValue('stationServicesList', [])
          }
        })
        .catch((error) => {
          console.error('Error fetching station services:', error)
        })
    } else {
      setStationServices([])
      setSelectedServiceIds([])
      form.setFieldValue('stationServicesList', [])
    }
  }, [resolvedStationsId, sortServicesByMetadataOrder])

  useEffect(() => {
    if (!selectedServiceIds.length) return
    const selectedServiceId = selectedServiceIds[0]
    const hasSelectedService = filteredStationServices.some((service) => service.stationServicesId === selectedServiceId)
    if (!hasSelectedService) {
      setSelectedServiceIds([])
      form.setFieldValue('stationServicesList', [])
    }
  }, [selectedServiceIds, filteredStationServices, form])

  useEffect(() => {
    if (dataBookingParam?.vehicleSubType || form.getFieldValue('vehicleSubType')) {
      handleCategory(dataBookingParam?.vehicleSubType || form.getFieldValue('vehicleSubType') || VEHICLE_SUB_TYPE[0]?.value) // Phân loại
      const vehicleType = VEHICLE_SUB_TYPE.find((item) => item.value === (dataBookingParam?.vehicleSubType || form.getFieldValue('vehicleSubType'))) // loại phương tiện
      setWorkdayFilter({
        ...workdayFilter,
        vehicleType: vehicleType?.vehicleType,
        stationsId: dataBookingParam?.stationsId
      })
    }
    if (dataBookingParam && Object.keys(dataBookingParam).length > 0) {
      // Chỉ set tên và số điện thoại nếu chưa có giá trị (ưu tiên GTEL/Zalo)
      const currentValues = form.getFieldsValue();
      form.setFieldsValue({
        name: currentValues.name || dataBookingParam.name || gtelpayUser?.fullName || zaloUserName,
        phone: currentValues.phone || dataBookingParam.phone || gtelpayUser?.phoneNumber || zaloUserPhone,
        vehicleSubType: dataBookingParam.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value,
        scheduleType: dataBookingParam.scheduleType || optionServiceType[0]?.value,
        licensePlateColor: dataBookingParam.licensePlateColor || licensePlateColorList[0]?.value,
        vntId: dataBookingParam.vntId || listStationArea[0]?.value,
        vehicleSubCategory: dataBookingParam.vehicleSubCategory || vehicleSubCategoryOptions[0]?.value,
        certificateSeries: dataBookingParam.certificateSeries || undefined,
        licensePlates: dataBookingParam.licensePlates || undefined,
        stationsId: dataBookingParam.stationsId || undefined
      })
    }
  }, [dataBookingParam])

  useEffect(() => {
    if (isZaloApp) {
      form.setFieldValue('phone', zaloUserPhone)
      form.setFieldValue('name', zaloUserName)
      form.setFieldValue('vehicleSubType', dataBookingParam?.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value)
      form.setFieldValue('scheduleType', dataBookingParam?.scheduleType || optionServiceType[0]?.value)
      form.setFieldValue('licensePlateColor', dataBookingParam?.licensePlateColor || licensePlateColorList[0]?.value)
      form.setFieldValue('vehicleSubCategory', dataBookingParam?.vehicleSubCategory || vehicleSubCategoryOptions[0]?.value)
    }
  }, [isZaloApp, zaloUserPhone, zaloUserName])

  // GTEL: Fill user data
  useEffect(() => {
    if (gtelpayUser?.phoneNumber && !isZaloApp) {
      if (gtelpayUser.fullName) form.setFieldValue('name', gtelpayUser.fullName)
      form.setFieldValue('phone', gtelpayUser.phoneNumber)
    }
  }, [gtelpayUser, isZaloApp])

  const isShowStationDateTime = useMemo(() => {
    const selectedOption = scheduleTypes.find((item) => item.value === selectedScheduleType)
    const showStationField = selectedOption?.requireScheduleStation === 1
    const showDateField = selectedOption?.requireScheduleDate === 1
    const showTimeField = selectedOption?.requireScheduleTime === 1

    return {
      showStationField,
      showDateField,
      showTimeField,
      showAreaField: showStationField || showDateField || showTimeField
    }
  }, [selectedScheduleType, scheduleTypes])

  useEffect(() => {
    const scheduleTypeWithParams = scheduleTypes.find((item) => item.value === +selectedScheduleType)
     setScheduleCategory(scheduleTypeWithParams?.scheduleCategory || SCHEDULE_BOOKING_TYPE.SCHEDULE)
  }, [scheduleTypes, selectedScheduleType])

  return (
    <div className="position-relative">
      {dataTheme?.partnerBackground && <img className="bg-partner" src={dataTheme?.partnerBackground} alt=""/>}
      <Form
        className={dataTheme?.partnerBackground ? 'styled-form' : ''}
        name="booking"
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{
          scheduleType: dataBookingParam?.scheduleType || optionServiceType[0]?.value,
          licensePlateColor: dataBookingParam?.licensePlateColor || licensePlateColorList[0]?.value,
          vehicleSubCategory: dataBookingParam?.vehicleSubCategory || vehicleSubCategoryOptions[0]?.value,
          vehicleSubType: dataBookingParam?.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value
        }}>
        {() => (
          <>
            <Form.Item
              name="name"
              label="Họ và tên chủ xe"
              rules={[
                {
                  required: dataBookingParam?.visible_firstName !== false && dataBookingParam?.require_firstName === true,
                  message: 'Vui lòng nhập tên'
                },
                {
                  message: 'Vui lòng nhập tên',
                  pattern: new RegExp(/^\S/)
                }
              ]}
              hidden={dataBookingParam?.visible_firstName === false}>
              <Input className="booking-input booking-input" placeholder="Nguyễn Văn An" type="text" size="large" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              hidden={dataBookingParam?.visible_phoneNumber === false}
              rules={[
                {
                  required: dataBookingParam?.visible_phoneNumber !== false && (!isZaloApp || dataBookingParam?.require_phoneNumber === true),
                  message: 'Vui lòng nhập số điện thoại'
                },
                {
                  message: 'Số điện thoại không hợp lệ',
                  pattern: new RegExp(/^(03|05|07|08|09|01)[0-9]{8}$/)
                },
                {
                  max: 11,
                  message: 'Số điện thoại quá dài'
                }
              ]}>
              <Input className="booking-input booking-input" placeholder="Nhập số điện thoại" type="text" size="large" disabled={(isZaloApp && zaloUserPhone?.trim()) || gtelpayUser?.phoneNumber?.trim()} />
            </Form.Item>

            <Form.Item
              name="scheduleType"
              label="Mục đích đặt hẹn"
              required
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn mục đích đặt lịch'
                }
              ]}
              hidden = {String(dataBookingParam?.visible_scheduleType) === 'false'}
              >
              <SelectAntd
                defaultValue={dataBookingParam?.scheduleType || optionServiceType[0]?.value}
                className="cs-select ant-custom booking-input"
                isSearchable={true}
                placeholder="Vui lòng chọn mục đích đặt lịch"
                styles={customStyles}
                options={paramsScheduleTypeParams ? (scheduleTypes || optionServiceType)?.filter((item) => +item?.value === +paramsScheduleTypeParams ) : (scheduleTypes || optionServiceType)}
                menuPlacement="top"
                onChange={(values, scheduleType) => {
                  setScheduleCategory(scheduleType?.scheduleCategory)
                  form.setFieldValue('scheduleType', values)
                }}
              />
            </Form.Item>
            {filteredStationServices.length > 0 && (
              <Form.Item
                name="stationServicesList"
                label={'Chọn dịch vụ'}>
                <SelectAntd
                  className="cs-select ant-custom booking-input"
                  placeholder={'Vui lòng chọn dịch vụ'}
                  value={selectedServiceIds[0] || undefined}
                  onChange={(value) => {
                    setSelectedServiceIds(value ? [value] : [])
                    form.setFieldValue('stationServicesList', value ? [value] : [])
                  }}
                  style={{ width: '100%' }}
                  options={filteredStationServices.map((service) => ({
                    value: service.stationServicesId,
                    label: (
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{service.serviceName}</span>
                        {service.servicePrice > 0 && (
                          <span className="service-price-value">
                            {service.servicePrice.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </div>
                    )
                  }))}
                  allowClear
                />
              </Form.Item>
            )}
            {dataBookingParam?.visible_vehicleIdentity !== false && (
              <Form.Item
                name="licensePlates"
                label="Biển số xe"
                required
                rules={[
                  {
                    required: dataBookingParam?.require_vehicleIdentity === true,
                    validator(_, value) {
                      return validatorPlateNumber(value?.toUpperCase())
                    }
                  }
                ]}
                hidden={dataBookingParam?.visible_vehicleIdentity === false}>
                <Input
                  className="booking-input booking-input"
                  placeholder="59B16856"
                  type="text"
                  size="large"
                  onInput={(e) => {
                    e.target.value = e.target.value.toUpperCase().replace(/\s/g, '')
                  }}
                />
              </Form.Item>
            )}

            <Form.Item
              name="licensePlateColor"
              label="Màu biển số"
              hidden={dataBookingParam?.visible_scheduleType === false}
              rules={[
                {
                  required: dataBookingParam?.visible_scheduleType !== false && dataBookingParam?.require_vehiclePlateColor === true,
                  message: 'Vui lòng chọn màu biển số'
                }
              ]}>
              <SelectAntd
                defaultValue={dataBookingParam?.licensePlateColor || licensePlateColorList[0]?.value}
                className="cs-select ant-custom booking-input"
                isSearchable={true}
                placeholder="Vui lòng chọn màu biển số"
                styles={customStyles}
                options={licensePlateColorList}
                menuPlacement="top"
                onChange={(values) => {
                  form.setFieldValue('licensePlateColor', values)
                }}
              />
            </Form.Item>
            <Row className="justify-content-between">
              <Col span={11}>
                <Form.Item
                  className="radio-label"
                  label="Loại phương tiện"
                  name="vehicleSubType"
                  hidden={dataBookingParam?.visible_vehicleSubCategory === false}
                  rules={[
                    {
                      required: dataBookingParam?.visible_vehicleSubCategory !== false && dataBookingParam?.require_vehicleSubType === true,
                      message: 'Vui lòng nhập'
                    }
                  ]}>
                  <SelectAntd
                    className="cs-select ant-custom booking-input"
                    options={VEHICLE_SUB_TYPE}
                    defaultValue={dataBookingParam?.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value}
                    onChange={(values, vehicleType) => {
                      setWorkdayFilter({
                        ...workdayFilter,
                        vehicleType: vehicleType?.vehicleType
                      })
                      handleCategory(values)
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item
                  className="radio-label"
                  label="Phân loại"
                  name="vehicleSubCategory"
                  hidden={dataBookingParam?.visible_vehicleSubCategory === false}
                  rules={[
                    {
                      required:
                        dataBookingParam?.visible_vehicleSubCategory !== false &&
                        (dataBookingParam?.require_vehicleSubCategory === 'true' ? true : false),
                      message: 'Vui lòng chọn phân loại'
                    }
                  ]}>
                  <SelectAntd
                    className="cs-select ant-custom booking-input"
                    options={vehicleSubCategoryOptions}
                    defaultValue={dataBookingParam?.vehicleSubCategory || vehicleSubCategoryOptions[0]?.value}
                    onChange={(values) => {
                      form.setFieldValue('vehicleSubCategory', values)
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="certificateSeries"
              extra={'Nhập số seri GCN để được tự động kiểm tra phạt nguội'}
              hidden={dataBookingParam?.visible_certificateSeries === false}
              label={
                <div>
                  Số seri GCN mới nhất
                  <span
                    className="text-important text-very-small text-primary"
                    onClick={() => {
                      setIsModalErrOpen(true)
                      setErrorMessage(
                        'Số seri là dãy số có dạng XXXXXXXX.<br>Số seri có thể được tìm thấy trên tem đăng kiểm hoặc dòng chữ cuối cùng ở trang 1 của sổ / giấy đăng kiểm'
                      )
                    }}>
                    (Tìm số seri)
                  </span>
                </div>
              }
              rules={[
                {
                  required:
                    dataBookingParam?.visible_certificateSeries !== false && (dataBookingParam?.require_certificateSeries === 'true' ? true : false),
                  message: 'Vui lòng nhập số seri GCN'
                },
                {
                  message: 'Số seri GCN không hợp lệ',
                  pattern: new RegExp(/^([a-zA-Z]{2})+(-(?!-))+([0-9]{7}\b)$/)
                }
              ]}>
              <Input
                className="booking-input"
                defaultValue={dataBookingParam?.certificateSeries}
                placeholder="Ví dụ: KA-7461980"
                type="text"
                style={{ textTransform: 'uppercase' }}
                size="large"
                onInput={(event) => {
                  event.target.value = event.target.value.toUpperCase().replace(/\s/g, '')
                }}
              />
            </Form.Item>
            {isShowStationDateTime.showAreaField && (
              <Form.Item
                required={dataBookingParam?.visible_StationArea !== false}
                label="Khu vực"
                name="vntId"
                hidden={dataBookingParam?.visible_StationArea === false}>
                <SelectAntd
                  className="cs-select ant-custom booking-input"
                  showSearch
                  onChange={(values) => {
                    handleFillStationDateTime()
                  }}
                  placeholder="Vui lòng chọn khu vực"
                  styles={customStyles}
                  options={listStationArea}
                />
              </Form.Item>
            )}

            {isShowStationDateTime.showStationField && (
              <Form.Item
                label="Chọn trạm"
                name="stationsId"
                rules={[
                  {
                    required: dataBookingParam?.visible_StationsCode !== false,
                    message: 'Vui lòng nhập'
                  }
                ]}
                hidden={dataBookingParam?.visible_StationsCode === false}>
                <SelectAntd
                  className="cs-select ant-custom booking-input"
                  isSearchable={true}
                  size="middle"
                  placeholder="Vui lòng chọn trạm đăng kiểm"
                  style={{
                    customStyles,
                    ...{
                      lineHeight: 48
                    }
                  }}
                  options={listStation}
                  menuPlacement="top"
                  onChange={(value, station) => {
                    form.setFieldValue('stationsId', value)
                    setStationSelected(station)
                    handleFillStationDateTime()
                  }}
                />
              </Form.Item>
            )}
            {isShowStationDateTime.showDateField && (
              <Form.Item
                name="dateSchedule"
                label="Ngày hẹn"
                extra="Đặt lịch hẹn qua App để được nhắc hẹn tự động"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập'
                  }
                ]}>
                <BookingDatePicker
                  selectedDate={workdaySelectedDate}
                  setSelectedDate={(date) => {
                    setWorkdaySelectedDate(date)
                    form.setFieldValue('dateSchedule', date)
                  }}
                  disabled={listBookingDate.length === 0}
                  listBookingDate={listBookingDate}
                  bookingConfig={stationBookingConfig}
                  currentMonth={workdayFilter.startDate}
                  loading={isWorkdayLoading}
                  setCurrentMonth={(selectedMonth) => {
                    setWorkdayFilter({
                      ...workdayFilter,
                      startDate: moment(selectedMonth).format(DATE_DISPLAY_FORMAT),
                      endDate: moment(selectedMonth).endOf('months').format(DATE_DISPLAY_FORMAT)
                    })
                  }}
                  minAvailableMonth={minMonthAvailable} // Truyền giá trị hoặc mặc định tháng hiện tại
                />
              </Form.Item>
            )}
            {isShowStationDateTime.showTimeField && (
              <Form.Item
                label="Giờ hẹn"
                name="time"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn giờ hẹn'
                  }
                ]}>
                <BookingHoursPicker
                  disabled={false}
                  listBookingTime={listBookingTime}
                  loading={loadingHoursPicker}
                  setSelectedTime={(values) => {
                    form.setFieldValue('time', values)
                  }}
                  selectedTime={form.getFieldValue('time')}
                  bookingConfig={stationBookingConfig}
                />
              </Form.Item>
            )}
            <div className="w-100 d-flex justify-content-center mgt-40">
              {
                <Button className="login__button df" type="primary" htmlType="submit" size="large">
                  Đặt lịch
                </Button>
              }
            </div>
          </>
        )}
      </Form>

      {/* Hiên thị modal đặt lịch thành công và quay về trang trước */}
      <BookingSuccess
        isModalOpen={isModalOpen}
        scheduleType={scheduleTypePopUp}
        setIsModalOpen={setIsModalOpen}
        paymentData={paymentData}
        onOpenExternalPayment={handleOpenExternalPayment}
        onClose={() => {
          setIsModalOpen(false)
          setPaymentData(null)
        }}></BookingSuccess>
      {isModalErrOpen && (
        <PopupMessage
          isModalOpen={isModalErrOpen}
          onClose={() => {
            setIsModalErrOpen(false)
          }}
          text={errorMessage}></PopupMessage>
      )}
      {/* Hiển thị loading */}
      {isLoading && (
        <div className="loading">
          <div className="text-center">
            <MainLogo height={60} width={60}></MainLogo>
            <Spin style={{ width: '100%' }} className="mt-3" />
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingPartnerForm
