import { ActivityIndicator, FlatList, Platform, SafeAreaView, StatusBar, Text, TextInput, View } from "react-native"
import Header from "../Components/Header"
import Images from "../Keys/Images"
import AppRoutes from "../Routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import CommentModal from "../Components/Comments/CommentModal";
import { getProductsForHome, handleItemViewed } from "../Apis";
import ProductBlock from "../Components/ProductBlock";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import FastImage from "@d11/react-native-fast-image";
import { hp, wp } from "../Keys/dimension";
import Colors from "../Keys/colors";
import { debounce } from "lodash";

const Search = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const dispatch = useDispatch();
    const [allProducts, setAllProducts] = useState([]) as any
    const navigation = useNavigation();
    const { user_id } = useSelector((state: any) => state.userData);
    const [showComment, setShowComment] = useState({
        state: false,
        _id: ''
    })
    const [loader, setLoader] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [loading, setLoading] = useState<boolean>(false);
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

    let fetchingProducts = async (txt: string) => {
        setLoader(true)
        try {
            let payload: any = { customerUserId: user_id }
            if (txt && txt?.length > 0) {
                payload.search_text = txt,
                    payload.limit = 1
            }
            const res = await getProductsForHome(payload);
            setAllProducts(res?.data?.products)
        } catch (error) {
            console.error('❌ Failed to fetch products:', error);
        } finally {
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
                        _id: item?._id
                    })
                }}
                onComparisonPress={() => {

                }}
            />
        )
    }

    useEffect(() => {
        fetchingProducts(searchText);
    }, [])

    const debouncedSearch = useCallback(
        debounce((text: string) => {
            fetchingProducts(text);
        }, 1000),
        []
    );

    const setSearchTextFunc = (text: string) => {
        setSearchText(text);
        debouncedSearch(text);
    };


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

                <View style={{ borderWidth: 1, borderRadius: wp(2), borderColor: '#FFFFFF', backgroundColor: '#FFFFFF', paddingHorizontal: wp(2), width: wp(95), marginTop: hp(1), alignSelf: 'center', flexDirection: 'row', alignItems: 'center', marginBottom: wp(2) }}>
                    <FastImage source={Images?.search} style={{ width: wp(5), height: wp(5) }} resizeMode="contain" />
                    <TextInput
                        value={searchText}
                        onChangeText={setSearchTextFunc}
                        placeholderTextColor={'black'}
                        placeholder="Search..."
                        style={{ flex: 1, marginLeft: wp(2), color: Colors?.DarkText, height: 45, fontSize: 16, backgroundColor: '#FFFFFF' }}
                        onSubmitEditing={(t) => {

                        }}
                    />
                </View>

                <FlatList
                    data={allProducts}
                    renderItem={RenderItem}
                    keyExtractor={(item) => `${item._id}-${item.followed}-${item.saved}`}
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

export default Search