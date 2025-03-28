import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Select as SelectAntd, Row, Col, Spin } from 'antd'
import BookingService from '../../services/addBookingService'
import { WarningOutlined } from '@ant-design/icons'
import { xoa_dau } from '../../helper/common'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'
import { changeTime } from '../../helper/changeTime'
import queryString from 'query-string'
import _ from 'lodash'
import moment from 'moment'
import Select from 'react-select'
import {
  PLATE_COLOR,
  SCHEDULE_TYPE,
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
import { SCHEDULE_ERROR } from '../../constants/errorMessage'
import PopupMessage from '../BookingPartner/PopupMessage'
import BookingSuccess from '../BookingPartner/BookingSuccessModal'
import { useLocation, useHistory } from 'react-router-dom'
import AreaByIP from '../../services/getAreaByIP'
import addKeyLocalStorage from '../../helper/localStorage'
import { validatorPlateNumber } from './../../helper/validatorPlateNumber'
import { ReactComponent as LogoTTDK } from './../../assets/icons/Logo.svg'
import BookingDatePicker from '../../components/BookingDatePicker'
import BookingHoursPicker from '../../components/BookingHoursPicker'
import ModalPaymentQR from '../../components/ModalPaymentQR/ModalPaymentQR'
import { numberWithSeparator } from '../../helper/numberWithSeparator'
import CustomerScheduleService from '../../services/customerScheduleService'

function UpdateBookingDetail({ setTabKey}) {
  const [form] = Form.useForm()
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1
  const location = useLocation()
  const history = useHistory()
  const dataDetail = location?.state?.data
  const token = location?.state?.token
  const dataVihcle = location.state || {}
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  const [customerParam, setCustomerParam] = useState({ filter: {} })
  const [errorMessage, setErrorMessage] = useState('')
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [bookingData, setBookingData] = useState({})
  const [localBookingData, setLocalBookingData] = useState(dataDetail)
  const [listStation, setListStation] = useState([])
  const [listBookingTime, setListBookingTime] = useState([])
  const [listStationArea, setListStationArea] = useState([])
  const [listBookingDate, setListBookingDate] = useState([])
  const [licensePlateColor, setLicensePlateColor] = useState(PLATE_COLOR)
  const [scheduleTypes, setScheduleTypes] = useState([])
  const [scheduleTypePopUp, setScheduleTypePopUp] = useState([])
  const [disableBookingDate, setDisableBookingDate] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBookingStation, setSelectedBookingStation] = useState(false)
  const [selectedBookingDate, setSelectedBookingDate] = useState(false)
  const [selectedBookingHour, setSelectedBookingHour] = useState(false)
  const [isLoadDataLocal, setIsLoadDataLocal] = useState(false)
  const [disableBookingHour, setDisableBookingHour] = useState(false)
  const [requireScheduleDate, setRequireScheduleDate] = useState(1)
  const [requireScheduleStation, setRequireScheduleStation] = useState(1)
  const [requireScheduleTime, setRequireScheduleTime] = useState(1)
  const [bookingConfig, setBookingConfig] = useState({})
  const [vehicleSubCategoryOptions, setVehicleSubCategoryOptions] = useState([])
  const [dateFilter, setDateFilter] = useState({
    stationsId: null,
    startDate: moment().format(DATE_DISPLAY_FORMAT),
    endDate: moment().endOf('month').format(DATE_DISPLAY_FORMAT),
    vehicleType: null
  })
  const [isVisible, setIsVisible] = useState({
    stationsId: false,
    dateSchedule: false,
    time: false
  })
  const [loadingDatePicker, setLoadingDatePicker] = useState(false)
  const [loadingHoursPicker, setLoadingHoursPicker] = useState(false)
  const [open, setOpen] = useState(false)
  const [scheduleDetail, setScheduleDetail] = useState(null)
  let getParamData = {
    licensePlates: dataDetail?.licensePlates,
    phone: dataDetail?.phone,
    fullnameSchedule: dataDetail?.fullnameSchedule,
    email: dataDetail?.email,
    dateSchedule: dataDetail?.dateSchedule,
    time: { scheduleTime: dataDetail?.time },
    stationsId: dataDetail?.stationsId,
    vehicleType: Number(dataDetail?.vehicleType),
    licensePlateColor: Number(dataDetail?.licensePlateColor),
    scheduleType: Number(dataDetail?.scheduleType),
    vehicleSubType: Number(dataDetail?.vehicleSubType) || VEHICLE_SUB_TYPE[0].value,
    vehicleSubCategory: Number(dataDetail?.vehicleSubCategory) || VIHCLE_CATEGORY_OTO[0].value,
    vntId: dataDetail?.stationArea,
    certificateSeries: dataDetail?.certificateSeries,
    visible_StationArea: params.get('visible_StationArea'),
    visible_StationsCode: params.get('visible_StationsCode'),
    visible_firstName: params.get('visible_firstName'),
    visible_phoneNumber: params.get('visible_phoneNumber'),
    visible_vehicleIdentity: params.get('visible_vehicleIdentity'),
    visible_vehiclePlateColor: params.get('visible_vehiclePlateColor'),
    visible_vehicleSubCategory: params.get('visible_vehicleSubCategory'),
    visible_vehicleSubType: params.get('visible_vehicleSubType'),
    visible_certificateSeries: params.get('visible_certificateSeries'),
    require_firstName: params.get('require_firstName'),
    require_phoneNumber: params.get('require_phoneNumber'),
    require_vehicleIdentity: params.get('require_vehicleIdentity'),
    require_vehiclePlateColor: params.get('require_vehiclePlateColor'),
    require_vehicleSubCategory: params.get('require_vehicleSubCategory'),
    require_vehicleSubType: params.get('require_vehicleSubType'),
    require_certificateSeries: params.get('require_certificateSeries')
  }
  //lấy data từ local nếu ko có thì lấy từ param
  const [dataBookingParam, setDataBookingParam] = useState(getParamData)

  const customStyles = {
    control: (base) => ({
      ...base,
      height: 48,
      minHeight: 35,
      fontSize: 14
    })
  }
  function getBookingHours(params) {
    setIsVisible((prev) => ({ ...prev, time: true }))
    setLoadingHoursPicker(true)
    setSelectedBookingHour(false)
    BookingService.getBookingHours(params)
      .then((data) => {
        if (data.statusCode == 505) {
          // setErrorMessage('Sai thông tin kết nối. Vui lòng kiểm tra lại')
          // setIsModalErrOpen(true)
        } else {
          let tmp = data || []
          if (tmp.length > 0 && bookingConfig?.length > 0) {
            tmp.forEach((element) => {
              let stationStatus = bookingData?.stationsId?.stationStatus
              if (stationStatus) {
                element.disabled = element.scheduleTimeStatus == 0
              }
              const enableBookingHandler = bookingConfig.some((item) => {
                return item?.enableBooking
              })
              if (!disableBookingHour && !enableBookingHandler) {
                element.disabled = 0
              }
              element.label = (
                <div className="ai-c j-sb w-100">
                  <div>{changeTime(element.scheduleTime)}</div>
                  <div className="text-primary">{getDisplayTextByScheduleTimeStatus(element)}</div>
                </div>
              )
              element.value = element.value
            })
            setListBookingTime(tmp)
            //timeout setState để lấy giờ hẹn đầu tiên
            setTimeout(() => {
              setSelectedBookingHour(true)
            }, 500)
          }
        }
      })
      .catch(() => {
        setErrorMessage('Lấy thông tin giờ hẹn thất bại.')
        setIsModalErrOpen(true)
        setLoadingHoursPicker(false)
      })
      .finally(() => {
        setIsVisible((prev) => ({ ...prev, time: false }))
        setLoadingHoursPicker(false)
      })
  }
  const getDisplayTextByScheduleTimeStatus = (element) => {
    let fullSchedule = false
    if (element?.totalSchedule > 0) {
      if (element?.totalBookingSchedule >= element?.totalSchedule) {
        fullSchedule = true
      } else {
        fullSchedule = false
      }
    } else {
      fullSchedule = false
    }
    if (disableBookingHour) {
      if (element.scheduleTimeStatus == 0) {
        if (fullSchedule) {
          return <div style={{ color: 'var(--error-btn-color)' }}>Đã đầy</div>
        } else {
          if (element?.totalBookingSchedule) {
            return `${element?.totalBookingSchedule}`
          } else {
            return <div style={{ color: 'var(--error-btn-color)' }}>Ngưng nhận lịch</div>
          }
        }
      } else {
        if (element?.totalSchedule || element?.totalBookingSchedule) {
          return `${element?.totalBookingSchedule || 0}/${element?.totalSchedule}`
        } else {
          return ''
        }
      }
    } else {
      const enableBookingHandler = bookingConfig.some((item) => {
        return item?.enableBooking
      })
      if (enableBookingHandler) {
        return <div style={{ color: 'var(--error-btn-color) ' }}>Ngưng nhận lịch</div>
      } else {
        return `${element?.totalBookingSchedule || 0} Lịch đang chờ`
      }
    }
  }

  const getDisplayTextByScheduleDateStatus = (element) => {
    let fullSchedule = false
    if (element?.totalSchedule > 0) {
      if (element?.totalBookingSchedule >= element?.totalSchedule) {
        fullSchedule = true
      } else {
        fullSchedule = false
      }
    } else {
      fullSchedule = false
    }
    const enableBookingHandler = bookingConfig.some((item) => {
      return item?.enableBooking
    })
    if (element.scheduleDateStatus == 0) {
      if (fullSchedule) {
        return <div style={{ color: 'var(--error-btn-color)' }}>Đã đầy</div>
      } else {
        if (element?.totalBookingSchedule) {
          if (enableBookingHandler) {
            return `${element?.totalBookingSchedule}`
          } else {
            return `${element?.totalBookingSchedule} Lịch đang chờ`
          }
        } else {
          return enableBookingHandler ? '' : '0 Lịch đang chờ'
        }
      }
    } else {
      if (element?.totalSchedule || element?.totalBookingSchedule) {
        return `${element?.totalBookingSchedule || 0}/${element?.totalSchedule}`
      } else {
        return ''
      }
    }
  }

  function getStationAreas() {
    BookingService.getStationAreaList()
      .then((data) => {
        if (data.statusCode == 505) {
          // setErrorMessage('Sai thông tin kết nối. Vui lòng kiểm tra lại')
          // setIsModalErrOpen(true)
          let localData = {}
          localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
        } else {
          let tmp = data.data || []
          if (tmp.length > 0)
            tmp.forEach((element) => {
              element.label = <div style={{ fontWeight: 'normal' }}>{element.value}</div>
              element.value = element.value
            })
          setListStationArea(tmp)
        }
      })
      .catch(() => {
        setErrorMessage('Lấy thông tin khu vực thất bại.')
        setIsModalErrOpen(true)
      })
  }
  //func lấy trung tâm nếu lấy được khu vực theo IP
  const getStationBooking = () => {
    //kiểm tra đã có trung tâm từ local chưa
    setDateFilter({
      ...dateFilter,
      stationsId: null
    })
    // if (dataDetail?.stationsId) {
    //   const stationSelected = listStation.find((item) => item.stationsId == dataDetail?.stationsId)
    //   if(stationSelected){
    //     setBookingConfig(JSON.parse(stationSelected?.stationBookingConfig))
    //   }
    // }
    // setListBookingDate([])
    form.setFieldsValue({
      stationsId: null,
      dateSchedule: null,
      time: null
    })
    setBookingData((prev) => ({
      ...prev,
      stationsId: null,
      dateSchedule: null,
      time: null
    }))
    //thực hiện for để lấy giá trị thỏa mãn
    for (let i = 0; i < listStation?.length; i++) {
      if (listStation[i].stationStatus) {
        // LOGIC chỗ này sẽ là nếu là lần đầu load thì sẽ fill giá trị từ dataDetail, khi đã thay đổi thì mặc định lấy trạm đầu tiên
        if(isFirstLoad){
          handleFillValues('stationsId', dataDetail?.stationsId, dataDetail?.stationsId)
        }
        else{
          handleFillValues('stationsId', listStation[i], listStation[i].stationsId)
        }
        const stationSelected = listStation[i]
        setBookingConfig(JSON.parse(stationSelected?.stationBookingConfig))
        //setDateFilter để chạy api lấy ngày đầu tiên
        setDateFilter({
          ...dateFilter,
          stationsId: listStation[i].stationsId
        })
        return
      }
    }
  }
  //function lấy ngày hẹn đầu tiên nếu lấy được trung tâm theo IP
  const getDateBooking = () => {
    form.setFieldsValue({
      dateSchedule: null,
      time: null
    })
    setBookingData((prev) => ({
      ...prev,
      dateSchedule: null,
      time: null
    }))
    if (listBookingDate?.length > 0 && dataDetail?.stationsId) {
      for (let i = 0; i < listBookingDate?.length; i++) {
        if (listBookingDate[i].scheduleDateStatus) {
          // LOGIC chỗ này sẽ là nếu là lần đầu load thì sẽ fill giá trị từ dataDetail, khi đã thay đổi thì mặc định lấy ngày đầu tiên
          if(isFirstLoad){
            handleFillValues('dateSchedule', dataDetail?.dateSchedule, dataDetail?.dateSchedule)
          }
          else{
            handleFillValues('dateSchedule', listBookingDate[i].scheduleDate, listBookingDate[i].scheduleDate)
          }
          //lưu dữ liệu thỏa mãn vào local
          const stationsId = bookingData?.stationsId
          //gọi api lấy giờ hẹn
          if(Object.keys(stationsId).length > 0 && bookingData){
            getBookingHours({
              stationsId: stationsId?.stationsId,
              date: listBookingDate[i].scheduleDate,
              vehicleType: bookingData.vehicleType
            })
          }
          else if(stationsId && bookingData) {
            //chạy api lấy danh sách giờ hẹn
            getBookingHours({
              stationsId: stationsId,
              date: listBookingDate[i].scheduleDate,
              vehicleType: bookingData.vehicleType
            })
          }
          return
        }
      }
    }
  }
  const handleFillValues = (key, bookingData, fieldValue) => {
    setBookingData((prev) => ({
      ...prev,
      [key]: bookingData
    }))
    form.setFieldsValue({
      [key]: fieldValue
    })
  }
  //function lấy giờ hẹn đầu tiên nếu lấy được ngày hẹn theo IP
  const getHoursBooking = () => {
    form.setFieldsValue({
      time: null
    })
    if (listBookingTime?.length > 0) {
      for (let i = 0; i < listBookingTime?.length; i++) {
        if (!listBookingTime[i].disabled) {
          // LOGIC chỗ này sẽ là nếu là lần đầu load thì sẽ fill giá trị từ dataDetail, khi đã thay đổi thì mặc định lấy giờ đầu tiên
          if(isFirstLoad){
            handleFillValues('time', {scheduleTime:dataDetail?.time} , {scheduleTime:dataDetail?.time})
          }
          else{
            handleFillValues('time', listBookingTime[i].scheduleTime, listBookingTime[i])
          }
          return
        }
      }
    }
  }
  const handleSaveArea = (data) => {
    //thực hiện lấy danh sách trạm nếu lấy được khu vực
    getStations({
      filter: {
        stationArea: data.stationArea
      }
    })
  }
  const handleFillDataArea = (data) => {
    setBookingData((prev) => ({
      ...prev,
      vntId: data,
      stationsId: null,
      dateSchedule: null,
      time: null
    }))
    form.setFieldsValue({
      vntId: data,
      stationsId: null,
      dateSchedule: null,
      time: null
    })
  }
  //func lấy khu vực theo IP
  const getAreaByIP = async () => {
    await AreaByIP.getAreaByIP().then((result) => {
      const { statusCode, data } = result
      if (statusCode == 200) {
        //kiểm tra có lấy được khu vực ko
        if (data.stationArea) {
          handleFillDataArea(data.stationArea)
          handleSaveArea(data)
        } else {
          let vntId = dataDetail?.stationArea
          handleFillDataArea(vntId)
          if (vntId) {
            getStations({
              filter: {
                stationArea: vntId
              }
            })
          }
          setBookingData((prev) => ({
            ...prev,
            vntId: dataDetail?.stationArea
          }))
        }
      }
      return result
    })
  }
  const getMetaData = async () => {
    await BookingService.getMetaData({}).then((result) => {
      const { statusCode, data } = result
      if (statusCode == 200) {
        let newValues = []
        Object.values(data.SCHEDULE_TYPE).map((item) => {
          let value = {
            value: item.scheduleType,
            requireScheduleDate: item?.requireScheduleDate,
            requireScheduleStation: item?.requireScheduleStation,
            requireScheduleTime: item?.requireScheduleTime,
            scheduleCategory: item?.scheduleCategory,
            priceTTDK: item?.priceTTDK,
            disabled: item.scheduleTypeEnable ? false : true,
            label: (
              <div className="d-flex ai-c j-sb w-100">
                <span className={item.scheduleTypeEnable ? '' : 'disable-item'}>{item.scheduleTypeName}</span>
              </div>
            )
          }
          newValues.push(value)
          setScheduleTypes(newValues)
          handleCheckReq(bookingData?.scheduleType, SCHEDULE_TYPE)
        })
      } else {
        setScheduleTypes(SCHEDULE_TYPE)
      }
    })
  }
  useEffect(() => {
    //chạy function lấy giờ hẹn đầu tiên sau khi lấy được ngày hẹn
    getHoursBooking()
  }, [selectedBookingHour])
  useEffect(() => {
    //chạy function lấy ngày hẹn đầu tiên sau khi lấy được trung tâm
    getDateBooking()
  }, [selectedBookingDate])
  useEffect(() => {
    //chạy function lấy trạm đầu tiên sau khi lấy được khu vực theo IP
    getStationBooking()
  }, [selectedBookingStation])

  const onFinish = (values) => {
    // setIsLoading(true)
    const dataPayload = {
      id: dataDetail?.customerScheduleId,
      data: {
        stationsId: values?.stationsId,
        dateSchedule: values?.dateSchedule,
        time: values?.time?.scheduleTime,
        confirmStatus: 1,
        scheduleNote: 'Khách hàng đã xác nhận lịch hẹn!'
      }
    }
    CustomerScheduleService.userUpdateSchedule(dataPayload,token).then((response)=>{
      const {issSuccess} = response
      if(issSuccess) {
        // setIsLoading(false)
        setIsModalOpen(true)
      }
    })
  }

  useEffect(() => {
    if (dateFilter.vehicleType && dateFilter.stationsId) {
      //chạy api lấy ngày khi state dateFilter thay đổi
      getBookingDate()
    }
  }, [dateFilter])

  //func chạy api lấy ngày hẹn sau khi chọn trạm
  function getBookingDate() {
    setSelectedBookingDate(false)
    setLoadingDatePicker(true)
    setIsVisible((prev) => ({ ...prev, dateSchedule: true }))
    BookingService.getBookingDate(dateFilter)
      .then((data) => {
        if (data.statusCode == 505) {
          // setErrorMessage('Sai thông tin kết nối. Vui lòng kiểm tra lại')
          // setIsModalErrOpen(true)
        } else {
          if (data.length > 0) {
            let tmp = data || []
            if (tmp.length > 0) {
              tmp.forEach((element) => {
                if (element.scheduleDateStatus == 0) {
                  setDisableBookingDate(false)
                  setDisableBookingHour(false)
                  element.disabled = false
                } else {
                  setDisableBookingHour(true)
                  setDisableBookingDate(true)
                }
                element.label = (
                  <div className="d-flex ai-c j-sb w-100">
                    <span>{element.scheduleDate}</span>
                    <span className="text-primary">{getDisplayTextByScheduleDateStatus(element)}</span>
                  </div>
                )
                element.value = element.scheduleDate
              })
              setListBookingDate(tmp)
              //timeout setState để chạy func lấy ngày đầu tiên
              setTimeout(() => {
                setSelectedBookingDate(true)
              }, 1000)
            }
          } else {
            setListBookingDate([])
            setListBookingTime([])
            setBookingData({
              ...bookingData,
              dateSchedule: null,
              // stationsId: null,
              dateSchedule: null,
              time: null
            })
          }
        }
      })
      .catch(() => {
        // setErrorMessage('Lấy thông tin ngày hẹn thất bại.')
        // setIsModalErrOpen(true)
        setLoadingDatePicker(false)
      })
      .finally(() => {
        setIsVisible((prev) => ({ ...prev, dateSchedule: false }))
        setLoadingDatePicker(false)
      })
  }

  function getStations(filter = null, callback = null) {
    setSelectedBookingStation(false)
    filter = filter ? filter : customerParam
    const newFilter = {
      ...filter,
      filter: {
        ...filter?.filter,
        scheduleType: dataBookingParam?.scheduleType
      }
    }
    setIsVisible((prev) => ({ ...prev, stationsId: true }))
    BookingService.getStationList(newFilter)
      .then((data) => {
        setIsVisible((prev) => ({ ...prev, stationsId: false }))
        let tmp = data?.data || []
        if (tmp.length > 0)
          tmp.forEach((element) => {
            const name = `${element.stationCode} - ${element.stationsAddress || element.stationsName}`
            if (element?.enablePriorityMode) {
              element.label = (
                <div className="text-station-select" style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <div className="ai-c" style={{ display: 'inline-flex', paddingRight: '4px' }}>
                    <span className="priority-mode">Được ưu tiên</span>
                  </div>
                  {name}
                </div>
              )
            } else {
              element.label = <div className="text-station-select">{name}</div>
            }
            element.value = element.stationsId
            const textParse = JSON.parse(element?.stationBookingConfig)
            const enableBookingHandler = textParse.some((item) => {
              return item?.enableBooking
            })

            if (!enableBookingHandler) {
              element.disabled = false
              element.label = (
                <div className="text-station-select" style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {name}
                </div>
              )
            }
            if (element.stationStatus == 0) {
              element.disabled = true
              element.label = (
                <div className="text-station-select" style={{ color: 'var(--error-btn-color)', display: 'flex', flexWrap: 'wrap' }}>
                  <div
                    className="ai-c disable-station"
                    style={{ display: 'inline-flex', border: '1px solid var(--error-btn-color)', borderRadius: '4px', marginRight: '4px' }}>
                    <span style={{ padding: '0 2px' }}>Ngưng hoạt động</span>
                  </div>
                  {name}
                </div>
              )
              return
            } else {
              if (element.availableStatus == 0) {
                element.disabled = false
                element.label = (
                  <div className="text-station-select" style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {name}{' '}
                  </div>
                )
              }
            }
          })

        if (!callback)
          return (
            setListStation(tmp),
            //timeout setState để thực hiện lấy trạm đầu tiên
            setTimeout(() => {
              setSelectedBookingStation(true)
            }, 1000)
          )
        callback(tmp)
      })
      .catch(() => {
        setIsVisible((prev) => ({ ...prev, stationsId: false }))
        setErrorMessage('Lấy thông tin trung tâm thất bại.')
        setIsModalErrOpen(true)
      })
  }
  const handleCategory = (evt, vehicleSubCategory) => {
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
    if (options) {
      setBookingData((prev) => ({
        ...prev,
        vehicleSubCategory: vehicleSubCategory || options[0].value
      }))
      form.setFieldsValue({
        vehicleSubCategory: vehicleSubCategory || options[0].value
      })
    }
    setVehicleSubCategoryOptions(options)
  }

  const handleFillData = () => {
    const newData = dataBookingParam
    setBookingData(newData)
    form.setFieldsValue(newData)
  }

  useEffect(() => {
    getMetaData()
    if (dataBookingParam?.vntId) {
      getStations({
        filter: {
          stationArea: dataBookingParam?.vntId
        }
      })
    } else {
      getAreaByIP()
    }
    if (!bookingData?.vntId && !bookingData?.stationsId && !bookingData?.dateSchedule && !bookingData?.time) {
      setTimeout(() => {
        getStationAreas()
      }, 500)
    } else {
      setBookingData({ ...bookingData })
    }
    setDateFilter({
      ...dateFilter,
      vehicleType: Number(dataBookingParam?.vehicleType) || VEHICLE_SUB_TYPE[0].vehicleType,
      stationsId: dataBookingParam?.stationsId || localBookingData?.stationsId?.stationsId
    })
    if (dataBookingParam.stationsId && bookingData) {
      getBookingHours({
        stationsId: dataBookingParam?.stationsId,
        date: dataBookingParam?.dateSchedule,
        vehicleType: dataBookingParam?.vehicleType
      })
    }
    handleCategory(dataDetail?.vehicleSubType)
    if (Number(params.get('vehicleSubType')) !== 0) {
      handleCategory(Number(params.get('vehicleSubType')))
    }
  }, [])
  useEffect(() => {
    handleFillData()
    handleCheckReq(bookingData?.scheduleType, SCHEDULE_TYPE)
  }, [isLoadDataLocal])

  // fix antd select label
  useEffect(() => {
    const dataCompleteForm = queryString.parse(window.location.search)
    const labelSelectEl = document.querySelector('#station .ant-select-selector .ant-select-selection-item')

    if (!_.isEmpty(dataCompleteForm) && listStation && listStation.length > 0 && labelSelectEl?.title) {
      const stationData = listStation.find((_item) => _item.value == dataCompleteForm.stationsId)
      if (stationData) {
        const name = `${stationData.stationCode} - ${stationData.stationsName}`
        labelSelectEl.innerHTML = name
        labelSelectEl.removeAttribute('title')
      }
    }
  }, [listStation])
  useEffect(() => {
    if (dataBookingParam.stationsId && bookingData) {
      getBookingHours({
        stationsId: dataBookingParam?.stationsId,
        date: dataBookingParam?.dateSchedule,
        vehicleType: dataBookingParam?.vehicleType
      })
    }
  }, [dataBookingParam])

  const handleCheckReq = (values, arrayCheck) => {
    for (let i = 0; i < arrayCheck.length; i++) {
      if (arrayCheck[i].value == values) {
        setRequireScheduleStation(arrayCheck[i].requireScheduleStation)
        setRequireScheduleDate(arrayCheck[i].requireScheduleDate)
        setRequireScheduleTime(arrayCheck[i].requireScheduleTime)
      }
    }
  }

  const onClose = () => {
    setOpen(false)
  }

  return (
    <div className="detail-sche" style={{ maxWidth: 600, margin: 'auto', padding: '10px' }}>
      <Form
        name="booking"
        layout="vertical"
        initialValues={{}}
        form={form}
        onValuesChange={()=>{
          setIsFirstLoad(false)
        }}
        onFinish={(values) => {
          onFinish(values)
        }}>
        {() => (
          <div>
            <Form.Item name="fullnameSchedule" label="Họ và tên chủ xe">
              <Input
                disabled={true}
                defaultValue={dataBookingParam?.fullnameSchedule}
                className="login__input booking-input"
                type="text"
                size="large"
              />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại">
              <Input
                defaultValue={dataBookingParam?.phone}
                className="login__input booking-input"
                placeholder="Nhập số điện thoại"
                type="text"
                size="large"
                disabled={true}
              />
            </Form.Item>

            <Form.Item name="scheduleType" label="Mục đích đặt hẹn">
              <div className="login__input__icon">
                <SelectAntd
                  disabled={true}
                  className="cs-select ant-custom booking-input"
                  isSearchable={true}
                  placeholder="Vui lòng chọn mục đích đặt lịch"
                  styles={customStyles}
                  options={scheduleTypes}
                  defaultValue={Number(dataBookingParam?.scheduleType) || SCHEDULE_TYPE[0].value}
                  menuPlacement="top"
                  value={bookingData.scheduleType}
                  // disabled={!bookingData.stationsId}
                />
              </div>
            </Form.Item>

            <Form.Item name="licensePlates" label="Biển số xe">
              <div className="login__input__icon">
                <Input
                  defaultValue={dataBookingParam?.licensePlates?.toUpperCase()}
                  className="login__input booking-input"
                  style={{ textTransform: 'uppercase' }}
                  placeholder="59B16856"
                  type="text"
                  size="large"
                  disabled={true}
                />
              </div>
            </Form.Item>
            <Form.Item name="licensePlateColor" label="Màu biển số">
              <div className="login__input__icon">
                <SelectAntd
                  disabled={true}
                  className="cs-select ant-custom booking-input"
                  isSearchable={true}
                  placeholder="Vui lòng chọn màu biển số"
                  styles={customStyles}
                  options={licensePlateColor}
                  value={bookingData.licensePlateColor}
                  menuPlacement="top"
                  defaultValue={Number(dataBookingParam?.licensePlateColor) || PLATE_COLOR[0].value}
                  isOptionDisabled={(option) => option.disabled}
                />
              </div>
            </Form.Item>
            <Row className="vehicleType mt-3">
              <Col className="mWidth-100" span={dataBookingParam.visible_vehicleSubCategory === 'false' ? 24 : 11}>
                <Form.Item className="radio-label" label="Loại phương tiện" name="vehicleSubType">
                  <SelectAntd
                    disabled={true}
                    className="cs-select ant-custom booking-input"
                    options={VEHICLE_SUB_TYPE}
                    defaultValue={Number(dataBookingParam?.vehicleSubType) || VEHICLE_SUB_TYPE[0].value}
                    value={bookingData.vehicleSubType}
                  />
                </Form.Item>
              </Col>
              <Col span={2}></Col>
              <Col className="mWidth-100" span={dataBookingParam.visible_vehicleSubType === 'false' ? 24 : 11}>
                <Form.Item className="radio-label" label="Phân loại" name="vehicleSubCategory">
                  <SelectAntd
                    disabled={true}
                    className="cs-select ant-custom booking-input"
                    options={vehicleSubCategoryOptions}
                    defaultValue={Number(dataBookingParam?.vehicleSubCategory) || vehicleSubCategoryOptions[0].label}
                    value={bookingData.vehicleSubCategory}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="certificateSeries"
              extra={'Nhập số seri GCN để được tự động kiểm tra phạt nguội'}
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
              }>
              <Input
                className="login__input"
                defaultValue={dataBookingParam?.certificateSeries}
                placeholder="Ví dụ: KA-7461980"
                type="text"
                style={{ textTransform: 'uppercase' }}
                size="large"
                disabled={true}
              />
            </Form.Item>
            <Form.Item label="Khu vực" name="vntId" rules={[]}>
              <SelectAntd
                className="cs-select ant-custom booking-input"
                filterOption={(input, option) => {
                  return xoa_dau((option?.value ?? '').toLowerCase()).includes(xoa_dau(input.toLowerCase()))
                }}
                showSearch
                disabled={!bookingData.vehicleSubType}
                onChange={(values) => {
                  let data = JSON.parse(localStorage.getItem(addKeyLocalStorage('bookingData')))
                  let localData = {
                    ...data,
                    vntId: values,
                    stationsId: undefined,
                    dateSchedule: undefined,
                    time: undefined
                  }
                  localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
                  form.setFieldsValue({
                    vntId: values,
                    stationsId: null,
                    dateSchedule: null,
                    time: null
                  })
                  getStations({
                    ...customerParam,
                    filter: {
                      stationArea: values
                    }
                  })
                  setCustomerParam({
                    ...customerParam,
                    filter: {
                      stationArea: values
                    }
                  })
                  setBookingData({
                    ...bookingData,
                    vntId: values,
                    area: null,
                    stationsId: null,
                    dateSchedule: null,
                    time: null
                  })
                }}
                placeholder="Vui lòng chọn khu vực"
                styles={customStyles}
                options={listStationArea}
              />
            </Form.Item>
            <span id="station">
              <Form.Item
                label="Chọn trạm"
                name="stationsId"
                rules={[
                  {
                    required: requireScheduleStation == '1' ? true : false,
                    message: 'Vui lòng nhập'
                  }
                ]}>
                <SelectAntd
                  defaultValue={dataBookingParam?.stationsId}
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
                  onChange={(values) => {
                    form.setFieldsValue({
                      dateSchedule: null,
                      time: null,
                      stationsId: values
                    })
                    setDateFilter({
                      ...dateFilter,
                      stationsId: values
                    })
                    const stationSelected = listStation?.find((e) => e.stationsId == values)
                    setBookingConfig(JSON.parse(stationSelected?.stationBookingConfig))
                    setBookingData({
                      ...bookingData,
                      stationsId: stationSelected,
                      dateSchedule: null,
                      time: null
                    })
                  }}
                />
              </Form.Item>
            </span>
            <Form.Item
              name="dateSchedule"
              label="Ngày hẹn"
              extra="Đặt lịch hẹn qua App để được nhắc hẹn tự động"
              rules={[
                {
                  required: requireScheduleDate == '1' ? true : false,
                  message: 'Vui lòng nhập'
                }
              ]}>
              <BookingDatePicker
                disabled={!bookingData.stationsId}
                loading={loadingDatePicker}
                currentMonth={dateFilter.startDate}
                setCurrentMonth={(selectedMonth) => {
                  setDateFilter({
                    ...dateFilter,
                    startDate: moment(selectedMonth).format(DATE_DISPLAY_FORMAT),
                    endDate: moment(selectedMonth).endOf('months').format(DATE_DISPLAY_FORMAT)
                  })
                }}
                selectedDate={form.getFieldValue('dateSchedule')}
                setSelectedDate={(values) => {
                  setIsFirstLoad(false)
                  form.setFieldsValue({
                    dateSchedule: values,
                    time: null
                  })
                  const stationsId = bookingData?.stationsId?.stationsId
                  console.log("stationsId", stationsId)
                  if (stationsId && bookingData) {
                    getBookingHours({
                      stationsId: stationsId,
                      date: values,
                      vehicleType: bookingData.vehicleType
                    })
                    setBookingData({
                      ...bookingData,
                      dateSchedule: values,
                      time: null
                    })
                  }
                }}
                listBookingDate={listBookingDate}
                // bookingConfig={bookingConfig}
              />
            </Form.Item>
            <Form.Item
              label="Giờ hẹn"
              name="time"
              rules={[
                {
                  required: requireScheduleTime == '1' ? true : false,
                  message: 'Vui lòng nhập'
                }
              ]}>
              <BookingHoursPicker
                disabled={!bookingData.dateSchedule || isVisible.time}
                listBookingTime={listBookingTime}
                loading={loadingHoursPicker}
                setSelectedTime={(values) => {
                  setIsFirstLoad(false)
                  form.setFieldsValue({
                    ['time']: values
                  })
                  setBookingData({
                    ...bookingData,
                    time: values.scheduleTime
                  })
                }}
                selectedTime={form.getFieldValue('time')}
                bookingConfig={bookingConfig}
              />
            </Form.Item>
            <div className="w-100 d-flex justify-content-center mgt-40">
              <Button className="login__button df" type="primary" htmlType="submit" size="large">
                Đặt lịch
              </Button>
            </div>
            <BookingSuccess
              isModalOpen={isModalOpen}
              scheduleType={dataDetail?.scheduleType}
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
            {isLoading && (
              <div className="loading">
                <div>
                  <LogoTTDK></LogoTTDK>
                  <Spin style={{ width: '100%' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </Form>
    </div>
  )
}

export default UpdateBookingDetail
