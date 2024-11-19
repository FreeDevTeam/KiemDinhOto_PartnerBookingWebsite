import React from 'react'
import { ReactComponent as TrungTamDKIcon } from './../assets/Layout2Icons/L2ttdk.svg'
import { ReactComponent as GarageIcon } from './../assets/Layout2Icons/L2garage.svg'
import { ReactComponent as TramBDIcon } from './../assets/Layout2Icons/L2trambd.svg'
import { ReactComponent as CuuHoIcon } from './../assets/Layout2Icons/L2cuuho.svg'
import { ReactComponent as HoptacxaIcon } from './../assets/Layout2Icons/L2hoptx.svg'
import { ReactComponent as MuaBanXeIcon } from './../assets/Layout2Icons/L2muabanxe.svg'
import { ReactComponent as HocLaiXeIcon } from './../assets/Layout2Icons/L2hoclaixe.svg'
import { ReactComponent as ShowRoomIcon } from './../assets/Layout2Icons/L2showroom.svg'
import { ReactComponent as HangBHIcon } from './../assets/Layout2Icons/L2hangbh.svg'
import { ReactComponent as GiaHanBaoHiemTNDSIcon } from './../assets/Layout2Icons/L2ghbhtnds.svg'
import { ReactComponent as TVCaiTaoXeIcon} from './../assets/Layout2Icons/L2tvcaitaoxe.svg'
import { ReactComponent as DangKiemXeCuIcon } from './../assets/Layout2Icons/L2dkxc.svg'
import { ReactComponent as TuyendungIcon } from './../assets/Layout2Icons/L2tuyendung.svg'
import { ReactComponent as KienThucBHIcon } from './../assets/Layout2Icons/L2kienthucbh.svg'
import { ReactComponent as CongDongIcon } from './../assets/Layout2Icons/L2congdong.svg'
import { ReactComponent as DKxeKinhDoanhIcon } from './../assets/Layout2Icons/L2dkxekinhdoanh.svg'
import { ReactComponent as VucarIcon } from './../assets/Layout2Icons/L2vucar.svg'
import { ReactComponent as HuongDanDKIcon } from './../assets/Layout2Icons/L2huongdandk.svg'
import { ReactComponent as GiaHanDangKiemIcon } from './../assets/Layout2Icons/L2ghdk.svg'
import { ReactComponent as KhamSKIcon } from './../assets/Layout2Icons/L2Khamsklaixe.svg'
import { ReactComponent as DinhGiaXeIcon } from './../assets/Layout2Icons/L2dinhgiaxe.svg'
import { ReactComponent as DoiGPLX } from './../assets/Layout2Icons/L2doiGPLX.svg'
import { ReactComponent as UuDaiTuDoiTac } from './../assets/Layout2Icons/L2uudaitudoitac.svg'
import  Epass  from './../assets/Layout2Icons/epass.png'
import  DatXe  from './../assets/Layout2Icons/Datxe.png'
import { ReactComponent as TuVanDKIcon } from './../assets/Layout2Icons/L2tvdangkiem.svg'
import { ReactComponent as DangKiemXeMoiIcon } from './../assets/Layout2Icons/L2dkxm.svg'
import { ReactComponent as TuVanBaoHiemIcon } from './../assets/Layout2Icons/L2tvbh.svg'
import { ReactComponent as TuVanBaoDuongIcon } from './../assets/Layout2Icons/L2tvbd.svg'
import { ReactComponent as TuVanDangKiem } from './../assets/Layout2Icons/L2tvdk.svg'
import CucDKLogo from "./../assets/Layout2Icons/cucdk.png";
import DVCongLogo from "./../assets/Layout2Icons/dvcong.png";
import { STATIONS_TYPE } from './stationsList'
import { TTDK_INSURANCE_PARTNER } from './global'
import MICPartner from "./../assets/Layout2Icons/MIC.png";
import ZaloPartner from "./../assets/Layout2Icons/zalominiapp.png";
import MomoPartner from "./../assets/Layout2Icons/momo.png";
import BICPartner from "./../assets/Layout2Icons/BIC.png";
import BHSPartner from "./../assets/Layout2Icons/BHS.png";
import { PATH } from './router'
const EpassLogo = ()=> <div ><img style={{width:40,borderRadius:4,marginBottom:4,display:'inline'}} src={Epass}></img></div>
const DatXeLogo = ()=> <div ><img style={{width:40,borderRadius:4,marginBottom:4,display:'inline'}} src={DatXe}></img></div>

