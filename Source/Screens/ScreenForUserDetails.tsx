import { Dimensions, Image, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, View } from "react-native"
import Header from "../Components/Header"
import { hp } from "../Keys/dimension";
import Dropdown from "../Components/DropDown";
import { useEffect, useState } from "react";
import { Country, State, City } from 'country-state-city';
import BottomButton from "../Components/BottomButton";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { setUserData } from "../Redux/Reducers/userData";
import AppRoutes from "../Routes/AppRoutes";
import FastImage from "@d11/react-native-fast-image";
import Images from "../Keys/Images";
import ImageCropPicker from "react-native-image-crop-picker";
import keys from "../Routes/AppRoutes";

const { width, height } = Dimensions.get('window')
const ScreenForUserDetails = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const [selected, setSelected] = useState('18');
    const { user_id } = useSelector((state: any) => state.userData);
    const [selectedGender, setSelectedGender] = useState('Female');
    const [states, setStates] = useState<string[]>([]);
    const [selectedStateCode, setSelectedStateCode] = useState({
        code: 'PB',
        value: 'Punjab'
    });
    const [name, setName] = useState("");
    const [selectedTags, setSelectedTags] = useState([])
    const [profileImage, setProfileImage] = useState<any>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('Kharar');
    const navigation = useNavigation();
    const ageOptions = Array.from({ length: 89 }, (_, i) => (i + 12).toString());
    const dispatch = useDispatch();

    useEffect(() => {
        const indianStates = State.getStatesOfCountry('IN');
        setStates(indianStates.map(s => `${s.name} (${s.isoCode})`));
        const citiesList = City.getCitiesOfState('IN', 'PB');
        setCities(citiesList.map(c => c.name));
    }, [])

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

    const updatingData = (profile_picture: string) => {
        dispatch(setUserData({
            user_id: user_id,
            age: Number(selected),
            gender: selectedGender.toLocaleLowerCase(),
            state: selectedStateCode?.value,
            name : name,
            stateCode: selectedStateCode?.code,
            city: selectedCity,
            profile_picture: profile_picture,
            interest: selectedTags
        }))
    }

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
        var profile_picture: any = ''
        if (profileImage?.path) {
            profile_picture = await fireUtils.uploadMediaToFirebase(profileImage?.path);
        }
        const ref: any = await fireUtils.updatingCustomerUserDetail({
            user_id: user_id,
            age: Number(selected),
            gender: selectedGender.toLocaleLowerCase(),
            stateCode: selectedStateCode?.code,
            state: selectedStateCode?.value,
            city: selectedCity,
            profile_picture: profile_picture,
            interest: selectedTags
        })
        if (ref) {
            navigation.reset({
                index: 0,
                routes: [{ name: AppRoutes?.BottomBar }],
            });
            updatingData(profile_picture);
        } else {

        }
    }

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
            <ScrollView style={{ flex: 1 }}>
                <Header title={"Details"} />

                <View style={{ marginTop: 20, width: 200, height: 200, alignSelf: 'center' }}>
                    <FastImage style={{ width: 200, height: 200, alignSelf: 'center', borderRadius: 10, borderWidth: 1, borderColor: 'grey' }}
                        source={(!profileImage && !profileImage?.path) ? Images?.person : { uri: profileImage.path }} />
                    <Pressable onPress={openGallery}>
                        <FastImage source={Images?.EditForProductBlock} style={{ width: 30, height: 30, position: 'absolute', bottom: -10, right: -10 }} resizeMode="contain" />
                    </Pressable>
                </View>


                <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2) }}>
                    <Text>Select Your Age</Text>
                    <Dropdown
                        options={ageOptions}
                        selectedValue={selected}
                        onValueChange={setSelected}
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

                <View style={{ width: width * 0.9, alignSelf: 'center', marginTop: hp(2) }}>
                    <Text>Choose your gender</Text>
                    <Dropdown
                        options={['Female', 'Male']}
                        selectedValue={selectedGender}
                        onValueChange={setSelectedGender}
                    />
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

                <View style={{ flex: 1 }} />

                <BottomButton
                    btnStyle={{ marginBottom: hp(5) }}
                    title={'Continue'}
                    clickable={ClickedOnContinue}
                />
            </ScrollView>


        </SafeAreaView>
    )
}

export default ScreenForUserDetails