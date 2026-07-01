import React, { useMemo, useState } from 'react'
import { Button, Input, Modal } from 'antd'
import { useHistory, useLocation } from 'react-router-dom'
import BookingService from '../../services/addBookingService'
import { PATH } from '../../constants/router'
import referStationIcon from '../../assets/img/refer-station.png'
import './index.scss'

const RUNTIME_MODE = process.env.REACT_APP_RUNTIME_MODE

const IS_DEVELOPER_MODE = RUNTIME_MODE === 'developer'

const TAMOVE_DATLICH_API_KEY = IS_DEVELOPER_MODE
  ? '05cf2340-5d11-423e-ba77-2d86d5c90d63'
  : '0c670892-3ec1-4bfd-9115-9e54ccd9146e'

const TAMOVE_BAODUONG_API_KEY = IS_DEVELOPER_MODE
  ? '92de77ec-1cc0-441e-a061-d3b223f44d71'
  : 'bf08e20b-b394-4fbb-bd80-d0940a418a59'

const TAMOVE_CUUHO_API_KEY = IS_DEVELOPER_MODE
  ? '334ba6b2-c502-46d4-a020-556d5f6d9931'
  : '8f5f4cbe-4d8e-4083-90ca-b1706de96edd'

  
const REFER_STATION_CONFIG_BY_PATH = {
  '/datlich/referstation': {
    badge: 'Đặt lịch hẹn',
    apiKey: TAMOVE_DATLICH_API_KEY,
    stationType: 1
  },
  '/baoduong/referstation': {
    badge: 'Bảo dưỡng xe',
    apiKey: TAMOVE_BAODUONG_API_KEY,
    stationType: 3
  },
  '/cuuho/referstation': {
    badge: 'Cứu hộ ô tô',
    apiKey: TAMOVE_CUUHO_API_KEY,
    stationType: 4
  }
}

const normalizeReferStationCode = (value) => {
  return String(value || '')
    .replace(/\s/g, '')
    .toUpperCase()
    .trim()
}

const normalizePathname = (pathname = '') => {
  return String(pathname || '')
    .replace(/\/+$/, '')
    .toLowerCase()
}

const getReferStationConfigBySearch = (searchParams) => {
  const stationType = String(searchParams.get('stationType') || '')
  const service = String(searchParams.get('service') || '').toLowerCase()

  if (stationType === '1' || service === 'datlich' || service === 'booking') {
    return {
      badge: 'Đặt lịch hẹn',
      apiKey: TAMOVE_DATLICH_API_KEY,
      stationType: 1
    }
  }

  if (stationType === '4' || service === 'rescue' || service === 'cuuho') {
    return {
      badge: 'Cứu hộ ô tô',
      apiKey: TAMOVE_CUUHO_API_KEY,
      stationType: 4
    }
  }

  if (stationType === '3' || service === 'maintenance' || service === 'baoduong') {
    return {
      badge: 'Bảo dưỡng xe',
      apiKey: TAMOVE_BAODUONG_API_KEY,
      stationType: 3
    }
  }

  return {
    badge: 'Đặt lịch hẹn',
    apiKey: TAMOVE_DATLICH_API_KEY,
    stationType: 1
  }
}

const ReferStation = () => {
  const history = useHistory()
  const location = useLocation()

  const [referStationCode, setReferStationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const searchParams = useMemo(() => {
    return new URLSearchParams(location.search)
  }, [location.search])

  const referStationConfig = useMemo(() => {
    const pathConfig = REFER_STATION_CONFIG_BY_PATH[normalizePathname(location.pathname)]

    if (pathConfig) {
      return pathConfig
    }

    return getReferStationConfigBySearch(searchParams)
  }, [location.pathname, searchParams])

  const handleChangeReferStationCode = (event) => {
    const value = normalizeReferStationCode(event.target.value)
    setReferStationCode(value)
    setError('')
  }

  const handleClearReferStationCode = () => {
    setReferStationCode('')
    setError('')
  }

  const goToBooking = ({ checkedReferStationCode, referStationId }) => {
    const params = new URLSearchParams(location.search)

    if (referStationConfig?.apiKey) {
      params.set('apiKey', referStationConfig.apiKey)
    }

    if (referStationConfig?.stationType) {
      params.set('stationType', String(referStationConfig.stationType))
    }

    params.set('referStationCode', checkedReferStationCode)
    params.set('referStationId', String(referStationId))

    history.replace(`${PATH.BOOKING}?${params.toString()}`)
  }

  const handleSubmitReferStationCode = async () => {
    const safeCode = normalizeReferStationCode(referStationCode)

    if (!safeCode) {
      setError('Vui lòng nhập mã trung tâm')
      return
    }

    if (safeCode.length < 2) {
      setError('Mã trung tâm không hợp lệ')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await BookingService.checkExistReferStationCode({
        referStationCode: safeCode
      })

      const referStationId = response?.data?.referStationId
      const checkedReferStationCode = response?.data?.referStationCode || safeCode

      if (response?.statusCode !== 200 || response?.data?.isExist !== true || !referStationId) {
        setError('Không tìm thấy trung tâm giới thiệu. Vui lòng kiểm tra lại mã.')
        return
      }

      goToBooking({
        checkedReferStationCode,
        referStationId
      })
    } catch (err) {
      setError('Đã xảy ra lỗi khi kiểm tra mã trung tâm. Vui lòng thử lại sau.')
    } finally {
          setLoading(false)
        }
  }

  return (
    <div className="TrafficFineReferralPage">
      <div className="TrafficFineReferralPage_topBg" />

      <div className="TrafficFineReferral">
        <div className="TrafficFineReferral_hero">
          <div className="TrafficFineReferral_badge">
            {referStationConfig?.badge || 'Đặt lịch dịch vụ'}
          </div>

          <div className="TrafficFineReferral_heading">Nhập mã trung tâm</div>

          <div className="TrafficFineReferral_subHeading">
            Nhập mã trung tâm để tiếp tục đặt lịch dịch vụ.
          </div>
        </div>

        <div className="TrafficFineReferral_card">
          <div className="TrafficFineReferral_cardHeader">
            <div className="TrafficFineReferral_icon">
              <img src={referStationIcon} alt="" />
            </div>

            <div>
              <div className="TrafficFineReferral_cardTitle">Mã trung tâm</div>
              <div className="TrafficFineReferral_cardDesc">Nhập mã trung tâm, ví dụ 4706D</div>
            </div>
          </div>

          <div className="TrafficFineReferral_input">
            <Input
              value={referStationCode}
              placeholder="Ví dụ: 4706D"
              maxLength={20}
              autoComplete="off"
              onChange={handleChangeReferStationCode}
              onPressEnter={handleSubmitReferStationCode}
            />

            <button
              type="button"
              className={`TrafficFineReferral_clearButton ${referStationCode ? 'is-show' : ''}`}
              onClick={handleClearReferStationCode}
              disabled={loading || !referStationCode}
            >
              ×
            </button>

            {error ? <div className="TrafficFineReferral_error">{error}</div> : null}
          </div>
        </div>
      </div>

      <div className="TrafficFineReferral_fixedBottom">
        <Button type="primary" block loading={loading} disabled={loading} onClick={handleSubmitReferStationCode}>
          Xác nhận
        </Button>
      </div>
    </div>
  )
}

export default ReferStation