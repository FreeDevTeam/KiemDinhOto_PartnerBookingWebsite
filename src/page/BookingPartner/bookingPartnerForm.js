import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import moment from 'moment'
import { SHA256 } from 'crypto-js'
import { Form, Input, Button, Spin, Select as SelectAntd, Row, Col, Checkbox, Modal } from 'antd'

import BookingSuccess from './BookingSuccessModal'
import PopupMessage from './PopupMessage'
import { changeTime } from '../../helper/changeTime'
import { validatorPlateNumber, normalizePlate } from './../../helper/validatorPlateNumber'
import { E_TICKET_SALE_OPTIONS, optionServiceType, SCHEDULE_TITLE, SCHEDULE_TYPE_MINIAPP } from '../../constants/serviceOption'
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
function BookingPartnerForm({ form, setTabKey, zaloUserName, zaloUserPhone, gtelpayUser }) {
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
  const [isStationAreaLoading, setIsStationAreaLoading] = useState(false)
  const [isStationLoading, setIsStationLoading] = useState(false)
  const [isWorkdayLoading, setIsWorkdayLoading] = useState(false)
  const [workdaySelectedDate, setWorkdaySelectedDate] = useState(moment().format(DATE_DISPLAY_FORMAT))
  const [loadingHoursPicker, setLoadingHoursPicker] = useState(false)
  const [listBookingTime, setListBookingTime] = useState([])
  const [minMonthAvailable, setMinMonthAvailable] = useState(moment().format(DATE_DISPLAY_FORMAT))
  const [showServiceType, setShowServiceType] = useState(false)
  const [ETicketOptions, setETicketOptions] = useState([])
  const [workdayFilter, setWorkdayFilter] = useState({
    stationsId: null,
    startDate: moment().format(DATE_DISPLAY_FORMAT),
    endDate: moment().endOf('month').format(DATE_DISPLAY_FORMAT),
    vehicleType: VEHICLE_SUB_TYPE[0]?.vehicleType
  })
  const paramsScheduleTypeParams = (getQueryParams() || {})?.scheduleType
  const dataTheme = JSON.parse(localStorage.getItem(addKeyLocalStorage('dataTheme'))) || {}

  // khai báo các biến cho toàn trang
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)

  // Kiểm tra các biển trong ENV
  const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1 // ==> dùng cho miniApp
  const MINIAPP_GTELPAY = window?._env_?.REACT_APP_MINIAPP_GTELPAY == '1'
  const MINIAPP_ZALOPAY = window?._env_?.REACT_APP_MINIAPP_ZALOPAY == '1' // dùng để tích hợp thanh toán qua ZALOPAY

  // state này để lấy thông tin trên params và hiển thị cho lần đầu tiên
  const [dataBookingParam, setDataBookingParam] = useState({})