export const BTN_LIST_SERVICE = [
  {
    label: 'Trung tâm <br> đăng kiểm',
    icon: <TrungTamDKIcon></TrungTamDKIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.CENTER}&name=Trung tâm đăng kiểm`,
    
  },
  {
    label: 'Cứu hộ <br> đăng kiểm',
    icon: <CuuHoIcon></CuuHoIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.INSPECTION_RESCUE}&name=cuuho`,
  },
  {
    label: 'Hợp tác xã <br> vận tải',
    icon: <HoptacxaIcon></HoptacxaIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.TRANSPORT_COOPERATIVE}&name=htx`,
  },
  {
    label: 'Mua bán <br> xe cũ',
    icon: <ShowRoomIcon></ShowRoomIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.USED_CAR_TRADING}&name=muabanxe`,
  },
  {
    label: 'Đơn vị <br> bảo hiểm',
    icon: <GiaHanBaoHiemTNDSIcon></GiaHanBaoHiemTNDSIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.INSURANCE_COMPANY}&name=DonviBH`,
  },
  {
    label: 'Mua bán phụ <br> tùng ô tô',
    icon: <MuaBanXeIcon></MuaBanXeIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.SPARE_PARTS_DEALERSHIP}&name=Mua bán phụ tùng ô tô`,
  },
  {
    label: 'Bảo dưỡng <br> ô tô',
    icon: <TramBDIcon></TramBDIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.GARAGE}&name=Bảo dưỡng ô tô`,
  },
  {
    label: 'Bãi giữ xe',
    icon: <GarageIcon></GarageIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.PARKING_LOT}&name=Bãi giữ xe`,
  },
  {
    label: 'Đơn vị <br> cải tạo xe',
    icon: <HangBHIcon></HangBHIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.VEHICLE_RENOVATION_COMPANY}&name=caitao`,
  },
  {
    label: 'Trường học <br> lái xe',
    icon: <DangKiemXeCuIcon></DangKiemXeCuIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.DRIVING_SCHOOL}&name=Trường học lái xe`,
  },
  {
    label: 'Dịch vụ <br> lái xe hộ',
    icon: <HocLaiXeIcon></HocLaiXeIcon>,
    link: `${process.env.REACT_APP_DEPLOY_URL}/stations?type=${STATIONS_TYPE.CHAUFFEUR_SERVICE}&name=Dịch vụ lái xe hộ`,
  },
  {
    label: 'Tư vấn SX <br> phụ tùng xe',
    icon: <TVCaiTaoXeIcon></TVCaiTaoXeIcon>,
    link: `/stations?type=${STATIONS_TYPE.PARTS_MANUFACTURING_CONSULTANCY}&name=Tư vấn SX phụ tùng xe`,
  },
  {
    label: 'Khám sức <br> khỏe lái xe',
    icon: <KhamSKIcon></KhamSKIcon>,
    link: `/stations?type=${STATIONS_TYPE.DRIVER_HEALTH}&name=Khám sức khỏe lái xe`,
  },
]
export const CONVENIENCE_DRIVERS_BTN = [
  {
    label: 'Cộng đồng <br> review',
    icon: <CongDongIcon></CongDongIcon>,
    link: 'https://www.facebook.com/groups/940007330455923/?ref=share&mibextid=K35XfP',
  },
  {
    label: 'Gia hạn <br> BH TNDS',
    icon: <GiaHanBaoHiemTNDSIcon></GiaHanBaoHiemTNDSIcon>,
    link: '/check-vihcle?service=/gia-han-bao-hiem-tnds&redirect=0',
  },
  {
    label: 'Gia hạn <br> BH vật chất',
    icon: <GiaHanDangKiemIcon></GiaHanDangKiemIcon>,
    link: `/check-vihcle?service=https://ttdk.partner.saladin.vn/bao-hiem-vat-chat-toan-dien-xe-oto&redirect=1&bhvc=1`,
  },
  {
    label: 'Mua bán <br> xe cũ',
    icon: <VucarIcon></VucarIcon>,
    link: `https://vucar.vn/ban-xe?utm_source=TTDK&utm_medium=Landing%20Page&utm_campaign=C2B_TTDK`,
  },
  {
    label: 'Nhóm hỗ trợ <br> khách hàng',
    icon: <KienThucBHIcon></KienThucBHIcon>,
    link: 'https://www.facebook.com/groups/262350473627015',
  },
  {
    label: 'Nhóm chia sẻ <br> kinh nghiệm',
    icon: <TuVanDKIcon></TuVanDKIcon>,
    link: 'https://www.facebook.com/groups/316778718119573/',
  },
  //ẩn bớt các tính năng chưa cần thiết
  // {
  //   label: 'Mua bảo hiểm',
  //   icon: <KienThucBHIcon></KienThucBHIcon>,
  //   link: routes.insurance.path
  // },
  // {
  //   label: 'Mua bán phụ <br> tùng ô tô',
  //   icon: <DKxeKinhDoanhIcon></DKxeKinhDoanhIcon>,
  //   link: '/stations?type=11&name=Mua bán phụ tùng ô tô',
  // },
  // {
  //   label: 'Bảo dưỡng <br> ô tô',
  //   icon: <TramBDIcon></TramBDIcon>,
  //   link: '/stations?type=3&name=Bảo dưỡng ô tô',
  // },
  // {
  //   label: 'Dịch vụ <br> lái xe hộ',
  //   icon: <HocLaiXeIcon></HocLaiXeIcon>,
  //   link: '/stations?type=15&name=Dịch vụ lái xe hộ',
  // },
  // {
  //   label: 'Đăng ký <br> xe kinh doanh',
  //   icon: <HuongDanDKIcon></HuongDanDKIcon>,
  //   link: '/stations?type=9&name=Hợp tác xã',
  // },
  // {
  //   label: 'Tuyển dụng',
  //   icon: <TuyendungIcon></TuyendungIcon>,
  //   link: routes.recruitmentNews.path,
  // },
  {
    label: 'Định giá xe',
    icon: <DinhGiaXeIcon></DinhGiaXeIcon>,
    link: 'https://dinhgiaxe.ai.vn/',
  },
  //ẩn bớt các tính năng chưa cần thiết
  // {
  //   label: 'Đổi GPLX<br>trực tuyến',
  //   icon: <DoiGPLX></DoiGPLX>,
  //   link: routes.changeDriverLicense.path,
  // },
  // {
  //   label: 'Ưu đãi<br>từ đối tác',
  //   icon: <UuDaiTuDoiTac></UuDaiTuDoiTac>,
  //   link: routes.stationNewsPartnerPromotion.path,
  // },
   {
    label:  'Đăng ký <br /> dán thẻ ePass',
    icon: <EpassLogo ></EpassLogo>,
    link: "https://customer.epass-vdtc.com.vn/#/register/VDTC",

  },
    {
    label: 'Đặt lịch bảo dưỡng',
    icon: <DatXeLogo ></DatXeLogo>,
    link: "https://oga.datxe.com/dlbd/?apiKey=a7f4c2eb-057b-4596-b016-b386b49af723",
  },
]
export const GOVERNMENT_BTN = [
  {
    label: 'Cục Đăng Kiểm <br> Việt Nam',
    link: `/confirm-external-link?redirect=http://www.vr.org.vn/&title=cucdk`,
    icon: (
      <div className='layout1-partner-logo'>
        <img className='layout1-partner-img' src={CucDKLogo}/>
      </div>
    ),
  },
  {
    label: 'Cổng DV <br> Công QG',
    link: `/confirm-external-link?redirect=https://dichvucong.gov.vn/p/home/dvc-trang-chu.html&title=dvqg`,
    icon: (
      <div className='layout1-partner-logo'>
        <img className='layout1-partner-img' src={DVCongLogo}/>
      </div>
    ),
  },
]
export const PARTNER_BTN = {
  MOMO:{
    name: 'MOMO',
    partnerLandingPageUrl: 'https://momo.vn/',
    icon: (
      <div className='layout2-partner-logo'>
        <img className='layout2-partner-img' src={MomoPartner}/>
      </div>
    ),
  },
  MIC:{
    name: 'Bảo hiểm MIC',
    partnerLandingPageUrl: TTDK_INSURANCE_PARTNER.MIC,
    icon: (
      <div className='layout2-partner-logo'>
        <img className='layout2-partner-img' src={MICPartner}/>
      </div>
    )
  },
  ZALO:{
    name: 'ZALO',
    partnerLandingPageUrl: 'https://zalo.me/s/1199840672744416551/',
    icon: (
      <div className='layout2-partner-logo'>
        <img className='layout2-partner-img' src={ZaloPartner}/>
      </div>
    )
  },
  BIC:{
    name: 'Bảo hiểm BIC',
    partnerLandingPageUrl: `https://mybic.vn/danh-muc/bao-hiem-o-to-9.html`,
    icon: (
      <div className='layout2-partner-logo'>
        <img className='layout2-partner-img' src={BICPartner}/>
      </div>
    )
  },
  BHS:{
    name: 'Bảo hiểm BIC',
    partnerLandingPageUrl: `https://mybic.vn/danh-muc/bao-hiem-o-to-9.html`,
    icon: (
      <div className='layout2-partner-logo'>
        <img className='layout2-partner-img' src={BHSPartner}/>
      </div>
    )
  },
}

