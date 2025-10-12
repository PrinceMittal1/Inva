import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Dimensions, FlatList, Linking, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"
import useFireStoreUtil from "../Functions/FireStoreUtils";
import FastImage from "@d11/react-native-fast-image";
import { useSelector } from "react-redux";
import ProductBlock from "../Components/ProductBlock";
import Header from "../Components/Header";
import { fetchingSellerProfile, getProductsForSellerPage, handleItemViewed } from "../Apis";
import AppRoutes from "../Routes/AppRoutes";
import CommentModal from "../Components/Comments/CommentModal";
import { wp } from "../Keys/dimension";
import Images from '../Keys/Images';
import Colors from "../Keys/colors";

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
        _id: ''
    })
    const navigation = useNavigation();


    const fetchingSeller = async (id: any) => {
        try {
            const res = await fetchingSellerProfile({ id: id })
            setSellerDetails(res?.data?.seller)
        } catch (e) {
        }
    }

    const fetchingSellerProduct = async (id: any) => {
        try {
            let seller_id = id
            let filter = 'mostPopular'
            const res = await getProductsForSellerPage({
                seller_id,
                filter,
                user_id,
                page: 1,
                limit: 5,
            });
            setAllProducts(res?.data?.products)
        } catch (e) {
        }
    }

    useEffect(() => {
        setSellerId(route?.params?.seller_id);
    }, [route?.params?.seller_id])

    useEffect(() => {
        fetchingSeller(route?.params?.seller_id)
        fetchingSellerProduct(route?.params?.seller_id)
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
                visibleItemsTimers.current[item._id] = setTimeout(async () => {
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

    const openGoogleMaps = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${Number(sellerDetails?.latitude)},${Number(sellerDetails?.longtitude)}&travelmode=driving`;
        Linking.openURL(url);
    };

    const RenderItem = ({ item, index }: any) => {
        return (
            <ProductBlock item={item}
                showFollowButton={true}
                statusChangingForFollow={statusChangingForFollow}
                showShopName={false}
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



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', marginTop: (statusBarHeight + 0) }}>
            <Header
                title={route?.params?.seller_name}
                rightIcon={Images?.chat}
                rightClick={() => {
                    navigation.navigate(AppRoutes?.Chat, {
                        sellerId: sellerId,
                        user_id: user_id,
                        sellerDisplayName: sellerDetails?.businessName ?? sellerDetails?.name,
                        seller_profile: sellerDetails?.profile_picture
                    })
                }}
            />

            <ScrollView>
                <View style={{ width: screenWidth * 0.95, alignSelf: 'center', marginTop: wp(4) }}>
                    <View style={{ flex: 4, borderRadius: 30, overflow: 'hidden' }}>
                        <FastImage source={{ uri: sellerDetails?.profile_picture }} resizeMode="cover" style={{ alignSelf: 'center', borderRadius: wp(3), width: screenWidth * 0.4, height: screenWidth * 0.4 }} />
                    </View>

                    <View style={{ flex: 6, alignItems: 'center' }}>
                        {(sellerDetails?.businessName || sellerDetails?.name) && <View>
                            <Text style={{ fontSize: 24 }}>{sellerDetails?.businessName ?? sellerDetails?.name}</Text>
                        </View>}
                        <View>
                            <Text style={{ fontSize: 22 }}>{`${sellerDetails?.address1 ? `${sellerDetails?.address1},` : ''}${sellerDetails?.city},${sellerDetails?.state}`}</Text>
                        </View>
                    </View>

                    <Pressable onPress={openGoogleMaps} style={{ alignSelf: 'center', borderWidth: 1, borderColor: Colors?.buttonPrimaryColor, borderRadius: wp(3), padding: 10 }}>
                        <Text>View On Map</Text>
                    </Pressable>
                </View>

                <View style={{ width: screenWidth * 0.95, alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 30 }}>Products</Text>
                    </View>

                    <View>
                        <FlatList
                            data={allProducts}
                            renderItem={RenderItem}
                            keyExtractor={(item) => `${item._id}-${item.followed}-${item.saved}`}
                            onViewableItemsChanged={onViewableItemsChanged.current}
                            viewabilityConfig={viewabilityConfig.current}
                            ListFooterComponent={loading ? <ActivityIndicator size="small" color="blue" /> : null}
                        />
                    </View>
                </View>
            </ScrollView>

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
    )
}


export default SellerProfile