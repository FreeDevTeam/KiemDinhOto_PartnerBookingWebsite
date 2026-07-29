export const handleDefaultExit = async ({ history } = {}) => {
  if (history && typeof history.goBack === 'function') {
    history.goBack()
  } else {
    window.history.back()
  }
}
