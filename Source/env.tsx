import { Platform } from "react-native"


const apiUrl = Platform.OS =='ios' ? 'https://api.inva.net.in/api/'  : 'http://192.168.1.102:3000/api/'

// http://192.168.1.102:3000/api/
// http://127.0.0.1:3000/
// http://52.66.138.60:3000/api/
// https://api.inva.net.in/api/
// https://api.inva.net.in/api/content/inva/privacy_policy
export {apiUrl}
