// miniappBridge.js
const DEFAULT_TIMEOUT_MS = 10000;

function generateRequestId() {
  return `MINIAPP_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeParseMaybeJson(data) {
  if (data == null) return null;
  if (typeof data === "object") return data;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

const MiniAppBridge = (() => {
  let initialized = false;
  let mode = "UNKNOWN";
  let targetOrigin = "*"; // dùng cho WEB_PARENT postMessage

  function detectMode() {
    // React Native WebView
    if (window?.ReactNativeWebView && typeof window?.ReactNativeWebView?.postMessage === "function") {
      return "REACT_NATIVE";
    }
    // Flutter InAppWebView
    if (window?.flutter_inappwebview && typeof window?.flutter_inappwebview?.callHandler === "function") {
      return "FLUTTER";
    }
    // iOS WKWebView
    if (window?.webkit?.messageHandlers?.miniappWebviewToSdk && window.webkit?.messageHandlers?.miniappWebviewToSdk?.postMessage) {
      return "IOS";
    }
    // Android JS Interface
    if (window?.AndroidWebview && typeof window.AndroidWebview?.miniappWebviewToSdk === "function") {
      return "ANDROID";
    }
    // Web embedded in iframe (partner web)
    if (window?.parent && window?.parent !== window) {
      return "WEB_PARENT";
    }
    return "UNKNOWN";
  }

  function init(options = {}) {
    mode = options.mode || detectMode();
    targetOrigin = options.targetOrigin || "*";
    initialized = true;

    return { mode, targetOrigin };
  }

  function sendToHostRaw(payload) {
    // payload có thể là object; nhiều bridge yêu cầu string JSON
    const asJson = typeof payload === "string" ? payload : JSON.stringify(payload);
    switch (mode) {
      case "REACT_NATIVE":
        // Native RN cần onMessage để nhận
        window.ReactNativeWebView.postMessage(asJson);
        return;

      case "FLUTTER":
        // Flutter có thể nhận object hoặc string tùy app đối tác
        // Thử object trước, nếu lỗi thì gửi string
        try {
          window.flutter_inappwebview.callHandler("miniappWebviewToSdk", payload);
        } catch {
          window.flutter_inappwebview.callHandler("miniappWebviewToSdk", asJson);
        }
        return;

      case "IOS":
        // iOS WKWebView messageHandlers thường nhận object tốt
        window.webkit.messageHandlers.miniappWebviewToSdk.postMessage(asJson);
        return;

      case "ANDROID":
        // Android interface thường nhận string
        window.AndroidWebview.miniappWebviewToSdk(asJson);
        return;

      case "WEB_PARENT":
        window.parent.postMessage(asJson, targetOrigin);
        return;

      default:
        // Không tìm thấy bridge
        throw new Error(
          `MiniAppBridge: Không tìm thấy bridge để gửi message. mode=${mode}. Bạn đã init() đúng môi trường chưa?`
        );
    }
  }

  /**
   * Gửi request sang host (SDK/native).
   * - noResponse=true: fire-and-forget (phù hợp cho EXIT vì webview có thể bị đóng ngay)
   * - noResponse=false: đợi host trả về qua window message (nếu host có phản hồi)
   */
  function sendToSdkAsyncCallback(request, options = {}) {
    if (!initialized) init(); // auto init nếu bạn quên gọi init()

    const noResponse = options.noResponse === true;
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const requestWithId = {
      request_id: request.request_id || generateRequestId(),
      ...request,
    };

    // gửi đi
    sendToHostRaw(requestWithId);

    if (noResponse) {
      // giống logic IGNORE: không chờ phản hồi
      return Promise.resolve({
        request_id: requestWithId.request_id,
        sender: "MINIAPP_SDK",
        event: "IGNORE",
        data: null,
      });
    }

    // chờ phản hồi từ host qua window message
    return new Promise((resolve, reject) => {
      let done = false;

      function cleanup() {
        window.removeEventListener("message", handler);
      }

      function handler(evt) {
        const msg = safeParseMaybeJson(evt.data);
        if (!msg) return;

        // Bạn có thể tùy chỉnh điều kiện match theo host của đối tác
        const isFromSdk = msg.sender === "MINIAPP_SDK";
        const sameRequest = msg.request_id && msg.request_id === requestWithId.request_id;

        if (isFromSdk && sameRequest) {
          done = true;
          cleanup();
          resolve(msg);
        }
      }

      window.addEventListener("message", handler);

      setTimeout(() => {
        if (done) return;
        cleanup();
        reject(new Error("MiniAppBridge: Timeout - không nhận phản hồi từ host/SDK"));
      }, timeoutMs);
    });
  }

  /**
   * Exit miniapp: gửi event EXIT sang host để host đóng webview/miniapp.
   * action: string (ví dụ 'STAY_CURRENT', 'GO_BACK', 'CLOSE'...) tuỳ đối tác define.
   */
  function exit(action = "STAY_CURRENT", data) {
    const request = {
      sender: "MINIAPP_WEBVIEW",
      event: "EXIT",
      data: {
        response: data,
        navigationAction: action,
      },
    };

    // noResponse=true vì webview có thể bị đóng ngay => không nên chờ
    return sendToSdkAsyncCallback(request, { noResponse: true });
  }

  return {
    init,
    exit,
    sendToSdkAsyncCallback, // nếu bạn cần gửi event khác
    detectMode, // debug
    getMode: () => mode,
  };
})();

export default MiniAppBridge;