console.log(dataBookingParam);
  const [isInitLoading, setIsInitLoading] = useState(true)

  // state của các modal hiển thị thông báo
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scheduleTypePopUp, setScheduleTypePopUp] = useState([])
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isRedirectConsentChecked, setIsRedirectConsentChecked] = useState(false)
  const [isConfirmTermModalOpen, setIsConfirmTermModalOpen] = useState(false)

  // states cho phương thức thanh toán
  const [zalopayPaymentMethod, setZalopayPaymentMethod] = useState(null)

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

  const isConfigEnabled = (value) => value === true || value === 1 || `${value}`.toLowerCase() === 'true' || `${value}` === '1'
  const getConfigText = (value) => (typeof value === 'string' ? value.trim() : '')
  const isNormalBookingFlow = !MINIAPP_GTELPAY && !MINIAPP_ZALOPAY
  const isConfirmBookingScheduleEnabled = isConfigEnabled(dataBookingParam?.confirmBookingScheduleEnabled)
  const confirmBookingScheduleUrl = getConfigText(dataBookingParam?.confirmBookingScheduleUrl)
  const confirmBookingScheduleTerm = getConfigText(dataBookingParam?.confirmBookingScheduleTerm)
  const shouldUseConfirmBookingSchedule = isNormalBookingFlow && isConfirmBookingScheduleEnabled && !!confirmBookingScheduleUrl
  const shouldShowConfirmBookingTerm = shouldUseConfirmBookingSchedule && !!confirmBookingScheduleTerm

  const getStationConfigByApiKey = (paramsFromUrl) => {
    setIsLoading(true)
    const apiKey = paramsFromUrl?.apiKey || paramsFromUrl?.apikey || localStorage.getItem('apiKey') || process.env.REACT_APP_APIKEY || undefined
    return SystemConfigurationsService.getStationConfigByApiKey({ apiKey: apiKey })
      .then((result) => {
        const stationMiniAppLink = JSON.parse(result?.[0]?.stationMiniAppLink || '{}')
        setDataBookingParam({ ...stationMiniAppLink, ...paramsFromUrl })
      })
      .catch((err) => {
        setErrorMessage('Lấy thông tin cấu hình thất bại.')
        setIsModalErrOpen(true)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const GtelBookingConsultantSchedule = (values) => {
    setIsLoading(true)
    BookingService.createOrderSchedule(values)
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
          setTimeout(() => {
            window.open(paymentUrl, '_blank')
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
          setTimeout(() => {
            window.open(paymentUrl, '_blank')
          }, 500)
        }
        form.resetFields(['name', 'licensePlates', 'certificateSeries', 'time'])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const createBookingSchedule = (values) => {
    setIsLoading(true)
    BookingService.createSchedule(values)
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
            paymentMethodType: PAYMENT_TYPE.GTEL_PAY
          }).then((result) => {
            const orderId = result?.data?.inAppGtelOrderId
            if (orderId) {
              Gtel.GtelPayJSBridge?.payOrder({ order_id: orderId })
            }
          })
        }
        setIsModalOpen(true)
        form.resetFields(['name', 'licensePlates', 'certificateSeries', 'time'])
      })
      .finally(() => {
        setIsLoading(false)
      })
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
    if (shouldUseConfirmBookingSchedule && !confirmBookingScheduleTerm) {
      setErrorMessage('Vui lòng cấu hình Điều khoản chia sẻ dữ liệu trước khi bật link điều hướng.')
      setIsModalErrOpen(true)
      return
    }

    if (shouldShowConfirmBookingTerm && !isRedirectConsentChecked) {
      setErrorMessage('Vui lòng đọc và đồng ý với Điều khoản chia sẻ dữ liệu trước khi đặt lịch.')
      setIsModalErrOpen(true)
      return
    }

    const data = {
      licensePlates: normalizePlate(values.licensePlates),
      phone: values.phone,
      fullnameSchedule: values.name || undefined,
      email: values.email,
      dateSchedule: workdaySelectedDate,
      time: values?.time?.scheduleTime,
      stationsId: values.stationsId,
      vehicleType: workdayFilter.vehicleType,
      licensePlateColor: values.licensePlateColor,
      scheduleType: values.scheduleType,
      vehicleSubType: values.vehicleSubType,
      vehicleSubCategory: values.vehicleSubCategory,
      certificateSeries: values.certificateSeries
    }
    if (values.serviceId) {
      data.stationServicesList = [values.serviceId]
    }
    // dùng cho ZALOPAY
    // if (scheduleCategory === SCHEDULE_BOOKING_TYPE.CONSULTANT && MINIAPP_ZALOPAY) {
    //   ZaloPayBookingConsultantSchedule(data)
    // }

    if (scheduleCategory === SCHEDULE_BOOKING_TYPE.CONSULTANT && MINIAPP_GTELPAY) {
      GtelBookingConsultantSchedule(data)
    } else if (scheduleCategory === SCHEDULE_BOOKING_TYPE.SCHEDULE && MINIAPP_GTELPAY) {
      GtelCreateBookingSchedule(data)
    } else if (scheduleCategory === SCHEDULE_BOOKING_TYPE.SCHEDULE && MINIAPP_ZALOPAY) {
      ZaloPayCreateBookingSchedule(data)
    } else if (scheduleCategory === SCHEDULE_BOOKING_TYPE.CONSULTANT) {
      bookingConsultantSchedule(data)
    } else if (scheduleCategory === SCHEDULE_BOOKING_TYPE.SCHEDULE) {
      createBookingSchedule(data)
    }

    // Gọi lại API để lấy ngày giờ trống mới nhất sau khi đặt lịch thành công
    const currentStationId = form.getFieldValue('stationsId') || workdayFilter?.stationsId
    const currentVehicleType = workdayFilter?.vehicleType || VEHICLE_SUB_TYPE[0]?.vehicleType
    if (currentStationId && currentVehicleType) {
      onChangeStation(currentStationId, currentVehicleType, stationSelected)
    }
  }

  const getMetaData = () => {
    return fetchMetadataWithCache()
      .then((result) => {
        const { statusCode, data } = result
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

    const isEnableBooking = hasEnabledBooking(stationBookingConfig)

    return isEnableBooking ? (
      <div style={{ color: 'var(--error-btn-color)' }}>Ngưng nhận lịch</div>
    ) : (
      `${element.totalBookingSchedule || 0} Lịch đang chờ`
    )
  }

  function parseStationBookingConfig(configStr) {
    if (!configStr) return null
    try {
      return JSON.parse(configStr)
    } catch (error) {
      return null
    }
  }

  function hasEnabledBooking(config = []) {
    return (config || []).some((item) => Number(item?.enableBooking) === 1)
  }

  function getStationBookingConfig(stationOrStationId) {
    const resolvedId = stationOrStationId || form.getFieldValue('stationsId')
    const stationConfig = stationOrStationId?.stationBookingConfig
      ? parseStationBookingConfig(stationOrStationId.stationBookingConfig)
      : parseStationBookingConfig(
        (listStation || []).find((item) => `${item?.stationsId}` === `${resolvedId}` || `${item?.value}` === `${resolvedId}`)?.stationBookingConfig
      )

    return stationConfig || stationBookingConfig || []
  }

  function getStationAcceptBooking(stationOrStationId) {
    return hasEnabledBooking(getStationBookingConfig(stationOrStationId)) ? 1 : 0
  }

  function getScheduleDateDisplayConfig(item, stationAcceptBooking, minSelectableDate = null) {
    const scheduleDate = moment(item?.scheduleDate, DATE_DISPLAY_FORMAT, true)
    if (minSelectableDate && scheduleDate.isValid() && scheduleDate.isBefore(minSelectableDate, 'day')) {
      return { disabled: true, isFull: false, text: '' }
    }

    const totalSchedule = item?.totalSchedule
    const totalBookingSchedule = item?.totalBookingSchedule
    const isMissingData = totalSchedule === null || totalSchedule === undefined || totalBookingSchedule === null || totalBookingSchedule === undefined
    const isFull = totalSchedule > 0 && totalBookingSchedule >= totalSchedule

    if (isMissingData) {
      return { disabled: true, isFull: false, text: '' }
    }

    if (item?.scheduleDateStatus == 0) {
      if (!stationAcceptBooking) {
        return { disabled: false, isFull: false, text: `Đang chờ ${totalBookingSchedule || 0}` }
      }
      if (isFull) {
        return { disabled: true, isFull: true, text: 'Đã đầy' }
      }
      return { disabled: true, isFull: false, text: '' }
    }

    if (item?.scheduleDateStatus == 1) {
      if (totalSchedule <= 0) {
        return { disabled: true, isFull: false, text: '' }
      }
      if (isFull) {
        return { disabled: true, isFull: true, text: 'Đã đầy' }
      }
      return { disabled: false, isFull: false, text: `${totalBookingSchedule}/${totalSchedule}` }
    }

    return { disabled: true, isFull: false, text: '' }
  }

  function isDisabledScheduleTime(item) {
    const totalSchedule = item?.totalSchedule
    const totalBookingSchedule = item?.totalBookingSchedule
    const isMissingData = totalSchedule === null || totalSchedule === undefined || totalBookingSchedule === null || totalBookingSchedule === undefined

    if (isMissingData) return true
    if (item?.scheduleTimeStatus !== 1) return true
    if (totalSchedule <= 0) return true
    return totalBookingSchedule >= totalSchedule
  }

  function getBookingSearchStartDate() {
    const configuredDate = moment(dataBookingParam?.dateSchedule, [DATE_DISPLAY_FORMAT, moment.ISO_8601], true)
    const today = moment()

    if (configuredDate.isValid() && configuredDate.isAfter(today, 'day')) {
      return configuredDate
    }

    return today
  }

  const onChangeDate = (date, stationsId, vehicleType) => {
    setWorkdaySelectedDate(date)
    form.setFieldValue('dateSchedule', date)

    // Reset Time
    form.setFieldValue('time', undefined)
    setListBookingTime([])

    if (date && stationsId && vehicleType) {
      getBookingHours({
        stationsId: stationsId,
        date: date,
        vehicleType: vehicleType
      })
    }
  }

  const onChangeStation = async (stationsId, overrideVehicleType = null, stationOption = null) => {
    // Reset Date & Time
    form.setFieldValue('dateSchedule', undefined)
    form.setFieldValue('time', undefined)
    setWorkdaySelectedDate(undefined)
    setListBookingDate([])
    setListBookingTime([])

    if (!stationsId) {
      setStationSelected(null)
      setStationBookingConfig([])
      setWorkdayFilter((prev) => ({ ...prev, stationsId: undefined }))
      setIsWorkdayLoading(false)
      return
    }

    const selectedStation =
      stationOption || (listStation || []).find((item) => `${item?.stationsId}` === `${stationsId}` || `${item?.value}` === `${stationsId}`) || null
    const selectedStationConfig = getStationBookingConfig(selectedStation || stationsId)
    const stationAcceptBooking = hasEnabledBooking(selectedStationConfig) ? 1 : 0

    setStationSelected(selectedStation)
    setStationBookingConfig(selectedStationConfig)

    getStationServices(stationsId).then((services) => {
      const allowedLabels = E_TICKET_SALE_OPTIONS.map((option) => option?.label?.toLowerCase())
      const filteredServices = services.filter((service) => allowedLabels.includes(service?.label?.toLowerCase()))
      setETicketOptions(filteredServices)
    })

    try {
      const vType = overrideVehicleType || workdayFilter.vehicleType || VEHICLE_SUB_TYPE[0].vehicleType
      const f = { ...workdayFilter, stationsId, vehicleType: vType }

      setIsWorkdayLoading(true)
      const result = await findFirstAvailableDateRange(f, stationAcceptBooking)
      if (!result) {
        setErrorMessage('Không tìm thấy ngày giờ hẹn còn trống.')
        setIsModalErrOpen(true)
        setIsWorkdayLoading(false)
        return
      }

      const actualFilter = result.filter
      setWorkdayFilter(actualFilter)
      getBookingDate(actualFilter, result.bookingDates, result.selectedDate, stationAcceptBooking)
    } catch (err) {
      console.error(err)
      form.setFieldValue('dateSchedule', undefined)
      form.setFieldValue('time', undefined)
      setWorkdaySelectedDate(undefined)
      setListBookingDate([])
      setListBookingTime([])
      setIsWorkdayLoading(false)
    }
  }

  function getBookingHours(params) {
    setLoadingHoursPicker(true)
    BookingService.getBookingHours(params)
      .then((data) => {
        if (data.statusCode == 505) {
          setListBookingTime([])
          setErrorMessage('Không tìm thấy giờ hẹn còn trống.')
          setIsModalErrOpen(true)
          return
        }

        let tmp = data || []
        if (tmp.length > 0) {
          tmp.forEach((element) => {
            element.disabled = isDisabledScheduleTime(element)
            element.label = (
              <div className="ai-c j-sb w-100">
                <div>{changeTime(element.scheduleTime)}</div>
                <div className="text-primary">{getDisplayTextByScheduleTimeStatus(element)}</div>
              </div>
            )
            element.value = element.disabled
          })

          const firstAvailableTime = tmp.find((item) => !item.disabled)
          if (firstAvailableTime) {
            form.setFieldValue('time', firstAvailableTime)
          } else {
            form.setFieldValue('time', undefined)
            setErrorMessage('Không tìm thấy giờ hẹn còn trống.')
            setIsModalErrOpen(true)
          }
          setListBookingTime(tmp)
        } else {
          setListBookingTime([])
          form.setFieldValue('time', undefined)
          setErrorMessage('Không tìm thấy giờ hẹn còn trống.')
          setIsModalErrOpen(true)
        }
      })
      .catch(() => {
        setErrorMessage('Lấy thông tin giờ hẹn thất bại.')
        setIsModalErrOpen(true)
        setListBookingTime([])
      })
      .finally(() => {
        setLoadingHoursPicker(false)
      })
  }

  const getBookingDate = (filterArgs, bookingDatesData = null, selectedDateOverride = null, stationAcceptBookingOverride = null) => {
    const fetchFilter = filterArgs || workdayFilter
    const stationAcceptBooking = stationAcceptBookingOverride === null ? getStationAcceptBooking(fetchFilter?.stationsId) : stationAcceptBookingOverride
    const handleBookingDateResponse = (data) => {
      if (data?.statusCode == 505) {
        setListBookingDate([])
        setErrorMessage('Không tìm thấy ngày hẹn còn trống.')
        setIsModalErrOpen(true)
        return undefined
      }

      if (data.length > 0) {
        let tmp = data || []
        tmp.forEach((element) => {
          const config = getScheduleDateDisplayConfig(element, stationAcceptBooking, getBookingSearchStartDate())
          element.disabled = config.disabled
          element.displayText = config.text
          element.isFull = config.isFull
          element.value = element.scheduleDate
        })
        setListBookingDate(tmp)

        const firstAvailableSchedule =
          tmp.find((item) => item.scheduleDate === selectedDateOverride && !item.disabled) ||
          tmp.find((item) => !item.disabled)
        if (!firstAvailableSchedule) {
          setErrorMessage('Không tìm thấy ngày hẹn còn trống.')
          setIsModalErrOpen(true)
        }
        return firstAvailableSchedule?.scheduleDate
      } else {
        setListBookingDate([])
        setErrorMessage('Không tìm thấy ngày hẹn còn trống.')
        setIsModalErrOpen(true)
        return undefined
      }
    }

    setIsWorkdayLoading(true)

    if (bookingDatesData !== null && bookingDatesData !== undefined) {
      const selectedDate = handleBookingDateResponse(bookingDatesData)
      setIsWorkdayLoading(false)
      onChangeDate(selectedDate, fetchFilter.stationsId, fetchFilter.vehicleType)
      return
    }

    BookingService.getBookingDate(fetchFilter)
      .then((data) => {
        const selectedDate = handleBookingDateResponse(data)
        setIsWorkdayLoading(false)
        onChangeDate(selectedDate, fetchFilter.stationsId, fetchFilter.vehicleType)
      })
      .catch(() => {
        setListBookingDate([])
        setIsWorkdayLoading(false)
      })
  }

  function getStations(filter = null, callback = null) {
    setIsStationLoading(true)
    BookingService.getStationList(filter)
      .then((res) => {
        const stationList = (res?.data || []).map((station) => {
          const name = `${station.stationCode} - ${station.stationsAddress || station.stationsName}`
          let label = <div className="text-station-select">{name}</div>
          let disabled = false

          // Ưu tiên
          if (station.enablePriorityMode >= 1) {
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
          const bookingConfig = parseStationBookingConfig(station?.stationBookingConfig) || []
          const hasBookingEnabled = hasEnabledBooking(bookingConfig)

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
            disabled,
            hasBookingEnabled
          }
        })

        if (typeof callback === 'function') {
          callback(stationList)
        } else {
          setListStation(stationList)
          const activeStations = stationList.filter((station) => station.stationStatus === 1)
          const priorityStation = activeStations.find((station) => station.enablePriorityMode >= 1 && station.hasBookingEnabled)
          const defaultStation = priorityStation || activeStations[0]

          const hasStationIdByConfig = stationList?.find((item) => `${item?.stationsId}` === `${dataBookingParam?.stationsId}`)
          let targetStationId = defaultStation?.stationsId

          if (dataBookingParam?.stationsId && hasStationIdByConfig) {
            targetStationId = dataBookingParam?.stationsId
          }

          const targetStation = stationList?.find((item) => `${item?.stationsId}` === `${targetStationId}`) || null

          setStationSelected(targetStation)
          form.setFieldValue('stationsId', targetStationId)

          if (targetStationId) {
            onChangeStation(targetStationId, null, targetStation)
          } else {
            onChangeStation(undefined)
          }
        }
      })
      .catch((err) => {
        setErrorMessage('Lấy thông tin trung tâm thất bại.')
        setIsModalErrOpen(true)
      })
      .finally(() => {
        setIsStationLoading(false)
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
    setIsStationAreaLoading(true)
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
      .finally(() => {
        setIsStationAreaLoading(false)
      })
  }

  async function getStationServices(stationsId) {
    try {
      const response = await BookingService.getListStationService({ filter: { stationsId: stationsId } })
      if (response?.isSuccess) {
        return response.data.data.map((item) => ({
          value: item.stationServicesId,
          label: item.serviceName
        }))
      }
      return []
    } catch (error) {
      console.error('Error fetching station services:', error)
    }
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

  // FUNC: fill value X vào field X của form
  const fillFormValue = (fieldName, value) => {
    form.setFieldsValue({ [fieldName]: value })
  }

  //function lấy ra ngày và giờ đầu tiên có thể đặt lịch
  async function findFirstAvailableDateRange(baseDateFilter, stationAcceptBookingOverride = null) {
    const searchStartDate = getBookingSearchStartDate()
    let current = searchStartDate.clone().startOf('month')
    const endLimit = searchStartDate.clone().add(3, 'month').endOf('month')
    const stationAcceptBooking = stationAcceptBookingOverride === null ? getStationAcceptBooking(baseDateFilter?.stationsId) : stationAcceptBookingOverride

    while (current.isSameOrBefore(endLimit, 'month')) {
      const startDate = current.isSame(searchStartDate, 'month')
        ? searchStartDate.clone().format(DATE_DISPLAY_FORMAT)
        : current.clone().startOf('month').format(DATE_DISPLAY_FORMAT)
      const endDate = current.clone().endOf('month').format(DATE_DISPLAY_FORMAT)

      const requestParams = {
        ...baseDateFilter,
        startDate,
        endDate
      }

      try {
        const data = await BookingService.getBookingDate(requestParams)
        const bookingDates = Array.isArray(data) ? data : []
        const availableDates = bookingDates.filter((item) => {
          const config = getScheduleDateDisplayConfig(item, stationAcceptBooking, searchStartDate)
          return !config.disabled
        })

        for (const bookingDate of availableDates) {
          const bookingTimes = await BookingService.getBookingHours({
            stationsId: baseDateFilter?.stationsId,
            date: bookingDate.scheduleDate,
            vehicleType: baseDateFilter?.vehicleType
          })
          const selectedTime = Array.isArray(bookingTimes) ? bookingTimes.find((item) => !isDisabledScheduleTime(item)) : null

          if (selectedTime) {
            setMinMonthAvailable(requestParams.startDate)
            return {
              filter: requestParams,
              bookingDates: data,
              selectedDate: bookingDate.scheduleDate
            }
          }
        }
      } catch (err) {
        console.error(`Lỗi khi gọi API tháng ${current.format('MM/YYYY')}:`, err)
      }

      current = current.clone().add(1, 'month')
    }

    return null
  }

  async function getStationByApiKey(apiKey) {
    return new Promise((resolve) => {
      SystemConfigurationsService.getStationByApiKey(apiKey)
        .then((result = {}) => {
          if (!result) {
            return resolve(null)
          }
          return resolve(result)
        })
        .catch(() => {
          return resolve(null)
        })
    })
  }

  // ------------USE EFFECT------------------
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      setIsInitLoading(true)
      try {
        await Promise.all([loadInitialData(), loadStationAreas()])
        await handleParams()
        await finalizeSetup()
      } finally {
        if (isMounted) {
          setIsInitLoading(false)
        }
      }
    }

    init()
    return () => {
      isMounted = false
    }
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

  const handleParams = async () => {
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
    })
    await getStationConfigByApiKey(paramsFromUrl)
  }

  const finalizeSetup = () => {
    setLicensePlateColorList(PLATE_COLOR)
  }

  useEffect(() => {
    if (form.getFieldValue('vntId')) {
      getStations({
        filter: {
          stationArea: form.getFieldValue('vntId')
        }
      })
    }
  }, [form.getFieldValue('vntId')])

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
        licensePlates: normalizePlate(dataBookingParam.licensePlates) || undefined,
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
    const selectedOption = scheduleTypes.find((item) => item.value === form.getFieldValue('scheduleType'))
    const showStationField = selectedOption?.requireScheduleStation === 1
    const showDateField = selectedOption?.requireScheduleDate === 1
    const showTimeField = selectedOption?.requireScheduleTime === 1

    return {
      showStationField,
      showDateField,
      showTimeField,
      showAreaField: showStationField || showDateField || showTimeField
    }
  }, [form.getFieldValue('scheduleType'), scheduleTypes])

  useEffect(() => {
    if (form.getFieldValue('scheduleType') === SCHEDULE_TYPE_MINIAPP.E_TICKET_SALE) {
      if (scheduleCategory === SCHEDULE_BOOKING_TYPE.CONSULTANT) {
        getStationByApiKey(dataBookingParam?.apiKey || dataBookingParam?.apikey || localStorage.getItem('apiKey') || process.env.REACT_APP_APIKEY).then((station) => {
          if (station) {
            getStationServices(station?.stationsId).then((services) => {
              const allowedLabels = E_TICKET_SALE_OPTIONS.map((option) => option?.label?.toLowerCase())
              const filteredServices = services.filter((service) => allowedLabels.includes(service?.label?.toLowerCase()))
              if (filteredServices.length > 0) {
                setShowServiceType(true)
                form.setFieldValue('serviceId', filteredServices[0]?.value)
                setETicketOptions(filteredServices)
              } else {
                form.setFieldValue('serviceId', undefined)
                setShowServiceType(false)
              }
            })
          }
        })
      }
    } else {
      setShowServiceType(false)
      form.setFieldValue('serviceId', undefined)
    }
  }, [form.getFieldValue('scheduleType')])

  useEffect(() => {
    const scheduleTypeWithParams = scheduleTypes.find((item) => item.value === +form.getFieldValue('scheduleType'))
    setScheduleCategory(scheduleTypeWithParams?.scheduleCategory || SCHEDULE_BOOKING_TYPE.SCHEDULE)
  }, [scheduleTypes, form.getFieldValue('scheduleType')])

  useEffect(() => {
    if (!shouldShowConfirmBookingTerm) {
      setIsRedirectConsentChecked(false)
    }
  }, [shouldShowConfirmBookingTerm])

  const isAreaFieldVisible = isShowStationDateTime.showAreaField && dataBookingParam?.visible_StationArea !== false
  const isStationFieldVisible = isShowStationDateTime.showStationField && dataBookingParam?.visible_StationsCode !== false
  const isDateFieldVisible = isShowStationDateTime.showDateField && dataBookingParam?.visible_dateSchedule !== false
  const isTimeFieldVisible = isShowStationDateTime.showTimeField && dataBookingParam?.visible_timeSchedule !== false

  const canInteractWithAreaField = isAreaFieldVisible && !isStationAreaLoading
  const canInteractWithStationField = isStationFieldVisible && !!form.getFieldValue('vntId') && !isStationLoading
  const canInteractWithDateField = isDateFieldVisible && !!form.getFieldValue('stationsId') && !isWorkdayLoading
  const shouldShowHiddenFieldLoading =
    (isStationAreaLoading && !isAreaFieldVisible) ||
    (isStationLoading && !isStationFieldVisible && !canInteractWithAreaField) ||
    (isWorkdayLoading && !isDateFieldVisible && !canInteractWithAreaField && !canInteractWithStationField) ||
    (loadingHoursPicker && !isTimeFieldVisible && !canInteractWithAreaField && !canInteractWithStationField && !canInteractWithDateField)

  const isSubmitDisabled = isInitLoading || isLoading || isStationAreaLoading || isStationLoading || isWorkdayLoading || loadingHoursPicker
  const isBookingSubmitDisabled = isSubmitDisabled || (shouldShowConfirmBookingTerm && !isRedirectConsentChecked)

  return (
    <div className="position-relative">
      {dataTheme?.partnerBackground && <img className="bg-partner" src={dataTheme?.partnerBackground} alt="" />}
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
                  // required: dataBookingParam?.visible_firstName !== false && dataBookingParam?.require_firstName === true,
                  required: dataBookingParam?.visible_firstName !== false && dataBookingParam?.require_firstName !== false,
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
                  // required: dataBookingParam?.visible_phoneNumber !== false && (!isZaloApp || dataBookingParam?.require_phoneNumber === true),
                  required: dataBookingParam?.visible_phoneNumber !== false,
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
              hidden={String(dataBookingParam?.visible_scheduleType) === 'false'}
            >
              <SelectAntd
                defaultValue={dataBookingParam?.scheduleType || optionServiceType[0]?.value}
                className="cs-select ant-custom booking-input"
                isSearchable={true}
                placeholder="Vui lòng chọn mục đích đặt lịch"
                styles={customStyles}
                options={paramsScheduleTypeParams ? (scheduleTypes || optionServiceType)?.filter((item) => +item?.value === +paramsScheduleTypeParams) : (scheduleTypes || optionServiceType)}
                menuPlacement="top"
                onChange={(values, scheduleType) => {
                  setScheduleCategory(scheduleType?.scheduleCategory)
                  form.setFieldValue('scheduleType', values)
                }}
              />
            </Form.Item>
            {showServiceType && (
              <Form.Item
                name="serviceId"
                label="Chọn dịch vụ"
                required
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn dịch vụ'
                  }
                ]}>
                <SelectAntd
                  className="cs-select ant-custom booking-input"
                  isSearchable={true}
                  placeholder="Vui lòng chọn dịch vụ"
                  styles={customStyles}
                  options={ETicketOptions}
                  menuPlacement="top"
                  onChange={(values, scheduleType) => {
                    form.setFieldValue('serviceId', values)
                  }}
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
                    // required: dataBookingParam?.require_vehicleIdentity === true,
                    required: dataBookingParam?.visible_vehicleIdentity !== false,
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
                    e.target.value = normalizePlate(e.target.value)
                  }}
                />
              </Form.Item>
            )}

            <Form.Item
              name="licensePlateColor"
              label="Màu biển số"
              // hidden={dataBookingParam?.visible_scheduleType === false}
              hidden={dataBookingParam?.visible_vehiclePlateColor === false}
              rules={[
                {
                  // required: dataBookingParam?.visible_scheduleType !== false && dataBookingParam?.require_vehiclePlateColor === true,
                  required: dataBookingParam?.visible_vehiclePlateColor !== false,
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
              {dataBookingParam?.visible_vehicleSubType !== false && (
                <Col span={dataBookingParam?.visible_vehicleSubCategory !== false ? 11 : 24}>
                <Form.Item
                  className="radio-label"
                  label="Loại phương tiện"
                  name="vehicleSubType"
                  // hidden={dataBookingParam?.visible_vehicleSubCategory === false}
                  hidden={dataBookingParam?.visible_vehicleSubType === false}
                  rules={[
                    {
                      // required: dataBookingParam?.visible_vehicleSubCategory !== false && dataBookingParam?.require_vehicleSubType === true,
                      required: dataBookingParam?.visible_vehicleSubType !== false,
                      message: 'Vui lòng nhập'
                    }
                  ]}>
                  <SelectAntd
                    className="cs-select ant-custom booking-input"
                    options={VEHICLE_SUB_TYPE}
                    defaultValue={dataBookingParam?.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value}
                    onChange={(values, vehicleType) => {
                      const newFilter = {
                        ...workdayFilter,
                        vehicleType: vehicleType?.vehicleType
                      }
                      setWorkdayFilter(newFilter)
                      handleCategory(values)
                      if (newFilter.stationsId) {
                        onChangeStation(newFilter.stationsId, vehicleType?.vehicleType, stationSelected)
                      }
                    }}
                  />
                </Form.Item>
                </Col>
              )}
              {dataBookingParam?.visible_vehicleSubCategory !== false && (
                <Col span={dataBookingParam?.visible_vehicleSubType !== false ? 11 : 24}>
                <Form.Item
                  className="radio-label"
                  label="Phân loại"
                  name="vehicleSubCategory"
                  hidden={dataBookingParam?.visible_vehicleSubCategory === false}
                  rules={[
                    {
                      // required:
                      //   dataBookingParam?.visible_vehicleSubCategory !== false &&
                      //   (dataBookingParam?.require_vehicleSubCategory === 'true' ? true : false),
                      required: dataBookingParam?.visible_vehicleSubCategory !== false,
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
              )}
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
                  // required:
                  //   dataBookingParam?.visible_certificateSeries !== false && (dataBookingParam?.require_certificateSeries === 'true' ? true : false),
                  required: dataBookingParam?.visible_certificateSeries !== false && dataBookingParam?.require_certificateSeries !== false,
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
                /* required={dataBookingParam?.visible_StationArea !== false} */
                label="Khu vực"
                name="vntId"
                hidden={dataBookingParam?.visible_StationArea === false}
                rules={[
                  {
                    required: dataBookingParam?.visible_StationArea !== false,
                    message: 'Vui lòng chọn khu vực'
                  }
                ]}>
                <SelectAntd
                  className="cs-select ant-custom booking-input"
                  showSearch
                  loading={isStationAreaLoading}
                  disabled={isStationAreaLoading}
                  onChange={() => {
                    setStationSelected(null)
                    setStationBookingConfig([])
                    setListStation([])
                    setETicketOptions([])
                    setWorkdaySelectedDate(undefined)
                    setListBookingDate([])
                    setListBookingTime([])
                    setWorkdayFilter((prev) => ({ ...prev, stationsId: undefined }))
                    form.setFieldsValue({
                      stationsId: undefined,
                      dateSchedule: undefined,
                      time: undefined,
                      serviceId: undefined
                    })
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
                    message: 'Vui lòng chọn trạm'
                  }
                ]}
                hidden={dataBookingParam?.visible_StationsCode === false}>
                <SelectAntd
                  className="cs-select ant-custom booking-input"
                  isSearchable={true}
                  size="middle"
                  loading={isStationLoading}
                  disabled={!form.getFieldValue('vntId') || isStationLoading}
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
                    onChangeStation(value, null, station)
                  }}
                />
              </Form.Item>
            )}
            {isShowStationDateTime.showDateField && (
              <Form.Item
                name="dateSchedule"
                label="Ngày hẹn"
                extra="Đặt lịch hẹn qua App để được nhắc hẹn tự động"
                hidden={dataBookingParam?.visible_dateSchedule === false}
                rules={[
                  {
                    // required: true,
                    required: dataBookingParam?.visible_dateSchedule !== false,
                    message: 'Vui lòng nhập'
                  }
                ]}>
                <BookingDatePicker
                  selectedDate={workdaySelectedDate}
                  setSelectedDate={(date) => {
                    const stId = form.getFieldValue('stationsId')
                    const vType = workdayFilter.vehicleType || VEHICLE_SUB_TYPE[0].vehicleType
                    onChangeDate(date, stId, vType)
                  }}
                  disabled={!form.getFieldValue('stationsId') || isWorkdayLoading}
                  listBookingDate={listBookingDate}
                  currentMonth={workdayFilter.startDate}
                  loading={isWorkdayLoading}
                  setCurrentMonth={(selectedMonth) => {
                    const nf = {
                      ...workdayFilter,
                      startDate: moment(selectedMonth).format(DATE_DISPLAY_FORMAT),
                      endDate: moment(selectedMonth).endOf('months').format(DATE_DISPLAY_FORMAT)
                    }
                    setWorkdayFilter(nf)
                    getBookingDate(nf)
                  }}
                  minAvailableMonth={minMonthAvailable}
                />
              </Form.Item>
            )}
            {isShowStationDateTime.showTimeField && (
              <Form.Item
                label="Giờ hẹn"
                name="time"
                hidden={dataBookingParam?.visible_timeSchedule === false}
                rules={[
                  {
                    // required: true,
                    required: dataBookingParam?.visible_timeSchedule !== false,
                    message: 'Vui lòng chọn giờ hẹn'
                  }
                ]}>
                <BookingHoursPicker
                  disabled={!workdaySelectedDate || loadingHoursPicker}
                  listBookingTime={listBookingTime}
                  loading={loadingHoursPicker}
                  setSelectedTime={(values) => {
                    form.setFieldValue('time', values)
                  }}
                  selectedTime={form.getFieldValue('time')}
                />
              </Form.Item>
            )}
            {shouldShowConfirmBookingTerm && (
              <div className="booking-confirm-consent">
                <Checkbox
                  checked={isRedirectConsentChecked}
                  onChange={(event) => {
                    setIsRedirectConsentChecked(event.target.checked)
                  }}>
                  <span>
                    Tôi đã đọc và đồng ý với{' '}
                  </span>
                  <span onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setIsConfirmTermModalOpen(true)
                  }} className="booking-confirm-term-link">
                   Điều khoản chia sẻ dữ liệu.
                  </span>
                </Checkbox>
              </div>
            )}
            <div className={`w-100 d-flex justify-content-center ${shouldShowConfirmBookingTerm ? '' : 'mgt-40'}`}>
              {
                <Button className="login__button df" type="primary" htmlType="submit" size="large" disabled={isBookingSubmitDisabled} style={{ opacity: isBookingSubmitDisabled ? 0.5 : 1 }}>
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
        setTabKey={setTabKey}
        setIsModalOpen={setIsModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          // history.goBack()
        }}
        redirectUrl={shouldUseConfirmBookingSchedule ? confirmBookingScheduleUrl : undefined}></BookingSuccess>
      <Modal
        centered 
        visible={isConfirmTermModalOpen}
        onCancel={() => setIsConfirmTermModalOpen(false)}
        footer={
          <Button className="login__button df" type="primary" onClick={() => setIsConfirmTermModalOpen(false)}>
            Đã hiểu
          </Button>
        }
        className="booking-confirm-term-modal">
        <div className='title-normal text-uppercase m-2 text-center'>Điều khoản chia sẻ dữ liệu</div>
        <div className="booking-confirm-term-content" dangerouslySetInnerHTML={{ __html: confirmBookingScheduleTerm }}></div>
      </Modal>
      {isModalErrOpen && (
        <PopupMessage
          isModalOpen={isModalErrOpen}
          onClose={() => {
            setIsModalErrOpen(false)
          }}
          text={errorMessage}></PopupMessage>
      )}
      {/* Hiển thị loading */}
      {(isInitLoading || isLoading || shouldShowHiddenFieldLoading) && (
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
