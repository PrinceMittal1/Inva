import {
    Dimensions,
    FlatList,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import FastImage from "@d11/react-native-fast-image";
import "moment/locale/es";
import "moment/locale/it";
import "moment/locale/fr";
import "moment/locale/en-gb";
import { useSelector } from "react-redux";
import { hp, wp } from "../Keys/dimension";
import AppRoutes from "../Routes/AppRoutes";
import Images from "../Keys/Images";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import Colors from "../Keys/colors";
import AppFonts from "../Functions/Fonts";

const screenWidth = Dimensions.get("window").width;

const ProductBlock = ({
    item,
    showFollowButton = true,
    showShopName = true,
    onCommentPress,
    onSharePress,
    onSavePress,
    statusChangingForFollow
}: any) => {
    const styles = useStyles();
    const [blockItem, setBlockItem] = useState(item);
    const navigation = useNavigation() as any;
    const { user_id } = useSelector((state: any) => state.userData);
    const [activeIndex2, setActiveIndex2] = useState(0);

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

    const toggleFollowInSubcollections = async () => {
        const fireUtils = useFireStoreUtil();
                console.log("Results ------------- ", blockItem?.user_id, user_id)
        const result = await fireUtils?.toggleFollowInSubcollection(blockItem?.user_id, user_id);
 console.log("Results ------------- ------0000 ", result)
        statusChangingForFollow(blockItem?.user_id, !!result);
    };

    const toggleSavingCollection = async () => {
        const fireUtils = useFireStoreUtil();
        const result = await fireUtils?.toggleSavingInWishlist(user_id, blockItem?.id);
        onSavePress(blockItem?.id, !!result);
    };

    const LikingProduct = async () => {
        setBlockItem(prev => ({
            ...prev,
            isLiked: !prev.isLiked,
            likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1
        }));
        const fireUtils = useFireStoreUtil();
        const result = await fireUtils?.likingCard(blockItem?.id, user_id);
        if (result) {
            setBlockItem(prev => ({
                ...prev,
                isLiked: result.state,
                likeCount: result.likeCount
            }));
        }
    };

    return (
        <View style={styles.mainView}>
            <View style={showShopName && styles.sellerRow}>
                {showShopName &&
                    <Pressable
                        style={styles.sellerInfo}
                        onPress={() => {
                            navigation.navigate(AppRoutes?.SellerProfile, {
                                seller_id: blockItem?.businessUser?.seller_id
                            });
                        }}
                    >
                        <FastImage
                            source={{ uri: blockItem?.businessUser?.photo }}
                            style={styles.sellerImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.sellerName}>{blockItem?.businessUser?.name}</Text>
                    </Pressable>
                }

                {showFollowButton &&
                    <TouchableOpacity
                        onPress={toggleFollowInSubcollections}
                        style={styles.followBtn}
                    >
                        <Text style={styles.followBtnText}>
                            {blockItem?.follow ? "UnFollow" : "Follow"}
                        </Text>
                    </TouchableOpacity>
                }
            </View>

            <Pressable style={styles.productImageWrapper}>
                <FlatList
                    onMomentumScrollEnd={(event) => {
                        const contentOffsetX = event.nativeEvent.contentOffset.x;
                        const currentIndex = Math.round(contentOffsetX / wp(85));
                        setActiveIndex2(currentIndex);
                    }}
                    data={blockItem?.images}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, index) => index.toString()}
                    bounces={false}
                    horizontal
                    pagingEnabled
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.productImagePressable}
                            onPress={() => {
                                navigation.navigate(AppRoutes?.productDetail, {
                                    productId: blockItem?.id
                                });
                            }}
                        >
                            <FastImage
                                style={styles.carImg}
                                source={{ uri: item }}
                                resizeMode="cover"
                            />
                        </Pressable>
                    )}
                />
                <View style={styles.imageDots}>
                    {Array.isArray(blockItem?.images) &&
                        blockItem?.images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === activeIndex2 ? styles.activeDot : styles.inactiveDot
                                ]}
                            />
                        ))}
                </View>
            </Pressable>

            <View style={styles.productDetails}>
                {blockItem?.title &&
                    <Text style={styles.productTitle}>{blockItem?.title}</Text>
                }
                {blockItem?.productType &&
                    <Text style={styles.productType}>{blockItem?.productType}</Text>
                }
                {blockItem?.createdAt &&
                    <Text style={styles.productDate}>{formatingDate(blockItem?.createdAt)}</Text>
                }
            </View>

            <View style={styles.bottomView}>
                <View style={styles.bottomSubview}>
                    <Pressable>
                        <Image source={Images.viewIcon} style={styles.bottomIcon} resizeMode="contain" />
                    </Pressable>
                    <Text style={styles.bottomCount}>
                        {blockItem?.viewCount > 0 ? formatCount(blockItem?.viewCount) : 0}
                    </Text>

                    <Pressable onPress={LikingProduct} style={styles.bottomIconMargin}>
                        <Image
                            source={blockItem?.isLiked ? Images.filledHeart : Images.Heart}
                            style={styles.bottomIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                    <Text style={styles.bottomCount}>
                        {blockItem?.likeCount > 0 ? formatCount(blockItem?.likeCount) : 0}
                    </Text>

                    <Pressable onPress={onCommentPress} style={styles.bottomIconMargin}>
                        <Image source={Images.comment} style={styles.bottomIcon} resizeMode="contain" />
                    </Pressable>
                </View>

                <View style={styles.bottomRight}>
                    <Pressable onPress={toggleSavingCollection} style={styles.bottomIconMargin}>
                        <Image
                            source={blockItem?.saved ? Images.savedFilled : Images.saved}
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
    );
};

export default ProductBlock;

const useStyles = () =>
    StyleSheet.create({
        mainView: {
            width: screenWidth * 0.95,
            alignSelf: "center",
            backgroundColor:'#FFFFFF',
            padding: 10,
            marginTop: 10,
            borderWidth: 1,
            borderColor: '#FFFFFF',
            marginBottom: 10,
            borderRadius: 10,
        },
        sellerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        sellerInfo: {
            flexDirection: 'row',
            alignItems: 'center'
        },
        sellerImage: {
            width: 50,
            height: 50,
            borderRadius: 25
        },
        sellerName: {
            marginLeft: 10,
            fontSize: 18
        },
        followBtn: {
            borderWidth: 1,
            borderColor: 'black',
            padding: 5,
            paddingHorizontal: 20,
            borderRadius: 15
        },
        followBtnText: {
            fontSize: 18
        },
        productImageWrapper: {
            height: wp(100),
            width: screenWidth * 0.90,
            borderRadius: 10,
            alignSelf: "center",
            marginTop: 10
        },
        productImagePressable: {
            width: screenWidth * 0.90,
            height: wp(100),
            borderRadius: 10,
            overflow: "hidden",
        },
        carImg: {
            height: "100%",
            width: "100%",
            borderRadius: 10
        },
        imageDots: {
            flexDirection: "row",
            justifyContent: "center",
            position: "absolute",
            right: 0,
            left: 0,
            bottom: 4
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
        productDetails: {
            width: '95%',
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
        productDate: {
            fontSize: 16,
            marginTop: wp(0.5)
        },
        bottomView: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: '100%',
            alignSelf: 'center',
            marginTop: wp(1.5)
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
    });
