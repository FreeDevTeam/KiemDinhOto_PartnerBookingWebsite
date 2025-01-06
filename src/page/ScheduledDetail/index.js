import React, { useEffect, useState } from 'react'
import './index.scss'
import { Tag, Row,message,Button, Modal, Spin,Pagination,Empty,Radio,Space,Input } from 'antd'
import { VEHICLE_SUB_TYPE,VIHCLE_TYPES, SCHEDULE_STATUS, CUSTOMER_RECEIPT_STATUS, CUSTOMER_RECEIPT_STATUS_TO_TEXT, PAYMENT_OBJECT } from './../../constants/global'
import _ from 'lodash'
import { changeTime } from '../../helper/changeTime'
import { useHistory } from 'react-router-dom'
import moment from 'moment'
import { QRCodeCanvas } from 'qrcode.react'
import BookingService from './../../services/addBookingService'
import PopupMessage from '../BookingPartner/PopupMessage'

const { TextArea } = Input

const listtype = {
  view: "view"
}

const appTheme=process.env.REACT_APP_THEME_NAME
const DetailScheduledComponent = ({
  status,
  customerScheduleId,
  contentHeader = <></>,
  isHeader = true,
  getData
}) => {
  let wab = []
  const [data,setData]=useState([])
  const [isModal, setIsModal] = useState(false)
  const [vali, setVali] = useState(false)
  const [reasonRateCancelSchedule, setReasonRateCancelSchedule] = useState(null)
  const [reasonNoteCancelSchedule, setReasonNoteCancelSchedule] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  
  const handleCancel = () => {
    setIsModal(false);
  };
  const onChangeReasonRateCancelSchedule = (e) => {
    setReasonRateCancelSchedule(e.target.value)
  }

  const handleCheck = (customerScheduleId) => {
    if ((reasonNoteCancelSchedule || reasonRateCancelSchedule) !== null) {
      setIsModal(true)
      BookingService.cancelBooking({
        customerScheduleId: customerScheduleId,
        reason: reasonNoteCancelSchedule || reasonRateCancelSchedule
      }).then((result) => {
        const { isSuccess, data } = result
        if (!isSuccess || !data) {
          setErrorMessage('Hủy lịch thất bại. Vui lòng liên hệ CSKH để được hỗ trợ')
          setIsModalErrOpen(true)
        } else {
          setErrorMessage('Hủy lịch hẹn thành công')
          setIsModalErrOpen(true)
          setIsModal(false)
          getScheduleDetail()
          getData()
        }
      })
    } else {
      setVali(true)
    }
  }
  const enablePaymentMethods = data?.station?.stationPayments ? data?.station?.stationPayments.split(',') : [];
  const ENABLE_PAYMENT_GATEWAY =
    process.env.REACT_APP_ENABLE_PAYMENT * 1 === 1 &&
    enablePaymentMethods.length > 0 && // trạm bật phương thức thanh toán
    data?.station?.enablePaymentGateway === 1 && // trạm bật thanh toán
    // (data?.CustomerScheduleStatus === status.confirmed) && // lịch chưa hoàn tất
    data?.order?.paymentStatus !== CUSTOMER_RECEIPT_STATUS.SUCCESS && // chưa hoàn tất thanh toán
    data?.order?.totalPayment > 0 // số tiền phải > 0

  const isViewDetails =
    process.env.REACT_APP_ENABLE_PAYMENT * 1 === 1 &&
    (enablePaymentMethods.length === 0 || data?.station?.enablePaymentGateway === 0) && // trạm bật phương thức thanh toán
    // (data?.CustomerScheduleStatus === status.confirmed) && // lịch chưa hoàn tất
    data?.order?.paymentStatus !== CUSTOMER_RECEIPT_STATUS.SUCCESS && // chưa hoàn tất thanh toán
    data?.order?.totalPayment > 0 // số tiền phải > 0

  const dataTime = data?.station?.stationWorkTimeConfig
  if (dataTime) {
    wab = JSON.parse(data?.station?.stationWorkTimeConfig)
  }

  const getScheduleDetail=()=>{
    BookingService.getBookingDetail(customerScheduleId).then((result) => {
      const { isSuccess, message, data } = result
      if (!isSuccess || !data) {
        return
      } else {
        setData(data)
      }
    })
  }
  useEffect(()=>{
    getScheduleDetail()
  },[])
  const history = useHistory()
  const BindPlate = ({ type, number }) => {
    const colors = {
      1: '#fffff',
      2: '#0050B3',
      3: '#FFC53D',
      4: '#FF4D4F'
    }
    return (
      <Tag className="plate-tag white" color={colors[type]} style={colors[type] === colors[2] ? { color: '#fff' } : {}}>
        {number}
      </Tag>
    )
  }
  function getVehicleTypeName(vehicleData){
    const vehicleType = vehicleData?.vehicleType
    let vehicle
    if(vehicleType){
      vehicle = VIHCLE_TYPES.find((e) => e.value == vehicleType)?.label
      return vehicle
    }else{
      if(vehicleType){
        vehicle = VIHCLE_TYPES.find((e) => e.value == vehicleType?.vehicleType)?.label
        return vehicle
      }else{
      return ('Phương tiện khác')
      }
    }
    return ('Phương tiện khác')
  }

  return (
    <div className="detail-sche" style={{marginTop: isHeader ?'30px' : '0px'}}>
     {isHeader && <div className="heads">
        Thông tin lịch hẹn
      </div>}
      <div className="content">
        <div className="box">
          <div className="title-i">Nơi đặt chỗ</div>
          <div className="text-i">
            {data?.station?.stationsName} - {data?.station?.stationsAddress}
          </div>
        </div>
        <div className="d-flex j-sb mgt-15">
          <div className="box w-50">
            <div className="title-i">Họ và tên</div>
            <div className="text-i">{data?.fullnameSchedule}</div>
          </div>
          <div className="box w-50">
            <div className="title-i">Số điện thoại</div>
            <div className="text-i">{data?.phone}</div>
          </div>
        </div>
        <div className="d-flex j-sb mgt-15">
          {data?.licensePlates ? (
            <div className="box w-50">
              <div className="title-i">Biển số xe</div>
              <div className="text-i">
                {' '}
                <BindPlate type={data?.licensePlateColor} number={data?.licensePlates} />
              </div>
            </div>
          ):(<div className="box w-50">
              <div className="title-i">Ngày</div>
              <div className="text-i">{data?.dateSchedule}</div>
            </div>)
          }
          <div className="box w-50">
            <div className="title-i">Loại phương tiện</div>
            <div className="text-i">{getVehicleTypeName(data)}</div>
          </div>
        </div>
        {data?.time && 
          <div className="d-flex j-sb mgt-15">
            <div className="box w-50">
              <div className="title-i">Ngày</div>
              <div className="text-i">{data?.dateSchedule}</div>
            </div>
            <div className="box w-50">
              <div className="title-i">Giờ</div>
              <div className="text-i">{changeTime(data?.time)}</div>
            </div>
          </div>
        }
        <div className="d-flex j-sb mgt-15">
          {data?.scheduleCode && (
            <div className="box w-50">
              <div className="title-i">Mã đặt vé</div>
              <div className="text-i detail-sche-scheduleCode">{data?.scheduleCode}</div>
            </div>
          )}
        </div>

        {data?.station?.enablePaymentGateway === 1 && (
          <div>
            {data?.order?.paymentStatus !== CUSTOMER_RECEIPT_STATUS.SUCCESS ? (
              <>
                <div className="d-flex j-sb mgt-15">
                  {data?.order?.totalPayment > 0 && (
                    <div className="box">
                      <div className="title-i">Chi phí dự kiến</div>
                      <div className="text-i">
                        {data?.order?.totalPayment?.toLocaleString()}
                      </div>
                      <div className="text-i">
                        <i>Ghi chú: Trên đây chỉ là chi phí dự kiến mang tính tham khảo.</i>
                      </div>
                    </div>
                  )}
                </div>
                {data?.stationServices?.length > 0 && (
                  <div className="mgt-15">
                    <div className="">
                      <div className="title-i mb-2">Dịch vụ lịch hẹn</div>
                      <ul>
                        {data.stationServices.map((item, index) => (
                          <li key={index} className="text-i">
                            {item.serviceName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {ENABLE_PAYMENT_GATEWAY && (
                  <div className="mgt-15">
                    <div className="">
                      <div className="title-i">Hỗ trợ thanh toán</div>
                      <Row className="row">
                        {Object.keys(PAYMENT_OBJECT).map((_method) => {
                          if (enablePaymentMethods.indexOf(PAYMENT_OBJECT[_method].id.toString()) > -1) {
                            return (
                              <div style={{ height: '60px' }} className="col-12 col-md-6 d-flex align-items-center payment-icon">
                                <div style={{ width: '53px', height: '60px' }} className="d-flex align-items-center">
                                  {PAYMENT_OBJECT[_method].icon}
                                </div>
                                <div className="ms-1" style={{ fontSize: 14 }}>
                                  {PAYMENT_OBJECT[_method].label}
                                </div>
                              </div>
                            )
                          } else {
                            return <></>
                          }
                        })}
                      </Row>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="d-flex j-sb mgt-15">
                <div className="box w-50">
                  <div className="title-i">Trạng thái thanh toán</div>
                  <div className="text-i">{CUSTOMER_RECEIPT_STATUS_TO_TEXT[data?.order?.paymentStatus?.toUpperCase()] || ''}</div>
                </div>
                <div className="box w-50">
                  <div className="title-i">Thời gian thanh toán</div>
                  <div className="text-i">{moment(data?.order?.approveDate || new Date()).format('DD/MM/YYYY HH:mm:ss')}</div>
                </div>
              </div>
            )}
          </div>
        )}
        {contentHeader}
        <a target="_blank" style={{marginTop:'1rem'}} href="https://youtu.be/mpIQeRGv3Lg?feature=shared" className="">Xem thêm hướng dẫn quy trình đăng kiểm</a>
      </div>
        {data?.CustomerScheduleStatus != 20 ?
          <div className="w-100 d-flex justify-content-center">
            <Button className="cancel-schedule" type="primary" onClick={()=>{setIsModal(true)}} size="larger">
              Hủy lịch hẹn
            </Button>
          </div>
          : <></>
        }
      <Modal title="Hủy Lịch hẹn" open={isModal} onCancel={()=>handleCancel()} className={ `${isHeader ? '' : 'my-modal' } popup-cancel`}>
      <div style={{ maxWidth: 600, margin: 'auto', padding: '0 30px', minHeight: '400px', paddingTop: 30 }}>
          <div>
            <strong>Lý do huỷ lịch:</strong>

            <div className="box-form">
              <Radio.Group
                onChange={(e) => {
                  setVali(false)
                  onChangeReasonRateCancelSchedule(e)
                }}
                value={reasonRateCancelSchedule}>
                <Space direction="vertical">
                  <Radio value={'Tôi đặt nhầm thời gian / địa điểm.'} style={{ color: '#909090',padding:"8px 0" }}>
                    Tôi đặt nhầm thời gian / địa điểm
                  </Radio>
                  <Radio value={'Trung tâm từ chối lịch của tôi.'} style={{ color: '#909090',padding:"8px 0" }}>
                    Trung tâm từ chối lịch của tôi
                  </Radio>
                  <Radio value={'Tôi bận việc khác, không đến đúng giờ hẹn trước.'} style={{ color: '#909090',padding:"8px 0" }}>
                    Tôi bận việc khác, không đến đúng giờ hẹn trước
                  </Radio>
                  <Radio value={'Khác.'} style={{ color: '#909090',padding:"8px 0" }}>
                    Khác
                  </Radio>
                </Space>
              </Radio.Group>
              <TextArea
                rows={4}
                onChange={(e) => {
                  setReasonNoteCancelSchedule((e.target.value+'.'))
                }}
                placeholder="Nhập lý do...."
              />
              {vali && <p className="validate_text text-danger">Vui lòng nhập/chọn lý do bạn muốn hủy lịch</p>}
            </div>
            <Button className="login__button df custom-default-btn" style={{ marginTop: 25 }} onClick={() => handleCheck(customerScheduleId)} type="primary" size="large">
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
      {isModalErrOpen &&
      <PopupMessage isModalOpen={isModalErrOpen} onClose={() => {setIsModalErrOpen(false)}} text={errorMessage} ></PopupMessage>
      }
    </div>
  )
}

export default DetailScheduledComponent
