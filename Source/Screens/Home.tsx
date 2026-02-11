import React, { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Dimensions, FlatList, Platform, Pressable, SafeAreaView, StatusBar, Text, View } from "react-native"
import Header from "../Components/Header"
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AppRoutes from "../Routes/AppRoutes";
import ProductBlock from "../Components/ProductBlock";
import Images from "../Keys/Images";
import { getProductsForHome, handleItemViewed } from "../Apis";
import CommentModal from "../Components/Comments/CommentModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hp } from "../Keys/dimension";


const ListEmptyComponent = () => {
    return (
        <View style={{ width: '100%', height: hp(50), alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{fontSize:20}}>No product found</Text>
        </View>
    )
}


const { width, height } = Dimensions.get('window')
const Home = () => {
    const [allProducts, setAllProducts] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [loader, setLoader] = useState(false)
    const { user_id } = useSelector((state: any) => state.userData);
    const [visibleItems, setVisibleItems] = useState<{ [key: string]: number }>({});
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 70,
        minimumViewTime: 3500,
    });
    const [showComment, setShowComment] = useState({
        state: false,
        _id: ''
    })
    const focus = useIsFocused();
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
                visibleItemsTimers.current[item._id] = setTimeout(async () => {
                    await handleItemViewed(item._id);
                    delete visibleItemsTimers.current[item._id];
                }, 3500);
            }
        });
    });


    let fetchingProducts = async () => {
        setLoader(true)
        try {
            const res = await getProductsForHome({ customerUserId: user_id });
            setAllProducts(res?.data?.products)
        } catch (error) {
            console.error('❌ Failed to fetch products:', error);
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        focus && fetchingProducts();
    }, [focus])

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
            <ProductBlock item={item}
                statusChangingForFollow={statusChangingForFollow}
                showShopName={true}
                onSavePress={savingItemInWishlist}
                onCommentPress={() => {
                    setShowComment({
                        state: true,
                        _id: item?._id
                    })
                }}
                onComparisonPress={() => {

                }}
            />
        )
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
            <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(233, 174, 160, 0.1)', paddingTop: insets.top }}>
                <Header title={'Home'}
                    showbackIcon={false}
                    rightIcon={Images?.savedFilled}
                    rightClick={() => {
                        navigation.navigate(AppRoutes.WishList)
                    }}
                />

                <FlatList
                    data={allProducts}
                    renderItem={RenderItem}
                    keyExtractor={(item, index) => `${index}-${item?.saved}`}
                    onViewableItemsChanged={onViewableItemsChanged.current}
                    viewabilityConfig={viewabilityConfig.current}
                    ListEmptyComponent={ListEmptyComponent}
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
export default Home