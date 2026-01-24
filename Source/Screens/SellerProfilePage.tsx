import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ActivityIndicator, Dimensions, FlatList, Linking, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"
import useFireStoreUtil from "../Functions/FireStoreUtils";
import FastImage from "@d11/react-native-fast-image";
import { useSelector } from "react-redux";
import ProductBlock from "../Components/ProductBlock";
import Header from "../Components/Header";
import { fetchingSellerProfile, getProductsForSellerPage, handleItemViewed } from "../Apis";
import AppRoutes from "../Routes/AppRoutes";
import CommentModal from "../Components/Comments/CommentModal";
import { hp, wp } from "../Keys/dimension";
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
                true
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



    const headerTitle = useMemo(()=>{
        return (route?.params?.seller_name && route?.params?.seller_name?.length > 0) ? route?.params?.seller_name : 'Seller Details'
    },[route?.params?.seller_name])

    const sellerImage = useMemo(()=>{
        if(sellerDetails?.profile_picture && sellerDetails?.profile_picture?.length > 0){
            return { uri: sellerDetails?.profile_picture }
        }else if(sellerDetails?.sellerProfile && sellerDetails?.sellerProfile?.length > 0){
            return { uri: sellerDetails?.sellerProfile }
        }else{
            return Images?.people
        }
    },[sellerDetails?.profile_picture, sellerDetails?.sellerProfile])



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(233, 174, 160, 0.1)', marginTop: (statusBarHeight + 0) }}>
            <Header
                title={headerTitle}
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
                    <View style={{ flex: 4, borderRadius: screenWidth * 0.22, overflow: 'hidden', borderWidth:1, borderColor:'black', width: screenWidth * 0.41, height: screenWidth * 0.41, justifyContent:'center', alignItems:'center', alignSelf:'center'  }}>
                        <FastImage source={sellerImage} resizeMode="cover" style={{ alignSelf: 'center', borderRadius: wp(3), width: screenWidth * 0.4, height: screenWidth * 0.4 }} />
                    </View>

                    <View style={{ flex: 6, alignItems: 'center' }}>
                         <View>
                            <Text style={{ fontSize: 24 }}>{headerTitle}</Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 22 }}>{`${sellerDetails?.address1 ? `${sellerDetails?.address1},` : ''}${sellerDetails?.city ?? ''},${sellerDetails?.state ?? ''}`}</Text>
                        </View>
                    </View>

                    {sellerDetails?.latitude && sellerDetails?.longtitude && <Pressable onPress={openGoogleMaps} style={{ alignSelf: 'center', borderWidth: 1, borderColor: Colors?.buttonPrimaryColor, borderRadius: wp(3), padding: 10 }}>
                        <Text>View On Map</Text>
                    </Pressable>}
                </View>

                <View style={{ width: screenWidth * 0.95, alignSelf: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 30 }}>Products</Text>
                    </View>

                    <View>
                        <FlatList
                            data={allProducts}
                            renderItem={RenderItem}
                            style={{marginBottom:hp(5)}}
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