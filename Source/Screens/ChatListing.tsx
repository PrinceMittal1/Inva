import { useEffect, useState } from "react";
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useSelector } from "react-redux";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { hp, wp } from "../Keys/dimension";
import FastImage from "@d11/react-native-fast-image";
import Header from "../Components/Header";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AppRoutes from "../Routes/AppRoutes";

const ChatListing = () => {
    const [allChat, setAllChats] = useState<any>([]);
    const fireUtils = useFireStoreUtil();
    const { user_id } = useSelector((state: any) => state.userData);
    const focus = useIsFocused();
    const navigation = useNavigation();
    const [loader, setLoader] = useState(false)
    const insets = useSafeAreaInsets();

    const gettingAllChats = async () => {
        setLoader(true)
        const result = await fireUtils?.gettingAllChats(user_id);
        if (result) {
            setAllChats(result);
        }
        setLoader(false)
    };

    useEffect(() => {
        if (focus) gettingAllChats();
    }, [focus]);

    const RenderItem = ({ item }: any) => {
        return (
            <Pressable
                onPress={() => {
                    navigation.navigate(AppRoutes?.Chat, {
                        sellerId: item?.sellerId,
                        user_id: item?.customerId,
                        sellerDisplayName: item?.business_name
                    });
                }}
                style={styles.chatItem}
            >
                <View style={styles.imageContainer}>
                    <FastImage
                        source={{ uri: `${item?.business_picture}` }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.businessName}>{item?.business_name}</Text>
                    <Text>{item?.lastMessage}</Text>
                </View>

                <View style={styles.unseenContainer}>
                    {item?.unseenMessages && <Text>{item?.unseenMessages}</Text>}
                </View>
            </Pressable>
        );
    };

    return (
        <>
                    {loader && (
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 999
                        }}>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    )}
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardAvoiding}
                keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + hp(1) : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <>
                        <Header title={"Chats"} showbackIcon={true} />

                        <FlatList
                            data={allChat}
                            style={styles.list}
                            renderItem={RenderItem}
                        />
                    </>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
        </>
    );
};

export default ChatListing;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "rgba(233, 174, 160, 0.1)"
    },
    keyboardAvoiding: {
        flex: 1
    },
    list: {
        width: wp(95),
        alignSelf: "center"
    },
    chatItem: {
        backgroundColor: "grey",
        flexDirection: "row",
        alignItems: "center",
        padding: 5,
        marginTop: 10,
        borderRadius: 5
    },
    imageContainer: {
        flex: 1
    },
    image: {
        width: wp(12),
        height: wp(12),
        borderRadius: 25
    },
    textContainer: {
        flex: 7,
        marginLeft: wp(5)
    },
    businessName: {
        fontSize: 18
    },
    unseenContainer: {
        flex: 1
    }
});
