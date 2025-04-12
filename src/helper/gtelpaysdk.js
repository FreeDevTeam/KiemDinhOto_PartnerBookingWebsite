;(function (root) {
  root.GtelPayJSBridge = root.GtelPayJSBridge || {}
  /**
   * Contains all GtelPayJSBridge API classes and functions.
   * @name GtelPayJSBridge
   * @namespace
   *
   * Contains all GtelPayJSBridge API classes and functions.
   */
  var GtelPayJSBridge = root.GtelPayJSBridge
  /**
   * App show loading indicator.
   */
  GtelPayJSBridge.showLoadingIndicator = function () {
    if (GtelPayJSBridge && GtelPayJSBridge.call) {
      GtelPayJSBridge.call("ShowLoadingIndicator")
    }
  }

  /**
   * App hide loading indicator.
   */
  GtelPayJSBridge.hideLoadingIndicator = function () {
    if (GtelPayJSBridge && GtelPayJSBridge.call) {
      setTimeout(() => {
        GtelPayJSBridge.call("HideLoadingIndicator")
      }, 100)
    }
  }

  /**
   * Pay order
   * @param  {object} order
   */
  GtelPayJSBridge.payOrder = function (order) {
    if (GtelPayJSBridge && GtelPayJSBridge.call) {
      GtelPayJSBridge.call("PayOrder", order)
    }
  }
})(this)
