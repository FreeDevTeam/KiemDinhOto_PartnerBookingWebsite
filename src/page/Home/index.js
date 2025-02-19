import React, { useEffect, useState } from 'react'
import { banner1, banner2, banner3, banner4, banner5, carImage, motoImage } from '../../assets/img'
import { Carousel, notification } from 'antd'
import './index.scss'
// import { ScheduleIcon } from '../../assets/icons'
import { ReactComponent as ScheduleIcon } from '../../assets/icons/dldk.svg'
import { ReactComponent as CarIcon } from '../../assets/icons/car.svg'
import { ReactComponent as MotoIcon } from '../../assets/icons/moto.svg'
import { ReactComponent as SupportIcon } from '../../assets/icons/support.svg'
import { ReactComponent as ScheduleDetailIcon } from '../../assets/icons/lh.svg'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { PATH } from '../../constants/router'
import { useGlobalContext } from '../../context/GlobalContext'
import { openChatScreen } from '../../helper/zaloSDK'
import momoContent from "../../assets/img/momo-content.jpg"
import momoLogo from "../../assets/img/momoLogo.png"

export default function HomePage() {
  const BANNER = [
    {
      img: banner4,
      link: `${process.env.REACT_APP_DEPLOY_URL}/kiemtraphatnguoi`,

    },
    {
      img: banner5,
      link: "https://vucar.vn/?utm_source=TTDK&utm_medium=Partnership&utm_campaign=Partnership_TTDK",

    },
    {
      img: banner1,
      link: "https://ttdk.partner.saladin.vn/promo",

    },
    {
      img: banner2,
      link: "https://forms.gle/o3iGkaa63Ney5nq1A",

    },
    {
      img: banner3,
      link: `${process.env.REACT_APP_DEPLOY_URL}/contact-cooperation`,

    },
  ]
  const history = useHistory()
  const { handleGetUserPhone,handleGetUserName } = useGlobalContext();
  const [isVisible, setIsVisible] = useState(false)

  const handleRouter = async (path) => {
    handleGetUserPhone().then(data => {
      history.push(path)
    })
  }
  const handleGetUserInfor = async () => {
    try {
      handleGetUserName()
    } catch (error) {
      
    }
    try {
      await handleGetUserPhone()
    } catch (error) {
      setIsVisible(false)
      notification.error({
        message: "Có lỗi phát sinh. Vui lòng thử lại."
      })
    }
    setIsVisible(false)
  }

  useEffect(() => {
    setIsVisible(true)
    handleGetUserInfor()
  }, [])
  return (
    <div
      className="home-page"
    >
      <Carousel autoplay>
        {BANNER.map((v, index) => (
          <div key={index} className="slide">
            <a href={v.link} target="_blank">
              <img src={v.img} />
            </a>
          </div>
        ))}
      </Carousel>
      <div className="content">
        <div className="left box" onClick={() => handleRouter(PATH.CHECK_VIHCLE)}>
          <ScheduleIcon className="icon"> </ScheduleIcon>
          Đặt lịch đăng kiểm
        </div>
        <div className="right">
          <div className="first-box" onClick={() => handleRouter(PATH.MY_BOOKING_HYSTORY)}>
            <ScheduleDetailIcon className="icon-small" />
            Xem lịch hẹn
          </div>
          <div onClick={() => openChatScreen({ id: "3485707806416347108" })} className="second-box">
            <SupportIcon className="icon-small" />
            Hỗ trợ CSKH
          </div>
        </div>
      </div>
      <div className="second-content">
        <p className="title">Bảo Hiểm</p>
        <div className='d-flex'>
          <a href={`${process.env.REACT_APP_DEPLOY_URL}/gia-han-bao-hiem-tnds?title=Gia%20h%E1%BA%A1n%20b%E1%BA%A3o%20hi%E1%BB%83m%20TNDS`} target="_blank" className="right-content">
            <img src={carImage} alt="" srcset="" />
            <div>

              <div className="small-text mt-2">An toàn trên mọi nẻo đường</div>
              <div className="small-extra-text mt-2">
                <CarIcon className="small-icon" />
                Bảo hiểm TNDS Ô tô
              </div>
            </div>
          </a>
          <a href={"https://momo.vn/tin-tuc/khuyen-mai/dang-kiem-xe-dat-lich-hen-tren-momo-nhanh-gon-5947"} target="_blank" className="right-content">

            <img src={momoContent} alt="" srcset="" />
            <div>

              <div className="small-text mt-2">Đặt lịch đăng kiểm trên MOMO</div>
              <div className="small-extra-text mt-2">
                <img src={momoLogo} className="small-icon" />
                Ưu đãi 265.000Đ các dịch vụ cho xế yêu
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
