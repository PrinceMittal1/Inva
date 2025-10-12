import React, { useEffect } from "react";
import keys from "../Routes/AppRoutes";
import Login from "../Screens/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from "../Screens/SplashScreen";
import { View } from "react-native";
import ScreenForUserDetails from "../Screens/ScreenForUserDetails";
import { useSelector } from "react-redux";
import Loader from "../Components/Loader";
import Home from "../Screens/Home";
import BottomTabs from "./BottomNavigation";
import SellerProfile from "../Screens/SellerProfilePage";
import WishList from "../Screens/WishList";
import Chat from "../Screens/Chat";
import ProductDetail from "../Screens/ProductDetailsScreen";
import VerificationScreen from "../Screens/VerificationScreen";
import { initAppsFlyer, setupDeepLinkListeners } from "../Functions/AppsFlyerConfig";
import { useNavigation } from "@react-navigation/native";
import Terms from "../Screens/Terms";
import PrivacyPolicy from "../Screens/PrivacyPolicy";
import { logEvent } from "../Functions/EventFunction";
import EditProfile from "../Screens/EditProfile";

const MainStack = () => {
    const Stack = createNativeStackNavigator();
    const { userData, user_id } = useSelector((state: any) => state.userData);
    const navigation = useNavigation();
    const { loading } = useSelector((state: any) => state?.tempData)



    setTimeout(() => {
        let obj: any = {}
        if (user_id) { obj.user_id = user_id };
        if (userData?.age) { obj.age = Number(userData?.age) }
        if (userData?.city) { obj.city = userData.state.toString().slice(0, 39) }
        if (userData?.state) { obj.state = userData.state.toString().slice(0, 39) }
        if (userData?.gender) { obj.gender = userData.gender }
        if (userData?.interest) {
            const result = userData?.interest.join("_");
            obj.interests = result.toString().slice(0, 39)
        }
        logEvent('CaptureTime_InvaCst', obj)
    }, 15000);

    useEffect(() => {
        initAppsFlyer();
        setupDeepLinkListeners(navigation);
    }, [navigation]);
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name={keys.Splash} component={Splash} />
                <Stack.Screen name={keys.Login} component={Login} />
                <Stack.Screen name={keys.VerificationScreen} component={VerificationScreen} />
                <Stack.Screen name={keys.ScreenForUserDetail} component={ScreenForUserDetails} />
                <Stack.Screen name={keys.SellerProfile} component={SellerProfile} />
                <Stack.Screen name={keys.EditProfile} component={EditProfile} />
                <Stack.Screen name={keys.WishList} component={WishList} />
                <Stack.Screen name={keys?.Chat} component={Chat} />
                <Stack.Screen name={keys?.productDetail} component={ProductDetail} />
                <Stack.Screen name={keys.BottomBar} component={BottomTabs} />
                <Stack.Screen name={keys?.PrivacyPolicy} component={PrivacyPolicy} />
                <Stack.Screen name={keys?.Terms} component={Terms} />
            </Stack.Navigator>
            {loading && <Loader />}</>
    )
}

export default MainStack