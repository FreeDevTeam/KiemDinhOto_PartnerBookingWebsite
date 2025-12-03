import { DKON_THEME } from "./DKON"
import { TTDK_THEME } from "./TTDK"
import { IHANOI_THEME } from "./IHANOI"

const themeName = process.env.REACT_APP_THEME_NAME
let themeIcons=TTDK_THEME
if(themeName=='DKON'){
  themeIcons=DKON_THEME
}else if(themeName=='IHANOI'){
  themeIcons=IHANOI_THEME
}else{
  themeIcons=TTDK_THEME
}

export default themeIcons
