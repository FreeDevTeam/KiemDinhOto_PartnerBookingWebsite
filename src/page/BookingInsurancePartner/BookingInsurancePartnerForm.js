import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Select as SelectAntd, Row, Col, Spin, Radio, Tag, DatePicker } from 'antd'
import BookingService, { fetchMetadataWithCache } from '../../services/addBookingService'
import { WarningOutlined } from '@ant-design/icons'
import { xoa_dau } from '../../helper/common'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'
import { changeTime } from '../../helper/changeTime'
import queryString from 'query-string'
import _ from 'lodash'
import moment from 'moment'
import Select from 'react-select'
import { PLATE_COLOR, SCHEDULE_TYPE, TTDK_INSURANCE_PARTNER, VEHICLE_SUB_CATEGORY, VEHICLE_SUB_TYPE, VIHCLE_CATEGORY_BUS, VIHCLE_CATEGORY_GROUP, VIHCLE_CATEGORY_MOOC, VIHCLE_CATEGORY_OTO, VIHCLE_CATEGORY_PICKUP, VIHCLE_CATEGORY_SPECIALIZED, VIHCLE_CATEGORY_TRUCK, VIHCLE_TYPES } from '../../constants/global'
import { SCHEDULE_ERROR } from '../../constants/errorMessage'
import { useLocation } from 'react-router-dom'
import AreaByIP from '../../services/getAreaByIP'
import addKeyLocalStorage from '../../helper/localStorage'
import { validatorPlateNumber, normalizePlate } from '../../helper/validatorPlateNumber'
import PopupMessage from '../BookingPartner/PopupMessage'
import BookingSuccess from '../BookingPartner/BookingSuccessModal'
import redirectToInsurancePartner from './redirectToInsurancePartner'
import MainLogo from '../../components/MainLogo'
import { useAppParamsContext } from '../../context/AppParamsContext'

const usagePurposeTypeOptions=[
  {
    value:1,
    label:'Chở người'
  },
  {
    value:2,
    label:'Pickup - Minivan'
  },
  {
    value:3,
    label:'Chở hàng'
  },
  {
    value:4,
    label:'Xe chuyên dụng'
  },
]
const specialTransportOptions=[
  {
    value:0,
    label:'Không'
  },
  {
    value:1,
    label:'Tập lái'
  },
]
const insuranceDurationOptions=[
  {
    value:1,
    label:'1 năm'
  },
  {
    value:1.5,
    label:'1.5 năm'
  },
  {
    value:2,
    label:'2 năm'
  },
  {
    value:2.5,
    label:'2.5 năm'
  },
  {
    value:3,
    label:'3 năm'
  },
]

