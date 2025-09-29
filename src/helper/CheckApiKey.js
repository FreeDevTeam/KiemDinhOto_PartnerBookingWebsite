export const CheckApiKey = () => {
  let params = new URLSearchParams(document.location.search)
  // const searchParams = window.location.href
  // const webSaladin = 'saladin.ttdk.com.vn'
  // const webSaladin = 'localhost'

  // if (searchParams.includes(webSaladin)) {
    // return window.location.href = "https://saladin.ttdk.com.vn/booking?apikey=03fb7757-5b0f-482a-8b66-db106404058b"
    // return window.location.href = "http://localhost:3000/booking?apikey=03fb7757-5b0f-482a-8b66-db106404058b"
  // }
  let apikey
  const _TTDKMiniAppKey = process.env.REACT_APP_BOOKING_API_KEY
  if (_TTDKMiniAppKey) {
    return (apikey = _TTDKMiniAppKey)
  } else {
    return apikey = params.get('apikey') || localStorage.getItem('apiKey')
    // return (apikey = params.get('apikey'))
  }
}
