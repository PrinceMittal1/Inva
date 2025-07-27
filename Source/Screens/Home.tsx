import React, { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Dimensions, FlatList, Platform, Pressable, SafeAreaView, StatusBar, Text, View } from "react-native"
import Header from "../Components/Header"
import ImagePickerModal from "../Components/ImagePickerModal"
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import { useDispatch, useSelector } from "react-redux";
import { setUserId } from "../Redux/Reducers/userData";
import { useNavigation } from "@react-navigation/native";
import AppRoutes from "../Routes/AppRoutes";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import ProductBlock from "../Components/ProductBlock";
import Images from "../Keys/Images";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { getProductsForHome } from "../Apis";
import CommentModal from "../Components/Comments/CommentModal";

const { width, height } = Dimensions.get('window')
const Home = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const [allProducts, setAllProducts] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { user_id } = useSelector((state: any) => state.userData);
    const [visibleItems, setVisibleItems] = useState<{ [key: string]: number }>({});
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 70,
        minimumViewTime: 5000,
    });
    const [showComment, setShowComment] = useState({
        state: false,
        id: ''
    })
    const visibleItemsTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        // Clear timers for items that are no longer visible
        Object.keys(visibleItemsTimers.current).forEach(itemId => {
            if (!viewableItems.some(item => item.item.id === itemId)) {
                clearTimeout(visibleItemsTimers.current[itemId]);
                delete visibleItemsTimers.current[itemId];
            }
        });

        // Set timers for newly visible items
        viewableItems.forEach(({ item }) => {
            if (!visibleItemsTimers.current[item.id]) {
                visibleItemsTimers.current[item.id] = setTimeout(() => {
                    // This function will be called after 5 seconds of continuous visibility
                    handleItemViewed(item.id);

                    // Clear the timer after it's triggered
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

    let fetchingProducts = async () => {
        try {
            const products = await getProductsForHome({ customerUserId: user_id });
            // const fireUtils = useFireStoreUtil();
            // let products = await fireUtils.gettingProductForHome(user_id)
            setAllProducts(products)
        } catch (error) {
            console.error('❌ Failed to fetch products:', error);
        }
    }

    useEffect(() => {
        fetchingProducts();
    }, [])

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
                product.id === id
                    ? { ...product, saved: state }
                    : product
            )
        );
    }

    const savingItemToCompare = (id: any, state: boolean) => {
        setAllProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === id
                    ? { ...product, comparedAdded: state }
                    : product
            )
        );
    }

    // console.log("product consoling ------------ ", new Date().getMinutes(),new Date().getSeconds(), allProducts.length)

    const RenderItem = ({ item, index }: any) => {
        return (
            <ProductBlock item={item}
                statusChangingForFollow={statusChangingForFollow}
                onSharePress={() => { }}
                showShopName={true}
                onSavePress={savingItemInWishlist}
                onCommentPress={() => {
                    setShowComment({
                        state: true,
                        id: item?.id
                    })
                }}
                onComparisonPress={() => {

                }}
            />
        )
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', marginTop: (statusBarHeight + 0) }}>
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
                        state: false,
                        id: ''
                    })}
                />
            )}

        </SafeAreaView>
    )
}
export default Home