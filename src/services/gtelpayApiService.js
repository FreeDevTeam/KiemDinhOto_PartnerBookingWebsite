import axios from 'axios';
import { GTELPAY_CONFIG, createSignature, verifyResponseSignature } from '../constants/gtelpayConfig';

const AGENT_GATEWAY_URL = process.env.REACT_APP_GTELPAY_AGENT_GATEWAY;

class GtelpayApiService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GTELPAY_API_KEY;
    this.partnerCode = process.env.REACT_APP_GTELPAY_PARTNER_CODE;
    this.partnerAppId = process.env.REACT_APP_GTELPAY_PARTNER_APP_ID;
  }

  async getAccessToken(accessCode, transactionId, retries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (!GTELPAY_CONFIG.isEnabled) {
          throw new Error('[Gtelpay] SDK not enabled');
        }
        const requestBody = {
          access_code: accessCode,
          transaction_id: transactionId
        };
        const jsonData = JSON.stringify(requestBody);
        const signature = await createSignature(jsonData);
        const response = await axios.post(
          `${AGENT_GATEWAY_URL}/get-token`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              'api_key': this.apiKey,
              'partner_code': this.partnerCode,
              'partner_app_id': this.partnerAppId,
              'signature': signature
            }
          }
        );

        // Verify response signature
        const responseSignature = response.headers['signature'];
        const responseBody = JSON.stringify(response.data);
        if (responseSignature) {
          await verifyResponseSignature(responseBody, responseSignature);
        }

        if (response.data.error_code !== '200') {
          throw new Error(`[Gtelpay] Get token failed: ${response.data.message}`);
        }
        return response.data.data;
      } catch (error) {
        lastError = error;
        if (attempt < retries - 1) {
          const delayMs = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    console.error('[Gtelpay] Get token error after retries:', lastError.message);
    throw lastError;
  }

  async getUserInfo(accessToken, transactionId, retries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (!GTELPAY_CONFIG.isEnabled) {
          throw new Error('[Gtelpay] SDK not enabled');
        }
        const requestBody = {
          transaction_id: transactionId
        };
        const jsonData = JSON.stringify(requestBody);
        const signature = await createSignature(jsonData);
        const response = await axios.post(
          `${AGENT_GATEWAY_URL}/get-user-info`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              'Authorization': `Bearer ${accessToken}`,
              'api_key': this.apiKey,
              'partner_code': this.partnerCode,
              'partner_app_id': this.partnerAppId,
              'signature': signature
            }
          }
        );

        // Verify response signature
        const responseSignature = response.headers['signature'];
        const responseBody = JSON.stringify(response.data);
        if (responseSignature) {
          await verifyResponseSignature(responseBody, responseSignature);
        }

        if (response.data.error_code !== '200') {
          throw new Error(`[Gtelpay] Get user info failed: ${response.data.message}`);
        }
        return response.data.data;
      } catch (error) {
        lastError = error;
        if (attempt < retries - 1) {
          const delayMs = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    console.error('[Gtelpay] Get user info error after retries:', lastError.message);
    throw lastError;
  }
}

const gtelpayApiService = new GtelpayApiService();
export default gtelpayApiService;
