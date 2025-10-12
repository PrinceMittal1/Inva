import { useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Dimensions, FlatList, Platform, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"
import useFireStoreUtil from "../Functions/FireStoreUtils";
import FastImage from "@d11/react-native-fast-image";
import { useSelector } from "react-redux";
import ProductBlock from "../Components/ProductBlock";
import Header from "../Components/Header";
import { getProductsForWishlistPage, handleItemViewed } from "../Apis";
import { useNavigation } from "@react-navigation/native";
import Images from "../Keys/Images";
import AppRoutes from "../Routes/AppRoutes";
import CommentModal from "../Components/Comments/CommentModal";

const WishList = () => {
    const [allProducts, setAllProducts] = useState<any>({});
    const { user_id } = useSelector((state: any) => state.userData);
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const [loading, setLoading] = useState<boolean>(false);
    const navigation = useNavigation();
    const [loader, setLoader] = useState(false)
    const [showComment, setShowComment] = useState({
        state: false,
        _id: ''
    })

    const fetchingWishListProduct = async () => {
        setLoader(true)
        try {
            const res = await getProductsForWishlistPage({ user_id });
            setAllProducts(res?.data?.products)
        } catch (e) {
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        fetchingWishListProduct()
    }, [])

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 70,
        minimumViewTime: 3500,
    });
    const visibleItemsTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        Object.keys(visibleItemsTimers.current).forEach(itemId => {
            if (!viewableItems.some(item => item.item.id === itemId)) {
                clearTimeout(visibleItemsTimers.current[itemId]);
                delete visibleItemsTimers.current[itemId];
            }
        });
        viewableItems.forEach(({ item }) => {
            if (!visibleItemsTimers.current[item._id]) {
                visibleItemsTimers.current[item._id] = setTimeout(async() => {
                    await handleItemViewed(item._id);
                    delete visibleItemsTimers.current[item._id];
                }, 3500);
            }
        });
    });

    const statusChangingForFollow = (id: any, state: boolean) => {
        setAllProducts(prevProducts =>
            prevProducts.map(product =>
                product._id === id
                    ? { ...product, follow: state }
                    : product
            )
        );
    }

    const savingItemInWishlist = (id: any, state: boolean) => {
        setAllProducts(prevProducts =>
            prevProducts.map(product =>
                product._id === id
                    ? { ...product, saved: state }
                    : product
            )
        );
    }


    const RenderItem = ({ item, index }: any) => {
        return (
            <ProductBlock 
                item={item}
                showFollowButton={true}
                statusChangingForFollow={statusChangingForFollow}
                showShopName={true}
                onSavePress={savingItemInWishlist}
                onComparisonPress={() => { }}
                onCommentPress={() => {
                    setShowComment({
                        state: true,
                        _id: item?._id
                    })
                }}
            />
        )
    }

    console.log("products are --------- ", allProducts)


    return (
        <>
            {loader
                && (
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
            <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(233, 174, 160, 0.1)", marginTop: (statusBarHeight + 0) }}>
                <Header title={'Saved Product'} />
                <FlatList
                    data={allProducts}
                    renderItem={RenderItem}
                    keyExtractor={(item, index) => `${index}-${item?.saved}`}
                    onViewableItemsChanged={onViewableItemsChanged.current}
                    viewabilityConfig={viewabilityConfig.current}
                    ListFooterComponent={loading ? <ActivityIndicator size="small" color="blue" /> : null}
                />
                {showComment?.state && (
                    <CommentModal
                        productId={showComment?._id}
                        visible={showComment?.state}
                        onCrossPress={() => setShowComment({
                            state: false,
                            _id: ''
                        })}
                    />
                )}
            </SafeAreaView>
        </>
    )
}

export default WishList