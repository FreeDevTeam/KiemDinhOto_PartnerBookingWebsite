import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { Select, Form, Input, Button, DatePicker, message, Spin, Radio, Tag, Row, Col } from 'antd'
// import Select from 'react-select'
// import { useSelector } from 'react-redux'
import {
  VIHCLE_CATEGORY_MOOC,
  VIHCLE_CATEGORY_PICKUP,
  VIHCLE_CATEGORY_TRUCK,
  VIHCLE_CATEGORY_BUS,
  VIHCLE_CATEGORY_SPECIALIZED,
  VIHCLE_CATEGORY_GROUP,
  VIHCLE_CATEGORY_OTO,
  VEHICLE_SUB_TYPE,
  VEHICLE_COLOR,
  VEHICLE_SUB_CATEGORY,
  VIHCLE_TYPES
} from './../../constants/global'
import { validatorPlateNumber, normalizePlate } from './../../helper/validatorPlateNumber'
import { DATE_DISPLAY_FORMAT } from './../../constants/dateFormats'
import ChoosingCarModal from './ChoosingCarModal'
import { SCHEDULE_TYPE } from './../../constants/global'

function BookingCar({ history, setData, data, listPlate, setListPlate, setStep , step,dataBookingParam }) {
  const [dateFilter, setDateFilter] = useState({
    stationsId: null,
    startDate: moment().format(DATE_DISPLAY_FORMAT),
    endDate: moment().add(1, 'M').format(DATE_DISPLAY_FORMAT),
    vehicleType: null,
  })

  const [isOpenSelectionModal, setIsOpenSelectionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [btnText, setBtnText] = useState('Tiếp theo')
  const [dataVihcle, setDataVihcle] = useState({})
  const [vehicleSubCategoryOptions, setVehicleSubCategoryOptions] = useState([])
  const [form] = Form.useForm()


  const resetStationArea = () => {
    setData((prev) => ({
      ...prev,
      vntId: null,
      area: null,
      stationsId: null,
      dateSchedule: null,
      time: null,
      appUserVehicleId: dataVihcle.appUserVehicleId,
      vehiclePlateColor: dataVihcle.vehiclePlateColor
    }))
  }

  const onFinish = async(values) => {
    setData((prev) => ({
      ...prev,
      ...values
    }))
    setStep('Driving')
    if (values.vehicleType !== data.vehicleType) {
      await resetStationArea()
    }
  }



  useEffect(() => {
    if (data) {
      setDataVihcle(data)
      handleCategory(data.vehicleType,data.vehicleSubCategory)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white" style={{ maxWidth: 600, margin: 'auto', padding: '10px 15px' }}>
        <div className="loading">
          <Spin />
        </div>
      </div>
    )
  }

  const handleCategory = (evt,vehicleSubCategory) => {;
    const categoryOptionsMap = {
      [VEHICLE_SUB_CATEGORY.CAR]: VIHCLE_CATEGORY_OTO,
      [VEHICLE_SUB_CATEGORY.PASSENGER]: VIHCLE_CATEGORY_BUS,
      [VEHICLE_SUB_CATEGORY.TRUCKER]: VIHCLE_CATEGORY_TRUCK,
      [VEHICLE_SUB_CATEGORY.GROUP]: VIHCLE_CATEGORY_GROUP,
      [VEHICLE_SUB_CATEGORY.ROMOOCL]: VIHCLE_CATEGORY_MOOC,
      [VEHICLE_SUB_CATEGORY.CAR_SPECIALIZED]: VIHCLE_CATEGORY_PICKUP,
      [VEHICLE_SUB_CATEGORY.ORTHER]: VIHCLE_CATEGORY_SPECIALIZED,
    };

    const options = categoryOptionsMap[evt];
    if(options){
      setDataVihcle(prev => ({
        ...prev,
        vehicleSubCategory: vehicleSubCategory||options[0].value,
      }));
    }

      setVehicleSubCategoryOptions(options);
  }
  console.log(Number(dataBookingParam.vehicleType))
  console.log(dataBookingParam)

  return (
    <div className="bg-white" style={{ maxWidth: 600, margin: 'auto', padding: '10px 15px' }}>
      <Form
        layout="vertical"
        className="custom-form form-heigh-booking-car"
        name="login"
        autoComplete="new-password"
        initialValues={{
          vehicleIdentity: normalizePlate(dataBookingParam?.licensePlates) || undefined,
          licensePlateColor:Number(dataBookingParam?.licensePlateColor) || undefined,
          vehicleType:Number(dataBookingParam?.vehicleType) || undefined,
        }}
        form={form}
        onFinish={(values) => {
          onFinish(values)
        }}
        // fields={[
        //   {
        //     name: ['vehicleIdentity'],
        //     value: dataVihcle.vehicleIdentity
        //   },
        //   {
        //     name: ['vehicleExpiryDate'],
        //     value: dataVihcle.vehicleExpiryDate ? moment(dataVihcle.vehicleExpiryDate, DATE_DISPLAY_FORMAT) : ''
        //   },
        //   {
        //     name: ['vihcleId'],
        //     value: dataVihcle
        //   },
        //   {
        //     name: ['vehicleType'],
        //     value: dataVihcle.vehicleType
        //   },
        //   {
        //     name: ['licensePlateColor'], 
        //     value: {
        //       WHITE: 1,
        //       BLUE: 2,
        //       YELLOW: 3,
        //       RED: 4
        //     }[dataVihcle.vehiclePlateColor]
        //   },
        //   {
        //     name: ['certificateSeries'],
        //     value: dataVihcle.certificateSeries
        //   },
        //   {
        //     name: ['vehicleSubCategory'],
        //     value: dataVihcle.vehicleSubCategory
        //   }
        // ]}
        >
          <Form.Item
            label={'Biển số xe'} required
            name="vehicleIdentity"
            rules={[
              {
                required: true,
                validator(_, value) {
                  return validatorPlateNumber(value)
                }
              }
            ]}>
            <Input
              className="login__input"
              placeholder="Nhập biển số xe. VD: 30A38362"
              type="text"
              allowClear
              size="large"
              onInput={(e) => (e.target.value = normalizePlate(e.target.value))}
              onChange={(e) => {
                const value = normalizePlate(e.target.value)
                const index = listPlate?.findIndex((item) => normalizePlate(item.vehicleIdentity) === value)
                if (index !== -1) {
                  setDataVihcle(listPlate[index])
                  handleCategory(listPlate[index].vehicleType,listPlate[index].vehicleSubCategory)
                  setDateFilter({ ...dateFilter, vehicleType: value })
                  form.setFieldValue('vehicleIdentity', value)
                  return
                }
                if (!value && dataVihcle.appUserVehicleId) {
                  setDataVihcle({})
                } else {
                  setDataVihcle((prev) => ({ ...prev, vehicleIdentity: value }))
                  setBtnText('Lưu phương tiện')
                }
              }}
            />
          </Form.Item>
        {data.scheduleType !== SCHEDULE_TYPE.NEW_VEHICLE_INSPECTION && (
        <Form.Item
          name="vehicleExpiryDate"
          label="Ngày hết hạn"
          rules={[
            {
              required: true,
              message: 'Vui lòng nhập'
            }
          ]}>
          <DatePicker
            format={DATE_DISPLAY_FORMAT}
            placeholder="Chọn hết hạn"
            onChange={(_, dateString) => {
              setDataVihcle((prev) => ({ ...prev, vehicleExpiryDate: dateString }))
            }}
          />
        </Form.Item>
        )}
        <Form.Item
          className="radio-label"
          label="Màu nền biển số"
          name="licensePlateColor"
          rules={[
            {
              required: true,
              message: <div className="message">Vui lòng nhập</div>
            }
          ]}>
          <Radio.Group
            disabled={dataVihcle?.appUserVehicleId}
            style={{ width: '100%' }}
            onChange={(e) => {
              const value = VEHICLE_COLOR[e.target.value]
              setDataVihcle((prev) => ({ ...prev, vehiclePlateColor: value }))
            }}>
            <Row className='plate-color' span={12}>
              <Col span={8} className="mgbt-20">
                <Radio value={1}>
                  <Tag className="plate-tag white" color="#fffff">
                    Trắng
                  </Tag>
                </Radio>
              </Col>
              <Col span={8} className="mgbt-20">
                <Radio value={2}>
                  <Tag className="plate-tag" color="#0050B3">
                    Xanh
                  </Tag>
                </Radio>
              </Col>
              <Col span={8} className="mgbt-20">
                <Radio value={3}>
                  <Tag className="plate-tag" color="#FFC53D">
                    Vàng
                  </Tag>
                </Radio>
              </Col>
            </Row>
          </Radio.Group>
        </Form.Item>

          <Form.Item
            className="radio-label ps-23"
            label="Loại phương tiện"
            name="vehicleType"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập'
              }
            ]}>
            <Select
                options={VIHCLE_TYPES}
                style={{height:'100%'}}
                placeholder='Vui lòng chọn loại phương tiện'
                onChange={(event) => {
                  console.log("BookingCar ~ event:", event)
                  handleCategory(event,null)
                  setDataVihcle(prev => ({
                    ...prev,
                    vehicleType: event
                  }))
                }}
              />
          </Form.Item>
      {data.scheduleType !== SCHEDULE_TYPE.NEW_VEHICLE_INSPECTION && (
        <Form.Item
          name="certificateSeries"
          extra={data.scheduleType === SCHEDULE_TYPE.VEHICLE_INSPECTION  ? 'Nhập số seri GCN để kiểm tra phạt nguội' : null}
          label="Số tem GCN mới nhất"
          className="ps-23 mt-3"
          rules={[
          ]}>
          <Input
            className="login__input"
            placeholder="Ví dụ: KA-7461980"
            type="text"
            size="large"
            disabled={dataVihcle?.appUserVehicleId && dataVihcle?.certificateSeries}
            // onChange={(event) => {
            //   const value = event.target.value
            //   setDataVihcle({
            //     ...dataVihcle,
            //     certificateSeries: value
            //   })
            // }}
            onInput={(event) => {
              event.target.value = event.target.value.toUpperCase()
            }}
          />
        </Form.Item>
      )}
        <div className="w-100 d-flex justify-content-center">
          <Button
            className="login__button df ps-40 mt-4 custom-default-btn"
            type="primary"
            htmlType="submit"
            size="large"
          >
            Tiếp theo
          </Button>
        </div>
      </Form>
      <ChoosingCarModal
        isOpen={isOpenSelectionModal}
        onCancel={() => setIsOpenSelectionModal(false)}
        onOk={(value) => {
          setIsOpenSelectionModal(false)
          value = JSON.parse(value)
          setDataVihcle(value)
          handleCategory(value.vehicleType,value.vehicleSubCategory)
          setDateFilter({
            ...dateFilter,
            vehicleType: value.vehicleType
          })
        }}
        selectedValue={dataVihcle ? dataVihcle : ''}
        listPlate={listPlate}
        setListPlate={setListPlate}
      />
    </div>
  )
}

export default BookingCar
