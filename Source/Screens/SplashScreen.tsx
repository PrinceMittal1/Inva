import React, { useEffect } from "react"
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text } from "react-native"
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import keys from "../Routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { setLoader } from "../Redux/Reducers/tempData";
import { setUserId } from "../Redux/Reducers/userData";
import AppRoutes from "../Routes/AppRoutes";

const Splash = () => {
    const navigation = useNavigation();
    const { user_id, userData } = useSelector((state: any) => state.userData)

    useEffect(() => {
        if (user_id && userData?.age && userData?.gender) {
            navigation.replace(AppRoutes.BottomBar)
        } else if (user_id) {
            navigation.replace(AppRoutes?.ScreenForUserDetail)
        } else {
            navigation.replace(AppRoutes?.Login)
        }
        //  navigation.navigate(AppRoutes?.ScreenForUserDetail)
    }, [user_id])

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}/>
    )
}

export default Splash
const styles = StyleSheet.create({
})