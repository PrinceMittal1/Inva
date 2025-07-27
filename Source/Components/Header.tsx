import { Dimensions, Image, Platform, Pressable, StatusBar, Text, View } from "react-native"
import Images from "../Keys/Images";
import { hp, wp } from "../Keys/dimension";
import { useNavigation } from "@react-navigation/native";


const { width, height } = Dimensions.get('window')
const Header = ({ title = "Header", headerStyle, leftClick, rightClick, rightIcon, showbackIcon = true }: any) => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const navigation = useNavigation();
    return (
        <View style={[{ width: width * 0.95, padding: 12, borderRadius: 5, alignSelf: 'center', alignItems: 'center', backgroundColor: 'grey', flexDirection: 'row' }, headerStyle,]}>
            <View style={{ flex: 1 }}>
                {showbackIcon && <Pressable onPress={() => {
                    if (leftClick) {
                        leftClick();
                    } else {
                        navigation.goBack();
                    }
                }}>
                    <Image source={Images.back} style={{ width: wp(5), height: hp(3) }} resizeMode="contain" />
                </Pressable>}
            </View>
            <View style={{ flex: 10, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'black', fontSize: 16 }}>{title}</Text>
            </View>
            <View style={{ flex: 1 }}>
                {rightIcon && <Pressable onPress={() => {
                    if (rightClick) {
                        rightClick();
                    }
                }}>
                    <Image source={rightIcon} style={{ width: wp(5), height: hp(3) }} resizeMode="contain" />
                </Pressable>}
            </View>
        </View>
    )
}

export default Header