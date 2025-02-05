export const isMobileDisplaySize=(width) => {
  var result = navigator.userAgent.toLowerCase();
  var android = result.indexOf("android") > -1;
  if (width > 988){
    return true
  }else{
    if(android){
      return false
    }
    return true
  }
}