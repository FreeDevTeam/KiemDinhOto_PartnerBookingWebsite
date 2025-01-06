import MICPartner from "../assets/partner/mic.png";
import ZaloPartner from "../assets/partner/zalo.png";
import MomoPartner from "../assets/partner/momo.png";
import SaladinPartner from "../assets/partner/Saladin.png";
import CHSTPartner from "../assets/partner/cuuhosongthan.png";
import IphatnguoiPartner from "../assets/partner/inguoi.png";
import CameraGTSGPartner from "../assets/partner/cameraGTSG.png";
import VucarPartner from "../assets/partner/vucar.png";
import BaoGiaoThongPartner from "../assets/partner/baogiaothong.png";
import HTXHoaSenPartner from "../assets/partner/hoptacxahoasen.png";
import { TTDK_INSURANCE_PARTNER } from "./global";

var result = navigator.userAgent.toLowerCase();
var android = result.indexOf("android") > -1;
export const PARTNER = {
  BGT:{
    id: 1,
    name: 'Báo giao thông',
    partnerLandingPageUrl: 'https://www.baogiaothong.vn/',
    title: 'Báo\ngiao thông',
    image: BaoGiaoThongPartner
  },
  MOMO:{
    id: 2,
    name: 'MOMO',
    partnerLandingPageUrl: 'https://momo.vn/tin-tuc/khuyen-mai/dang-kiem-xe-dat-lich-hen-tren-momo-nhanh-gon-5947',
    title: 'Momo',
    image: MomoPartner
  },
  SALADIN:{
    id: 3,
    ttdk:true,
    name: 'Bảo hiểm Saladin',
    partner:true,
    partnerLandingPageUrl: '/check-vihcle?service=/doi-tac-bao-hiem/saladin-bao-hiem-toan-dien&redirect=0',
    title: 'Saladin',
    hotline:'1900638454',
    image: SaladinPartner
  },
  ZALO: {
    id: 4,
    name: 'ZALO',
    partnerLandingPageUrl:'https://zalo.me/s/1199840672744416551/',
    title: 'Zalo',
    image: ZaloPartner
  },
  MIC: {
    id: 5,
    name: 'Bảo hiểm MIC',
    partner:true,
    partnerLandingPageUrl: TTDK_INSURANCE_PARTNER.MIC.link,
    title: 'Bảo hiểm\nQuân Đội',
    hotline:'1900558891',
    image: MICPartner
  },
  IPHATNGUOI:{
    id: 6,
    name: 'iphatnguoi',
    partnerLandingPageUrl: `${android ? 'https://play.google.com/store/apps/details?id=mgapps.tracuuphatnguoi' : 'https://apps.apple.com/app/id6465623641'}`,
    title: 'iNguoi',
    image: IphatnguoiPartner
  },
  GTSG: {
    id: 7,
    name: 'camera giao thông sài gòn',
    partnerLandingPageUrl: `${android ? 'https://play.google.com/store/apps/details?id=com.freeapp.camtraffic.traffic_cam' : 'https://apps.apple.com/vn/app/giao-th%C3%B4ng-s%C3%A0i-g%C3%B2n-camera/id1498353023?l=vi'}`,
    title: 'Camera\n giao thông',
    image: CameraGTSGPartner
  },
  VUCAR: {
    id: 8,
    name: 'Mua bán xe cũ Vucar',
    partnerLandingPageUrl: `https://vucar.vn/ban-xe?utm_source=TTDK&utm_medium=Landing%20Page&utm_campaign=C2B_TTDK`,
    title: `Vucar`,
    image: VucarPartner,
    auto:true,
  },
  CHST:{
    id: 9,
    name: 'Cứu hộ sóng thần',
    partnerLandingPageUrl: 'https://www.facebook.com/cuuho.songthan?mibextid=LQQJ4d',
    title: 'Sóng Thần',
    image: CHSTPartner
  },
  HTXHS:{
    id: 10,
    name: 'Hợp tác xã Hoa Sen',
    partnerLandingPageUrl: 'https://www.facebook.com/htxhoasen/',
    title: 'HTX\nHoa Sen',
    image: HTXHoaSenPartner
  },
}

