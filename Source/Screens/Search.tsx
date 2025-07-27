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
    const [searchText, setSearchText] = useState('')
    const [loading, setLoading] = useState<boolean>(false);
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 70,
        minimumViewTime: 5000,
    });

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
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', marginTop: (statusBarHeight + 0) }}>
            <Header title={'Search'}
                showbackIcon={true}
                rightIcon={Images?.savedFilled}
                rightClick={() => {
                    navigation.navigate(AppRoutes.WishList)
                }}
            />

            <View style={{borderWidth:1,borderRadius:wp(2), borderColor:'grey',paddingHorizontal:wp(2), width:wp(95),marginTop:hp(1), alignSelf:'center', flexDirection:'row', alignItems:'center'}}>
                <FastImage source={Images?.search} style={{width : wp(5), height:wp(5)}} resizeMode="contain" />
                <TextInput
                    value={searchText}
                    onChangeText={setSearchText} 
                    placeholderTextColor={'black'}
                    placeholder="Search..."
                    style={{flex:1, marginLeft:wp(2), color:'black'}}
                    onSubmitEditing={(t)=>{
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
    )
}

export default Search