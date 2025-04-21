// nhả

/* Lưu ý của trang này
1. fields của form này sẽ được autofill từ các params trên url, nếu không có thì sẽ lấy từ localStorage
2. các fields sẽ được ẩn hiện dựa vào các params trên url và localStorage
3. Nếu người dùng truy cập từ zalo mini app thì fill số điện thoại và firstName vào form
4. Sẽ có 2 loại lịch: 1 là tư vấn, 2 là đặt lịch hẹn. Nếu là tư vấn thì sẽ không cần chọn ngày giờ, còn nếu là đặt lịch hẹn thì sẽ cần chọn ngày giờ, trạm, dịch vụ
5. 
*/

import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import moment from 'moment'

import { Form, Input, Button, Spin, Select as SelectAntd, Row, Col } from 'antd'

import BookingSuccess from './BookingSuccessModal'
import PopupMessage from './PopupMessage'

import { ReactComponent as LogoTTDK } from './../../assets/icons/Logo.svg'

import { validatorPlateNumber } from './../../helper/validatorPlateNumber'
import { optionServiceType, SCHEDULE_TITLE, SCHEDULE_TYPE } from '../../constants/serviceOption'
import {
  PAYMENT_TYPE,
  PLATE_COLOR,
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
import BookingService from '../../services/addBookingService'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'

import BookingDatePicker from '../../components/BookingDatePicker'
import BookingHoursPicker from '../../components/BookingHoursPicker'
function BookingPartnerForm({ form, setTabKey, zaloUserName, zaloUserPhone }) {
  // ------------STATES------------------
  const customStyles = {
    control: (base) => ({
      ...base,
      height: 48,
      minHeight: 35,
      fontSize: 14
    })
  }

  // state dùng cho form
  const [scheduleTypes, setScheduleTypes] = useState([])
  const [licensePlateColor, setLicensePlateColor] = useState([])
  const [vehicleSubCategoryOptions, setVehicleSubCategoryOptions] = useState([])
  const [listStationArea, setListStationArea] = useState([])
  const [listStation, setListStation] = useState([])
  const [serviceTypes, setServiceTypes] = useState([])
  const [servicesByStations, setServicesByStations] = useState([])
  const [listBookingDate, setListBookingDate] = useState([])
  const [dateFilter, setDateFilter] = useState({
    stationsId: null,
    startDate: moment().format(DATE_DISPLAY_FORMAT),
    endDate: moment().endOf('month').format(DATE_DISPLAY_FORMAT),
    vehicleType: null
  })
  // khai báo các biến cho toàn trang
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)

  // Kiểm tra các biển trong ENV
  const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1 // ==> dùng cho miniApp
  const MINIAPP_GTELPAY = process.env.REACT_APP_MINIAPP_GTELPAY * 1 === 1 // dùng để tích hợp thanh toán qua GTELPAY

  // state này để lấy thông tin trên params và hiển thị cho lần đầu tiên
  const [dataBookingParam, setDataBookingParam] = useState({})

  // state của các modal hiển thị thông báo
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scheduleTypePopUp, setScheduleTypePopUp] = useState([])
  const [isModalErrOpen, setIsModalErrOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Các functions bổ trợ
  const handleGetStationsServices = (stationsId) => {
    BookingService.getListStationService({ filter: { stationsId: stationsId } }).then((result) => {
      const { data, isSuccess } = result
      if (isSuccess && data?.data) {
        // Hiển thị phần loại dịch vụ
        const serviceTypesList = data?.data.map((item) => {
          const foundOptionType = optionServiceType.find((option) => option.value === item.serviceType)
          return foundOptionType
        })
        const selectedServiceType = dataBookingParam?.serviceType || serviceTypesList[0]
        setServiceTypes(serviceTypesList)

        // Lấy ra danh sách dịch vụ theo trạm
        const allServices = data?.data.map((item) => ({
          label: item.serviceName,
          value: item.stationServicesId,
          serviceType: item.serviceType,
          price: item?.servicePrice
        }))

        // Lọc dịch vụ theo loại
        const servicesByType = data?.data.filter((item) => item.serviceType === selectedServiceType.value)
        setServicesByStations(() => {
          const servicesAfterFilter = servicesByType.map((item) => ({
            label: item.serviceName,
            value: item.stationServicesId,
            serviceType: item.serviceType,
            price: item?.servicePrice
          }))
          const serviceId = dataBookingParam?.serviceId || servicesAfterFilter[0]?.value
          const serviceDefault = servicesAfterFilter.find((item) => item.value === serviceId)
          return servicesAfterFilter
        })
      }
    })
  }

  function getStations(filter = null, callback = null) {
    const appliedFilter = filter
    const newFilter = {
      ...appliedFilter,
      filter: {
        ...appliedFilter?.filter,
        scheduleType: dataBookingParam?.scheduleType
      }
    }

    BookingService.getStationList(newFilter)
      .then((res) => {
        const stationList = (res?.data || []).map((station) => {
          const name = `${station.stationCode} - ${station.stationsAddress || station.stationsName}`
          let label = <div className="text-station-select">{name}</div>
          let disabled = false

          // Ưu tiên
          if (station.enablePriorityMode) {
            label = (
              <div className="text-station-select" style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div className="ai-c" style={{ display: 'inline-flex', paddingRight: '4px' }}>
                  <span className="priority-mode">Được ưu tiên</span>
                </div>
                {name}
              </div>
            )
          }

          // Check stationBookingConfig
          const bookingConfig = JSON.parse(station?.stationBookingConfig || '[]')
          const hasBookingEnabled = bookingConfig.some((item) => item?.enableBooking)

          if (!hasBookingEnabled) {
            label = (
              <div className="text-station-select" style={{ display: 'flex', flexWrap: 'wrap' }}>
                {name}
              </div>
            )
            disabled = false
          }

          // Trạng thái trạm
          if (station.stationStatus === 0) {
            disabled = true
            label = (
              <div className="text-station-select" style={{ color: 'var(--error-btn-color)', display: 'flex', flexWrap: 'wrap' }}>
                <div
                  className="ai-c disable-station"
                  style={{
                    display: 'inline-flex',
                    border: '1px solid var(--error-btn-color)',
                    borderRadius: '4px',
                    marginRight: '4px'
                  }}>
                  <span style={{ padding: '0 2px' }}>Ngưng hoạt động</span>
                </div>
                {name}
              </div>
            )
          }

          return {
            ...station,
            label,
            value: station.stationsId,
            disabled
          }
        })

        if (typeof callback === 'function') {
          callback(stationList)
        } else {
          setListStation(stationList)
        }
      })
      .catch((err) => {
        console.error('Lỗi lấy danh sách trạm:', err)
        setErrorMessage('Lấy thông tin trung tâm thất bại.')
        setIsModalErrOpen(true)
      })
  }

  const stringToRealValue = (value) => {
    switch (value) {
      case 'true':
        return true
      case 'false':
        return false
      case 'null':
        return null
      case 'undefined':
        return undefined
      case 'NaN':
        return NaN
      default:
        // Nếu có thể chuyển thành số thì trả về số
        if (!isNaN(value) && value.trim() !== '') {
          return Number(value)
        }
        return value // Trả lại nguyên chuỗi nếu không khớp gì
    }
  }

  function getStationAreas() {
    BookingService.getStationAreaList()
      .then((data) => {
        if (data?.statusCode === 505) {
          return
        }
        const areas = (data?.data || []).map((area) => ({
          ...area,
          label: <div style={{ fontWeight: 'normal' }}>{area.value}</div>
        }))
        setListStationArea(areas)
      })
      .catch((error) => {
        console.error('Error fetching station areas:', error)
        setErrorMessage('Lấy thông tin khu vực thất bại.')
        setIsModalErrOpen(true)
      })
      .finally(() => {
        // Nếu cần xử lý gì sau khi xong hết (loading chẳng hạn), đặt ở đây
      })
  }

  const handleCategory = (evt) => {
    const categoryOptionsMap = {
      [VEHICLE_SUB_CATEGORY.CAR]: VIHCLE_CATEGORY_OTO,
      [VEHICLE_SUB_CATEGORY.PASSENGER]: VIHCLE_CATEGORY_BUS,
      [VEHICLE_SUB_CATEGORY.TRUCKER]: VIHCLE_CATEGORY_TRUCK,
      [VEHICLE_SUB_CATEGORY.GROUP]: VIHCLE_CATEGORY_GROUP,
      [VEHICLE_SUB_CATEGORY.ROMOOCL]: VIHCLE_CATEGORY_MOOC,
      [VEHICLE_SUB_CATEGORY.CAR_SPECIALIZED]: VIHCLE_CATEGORY_PICKUP,
      [VEHICLE_SUB_CATEGORY.ORTHER]: VIHCLE_CATEGORY_SPECIALIZED
    }
    const options = categoryOptionsMap[evt]
    setVehicleSubCategoryOptions(options)
  }

  const firstScheduleTypeHandler = () => {
    setScheduleTypes(() => {
      const data = Object.keys(SCHEDULE_TYPE).map((key) => {
        return {
          key: key,
          value: SCHEDULE_TYPE[key],
          label: SCHEDULE_TITLE[SCHEDULE_TYPE[key]].title
        }
      })
      return data
    })
  }

  const formItemInput = (data) => {
    const {
      required = false,
      fieldName,
      label,
      regex = [],
      hidden,
      placeholder,
      type,
      disabled = false,
      extra,
      defaultValue,
      readOnly,
      onInput,
      style,
      className = 'login__input booking-input'
    } = data

    return (
      <Form.Item required={required} name={fieldName} label={label} rules={regex} hidden={hidden} extra={extra}>
        <Input
          type={type}
          size="large"
          disabled={disabled}
          placeholder={placeholder}
          defaultValue={defaultValue}
          readOnly={readOnly}
          onInput={onInput}
          style={style}
          className={className}
        />
      </Form.Item>
    )
  }

  const formSelectItem = (data) => {
    const {
      fieldName,
      label,
      regex = [],
      hidden = false,
      placeholder,
      type,
      disabled = false,
      styles = {},
      options,
      onChange,
      extra,
      required = false
    } = data
    return (
      <Form.Item required={required} extra={extra} name={fieldName} label={label} rules={regex}>
        <div className="login__input__icon">
          <SelectAntd
            disabled={disabled}
            hidden={hidden}
            className="cs-select ant-custom booking-input"
            isSearchable={true}
            placeholder={placeholder}
            styles={styles}
            options={options}
            menuPlacement="top"
            onChange={onChange}
          />
        </div>
      </Form.Item>
    )
  }

  // FUNC: Băm url để lấy các params trên url và trả về dạng mảng có object là key và value
  function getQueryParams(options = {}) {
    // 1. Nếu chạy trong trình duyệt
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search)
      const result = {}
      for (const [key, value] of params.entries()) {
        result[key] = value
      }
      return result
    }
  }

  // FUNC: fill value X vào field X của form
  const fillFormValue = (fieldName, value) => {
    form.setFieldsValue({ [fieldName]: value })
  }

  // ------------USE EFFECT------------------
  // Lấy thông tin trên params và gán vào dataBookingParam, mục đích là để autofill các fields có sẵn trên url

  // Hàm này dùng để format value về đúng với kiểu dữ liệu của nó, VD: 'true' => true, 'false' => false, 'null' => null

  useEffect(() => {
    // Lấy ra các params trên url
    const paramsFromUrl = getQueryParams()
    if (!paramsFromUrl) return
    Object.keys(paramsFromUrl).map((key) => {
      let value = paramsFromUrl[key]
      if (key !== 'phoneNumber') {
        // vì phoneNumber là string nên không cần convert
        value = stringToRealValue(paramsFromUrl[key])
      }
      paramsFromUrl[key] = value
      fillFormValue(key, value)
    })
    console.table(paramsFromUrl)
    setDataBookingParam(paramsFromUrl)

    // xử lí state của scheduleTypes
    firstScheduleTypeHandler()
    setLicensePlateColor(PLATE_COLOR)
    getStationAreas()
  }, [])

  useEffect(() => {
    if (form.getFieldValue('vntId')) {
      getStations({
        filter: {
          stationArea: form.getFieldValue('vntId')
        }
      })
    }
  }, [form.getFieldValue('vntId')])

  useEffect(() => {
    if (form.getFieldValue('stationsId')) {
      handleGetStationsServices(form.getFieldValue('stationsId'))
    }
  }, [form.getFieldValue('stationsId')])

  return (
    <div>
      <Form
        name="booking"
        layout="vertical"
        form={form}
        initialValues={{
          firstName: dataBookingParam?.firstName || zaloUserName,
          phoneNumber: dataBookingParam?.phoneNumber || zaloUserPhone
        }}>
        {() => (
          <>
            {formItemInput({
              required: true,
              fieldName: 'firstName',
              label: 'Họ và tên chủ xe',
              regex: [
                {
                  required: dataBookingParam?.require_firstName === 'true',
                  message: 'Vui lòng nhập tên'
                },
                {
                  message: 'Vui lòng nhập tên',
                  pattern: new RegExp(/^\S/)
                }
              ],
              hidden: dataBookingParam?.visible_firstName === false,
              placeholder: 'Nguyễn Văn A',
              type: 'text'
            })}
            {formItemInput({
              required: true,
              fieldName: 'phoneNumber',
              label: 'Số điện thoại',
              regex: [
                {
                  required: !isZaloApp || dataBookingParam?.require_phoneNumber === true,
                  message: 'Vui lòng nhập số điện thoại'
                },
                {
                  message: 'Số điện thoại không hợp lệ',
                  pattern: new RegExp(/^(03|05|07|08|09|01[2|6|8|9])+([0-9])*$\b/)
                },
                {
                  min: 10,
                  message: 'Số điện thoại quá ngắn'
                },
                {
                  max: 11,
                  message: 'Số điện thoại quá dài'
                }
              ],
              hidden: dataBookingParam?.visible_phoneNumber === false,
              placeholder: 'Nhập số điện thoại',
              type: 'text'
            })}

            {formSelectItem({
              required: true,
              fieldName: 'scheduleType',
              label: 'Mục đích đặt hẹn',
              regex: [
                {
                  required: true,
                  message: 'Vui lòng chọn mục đích đặt lịch'
                }
              ],
              hidden: dataBookingParam?.visible_scheduleType === false,
              placeholder: 'Vui lòng chọn mục đích đặt lịch',
              type: 'select',
              options: scheduleTypes,
              onChange: (values) => {}
            })}

            {formItemInput({
              required: true,
              fieldName: 'licensePlates',
              label: 'Biển số xe',
              regex: [
                {
                  required: dataBookingParam?.require_vehicleIdentity === true,
                  validator(_, value) {
                    return validatorPlateNumber(value?.toUpperCase())
                  }
                }
              ],
              hidden: dataBookingParam?.visible_vehicleIdentity === false,
              placeholder: '59B16856',
              type: 'text',
              style: { textTransform: 'uppercase' },
              onInput: (e) => {
                e.target.value = e.target.value.toUpperCase().replace(/\s/g, '')
              }
            })}

            {formSelectItem({
              required: true,
              fieldName: 'licensePlateColor',
              label: 'Màu biển số',
              regex: [
                {
                  required: dataBookingParam?.require_vehiclePlateColor === true,
                  message: 'Vui lòng chọn màu biển số'
                }
              ],
              hidden: dataBookingParam?.visible_scheduleType === false,
              placeholder: 'Vui lòng chọn màu biển số',
              type: 'select',
              options: licensePlateColor,
              styles: customStyles,
              onChange: (values) => {}
            })}

            <Row className="justify-content-between">
              <Col span={11}>
                {formSelectItem({
                  required: true,
                  fieldName: 'vehicleSubType',
                  label: 'Loại phương tiện',
                  regex: [
                    {
                      required: dataBookingParam?.require_vehicleSubType === true,
                      message: 'Vui lòng nhập'
                    }
                  ],
                  hidden: dataBookingParam?.visible_vehicleSubType === false,
                  type: 'select',
                  options: VEHICLE_SUB_TYPE,
                  onChange: (values) => {
                    handleCategory(values)
                  }
                })}
              </Col>
              <Col span={11}>
                {formSelectItem({
                  required: true,
                  fieldName: 'vehicleSubCategory',
                  label: 'Phân loại',
                  regex: [
                    {
                      required: dataBookingParam?.require_vehicleSubCategory === true,
                      message: 'Vui lòng chọn phân loại'
                    }
                  ],
                  hidden: dataBookingParam?.visible_vehicleSubCategory === false,
                  type: 'select',
                  options: vehicleSubCategoryOptions,
                  onChange: (values) => {}
                })}
              </Col>
            </Row>
            {formItemInput({
              fieldName: 'certificateSeries',
              label: (
                <div>
                  Số seri GCN mới nhất
                  <span
                    className="text-important text-very-small text-primary"
                    onClick={() => {
                      setIsModalErrOpen(true)
                      setErrorMessage(
                        'Số seri là dãy số có dạng XXXXXXXX.<br>Số seri có thể được tìm thấy trên tem đăng kiểm hoặc dòng chữ cuối cùng ở trang 1 của sổ / giấy đăng kiểm'
                      )
                    }}>
                    (Tìm số seri)
                  </span>
                </div>
              ),
              regex: [
                {
                  required: dataBookingParam?.require_certificateSeries === true,
                  message: 'Vui lòng nhập số seri GCN'
                },
                {
                  message: 'Số seri GCN không hợp lệ',
                  pattern: new RegExp(/^([a-zA-Z]{2})+(-(?!-))+([0-9]{7}\b)$/)
                }
              ],
              hidden: dataBookingParam?.visible_certificateSeries === false,
              placeholder: 'Ví dụ: KA-7461980',
              type: 'text',
              style: { textTransform: 'uppercase' },
              onInput: (event) => {
                event.target.value = event.target.value.toUpperCase().replace(/\s/g, '')
              },
              extra: 'Nhập số seri GCN để được tự động kiểm tra phạt nguội'
            })}
            {formSelectItem({
              required: true,
              fieldName: 'vntId',
              label: 'Khu vực',
              hidden: dataBookingParam?.visible_StationArea === false,
              placeholder: 'Vui lòng chọn khu vực',
              // disabled: !dataBookingParam.vehicleSubType,
              styles: customStyles,
              options: listStationArea,
              onChange: (value) => {
                form.setFieldValue('vntId', value)
              }
            })}
            {formSelectItem({
              required: true,
              fieldName: 'stationsId',
              label: 'Chọn trạm',
              regex: [
                {
                  required: true,
                  message: 'Vui lòng chọn trạm'
                }
              ],
              hidden: dataBookingParam?.visible_StationsCode === false,
              placeholder: 'Vui lòng chọn trạm',
              // disabled: !dataBookingParam.vehicleSubType,
              styles: customStyles,
              options: listStation,
              onChange: (value) => {
                form.setFieldValue('stationsId', value)
              }
            })}
            {formSelectItem({
              required: true,
              fieldName: 'serviceType',
              label: 'Loại dịch vụ',
              regex: [
                {
                  required: true,
                  message: 'Vui lòng chọn loại dịch vụ'
                }
              ],
              hidden: dataBookingParam?.visible_StationArea === false,
              placeholder: 'Vui lòng chọn loại dịch vụ',
              // disabled: !dataBookingParam.vehicleSubType,
              styles: customStyles,
              options: serviceTypes,
              onChange: (value) => {
                form.setFieldValue('serviceType', value)
              }
            })}
            {formSelectItem({
              fieldName: 'serviceId',
              label: 'Chọn dịch vụ',
              regex: [
                {
                  required: true,
                  message: 'Vui lòng chọn dịch vụ'
                }
              ],
              hidden: dataBookingParam?.visible_StationArea === false,
              style: {
                ...customStyles,
                lineHeight: 48
              },
              options: servicesByStations
            })}

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
                  selectedDate = '12/12/2023'
                  disabled = {true}
                  // setSelectedDate,
                  listBookingDate={listBookingDate}
                  bookingConfig
                  currentMonth={12}
                  // setCurrentMonth,
                  loading={true}
              />
            </Form.Item>
            {/*
      {requireScheduleStation == '1' && (
      )}
      {requireScheduleDate == '1' && (
        <Form.Item
          name="dateSchedule"
          label="Ngày hẹn"
          extra="Đặt lịch hẹn qua App để được nhắc hẹn tự động"
          rules={[
            {
              required: requireScheduleDate == '1' ? true : false,
              message: 'Vui lòng nhập'
            }
          ]}>
            <BookingDatePicker
              disabled={!bookingData.stationsId}
              loading={loadingDatePicker}
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
                const  stationsId  = bookingData.stationsId.stationsId || localBookingData?.stationsId?.stationsId
                if (stationsId && bookingData) {
                  getBookingHours({
                    stationsId: stationsId,
                    date: values,
                    vehicleType: bookingData.vehicleType
                  })
                  setBookingData({
                    ...bookingData,
                    dateSchedule: values,
                    time: null
                  })
                }
              }}
              listBookingDate={listBookingDate}
            />
        </Form.Item>
      )}
      {requireScheduleTime == '1' && (
        <Form.Item
          label="Giờ hẹn"
          name="time"
          rules={[
            {
              required: requireScheduleTime == '1' ? true : false,
              message: 'Vui lòng nhập'
            }
          ]}>
            <BookingHoursPicker
              disabled={!bookingData.dateSchedule || isVisible.time}
              listBookingTime={listBookingTime}
              loading={loadingHoursPicker}
              setSelectedTime={(values) => {
                form.setFieldsValue({
                  ["time"]: values
                })
                // saveDataLocal('time',values)
                // setBookingData({
                //   ...bookingData,
                //   time: values.scheduleTime
                // })
              }}
              selectedTime={form.getFieldValue('time')}
              bookingConfig={bookingConfig}
            />
        </Form.Item>
      )} */}
            <div className="w-100 d-flex justify-content-center mgt-40">
              <Button className="login__button df" type="primary" htmlType="submit" size="large">
                Đặt lịch
              </Button>
            </div>
          </>
        )}
      </Form>

      {/* Hiên thị modal đặt lịch thành công và quay về trang trước */}
      <BookingSuccess
        isModalOpen={isModalOpen}
        scheduleType={scheduleTypePopUp}
        setTabKey={setTabKey}
        setIsModalOpen={setIsModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          history.goBack()
        }}></BookingSuccess>
      {isModalErrOpen && (
        <PopupMessage
          isModalOpen={isModalErrOpen}
          onClose={() => {
            setIsModalErrOpen(false)
          }}
          text={errorMessage}></PopupMessage>
      )}

      {/* Hiển thị loading */}
      {isLoading && (
        <div className="loading">
          <div>
            <LogoTTDK></LogoTTDK>
            <Spin style={{ width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingPartnerForm
