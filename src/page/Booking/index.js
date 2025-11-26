import React, { useEffect, useState } from 'react'
import { Steps,Button } from 'antd'
import { ReactComponent as LeftIcon } from './../../assets/Booking-icon/ArrowLeft.svg'
import { ReactComponent as DrivingIcon } from './../../assets/Booking-icon/driving.svg'
import { ReactComponent as SmartCarIcon } from './../../assets/Booking-icon/smart-car.svg'
import { ReactComponent as PlusIcon } from './../../assets/Booking-icon/plus.svg'
import { SCHEDULE_TYPE } from './../../constants/serviceOption'
import { UserOutlined } from '@ant-design/icons'
import './index.scss'
import { useLocation } from 'react-router-dom'
import _ from 'lodash'
import BookingPartnerForm from './BookingPartnerForm'
import LoadFormBookingFailed from '../../components/BasicComponent/LoadFormBookingFailed'
import { CheckApiKey } from '../../helper/CheckApiKey'

const BookingCar = React.lazy(() => import('./BookingCar'))
const BookingDriving = React.lazy(() => import('./BookingDriving'))
const BookingService = React.lazy(() => import('./BookingService'))
const BookingAdditionalInfo = React.lazy(() => import('./BookingAdditionalInfo'))

const { Step } = Steps

const HeaderBooking = ({ onBack, title }) => {
  return (
    <div className="headerBooking">
      <div onClick={onBack} className="p-2 cursor">
        <LeftIcon />
      </div>
      <div />
    </div>
  )
}

