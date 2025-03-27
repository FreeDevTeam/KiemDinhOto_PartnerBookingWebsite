import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Select as SelectAntd, Row, Col, Spin } from 'antd'
import queryString from 'query-string'
import _, { get } from 'lodash'
import moment from 'moment'
import { useLocation } from 'react-router-dom'

import BookingService from '../../services/addBookingService'
import AreaByIP from '../../services/getAreaByIP'

import { PLATE_COLOR, SCHEDULE_TYPE, VEHICLE_SUB_CATEGORY, VEHICLE_SUB_TYPE, VIHCLE_CATEGORY_BUS, VIHCLE_CATEGORY_GROUP, VIHCLE_CATEGORY_MOOC, VIHCLE_CATEGORY_OTO, VIHCLE_CATEGORY_PICKUP, VIHCLE_CATEGORY_SPECIALIZED, VIHCLE_CATEGORY_TRUCK, VIHCLE_TYPES } from '../../constants/global'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'

import { xoa_dau } from '../../helper/common'
import { changeTime } from '../../helper/changeTime'
import addKeyLocalStorage from '../../helper/localStorage'

import PopupMessage from '../BookingPartner/PopupMessage'
import { ReactComponent as LogoTTDK } from './../../assets/icons/Logo.svg'
import BookingDatePicker from '../../components/BookingDatePicker'
import BookingHoursPicker from '../../components/BookingHoursPicker'