function BookingInsurancePartnerForm({form, setTabKey, zaloUserName,zaloUserPhone}) {
  const isZaloApp = (process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1)
  const location = useLocation();
  const dataVihcle=location.state || {}
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  const dataLocal=JSON.parse(localStorage.getItem(addKeyLocalStorage('bookingData')))
  const [customerParam, setCustomerParam] = useState({filter: {} })
  const [errorMessage, setErrorMessage] = useState('')
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [bookingData, setBookingData] = useState({})
  const [dayStart, setDayStart] = useState()
  const [localBookingData, setLocalBookingData] = useState(dataLocal)
  const [listStationArea, setListStationArea] = useState([])
  const [licensePlateColor, setLicensePlateColor] = useState(PLATE_COLOR)
  const [scheduleTypes, setScheduleTypes] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadDataLocal, setIsLoadDataLocal] = useState(false)
  const [vehicleSubCategoryOptions, setVehicleSubCategoryOptions] = useState([])
  const [targetLink, setTargetLink] = useState('')
  const { referUserId, referStationId, checkUrlParamSaveContext } = useAppParamsContext()
  useEffect(() => {
    checkUrlParamSaveContext('referUserId')
    checkUrlParamSaveContext('referStationId')
  }, [checkUrlParamSaveContext, location.search])
  
  const [dateFilter, setDateFilter] = useState({
    startDate: moment().format(DATE_DISPLAY_FORMAT),
    endDate: moment().endOf('month').format(DATE_DISPLAY_FORMAT),
    vehicleType: null
  })
  let getParamData ={
    licensePlates:dataVihcle?.vehicleIdentity || params.get('licensePlates'),
    phone:zaloUserPhone || params.get('phone'),
    fullnameSchedule:zaloUserName || params.get('name'),
    email:params.get('email'),
    vehicleType:VEHICLE_SUB_TYPE[0].vehicleType,
    licensePlateColor:Number(dataLocal?.licensePlateColor) || Number(params.get('licensePlateColor')) || PLATE_COLOR[0].value,
    scheduleType:14,
    vehicleSubType: Number(params.get('vehicleSubType')) || VEHICLE_SUB_TYPE[0].value,
    vehicleSubCategory: Number(params.get('vehicleSubCategory')) || VIHCLE_CATEGORY_OTO[0].value,
    vntId: params.get('vntId'),
    certificateSeries:dataVihcle?.certificateSeries ||  params.get('certificateSeries'),
    vehicleForBusiness: params.get('vehicleForBusiness'),
    vehicleBrandName: params.get('vehicleBrandName'),
    usagePurposeType: params.get('usagePurposeType'),
    specialTransport: params.get('specialTransport'),
    vehicleSeatsLimit: params.get('vehicleSeatsLimit'),
    supplier: params.get('supplier'),
    insuranceDuration: params.get('insuranceDuration'),
    referCode: params.get('referCode'),
    discountCode: params.get('discountCode'),
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
      vehicleType: Number(dataBookingParam?.vehicleType) || VEHICLE_SUB_TYPE[0].vehicleType,
      licensePlateColor: Number(dataBookingParam?.licensePlateColor) || Number(params.get('licensePlateColor')),
      scheduleType: 14,
      vehicleSubType: Number(params.get('vehicleSubType')) || localBookingData?.vehicleSubType || VEHICLE_SUB_TYPE[0].value,
      vehicleSubCategory: Number(params.get('vehicleSubCategory')) || localBookingData?.vehicleSubCategory || VIHCLE_CATEGORY_OTO[0].value,
      vntId: params.get('vntId') || localBookingData?.vntId,
      certificateSeries:dataVihcle?.certificateSeries ||  localBookingData?.certificateSeries || params.get('certificateSeries'),
      vehicleForBusiness:localBookingData?.vehicleForBusiness|| params.get('vehicleForBusiness') || 0,
      vehicleBrandName:localBookingData?.vehicleBrandName|| params.get('vehicleBrandName'),
      usagePurposeType:localBookingData?.usagePurposeType|| params.get('usagePurposeType') || usagePurposeTypeOptions[0].value,
      specialTransport:localBookingData?.specialTransport|| params.get('specialTransport') || specialTransportOptions[0].value,
      vehicleSeatsLimit:localBookingData?.vehicleSeatsLimit|| params.get('vehicleSeatsLimit'),
      supplier:localBookingData?.supplier|| params.get('supplier') || Object.values(TTDK_INSURANCE_PARTNER)[0].label,
      insuranceDuration:localBookingData?.insuranceDuration|| params.get('insuranceDuration') || insuranceDurationOptions[0].value,
      referCode:localBookingData?.referCode|| params.get('referCode'),
      discountCode:localBookingData?.discountCode|| params.get('discountCode'),
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

  const handleSaveArea=(data)=>{
    let localData={
      ...dataLocal,
      vntId:data.stationArea
    }
    localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
  }
  const handleFillDataArea=(data)=>{
    setBookingData((prev)=>({
      ...prev,
      vntId:data,
    }))
    form.setFieldsValue({
      vntId:data,
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
          if(!dataLocal?.vntId){
            let localData={
              ...dataLocal,
              vntId:vntId,
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
    await fetchMetadataWithCache().then((result) => {
      const { statusCode,data } = result
      if(statusCode==200){
      let newValues=[]
      Object.values(data.SCHEDULE_TYPE).map(item=>{
        let value = {
          value:item.scheduleType,
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
      })
      }else{
        setScheduleTypes(SCHEDULE_TYPE)
      }
    })
  }

  const onFinish = (values) => {
    setIsLoading(true)
    const newData = {
      licensePlates: normalizePlate(values.licensePlates),
      phone: values.phone,
      fullnameSchedule: values.fullnameSchedule.trim(),
      email: values.email,
      vehicleType: bookingData.vehicleType,
      licensePlateColor: values.licensePlateColor,
      notificationMethod: 'SMS',
      scheduleType: 14,
      vehicleSubCategory: values.vehicleSubCategory,
      vehicleSubType: values.vehicleSubType,
      certificateSeries: values.certificateSeries,
      vehicleForBusiness:values?.vehicleForBusiness,
      vehicleBrandName:values?.vehicleBrandName,
      yearManufacture:moment(values?.yearManufacture).format("YYYY"),
      usagePurposeType:values?.usagePurposeType || undefined,
      specialTransport:values?.specialTransport || undefined,
      vehicleSeatsLimit:values?.vehicleSeatsLimit || undefined,
      supplier:values?.supplier || undefined,
      insuranceDuration:values?.insuranceDuration || undefined,
      insuranceStart:dayStart || undefined,
      insuranceEnd:values?.insuranceEnd || undefined,
      referCode:values?.referCode || undefined,
      discountCode:values?.discountCode || undefined,
      referUserId: referStationId ? undefined : (referUserId || undefined),
      referStationId: referStationId || undefined,
    }
    Object.keys(newData).forEach((key) => {
      if (newData[key] === "") {
        delete newData[key];
      }})
    BookingService.createConsultantSchedule(newData).then((result) => {
      const { error: rsMess, statusCode, data } = result
      if (statusCode != 200) {
        setIsModalErrOpen(true)
        if (Object.keys(SCHEDULE_ERROR).includes(rsMess)) {
          setErrorMessage(SCHEDULE_ERROR[rsMess])
        } else {
          setErrorMessage(SCHEDULE_ERROR.INVALID_REQUEST)
        }
      setTimeout(() => {
        setIsLoading(false)
      }, 500);
      } else {
        setTimeout(() => {
          setIsLoading(false)
        }, 500);
        if(data.paymentUrl && data.paymentUrl.length > 0){
          setTimeout(() => {
            window.open(data.paymentUrl, '_blank')
          }, 500);
        }else{
          setTimeout(() => {
            redirectToInsurancePartner(newData,targetLink)
          }, 500);
        }
        setIsModalOpen(true)
        localStorage.removeItem(addKeyLocalStorage('bookingData'))
        setTimeout(() => {
          setBookingData({})
          form.resetFields();
          form.setFieldsValue({
            vntId:null,
          })
        }, 500);
      }
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
  
  useEffect(() => {
    getDataLocal()
    getMetaData()
    if(dataBookingParam?.vntId){
    } else {
      getAreaByIP()
    }
    if(dataLocal?.supplier){
      let target = Object.values(TTDK_INSURANCE_PARTNER).find(item=>item?.label == dataLocal?.supplier)?.link
      setTargetLink(target)
    } 
    if (!bookingData?.vntId) {
      setTimeout(() => {
        getStationAreas()
      }, 500);
    } else {
      setBookingData({ ...bookingData })
    }
    setDateFilter({
      ...dateFilter,
      vehicleType: Number(dataBookingParam?.vehicleType)||  VEHICLE_SUB_TYPE[0].vehicleType,
    })

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
  },[isLoadDataLocal])


  useEffect(() => {
    if (isZaloApp) {
      form.setFieldsValue({
        "phone": zaloUserPhone,
      })
      saveDataLocal('phone', zaloUserPhone)
    }
  }, [zaloUserPhone, form])

  useEffect(() => {
    if (isZaloApp) {
      form.setFieldsValue({
        "fullnameSchedule": zaloUserName,
      })
      saveDataLocal('fullnameSchedule', zaloUserName)
    }
  }, [zaloUserName, form])

  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  };
  const disabledMonth = (current) => {
    return current && current > moment().endOf('day');
  };
  const handleCheckEndDay=(value,startDay)=>{
    switch (value) {
      case 1:
        setBookingData({
          ...bookingData,
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(1,'year').format('DD/MM/YYYY'),
        })
        form.setFieldsValue({
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(1,'year').format('DD/MM/YYYY'),
        })
        break;
      case 1.5:
        setBookingData({
          ...bookingData,
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(1.5,'year').format('DD/MM/YYYY'),
        })
        form.setFieldsValue({
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(1.5,'year').format('DD/MM/YYYY'),
        })
        break;
      case 2:
        setBookingData({
          ...bookingData,
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(2,'year').format('DD/MM/YYYY'),
        })
        form.setFieldsValue({
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(2,'year').format('DD/MM/YYYY'),
        })
        break;
      case 2.5:
        setBookingData({
          ...bookingData,
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(2.5,'year').format('DD/MM/YYYY'),
        })
        form.setFieldsValue({
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(2.5,'year').format('DD/MM/YYYY'),
        })
        break;
      case 3:
        setBookingData({
          ...bookingData,
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(3,'year').format('DD/MM/YYYY'),
        })
        form.setFieldsValue({
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(3,'year').format('DD/MM/YYYY'),
        })
        break;
      default:
        setBookingData({
          ...bookingData,
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(1,'year').format('DD/MM/YYYY'),
        })
        form.setFieldsValue({
          insuranceEnd: moment(startDay,"DD/MM/YYYY").add(1,'year').format('DD/MM/YYYY'),
        })
        break;
      }
    }
  return (
    <Form
      name="booking"
      layout="vertical"
      initialValues={{}}
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
        >
        <div className="login__input__icon">
        <SelectAntd
            className="cs-select ant-custom booking-input"
            isSearchable={true}
            placeholder="Vui lòng chọn mục đích đặt lịch"
            styles={customStyles}
            options={scheduleTypes}
            disabled={true}
            defaultValue={Number(dataBookingParam?.scheduleType)|| SCHEDULE_TYPE[0].value}
            menuPlacement="top"
            value={bookingData.scheduleType}
            onChange={(values) => {
              saveDataLocal('scheduleType',values)
              form.setFieldsValue({
                scheduleType:values,
              })
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
          <Input defaultValue={normalizePlate(dataBookingParam?.licensePlates || dataLocal?.licensePlates)}
            className="login__input booking-input" 
            style={{textTransform:'uppercase'}} 
            placeholder="59B16856" 
            type="text" 
            readOnly={dataVihcle?.vehicleIdentity}
            size="large"
            onInput={(e) => {
              e.target.value = normalizePlate(e.target.value)
              saveDataLocal('licensePlates', e.target.value)
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
                  }
                  localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
                  handleCategory(values,null)
                  form.setFieldsValue({
                    vehicleType: vehicletype.vehicleType,
                    vehicleSubType: values,
                  })
                  setBookingData({
                    ...bookingData,
                    vehicleType: vehicletype.vehicleType,
                    vehicleSubType: values,
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
                  })
                  setBookingData({
                    ...bookingData,
                    vehicleSubCategory: values,
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
          readOnly={dataVihcle?.certificateSeries}
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
          onChange={(values) => {
            let data = JSON.parse(localStorage.getItem(addKeyLocalStorage('bookingData')))
            let localData={
              ...data,
              vntId:values,
            }
            localStorage.setItem(addKeyLocalStorage('bookingData'), JSON.stringify(localData))
            form.setFieldsValue({
              vntId:values,
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
            })
          }}
          placeholder="Vui lòng chọn khu vực"
          styles={customStyles}
          options={listStationArea}
        />
      </Form.Item>
      <Form.Item
        className="radio-label transport_business"
        label={'Kinh doanh vận tải'}
        name="vehicleForBusiness"
        rules={[
          {
            required: true,
            message: 'Vui lòng chọn'
          }
        ]}>
        <Radio.Group
          size="large"
          onChange={(event) => {
            const value = event.target.value
            saveDataLocal('vehicleForBusiness',value)
            form.setFieldsValue({
              vehicleForBusiness: value,
            })
            setBookingData({
              ...bookingData,
              vehicleForBusiness: value,
            })
          }}
          defaultValue={0}
          style={{ width: '100%' }}>
          <Row>
            <Col md={12}>
              <Radio value={0}>
                Không
              </Radio>
            </Col>
            <Col md={12}>
              <Radio value={1}>
                Có
              </Radio>
            </Col>
          </Row>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="vehicleBrandName"
        label="Hãng xe"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập hãng xe'
          }
        ]}
      >
        <Input
          defaultValue={dataBookingParam?.vehicleBrandName || dataLocal?.vehicleBrandName}
          className="login__input booking-input"
          placeholder="Toyota"
          type="text"
          size="large"
          onInput={(e) => {
            saveDataLocal('vehicleBrandName', e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item
        name="yearManufacture"
        label="Năm sản xuất"
      >
        <DatePicker 
          placeholder="Năm sản xuất"
          disabledDate={disabledMonth}
          onChange={(_, dateString) => {
            setBookingData({
              ...bookingData,
              yearManufacture: dateString,
            })
          }}
          picker="year" />
      </Form.Item>
      <Form.Item
        name="usagePurposeType"
        label="Mục đích sử dụng"
      >
        <SelectAntd
          className='cs-select ant-custom booking-input'
          options={usagePurposeTypeOptions}
          defaultValue={Number(dataBookingParam?.usagePurposeType)|| usagePurposeTypeOptions[0].label}
          value={bookingData.usagePurposeType}
          onChange={(values) => {
            saveDataLocal('usagePurposeType',values)
            form.setFieldsValue({
                usagePurposeType: values,
              })
              setBookingData({
                ...bookingData,
                usagePurposeType: values,
              })
          }}
        />
      </Form.Item>
      <Form.Item
        name="specialTransport"
        label="Loại vận chuyển đặc biệt"
      >
        <SelectAntd
          className='cs-select ant-custom booking-input'
          options={specialTransportOptions}
          defaultValue={Number(dataBookingParam?.specialTransport)|| specialTransportOptions[0].label}
          value={bookingData.specialTransport}
          onChange={(values) => {
            saveDataLocal('specialTransport',values)
            form.setFieldsValue({
                specialTransport: values,
              })
              setBookingData({
                ...bookingData,
                specialTransport: values,
              })
          }}
        />
      </Form.Item>
      <Form.Item
        name="vehicleSeatsLimit"
        label="Số chỗ ngồi"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập số chỗ ngồi'
          }
        ]}
      >
        <Input
          defaultValue={dataBookingParam?.vehicleSeatsLimit || dataLocal?.vehicleSeatsLimit}
          className="login__input booking-input"
          placeholder="Số chỗ ngồi"
          type="text"
          size="large"
          onKeyDown={(e) => {
            if (e.ctrlKey || e.metaKey || e.key.includes('Arrow')) {
              return;
            }

            const regex = /^[0-9]*$/;
            if (!regex.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
              e.preventDefault();
            }
          }}
          onInput={(e) => {
            saveDataLocal('vehicleSeatsLimit', e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item
        className="radio-label"
        label={'Nhà cung cấp'}
        name="supplier"
        rules={[
          {
            required: true,
            message: 'Vui lòng chọn'
          }
        ]}>
        <Radio.Group
          size="large"
          onChange={(event) => {
            const value = event.target.value
            saveDataLocal('supplier',value)
            form.setFieldsValue({
              supplier: value,
            })
            setBookingData({
              ...bookingData,
              supplier: value,
            })
            let target = Object.values(TTDK_INSURANCE_PARTNER).find(item=>item?.label == value)?.link
            setTargetLink(target)
          }}
          defaultValue={1}
          style={{ width: '100%' }}>
          <Row style={{gap:'10px',display:'grid',gridTemplateColumns:'1fr 1fr'}}>
            {Object.values(TTDK_INSURANCE_PARTNER).map(item=>(
              <div className='supplier-item'>
                <Radio value={item?.label}>
                  <div className='d-flex' style={{alignItems:'center',gap:'10px'}}>
                    <div>
                      {item?.icon}
                    </div>
                    <div>
                      {item?.label}
                    </div>
                    {item?.note && (
                      <div className='supplier-item-note'>
                        Có hiệu lực ngay
                      </div>
                    )}
                  </div>
                </Radio>
              </div>
            ))}
          </Row>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="insuranceDuration"
        label="Thời hạn bảo hiểm"
      >
        <SelectAntd
          className='cs-select ant-custom booking-input'
          options={insuranceDurationOptions}
          defaultValue={Number(dataBookingParam?.insuranceDuration)|| insuranceDurationOptions[0].label}
          value={bookingData.insuranceDuration}
          onChange={(values) => {
            saveDataLocal('insuranceDuration',values)
            form.setFieldsValue({
              insuranceDuration: values,
            })
            setBookingData({
              ...bookingData,
              insuranceDuration: values,
            })
            if(dayStart){
              handleCheckEndDay(values||1,dayStart)
            }
          }}
        />
      </Form.Item>
      <Row className='vehicleType mt-3'>
        <Col className='mWidth-100' span={11}>
          <Form.Item
            className="radio-label"
            label="Từ ngày"
            name="insuranceStart"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn ngày'
              }
            ]}>
            <DatePicker 
              placeholder="Từ ngày"
              disabledDate={disabledDate}
              format={'DD/MM/YYYY'}
              onChange={(_, dateString) => {
                setBookingData({
                  ...bookingData,
                  insuranceStart: dateString,
                })
                setDayStart(dateString)
                handleCheckEndDay(bookingData?.insuranceDuration||1,dateString)
              }}
            />
          </Form.Item>
        </Col>
        <Col span={2}></Col>
        <Col className='mWidth-100' span={11}>
          <Form.Item
            className="radio-label"
            label="Đến ngày"
            name="insuranceEnd"
            >
            <Input
              value={bookingData?.insuranceEnd}
              disabled
              className="login__input booking-input"
              placeholder="Đến ngày"
              type="text"
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="referCode"
        label="Mã giới thiệu"
      >
        <Input
          defaultValue={dataBookingParam?.referCode || dataLocal?.referCode}
          className="login__input booking-input"
          placeholder="TTDK..."
          type="text"
          size="large"
          onInput={(e) => {
            saveDataLocal('referCode', e.target.value);
          }}
        />
      </Form.Item>
      <Form.Item
        name="discountCode"
        label="Mã giảm giá"
      >
        <Input
          defaultValue={dataBookingParam?.discountCode || dataLocal?.discountCode}
          className="login__input booking-input"
          placeholder="TTDK_20"
          type="text"
          size="large"
          onInput={(e) => {
            saveDataLocal('discountCode', e.target.value);
          }}
        />
      </Form.Item>
      <div className="w-100 d-flex justify-content-center mgt-40">
        <Button className="login__button df" type="primary" htmlType="submit" size="large">
          Đặt lịch
        </Button>
      </div>
      <BookingSuccess isModalOpen={isModalOpen} setTabKey={setTabKey} setIsModalOpen={setIsModalOpen} onClose={() => {setIsModalOpen(false);window.location.reload()}}></BookingSuccess>
      {isModalErrOpen &&
        <PopupMessage isModalOpen={isModalErrOpen} onClose={() => {setIsModalErrOpen(false)}} text={errorMessage} ></PopupMessage>
      }
      {isLoading && (
        <div className="loading">
          <div className='text-center'>
            <MainLogo height={60} width={60}></MainLogo>
            <Spin style={{ width: '100%' }}  className='mt-3'/>
          </div>
        </div>
      )}
    </div>
    )}
    </Form>
  )
}

export default BookingInsurancePartnerForm