export const BOOKING_LIST_BTN = [
  {
    label: 'Đăng kiểm <br> xe định kỳ',
    icon: <DangKiemXeMoiIcon></DangKiemXeMoiIcon>,
    link: `${PATH.BOOKING}?scheduleType=1`,
    unOpen: true,
  },
  {
    label: 'Thay đổi <br> thông tin xe',
    icon: <DangKiemXeCuIcon></DangKiemXeCuIcon>,
    link: `${PATH.BOOKING}?scheduleType=4`,
    unOpen: true,
  },
  {
    label: 'Tư vấn <br> bảo hiểm TNDS',
    icon: <TuVanBaoHiemIcon></TuVanBaoHiemIcon>,
    link: `${PATH.BOOKING}?scheduleType=14`,
    unOpen: true,
  },
  {
    label: 'Tư vấn <br> bảo hiểm vật chất',
    icon: <TuVanBaoDuongIcon></TuVanBaoDuongIcon>,
    link: `${PATH.BOOKING}?scheduleType=8`,
    unOpen: true,
  },
  {
    label: 'Tư vấn <br> đăng kiểm',
    icon: <TuVanDangKiem></TuVanDangKiem>,
    link: `${PATH.BOOKING}?scheduleType=12`,
    unOpen: true,
  },
]