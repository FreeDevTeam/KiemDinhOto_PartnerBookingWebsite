import React, { useEffect, useMemo, useState } from 'react'
import { Button, Input, Modal, Spin } from 'antd'
import { useHistory, useLocation } from 'react-router-dom'
import referStationIcon from '../../assets/img/refer-station.png'
import BookingService from '../../services/addBookingService'
import { PATH } from '../../constants/router'
import { STATIONS_TYPE } from '../../constants/stationsList'
import './index.scss'

const SERVICE_CONFIG = {
  maintenance: {
    service: 'maintenance',
    title: 'Bảo dưỡng xe',
    shortTitle: 'Bảo dưỡng',
    desc: 'Nhập mã trạm để tiếp tục đặt lịch bảo dưỡng xe.',
    stationType: STATIONS_TYPE.GARAGE,
    serviceType: 7,
    scheduleType: 7,
    apiKey: process.env.REACT_APP_APIKEY_BAODUONGXE
  },
  rescue: {
    service: 'rescue',
    title: 'Cứu hộ ô tô',
    shortTitle: 'Cứu hộ',
    desc: 'Nhập mã trạm để tiếp tục đặt lịch cứu hộ ô tô.',
    stationType: STATIONS_TYPE.INSPECTION_RESCUE,
    serviceType: 10,
    apiKey: process.env.REACT_APP_APIKEY_CUUHOOTO
  }
}

const STATION_TYPE_TO_SERVICE = {
  [STATIONS_TYPE.GARAGE]: 'maintenance',
  [STATIONS_TYPE.INSPECTION_RESCUE]: 'rescue'
}

const SERVICE_TYPE_TO_SERVICE = {
  7: 'maintenance',
  10: 'rescue'
}

const normalizeReferStationCode = (value) => {
  return String(value || '')
    .toUpperCase()
    .trim()
}

const getServiceConfig = (searchParams) => {
  const service = `${searchParams.get('service') || ''}`.toLowerCase()
  const stationType = searchParams.get('stationType') || searchParams.get('stationtype')
  const serviceType = searchParams.get('serviceType') || searchParams.get('servicetype')

  const serviceKey =
    service ||
    STATION_TYPE_TO_SERVICE[Number(stationType)] ||
    SERVICE_TYPE_TO_SERVICE[Number(serviceType)]

  return SERVICE_CONFIG[serviceKey] || null
}

const applyServiceParams = (searchParams, serviceConfig) => {
  if (!serviceConfig) return

  if (serviceConfig.apiKey) {
    searchParams.set('apiKey', serviceConfig.apiKey)
    searchParams.delete('apikey')
  }

  searchParams.set('service', serviceConfig.service)
  searchParams.set('stationType', `${serviceConfig.stationType}`)
  searchParams.set('serviceType', `${serviceConfig.serviceType}`)

  if (serviceConfig.scheduleType !== undefined && serviceConfig.scheduleType !== null) {
    searchParams.set('scheduleType', `${serviceConfig.scheduleType}`)
  } else {
    searchParams.delete('scheduleType')
    searchParams.delete('scheduletype')
  }

  searchParams.delete('stationtype')
  searchParams.delete('servicetype')
}

