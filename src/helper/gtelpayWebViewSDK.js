import { GTELPAY_CONFIG, decryptAccessCode, decryptConsentData } from '../constants/gtelpayConfig';
import GtelpayApiService from '../services/gtelpayApiService';

class GtelpayWebViewSDK {
  static isEnabled() {
    return GTELPAY_CONFIG.isEnabled;
  }

  static isFromGtelpayUniversalLink() {
    if (!this.isEnabled()) {
      return false;
    }
    const params = new URLSearchParams(window.location.search);
    return !!(params.get('access_code') && params.get('key') && params.get('transaction_id'));
  }

  static parseUniversalLinkParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {
      encryptedAccessCode: params.get('access_code'),
      encryptedKey: params.get('key'),
      transactionId: params.get('transaction_id')
    };
    
    if (!result.encryptedAccessCode || !result.encryptedKey || !result.transactionId) {
      throw new Error('[Gtelpay] Missing required URL parameters: access_code, key, or transaction_id');
    }
    
    return result;
  }

  static async decryptAccessCodeFromLink(encryptedAccessCode, encryptedKey) {
    try {
      if (!encryptedAccessCode || !encryptedKey) {
        throw new Error('Missing encrypted access_code or key');
      }
      return await decryptAccessCode(encryptedKey, encryptedAccessCode);
    } catch (error) {
      console.error('[Gtelpay] Error decrypting access_code:', error);
      throw error;
    }
  }

  static async getAccessToken(accessCode, transactionId) {
    try {
      const tokenData = await GtelpayApiService.getAccessToken(accessCode, transactionId);
      return {
        accessToken: tokenData.access_token,
        transactionId: tokenData.transaction_id
      };
    } catch (error) {
      console.error('[Gtelpay] Error getting access token:', error);
      throw error;
    }
  }

  static async getUserInfo(accessToken, transactionId) {
    try {
      const userInfoData = await GtelpayApiService.getUserInfo(accessToken, transactionId);
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
      console.error('[Gtelpay] Error getting user info:', error);
      throw error;
    }
  }

  static async initializeWebView() {
    try {
      if (!this.isEnabled()) {
        return null;
      }
      const { encryptedAccessCode, encryptedKey, transactionId } = this.parseUniversalLinkParams();
      if (!encryptedAccessCode || !encryptedKey || !transactionId) {
        return null;
      }
      const accessCode = await this.decryptAccessCodeFromLink(encryptedAccessCode, encryptedKey);
      const { accessToken } = await this.getAccessToken(accessCode, transactionId);
      const userInfo = await this.getUserInfo(accessToken, transactionId);
      return userInfo;
    } catch (error) {
      console.error('[Gtelpay] Error initializing webview:', error);
      throw error;
    }
  }

  static cleanupUrlParams() {
    if (window.history?.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}

export default GtelpayWebViewSDK;
