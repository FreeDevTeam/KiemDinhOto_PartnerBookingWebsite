import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Select as SelectAntd, Row, Col, Spin, notification } from 'antd'
import BookingService from '../../services/addBookingService'
import { WarningOutlined } from '@ant-design/icons'
import { xoa_dau } from '../../helper/common'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'
import { changeTime } from '../../helper/changeTime'
import queryString from 'query-string'
import _ from 'lodash'
import moment from 'moment'
import Select from 'react-select'
import { PAYMENT_TYPE, PLATE_COLOR, SCHEDULE_TYPE, VEHICLE_SUB_CATEGORY, VEHICLE_SUB_TYPE, VIHCLE_CATEGORY_BUS, VIHCLE_CATEGORY_GROUP, VIHCLE_CATEGORY_MOOC, VIHCLE_CATEGORY_OTO, VIHCLE_CATEGORY_PICKUP, VIHCLE_CATEGORY_SPECIALIZED, VIHCLE_CATEGORY_TRUCK, VIHCLE_TYPES } from '../../constants/global'
import { SCHEDULE_ERROR } from '../../constants/errorMessage'
import PopupMessage from './PopupMessage'
import BookingSuccess from './BookingSuccessModal'
import { useLocation, useHistory } from 'react-router-dom'
import AreaByIP from '../../services/getAreaByIP'
import addKeyLocalStorage from '../../helper/localStorage'
import { validatorPlateNumber } from './../../helper/validatorPlateNumber'
import { ReactComponent as LogoTTDK } from './../../assets/icons/Logo.svg'
import BookingDatePicker from '../../components/BookingDatePicker'
import BookingHoursPicker from '../../components/BookingHoursPicker'
import ModalPaymentQR from '../../components/ModalPaymentQR/ModalPaymentQR'
import { numberWithSeparator } from '../../helper/numberWithSeparator'
import { optionServiceType } from '../../constants/serviceOption'

