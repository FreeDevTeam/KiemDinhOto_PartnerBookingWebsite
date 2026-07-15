export const handleBidvLogin = async (search = window.location.search) => {
  try {
    const params = new URLSearchParams(search)
    const phoneNumber = '0979111555'
    const uuid = (params.get('uuid') || '').trim()
    const fullName = (params.get('fullName') || '').trim()

    return {
      isSuccess: true,
      userProfile: { phoneNumber, fullName, username: uuid, email: '', token: '' }
    }
  } catch (error) {
    console.error('[BIDV Handler] Login failed', error)
    return { isSuccess: false, message: 'Đã xảy ra lỗi khi kết nối BIDV' }
  }
}
