import { useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Dimensions, FlatList, Platform, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"
import useFireStoreUtil from "../Functions/FireStoreUtils";
import FastImage from "@d11/react-native-fast-image";
import { useSelector } from "react-redux";
import ProductBlock from "../Components/ProductBlock";
import Header from "../Components/Header";
import { getProductsForWishlistPage } from "../Apis";
import { useNavigation } from "@react-navigation/native";
import Images from "../Keys/Images";
import AppRoutes from "../Routes/AppRoutes";

const WishList = () => {
    const [allProducts, setAllProducts] = useState<any>({});
    const { user_id } = useSelector((state: any) => state.userData);
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const [loading, setLoading] = useState<boolean>(false);
    const navigation = useNavigation();
    const [showComment, setShowComment] = useState({
        state : false,
        id : ''
    })

    const fetchingWishListProduct = async () => {
        try {
            const products = await getProductsForWishlistPage({ customerUserId: user_id });
            setAllProducts(products)
        } catch (e) {
        }
    }

    useEffect(() => {
        fetchingWishListProduct()
    }, [])

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 70,
        minimumViewTime: 5000,
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
            if (!visibleItemsTimers.current[item.id]) {
                visibleItemsTimers.current[item.id] = setTimeout(() => {
                    handleItemViewed(item.id);
                    delete visibleItemsTimers.current[item.id];
                }, 5000);
            }
        });
    });

    const handleItemViewed = async (productId: string) => {
        const fireUtils = useFireStoreUtil();
        let resultOfView = await fireUtils.recordingView(productId)
        setAllProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === productId
                    ? { ...product, viewCount: resultOfView } // New object
                    : product
            )
        );
    };

    const statusChangingForFollow = (id: any, state: boolean) => {
        setAllProducts(prevProducts =>
            prevProducts.map(product =>
                product.user_id === id
                    ? { ...product, follow: state }
                    : product
            )
        );
    }

    const savingItemInWishlist = (id: any, state: boolean) => {
        setAllProducts(prevProducts =>
            prevProducts.map(product =>
                product.user_id === id
                    ? { ...product, saved: state }
                    : product
            )
        );
    }


    const RenderItem = ({ item, index }: any) => {
        return (
            <ProductBlock item={item}
                showFollowButton={true}
                statusChangingForFollow={statusChangingForFollow}
                showShopName={true}
                onSharePress={() => { }}
                onSavePress={savingItemInWishlist}
                onComparisonPress={() => { }}
                onCommentPress={()=>{
                    setShowComment({
                        state :true,
                        id : item?.id
                    })
                }}
            />
        )
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', marginTop: (statusBarHeight + 0) }}>
            <Header title={'Saved Product'}/>
            <FlatList
                data={allProducts}
                renderItem={RenderItem}
                keyExtractor={(item) => `${item.id}-${item.follow}-${item.saved}`}
                onViewableItemsChanged={onViewableItemsChanged.current}
                viewabilityConfig={viewabilityConfig.current}
                ListFooterComponent={loading ? <ActivityIndicator size="small" color="blue" /> : null}
            />
            {showComment?.state && (
                          <CommentModal
                            productId={showComment?.id}
                            visible={showComment?.state}
                            onCrossPress={() => setShowComment({
                                state : false,
                                id : ''
                            })}
                          />
                        )}
        </SafeAreaView>
    )
}

export default WishList