function UpdateBookingDetail() {
  const [form] = Form.useForm()
  const location = useLocation();
  const data = location.state?.data
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
  const [disableBookingDate, setDisableBookingDate] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBookingArea, setSelectedBookingArea] = useState(false)
  const [selectedBookingStation, setSelectedBookingStation] = useState(false)
  const [selectedBookingDate, setSelectedBookingDate] = useState(false)
  const [selectedBookingHour, setSelectedBookingHour] = useState(false)
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
  // let getParamData ={
  //   dateSchedule:params.get('dateSchedule'),
  //   time: params.get('time'),
  //   vntId: params.get('vntId'),
  //   visible_StationArea : (params.get('visible_StationArea')),
  //   visible_StationsCode : (params.get('visible_StationsCode')),
  // }
  //lấy data từ local nếu ko có thì lấy từ param
  // const [dataBookingParam, setDataBookingParam] = useState(getParamData)

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
              if(bookingConfig.length > 0){
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
              }
            })
            setListBookingTime(tmp)
            //timeout setState để lấy giờ hẹn đầu tiên
            setTimeout(() => {
              setSelectedBookingHour(true)
            }, 500);
          }
        }
      })
      .catch((error) => {
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
    if (listBookingDate?.length > 0 && data?.stationsId) {
      for (let i = 0; i < listBookingDate?.length; i++) {
        if (listBookingDate[i].scheduleDateStatus) {
          //lưu dữ liệu thỏa mãn vào local
          const stationsId = data?.stationsId
          //gọi api lấy giờ hẹn
          if (stationsId && data) {
            //chạy api lấy danh sách giờ hẹn
            getBookingHours({
              stationsId: stationsId,
              date: listBookingDate[i].scheduleDate,
              vehicleType: data.vehicleType
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

  const getAreaByIP = async() => {
    await AreaByIP.getAreaByIP().then((result) => {
      const { statusCode,data } = result
      if (statusCode == 200) {
        if(data.stationArea){
          handleSaveArea(data)
        }else{
          if(data?.stationArea){
            getStations({
              filter: {
                stationArea:data?.stationArea
              }
            })
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
        handleCheckReq(data?.scheduleType || SCHEDULE_TYPE[0].value,newValues)
      })
      }else{
        setScheduleTypes(SCHEDULE_TYPE)
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

  const onFinish = (values) => {
    console.log("values",values)
  }

  useEffect(() => {
    if (dateFilter.vehicleType && dateFilter.stationsId) {
      //chạy api lấy ngày khi state dateFilter thay đổi
      getBookingDate({
        stationsId: dateFilter.stationsId,
        vehicleType: dateFilter.vehicleType,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
      })
    }
  }, [dateFilter])

  //func chạy api lấy ngày hẹn sau khi chọn trạm
  function getBookingDate(params) {
    setLoadingDatePicker(true)
    setIsVisible((prev) => ({ ...prev, dateSchedule: true }))
    BookingService.getBookingDate(params)
      .then((data) => {
        if(data.statusCode == 505){
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
              console.log("tmp",tmp)
              setListBookingDate(tmp)
            }
          }else{
            setListBookingDate([])
            setListBookingTime([])
            setBookingData({
              ...bookingData,
              dateSchedule: null,
              dateSchedule: null,
              time: null
            })
          }
        }
      })
      .catch(() => {
        setLoadingDatePicker(false)
      })
      .finally(() => {
        setIsVisible((prev) => ({ ...prev, dateSchedule: false }))
        setLoadingDatePicker(false)
      })
  }


  function getStations(filter = null, callback = null) {
    filter = filter ? filter : customerParam
    const newFilter = {
      ...filter,
      filter:{
        ...filter?.filter,
        scheduleType: data?.scheduleType
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
            setListStation(tmp)
            //timeout setState để thực hiện lấy trạm đầu tiên
            // setTimeout(() => {
            //   setSelectedBookingStation(true)
            // }, 1000)
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
      form.setFieldsValue({
        vehicleSubCategory: vehicleSubCategory||options[0].value,
      })
    }
    setVehicleSubCategoryOptions(options);
  }
  
  useEffect(() => {
    getMetaData()
    if(data?.vntId){
      getStations({
        filter: {
          stationArea: data?.vntId
        }
      })
    } else {
      getAreaByIP()
    }
    setDateFilter({
      ...dateFilter,
      vehicleType: Number(data?.vehicleType)||  VEHICLE_SUB_TYPE[0].vehicleType,
      stationsId: data?.stationsId || localBookingData?.stationsId?.stationsId,
    })
    if (data.stationsId && bookingData) {
      getBookingHours({
        stationsId: data?.stationsId,
        date: data?.dateSchedule,
        vehicleType: data?.vehicleType
      })
    }
    handleCategory(Number(data?.vehicleSubType))
    // Lấy ds khu vực
    getStationAreas()
    // Lấy ds trạm theo khu vực detail
    getStations({
      filter: {
        stationArea: data?.stationArea
      }
    })
    getBookingDate({
      startDate: moment().format(DATE_DISPLAY_FORMAT),
      endDate: moment().endOf('month').format(DATE_DISPLAY_FORMAT),
      stationsId: data?.stationsId,
      vehicleType: data?.vehicleType
    })
  }, [])

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

  const handleCheckReq=(values,arrayCheck)=>{
    for(let i=0;i<arrayCheck.length;i++){
      if(arrayCheck[i].value==values){
        setRequireScheduleStation(arrayCheck[i].requireScheduleStation);
        setRequireScheduleDate(arrayCheck[i].requireScheduleDate);
        setRequireScheduleTime(arrayCheck[i].requireScheduleTime)
      }
    }
  }

  return (
    <div className="detail-sche" style={{ maxWidth: 600, margin: 'auto', padding: '10px' }}>
    <Form
      name="booking"
      layout="vertical"
      form={form}
      initialValues={{
        vntId: data?.stationArea
      }}
      onFinish={(values) => { onFinish(values) }}>
      {() => (
         <div>
      <Form.Item
        name="fullnameSchedule"
        label="Số điện thoại"
      >
        <Input
          className="login__input booking-input"
          type="text"
          size="large"
          defaultValue={data?.fullnameSchedule}
          disabled={true}
          />
      </Form.Item>
      <Form.Item
        name="phone"
        label="Số điện thoại"
      >
        <Input
          className="login__input booking-input"
          type="text"
          size="large"
          defaultValue={data?.phone}
          disabled={true}
          />
      </Form.Item>

      <Form.Item
        name="scheduleType"
        label="Mục đích đặt hẹn"
       >
        <div className="login__input__icon">
        <SelectAntd
            disabled={true}     
            className="cs-select ant-custom booking-input"
            isSearchable={true}
            styles={customStyles}
            options={scheduleTypes}
            menuPlacement="top"
            readOnly={true}
            value={data?.scheduleType}
          />
        </div>
      </Form.Item>

      <Form.Item name="licensePlates" label="Biển số xe">
        <div className="login__input__icon">
          <Input
            disabled={true}
            className="login__input booking-input" 
            style={{textTransform:'uppercase'}} 
            placeholder="59B16856" 
            type="text" 
            size="large"
            readOnly = {true}
            value={data?.licensePlates}
             />
        </div>
      </Form.Item>
      <Form.Item
        name="licensePlateColor"
        label="Màu biển số"
        >
        <div className="login__input__icon">
          <SelectAntd
            disabled={true}
            className="cs-select ant-custom booking-input"
            isSearchable={true}
            placeholder="Vui lòng chọn màu biển số"
            styles={customStyles}
            options={licensePlateColor}
            value={data?.licensePlateColor}
            menuPlacement="top"
          />
        </div>
      </Form.Item>
      <Row className='vehicleType mt-3'>
        <Col className='mWidth-100' span={24}>
          <Form.Item
            className="radio-label"
            label="Loại phương tiện"
            name="vehicleSubType"
            >
            <SelectAntd
                disabled={true}
                className='cs-select ant-custom booking-input'
                options={VEHICLE_SUB_TYPE}
                defaultValue={data?.vehicleType}
                value={data?.vehicleType}
              />
          </Form.Item>
        </Col>
        <Col span={2}></Col>
        <Col className='mWidth-100' span={24}>
          <Form.Item
            className="radio-label"
            label="Phân loại"
            name="vehicleSubCategory"
            >
            <SelectAntd
              disabled={true}
              className='cs-select ant-custom booking-input'
              options={vehicleSubCategoryOptions}
              defaultValue={data?.vehicleSubType}
              value={data?.vehicleSubType}
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
          </div>
          }
        >
        <Input
          disabled={true}
          className="login__input"
          defaultValue={data?.certificateSeries}
          type="text"
          style={{textTransform:'uppercase'}}
          size="large"
          readOnly = {true}
        />
      </Form.Item>
      <Form.Item label="Khu vực" name="vntId">
        <SelectAntd
          defaultValue={data?.stationArea}
          className="cs-select ant-custom booking-input"
          filterOption={(input, option) => {
            return xoa_dau((option?.value ?? '').toLowerCase()).includes(xoa_dau(input.toLowerCase()))
          }}
          showSearch
          onChange={(values) => {
            setSelectedBookingArea(true)
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
            >
            <SelectAntd
              defaultValue={data?.stationsId}
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
                setSelectedBookingStation(true)
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
              }}
            />
          </Form.Item>
        </span>
      )}
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
              disabled={false}
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
                setSelectedBookingDate(true)
                form.setFieldsValue({
                  dateSchedule:values,
                  time: null
                })
                const  stationsId  = data.stationsId
                if (stationsId && bookingData) {
                  getBookingHours({
                    stationsId: stationsId,
                    date: values,
                    vehicleType: data.vehicleType
                  })
                }
              }}
              listBookingDate={listBookingDate}
            />
        </Form.Item>
        <Form.Item
          disabled={true}
          label="Giờ hẹn"
          name="time"
          rules={[
            {
              required: requireScheduleTime == '1' ? true : false,
              message: 'Vui lòng nhập'
            }
          ]}>
            <BookingHoursPicker
              listBookingTime={listBookingTime}
              loading={loadingHoursPicker}
              setSelectedTime={(values) => {
                form.setFieldsValue({
                  ["time"]: values
                })
              }}
              selectedTime={form.getFieldValue('time')}
            />
        </Form.Item>
      <div className="w-100 d-flex justify-content-center mgt-40">
        <Button className="login__button df" type="primary" htmlType="submit" size="large">
          Đặt lịch
        </Button>
      </div>
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
    </div>
  )
}

export default UpdateBookingDetail

