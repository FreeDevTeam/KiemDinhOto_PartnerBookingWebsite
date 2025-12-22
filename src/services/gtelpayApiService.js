import axios from 'axios';
import { GTELPAY_CONFIG } from '../context/GtelpayContext';

const API_TIMEOUT = 10000;

class GtelpayApiService {
  get config() {
    return GTELPAY_CONFIG;
  }

  isEnabled() {
    return typeof this.config.isEnabled === 'function'
      ? this.config.isEnabled()
      : this.config.isEnabled;
  }

  handleApiError(error, context = 'API call') {
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Request timeout after ${API_TIMEOUT}ms - please try again`);
    }
    if (error.response?.status) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.statusText || 'Request failed'}`);
    }
    if (error.message.startsWith('Gtelpay error') || error.message.includes('Invalid')) {
      throw error;
    }
    throw new Error(`Failed to ${context}: ${error.message}`);
  }

  /** Parse GTEL URL params */
  async parseConsentUrl() {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const access_code = params.get('access_code');
      const key = params.get('key'); // This is encrypted_key (RSA encrypted AES key)
      const transaction_id = params.get('transaction_id');

      if (!access_code || !key || !transaction_id) {
        return null;
      }

      // Return raw values to avoid double encoding when sent via POST body
      return {
        access_code: access_code,
        encrypted_key: key,
        transaction_id: transaction_id
      };
    } catch (error) {
      console.error('parseConsentUrl error:', error);
      return null;
    }
  }

  /**
   * Get access token from BE
   */
  async getAccessToken(access_code, encrypted_key, transaction_id) {
    if (!this.isEnabled()) return null;

    if (!access_code || !encrypted_key || !transaction_id) {
      throw new Error('Missing required parameters for getToken');
    }

    try {
      const response = await axios.post(
        `${this.config.backendUrl}/GtelPayBridge/system/getToken`,
        {
          access_code,
          encrypted_key,
          transaction_id
        },
        { timeout: API_TIMEOUT }
      );

      const data = response.data;
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response structure from Gtelpay');
      }

      // Check for errors at backend level or inside data.data
      const errorCode = data.error_code || data.data?.error_code;
      if (errorCode && errorCode !== '200') {
        const errorMessage = data.message || data.data?.message || 'Unknown error';
        throw new Error(`Gtelpay error ${errorCode}: ${errorMessage}`);
      }

      if (!data.data || !data.data.access_token) {
        throw new Error('Invalid token response - no access_token received');
      }

      return {
        access_token: data.data.access_token,
        transaction_id: data.data.transaction_id
      };
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async getUserInfo(access_code, encrypted_key, transaction_id) {
    if (!this.isEnabled()) return null;
    if (!access_code || !encrypted_key || !transaction_id) {
      throw new Error('Missing required parameters for getUserInfo');
    }
    try {
      const response = await axios.post(
        `${this.config.backendUrl}/GtelPayBridge/getUserInfo`,
        { access_code, encrypted_key, transaction_id },
        { timeout: API_TIMEOUT }
      );

      const data = response.data;
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response structure from Gtelpay');
      }

      // Check for errors at backend level or inside data.data
      const errorCode = data.error_code || data.data?.error_code;
      if (errorCode && errorCode !== '200') {
        const errorMessage = data.message || data.data?.message || 'Unknown error';
        throw new Error(`Gtelpay error ${errorCode}: ${errorMessage}`);
      }

      // Response format: { error_code, message, data: { userInfo, transaction_id } }
      const gtelResponse = data.data;
      if (!gtelResponse || typeof gtelResponse !== 'object') {
        throw new Error('Invalid GTEL response structure');
      }

      if (!gtelResponse.userInfo) {
        throw new Error('Invalid user info response - no userInfo received');
      }

      const userInfo = gtelResponse.userInfo;

      if (typeof userInfo !== 'object' || Object.keys(userInfo).length === 0) {
        throw new Error('User info incomplete - received empty object from Gtelpay');
      }

      const hasRequiredFields = userInfo.full_name || userInfo.phone_no || userInfo.email;
      if (!hasRequiredFields) {
        throw new Error('User info incomplete - missing all required fields');
      }

      return {
        fullName: userInfo.full_name || '',
        phoneNumber: userInfo.phone_no || '',
        email: userInfo.email || '',
        rawData: userInfo,
      };
    } catch (error) {
      this.handleApiError(error, 'get user info');
    }
  }

  /** Execute GTEL consent flow */
  async executeGtelpayFlow() {
    try {
      // Step 1: Parse encrypted params from URL
      const encryptedData = await this.parseConsentUrl();
      if (!encryptedData) {
        throw new Error('Invalid or missing Gtelpay URL parameters (access_code, key, transaction_id)');
      }

      // Step 2: Single-call flow: send consent params to BE and receive user info
      const userInfo = await this.getUserInfo(
        encryptedData.access_code,
        encryptedData.encrypted_key,
        encryptedData.transaction_id
      );

      return userInfo;
    } catch (error) {
      throw error;
    }
  }
}

const gtelpayApiService = new GtelpayApiService();
export default gtelpayApiService;
