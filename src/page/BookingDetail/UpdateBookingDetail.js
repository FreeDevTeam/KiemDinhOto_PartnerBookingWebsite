import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Select as SelectAntd, Row, Col, Spin } from 'antd'
import { xoa_dau } from '../../helper/common'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'
import _, { filter } from 'lodash'
import moment from 'moment'
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
import { useLocation, useHistory } from 'react-router-dom'
import { validatorPlateNumber } from '../../helper/validatorPlateNumber'
import { ReactComponent as LogoTTDK } from './../../assets/icons/Logo.svg'
import BookingDatePicker from '../../components/BookingDatePicker'
import BookingHoursPicker from '../../components/BookingHoursPicker'
import PopupMessage from '../BookingPartner/PopupMessage'
import { SCHEDULE_TITLE } from '../../constants/serviceOption'
import BookingService from '../../services/addBookingService'

function UpdateBookingDetail() {
  // Nhả thêm

  // Phần data từ history
  const location = useLocation()
  const state = location.state // Truy cập vào state

  // Phần state
  const [form] = Form.useForm()
  const [errorMessage, setErrorMessage] = useState('')
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [bookingData, setBookingData] = useState({})
  const [listBookingTime, setListBookingTime] = useState([])
  const [listBookingDate, setListBookingDate] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [vehicleSubCategoryOptions, setVehicleSubCategoryOptions] = useState([])
  const [data, setData] = useState(state?.data || {}) // Lấy data từ state
  const [scheduleTypes, setScheduleTypes] = useState([])
  const [listStationArea, setListStationArea] = useState([])
  const [listStation, setListStation] = useState([])
  const [dateFilter, setDateFilter] = useState({
    stationsId: data?.stationsId,
    startDate: moment().format(DATE_DISPLAY_FORMAT),
    endDate: moment().endOf('month').format(DATE_DISPLAY_FORMAT),
    vehicleType: data?.vehicleType
  })
  // API
  function getStationAreas() {
    BookingService.getStationAreaList()
      .then((data) => {
        if (data.statusCode == 505) {
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

  const getDateForBooking = () => {
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
                if (element.scheduleDateStatus !== 0)
                  element.label = (
                    <div className="d-flex ai-c j-sb w-100">
                      <span>{element.scheduleDate}</span>
                      <span className="text-primary">
                        12sdsadsakdsadsads
                        {/* {getDisplayTextByScheduleDateStatus(element)} */}
                      </span>
                    </div>
                  )
                element.value = element.scheduleDate
              })
              setListBookingDate(tmp)
            }
          } else {
            setListBookingDate([])
            setListBookingTime([])
          }
        }
      })
      .catch(() => {})
      .finally(() => {
      })
  }

  const getTimesByDateForBooking = (date) => {
    const paramsForGetTimes = {
      stationsId: data?.stationsId,
      date: "27/03/2025",
      vehicleType: data?.vehicleType
    }
    BookingService.getBookingHours(paramsForGetTimes)
      .then((data) => {
        if (data.statusCode == 505) {
          // setErrorMessage('Sai thông tin kết nối. Vui lòng kiểm tra lại')
          // setIsModalErrOpen(true)
        } else {
          if (data.length > 0) {
            let tmp = data || []
            if (tmp.length > 0) {
              tmp.forEach((element) => {
                element.label = element.scheduleTime
                element.value = element.scheduleTime
              })
              console.log('tmp', tmp)
              setListBookingTime(tmp)
            }
          } else {
            setListBookingTime([])
          }
        }
      })
      .catch(() => {})
      .finally(() => {
      })
  }

  // Phần useEffect
  useEffect(() => {
    setScheduleTypes(SCHEDULE_TYPE)
    getStationAreas()
    getDateForBooking()
    getTimesByDateForBooking()
  }, [])

  // Lấy danh sách trạm tương ứng với khu vực đã chọn
  useEffect(() => {
    const vntId = form.getFieldValue('vntId')
    if (vntId) {
      const paramOfGetListStation = {
        filter: {
          scheduleType: data?.scheduleType,
          stationArea: vntId
        }
      }
      BookingService.getStationList(paramOfGetListStation)
        .then((data) => {
          if (data.statusCode !== 505) {
            let tmp = Array.isArray(data.data) ? data.data : []
            if (tmp.length > 0) {
              tmp.forEach((element) => {
                element.label = <div style={{ fontWeight: 'normal' }}>{element?.stationsName}</div>
                element.value = element.stationsId
              })
            }
            setListStation(tmp)
          }
        })
        .catch((error) => {
          console.error(error)
          setErrorMessage('Lấy thông tin trạm thất bại.')
          setIsModalErrOpen(true)
        })
    }
  }, [form.getFieldValue('vntId')])

  // Kết thúc

  const customStyles = {
    control: (base) => ({
      ...base,
      height: 48,
      minHeight: 35,
      fontSize: 14
    })
  }

  const onFinish = (values) => {
    console.log('values', values)
  }

  return (
    <div className="detail-sche" style={{ maxWidth: 600, margin: 'auto', padding: '10px' }}>
      <Form
        onFinish={onFinish}
        name="booking"
        layout="vertical"
        initialValues={{
          fullnameSchedule: data?.fullnameSchedule,
          phone: data?.phone,
          licensePlates: data?.licensePlates,
          vehicleSubType: data?.vehicleType,
          dateSchedule: data?.dateSchedule,
        }}
        form={form}>
        {() => (
          <div>
            <Form.Item name="fullnameSchedule" label="Họ và tên chủ xe" hidden={false}>
              <Input className="login__input booking-input" type="text" size="large" readOnly={true} />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" hidden={false}>
              <Input className="login__input booking-input" placeholder="Nhập số điện thoại" type="text" size="large" readOnly={true} />
            </Form.Item>

            <Form.Item hidden={false} name="scheduleType" label="Mục đích đặt hẹn">
              <div className="login__input__icon">
                <SelectAntd
                  className="cs-select ant-custom booking-input"
                  readOnly={true}
                  disabled={true}
                  styles={customStyles}
                  options={scheduleTypes}
                  menuPlacement="top"
                  value={data?.scheduleType}
                />
              </div>
            </Form.Item>

            <Form.Item name="licensePlates" label="Biển số xe" hidden={false}>
              <div className="login__input__icon">
                <Input
                  className="login__input booking-input"
                  style={{ textTransform: 'uppercase' }}
                  placeholder="59B16856"
                  type="text"
                  size="large"
                  readOnly={true}
                  value={data?.licensePlates}
                />
              </div>
            </Form.Item>
            <Form.Item name="licensePlateColor" label="Màu biển số" hidden={false}>
              <div className="login__input__icon">
                <SelectAntd
                  className="cs-select ant-custom booking-input"
                  placeholder="Vui lòng chọn màu biển số"
                  styles={customStyles}
                  menuPlacement="top"
                  options={PLATE_COLOR}
                  value={data?.licensePlateColor}
                  disabled={true}
                />
              </div>
            </Form.Item>
            <Row className="vehicleType mt-3">
              <Col className="mWidth-100" span={11}>
                <Form.Item
                  className="radio-label"
                  label="Loại phương tiện"
                  name="vehicleSubType"
                  hidden={false}
                  rules={[
                    {
                      required: false,
                      message: 'Vui lòng nhập'
                    }
                  ]}>
                  <SelectAntd disabled={true} className="cs-select ant-custom booking-input" options={VEHICLE_SUB_TYPE} />
                </Form.Item>
              </Col>
              <Col span={2}></Col>
              <Col className="mWidth-100" span={11}>
                <Form.Item
                  className="radio-label"
                  label="Phân loại"
                  name="vehicleSubCategory"
                  hidden={false}
                  rules={[
                    {
                      required: false,
                      message: 'Vui lòng chọn phân loại'
                    }
                  ]}>
                  <SelectAntd
                    className="cs-select ant-custom booking-input"
                    options={vehicleSubCategoryOptions}
                    value={bookingData.vehicleSubCategory}
                    onChange={(values) => {}}
                  />
                </Form.Item>
              </Col>
            </Row>
            {/* <Form.Item
        name="certificateSeries"
        extra={'Nhập số seri GCN để được tự động kiểm tra phạt nguội'}
        hidden={false}
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
            required: false,
            message: 'Vui lòng nhập số seri GCN'
          },
          {
            message: 'Số seri GCN không hợp lệ',
            pattern: new RegExp(/^([a-zA-Z]{2})+(-(?!-))+([0-9]{7}\b)$/),
          },
        ]}>
        <Input
          className="login__input"
          placeholder="Ví dụ: KA-7461980"
          type="text"
          style={{textTransform:'uppercase'}}
          size="large"
        />
      </Form.Item> */}
            <Form.Item label="Khu vực" name="vntId" rules={[]} hidden={false}>
              <SelectAntd
                className="cs-select ant-custom booking-input"
                filterOption={(input, option) => {
                  return xoa_dau((option?.value ?? '').toLowerCase()).includes(xoa_dau(input.toLowerCase()))
                }}
                showSearch
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
                    required: true,
                    message: 'Vui lòng nhập'
                  }
                ]}
                hidden={false}>
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
                />
              </Form.Item>
            </span>
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
              disabled={!data.stationsId}
              loading={false}
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
                form.setFieldsValue({
                  dateSchedule:values,
                  time: null
                })
                const  stationsId  = data?.stationsId
                if (stationsId && bookingData) {
                  getTimesByDateForBooking({
                    stationsId: stationsId,
                    date: values,
                    vehicleType: bookingData.vehicleType
                  })
                }
              }}
              listBookingDate={listBookingDate}
            />
            </Form.Item>
            <Form.Item
              label="Giờ hẹn"
              name="time"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập'
                }
              ]}>
            <BookingHoursPicker
              loading={false}
              selectedTime={form.getFieldValue('time')}
              setSelectedTime={(values) => {
                form.setFieldsValue({
                  time: values
                })
              }}
              listBookingTime={listBookingTime}
            />
            </Form.Item>
            <div className="w-100 d-flex justify-content-center mgt-40">
              <Button className="login__button df" type="primary" htmlType="submit" size="large">
                Cập nhật
              </Button>
            </div>
            {/* <BookingSuccess isModalOpen={isModalOpen} scheduleType={scheduleTypePopUp} setTabKey={setTabKey} setIsModalOpen={setIsModalOpen} onClose={() => {
        setIsModalOpen(false)
        // window.location.reload()}
        history.goBack()
        }}></BookingSuccess> */}
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
