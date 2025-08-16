import { ActivityIndicator, View } from "react-native"


const Loader = () =>{
    return(
        <View style={{flex:1, position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 989,}}>
            <ActivityIndicator/>
        </View>
    )
}

export default Loader