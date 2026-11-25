import React, { useEffect, useState } from 'react'
import { Form, message, Col, Checkbox, Row, Spin } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import _ from 'lodash'
import { SCHEDULE_ERROR } from './../../constants/errorMessage'
import BookingService from './../../services/addBookingService'
import BookingSuccess from './BookingSuccessModal'
import { useHistory } from 'react-router-dom'
import { getPrepaidRedirect } from '../../helper/orderPayment'
import DefaultButton from './../../components/elements/button'
import CheckboxConfig from './../../components/shared/checkbox/checkbox'
import { PAYMENT_OBJECT, VEHICLE_SUB_CATEGORY } from './../../constants/global'
import './index.scss'
import PopupMessage from './../BookingPartner/PopupMessage'
function BookingAdditionalInfo({ data, setStep }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [scheduleId, setScheduleId] = useState()
  const [listServices, setListServices] = useState([])
  const [detail, setDetail] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const history = useHistory()
  const [form] = Form.useForm()
  const stationsId = data.stationsId
  const enablePaymentMethods = detail?.stationPayments?.map((item) => {
    return String(item)
  })


  const getDetailStation = (stationsId) => {
    BookingService
      .getDetailStation({
        id: stationsId
      })
      .then((res) => {
        setDetail(res)
      })
  }

  useEffect(() => {
    getDetailStation(stationsId)
  }, [stationsId])

  const handleBooking = (additionalData) => {
    setIsVisible(false)
    const newData = {
      licensePlates: data.vehicleIdentity,
      phone: data.phone,
      fullnameSchedule: data.fullnameSchedule,
      email: data.email,
      dateSchedule: data.dateSchedule,
      time: data.time,
      stationsId: data.stationsId,
      vehicleType:data.vehicleType,
      licensePlateColor: data.licensePlateColor,
      notificationMethod: 'SMS',
      scheduleType: data.scheduleType,
      ...additionalData
    }

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
      } else {
        // Dịch vụ thu tiền trước: chưa có lịch, mở màn chi tiết đơn hàng thay vì báo đặt lịch thành công
        const prepaidRedirect = getPrepaidRedirect(data)
        if (prepaidRedirect.isPrepaid) {
          if (prepaidRedirect.path) {
            history.push(prepaidRedirect.path)
          } else {
            setIsModalErrOpen(true)
            setErrorMessage(SCHEDULE_ERROR.INVALID_REQUEST)
            setIsVisible(false)
          }
          return
        }
        setScheduleId(data[0])
        setIsModalOpen(true)
      }
    })
    setIsVisible(true)
  }

  const onFinish = (values) => {
    let value={
      ...values,
      scheduleNote:values?.scheduleNote?.trim()
    }
    delete values.vehicleRegistrationImage
    handleBooking(value)
  }

  return (
    <div className="bg-white" style={{ maxWidth: 600, margin: 'auto', padding: '10px 15px' }}>
      <Form layout="vertical" className="custom-form" name="form" onFinish={onFinish} form={form}>
        { listServices.length > 0 ? <Form.Item name="stationServicesList" label="Dịch vụ theo yêu cầu">
          <Checkbox.Group
            style={{
              width: '100%'
            }}>
            <Row>
              {listServices?.map((item) => (
                <Col span={24} className="mb-2">
                  <CheckboxConfig value={item.stationServicesId}>{item.serviceName}</CheckboxConfig>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item> : ""}
          {enablePaymentMethods?.length > 0 && (
        <Form.Item label="Các hình thức thanh toán tại trung tâm">
            <div>
              <div className="">
                <Row className="wrap-payment-schedule">
                  {Object.keys(PAYMENT_OBJECT).map((_method) => {
                    if (enablePaymentMethods?.indexOf(PAYMENT_OBJECT[_method].id.toString()) > -1) {
                      const isCash = PAYMENT_OBJECT[_method].value === 'cash';
                      return (
                        <div className="height-mobile">
                          <span className="flex-center mgt-15 wrap-icon" style={{maxWidth:'83px',height:'100px',width:'100%'}}>{PAYMENT_OBJECT[_method].icon}</span>
                          <div className="fs-10 flex-center wrap-label">{PAYMENT_OBJECT[_method].label}</div>
                        </div>
                      )
                    } else {
                      return <></>
                    }
                  })}
                </Row>
              </div>
            </div>
        </Form.Item>
          )}
        <Form.Item label="Ghi chú" name="scheduleNote">
          <TextArea rows={4} placeholder="Ghi chú thêm thông tin xe (ví dụ: độ xe, cơi nới thùng.v...v)" />
        </Form.Item>
        <DefaultButton className="mgt-15" colorType="dark" title="Xác nhận" action={form.submit} />
      </Form>
      <BookingSuccess isModalOpen={isModalOpen} setStep={setStep} phoneNumber={data.phone} setIsModalOpen={setIsModalOpen} history={history} scheduleId={scheduleId} onClose={() => setIsModalOpen(false)} />
      {isModalErrOpen &&
      <PopupMessage isModalOpen={isModalErrOpen} history={history}  onClose={() => {setIsModalErrOpen(false)}} text={errorMessage} ></PopupMessage>
      }
      {isVisible && (
        <div className="loading">
          <Spin />
        </div>
      )}
    </div>
  )
}

export default BookingAdditionalInfo
