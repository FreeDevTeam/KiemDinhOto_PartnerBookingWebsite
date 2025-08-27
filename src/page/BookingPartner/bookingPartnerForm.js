import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import moment from 'moment'
import { SHA256 } from 'crypto-js'
import { Form, Input, Button, Spin, Select as SelectAntd, Row, Col } from 'antd'

import BookingSuccess from './BookingSuccessModal'
import PopupMessage from './PopupMessage'
import { changeTime } from '../../helper/changeTime'
import { validatorPlateNumber } from './../../helper/validatorPlateNumber'
import { E_TICKET_SALE_OPTIONS, optionServiceType, SCHEDULE_TITLE, SCHEDULE_TYPE_MINIAPP } from '../../constants/serviceOption'
import {
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
  VIHCLE_CATEGORY_TRUCK,
  VIHCLE_TYPES
} from '../../constants/global'
import BookingService from '../../services/addBookingService'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'

import BookingDatePicker from '../../components/BookingDatePicker'
import BookingHoursPicker from '../../components/BookingHoursPicker'
import { SCHEDULE_ERROR } from '../../constants/errorMessage'
import SystemConfigurationsService from '../../services/SystemConfigurationsService'
import MainLogo from '../../components/MainLogo'
import addKeyLocalStorage from '../../helper/localStorage'
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
function BookingPartnerForm({ form, setTabKey, zaloUserName, zaloUserPhone }) {
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
  const [showServiceType, setShowServiceType] = useState(false)
  const [ETicketOptions, setETicketOptions] = useState([])
  const [workdayFilter, setWorkdayFilter] = useState({
    stationsId: null,
    startDate: moment().format(DATE_DISPLAY_FORMAT),
    endDate: moment().endOf('month').format(DATE_DISPLAY_FORMAT),
    vehicleType: VEHICLE_SUB_TYPE[0]?.vehicleType
  })

  const dataTheme = JSON.parse(localStorage.getItem(addKeyLocalStorage('dataTheme'))) || {}

  // khai báo các biến cho toàn trang
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)

  // Kiểm tra các biển trong ENV
  const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1 // ==> dùng cho miniApp
  const MINIAPP_GTELPAY = window?._env_?.REACT_APP_MINIAPP_GTELPAY == '1' // dùng để tích hợp thanh toán qua GTELPAY

  // state này để lấy thông tin trên params và hiển thị cho lần đầu tiên
  const [dataBookingParam, setDataBookingParam] = useState({})

  // state của các modal hiển thị thông báo
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scheduleTypePopUp, setScheduleTypePopUp] = useState([])
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Các functions bổ trợ
  const CheckSum = () => {
    const apikey = dataBookingParam?.apikey || undefined
    const checksum = dataBookingParam?.checksum || undefined
    const name = dataBookingParam?.name || undefined
    const phone = dataBookingParam?.phone || undefined
    const raw = `apikey=${apikey}&name=${name}&phone=${phone}&key=${process.env.REACT_APP_CHECKSUM_SECRET_KEY}`
    const expectedChecksum = SHA256(raw).toString()
    return expectedChecksum == checksum
  }

  const getStationConfigByApiKey = (paramsFromUrl) => {
    setIsLoading(true)
    const apikey = paramsFromUrl?.apikey || localStorage.getItem('apiKey') || undefined
    SystemConfigurationsService.getStationConfigByApiKey({ apiKey: apikey })
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

  const onFinish = (values) => {
    const data = {
      licensePlates: values.licensePlates,
      phone: values.phone,
      fullnameSchedule: values.name,
      email: values.email,
      dateSchedule: workdaySelectedDate,
      time: values?.time?.scheduleTime,
      stationsId: values.stationsId,
      vehicleType: values.vehicleSubType,
      licensePlateColor: values.licensePlateColor,
      scheduleType: values.scheduleType,
      vehicleSubType: values.vehicleSubType,
      vehicleSubCategory: values.vehicleSubCategory,
      certificateSeries: values.certificateSeries
    }
    if (values.serviceId) {
      data.stationServicesList = [values.serviceId]
    }
    if (scheduleCategory === SCHEDULE_BOOKING_TYPE.CONSULTANT) {
      bookingConsultantSchedule(data)
    }
    if (scheduleCategory === SCHEDULE_BOOKING_TYPE.SCHEDULE) {
      createBookingSchedule(data)
    }
    getBookingDate()
  }

  const handleFillStationDateTime = () => {
    const stationsId = form.getFieldValue('stationsId')
    setWorkdayFilter({
      ...workdayFilter,
      stationsId: stationsId
    })
  }

  const getMetaData = () => {
    BookingService.getMetaData({})
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
          setScheduleTypes(newValues)

          const scheduleTypeWithParams = newValues.find((item) => item.value === +form.getFieldValue('scheduleType'))
          setScheduleCategory(scheduleTypeWithParams?.scheduleCategory || SCHEDULE_BOOKING_TYPE.SCHEDULE)
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
          if (dataBookingParam?.stationsId) {
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

  // function kiểm tra xem nên áp dụng trên URL hay từ DB
  const determineDataSource = () => {
    const paramsFromUrl = getQueryParams()
    const allowedKeys = [
      'apikey',
      'name',
      'phone',
      'vehicleSubType',
      'scheduleType',
      'licensePlateColor',
      'vntId',
      'vehicleSubCategory',
      'certificateSeries',
      'licensePlates'
    ]
    const paramsKeysNoUse = Object.fromEntries(Object.entries(paramsFromUrl).filter(([key]) => allowedKeys.includes(key)))
    const paramsFromUrlKeys = Object.keys(paramsKeysNoUse)
    const isUsingConfigMiniAppLinkInDb = paramsFromUrlKeys.length === 1 && paramsFromUrlKeys[0] === 'apikey' ? true : false // nếu chỉ có API Key thì lấy trong DB
    return isUsingConfigMiniAppLinkInDb
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
    const init = async () => {
      await getMetaData()

      // Check localStorage trước
      const cached = localStorage.getItem('stationAreas')
      if (cached) {
        setListStationArea(JSON.parse(cached))
      } else {
        const areas = await getStationAreas()
        if (areas) {
          setListStationArea(areas)
        }
      }

      const paramsFromUrl = getQueryParams()
      handleCategory(paramsFromUrl?.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value)
      let isValid = MINIAPP_GTELPAY ? CheckSum() : !!paramsFromUrl
      if (isValid === false) return

      Object.keys(paramsFromUrl).forEach((key) => {
        let value = paramsFromUrl[key]
        if (key !== 'phone') value = stringToRealValue(value)
        if (key === 'phone' && (value === 'null' || value === 'undefined' || value === 'NaN')) {
          value = null
        }
        paramsFromUrl[key] = value
        fillFormValue(key, value)
      })

      getStationConfigByApiKey(paramsFromUrl)
      firstScheduleTypeHandler()
      setLicensePlateColorList(PLATE_COLOR)
    }

    init()
  }, [])

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
    const fetchData = async () => {
      // Lấy giá trị của stationsId từ form
      const stationsId = form.getFieldValue('stationsId')

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

    if (form.getFieldValue('stationsId')) {
      getStationServices(form.getFieldValue('stationsId')).then((services) => {
        const allowedLabels = E_TICKET_SALE_OPTIONS.map((option) => option?.label?.toLowerCase())
        const filteredServices = services.filter((service) => allowedLabels.includes(service?.label?.toLowerCase()))
        setETicketOptions(filteredServices)
      })
    }

    // Gọi hàm fetchData
    fetchData()
  }, [form.getFieldValue('stationsId')]) // Dependency array theo stationsId

  useEffect(() => {
    if ((workdayFilter.vehicleType && workdayFilter.stationsId) || (workdayFilter.stationsId && form.getFieldValue('vehicleSubType'))) {
      getBookingDate()
    }
  }, [workdayFilter])

  useEffect(() => {
    if (workdayFilter.vehicleType && workdayFilter.stationsId && workdaySelectedDate) {
      getBookingHours({
        stationsId: workdayFilter.stationsId,
        date: workdaySelectedDate,
        vehicleType: workdayFilter.vehicleType
      })
    }
  }, [workdaySelectedDate, stationSelected])

  useEffect(() => {
    if (dataBookingParam?.vehicleSubType) {
      handleCategory(dataBookingParam?.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value) // Phân loại
      const vehicleType = VEHICLE_SUB_TYPE.find((item) => item.value === dataBookingParam?.vehicleSubType) // loại phương tiện
      setWorkdayFilter({
        ...workdayFilter,
        vehicleType: vehicleType?.vehicleType,
        stationsId: dataBookingParam?.stationsId
      })
    }
    if (dataBookingParam && Object.keys(dataBookingParam).length > 0) {
      form.setFieldsValue({
        name: dataBookingParam.name || zaloUserName,
        phone: dataBookingParam.phone || zaloUserPhone,
        vehicleSubType: dataBookingParam.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value,
        scheduleType: dataBookingParam.scheduleType || optionServiceType[0]?.value,
        licensePlateColor: dataBookingParam.licensePlateColor || licensePlateColorList[0]?.value,
        vntId: dataBookingParam.vntId || listStationArea[0]?.value,
        vehicleSubCategory: dataBookingParam.vehicleSubCategory || vehicleSubCategoryOptions[0]?.value,
        certificateSeries: dataBookingParam.certificateSeries || undefined,
        licensePlates: dataBookingParam.licensePlates || undefined
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
  }, [isZaloApp])

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
    console.log('form.getFieldValue ', form.getFieldValue('scheduleType'))
    if (form.getFieldValue('scheduleType') === SCHEDULE_TYPE_MINIAPP.E_TICKET_SALE) {
      if (scheduleCategory === SCHEDULE_BOOKING_TYPE.CONSULTANT) {
        getStationByApiKey(dataBookingParam?.apikey || localStorage.getItem('apiKey')).then((station) => {
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

  return (
    <div className="position-relative">
      {dataTheme?.partnerBackground && <img className="bg-partner" src={dataTheme?.partnerBackground} alt="logo" />}
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
              <Input className="booking-input booking-input" placeholder="Nhập số điện thoại" type="text" size="large" disabled={isZaloApp} />
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
              ]}>
              <SelectAntd
                defaultValue={dataBookingParam?.scheduleType || optionServiceType[0]?.value}
                className="cs-select ant-custom booking-input"
                isSearchable={true}
                placeholder="Vui lòng chọn mục đích đặt lịch"
                styles={customStyles}
                options={scheduleTypes}
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
                    setStationSelected(station)
                    handleFillStationDateTime()
                    form.setFieldValue('stationsId', value)
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
        setTabKey={setTabKey}
        setIsModalOpen={setIsModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          // history.goBack()
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
