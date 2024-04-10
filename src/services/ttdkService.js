import { notification } from "antd";
import Axios from "axios";
import queryString from "query-string";

const TTDK_API_KEY = process.env.REACT_APP_SYSTEM_API_KEY

const apiService = Axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 3000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiService.interceptors.response.use(
    response => response,
    error => {
        console.error('API error:', error);
        notification.error({
            message: "Đã xảy ra lỗi, vui lòng thử lại."
        })
        throw error;
    }
);
apiService.interceptors.response.use(
    response => {
        return response?.data;
    },
)

export const resetPassword = (phoneNumber) => {
    const query = {
        phoneNumber,
        apiKey: TTDK_API_KEY
    }
    const url = "/AppUsers/robot/resetUserPasswordByPhone?" + queryString.stringify(query)
    const res = apiService.post(url,{})
    return res
}
