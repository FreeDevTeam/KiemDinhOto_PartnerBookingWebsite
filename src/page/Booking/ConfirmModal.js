import React, { useState } from 'react'
import { Input, Button, message, Spin, Radio, Modal } from 'antd'
// import DetailScheduledComponent from 'components/ScheduledDetail'
import './index.scss'

const { TextArea } = Input

const ConfirmModal = ({ data, history, setStep, onConfirm, onClose }) => {
  const [check, setCheck] = useState(false)
  const [error, setError] = useState(false)
  const [reasonNote, setReasonNote] = useState(null)

  const handleOK = () => {
    const newData = {
      licensePlates: data.licensePlates,
      phone: data.phone,
      fullnameSchedule: data.fullnameSchedule,
      email: data.email,
      dateSchedule: data.dateSchedule,
      time: data.time,
      stationsId: data.stationsId,
      vehicleType: data.vehicleType,
      scheduleNote: reasonNote || undefined,
      licensePlateColor: data.licensePlateColor,
      notificationMethod: 'SMS',
      scheduleType: data.scheduleType
    }

    if (!check) {
      setError(true)
      return
    }
    if (onConfirm) {
      onConfirm(newData)
    }
  }
  const handleChange = (e) => {
    setCheck(e.target.checked)
    setError(false)
  }

  if (!data) {
    return <></>
  }

  return (
    <div className="px-2 form-heigh-booking-car" style={{ maxWidth: 600, margin: 'auto' }}>
      <div>
        <h3>Chi tiết lịch hẹn</h3>
        <p>Tên: {data.fullnameSchedule}</p>
        <p>Số điện thoại: {data.phone}</p>
        <p>Biển số: {data.licensePlates}</p>
        <p>Ngày: {data.dateSchedule}</p>
        <p>Giờ: {data.time}</p>
        <div className="d-flex flex-column">
          <TextArea
            rows={4}
            onChange={(e) => {
              setReasonNote(e.target.value)
            }}
            placeholder="Nhập thông tin cần trao đổi cho trung tâm"
            className="mb-1"
          />
          <Radio onChange={handleChange}>
            <p className="fw-bolder">Tôi đã đọc và hiểu các quy định trên</p>
          </Radio>
          {error && <div className="modalConfirm-error">Bạn cần đọc và đồng ý với các quy định trên.</div>}
        </div>
      </div>
      <Button
        type="primary"
        className="py-3 d-flex justify-content-center align-items-center modalConfirm-btn login__button df mgt-30"
        size="large"
        block
        onClick={handleOK}>
        Xác nhận
      </Button>
    </div>
  )
}

export default ConfirmModal
