import React, { useEffect, useState } from 'react'
import './index.scss'
import { Tag, Row, message, Button, Modal, Spin, Pagination, Empty, Radio, Space, Input } from 'antd'
import { VEHICLE_SUB_TYPE, VIHCLE_TYPES, SCHEDULE_STATUS, CUSTOMER_RECEIPT_STATUS, CUSTOMER_RECEIPT_STATUS_TO_TEXT, PAYMENT_OBJECT, SCHEDULE_STATUS_3_0 } from '../../constants/global'
import _ from 'lodash'
import { changeTime } from '../../helper/changeTime'
import { useHistory } from 'react-router-dom'
import moment from 'moment'
import BookingService from '../../services/addBookingService'
// NOTE: Bắt buộc truyền prop `status` ('success'|'error'|'info') khi dùng PopupMessage để tránh vỡ giao diện theme BIDV.
import PopupMessage from '../BookingPartner/PopupMessage'
import { useParams } from 'react-router-dom/cjs/react-router-dom'
import { CheckApiKey } from '../../helper/CheckApiKey'
import Header from '../../components/Header'
import { useAppParamsContext } from '../../context/AppParamsContext'
import FixedBottom from '../../components/FixedBottom'
import BaseBottomSheet from '../../components/BaseBottomSheet'

const { TextArea } = Input

const RetunStatus = ({ status }) => {
  let el = _.find(SCHEDULE_STATUS_3_0, { value: status })
  return el ? (
    <div className="text-i" style={{ color: el?.color }}>
      {el?.label}
    </div>
  ) : (
    <></>
  )
}

