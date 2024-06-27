import React, { useState, useEffect } from 'react'
import { Form, Button, notification, Spin, Select as SelectAntd, message } from 'antd'
import { xoa_dau } from './../../helper/common'
import { WarningOutlined } from '@ant-design/icons'
import moment from 'moment'
// import { useSelector } from 'react-redux'
import BookingService from './../../services/addBookingService'
import Select from 'react-select'
import { DATE_DISPLAY_FORMAT } from './../../constants/dateFormats'
import { changeTime } from '../../helper/changeTime'
import { STATION_SESSION_KEY } from './../../constants/schedule'
import queryString from 'query-string'
import _ from 'lodash'
import PopupMessage from './../BookingPartner/PopupMessage'
import { useHistory } from 'react-router-dom'


const DEFAULT_USER_SEARCH = { filter: {} }

function getContentAutoFill() {
  const dataCompleteForm = queryString.parse(window.location.search)
  if (
    !_.isEmpty(dataCompleteForm) &&
    dataCompleteForm.stationsId &&
    dataCompleteForm.stationArea
  ) {
    return dataCompleteForm
  } else {
    return undefined
  }
}

function BookingDriving({
  dataVihcle,
  listStation,
  listBookingTime,
  listStationArea,
  listBookingDate,
  setListStation,
  setData,
  setStep,
  setListBookingTime,
  setListStationArea,
  setListBookingDate,
  dataBookingParam
}) {

  const [form] = Form.useForm()
  const [bookingData, setBookingData] = useState({})
  const [disableBookingDate, setDisableBookingDate] = useState(true)

  const [isVisible, setIsVisible] = useState({
    stationsId: false,
    dateSchedule: false,
    time: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [customerParam, setCustomerParam] = useState(DEFAULT_USER_SEARCH)
  const [dateFilter, setDateFilter] = useState({
    stationsId: null,
    startDate: moment().format(DATE_DISPLAY_FORMAT),
    endDate: moment().add(30, 'days').format(DATE_DISPLAY_FORMAT),
    vehicleType: dataVihcle?.vehicleType
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const history=useHistory()
  const customStyles = {
    control: (base) => ({
      ...base,
      height: 48,
      minHeight: 35,
      fontSize: 14
    })
  }

  function getBookingHours(params) {
    setIsVisible((prev) => ({ ...prev, time: true }))
    BookingService.getBookingHours(params)
      .then((data) => {
        let tmp = data || []
        if (tmp.length > 0) {
          tmp?.forEach((element) => {
            if(bookingData.stationsId.stationStatus){
              element.disabled = element.scheduleTimeStatus == 0
            }
            element.label = (
              <div className="d-flex ai-c j-sb w-100">
                <span>{changeTime(element.scheduleTime)}</span>
                  <span className="text-primary">
                  {element.scheduleTimeStatus  == 0 ? (element?.totalBookingSchedule ? `${element?.totalBookingSchedule}` : '') : (element?.totalBookingSchedule || element?.totalSchedule ? `${element?.totalBookingSchedule || 0}/${element?.totalSchedule}` : '')}
                  </span>
              </div>
            )
            element.value = element.value
          })
          setListBookingTime(tmp)
        }
      })
      .catch(() => {
        // notification.error('Lấy thông tin thất bại')
        setErrorMessage('Lấy thông tin thất bại.')
        setIsModalErrOpen(true)
      })
      .finally(() => {
        setIsVisible((prev) => ({ ...prev, time: false }))
      })
  }

  function getStationAreas() {
    setIsLoading(true)
    BookingService.getStationAreaList()
      .then((data) => {
        let tmp = data.data || []
        if (tmp.length > 0)
          tmp?.forEach((element) => {
            element.label = <div style={{ fontWeight: 'normal' }}>{element.value}</div>
            element.value = element.value
          })
        setListStationArea(tmp)
        setIsLoading(false)
      })
      .catch(() => {
        setErrorMessage('Lấy thông tin thất bại.')
        setIsModalErrOpen(true)
        setIsLoading(false)
      })
  }

  const onFinish = (values) => {
    sessionStorage.setItem(STATION_SESSION_KEY, values.stationsId)
    setData((prev) => ({
      ...prev,
      ...values
    }))
    setStep('ConfirmModal')
  }

  useEffect(() => {
    if (dateFilter.vehicleType && dateFilter.stationsId) {
      getBookingDate()
    }
  }, [dateFilter])
  console.log("dateFilter:", dateFilter)

  function getBookingDate() {
    setIsVisible((prev) => ({ ...prev, dateSchedule: true }))
    BookingService.getBookingDate(dateFilter)
      .then((data) => {
        console.log(".then ~ data:", data)
        if(data.length > 0){
          let tmp = data || []
          if (tmp.length > 0) {
            tmp.forEach((element) => {
              if (element.scheduleDateStatus == 0) {
                setDisableBookingDate(false)
                element.disabled = false
              }else{
                setDisableBookingDate(true)
              }
              element.label = (
                <div className="d-flex ai-c j-sb w-100">
                  <span>{element.scheduleDate}</span>
                    <span className="text-primary">
                    {element.scheduleDateStatus == 0 ? (element?.totalBookingSchedule ? `${element?.totalBookingSchedule}` : '') : (element?.totalBookingSchedule || element?.totalSchedule ? `${element?.totalBookingSchedule || 0}/${element?.totalSchedule}` : '')}
                    </span>
                </div>
              )
              element.value = element.scheduleDate
            })
            setListBookingDate(tmp)
          }
        }else{
        setErrorMessage('Không tìm thấy ngày hẹn thích hợp.<br>Vui lòng chọn trạm khác.')
        setIsModalErrOpen(true)
        setBookingData({
          ...bookingData,
          stationsId: null,
          dateSchedule: null,
          time: null
        })
        }
      })
      .catch(() => {
        setErrorMessage('Lấy thông tin thất bại.')
        setIsModalErrOpen(true)
        // notification.error('Lấy thông tin thất bại')
      })
      .finally(() => {
        setIsVisible((prev) => ({ ...prev, dateSchedule: false }))
      })
  }

  useEffect(() => {
    const dataCompleteForm = getContentAutoFill()
    if (customerParam.filter && _.isEmpty(dataCompleteForm)) getStations()
  }, [customerParam])

  function getStations(filter = null, callback = null) {
    filter = filter ? filter : customerParam
    setIsVisible((prev) => ({ ...prev, stationsId: true }))
    BookingService.getStationList(filter)
      .then((data) => {
        setIsVisible((prev) => ({ ...prev, stationsId: false }))
        let tmp = data?.data || []
        if (tmp.length > 0)
          tmp.forEach((element) => {
            // const name = `${element.stationCode} - ${element.stationsName}`

            // element.label = <div className="text-station-select">{name}</div>
            const name = `${element.stationCode} - ${element.stationsAddress || element.stationsName}`
            if(element?.enablePriorityMode){
              element.label =<div className="text-station-select" style={{display:'flex',flexWrap:'wrap' }}>
                  <div className="ai-c" style={{ display: 'inline-flex' }}>
                    <span className='priority-mode'>Được ưu tiên</span>
                  </div>
                  {' '+name}
                </div>
            }else{
              element.label = <div className="text-station-select">{name}</div>
            }
            element.value = element.stationsId
            const textParse = JSON.parse(element?.stationBookingConfig)
            const enableBookingHandler = textParse.some((item) => {
              return item?.enableBooking
            })

            if (!enableBookingHandler) {
              element.disabled = false
              element.label = (
                <div className="text-station-select" style={{display:'flex',flexWrap:'wrap'}}>
                  {name}
                </div>
              )
            }
            if (element.stationStatus == 0) {
              element.disabled = true
              element.label = (
                <div className="text-station-select" style={{ color: 'var(--error-btn-color)',display:'flex',flexWrap:'wrap' }}>
                  <div className="ai-c disable-station" style={{ display: 'inline-flex',border: '1px solid var(--error-btn-color)',borderRadius: '4px' }}>
                    <span style={{padding:'0 2px'}}>Ngưng hoạt động</span>
                  </div>
                  {' '+name}
                </div>
              )
              return
            } else {
              if (element.availableStatus == 0) {
                element.disabled = false
                element.label = (
                  <div className="text-station-select" style={{display:'flex',flexWrap:'wrap' }}>
                    {name}{' '}
                  </div>
                )
              }
            }
          })

        if (!callback) return setListStation(tmp)
        callback(tmp)
      })
      .catch(() => {
        setIsVisible((prev) => ({ ...prev, stationsId: false }))
        setErrorMessage('Lấy thông tin thất bại.')
        setIsModalErrOpen(true)
        // notification.error('Lấy thông tin thất bại')
      })
  }

  useEffect(() => {
    getStationAreas()
    if (!dataVihcle?.vntId && !dataVihcle?.stationsId && !dataVihcle?.dateSchedule && !dataVihcle?.time) {
    } else {
      setBookingData({ ...dataVihcle })
    }
  }, [])

  useEffect(() => {
    const dataCompleteForm = getContentAutoFill()
    if (
      !_.isEmpty(dataCompleteForm) &&
      !dataVihcle?.vntId &&
      !dataVihcle?.stationsId &&
      !dataVihcle?.dateSchedule &&
      !dataVihcle?.time
    ) {
      Promise.all([
        getStationAreas(),
        getStations({
          filter: {
            stationArea: dataCompleteForm.stationArea || undefined
          }
        }),
        setDateFilter({
          ...dateFilter,
          stationsId: dataCompleteForm.stationsId,
        }),
        dataCompleteForm.scheduleDate &&
          getBookingHours({
            stationsId: dataCompleteForm.stationsId,
            date: dataCompleteForm.scheduleDate,
            vehicleType: dataVihcle.vehicleType
          })
      ]).then(() => {
        setBookingData({
          vntId: dataCompleteForm.stationArea,
          stationsId: dataCompleteForm.stationsId,
          dateSchedule: dataCompleteForm.scheduleDate
        })
        form.setFieldsValue({
          vntId: dataCompleteForm.stationArea,
          stationsId: dataCompleteForm.stationsId,
          dateSchedule: dataCompleteForm.scheduleDate
        })
      })
    }
  }, [])

  // fix antd select label
  useEffect(() => {
    const dataCompleteForm = queryString.parse(window.location.search)
    const labelSelectEl = document.querySelector('#station .ant-select-selector .ant-select-selection-item')

    if (!_.isEmpty(dataCompleteForm) && listStation && listStation.length > 0 && labelSelectEl?.title) {
      const stationData = listStation.find((_item) => _item.value == dataCompleteForm.stationsId)
      if (stationData) {
        const name = `${stationData.stationCode} - ${stationData.stationsName}`
        labelSelectEl.innerHTML = name
        labelSelectEl.removeAttribute('title')
      }
    }
  }, [listStation])


  return (
    <div className="bg-white" style={{ maxWidth: 600, margin: 'auto', padding: '10px 15px' }}>
      <Form
        layout="vertical"
        className="custom-form"
        name="login"
        autoComplete="new-password"
        initialValues={{
          vntId: dataBookingParam?.vntId,
          stationsId: dataBookingParam?.stationsId,
          dateSchedule: dataBookingParam?.dateSchedule,
          time: dataBookingParam?.time
        }}
        form={form}
        onFinish={(values) => {
          onFinish(values)
        }}>
        <Form.Item label="Khu vực" name="vntId" rules={[]}>
          <SelectAntd
            className="cs-select ant-custom "
            filterOption={(input, option) => {
              return xoa_dau((option?.value ?? '').toLowerCase()).includes(xoa_dau(input.toLowerCase()))
            }}
            showSearch
            onChange={(values) => {
              form.setFieldsValue({
                stationsId: null,
                dateSchedule: null,
                time: null
              })
              getStations({
                ...customerParam,
                filter: {
                  stationArea: values
                }
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
                stationsId: null,
                dateSchedule: null,
                time: null
              })
            }}
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
            ]}>
            <SelectAntd
              className="cs-select ant-custom"
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
              disabled={!bookingData.vntId || isVisible.stationsId}
              onChange={(values) => {
                form.setFieldsValue({
                  dateSchedule: null,
                  time: null,
                  stationsId: values
                })
                setDateFilter({
                  ...dateFilter,
                  stationsId: values
                })
                const stationSelected = listStation.find((e) => e.stationsId == values)
                console.log("stationSelected:", stationSelected)
                setBookingData({
                  ...bookingData,
                  stationsId: stationSelected,
                  dateSchedule: null,
                  time: null
                })
              }}
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
          <SelectAntd
            className="cs-select ant-custom"
            isSearchable={true}
            placeholder="Vui lòng chọn ngày hẹn"
            styles={customStyles}
            options={listBookingDate}
            menuPlacement="top"
            isOptionDisabled={(option) => option.disabled}
            disabled={!bookingData.stationsId || isVisible.dateSchedule}
            onChange={(values) => {
              form.setFieldsValue({
                time: null
              })
              const { stationsId } = form.getFieldsValue()
              if (stationsId && dataVihcle) {
                getBookingHours({
                  stationsId: stationsId,
                  date: values,
                  vehicleType: dataVihcle.vehicleType
                })
                setBookingData({
                  ...bookingData,
                  dateSchedule: values,
                  time: null
                })
              }
            }}
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
          <Select
            className="cs-select schedule-hour"
            isSearchable={true}
            placeholder="Chọn khung giờ"
            isOptionDisabled={(option) => (
              !disableBookingDate ? '': option.disabled
            )}
            isDisabled={!bookingData.dateSchedule || isVisible.time}
            styles={customStyles}
            options={listBookingTime}
            getOptionValue={(option) => option.label}
            menuPlacement="top"
          />
        </Form.Item>

        <div className="w-100 d-flex justify-content-center">
          <Button
            className="login__button df custom-default-btn"
            type="primary"
            htmlType="submit"
            size="large"
            // disabled={
            //     !form.isFieldsTouched(true) ||
            //     form.getFieldsError().filter(({ errors }) => errors.length).length > 0
            // }
          >
            Tiếp theo
          </Button>
        </div>
      </Form>
      {isModalErrOpen &&
      <PopupMessage isModalOpen={isModalErrOpen} history={history} onClose={() => {setIsModalErrOpen(false)}} text={errorMessage} ></PopupMessage>
      }
    </div>
  )
}

export default BookingDriving