const ReferStation = () => {
  const history = useHistory()
  const location = useLocation()

  const [referStationCode, setReferStationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const pageData = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    const serviceConfig = getServiceConfig(searchParams)
    const currentReferStationId = searchParams.get('referStationId') || searchParams.get('referstationid')
    const currentReferStationCode = searchParams.get('referStationCode') || searchParams.get('referstationcode')

    applyServiceParams(searchParams, serviceConfig)

    return {
      searchParams,
      serviceConfig,
      currentReferStationId,
      currentReferStationCode,
      title: serviceConfig?.title || 'Đặt lịch',
      shortTitle: serviceConfig?.shortTitle || 'Đặt lịch',
      desc: serviceConfig?.desc || 'Nhập mã trạm để tiếp tục đặt lịch.',
    }
  }, [location.search])

  const buildBookingUrl = (params = {}) => {
    const nextParams = new URLSearchParams(pageData.searchParams)

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
    })

    const queryString = nextParams.toString()
    return queryString ? `${PATH.BOOKING}?${queryString}` : PATH.BOOKING
  }

  useEffect(() => {
    if (pageData.currentReferStationCode) {
      setReferStationCode(normalizeReferStationCode(pageData.currentReferStationCode))
    }
  }, [pageData.currentReferStationCode])

  useEffect(() => {
    if (!pageData.currentReferStationId) {
      return undefined
    }

    const timer = setTimeout(() => {
      history.replace(buildBookingUrl({
        referStationId: pageData.currentReferStationId
      }))
    }, 800)

    return () => clearTimeout(timer)
  }, [pageData.currentReferStationId, history, location.search])

  const handleChangeReferStationCode = (event) => {
    const value = normalizeReferStationCode(event.target.value)
    setReferStationCode(value)
    setError('')
  }

  const handleSubmitReferStationCode = async () => {
  const safeCode = normalizeReferStationCode(referStationCode)

  if (!safeCode) {
    setError('Vui lòng nhập mã trạm')
    return
  }

  if (safeCode.length < 2) {
    setError('Mã trạm không hợp lệ')
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
      Modal.error({
        title: 'Mã trạm không hợp lệ',
        content: 'Không tìm thấy trạm. Vui lòng kiểm tra lại mã.'
      })
      return
    }

    localStorage.removeItem('referUserCode')
    localStorage.removeItem('referUserId')
    sessionStorage.removeItem('referUserCode')
    sessionStorage.removeItem('referUserId')

    localStorage.setItem('referStationCode', checkedReferStationCode)
    localStorage.setItem('referStationId', String(referStationId))
    sessionStorage.setItem('referStationCode', checkedReferStationCode)
    sessionStorage.setItem('referStationId', String(referStationId))

    history.replace(buildBookingUrl({
      referUserCode: null,
      referUserId: null,
      referStationCode: checkedReferStationCode,
      referStationId
    }))
  } catch (err) {
    Modal.error({
      title: 'Không thể kiểm tra mã trạm',
      content: 'Đã xảy ra lỗi trong quá trình kiểm tra mã trạm. Vui lòng thử lại sau.'
    })
  } finally {
    setLoading(false)
  }
}
  const isAutoRedirecting = !!pageData.currentReferStationId

  return (
    <div className="refer-station-page">
      <div className="refer-station-page__bg refer-station-page__bg--one" />
      <div className="refer-station-page__bg refer-station-page__bg--two" />

      <div className="refer-station-page__card">
        <div className="refer-station-page__icon">
          <img src={referStationIcon} alt="" />
        </div>

        <div className="refer-station-page__badge">
          {pageData.shortTitle}
        </div>

        <div className="refer-station-page__title">
          Nhập mã trạm
        </div>

        <div className="refer-station-page__desc">
          {pageData.desc}
        </div>

        <div className="refer-station-page__field">
          <div className="refer-station-page__label">Mã trạm</div>
          <Input
            value={referStationCode}
            placeholder="Ví dụ: 2901S"
            size="large"
            disabled={loading || isAutoRedirecting}
            className="refer-station-page__input"
            onChange={handleChangeReferStationCode}
            onPressEnter={handleSubmitReferStationCode}
          />
          {error && <div className="refer-station-page__error">{error}</div>}
        </div>

        <Button
          type="primary"
          size="large"
          block
          disabled={loading || isAutoRedirecting}
          loading={loading}
          className="refer-station-page__button"
          onClick={handleSubmitReferStationCode}
        >
          Tiếp tục đặt lịch
        </Button>

        <div className="refer-station-page__note">
          Mã trạm giúp hệ thống ghi nhận đúng điểm khi khách đặt lịch.
        </div>
      </div>

      {isAutoRedirecting && (
        <div className="refer-station-page__overlay">
          <Spin size="large" />
          <div>Đang chuyển hướng...</div>
        </div>
      )}
    </div>
  )
}

export default ReferStation