import React, { useEffect, useState } from 'react'
import { Button, Modal, Spin,Tag,Pagination,Empty,Radio,Space,Input } from 'antd'
import _ from 'lodash'
import { SCHEDULE_STATUS_3_0, VIHCLE_TYPES_STATE } from '../../constants/global'
import { SCHEDULE_TITLE, SCHEDULE_TYPE_ARRAY } from '../../constants/serviceOption'
import { changeTime } from '../../helper/changeTime'
import BookingService from '../../services/addBookingService'
import PopupMessage from './PopupMessage'

const { TextArea } = Input

const LicensePlateTag = ({ color, licensePlate }) => {
  const plateColor = {
    1: (
      <Tag className="licensePlate-tag white mgl-5" color="#fffff" style={{ color: '#333', borderColor: '#000' }}>
        {licensePlate}
      </Tag>
    ),
    2: (
      <Tag className="licensePlate-tag mgl-5" color="#0050B3">
        {licensePlate}
      </Tag>
    ),
    3: (
      <Tag className="licensePlate-tag mgl-5" color="#FFC53D">
        {licensePlate}
      </Tag>
    ),
    4: (
      <Tag className="licensePlate-tag mgl-5" color="#FF4D4F">
        {licensePlate}
      </Tag>
    )
  }

  return plateColor[color || 1]
}
const ScheduleItem = ({
  licensePlates,
  licensePlateColor,
  dateSchedule,
  station,
  stationsAddress,
  time,
  status,
  vehicleType,
  customerScheduleId,
  scheduleHash,
  scheduleType,
  stationsId,
  chatLinkUserToEmployee
}) => {
  const [isModal, setIsModal] = useState(false)
  const [vali, setVali] = useState(false)
  const [reasonRateCancelSchedule, setReasonRateCancelSchedule] = useState(null)
  const [reasonNoteCancelSchedule, setReasonNoteCancelSchedule] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)

  const onChangeReasonRateCancelSchedule = (e) => {
    setReasonRateCancelSchedule(e.target.value)
  }
  const RetunStatus = ({ status }) => {
    let el = _.find(SCHEDULE_STATUS_3_0, { value: status })
    return el ? (
      <div style={{ color: el?.color, fontWeight: 500, fontSize: 14, lineHeight: '15.4px', display: 'inline' }} className="ms-1">
        {el?.label}
      </div>
    ) : (
      <></>
    )
  }
  const handleOk = () => {
    setIsModal(false);
  };

  const handleCancel = () => {
    setIsModal(false);
  };
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
          setTimeout(() => {
            window.location.reload()
          }, 2000);
        }
      })
    } else {
      setVali(true)
    }
  }
  return (
    <div className="scheduleItem cursor" >
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center">
          {licensePlates && <LicensePlateTag licensePlate={licensePlates} color={licensePlateColor} />}
        </div>
      </div>
      <div>
        <div className="scheduleItem-info">
          <div className="d-flex mt-2 align-items-center inline-content">
            <span className="me-1 scheduleItem-lable">Dịch vụ: </span>
            <div className="scheduleItem-value scheduleItem-href d-inline">
              {SCHEDULE_TYPE_ARRAY.find((e) => e.value == scheduleType)?.label || 'Đăng kiểm xe'}
            </div>
          </div>
          <div className="d-flex mt-2 align-items-center inline-content">
            <span className="me-1 scheduleItem-lable">Ngày giờ hẹn:</span>
            <div className="scheduleItem-value scheduleItem-black d-inline">
              {changeTime(time?.split('-')[0])}{time && '-'} {dateSchedule}
            </div>
          </div>
          <div className="d-block mt-2 d-flex justify-content-between" style={{gap:'5px',padding:'0 5px'}}>
            <span>
              <span className="me-1 scheduleItem-lable">Tên trạm: </span>
              <a className="scheduleItem-value scheduleItem-href" href="#">
                <span className="scheduleItem-decoration">{station.stationsName}</span>
              </a>
            </span>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between w-100">
        <span className="mb-0">
          Trạng thái:
          <RetunStatus status={status} />
        </span>
        {status != 20 &&
          <span className="mb-0">
            <Button className="cancel-schedule" type="primary" onClick={()=>{setIsModal(true)}} size="small">
              Hủy lịch hẹn
            </Button>
          </span>
        }
      </div>
      <Modal title="Hủy Lịch hẹn" open={isModal} onCancel={()=>handleCancel()} className='popup-cancel'>
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
};

function BookingPartnerHistory({tabKey}) {
  const phoneNumber = localStorage.getItem('phoneNumber')

  const DEFAULT_FILTER = {
    skip: 0,
    limit: 20,
    filter: {
      phone: phoneNumber
    }
  }
  const [filter, setFilter] = useState(DEFAULT_FILTER)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [dataList, setDataList] = useState({ data: [], total: 0 })

  useEffect(() => {
    getData(filter)
  }, [tabKey])

  useEffect(() => {
    getData(filter)
  }, [])
  

  function getData(filter) {
    setLoading(true)
    BookingService.getBookingHistory(filter).then((result) => {
      const { isSuccess, message, data } = result
      setLoading(false)
      if (!isSuccess || !data) {
        return
      } else {
        setDataList(data)
      }
    })
  }

  if (loading) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Spin />
      </div>
    )
  }

  return (
    <div>
      <div>
        {dataList?.data.map((element, index) => {
          return (
            <ScheduleItem
              key={index}
              {...{
                ...element,
                status: element?.CustomerScheduleStatus
              }}
              scheduleHash={element.scheduleHash}
            />
          )
        })}
      </div>
      <div className="" style={{ maxWidth: 600, margin: 'auto', width: '100%',marginBottom:'60px' }}>
        {(dataList?.data?.length > 0 && (
          <Pagination
            current={currentPage}
            style={{ textAlign: 'right' }}
            defaultPageSize={filter.limit}
            className='paging'
            simple={true}
            total={dataList?.total}
            onChange={(pageCurrent, pageSize) => {
              const skip = (pageCurrent-1) * filter.limit
              const newFilter = {
                ...filter,
                skip
              }
              setCurrentPage(pageCurrent)
              setFilter(newFilter)
              getData(newFilter)
            }}
          />
        )) || <Empty description="Chưa có dữ liệu" />}
      </div>
    </div>
  )
}

export default BookingPartnerHistory
