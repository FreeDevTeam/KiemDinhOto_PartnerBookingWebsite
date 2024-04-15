import zaloAPI from "zmp-sdk";
import BookingService from '../services/addBookingService';

export async function getZaloUserPhone() {
    try {
      const { token } = await new Promise((resolve, reject) => {
        zaloAPI.getPhoneNumber({
          success: resolve,
          fail: reject
        });
      });
      if (token) {
        const accessToken = await zaloAPI.getAccessToken();
        const headers = {
          access_token: accessToken,
          code: token,
          secret_key: process.env.REACT_APP_ZALO_SECRECT_KEY,
        };
  
        const result = await BookingService.getZaloUserPhoneNumber(headers);
        const { error, data } = result;
        if (error) {
          throw new Error(error);
        }
        if (data?.number) {
          return "0" + data.number.slice(2);
  
        }
        return ""
      }
      throw new Error();
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Truy vấn số điện thoại thất bại");
    }
  }
  
  export const getZaloUserName = async () => {
    try {
      const { userInfo } = await new Promise((resolve, reject) => {
        zaloAPI.getUserInfo({
          success: resolve,
          fail: reject
        });
      });
  
      if (userInfo) {
        if (userInfo.name === 'User Name') {
          return '';
        } else {
          return userInfo.name;
        }
      } else {
        return ''
      }
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Truy vấn số tên thất bại");
    }
  };
  