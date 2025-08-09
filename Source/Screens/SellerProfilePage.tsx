import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Dimensions, FlatList, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"
import useFireStoreUtil from "../Functions/FireStoreUtils";
import FastImage from "@d11/react-native-fast-image";
import { useSelector } from "react-redux";
import ProductBlock from "../Components/ProductBlock";
import Header from "../Components/Header";
import { getProductsForSellerPage } from "../Apis";
import AppRoutes from "../Routes/AppRoutes";


const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
const SellerProfile = () => {
    const route: any = useRoute();
    const [sellerId, setSellerId] = useState('');
    const [sellerDetails, setSellerDetails] = useState<any>({});
    const [allProducts, setAllProducts] = useState<any>({});
    const { user_id } = useSelector((state: any) => state.userData);
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const [loading, setLoading] = useState<boolean>(false);
    const [showComment, setShowComment] = useState({
        state: false,
        id: ''
    })
    const navigation = useNavigation();

    const fetchingSellerProfile = async (id: any) => {
        try {
            const fireUtils = useFireStoreUtil();
            const response = await fireUtils.fetchingSellerProfile(id);
            setSellerDetails(response)
        } catch (e) {
        }
    }

    const fetchingSellerProduct = async (id: any) => {
        try {
            // const fireUtils = useFireStoreUtil();
            // const response = await fireUtils.fetchingSellerProducts(user_id, id);
            const products = await getProductsForSellerPage({ customerUserId: user_id, sellerId: id });
            setAllProducts(products)
        } catch (e) {
        }
    }

    useEffect(() => {
        setSellerId(route?.params?.seller_id);
    }, [route?.params?.seller_id])

    useEffect(() => {
        fetchingSellerProfile(route?.params?.seller_id)
        fetchingSellerProduct(route?.params?.seller_id)
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
                showShopName={false}
                onSharePress={() => { }}
                onSavePress={savingItemInWishlist}
                onComparisonPress={() => { }}
                onCommentPress={() => {
                    setShowComment({
                        state: true,
                        id: item?.id
                    })
                }}
            />
        )
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', marginTop: (statusBarHeight + 0) }}>
            <Header title={sellerDetails?.businessName} />

            <ScrollView>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: screenWidth * 0.95, alignSelf: 'center', marginTop: 5 }}>
                    <View style={{ flex: 4 }}>
                        <FastImage source={{ uri: sellerDetails?.profile_picture }} resizeMode="contain" style={{ width: '100%', height: screenWidth * 0.4 }} />
                    </View>

                    <View style={{ flex: 6 }}>
                        {(sellerDetails?.businessName || sellerDetails?.name) && <View>
                            <Text style={{ fontSize: 24 }}>{sellerDetails?.businessName ?? sellerDetails?.name}</Text>
                        </View>}

                        <View>
                            <Text style={{ fontSize: 22 }}>{`${sellerDetails?.address1 ? `${sellerDetails?.address1},` : ''}${sellerDetails?.city},${sellerDetails?.state}`}</Text>
                        </View>

                        <View style={{ borderWidth: 2, padding: 5, paddingHorizontal: 15, borderRadius: 20, borderColor: 'black', alignSelf: 'flex-start' }}>
                            <Text>View on Map</Text>
                        </View>

                        <Pressable onPress={()=>{
                            navigation.navigate(AppRoutes?.Chat, {
                                sellerId : sellerId,
                                user_id : user_id,
                                sellerDisplayName : sellerDetails?.businessName
                            })
                        }} style={{ borderWidth: 2, padding: 5, paddingHorizontal: 15, borderRadius: 20, borderColor: 'black',marginTop:10, alignSelf: 'flex-start' }}>
                            <Text>Chat</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={{ width: screenWidth * 0.95, alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 30 }}>Products</Text>
                    </View>

                    <View>
                        <FlatList
                            data={allProducts}
                            renderItem={RenderItem}
                            keyExtractor={(item) => `${item.id}-${item.follow}-${item.saved}`}
                            onViewableItemsChanged={onViewableItemsChanged.current}
                            viewabilityConfig={viewabilityConfig.current}
                            ListFooterComponent={loading ? <ActivityIndicator size="small" color="blue" /> : null}
                        />
                    </View>
                </View>
            </ScrollView>

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


export default SellerProfile