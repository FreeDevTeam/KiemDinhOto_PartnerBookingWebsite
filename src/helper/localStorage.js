if (!process.env.REACT_APP_PROJECT_NAME) {
  console.log('No variable REACT_APP_PROJECT_NAME! file .env')
}

const PROJECT_NAME = process.env.REACT_APP_PROJECT_NAME || ''

const addKeyLocalStorage = (key) => {
  return PROJECT_NAME + '_' + key
}

export default addKeyLocalStorage

export const saveClickToLocalStorage = ({ localStorageKey, targetId }) => {
  const existingData = JSON.parse(localStorage.getItem(addKeyLocalStorage(localStorageKey))) || {}
  if (existingData[targetId]) {
    existingData[targetId].count += 1
    existingData[targetId].lastClicked = Date.now()
  } else {
    existingData[targetId] = {
      targetId,
      count: 1,
      lastClicked: Date.now()
    }
  }

  if (JSON.stringify(existingData)) {
    localStorage.setItem(addKeyLocalStorage(localStorageKey), JSON.stringify(existingData))
  }
}