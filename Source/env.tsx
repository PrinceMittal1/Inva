import { Platform } from "react-native"


const apiUrl = Platform.OS =='ios' ? 'http://52.66.138.60:3000/api/'  : 'http://52.66.138.60:3000/api/'

export {apiUrl}
