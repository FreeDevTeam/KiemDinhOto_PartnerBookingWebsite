export const CheckApiKey = () => {
  let params = new URLSearchParams(document.location.search)
  // const searchParams = window.location.href
  // const webSaladin = 'saladin.ttdk.com.vn'
  // const webSaladin = 'localhost'

  // if (searchParams.includes(webSaladin)) {
    // return window.location.href = "https://saladin.ttdk.com.vn/booking?apiKey=fe58f4e7-29ac-4ade-86b1-d51a3b0602a5"
    // return window.location.href = "http://localhost:3000/booking?apiKey=fe58f4e7-29ac-4ade-86b1-d51a3b0602a5"
  // }
  return params.get('apiKey') || params.get('apikey') || localStorage.getItem('apiKey') || localStorage.getItem('apikey') || process.env.REACT_APP_APIKEY
}
