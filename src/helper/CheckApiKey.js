export const CheckApiKey = () => {
  let params = new URLSearchParams(document.location.search)
  // const searchParams = window.location.href
  // const webSaladin = 'saladin.ttdk.com.vn'
  // const webSaladin = 'localhost'

  // if (searchParams.includes(webSaladin)) {
    // return window.location.href = "https://saladin.ttdk.com.vn/booking?apikey=fe58f4e7-29ac-4ade-86b1-d51a3b0602a5"
    // return window.location.href = "http://localhost:3000/booking?apikey=fe58f4e7-29ac-4ade-86b1-d51a3b0602a5"
  // }
  let apikey
  const _TTDKMiniAppKey = process.env.REACT_APP_BOOKING_API_KEY
  if (_TTDKMiniAppKey) {
    return (apikey = _TTDKMiniAppKey)
  } else {
    return apikey = localStorage.getItem('API_KEY')
    // return (apikey = params.get('apikey'))
  }
}
