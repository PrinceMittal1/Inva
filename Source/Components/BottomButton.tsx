import { Dimensions, Image, Platform, Pressable, StatusBar, Text, View } from "react-native"
import Images from "../Keys/Images";
import { hp, wp } from "../Keys/dimension";
import { useNavigation } from "@react-navigation/native";
import Colors from "../Keys/colors";
import AppFonts from "../Functions/Fonts";


const {width, height} = Dimensions.get('window')
const BottomButton = ({title = "Header",clickable,btnStyle  } : any) =>{

    
    return(
        <Pressable onPress={clickable} style={[{width:width *0.9, padding:12, borderRadius:5, alignSelf:'center', alignItems:'center', backgroundColor:Colors?.buttonPrimaryColor, flexDirection:'row'}, btnStyle]}>
            <View style={{flex:10, justifyContent:'center', alignItems:'center'}}>
                <Text style={{color:'#FFFFFF', fontFamily:AppFonts.Regular, fontSize:16}}>{title}</Text>
            </View>
        </Pressable>
    )
}

export default BottomButton