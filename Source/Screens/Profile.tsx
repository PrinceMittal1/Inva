import FastImage from "@d11/react-native-fast-image";
import { Dimensions, Image, Platform, Pressable, StatusBar, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Dropdown from "../Components/DropDown";
import { hp } from "../Keys/dimension";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Images from "../Keys/Images";
import ImageCropPicker from "react-native-image-crop-picker";
import BottomButton from "../Components/BottomButton";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "../Routes/AppRoutes";
import { Country, State, City } from 'country-state-city';
import Header from "../Components/Header";
import { setUserData, setUserId } from "../Redux/Reducers/userData";


const { width, height } = Dimensions.get('window')
const Profile = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const [profileImage, setProfileImage] = useState<any>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('Kharar');
    const navigation = useNavigation();
    const [states, setStates] = useState<string[]>([]);
    const [selectedStateCode, setSelectedStateCode] = useState<any>({
        code: 'PB',
        value: 'Punjab'
    });
    const [selectedTags, setSelectedTags] = useState([])
    const { user_id, userData } = useSelector((state: any) => state.userData);

    const dispatch = useDispatch();

    useEffect(() => {
        setSelectedStateCode({
            code: userData?.stateCode,
            value: userData?.state
        })
        setProfileImage(userData?.profile_picture);
        setSelectedTags(userData?.interest)
        setSelectedCity(userData?.city)
        const indianStates = State.getStatesOfCountry('IN');
        setStates(indianStates.map(s => `${s.name} (${s.isoCode})`));
        const citiesList = City.getCitiesOfState('IN', userData?.stateCode ?? 'PB');
        setCities(citiesList.map(c => c.name));
    }, [userData])


    console.log("userData   ------------ ", profileImage)
    const openGallery = () => {
        try {
            ImageCropPicker.openPicker({
                width: 400,
                height: 400,
                cropping: false,
                mediaType: 'photo',
                multiple: false,
            }).then(async (image) => {
                setProfileImage(image)
            });
        } catch (error: any) {
            console.log("Error opening picker", error);
        }
    };

    const ClickedOnContinue = async () => {
        const fireUtils = useFireStoreUtil();

        var profile_picture: any = profileImage;
        if (profileImage?.path) {
            profile_picture = await fireUtils.uploadMediaToFirebase(profileImage?.path);
        }
        const ref: any = await fireUtils.updatingCustomerUserDetail({
            user_id: user_id,
            age: null,
            gender: null,
            stateCode: selectedStateCode?.code,
            state: selectedStateCode?.value,
            city: selectedCity,
            profile_picture: profile_picture
        })
        if (ref) {
            navigation.goBack();
        } else {
            // ToastAndroid("something qent wrong")
        }
    }

    const handleStateChange = (value: string) => {
        const match: any = value.match(/^(.*)\s\((.*)\)$/);
        setSelectedStateCode({
            code: match[2],
            value: match[1]
        });
        const citiesList = City.getCitiesOfState('IN', match[2]);
        setCities(citiesList.map(c => c.name));
        setSelectedCity('');
    };

    const loggingOut = () => {
        dispatch(setUserData({}))
        dispatch(setUserId(''))
        navigation.reset({
            index: 0,
            routes: [{ name: AppRoutes?.Login }],
        });
    };

    const removeItem = (itemToRemove: string) => {
        setSelectedTags(prevItems => prevItems.filter(item => item !== itemToRemove));
    };

    const RenderItemForSelectedProduct = ({ item }: { item: any }) => {
        return (
            <View
                style={{
                    padding: 10,
                    paddingRight: 5,
                    margin: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'grey',
                    borderRadius: 10,
                }}
            >
                <Text>{item}</Text>
                <Pressable onPress={() => { removeItem(item) }} style={{ paddingHorizontal: 5 }}>
                    <Image
                        source={Images?.Cancel}
                        style={{ width: 16, height: 16 }}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white', marginTop: (statusBarHeight + 0) }}>
            <Header title={"Profile"}
                rightIcon={Images?.logout}
                rightClick={loggingOut} />

            <View style={{ marginTop: 20, width: 200, height: 200, alignSelf: 'center' }}>
                <FastImage style={{ width: 200, height: 200, alignSelf: 'center', borderRadius: 10, borderWidth: 1, borderColor: 'grey' }}
                    source={(profileImage && !profileImage?.path) ? { uri: profileImage } : (!profileImage && !profileImage?.path) ? Images?.person : { uri: profileImage.path }} />
                <Pressable onPress={openGallery}>
                    <FastImage source={Images?.EditForProductBlock} style={{ width: 30, height: 30, position: 'absolute', bottom: -10, right: -10 }} resizeMode="contain" />
                </Pressable>
            </View>


            <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2) }}>
                <Text>Select Your state</Text>
                <Dropdown
                    options={states}
                    selectedValue={selectedStateCode?.code ? `${selectedStateCode?.value}` : ''}
                    onValueChange={handleStateChange}
                />
            </View>


            <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2) }}>
                <Text>Select Your City</Text>
                <Dropdown
                    label="Select City"
                    options={cities}
                    selectedValue={selectedCity}
                    onValueChange={setSelectedCity}
                />
            </View>

            <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2), }}>
                <Text>Interest</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {selectedTags.map((item, index) => (
                        <RenderItemForSelectedProduct key={index} item={item} />
                    ))}
                </View>

                <Dropdown
                    options={['Saree', 'Suits', 'Toy gun', 'Crockery', 'Pants', 'Shirts']}
                    selectedValue={''}
                    barBorderColor={{ borderColor: 'black', paddingVertical: 10 }}
                    alreadySelectedOptions={selectedTags}
                    onValueChange={(item) => {
                        if (selectedTags.includes(item)) {

                        } else {
                            let oldItems: any = [...selectedTags, item]
                            setSelectedTags(oldItems)
                        }
                    }}
                />
            </View>

            <View style={{ flex: 1 }} />

            <BottomButton
                btnStyle={{ marginBottom: hp(5) }}
                title={'Continue'}
                clickable={ClickedOnContinue}
            />
        </SafeAreaView>
    )
}

export default Profile