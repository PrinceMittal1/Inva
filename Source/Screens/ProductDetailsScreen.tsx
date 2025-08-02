import { useEffect, useState } from "react"
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native"
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useRoute } from "@react-navigation/native";
import { wp } from "../Keys/dimension";
import FastImage from "@d11/react-native-fast-image";

const ProductDetail = () => {
    const fireUtils = useFireStoreUtil();
    const styles = useStyles();
    const route: any = useRoute();
    const [detail, setDetail] = useState<any>({});
    const [activeIndex2, setActiveIndex2] = useState(0);

    const getProductDetail = async () => {
        const res: any = await fireUtils.getProduct(route?.params?.productId);
        setDetail(res)
        console.log("res in screen is --- ", res)
    }

    useEffect(() => {
        getProductDetail();
    }, [])


    return (
        <ScrollView style={{ flex: 1 }}>
            <View style={{ height: wp(120), width: wp(90), borderRadius: 10, alignSelf: "center", marginTop: 10 }} >
                <FlatList
                    onMomentumScrollEnd={(event) => {
                        const contentOffsetX = event.nativeEvent.contentOffset.x;
                        const currentIndex = Math.round(contentOffsetX / wp(85));
                        setActiveIndex2(currentIndex)
                    }}
                    data={detail?.images}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index?.toString()}
                    bounces={false}
                    style={{ height: wp(120), width: '100%' }}
                    horizontal
                    pagingEnabled
                    renderItem={({ item, index }: any) => {
                        return (
                            <View style={{ width: wp(90), height: wp(120), borderRadius: 10, overflow: "hidden", backgroundColor: 'grey' }}>
                                <FastImage
                                    style={styles.carImg}
                                    source={{ uri: item }}
                                    resizeMode="contain">
                                </FastImage>
                            </View>
                        );
                    }}

                />
            </View>

            <View style={{width:wp(90), alignSelf:'center'}}>
                <View>
                    <Text>{`Views ${detail?.title}`}</Text>
                </View>
                <Text style={{fontWeight:900}}>{detail?.viewCount}</Text>
                <Text>{`Product Type : ${detail?.productType}`}</Text>


            </View>

        </ScrollView>
    )
}

const useStyles = () =>
    StyleSheet.create({
        carImg: {
            height: "100%",
            width: "100%",
            borderRadius: 10
        },
    })

export default ProductDetail