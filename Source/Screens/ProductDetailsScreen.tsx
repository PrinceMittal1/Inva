import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useRoute } from "@react-navigation/native";
import { wp } from "../Keys/dimension";
import FastImage from "@d11/react-native-fast-image";
import Header from "../Components/Header";
import Colors from "../Keys/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Images from "../Keys/Images";
import AppFonts from "../Functions/Fonts";
import { useDispatch, useSelector } from "react-redux";
import CommentModal from "../Components/Comments/CommentModal";

const ProductDetail = () => {
    const insets = useSafeAreaInsets();
    const fireUtils = useFireStoreUtil();
    const styles = useStyles();
    const route: any = useRoute();
    const [detail, setDetail] = useState<any>({});
    const [activeIndex2, setActiveIndex2] = useState(0);
    const { user_id } = useSelector((state: any) => state.userData);
    const [loader, setLoader] = useState(false)
    const [showComment, setShowComment] = useState({
        state: false,
        id: ''
    })

    const getProductDetail = async () => {
        setLoader(true)
        const res: any = await fireUtils.getProduct(route?.params?.productId, user_id);
        setDetail(res)
        setLoader(false)
    }

    useEffect(() => {
        getProductDetail();
    }, [])

    const formatCount = (num: number): string => {
        if (num < 1000) return num.toString();
        if (num < 1_000_000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    };

    const formatingDate = (timestamp: any) => {
        const date = new Date(timestamp * 1000);
        const options: any = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const LikingProduct = async () => {
        setDetail(prev => ({
            ...prev,
            isLiked: !prev.isLiked,
            likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1
        }));
        const fireUtils = useFireStoreUtil();
        const result = await fireUtils?.likingCard(route?.params?.productId, user_id);
        if (result) {
            setDetail(prev => ({
                ...prev,
                isLiked: result.state,
                likeCount: result.likeCount
            }));
        }
    }

    const onCommentPress = () => {
        setShowComment({
            state: true,
            id: route?.params?.productId
        })
    }

    const toggleSavingCollection = async () => {
        const fireUtils = useFireStoreUtil();
        const result = await fireUtils?.toggleSavingInWishlist(user_id, route?.params?.productId);
        if (result) {
            setDetail({ ...detail, saved: true })
        } else {
            setDetail({ ...detail, saved: false })
        }
        console.log("res in screen is --- ", result)
    }

    const onSharePress = () => {

    }


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
            <View style={{
                flex: 1, paddingTop: insets.top,
                paddingBottom: insets.bottom,
                backgroundColor: Colors?.PrimaryBackground,
            }}>
                <Header title={'Product Details'}
                    showbackIcon={true}
                />
                <View style={{ flex: 1 }}>
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
                                    <View style={{ width: wp(90), height: wp(120), borderRadius: 10, overflow: "hidden", backgroundColor: Colors?.PrimaryBackground }}>
                                        <FastImage
                                            style={styles.carImg}
                                            source={{ uri: item }}
                                            resizeMode="contain">
                                        </FastImage>
                                    </View>
                                );
                            }}

                        />

                        <View style={styles.imageDots}>
                            {Array.isArray(detail?.images) &&
                                detail?.images.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            index === activeIndex2 ? styles.activeDot : styles.inactiveDot
                                        ]}
                                    />
                                ))}
                        </View>
                    </View>

                    <View style={styles.productDetails}>
                        {detail?.title &&
                            <Text style={styles.productTitle}>{detail?.title}</Text>
                        }
                        {detail?.productType &&
                            <Text style={styles.productType}>{detail?.productType}</Text>
                        }
                        {detail?.createdAt &&
                            <Text style={styles.productDate}>{formatingDate(detail?.createdAt)}</Text>
                        }
                    </View>

                    <View style={styles.bottomView}>
                        <View style={styles.bottomSubview}>
                            <Pressable>
                                <Image source={Images.viewIcon} style={styles.bottomIcon} resizeMode="contain" />
                            </Pressable>
                            <Text style={styles.bottomCount}>
                                {detail?.viewCount > 0 ? formatCount(detail?.viewCount) : 0}
                            </Text>

                            <Pressable onPress={LikingProduct} style={styles.bottomIconMargin}>
                                <Image
                                    source={detail?.isLiked ? Images.filledHeart : Images.Heart}
                                    style={styles.bottomIcon}
                                    resizeMode="contain"
                                />
                            </Pressable>
                            <Text style={styles.bottomCount}>
                                {detail?.likeCount > 0 ? formatCount(detail?.likeCount) : 0}
                            </Text>

                            <Pressable onPress={onCommentPress} style={styles.bottomIconMargin}>
                                <Image source={Images.comment} style={styles.bottomIcon} resizeMode="contain" />
                            </Pressable>
                        </View>

                        <View style={styles.bottomRight}>
                            <Pressable onPress={toggleSavingCollection} style={styles.bottomIconMargin}>
                                <Image
                                    source={detail?.saved ? Images.savedFilled : Images.saved}
                                    style={styles.bottomIcon}
                                    resizeMode="contain"
                                />
                            </Pressable>

                            <Pressable onPress={onSharePress} style={styles.bottomIconMargin}>
                                <Image source={Images.share} style={styles.bottomIcon} resizeMode="contain" />
                            </Pressable>
                        </View>
                    </View>

                </View>

                {showComment?.state && (
                    <CommentModal
                        productId={showComment?.id}
                        visible={showComment?.state}
                        onCrossPress={() => setShowComment({
                            state: false,
                            id: ''
                        })}
                    />
                )}
            </View>
        </>
    )
}

const useStyles = () =>
    StyleSheet.create({
        carImg: {
            height: "100%",
            width: "100%",
            borderRadius: 10
        },
        productDetails: {
            width: '90%',
            alignSelf: 'center',
            marginTop: wp(1.5)
        },
        productTitle: {
            fontSize: 18,
            color: Colors?.DarkText,
            fontFamily: AppFonts.SemiBold
        },
        productType: {
            fontSize: 18,
            color: Colors?.DarkText,
            fontFamily: AppFonts.Regular,
            marginTop: wp(0.5)
        },
        dot: {
            height: 4,
            borderRadius: 3,
            marginHorizontal: 4
        },
        activeDot: {
            width: 20,
            backgroundColor: 'orange'
        },
        inactiveDot: {
            width: 10,
            backgroundColor: '#ccc'
        },
        productDate: {
            fontSize: 16,
            marginTop: wp(0.5)
        },
        bottomView: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: '90%',
            alignSelf: 'center',
            marginTop: wp(1.5)
        },
        imageDots: {
            flexDirection: "row",
            justifyContent: "center",
            position: "absolute",
            right: 0,
            left: 0,
            bottom: 4
        },
        bottomSubview: {
            flexDirection: "row",
            alignItems: "center"
        },
        bottomIcon: {
            height: 20,
            width: 20
        },
        bottomCount: {
            color: 'black',
            fontSize: 18,
            marginLeft: 4
        },
        bottomIconMargin: {
            marginLeft: 6
        },
        bottomRight: {
            flexDirection: 'row'
        }
    })

export default ProductDetail