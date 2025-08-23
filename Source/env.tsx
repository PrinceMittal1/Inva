import { Platform } from "react-native"


const apiUrl = Platform.OS =='ios' ? 'http://localhost:5000/api/'  : 'http://10.0.2.2:5000/api/'

export {apiUrl}