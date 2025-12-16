import axios from 'axios';
import {
  getGtelpayConfig,
  createSignature,
  verifyResponseSignature,
  decryptConsentData,
  decryptAccessCode
} from '../helper/gtelpaySDK';

const API_TIMEOUT = 10000;

class GtelpayApiService {
  get config() {
    return getGtelpayConfig();
  }

  async getAccessToken(accessCode, transactionId) {
    if (!this.config.isEnabled) return null;

    try {
      const requestBody = { access_code: accessCode, transaction_id: transactionId };
      const signature = await createSignature(JSON.stringify(requestBody));

      const response = await axios.post(
        `${this.config.agentGateway}/get-token`,
        requestBody,
        {
          timeout: API_TIMEOUT,
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'api_key': this.config.apiKey,
            'partner_code': this.config.partnerCode,
            'partner_app_id': this.config.partnerAppId,
            'signature': signature
          }
        }
      );

      if (response.headers['signature']) {
        await verifyResponseSignature(JSON.stringify(response.data), response.headers['signature']);
      }

      return response.data?.error_code === '200' ? response.data.data : null;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  async getUserInfo(accessToken, transactionId) {
    if (!this.config.isEnabled) return null;

    try {
      const requestBody = { transaction_id: transactionId };
      const signature = await createSignature(JSON.stringify(requestBody));

      const response = await axios.post(
        `${this.config.agentGateway}/get-user-info`,
        requestBody,
        {
          timeout: API_TIMEOUT,
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': `Bearer ${accessToken}`,
            'api_key': this.config.apiKey,
            'partner_code': this.config.partnerCode,
            'partner_app_id': this.config.partnerAppId,
            'signature': signature
          }
        }
      );

      if (response.headers['signature']) {
        await verifyResponseSignature(JSON.stringify(response.data), response.headers['signature']);
      }

      return response.data?.error_code === '200' ? response.data.data : null;
    } catch (error) {
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  async executeGtelpayFlow(params) {
    const { encryptedAccessCode, encryptedKey, transactionId } = params;

    try {
      const accessCode = await decryptAccessCode(encryptedKey, encryptedAccessCode);
      const tokenData = await this.getAccessToken(accessCode, transactionId);
      if (!tokenData) throw new Error('Failed to get access_token');

      const userInfoData = await this.getUserInfo(tokenData.access_token, transactionId);
      if (!userInfoData) throw new Error('Failed to get user info');

      if (userInfoData.consent_data) {
        const decryptedData = await decryptConsentData(userInfoData.consent_data);
        return {
          fullName: decryptedData.full_name || '',
          phoneNumber: decryptedData.phone_no || '',
          email: decryptedData.email || '',
          dateOfBirth: decryptedData.date_of_birth || '',
          gender: decryptedData.gender || '',
          nationality: decryptedData.nationality || '',
          legalNo: decryptedData.legal_no || '',
          legalIssueDate: decryptedData.legal_issue_date || '',
          legalExpiredDate: decryptedData.legal_expired_date || '',
          legalIssueBy: decryptedData.legal_issue_by || '',
          permanentResidence: decryptedData.permanent_residence || '',
          placeOfOrigin: decryptedData.place_of_origin || '',
          rawData: decryptedData
        };
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
}

const gtelpayApiService = new GtelpayApiService();
export default gtelpayApiService;
