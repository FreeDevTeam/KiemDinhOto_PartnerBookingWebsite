import zaloAPI, { followOA } from "zmp-sdk";
import BookingService from '../services/addBookingService';

let isGettingPhone = false;

export async function getZaloUserPhone() {
    if (isGettingPhone) {
        throw new Error("Already getting phone number");
    }
    isGettingPhone = true;
    try {
      // Check permissions first
      const setting = await getSettingZalo();
      if (!setting || !setting['scope.userPhonenumber']) {
        // Authorize if not granted
        const authorized = await getZaloAuthorize();
        if (!authorized) {
          throw new Error("Authorization failed");
        }
      }

      const { token } = await new Promise((resolve, reject) => {
        zaloAPI.getPhoneNumber({
          success: resolve,
          fail: reject
        });
      });
      if (token) {
        const accessToken = await zaloAPI.getAccessToken();
        const data = {
          access_token: accessToken,
          code: token,
          secret_key: process.env.REACT_APP_ZALO_SECRECT_KEY,
        };
  
        const result = await BookingService.getZaloUserPhoneNumber(data);
        const { error, data: responseData } = result;
        if (error) {
          throw new Error(error);
        }
        if (responseData?.number) {
          return "0" + responseData.number.slice(2);
  
        }
        return ""
      }
      throw new Error("No token received");
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Truy vấn số điện thoại thất bại");
    } finally {
      isGettingPhone = false;
    }
  }

  export const getZaloUserName = async () => {
    try {
      const { userInfo } = await new Promise((resolve, reject) => {
        zaloAPI.getUserInfo({
          autoRequestPermission:true,
          success: resolve,
          fail: reject
        });
      });
      if (userInfo) {
        if (userInfo.name === 'User Name') {
          return '';
        } else {
          return {
            userName:userInfo.name,
            followOA: userInfo.followedOA
          };
        }
      } else {
        return ''
      }
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Truy vấn tên thất bại");
    }
  };
  export const getZaloAuthorize = async () => {
    let author = await zaloAPI.authorize({ scopes: ["scope.userInfo", "scope.userPhonenumber"] });
    if(author){
      return true
    }else{
      return false
    }
  };

  export const getSettingZalo = async () => {
    try {
      const { authSetting } = await new Promise((resolve, reject) => {
        zaloAPI.getSetting({
          success: resolve,
          fail: reject
        });
      });
      if (authSetting) {
        return authSetting;
      }else{
        return null
      }
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Truy vấn tên thất bại");
    }
  };
  export const followOAZalo = async () => {
    try {
      await zaloAPI.followOA({
        id: process.env.REACT_APP_ZOA_ID,
      });
    } catch (error) {
      return null
    }
  };
  export const openChatScreen = async ({
    id,
    message = "",
    type = "oa"
  }) => {
    try {
      await zaloAPI.openChat({
        type: type,
        id: id,
        message: message,
      });
    } catch (error) {
      throw new Error("Mở cửa sổ chat thất bại");
    }
  };
  export const openPhone = async (phoneNumber) => {
    try {
      await zaloAPI.openPhone({
        phoneNumber: phoneNumber,
      });
    } catch (error) {
      throw new Error("Mở cuộc gọi thất bại");
    }
  }