const StepBooking = ({ history, intl }) => {
  const location = useLocation();
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  let apiKey = CheckApiKey()

  const { state: dataCompleteForm, search } = useLocation();
  const [step, setStep] = useState('Service')
  const [data, setData] = useState(null)
  const [listPlate, setListPlate] = useState([])
  const [listStation, setListStation] = useState([])
  const [listBookingTime, setListBookingTime] = useState([])
  const [listStationArea, setListStationArea] = useState([])
  const [listBookingDate, setListBookingDate] = useState([])
  const [dataBookingParam, setBookingParam] = useState({
    licensePlates: params.get('licenseplates'),
    phone: params.get('phone'),
    fullnameSchedule: params.get('name'),
    email: params.get('email'),
    dateSchedule: params.get('dateschedule'),
    time: params.get('time'),
    stationsId: params.get('stationsid'),
    vehicleType:params.get('vehicletype'),
    licensePlateColor: params.get('licenseplatecolor'),
    scheduleType: params.get('scheduletype'),
  })


  const listUIComponent = {
    Service: {
      component: (props) => <BookingService step={step} dataBookingParam={dataBookingParam} {...props} />,
      goBack: 'Service',
      title: 'Vui lòng chọn loại dịch vụ',
      isHeaderHidden: true, // ẩn header
      isProgressHidden: true // ẩn trên thanh progress
    },
    Info: {
      component: (props) => <BookingPartnerForm dataBookingParam={dataBookingParam} {...props} listPlate={listPlate} setListPlate={setListPlate} data={data} step={step} />,
      goBack: 'Service',
      title: 'Đặt lịch hẹn',
      icon: <UserOutlined style={{ fontSize: 20,color:'var(--title-color)',width:'20px',marginBottom:'5px'  }} />,
      titleStep: 'Thông tin khách hàng',
      index: 0
    },
    Car: {
      component: (props) => <BookingCar {...props} dataBookingParam={dataBookingParam} listPlate={listPlate} setListPlate={setListPlate} data={data} step={step} />,
      goBack: 'Info',
      title: 'Đặt lịch hẹn',
      icon: <DrivingIcon style={{ fontSize: 20,width:'20px'}} />,
      titleStep: 'Thông tin phương tiện',
      index: 1
    },
    Driving: {
      component: (props) => (
        <BookingDriving
          {...props}
          dataVihcle={data}
          listStation={listStation}
          dataBookingParam={dataBookingParam}
          listBookingTime={listBookingTime}
          listStationArea={listStationArea}
          listBookingDate={listBookingDate}
          setListStation={setListStation}
          setListBookingTime={setListBookingTime}
          setListStationArea={setListStationArea}
          setListBookingDate={setListBookingDate}
          dataCompleteForm={_.isEmpty(dataCompleteForm) ? undefined : dataCompleteForm}
        />
      ),
      goBack: 'Car',
      title: 'Đặt lịch hẹn',
      icon: <SmartCarIcon style={{ fontSize: 20,width:'20px' }} />,
      titleStep: 'Thông tin đặt lịch',
      index: 2
    },
    ConfirmModal: {
      component: (props) => (
        <BookingAdditionalInfo
          dataBookingParam={dataBookingParam}
          {...props}
          data={{
            ...data,
            station: {
              stationsName: listStation.filter((item) => item.stationsId === data?.stationsId)[0]?.stationsName
            },
            time: data?.time?.scheduleTime,
            licensePlates: data?.vihcleId?.vehicleIdentity || data?.vehicleIdentity
          }}
        />
      ),
      goBack: 'Driving',
      title: 'Đặt lịch hẹn',
      icon: <PlusIcon style={{ fontSize: 20,width:'20px' }} />,
      titleStep: 'Thông tin đặt lịch',
      index: 3
    }
  }


  const listUIStep = {}
  const listProgress = {}
  const stepKeys = Object.keys(listUIComponent)
  for (let i = 0; i < stepKeys.length; i++) {
    if (!listUIComponent[stepKeys[i]].isHiddenUI) {
      listUIStep[stepKeys[i]] = listUIComponent[stepKeys[i]]
    }
    if (!listUIComponent[stepKeys[i]].isProgressHidden) {
      listProgress[stepKeys[i]] = listUIComponent[stepKeys[i]]
    }
  }
  const indexStep = listUIComponent[step].index

  const customDot = (dot, { status, index }) => {
    const item = listProgress[Object.keys(listProgress)[index]]

    if (item.index > indexStep) {
      item.icon = <></>
    }

    return (
      <div>
        <div className="stepBooking-dot" />
        <div className="stepBooking-icon">{item.icon}</div>
      </div>
    )
  }

  const bookingSessionStorage = sessionStorage.getItem('booking') || null;
  const fromBooking = params.get('LoginfromBooking') === 'true';

  useEffect(() => {
    if (bookingSessionStorage &&  fromBooking) {
      const dataBooking = JSON.parse(bookingSessionStorage);
      setData(dataBooking.data);
      setStep(dataBooking.step)
      sessionStorage.removeItem('booking');
    }

  }, [bookingSessionStorage, fromBooking]);

  return (
    <>
      {apiKey ? 
        (
          <div style={{ maxWidth: 600, margin: 'auto' }}>
            <div className="stepBooking-header">
            <div style={{ maxWidth: 600 }} >
            {step !== 'Service' &&(<HeaderBooking showArrowLeft={true} title="Đặt lịch hẹn" showLogo={false} 
                onBack={() => {
                  setStep(listUIComponent[step].goBack)
                }}/>
              )}
            </div>
              {listUIStep[step] && !listUIStep[step].isProgressHidden ? (
                <div className="stepBooking-step">
                  <div style={{ width: '60%' }}>
                    <Steps
                      current={indexStep}
                      progressDot={customDot}
                      responsive={false}
                      style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      {Object.keys(listProgress).map((item) => {
                        if (!item.isProgressHidden) {
                          return <Step title={listProgress[item].titleStep} />
                        }
                      })}
                    </Steps>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
            {step !== 'Service' ? (
              <>
              {step !== 'ConfirmModal' ? (
                <div className="hint mb-25">Vui lòng kiểm tra thông tin chính xác, bổ sung thông tin đầy đủ để hỗ trợ công tác xử lý</div>):
                (<div className="hint mb-25">Bổ sung thêm thông tin về xe (nếu có) để hỗ trợ công tác xử lý.</div>)}
                {data.scheduleType === SCHEDULE_TYPE.NEW_VEHICLE_INSPECTION && (
                  <div>
                    <div className="hint mb-25">Đối với phương tiện đổi biển số, yêu cầu chủ phương tiện/Lái xe nhập biển số cũ</div>
                    <div className="hint mb-25">Dành cho KH đăng kiểm lần đâu nộp hồ sơ đăng kiểm - không mang phương tiện đến trạm đăng kiểm</div>
                  </div>
                )}
                {data.scheduleType === SCHEDULE_TYPE.CHANGE_REGISTATION && (
                  <div className="hint mb-25">Đối với phương tiện đã đổi biển số vui lòng nhập biển số cũ của phương tiện</div>
                )}
              </>
            ) : (
              <></>
            )}
            {listUIComponent[step].component({
              history: history,
              intl: intl,
              setStep: setStep,
              setData: setData
            })}
          </div>
        ):
        (
          <LoadFormBookingFailed></LoadFormBookingFailed>
        )
      }
    </>
  )
}

export default StepBooking
