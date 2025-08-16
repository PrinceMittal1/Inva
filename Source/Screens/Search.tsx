import { ActivityIndicator, FlatList, Platform, SafeAreaView, StatusBar, Text, TextInput, View } from "react-native"
import Header from "../Components/Header"
import Images from "../Keys/Images"
import AppRoutes from "../Routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import CommentModal from "../Components/Comments/CommentModal";
import { getProductsForHome } from "../Apis";
import ProductBlock from "../Components/ProductBlock";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import FastImage from "@d11/react-native-fast-image";
import { hp, wp } from "../Keys/dimension";
import Colors from "../Keys/colors";

const Search = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const dispatch = useDispatch();
    const [allProducts, setAllProducts] = useState<any>([])
    const navigation = useNavigation();
    const { user_id } = useSelector((state: any) => state.userData);
    const [showComment, setShowComment] = useState({
        state: false,
        id: ''
    })
    const [loader, setLoader] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [loading, setLoading] = useState<boolean>(false);
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

    let fetchingProducts = async () => {
        setLoader(true)
        try {
            const products = await getProductsForHome({ customerUserId: user_id });
            setAllProducts(products)
        } catch (error) {
            console.error('❌ Failed to fetch products:', error);
        }finally{
            setLoader(false)
        }
    }

    const statusChangingForFollow = (id: any, state: boolean) => {
        setAllProducts(prevProducts =>
            prevProducts.map(product =>
                product.user_id === id
                    ? { ...product, follow: state }
                    : product
            )
        );
    }

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

    const savingItemInWishlist = (id: any, state: boolean) => {
        setAllProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === id
                    ? { ...product, saved: state }
                    : product
            )
        );
    }

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

    useEffect(() => {
        fetchingProducts();
    }, [])


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
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(233, 174, 160, 0.1)', marginTop: (statusBarHeight + 0) }}>
            <Header title={'Search'}
                showbackIcon={true}
                rightIcon={Images?.savedFilled}
                rightClick={() => {
                    navigation.navigate(AppRoutes.WishList)
                }}
            />

            <View style={{ borderWidth: 1, borderRadius: wp(2), borderColor: '#FFFFFF',backgroundColor:'#FFFFFF', paddingHorizontal: wp(2), width: wp(95), marginTop: hp(1), alignSelf: 'center', flexDirection: 'row', alignItems: 'center', marginBottom:wp(2) }}>
                <FastImage source={Images?.search} style={{ width: wp(5), height: wp(5) }} resizeMode="contain" />
                <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor={'black'}
                    placeholder="Search..."
                    style={{ flex: 1, marginLeft: wp(2), color: Colors?.DarkText, height:45,fontSize:16, backgroundColor:'#FFFFFF' }}
                    onSubmitEditing={(t) => {
                        console.log("t ---------- ", t)
                    }}
                />
            </View>

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
        </>
    )
}

export default Search