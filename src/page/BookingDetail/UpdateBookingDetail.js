import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import moment from 'moment'
import { Form, Input, Button, Spin, Select as SelectAntd, Row, Col } from 'antd'

import BookingSuccess from '../BookingPartner/BookingSuccessModal'
import PopupMessage from '../BookingPartner/PopupMessage'
import { changeTime } from '../../helper/changeTime'
import { validatorPlateNumber } from './../../helper/validatorPlateNumber'
import { CONSULTANT_TYPE, optionServiceType, SCHEDULE_TITLE, SCHEDULE_TYPE_MINIAPP } from '../../constants/serviceOption'
import {
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
import BookingService from '../../services/addBookingService'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'

import BookingDatePicker from '../../components/BookingDatePicker'
import BookingHoursPicker from '../../components/BookingHoursPicker'
import CustomerScheduleService from '../../services/customerScheduleService'
import MainLogo from '../../components/MainLogo'

function UpdateBookingDetail({}) {
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
  const location = useLocation()
  const dataDetail = location?.state?.data
  const [form] = Form.useForm()
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

  const [workdayFilter, setWorkdayFilter] = useState({
    stationsId: null,
    startDate: moment().format(DATE_DISPLAY_FORMAT),
    endDate: moment().endOf('month').format(DATE_DISPLAY_FORMAT),
    vehicleType: VEHICLE_SUB_TYPE[0]?.vehicleType
  })

  // khai báo các biến cho toàn trang
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)

  // Kiểm tra các biển trong ENV
  const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1 // ==> dùng cho miniApp

  // state này để lấy thông tin trên params và hiển thị cho lần đầu tiên
  const [dataBookingParam, setDataBookingParam] = useState(dataDetail || {})

  // state của các modal hiển thị thông báo
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scheduleTypePopUp, setScheduleTypePopUp] = useState([])
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const onFinish = (values) => {
    const data = {
      id: dataBookingParam?.customerScheduleId,
      data: {
        stationsId: values?.stationsId,
        dateSchedule: values?.dateSchedule,
        time: values?.time?.scheduleTime,
        confirmStatus: 1,
        scheduleNote: 'Khách hàng đã xác nhận lịch hẹn!'
      }
    }

    CustomerScheduleService.userUpdateSchedule(data)
      .then((response) => {
        const { issSuccess } = response
        if (issSuccess) {
          setIsModalOpen(true)
        }
      })
      .catch((error) => {
        setErrorMessage('Cập nhật lịch hẹn thất bại.')
      })
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
              let stationStatus = stationSelected?.stationStatus
              if (stationStatus) {
                element.disabled = element.scheduleTimeStatus == 0
              }
              // const enableBookingHandler = stationBookingConfig.some((item) => {
              //   return item?.enableBooking
              // })
              element.label = (
                <div className="ai-c j-sb w-100">
                  <div>{changeTime(element.scheduleTime)}</div>
                  <div className="text-primary">{getDisplayTextByScheduleTimeStatus(element)}</div>
                </div>
              )
              element.value = element.value
            })
            setListBookingTime(tmp)
            if (dataBookingParam?.time) {
              const findTime = tmp.find((item) => item.scheduleTime === dataBookingParam?.time)
              if (findTime) {
                form.setFieldValue('time', findTime)
              }
            } else {
              form.setFieldValue('time', tmp[0]) 
            }
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
              // fill value đâu tiên vào form
              if (dataBookingParam?.dateSchedule) {
                const findDate = tmp.find((item) => item.scheduleDate === dataBookingParam?.dateSchedule)
                if (findDate) {
                  form.setFieldValue('dateSchedule', findDate.scheduleDate)
                  setWorkdaySelectedDate(findDate.scheduleDate)
                }
              }
              else {
                form.setFieldValue('dateSchedule', tmp[0]?.scheduleDate) //111111111
                setWorkdaySelectedDate(tmp[0]?.scheduleDate)
              }
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
    const appliedFilter = filter
    const newFilter = {
      ...appliedFilter,
      filter: {
        ...appliedFilter?.filter,
        scheduleType: dataBookingParam?.scheduleType
      }
    }

    BookingService.getStationList(newFilter)
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
          // setStationSelected(stationList[0])
          form.setFieldValue('stationsId', stationList[0]?.stationsId)
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
    BookingService.getStationAreaList()
      .then((data) => {
        if (data?.statusCode === 505) {
          return
        }
        setListStationArea(data?.data)
      })
      .catch((error) => {
        setErrorMessage('Lấy thông tin khu vực thất bại.')
        setIsModalErrOpen(true)
      })
      .finally(() => {})
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

  // FUNC: Băm url để lấy các params trên url và trả về dạng mảng có object là key và value
  function getQueryParams(options = {}) {
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search)
      const result = {}
      for (const [key, value] of params.entries()) {
        result[key] = value
      }
      return result
    }
  }

  // FUNC: fill value X vào field X của form
  const fillFormValue = (fieldName, value) => {
    form.setFieldsValue({ [fieldName]: value })
  }

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
    getMetaData()
    setTimeout(() => {
      getStationAreas()
    }, 1500)
    handleCategory(dataBookingParam?.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value)
    // xử lí state của scheduleTypes
    firstScheduleTypeHandler()
    setLicensePlateColorList(PLATE_COLOR)
    setScheduleCategory(() => {
      const scheduleType = dataBookingParam?.scheduleType
      const isConsultantSchedule = Object.values(CONSULTANT_TYPE).includes(scheduleType)
      return isConsultantSchedule ? SCHEDULE_BOOKING_TYPE.CONSULTANT : SCHEDULE_BOOKING_TYPE.SCHEDULE
    })
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

    // Gọi hàm fetchData
    fetchData()
  }, [form.getFieldValue('stationsId')])

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
        name: dataBookingParam.fullnameSchedule,
        phone: dataBookingParam.phone,
        vehicleSubType: dataBookingParam.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value,
        scheduleType: dataBookingParam.scheduleType || optionServiceType[0]?.value,
        licensePlateColor: dataBookingParam.licensePlateColor || licensePlateColorList[0]?.value,
        vehicleSubCategory: dataBookingParam.vehicleSubCategory || vehicleSubCategoryOptions[0]?.value,
        certificateSeries: dataBookingParam.certificateSeries || undefined,
        licensePlates: dataBookingParam.licensePlates || undefined,
        vntId: dataBookingParam.stationArea || undefined,
        stationsId: stationSelected?.stationsId || dataBookingParam.stationsId || undefined
      })
    }
  }, [workdaySelectedDate, stationSelected])

  useEffect(() => {
    if (isZaloApp) {
      form.setFieldValue('phone', dataBookingParam?.phone)
      form.setFieldValue('name', dataBookingParam?.fullnameSchedule)
      form.setFieldValue('vehicleSubType', dataBookingParam?.vehicleSubType || VEHICLE_SUB_TYPE[0]?.value)
      form.setFieldValue('scheduleType', dataBookingParam?.scheduleType || optionServiceType[0]?.value)
      form.setFieldValue('licensePlateColor', dataBookingParam?.licensePlateColor || licensePlateColorList[0]?.value)
      form.setFieldValue('vehicleSubCategory', dataBookingParam?.vehicleSubCategory || vehicleSubCategoryOptions[0]?.value)
    }
  }, [isZaloApp])

  return (
    <div className="detail-sche" style={{ maxWidth: 600, margin: 'auto', padding: '10px' }}>
      <Form
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
                  required: dataBookingParam?.require_firstName === true,
                  message: 'Vui lòng nhập tên'
                },
                {
                  message: 'Vui lòng nhập tên',
                  pattern: new RegExp(/^\S/)
                }
              ]}
              hidden={dataBookingParam?.visible_firstName === false}>
              <Input className="login__input booking-input" disabled placeholder="Nguyễn Văn An" type="text" size="large" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              hidden={dataBookingParam?.visible_phoneNumber === false}
              rules={[
                {
                  required: !isZaloApp || dataBookingParam?.require_phoneNumber === true,
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
              <Input className="login__input booking-input" placeholder="Nhập số điện thoại" type="text" size="large" disabled />
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
                disabled
              />
            </Form.Item>

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
                disabled
                className="login__input booking-input"
                placeholder="59B16856"
                type="text"
                size="large"
                onInput={(e) => {
                  e.target.value = e.target.value.toUpperCase().replace(/\s/g, '')
                }}
              />
            </Form.Item>

            <Form.Item
              name="licensePlateColor"
              label="Màu biển số"
              hidden={dataBookingParam?.visible_scheduleType === false}
              rules={[
                {
                  required: dataBookingParam?.require_vehiclePlateColor === true,
                  message: 'Vui lòng chọn màu biển số'
                }
              ]}>
              <SelectAntd
                disabled
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
                      required: dataBookingParam?.require_vehicleSubType === true,
                      message: 'Vui lòng nhập'
                    }
                  ]}>
                  <SelectAntd
                    disabled
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
                      required: dataBookingParam?.require_vehicleSubCategory === 'true' ? true : false,
                      message: 'Vui lòng chọn phân loại'
                    }
                  ]}>
                  <SelectAntd
                    disabled
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
                  required: dataBookingParam?.require_certificateSeries === 'true' ? true : false,
                  message: 'Vui lòng nhập số seri GCN'
                },
                {
                  message: 'Số seri GCN không hợp lệ',
                  pattern: new RegExp(/^([a-zA-Z]{2})+(-(?!-))+([0-9]{7}\b)$/)
                }
              ]}>
              <Input
                disabled
                className="login__input"
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
            <Form.Item required label="Khu vực" name="vntId" hidden={dataBookingParam?.visible_StationArea === false}>
              <SelectAntd
                className="cs-select ant-custom booking-input"
                showSearch
                onChange={(values) => {
                  setDataBookingParam({
                    ...dataBookingParam,
                    stationArea: values
                  })
                  handleFillStationDateTime()
                }}
                placeholder="Vui lòng chọn khu vực"
                styles={customStyles}
                options={listStationArea}
              />
            </Form.Item>
            {scheduleCategory !== SCHEDULE_BOOKING_TYPE.CONSULTANT && (
              <Form.Item
                label="Chọn trạm"
                name="stationsId"
                rules={[
                  {
                    required: true,
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
            {scheduleCategory !== SCHEDULE_BOOKING_TYPE.CONSULTANT && (
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
                  setSelectedDate={(value)=>{
                    setWorkdaySelectedDate(value)
                    setDataBookingParam({
                      ...dataBookingParam,
                      dateSchedule: value
                    })
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
            {scheduleCategory !== SCHEDULE_BOOKING_TYPE.CONSULTANT && (
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
              <Button className="login__button df" type="primary" htmlType="submit" size="large">
                Đặt lịch
              </Button>
            </div>
          </>
        )}
      </Form>

      {/* Hiên thị modal đặt lịch thành công và quay về trang trước */}
      <BookingSuccess
        isModalOpen={isModalOpen}
        scheduleType={scheduleTypePopUp}
        setIsModalOpen={setIsModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          history.goBack()
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

export default UpdateBookingDetail
