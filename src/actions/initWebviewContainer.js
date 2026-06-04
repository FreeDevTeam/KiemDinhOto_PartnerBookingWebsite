import { LOCAL_STORAGE_KEYS, LocalStorageManager } from '../helper/localStorage'

const initWebviewContainer = (container) => {
  const containerCode = container?.ContainerCode

  if (!containerCode) {
    return
  }

  return LocalStorageManager.setItem(LOCAL_STORAGE_KEYS.WEBVIEW_CONTAINER_CODE, containerCode)
}

export {
  initWebviewContainer
}