const BookingDetail = ({
  contentHeader = <></>,
  isHeader = true
}) => {
  const { customerScheduleId } = useParams()
  const urlParams = new URLSearchParams(window.location.search);
  const scheduleHash = localStorage.getItem('schedulehash') || urlParams.get('schedulehash');
  const { appThemeName, isHeaderMiniApp, isWebView } = useAppParamsContext() || {};
  const isBIDV = appThemeName?.toUpperCase() === 'BIDV';
  let apiKey = CheckApiKey()
  if (apiKey) {
    localStorage.setItem('apiKey', apiKey);
  }
  let wab = []
  const [scheduleInformation, setScheduleInformation] = useState([])
  const [isModal, setIsModal] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [vali, setVali] = useState(false)
  const [reasonRateCancelSchedule, setReasonRateCancelSchedule] = useState(null)
  const [reasonNoteCancelSchedule, setReasonNoteCancelSchedule] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorStatus, setErrorStatus] = useState('error')
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)

  const handleCancel = () => {
    setIsModal(false);
  };
  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
  };
  const onChangeReasonRateCancelSchedule = (e) => {
    setReasonRateCancelSchedule(e.target.value)
  }
  const handleCheck = (customerScheduleId) => {
    if ((reasonNoteCancelSchedule || reasonRateCancelSchedule) !== null) {
      setIsModal(true)
      BookingService.cancelBooking({
        customerScheduleId: customerScheduleId || scheduleInformation?.customerScheduleId,
        reason: reasonNoteCancelSchedule || reasonRateCancelSchedule
      }).then((result) => {
        const { isSuccess } = result
        if (!isSuccess) {
          setErrorMessage('Hủy lịch thất bại. Vui lòng liên hệ CSKH để được hỗ trợ')
          // NOTE: Không xóa (ảnh hưởng theme BIDV)
          setErrorStatus('error')
          setIsModalErrOpen(true)
        } else {
          setErrorMessage('Hủy lịch hẹn thành công')
          // NOTE: Không xóa (ảnh hưởng theme BIDV)
          setErrorStatus('success')
          setScheduleInformation({
            ...scheduleInformation,
            CustomerScheduleStatus: 20
          })
          setIsModalErrOpen(true)
          setIsModal(false)
        }
      })
    } else {
      setVali(true)
    }
  }

  const enablePaymentMethods = scheduleInformation?.station?.stationPayments ? scheduleInformation?.station?.stationPayments.split(',') : [];
  const ENABLE_PAYMENT_GATEWAY =
    process.env.REACT_APP_ENABLE_PAYMENT * 1 === 1 &&
    enablePaymentMethods.length > 0 && // trạm bật phương thức thanh toán
    scheduleInformation?.station?.enablePaymentGateway === 1 && // trạm bật thanh toán
    // (scheduleInformation?.CustomerScheduleStatus === status.confirmed) && // lịch chưa hoàn tất
    scheduleInformation?.order?.paymentStatus !== CUSTOMER_RECEIPT_STATUS.SUCCESS && // chưa hoàn tất thanh toán
    scheduleInformation?.order?.totalPayment > 0 // số tiền phải > 0

  const isViewDetails =
    process.env.REACT_APP_ENABLE_PAYMENT * 1 === 1 &&
    (enablePaymentMethods.length === 0 || scheduleInformation?.station?.enablePaymentGateway === 0) && // trạm bật phương thức thanh toán
    // (scheduleInformation?.CustomerScheduleStatus === status.confirmed) && // lịch chưa hoàn tất
    scheduleInformation?.order?.paymentStatus !== CUSTOMER_RECEIPT_STATUS.SUCCESS && // chưa hoàn tất thanh toán
    scheduleInformation?.order?.totalPayment > 0 // số tiền phải > 0

  const dataTime = scheduleInformation?.station?.stationWorkTimeConfig
  if (dataTime) {
    wab = JSON.parse(scheduleInformation?.station?.stationWorkTimeConfig)
  }
  const getScheduleDetail = () => {
    BookingService.getBookingDetail(customerScheduleId).then((result) => {
      const { isSuccess, message, data } = result
      if (!isSuccess || !data) {
        return
      } else {
        setScheduleInformation(data)
      }
    })
  }
  useEffect(() => {
    if(scheduleHash){
      BookingService.findByHash({scheduleHash:scheduleHash}).then((result) => {
        const { isSuccess, message, data } = result
        if (!isSuccess || !data) {
          return
        } else {
          setScheduleInformation(data)
        }
      })
    }
    else{
      if(customerScheduleId) {
        getScheduleDetail()
      }
    }
  }, [customerScheduleId,scheduleHash])

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
  function getVehicleTypeName(vehicleData) {
    const vehicleType = vehicleData?.vehicleType
    let vehicle
    if (vehicleType) {
      vehicle = VIHCLE_TYPES.find((e) => e.value == vehicleType)?.label
      return vehicle
    } else {
      if (vehicleType) {
        vehicle = VIHCLE_TYPES.find((e) => e.value == vehicleType?.vehicleType)?.label
        return vehicle
      } else {
        return ('Phương tiện khác')
      }
    }
    return ('Phương tiện khác')
  }

  const renderActionButtons = () => {
    if (scheduleInformation?.CustomerScheduleStatus === 20 || scheduleInformation?.CustomerScheduleStatus === 30) return null;
    
    const buttons = (
      <div className="w-100 d-flex justify-content-center" style={{gap: isBIDV ? "12px" : "2em"}}>
        {scheduleInformation?.confirmStatus === 0 ? (
          <>
            {!isWebView && (
              <Button className={`d-flex justify-content-center align-items-center custom-font-btn ${isBIDV ? 'btn-bidv' : ''}`} type="primary" 
                onClick={() => history.push({ pathname: `/booking-update/${scheduleInformation?.customerScheduleId}`, state: { data: scheduleInformation } })}
                size="large" style={{width: '100%', padding: '20px', borderRadius:'6px', marginTop: isBIDV ? 0 : '30px'}}>
                Sửa
              </Button>
            )}
            <Button className={`d-flex justify-content-center align-items-center custom-font-btn ${isBIDV ? 'btn-bidv-cancel' : ''}`} type="primary" 
              onClick={() => isBIDV ? setIsBottomSheetOpen(true) : setIsModal(true)} 
              size="large" style={{width: '100%', padding: '20px', borderRadius:'6px', marginTop: isBIDV ? 0 : '30px', backgroundColor: isBIDV ? undefined : "var(--gray-mid-gray)!important"}}>
              Hủy lịch hẹn
            </Button>
          </>
        ) : null}
      </div>
    );
    
    return isBIDV ? <div id="fixed_bottom" className='position-relative'><FixedBottom elementPaddingBottom="fixed_bottom">{buttons}</FixedBottom></div> : buttons;
  };

  return (
    <>
      {isHeaderMiniApp && isHeader && <Header title="Thông tin lịch hẹn" onBack={() => history.length > 1 ? history.goBack() : history.push('/')} />}
      <div id="booking-detail-app" className="detail-sche" style={{ maxWidth: 600, margin: 'auto' }}>
        {!isBIDV ? (
          <>
          {isHeader && <div className="heads" style={{borderRadius:'30px 30px 0 0',padding:''}}>
            Thông tin lịch hẹn
          </div>}
          <div className="content" style={{padding: '15px 10px 30px',backgroundColor:'#e6f7ff',borderRadius:'0 0 20px 20px'}}>
            <div className="box">
              <div className="title-i">Nơi đặt chỗ</div>
              <div className="text-i">
                {scheduleInformation?.stationsName} - {scheduleInformation?.stationsAddress} - {scheduleInformation?.stationArea}
              </div>
            </div>
            <div className="d-flex j-sb mgt-15">
              <div className="box w-50">
                <div className="title-i">Họ và tên</div>
                <div className="text-i">{scheduleInformation?.fullnameSchedule}</div>
              </div>
              <div className="box w-50">
                <div className="title-i">Số điện thoại</div>
                <div className="text-i">{scheduleInformation?.phone}</div>
              </div>
            </div>
            <div className="d-flex j-sb mgt-15">
              {scheduleInformation?.licensePlates ? (
                <div className="box w-50">
                  <div className="title-i">Biển số xe</div>
                  <div className="text-i">
                    {' '}
                    <BindPlate type={scheduleInformation?.licensePlateColor} number={scheduleInformation?.licensePlates} />
                  </div>
                </div>
              ) : (<div className="box w-50">
                <div className="title-i">Ngày</div>
                <div className="text-i">{scheduleInformation?.dateSchedule}</div>
              </div>)
              }
              <div className="box w-50">
                <div className="title-i">Loại phương tiện</div>
                <div className="text-i">{getVehicleTypeName(scheduleInformation)}</div>
              </div>
            </div>
            {scheduleInformation?.time &&
              <div className="d-flex j-sb mgt-15">
                <div className="box w-50">
                  <div className="title-i">Ngày</div>
                  <div className="text-i">{scheduleInformation?.dateSchedule}</div>
                </div>
                <div className="box w-50">
                  <div className="title-i">Giờ</div>
                  <div className="text-i">{changeTime(scheduleInformation?.time)}</div>
                </div>
              </div>
            }
            <div className="d-flex j-sb mgt-15">
              {scheduleInformation?.scheduleCode && (
                <div className="box w-50">
                  <div className="title-i">Trạng thái</div>
                 <RetunStatus status={scheduleInformation?.CustomerScheduleStatus} />
                </div>
              )}
              {scheduleInformation?.scheduleCode && (
                <div className="box w-50">
                  <div className="title-i">Mã đặt vé</div>
                  <div className="text-i detail-sche-scheduleCode">{scheduleInformation?.scheduleCode}</div>
                </div>
              )}
            </div>

            {scheduleInformation?.station?.enablePaymentGateway === 1 && (
              <div>
                {scheduleInformation?.order?.paymentStatus !== CUSTOMER_RECEIPT_STATUS.SUCCESS ? (
                  <>
                    <div className="d-flex j-sb mgt-15">
                      {scheduleInformation?.order?.totalPayment > 0 && (
                        <div className="box">
                          <div className="title-i">Chi phí dự kiến</div>
                          <div className="text-i">
                            {scheduleInformation?.order?.totalPayment?.toLocaleString()}
                          </div>
                          <div className="text-i">
                            <i>Ghi chú: Trên đây chỉ là chi phí dự kiến mang tính tham khảo.</i>
                          </div>
                        </div>
                      )}
                    </div>
                    {scheduleInformation?.stationServices?.length > 0 && (
                      <div className="mgt-15">
                        <div className="">
                          <div className="title-i mb-2">Dịch vụ lịch hẹn</div>
                          <ul>
                            {scheduleInformation.stationServices.map((item, index) => (
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
                      <div className="text-i">{CUSTOMER_RECEIPT_STATUS_TO_TEXT[scheduleInformation?.order?.paymentStatus?.toUpperCase()] || ''}</div>
                    </div>
                    <div className="box w-50">
                      <div className="title-i">Thời gian thanh toán</div>
                      <div className="text-i">{moment(scheduleInformation?.order?.approveDate || new Date()).format('DD/MM/YYYY HH:mm:ss')}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {contentHeader}
            <a target="_blank" style={{ marginTop: '1rem' }} href="https://youtu.be/mpIQeRGv3Lg?feature=shared" className="mgt-15 d-block">Xem thêm hướng dẫn quy trình đăng kiểm</a>
          </div>
        </>
      ) : (
        <>
          <div className="content">
            <div className="box">
              <div className="title-i">Nơi đặt chỗ</div>
              <div className="text-i">
                {scheduleInformation?.stationsName} - {scheduleInformation?.stationsAddress} - {scheduleInformation?.stationArea}
              </div>
            </div>
            
            <div className="box">
              <div className="title-i">Họ và tên</div>
              <div className="text-i">{scheduleInformation?.fullnameSchedule}</div>
            </div>
            
            <div className="box">
              <div className="title-i">Số điện thoại</div>
              <div className="text-i">{scheduleInformation?.phone}</div>
            </div>

            {scheduleInformation?.licensePlates && (
              <div className="box">
                <div className="title-i">Biển số xe</div>
                <div className="text-i">{scheduleInformation?.licensePlates}</div>
              </div>
            )}

            <div className="box">
              <div className="title-i">Loại phương tiện</div>
              <div className="text-i">{getVehicleTypeName(scheduleInformation)}</div>
            </div>

            <div className="box">
              <div className="title-i">Ngày</div>
              <div className="text-i">{scheduleInformation?.dateSchedule}</div>
            </div>

            {scheduleInformation?.time && (
              <div className="box">
                <div className="title-i">Giờ</div>
                <div className="text-i">{changeTime(scheduleInformation?.time)}</div>
              </div>
            )}

            {scheduleInformation?.scheduleCode && (
              <div className="box">
                <div className="title-i">Trạng thái</div>
                <RetunStatus status={scheduleInformation?.CustomerScheduleStatus} />
              </div>
            )}

            {scheduleInformation?.scheduleCode && (
              <div className="box">
                <div className="title-i">Mã đặt vé</div>
                <div className="text-i detail-sche-scheduleCode">{scheduleInformation?.scheduleCode}</div>
              </div>
            )}

            {scheduleInformation?.station?.enablePaymentGateway === 1 && (
              <div>
                {scheduleInformation?.order?.paymentStatus !== CUSTOMER_RECEIPT_STATUS.SUCCESS ? (
                  <>
                    {scheduleInformation?.order?.totalPayment > 0 && (
                      <div className="box" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <div className="title-i">Chi phí dự kiến</div>
                          <div className="text-i">{scheduleInformation?.order?.totalPayment?.toLocaleString()}</div>
                        </div>
                        <div className="text-i" style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary, #7a7a7a)' }}>
                          <i>Ghi chú: Trên đây chỉ là chi phí dự kiến mang tính tham khảo.</i>
                        </div>
                      </div>
                    )}
                    
                    {scheduleInformation?.stationServices?.length > 0 && (
                      <div className="box" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <div className="title-i mb-2">Dịch vụ lịch hẹn</div>
                        </div>
                        <ul style={{ padding: 0, listStyle: 'none', textAlign: 'right' }}>
                          {scheduleInformation.stationServices.map((item, index) => (
                            <li key={index} className="text-i">
                              {item.serviceName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ENABLE_PAYMENT_GATEWAY && (
                      <div className="box" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                        <div className="title-i">Hỗ trợ thanh toán</div>
                        <Row className="row" style={{ width: '100%' }}>
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
                    )}
                  </>
                ) : (
                  <>
                    <div className="box">
                      <div className="title-i">Trạng thái thanh toán</div>
                      <div className="text-i">{CUSTOMER_RECEIPT_STATUS_TO_TEXT[scheduleInformation?.order?.paymentStatus?.toUpperCase()] || ''}</div>
                    </div>
                    <div className="box">
                      <div className="title-i">Thời gian thanh toán</div>
                      <div className="text-i">{moment(scheduleInformation?.order?.approveDate || new Date()).format('DD/MM/YYYY HH:mm:ss')}</div>
                    </div>
                  </>
                )}
              </div>
            )}
            {contentHeader}
          </div>
          <a target="_blank" href="https://youtu.be/mpIQeRGv3Lg?feature=shared" className="link-guide">Xem thêm hướng dẫn quy trình đăng kiểm</a>
        </>
      )}
      {renderActionButtons()}
      {/* Nội dung form hủy lịch - dùng chung cho cả Modal và BottomSheet */}
      {(() => {
        const cancelFormContent = (
          <div className={isBIDV ? 'cancel-form-content' : ''}>
            <strong style={{ display: 'block', marginBottom: 'var(--item-gap, 12px)' }}>Lý do huỷ lịch:</strong>
            <div className="box-form">
              <Radio.Group
                onChange={(e) => {
                  setVali(false)
                  onChangeReasonRateCancelSchedule(e)
                }}
                value={reasonRateCancelSchedule}>
                <div className="d-flex flex-column" style={{ gap: 'var(--item-gap, 12px)', marginBottom: 'var(--item-gap, 12px)' }}>
                  <Radio value={'Tôi đặt nhầm thời gian / địa điểm.'} style={{ color: 'var(--text-color-secondary, #777777)' }}>
                    Tôi đặt nhầm thời gian / địa điểm
                  </Radio>
                  <Radio value={'Trung tâm từ chối lịch của tôi.'} style={{ color: 'var(--text-color-secondary, #777777)' }}>
                    Trung tâm từ chối lịch của tôi
                  </Radio>
                  <Radio value={'Tôi bận việc khác, không đến đúng giờ hẹn trước.'} style={{ color: 'var(--text-color-secondary, #777777)' }}>
                    Tôi bận việc khác, không đến đúng giờ hẹn trước
                  </Radio>
                  <Radio value={'Khác.'} style={{ color: 'var(--text-color-secondary, #777777)' }}>
                    Khác
                  </Radio>
                </div>
              </Radio.Group>
              <TextArea
                rows={4}
                onChange={(e) => {
                  setReasonNoteCancelSchedule((e.target.value + '.'))
                }}
                placeholder="Nhập lý do...."
              />
              {vali && <p className="validate_text text-danger">Vui lòng nhập/chọn lý do bạn muốn hủy lịch</p>}
            </div>
            <Button
              className={`login__button df custom-default-btn custom-font-btn ${isBIDV ? 'btn-bidv' : ''}`}
              style={{ marginTop: 25 }}
              onClick={() => handleCheck(customerScheduleId)}
              type="primary"
              size="large"
            >
              Xác nhận
            </Button>
          </div>
        )

        if (isBIDV) {
          return (
            <BaseBottomSheet
              isOpen={isBottomSheetOpen}
              onClose={handleCloseBottomSheet}
              title="Hủy lịch hẹn"
            >
              {cancelFormContent}
            </BaseBottomSheet>
          )
        }

        return (
          <Modal
            title="Hủy lịch hẹn"
            open={isModal}
            onCancel={() => handleCancel()}
            className={`${isHeader ? '' : 'my-modal'} popup-cancel`}
          >
            <div style={{ maxWidth: 600, margin: 'auto', padding: '0', minHeight: '400px', paddingTop: 10 }}>
              {cancelFormContent}
            </div>
          </Modal>
        )
      })()}
      {isModalErrOpen &&
        <PopupMessage
          isModalOpen={isModalErrOpen}
          onClose={() => { setIsModalErrOpen(false) }}
          text={errorMessage}
          status={errorStatus}
        ></PopupMessage>
      }
      </div>
    </>
  )
}

export default BookingDetail
