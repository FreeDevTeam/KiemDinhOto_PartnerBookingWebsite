import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Select as SelectAntd, Row, Col, Spin, Radio, Tag, DatePicker } from 'antd'
import BookingService from '../../services/addBookingService'
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
import { validatorPlateNumber } from '../../helper/validatorPlateNumber'
import { ReactComponent as LogoTTDK } from './../../assets/icons/Logo.svg'
import PopupMessage from '../BookingPartner/PopupMessage'
import BookingSuccess from '../BookingPartner/BookingSuccessModal'
import redirectToInsurancePartner from './redirectToInsurancePartner'



function BookingInsuranceSaladinForm({form, setTabKey, zaloUserName,zaloUserPhone}) {
  const isZaloApp = (process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1)
  const location = useLocation();
  const dataVihcle=location.state || {}
  console.log(dataVihcle);
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  const dataLocal=JSON.parse(localStorage.getItem(addKeyLocalStorage('bookingData')))
  const [customerParam, setCustomerParam] = useState({filter: {} })
  const [errorMessage, setErrorMessage] = useState('')
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [bookingData, setBookingData] = useState({})
  const [localBookingData, setLocalBookingData] = useState(dataLocal)
  const [licensePlateColor, setLicensePlateColor] = useState(PLATE_COLOR)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadDataLocal, setIsLoadDataLocal] = useState(false)
  const [targetLink, setTargetLink] = useState('')
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
    certificateSeries:dataVihcle?.certificateSeries ||  params.get('certificateSeries'),
    licensePlateColor:Number(dataLocal?.licensePlateColor) || Number(params.get('licensePlateColor')) || PLATE_COLOR[0].value,

  }
  const customStyles = {
    control: (base) => ({
      ...base,
      height: 48,
      minHeight: 35,
      fontSize: 14
    })
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
      certificateSeries:dataVihcle?.certificateSeries ||  localBookingData?.certificateSeries || params.get('certificateSeries'),
      licensePlateColor: Number(dataBookingParam?.licensePlateColor) || Number(params.get('licensePlateColor')),

    })
    setIsLoadDataLocal(true)
  }

  const onFinish = (values) => {
    setIsLoading(true)
    const newData = {
      licensePlates: values.licensePlates.toUpperCase(),
      phone: values.phone,
      fullnameSchedule: values.fullnameSchedule.trim(),
      email: values.email,
      notificationMethod: 'SMS',
      certificateSeries: values.certificateSeries,
      licensePlateColor: values.licensePlateColor,
      scheduleType:14,
      vehicleType:dataVihcle?.vehicleType,
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
        let redirectData={
          ...newData,
          chassis:dataVihcle?.vehicleRegistrationCode
        }
        redirectToInsurancePartner(redirectData)
        // setIsModalOpen(true)
        localStorage.removeItem(addKeyLocalStorage('bookingData'))
        setTimeout(() => {
          setBookingData({})
          form.resetFields();
        }, 500);
      }
    })
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
    if(dataLocal?.supplier){
      let target = Object.values(TTDK_INSURANCE_PARTNER).find(item=>item?.label == dataLocal?.supplier)?.link
      setTargetLink(target)
    } 
    setDateFilter({
      ...dateFilter,
      vehicleType: Number(dataBookingParam?.vehicleType)||  VEHICLE_SUB_TYPE[0].vehicleType,
    })
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

  return (
    <Form
      name="booking"
      layout="vertical"
      initialValues={{}}
      form={form}
      onFinish={(values) => { onFinish(values) }}>
      {() => (
        <div>
          <div className='form-body'>
            <div>Thông tin xe</div>
            <Form.Item
              name="fullnameSchedule"
              label="Họ và tên"
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
            <Row className='contact mt-3'>
              <Col lg={11} md={24} sm={24}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    {
                      required: !isZaloApp,
                      message: 'Vui lòng nhập email'
                    },
                    {
                      required: dataBookingParam?.require_phoneNumber === 'false' ? false : true,
                      message: 'Vui lòng nhập email'
                    },
                    {
                      message: 'Email không hợp lệ',
                      pattern: new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
                    },
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
                      saveDataLocal('email', e.target.value)
                    }} />
                </Form.Item>
              </Col>
              <Col  lg={2} md={0} sm={0}></Col>
              <Col lg={11} md={24} sm={24}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    {
                      required: !isZaloApp,
                      message: 'Vui lòng nhập số điện thoại'
                    },
                    {
                      required: dataBookingParam?.require_phoneNumber === 'false' ? false : true,
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
              </Col>
            </Row>
            
            <Form.Item name="licensePlates" 
              label="Biển số xe"
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
                  // readOnly={dataVihcle?.vehicleIdentity}
                  size="large"
                  onInput={(e)=>{
                    e.target.value = e.target.value.toUpperCase().replace(/\s/g, '')
                    saveDataLocal('licensePlates',e.target.value)
                  }} />
              </div>
            </Form.Item>
            <Form.Item
              name="licensePlateColor"
              label="Màu biển số"
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
            <Form.Item
              name="certificateSeries"
              // extra={'Nhập số seri GCN để được tự động kiểm tra phạt nguội'}
              label={
                <div>
                  Số seri đăng kiểm
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
                {
                  message: 'Số seri GCN phải có dấu "-". Ví dụ: KA-42521XX ',
                  pattern: new RegExp(/^([a-zA-Z]{2})+(-(?!-))/),
                },
              ]}>
              <Input
                className="login__input"
                defaultValue={ dataBookingParam?.certificateSeries || dataLocal?.certificateSeries}
                placeholder="Ví dụ: KA-7461980"
                type="text"
                style={{textTransform:'uppercase'}}
                size="large"
                // readOnly={dataVihcle?.certificateSeries}
                onInput={(event) => {
                  event.target.value = event.target.value.toUpperCase().replace(/\s/g, '')
                  saveDataLocal('certificateSeries',event.target.value)
                }}
              />
            </Form.Item>
          </div>
          <div className='note-text'>Khi bấm Tiếp tục, bạn đồng ý cho TTDK và Saladin (10X) sử dụng thông tin mà bạn đã cung cấp để phục vụ mục đích marketing và giới thiệu sản phẩm.</div>
          <div className="w-100 d-flex justify-content-center">
            <Button className="_button df"  htmlType="submit" size="large">
              Mua ngay
            </Button>
          </div>
          <BookingSuccess isModalOpen={isModalOpen} setTabKey={setTabKey} setIsModalOpen={setIsModalOpen} onClose={() => {setIsModalOpen(false);window.location.reload()}}></BookingSuccess>
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

export default BookingInsuranceSaladinForm