function BookingPartnerForm({form, setTabKey, zaloUserName,zaloUserPhone}) {
  const isZaloApp = (process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1)
  const location = useLocation();
  const history = useHistory();
  const dataVihcle=location.state || {}
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  const dataLocal=JSON.parse(localStorage.getItem(addKeyLocalStorage('bookingData')))
  const [customerParam, setCustomerParam] = useState({filter: {} })
  const [errorMessage, setErrorMessage] = useState('')
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [bookingData, setBookingData] = useState({})
  const [localBookingData, setLocalBookingData] = useState(dataLocal)
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
  // Nhả thêm
  const [serviceTypes, setServiceTypes] = useState([])
  const [servicesByStations, setServicesByStations] = useState([])
  const [allservicesByStations, setAllServicesByStations] = useState([])
  const [selectedtation, setSelectedtation] = useState({})
  const [orderId, setOrderId] = useState('')
  // Kết thúc
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
  const [scheduleDetail, setScheduleDetail] = useState(null);
  let getParamData ={
    licensePlates:dataVihcle?.vehicleIdentity || params.get('licensePlates'),
    phone:zaloUserPhone || params.get('phone'),
    fullnameSchedule:zaloUserName || params.get('name'),
    email:params.get('email'),
    dateSchedule:params.get('dateSchedule'),
    time: params.get('time'),
    stationsId: Number(params.get('stationsId')),
    vehicleType:VEHICLE_SUB_TYPE[0].vehicleType,
    licensePlateColor:Number(dataLocal?.licensePlateColor) || Number(params.get('licensePlateColor')) || PLATE_COLOR[0].value,
    scheduleType:Number(dataLocal?.scheduleType) ||Number(params.get('scheduleType')) || SCHEDULE_TYPE[0].value,
    vehicleSubType:Number(params.get('vehicleSubType')) || VEHICLE_SUB_TYPE[0].value,
    vehicleSubCategory: Number(params.get('vehicleSubCategory')) || VIHCLE_CATEGORY_OTO[0].value,
    vntId: params.get('vntId'),
    certificateSeries: dataVihcle?.certificateSeries || params.get('certificateSeries'),
    visible_StationArea : (params.get('visible_StationArea')),
    visible_StationsCode : (params.get('visible_StationsCode')),
    visible_firstName : (params.get('visible_firstName')),
    visible_phoneNumber : (params.get('visible_phoneNumber')),
    visible_vehicleIdentity : (params.get('visible_vehicleIdentity')),
    visible_vehiclePlateColor : (params.get('visible_vehiclePlateColor')),
    visible_vehicleSubCategory : (params.get('visible_vehicleSubCategory')),
    visible_vehicleSubType : (params.get('visible_vehicleSubType')),
    visible_certificateSeries : (params.get('visible_certificateSeries')),
    require_firstName : (params.get('require_firstName')),
    require_phoneNumber : (params.get('require_phoneNumber')),
    require_vehicleIdentity : (params.get('require_vehicleIdentity')),
    require_vehiclePlateColor : (params.get('require_vehiclePlateColor')),
    require_vehicleSubCategory : (params.get('require_vehicleSubCategory')),
    require_vehicleSubType : (params.get('require_vehicleSubType')),
    require_certificateSeries : (params.get('require_certificateSeries')),
  }
  //lấy data từ local nếu ko có thì lấy từ param
  const [dataBookingParam, setDataBookingParam] = useState(getParamData)
  const getDataLocal= ()=>{
    setIsLoadDataLocal(false)
    setDataBookingParam({
      ...bookingData,
      licensePlates:dataVihcle?.vehicleIdentity || localBookingData?.licensePlates || params.get('licensePlates'),
      phone: zaloUserPhone || localBookingData?.phone || params.get('phone'),
      fullnameSchedule: zaloUserName || localBookingData?.fullnameSchedule || params.get('name'),
      email: localBookingData?.email || params.get('email'),
      dateSchedule: localBookingData?.dateSchedule || params.get('dateSchedule'),
      time: localBookingData?.time?.scheduleTime || params.get('time'),
      stationsId: Number(params.get('stationsId')) || localBookingData?.stationsId?.stationsId ,
      vehicleType:Number(dataBookingParam?.vehicleType) || VEHICLE_SUB_TYPE[0].vehicleType,
      licensePlateColor: Number(dataBookingParam?.licensePlateColor) || Number(params.get('licensePlateColor')),
      scheduleType:Number(params.get('scheduleType')) || Number(dataBookingParam?.scheduleType),
      vehicleSubType:Number(params.get('vehicleSubType')) || localBookingData?.vehicleSubType || VEHICLE_SUB_TYPE[0].value,
      vehicleSubCategory: Number(params.get('vehicleSubCategory')) || localBookingData?.vehicleSubCategory || VIHCLE_CATEGORY_OTO[0].value,
      vntId: params.get('vntId') || localBookingData?.vntId,
      certificateSeries:dataVihcle?.certificateSeries ||  localBookingData?.certificateSeries || params.get('certificateSeries'),
      visible_StationArea : (params.get('visible_StationArea')),
      visible_StationsCode : (params.get('visible_StationsCode')),
      visible_firstName : (params.get('visible_firstName')),
      visible_phoneNumber : (params.get('visible_phoneNumber')),
      visible_vehicleIdentity : (params.get('visible_vehicleIdentity')),
      visible_vehiclePlateColor : (params.get('visible_vehiclePlateColor')),
      visible_vehicleSubCategory : (params.get('visible_vehicleSubCategory')),
      visible_vehicleSubType : (params.get('visible_vehicleSubType')),
      visible_certificateSeries : (params.get('visible_certificateSeries')),
      require_firstName : (params.get('require_firstName')),
      require_phoneNumber : (params.get('require_phoneNumber')),
      require_vehicleIdentity : (params.get('require_vehicleIdentity')),
      require_vehiclePlateColor : (params.get('require_vehiclePlateColor')),
      require_vehicleSubCategory : (params.get('require_vehicleSubCategory')),
      require_vehicleSubType : (params.get('require_vehicleSubType')),
      require_certificateSeries : (params.get('require_certificateSeries')),
    })
    setIsLoadDataLocal(true)
  }

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
        if(data.statusCode == 505){
          // setErrorMessage('Sai thông tin kết nối. Vui lòng kiểm tra lại')
          // setIsModalErrOpen(true)
        }else{
          let tmp = data || []
          if (tmp.length > 0) {
            tmp.forEach((element) => {
              let stationStatus=bookingData?.stationsId?.stationStatus || dataLocal?.stationsId?.stationStatus
              if(stationStatus){
                element.disabled = element.scheduleTimeStatus == 0
              };
              const enableBookingHandler = bookingConfig.some((item) => {
                return item?.enableBooking
              })
              if(!disableBookingHour && !enableBookingHandler){
                element.disabled = 0
              }
              element.label = (
                <div className="ai-c j-sb w-100">
                <div>{changeTime(element.scheduleTime)}</div>
                  <div className="text-primary">
                      {getDisplayTextByScheduleTimeStatus(element)}
                      </div>
                </div>
              )
              element.value = element.value
            })
            setListBookingTime(tmp)
            //timeout setState để lấy giờ hẹn đầu tiên
            setTimeout(() => {
              setSelectedBookingHour(true)
            }, 500);
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
  const getDisplayTextByScheduleTimeStatus=(element) => {
    let fullSchedule =false
    if(element?.totalSchedule > 0){
      if(element?.totalBookingSchedule >= element?.totalSchedule){
        fullSchedule=true
      }else{
        fullSchedule=false
      }
    }else{
      fullSchedule =false
    }
    if(disableBookingHour){
      if(element.scheduleTimeStatus == 0){
        if(fullSchedule){
          return(
            <div style={{color:'var(--error-btn-color)'}}>Đã đầy</div>
          )
        }else{
          if(element?.totalBookingSchedule){
          return(
            `${element?.totalBookingSchedule}`
          )
        }else{
          return(
            <div style={{color:'var(--error-btn-color)'}}>Ngưng nhận lịch</div>
          )
          }
        }
      }else{
        if(element?.totalSchedule || element?.totalBookingSchedule){
          return(
            `${element?.totalBookingSchedule || 0}/${element?.totalSchedule}`
          )
        }else{
          return ''
        }
      }
    }else{
      const enableBookingHandler = bookingConfig.some((item) => {
        return item?.enableBooking
      })
      if(enableBookingHandler){
        return(
          <div style={{color:'var(--error-btn-color) '}}>Ngưng nhận lịch</div>
        )
      }else{
        return(
          `${element?.totalBookingSchedule || 0} Lịch đang chờ`
        )
      }
    }

  }

  const getDisplayTextByScheduleDateStatus=(element) => {
    let fullSchedule =false
    if(element?.totalSchedule > 0){
      if(element?.totalBookingSchedule >= element?.totalSchedule){
        fullSchedule=true
      }else{
        fullSchedule=false
      }
    }else{
      fullSchedule =false
    }
    const enableBookingHandler = bookingConfig.some((item) => {
      return item?.enableBooking
    })
    if(element.scheduleDateStatus == 0){
      if(fullSchedule){
        return(
          <div style={{color:'var(--error-btn-color)'}}>Đã đầy</div>
        )
      }else{
        if(element?.totalBookingSchedule){
          if(enableBookingHandler){
            return(
              `${element?.totalBookingSchedule}`
            )
          }else{
            return(
              `${element?.totalBookingSchedule} Lịch đang chờ`
            )
          }
        }else{
          return(
            (enableBookingHandler ? '' : '0 Lịch đang chờ')
          )
        }
      }
    }else{
      if(element?.totalSchedule || element?.totalBookingSchedule){
        return(
          `${element?.totalBookingSchedule || 0}/${element?.totalSchedule}`
        )
      }else{
        return(
          ''
        )
      }
    }
  }

  function getStationAreas() {
    BookingService.getStationAreaList()
      .then((data) => {
        if(data.statusCode == 505){
          // setErrorMessage('Sai thông tin kết nối. Vui lòng kiểm tra lại')
          // setIsModalErrOpen(true)
          let localData={}
          localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
        }else{
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
  const getStationBooking=()=>{
    //kiểm tra đã có trung tâm từ local chưa
    setDateFilter({
      ...dateFilter,
      stationsId: null,
    })
    if(dataLocal?.stationsId){
      const stationSelected = dataLocal?.stationsId
      setBookingConfig(JSON.parse(stationSelected?.stationBookingConfig))
    }
    setListBookingDate([])
    form.setFieldsValue({
      stationsId:null,
      dateSchedule:  null,
      time: null
    })
    setBookingData((prev)=>({
      ...prev,
      stationsId:null,
      dateSchedule: null,
      time: null
    }))
    let localData={
      ...dataLocal,
      stationsId:null,
      dateSchedule:  null,
      time: null
    }
    localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))

    //thực hiện for để lấy giá trị thỏa mãn
    for(let i =0;i<listStation?.length;i++){
      if(listStation[i].stationStatus){
        if(params.get('stationsId') === null){
         handleFillValues('stationsId',listStation[i],listStation[i].stationsId)
        }
        if(params.get('stationsId') !== null){
         handleFillValues('stationsId',dataBookingParam?.stationsId,dataBookingParam?.stationsId)
        }
        const stationSelected = listStation[i]
        setBookingConfig(JSON.parse(stationSelected?.stationBookingConfig))
        //lưu dữ liệu thỏa mãn vào local
        saveDataLocal('stationsId',listStation[i])
        //setDateFilter để chạy api lấy ngày đầu tiên
        setDateFilter({
          ...dateFilter,
          stationsId: listStation[i].stationsId,
        })
        return
      }
    }
  }
  //function lấy ngày hẹn đầu tiên nếu lấy được trung tâm theo IP
  const getDateBooking=()=>{
    form.setFieldsValue({
      dateSchedule: null,
      time: null
    })
    setBookingData((prev)=>({
      ...prev,
      dateSchedule: null,
      time: null
    }))
    let localData={
      ...dataLocal,
      dateSchedule: null,
      time: null
    }
    localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
    if (listBookingDate?.length > 0 && dataLocal?.stationsId) {
      for (let i = 0; i < listBookingDate?.length; i++) {
        if (listBookingDate[i].scheduleDateStatus) {
          handleFillValues('dateSchedule', listBookingDate[i].scheduleDate, listBookingDate[i].scheduleDate)
          //lưu dữ liệu thỏa mãn vào local
          saveDataLocal('dateSchedule', listBookingDate[i].scheduleDate)
          const stationsId = bookingData?.stationsId?.stationsId
          //gọi api lấy giờ hẹn
          if (stationsId && bookingData) {
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
  const handleFillValues=(key,bookingData,fieldValue)=>{
    setBookingData((prev)=>({
      ...prev,
      [key]:bookingData,
    }))
    form.setFieldsValue({
      [key]:fieldValue,
    })
  }
  //function lấy giờ hẹn đầu tiên nếu lấy được ngày hẹn theo IP
  const getHoursBooking=()=>{
    form.setFieldsValue({
      time: null
    })
    let localData={
      ...dataLocal,
      time: null
    }
    localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
    if (listBookingTime?.length > 0) {
      for (let i = 0; i < listBookingTime?.length; i++) {
        if (!listBookingTime[i].disabled) {
          handleFillValues('time', listBookingTime[i].scheduleTime, listBookingTime[i])
          //lưu dữ liệu thỏa mãn vào local
          saveDataLocal('time',listBookingTime[i].scheduleTime)
          return
        }
      }
    }
    
  }
  const handleSaveArea=(data)=>{
    //thực hiện lấy danh sách trạm nếu lấy được khu vực
    getStations({
      filter: {
        stationArea:data.stationArea
      }
    })
    let localData={
      ...dataLocal,
      vntId:data.stationArea,
      stationsId:null,
      dateSchedule: null,
      time: null,
    }
    localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
  }
  const handleFillDataArea=(data)=>{
    setBookingData((prev)=>({
      ...prev,
      vntId:data,
      stationsId:null,
      dateSchedule: null,
      time: null,
    }))
    form.setFieldsValue({
      vntId:data,
      stationsId:null,
      dateSchedule: null,
      time: null,
    })
  }
  //func lấy khu vực theo IP
  const getAreaByIP = async() => {
    await AreaByIP.getAreaByIP().then((result) => {
      const { statusCode,data } = result
      if (statusCode == 200) {
        //kiểm tra có lấy được khu vực ko
        if(data.stationArea){
          handleFillDataArea(data.stationArea)
          handleSaveArea(data)
        }else{
          let vntId = params.get('vntId') || dataLocal?.vntId || undefined
          handleFillDataArea(vntId)
          if(vntId){
            getStations({
              filter: {
                stationArea:vntId
              }
            })
          }
          if(!dataLocal?.vntId){
            let localData={
              ...dataLocal,
              vntId:vntId,
              stationsId:null,
              dateSchedule: null,
              time: null,
            }
            localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
          }else{
            setBookingData((prev)=>({
              ...prev,
              vntId:vntId || dataLocal?.vntId,
            }))
            let localData={
              ...dataLocal,
              vntId:vntId || dataLocal?.vntId,
            }
            localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
          }
        }
      }
      return result
    })
  }
  const getMetaData = async() => {
    await BookingService.getMetaData({}).then((result) => {
      const { statusCode,data } = result
      if(statusCode==200){
      let newValues=[]
      Object.values(data.SCHEDULE_TYPE).map(item=>{
        let value = {
          value:item.scheduleType,
          requireScheduleDate:item?.requireScheduleDate,
          requireScheduleStation:item?.requireScheduleStation,
          requireScheduleTime:item?.requireScheduleTime,
          scheduleCategory:item?.scheduleCategory,
          priceTTDK:item?.priceTTDK,
          disabled:item.scheduleTypeEnable ? false :true,
          label:(
          <div className="d-flex ai-c j-sb w-100">
              <span className={item.scheduleTypeEnable ? '' : 'disable-item'}>
                {item.scheduleTypeName}
              </span>
          </div>),
        }
        newValues.push(value)
        setScheduleTypes(newValues)
        handleCheckReq(bookingData?.scheduleType || dataLocal?.scheduleType || Number(params.get('scheduleType')) || SCHEDULE_TYPE[0].value,newValues)
      })
      }else{
        setScheduleTypes(SCHEDULE_TYPE)
      }
    })
  }

  const handleChangeServicesByType = (listService,type) =>{
    const servicesByType = listService.filter(item => item.serviceType === type)
    setServicesByStations(servicesByType)
    const serviceId = servicesByType[0].value
    handleFillValues('serviceId', serviceId, serviceId)
  }

  const handleGetStationsServices = (stationsId) => {
    BookingService.getListStationService({"filter":{"stationsId": stationsId}}).then((result)=>{
      const {data, isSuccess} = result
      if(isSuccess && data?.data){
        // Hiển thị phần loại dịch vụ
        const serviceTypesList = data?.data.map((item)=>{
          const foundOptionType = optionServiceType.find(option => option.value === item.serviceType)
          return foundOptionType
        })
        const selectedServiceType = dataLocal?.serviceType || dataBookingParam?.serviceType || serviceTypesList[0]
        handleFillValues('serviceType', selectedServiceType, selectedServiceType)
        setServiceTypes(serviceTypesList)

        // Lấy ra danh sách dịch vụ theo trạm
        const allServices = data?.data.map((item)=>({
          label:item.serviceName,
          value:item.stationServicesId,
          serviceType:item.serviceType,
          price:item?.servicePrice
        }))
        setAllServicesByStations(allServices)

        // Lọc dịch vụ theo loại
        const servicesByType = data?.data.filter(item => item.serviceType === selectedServiceType.value)
        setServicesByStations(()=>{
          const servicesAfterFilter = servicesByType.map((item)=>({
            label:item.serviceName,
            value:item.stationServicesId,
            serviceType:item.serviceType,
            price:item?.servicePrice
          }))
          const serviceId = dataLocal?.serviceId || dataBookingParam?.serviceId || servicesAfterFilter[0]?.value
          const serviceDefault = servicesAfterFilter.find(item => item.value === serviceId)
          handleFillValues('serviceId', serviceDefault, serviceId)
          return servicesAfterFilter
        })
        // // Ban đầu đã lấy ra được danh sách rồi ==> lọc ra theo serviceType ==> Theo local trước nếu ko có thì mặc định là [0]
        // const serviceType = dataLocal?.serviceType
        // // Nếu đã có serviceType thì lọc ra theo serviceType
        //   // Nếu chưa có serviceType thì lọc ra theo serviceType mặc định là [0]
        //  const servicesByType = servicesBeforeFilterByType.filter(item => item.serviceType === optionServiceType[0].value)
        //  return setServicesByStations(servicesByType)
      }
    })
  }

  useEffect(()=>{
    //chạy function lấy giờ hẹn đầu tiên sau khi lấy được ngày hẹn
    getHoursBooking()
  },[selectedBookingHour])
  useEffect(()=>{
    //chạy function lấy ngày hẹn đầu tiên sau khi lấy được trung tâm
    getDateBooking()
  },[selectedBookingDate])
  useEffect(()=>{
    //chạy function lấy trạm đầu tiên sau khi lấy được khu vực theo IP
    getStationBooking()
  },[selectedBookingStation])
    //Chạy function lấy serviceType theo trung tâm
  useEffect(()=>{
    if(selectedBookingStation){
      const station_id = form.getFieldValue('stationsId')
      handleGetStationsServices(station_id)
      // BookingService.getListStationService({"filter":{"stationsId": station_id}}).then((result)=>{
      //   const {data, isSuccess} = result
      //   if(isSuccess && data?.data){
      //     // Hiển thị phần loại dịch vụ
      //     const serviceTypesList = data?.data.map((item)=>{
      //       const foundOptionType = optionServiceType.find(option => option.value === item.serviceType)
      //       return foundOptionType
      //     })
      //     const selectedServiceType = dataLocal?.serviceType || dataBookingParam?.serviceType || serviceTypesList[0]
      //     handleFillValues('serviceType', selectedServiceType, selectedServiceType)
      //     setServiceTypes(serviceTypesList)
  
      //     // Lấy ra danh sách dịch vụ theo trạm
      //     const allServices = data?.data.map((item)=>({
      //       label:item.serviceName,
      //       value:item.stationServicesId,
      //       serviceType:item.serviceType,
      //       price:item?.servicePrice
      //     }))
      //     setAllServicesByStations(allServices)
  
      //     // Lọc dịch vụ theo loại
      //     const servicesByType = data?.data.filter(item => item.serviceType === selectedServiceType.value)
      //     setServicesByStations(()=>{
      //       const servicesAfterFilter = servicesByType.map((item)=>({
      //         label:item.serviceName,
      //         value:item.stationServicesId,
      //         serviceType:item.serviceType,
      //         price:item?.servicePrice
      //       }))
      //       const serviceId = dataLocal?.serviceId || dataBookingParam?.serviceId || servicesAfterFilter[0]?.value
      //       const serviceDefault = servicesAfterFilter.find(item => item.value === serviceId)
      //       handleFillValues('serviceId', serviceDefault, serviceId)
      //       return servicesAfterFilter
      //     })
      //     // // Ban đầu đã lấy ra được danh sách rồi ==> lọc ra theo serviceType ==> Theo local trước nếu ko có thì mặc định là [0]
      //     // const serviceType = dataLocal?.serviceType
      //     // // Nếu đã có serviceType thì lọc ra theo serviceType
      //     //   // Nếu chưa có serviceType thì lọc ra theo serviceType mặc định là [0]
      //     //  const servicesByType = servicesBeforeFilterByType.filter(item => item.serviceType === optionServiceType[0].value)
      //     //  return setServicesByStations(servicesByType)
      //   }
      // })
    }
  },[selectedBookingStation])

  const getScheduleDetail=(value)=>{
    BookingService.getScheduleDetail({
      customerScheduleId:value,
    }).then((res) => {
      if(res?.data){
        res.data.runTime = new Date();
        res.data.order.totalAmount = scheduleTypes.find(item=>item?.value == res?.data?.scheduleType)?.priceTTDK || 0
        setScheduleDetail(res?.data);
        if(res?.data?.order?.totalAmount){
          setIsModalOpen(false)
          setOpen(true)
          return
        }else{
          setIsModalOpen(true)
        }
      } 
    })
  }

  const onFinish = (values) => {
    setIsVisible(false)
    setIsLoading(true)
    let adviseSchedule=Object.values(scheduleTypes).find(item=>item?.value== bookingData?.scheduleType)?.scheduleCategory == '2'
    const newData = {
      licensePlates: values.licensePlates.toUpperCase(),
      phone: values.phone,
      fullnameSchedule: values.fullnameSchedule.trim(),
      email: values.email,
      dateSchedule: adviseSchedule ? undefined : values.dateSchedule,
      time: adviseSchedule? undefined : values?.time?.scheduleTime,
      stationsId:adviseSchedule ? undefined : values.stationsId,
      vehicleType: bookingData.vehicleType,
      licensePlateColor: values.licensePlateColor,
      notificationMethod: 'SMS',
      scheduleType: values.scheduleType,
      vehicleSubCategory: values.vehicleSubCategory,
      vehicleSubType: values.vehicleSubType,
      certificateSeries: values.certificateSeries,
      referUserId:localStorage.getItem('partnerReferUserId') || undefined,
      referStationId:localStorage.getItem('partnerReferStationId') || undefined,
    }
    Object.keys(newData).forEach((key) => {
      if (newData[key] === "") {
        delete newData[key];
      }})
    if(adviseSchedule){
      BookingService.createConsultantSchedule(newData).then((result) => {
        const { error: rsMess, statusCode, data } = result
        if (statusCode != 200) {
          setIsModalErrOpen(true)
          if (Object.keys(SCHEDULE_ERROR).includes(rsMess)) {
            setErrorMessage(SCHEDULE_ERROR[rsMess])
          } else {
            setErrorMessage(SCHEDULE_ERROR.INVALID_REQUEST)
          }
        setIsVisible(false)
        setTimeout(() => {
          setIsLoading(false)
        }, 500);
        } else {
          const isOpenInGETELPAY = process.env.REACT_APP_MINIAPP_GTELPAY
          if(isOpenInGETELPAY == '1') {
            BookingService.createPayment({
              customerScheduleId: data?.customerScheduleId,
              paymentMethodType: PAYMENT_TYPE.GTEL_PAY,
            }
            ).then((result) => {
              if(result?.statusCode == 200){
                const {data} = result
                if(data?.inAppGtelOrderId){
                  setOrderId(data.inAppGtelOrderId)
                }}
            })
          }
          getScheduleDetail(data?.customerScheduleId)
          setScheduleTypePopUp(newData.scheduleType)
          setTimeout(() => {
            setIsLoading(false)
          }, 500);
          if(data.paymentUrl && data.paymentUrl?.length > 0){
            setTimeout(() => {
              window.open(data.paymentUrl, '_blank')
            }, 500);
          }
          setIsModalOpen(true)
          localStorage.removeItem(addKeyLocalStorage('bookingData'))
          setTimeout(() => {
            setBookingData({})
            form.resetFields();
            form.setFieldsValue({
              vntId:null,
              dateSchedule: null,
              time: null,
              stationsId: null
            })
          }, 500);
        }
      })
    }else{
      // Nếu là lịch hẹn thì thêm serviceId vào data
      newData["stationServicesList"] = [values.serviceId]
      BookingService.createSchedule(newData).then((result) => {
        const { error: rsMess, statusCode, data } = result
        if (statusCode != 200) {
          setIsModalErrOpen(true)
          if (Object.keys(SCHEDULE_ERROR).includes(rsMess)) {
            setErrorMessage(SCHEDULE_ERROR[rsMess])
          } else {
            setErrorMessage(SCHEDULE_ERROR.INVALID_REQUEST)
          }
        setIsVisible(false)
        setTimeout(() => {
          setIsLoading(false)
        }, 500);
        } else {
          const isOpenInGETELPAY = process.env.REACT_APP_MINIAPP_GTELPAY
          if(isOpenInGETELPAY == '1') {
            BookingService.createPayment({
              customerScheduleId: 85,
              stationServicesList: newData["stationServicesList"],
              paymentMethodType: PAYMENT_TYPE.GTEL_PAY
            }
          ).then((result) => {
            const {data} = result
            if(data?.inAppGtelOrderId){
              setOrderId(data.inAppGtelOrderId)
            }
          })}
          setIsModalOpen(true)
          localStorage.removeItem(addKeyLocalStorage('bookingData'))
          setTimeout(() => {
            setBookingData({})
            form.resetFields();
            form.setFieldsValue({
              vntId:null,
              dateSchedule: null,
              time: null,
              stationsId: null
            })
          }, 500);
        }
      })
    }
    setIsVisible(true)
  }

  useEffect(() => {
    // Hiện loading khi component mount
    if(!orderId || orderId == '') return
    window.GtelPayJSBridge?.payOrder({"order_id":orderId})
  }, [orderId])


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
        if(data.statusCode == 505){
          // setErrorMessage('Sai thông tin kết nối. Vui lòng kiểm tra lại')
          // setIsModalErrOpen(true)
        }else{
          if(data.length > 0){
            let tmp = data || []
            if (tmp.length > 0) {
              tmp.forEach((element) => {
                if (element.scheduleDateStatus == 0) {
                  setDisableBookingDate(false)
                  setDisableBookingHour(false)
                  element.disabled = false
                }else{
                  setDisableBookingHour(true)
                  setDisableBookingDate(true)
                }
                element.label = (
                  <div className="d-flex ai-c j-sb w-100">
                    <span>{element.scheduleDate}</span>
                      <span className="text-primary">
                        {getDisplayTextByScheduleDateStatus(element)}
                      </span>
                  </div>
                )
                element.value = element.scheduleDate
              })
              setListBookingDate(tmp)
              //timeout setState để chạy func lấy ngày đầu tiên
              setTimeout(() => {
                setSelectedBookingDate(true)
              }, 1000);
            }
          }else{
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
      filter:{
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
            if(element?.enablePriorityMode){
              element.label =<div className="text-station-select" style={{display:'flex',flexWrap:'wrap' }}>
                  <div className="ai-c" style={{ display: 'inline-flex',paddingRight:'4px' }}>
                    <span className='priority-mode'>Được ưu tiên</span>
                  </div>
                  {name}
                </div>
            }else{
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
                <div className="text-station-select" style={{display:'flex',flexWrap:'wrap'}}>
                  {name}
                </div>
              )
            }
            if (element.stationStatus == 0) {
              element.disabled = true
              element.label = (
                <div className="text-station-select" style={{ color: 'var(--error-btn-color)',display:'flex',flexWrap:'wrap' }}>
                  <div className="ai-c disable-station" style={{ display: 'inline-flex',border: '1px solid var(--error-btn-color)',borderRadius: '4px',marginRight:'4px' }}>
                    <span style={{padding:'0 2px'}}>Ngưng hoạt động</span>
                  </div>
                  {name}
                </div>
              )
              return
            } else {
              if (element.availableStatus == 0) {
                element.disabled = false
                element.label = (
                  <div className="text-station-select" style={{display:'flex',flexWrap:'wrap' }}>
                    {name}{' '}
                  </div>
                )
              }
            }
          })
          
          if (!callback) return (
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
  const handleCategory = (evt,vehicleSubCategory) => {
    const categoryOptionsMap = {
      [VEHICLE_SUB_CATEGORY.CAR]: VIHCLE_CATEGORY_OTO,
      [VEHICLE_SUB_CATEGORY.PASSENGER]: VIHCLE_CATEGORY_BUS,
      [VEHICLE_SUB_CATEGORY.TRUCKER]: VIHCLE_CATEGORY_TRUCK,
      [VEHICLE_SUB_CATEGORY.GROUP]: VIHCLE_CATEGORY_GROUP,
      [VEHICLE_SUB_CATEGORY.ROMOOCL]: VIHCLE_CATEGORY_MOOC,
      [VEHICLE_SUB_CATEGORY.CAR_SPECIALIZED]: VIHCLE_CATEGORY_PICKUP,
      [VEHICLE_SUB_CATEGORY.ORTHER]: VIHCLE_CATEGORY_SPECIALIZED,
    };

    const options = categoryOptionsMap[evt];
    if(options){
      setBookingData(prev => ({
        ...prev,
        vehicleSubCategory: vehicleSubCategory||options[0].value,
      }));
      saveDataLocal('vehicleSubCategory',vehicleSubCategory ||options[0].value)
      form.setFieldsValue({
        vehicleSubCategory: vehicleSubCategory||options[0].value,
      })
    }
      setVehicleSubCategoryOptions(options);
  }
  const saveDataLocal=(key,value)=>{
    let data = JSON.parse(localStorage.getItem(addKeyLocalStorage('bookingData')))
    let localData={
      ...data,
      [key]:value
    }
    localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
  }
  
  const handleFillData=()=>{
    const newData=dataBookingParam
    setBookingData(newData)
    form.setFieldsValue(newData)
  }

  const getServiceByStation = (stationsId) =>{
    BookingService.getListStationService({filter:{stationsId:stationsId}}).then((result)=>{
      const {data, isSuccess} = result
      if(isSuccess && data && data?.data.length > 0){
        setServiceTypes(() => {
          const apiServiceTypes = data?.data?.map(item => item.serviceType) || []; // Lấy danh sách serviceType từ API
          const filteredOptions = optionServiceType.filter(option =>
            apiServiceTypes.includes(option.value) // Lọc các mục có value trùng serviceType
          );
          return filteredOptions;
        });
        setServicesByStations(()=>{
          const newValues = data?.data.map((item)=>({
            label: item.serviceName,
            value: item.serviceId
          }))
          return newValues
        })
      }
    }).catch((error)=>{
      setErrorMessage('Lấy thông tin dịch vụ thất bại.')
      setIsModalErrOpen(true)
    })
  }
  
  useEffect(() => {
    getDataLocal()
    getMetaData()
    // setTimeout(() => {
    //   getAreaByIP()
    // }, 500);
    if(dataBookingParam?.vntId){
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
      }, 500);
    } else {
      setBookingData({ ...bookingData })
    }
    setDateFilter({
      ...dateFilter,
      vehicleType: Number(dataBookingParam?.vehicleType)||  VEHICLE_SUB_TYPE[0].vehicleType,
      stationsId: dataBookingParam?.stationsId || localBookingData?.stationsId?.stationsId,
    })
    if (dataBookingParam.stationsId && bookingData) {
      getBookingHours({
        stationsId: dataBookingParam?.stationsId,
        date: dataBookingParam?.dateSchedule,
        vehicleType: dataBookingParam?.vehicleType
      })
    }
    if(!dataLocal?.vehicleSubType){
      handleCategory(VEHICLE_SUB_TYPE[0].value)
      let localData={
        ...dataLocal,
        vehicleSubCategory:dataBookingParam?.vehicleSubCategory || VIHCLE_CATEGORY_OTO[0].value,
        vehicleSubType:dataBookingParam?.vehicleSubType || VEHICLE_SUB_TYPE[0].value,
        vehicleType: Number(dataBookingParam?.vehicleType)|| VEHICLE_SUB_TYPE[0].vehicleType,
      }
      localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
    } else{
      handleCategory(dataLocal?.vehicleSubType)
    }
    if(Number(params.get('vehicleSubType')) !== 0){
      handleCategory(Number(params.get('vehicleSubType')))
    } 
  }, [])
  useEffect(()=>{
    handleFillData()
    handleCheckReq(bookingData?.scheduleType || dataLocal?.scheduleType || Number(params.get('scheduleType')) || SCHEDULE_TYPE[0].value,SCHEDULE_TYPE)
  },[isLoadDataLocal])

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
  useEffect(()=>{
    if (dataBookingParam.stationsId && bookingData) {
      getBookingHours({
        stationsId: dataBookingParam?.stationsId,
        date: dataBookingParam?.dateSchedule,
        vehicleType: dataBookingParam?.vehicleType
      })
    }
  },[dataBookingParam])

  useEffect(() => {
    if (isZaloApp) {
      form.setFieldsValue({
        "phone": zaloUserPhone,
      })
      saveDataLocal('phone', zaloUserPhone)
    }
  }, [zaloUserPhone, form])

  const handleCheckReq=(values,arrayCheck)=>{
    for(let i=0;i<arrayCheck.length;i++){
      if(arrayCheck[i].value==values){
        setRequireScheduleStation(arrayCheck[i].requireScheduleStation);
        setRequireScheduleDate(arrayCheck[i].requireScheduleDate);
        setRequireScheduleTime(arrayCheck[i].requireScheduleTime)
      }
    }
  }

  const onClose=()=>{
    setOpen(false)
  }
  useEffect(() => {
    if (isZaloApp) {
      form.setFieldsValue({
        "fullnameSchedule": zaloUserName,
      })
      saveDataLocal('fullnameSchedule', zaloUserName)
    }
  }, [zaloUserName, form])

  return (
    <Form
      name="booking"
      layout="vertical"
      initialValues={{}}
      onValuesChange={(changedValues, allValues) => {
        if(changedValues?.serviceType){
          handleChangeServicesByType(allservicesByStations,changedValues?.serviceType)
        }
        if(changedValues?.stationsId){
          handleGetStationsServices(changedValues?.stationsId)
        }
      }}
      form={form}
      onFinish={(values) => { onFinish(values) }}>
      {() => (
         <div>
      <Form.Item
        name="fullnameSchedule"
        label="Họ và tên chủ xe"
        rules={[
          {
            required: dataBookingParam?.require_firstName === 'false' ? false : true,
            message: 'Vui lòng nhập tên'
          },
          {
            message: 'Vui lòng nhập tên',
            pattern: new RegExp(/^\S/)
          }
        ]}
        hidden={dataBookingParam?.visible_firstName === 'true' || dataBookingParam?.visible_firstName === null ? false : true}
      >
        <Input
          defaultValue={isZaloApp ? zaloUserName : dataBookingParam?.fullnameSchedule || dataLocal?.fullnameSchedule}
          className="login__input booking-input"
          placeholder="Nguyễn Văn a"
          type="text"
          size="large"
          onInput={(e) => {
            saveDataLocal('fullnameSchedule', e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item
        name="phone"
        label="Số điện thoại"
        hidden={dataBookingParam?.visible_phoneNumber === 'true' || dataBookingParam?.visible_phoneNumber === null ? false : true}
        rules={[
          {
            required: !isZaloApp || dataBookingParam?.require_phoneNumber !== 'false',
            message: 'Vui lòng nhập số điện thoại'
          },
          {
            message: 'Số điện thoại không hợp lệ',
            pattern: new RegExp(/^(03|05|07|08|09|01[2|6|8|9])+([0-9])*$\b/),
          },
          {
            min: 10,
            message: 'Số điện thoại quá ngắn'
          },
          {
            max: 11,
            message: 'Số điện thoại quá dài'
          }
        ]}
      >
        <Input
          defaultValue={isZaloApp ? zaloUserPhone : dataBookingParam?.phone || dataLocal?.phone}
          className="login__input booking-input"
          placeholder="Nhập số điện thoại"
          type="text"
          size="large"
          disabled={isZaloApp}
          onInput={(e) => {
            saveDataLocal('phone', e.target.value)
          }} />
      </Form.Item>

      <Form.Item
        name="scheduleType"
        label="Mục đích đặt hẹn"
        rules={[
          {
            required: true,
            message: 'Vui lòng chọn mục đích đặt lịch'
          }
        ]}>
        <div className="login__input__icon">
        <SelectAntd
            className="cs-select ant-custom booking-input"
            isSearchable={true}
            placeholder="Vui lòng chọn mục đích đặt lịch"
            styles={customStyles}
            options={scheduleTypes}
            defaultValue={Number(dataBookingParam?.scheduleType)|| SCHEDULE_TYPE[0].value}
            menuPlacement="top"
            value={bookingData.scheduleType}
            // disabled={!bookingData.stationsId}
            onChange={(values) => {
              if(!isZaloApp){
                saveDataLocal('scheduleType',values)
              }else{
                localStorage.removeItem('bookingData')
              }
              form.setFieldsValue({
                scheduleType:values,
              })
              handleCheckReq(values,scheduleTypes)
              setBookingData({
                ...bookingData,
                scheduleType:values,
              })
            }}
          />
        </div>
      </Form.Item>

      <Form.Item name="licensePlates" 
        label="Biển số xe"
        hidden={dataBookingParam?.visible_vehicleIdentity === 'true' || dataBookingParam?.visible_vehicleIdentity === null ? false : true}
        rules={[
          {
            required: dataBookingParam?.require_vehicleIdentity === 'false' ? false : true,
            validator(_, value) {
              return validatorPlateNumber(value?.toUpperCase())
            }
          }
          ]}>
        <div className="login__input__icon">
          <Input defaultValue={dataBookingParam?.licensePlates?.toUpperCase() || dataLocal?.licensePlates?.toUpperCase()}
            className="login__input booking-input"
            style={{textTransform:'uppercase'}}
            placeholder="59B16856"
            type="text"
            size="large"
            readOnly = {dataVihcle?.vehicleIdentity}
            onInput={(e)=>{
              e.target.value = e.target.value.toUpperCase().replace(/\s/g, '')
              saveDataLocal('licensePlates',e.target.value)
            }} />
        </div>
      </Form.Item>
      <Form.Item
        name="licensePlateColor"
        label="Màu biển số"
        hidden={dataBookingParam?.visible_vehiclePlateColor === 'true' || dataBookingParam?.visible_vehiclePlateColor === null ? false : true}
        rules={[
          {
            required: dataBookingParam?.require_vehiclePlateColor === 'false' ? false : true,
            message: 'Vui lòng chọn màu biển số'
          },
        ]}>
        <div className="login__input__icon">
          <SelectAntd
            className="cs-select ant-custom booking-input"
            isSearchable={true}
            placeholder="Vui lòng chọn màu biển số"
            styles={customStyles}
            options={licensePlateColor}
            value={bookingData.licensePlateColor}
            menuPlacement="top"
            defaultValue={Number(dataBookingParam?.licensePlateColor) || PLATE_COLOR[0].value}
            isOptionDisabled={(option) => option.disabled}
            onChange={(values) => {
              saveDataLocal('licensePlateColor',values)
              form.setFieldsValue({
              licensePlateColor:values,
              })
              setBookingData({
                ...bookingData,
                licensePlateColor:values,
              })
            }}
          />
        </div>
      </Form.Item>
      <Row className='vehicleType mt-3'>
        <Col className='mWidth-100' span={dataBookingParam.visible_vehicleSubCategory === "false" ? 24 : 11}>
          <Form.Item
            className="radio-label"
            label="Loại phương tiện"
            name="vehicleSubType"
            hidden={dataBookingParam?.visible_vehicleSubType === 'true' || dataBookingParam?.visible_vehicleSubType === null ? false : true}
            rules={[
              {
                required: dataBookingParam?.require_vehicleSubType === 'false' ? false : true,
                message: 'Vui lòng nhập'
              }
            ]}>
            <SelectAntd
                className='cs-select ant-custom booking-input'
                options={VEHICLE_SUB_TYPE}
                defaultValue={Number(dataBookingParam?.vehicleSubType)|| VEHICLE_SUB_TYPE[0].value}
                value={bookingData.vehicleSubType}
                onChange={(values,vehicletype) => {
                  let data = JSON.parse(localStorage.getItem(addKeyLocalStorage('bookingData')))
                  let localData={
                    ...data,
                    vehicleSubType:values,
                    vehicleType: vehicletype.vehicleType,
                    dateSchedule:null,
                    time:null,
                  }
                  localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
                  handleCategory(values,null)
                  form.setFieldsValue({
                    vehicleType: vehicletype.vehicleType,
                    vehicleSubType: values,
                    dateSchedule:null,
                    time:null,
                  })
                  setBookingData({
                    ...bookingData,
                    vehicleType: vehicletype.vehicleType,
                    vehicleSubType: values,
                    dateSchedule:null,
                    time:null,
                  })
                  setDateFilter({
                    ...dateFilter,
                    vehicleType: vehicletype.vehicleType,
                  })
                }}
              />
          </Form.Item>
        </Col>
        <Col span={2}></Col>
        <Col className='mWidth-100' span={dataBookingParam.visible_vehicleSubType === "false" ? 24 : 11}>
          <Form.Item
            className="radio-label"
            label="Phân loại"
            name="vehicleSubCategory"
            hidden={dataBookingParam?.visible_vehicleSubCategory === 'true' || dataBookingParam?.visible_vehicleSubCategory === null ? false : true}
            rules={[
              {
                required: dataBookingParam?.require_vehicleSubCategory === 'true' ? true : false,
                message: 'Vui lòng chọn phân loại'
              }
            ]}
            >
            <SelectAntd
              className='cs-select ant-custom booking-input'
              options={vehicleSubCategoryOptions}
              defaultValue={Number(dataBookingParam?.vehicleSubCategory)|| vehicleSubCategoryOptions[0].label}
              value={bookingData.vehicleSubCategory}
              onChange={(values) => {
                saveDataLocal('vehicleSubCategory',values)
                form.setFieldsValue({
                    vehicleSubCategory: values,
                    dateSchedule:null,
                    time:null,
                  })
                  setBookingData({
                    ...bookingData,
                    vehicleSubCategory: values,
                    dateSchedule:null,
                    time:null,
                  })
              }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="certificateSeries"
        extra={'Nhập số seri GCN để được tự động kiểm tra phạt nguội'}
        hidden={dataBookingParam?.visible_certificateSeries === 'true' || dataBookingParam?.visible_certificateSeries === null ? false : true}
        label={
          <div>
            Số seri GCN mới nhất
            <span
              className="text-important text-very-small text-primary"
              onClick={() =>{
                setIsModalErrOpen(true);
                setErrorMessage('Số seri là dãy số có dạng XXXXXXXX.<br>Số seri có thể được tìm thấy trên tem đăng kiểm hoặc dòng chữ cuối cùng ở trang 1 của sổ / giấy đăng kiểm')
              }}>
              (Tìm số seri)
            </span>
          </div>
          }
        className=""
        rules={[
          {
            required: dataBookingParam?.require_certificateSeries === 'true' ? true : false,
            message: 'Vui lòng nhập số seri GCN'
          },
          {
            message: 'Số seri GCN không hợp lệ',
            pattern: new RegExp(/^([a-zA-Z]{2})+(-(?!-))+([0-9]{7}\b)$/),
          },
        ]}>
        <Input
          className="login__input"
          defaultValue={ dataBookingParam?.certificateSeries || dataLocal?.certificateSeries}
          placeholder="Ví dụ: KA-7461980"
          type="text"
          style={{textTransform:'uppercase'}}
          size="large"
          readOnly = {dataVihcle?.certificateSeries}
          onInput={(event) => {
            event.target.value = event.target.value.toUpperCase().replace(/\s/g, '')
            saveDataLocal('certificateSeries',event.target.value)
          }}
        />
      </Form.Item>
      <Form.Item label="Khu vực" name="vntId" rules={[]} hidden={dataBookingParam?.visible_StationArea === 'true' || dataBookingParam?.visible_StationArea === null ? false : true}>
        <SelectAntd
          className="cs-select ant-custom booking-input"
          filterOption={(input, option) => {
            return xoa_dau((option?.value ?? '').toLowerCase()).includes(xoa_dau(input.toLowerCase()))
          }}
          showSearch
          disabled={!bookingData.vehicleSubType}
          // defaultValue={dataBookingParam?.vntId || dataLocal?.vntId}
          onChange={(values) => {
            let data = JSON.parse(localStorage.getItem(addKeyLocalStorage('bookingData')))
            let localData={
              ...data,
              vntId:values,
              stationsId: undefined,
              dateSchedule: undefined,
              time: undefined
            }
            localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
            form.setFieldsValue({
              vntId:values,
              stationsId: null,
              dateSchedule: null,
              time: null
            })
            if(requireScheduleStation == '1'){
              getStations({
              ...customerParam,
              filter: {
                stationArea: values
              }
            })
            }
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
      {requireScheduleStation == '1' && (
        <span id="station">
          <Form.Item
            label="Chọn trạm"
            name="stationsId"
            rules={[
              {
                required: requireScheduleStation == '1' ? true : false,
                message: 'Vui lòng nhập'
              }
            ]}
            hidden={dataBookingParam?.visible_StationsCode === 'true' || dataBookingParam?.visible_StationsCode === null ? false : true}
            >
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
              disabled={!bookingData?.vntId || isVisible.stationsId}
              // value={listStation?.filter(op => op.stationsId === dataBookingParam?.stationsId || dataLocal?.stationsId?.stationsId)}
              // value={73}
              // defaultValue={{
              //   label : "2914D",
              //   value : 73
              // }}
              onChange={(values) => {
                form.setFieldsValue({
                  dateSchedule: null,
                  time: null,
                  stationsId: values
                })
                setDateFilter({
                  ...dateFilter,
                  stationsId: values,
                })
                const stationSelected = listStation?.find((e) => e.stationsId == values)
                setBookingConfig(JSON.parse(stationSelected?.stationBookingConfig))
                saveDataLocal('stationsId',stationSelected)
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
      )}
      <Form.Item label="Loại dịch vụ" name="serviceType" rules={[
        {
          required: true,
          message: 'Vui lòng chọn loại dịch vụ'
        }
      ]} hidden={dataBookingParam?.visible_StationArea === 'true' || dataBookingParam?.visible_StationArea === null ? false : true}>
        <SelectAntd
          className="cs-select ant-custom booking-input"
          filterOption={(input, option) => {
            return xoa_dau((option?.value ?? '').toLowerCase()).includes(xoa_dau(input.toLowerCase()))
          }}
          showSearch
          disabled={!bookingData?.vntId || isVisible.stationsId}
          // defaultValue={dataBookingParam?.vntId || dataLocal?.vntId}
          onChange={(values,option) => {
            form.setFieldsValue({
              serviceType: values
            })
            setBookingData({
              ...bookingData,
              serviceType: values
            })
            saveDataLocal('serviceType',values)
          }}
          placeholder="Vui lòng chọn loại dịch vụ"
          styles={customStyles}
          options={serviceTypes}
        />
      </Form.Item>
      {requireScheduleStation == '1' && (
        <span id="service">
          <Form.Item
            label="Chọn dịch vụ"
            name="serviceId"
            rules={[
              {
                required: requireScheduleStation == '1' ? true : false,
                message: 'Vui lòng nhập'
              }
            ]}
            hidden={dataBookingParam?.visible_StationsCode === 'true' || dataBookingParam?.visible_StationsCode === null ? false : true}
            >
            <SelectAntd
              className="cs-select ant-custom booking-input"
              isSearchable={true}
              size="middle"
              // placeholder="Vui lòng chọn dịch vụ"
              style={{
                customStyles,
                ...{
                  lineHeight: 48
                }
              }}
              // options={servicesByStations}
              menuPlacement="top"
              disabled={!bookingData?.vntId || isVisible.stationsId}
              onChange={(values) => {
                form.setFieldsValue({
                  serviceId: values
                })
                setBookingData({
                  ...bookingData,
                  serviceId: values
                })
                saveDataLocal('serviceId',values)
              }}
            >
              {
                servicesByStations.length > 0 && servicesByStations.map((item) => (
                  <SelectAntd.Option key={item.value} value={item.value}>
                    <div className='d-flex'>
                      <span>{item.label}</span>
                      <span>{item.price} đ</span>
                    </div>
                  </SelectAntd.Option>
                ))
              }
            </SelectAntd>
          </Form.Item>
        </span>
      )}
      {requireScheduleDate == '1' && (
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
                  endDate: moment(selectedMonth).endOf('months').format(DATE_DISPLAY_FORMAT),
                })
              }}
              selectedDate={form.getFieldValue('dateSchedule')}
              setSelectedDate={(values) => {
                saveDataLocal('dateSchedule',values)
                saveDataLocal('time',null)
                form.setFieldsValue({
                  dateSchedule:values,
                  time: null
                })
                const  stationsId  = bookingData.stationsId.stationsId || localBookingData?.stationsId?.stationsId
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
      )} 
      {requireScheduleTime == '1' && (
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
                form.setFieldsValue({
                  ["time"]: values
                })
                saveDataLocal('time',values)
                setBookingData({
                  ...bookingData,
                  time: values.scheduleTime
                })
              }}
              selectedTime={form.getFieldValue('time')}
              bookingConfig={bookingConfig}
            />
          {/* <Select
            className="cs-select schedule-hour booking-input"
            isSearchable={true}
            placeholder="Chọn khung giờ"
            isOptionDisabled={(option) => (
                option.disabled
              )}
            isDisabled={!bookingData.dateSchedule}
            styles={customStyles}
            options={listBookingTime}
            defaultValue={dataBookingParam?.time || dataLocal?.time?.scheduleTime}
            getOptionValue={(option) => option.label}
            menuPlacement="top"
            onChange={(values) => {
              form.setFieldsValue({
                time: values
              })
              saveDataLocal('time',values)
              setBookingData({
                ...bookingData,
                time: values.scheduleTime
              })
            }}
          /> */}
        </Form.Item>
      )}
      <div className="w-100 d-flex justify-content-center mgt-40">
        <Button className="login__button df" type="primary" htmlType="submit" size="large">
          Đặt lịch
        </Button>
      </div>
      <BookingSuccess isModalOpen={isModalOpen} scheduleType={scheduleTypePopUp} setTabKey={setTabKey} setIsModalOpen={setIsModalOpen} onClose={() => {
        setIsModalOpen(false)
        // window.location.reload()}
        history.goBack()
        }}></BookingSuccess>
      <ModalPaymentQR
        open={open}
        onClose={() => {
            onClose();
        }}
        driver={{
          totalPay: scheduleDetail?.order?.totalAmount,
          formatedTotalPay: numberWithSeparator(scheduleDetail?.order?.totalAmount),
          qr: scheduleDetail?.paymentQR?.bankQR,
          expiredInMinutes: 10,
          runTime: new Date(),
          status: scheduleDetail?.order?.paymentStatus
        }}
        onRefresh={() => {
          setScheduleDetail({ ...scheduleDetail, runTime: new Date() });
        }}
        method={'bank'}
      />
      {isModalErrOpen &&
        <PopupMessage isModalOpen={isModalErrOpen} onClose={() => {setIsModalErrOpen(false)}} text={errorMessage} ></PopupMessage>
      }
      {isLoading && (
        <div className="loading">
          <div>
            <LogoTTDK></LogoTTDK>
            <Spin style={{width:'100%'}} />
          </div>
        </div>
      )}
    </div>
    )}
    </Form>
  )
}

export default BookingPartnerForm