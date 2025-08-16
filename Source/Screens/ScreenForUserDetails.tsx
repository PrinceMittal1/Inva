import { ActivityIndicator, Dimensions, Image, PermissionsAndroid, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import Header from "../Components/Header";
import { hp, wp } from "../Keys/dimension";
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
import Colors from "../Keys/colors";
import AppFonts from "../Functions/Fonts";
import Geolocation from "@react-native-community/geolocation";
import { updatingUser } from "../Apis";

const { width, height } = Dimensions.get('window');

const ScreenForUserDetails = () => {
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
    const [selected, setSelected] = useState('18');
    const { user_id } = useSelector((state: any) => state.userData);
    const [selectedGender, setSelectedGender] = useState('Female');
    const [states, setStates] = useState<string[]>([]);
    const [selectedStateCode, setSelectedStateCode] = useState({
        code: '',
        value: 'Punjab'
    });
    const [name, setName] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [profileImage, setProfileImage] = useState<any>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('');
    const navigation = useNavigation();
    const [loader, setLoader] = useState(false)
    const ageOptions = Array.from({ length: 89 }, (_, i) => (i + 12).toString());
    const dispatch = useDispatch();

    async function reverseGeocode(lat: number, lng: number) {
        const apiKey = 'AIzaSyDK1ouABQADC7bV9YrQt319jf4LVHmOfeQ';
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const components = data.results[0].address_components;
            const getComponent = (type: string) =>
                components.find((c: any) => c.types.includes(type))?.long_name;
            const city = getComponent('locality') || getComponent('administrative_area_level_2');
            const state = getComponent('administrative_area_level_1');
            setSelectedCity(city);
            setSelectedStateCode({
                code: '',
                value: state
            });
        } catch (err) {
            console.error('Geocoding error:', err);
        }
    }

    function splitState(item: any) {
        const match = item?.match(/^(.*) \((\w+)\)$/);
        if (match?.[1] && match?.[2]) {
            return { name: match[1], code: match[2] };
        } else {
            return { name: '', code: '' };
        }
    }

    useEffect(() => {
        if (!selectedStateCode?.code) {
            const result = states.find(item => item.startsWith(selectedStateCode?.value));
            const { name, code }: any = splitState(result);
            setSelectedStateCode({
                code: code,
                value: name
            });
        }
    }, [selectedStateCode?.value, states]);

    async function getUserLocation() {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.warn('Location permission denied');
                return;
            }
        }

        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                reverseGeocode(latitude, longitude);
            },
            error => { },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    }

    useEffect(() => {
        const indianStates = State.getStatesOfCountry('IN');
        setStates(indianStates.map(s => `${s.name} (${s.isoCode})`));
        const citiesList = City.getCitiesOfState('IN', 'PB');
        setCities(citiesList.map(c => c.name));
        getUserLocation();
    }, []);

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
            name: name,
            stateCode: selectedStateCode?.code,
            city: selectedCity,
            profile_picture: profile_picture,
            interest: selectedTags
        }));
    };

    const openGallery = () => {
        try {
            ImageCropPicker.openPicker({
                width: 400,
                height: 400,
                cropping: false,
                mediaType: 'photo',
                multiple: false,
            }).then(async (image) => {
                setProfileImage(image);
            });
        } catch (error: any) {
            console.log("Error opening picker", error);
        }
    };

    const ClickedOnContinue = async () => {
        setLoader(true)
        const fireUtils = useFireStoreUtil();
        let profile_picture: any = '';
        if (profileImage?.path) {
            profile_picture = await fireUtils.uploadMediaToFirebase(profileImage?.path);
        }
        // const ref: any = await fireUtils.updatingCustomerUserDetail({
        //     user_id: user_id,
        //     age: Number(selected),
        //     gender: selectedGender.toLocaleLowerCase(),
        //     stateCode: selectedStateCode?.code,
        //     state: selectedStateCode?.value,
        //     city: selectedCity,
        //     profile_picture: profile_picture,
        //     interest: selectedTags
        // });

        const ref = await updatingUser({
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
        }
        setLoader(false)
    };

    const removeItem = (itemToRemove: string) => {
        setSelectedTags(prevItems => prevItems.filter(item => item !== itemToRemove));
    };

    const RenderItemForSelectedProduct = ({ item }: { item: any }) => {
        return (
            <View style={styles.tagItem}>
                <Text style={styles.tagText}>{item}</Text>
                <Pressable onPress={() => { removeItem(item) }} style={styles.tagRemoveButton}>
                    <Image
                        source={Images?.Cancel}
                        style={styles.tagRemoveIcon}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>
        );
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
        <SafeAreaView style={[styles.container, { marginTop: statusBarHeight }]}>
            <Header title={"Details"} />

            <ScrollView style={styles.scrollContainer} bounces={false} showsVerticalScrollIndicator={false}>
                <View style={styles.profileImageContainer}>
                    <FastImage
                        style={styles.profileImage}
                        source={(!profileImage && !profileImage?.path) ? Images?.person : { uri: profileImage.path }}
                    />
                    <Pressable onPress={openGallery}>
                        <FastImage source={Images?.EditForProductBlock} style={styles.editIcon} resizeMode="contain" />
                    </Pressable>
                </View>

                <View style={[styles.inputContainer, { marginTop: hp(3) }]}>
                    <Text style={styles.inputLabel}>Select Your Age</Text>
                    <Dropdown
                        options={ageOptions}
                        selectedValue={selected}
                        onValueChange={setSelected}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Interest</Text>
                    <View style={styles.tagsContainer}>
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
                            if (!selectedTags.includes(item)) {
                                setSelectedTags([...selectedTags, item]);
                            }
                        }}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Choose your gender</Text>
                    <Dropdown
                        options={['Female', 'Male']}
                        selectedValue={selectedGender}
                        onValueChange={setSelectedGender}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Select Your state</Text>
                    <Dropdown
                        options={states}
                        selectedValue={selectedStateCode?.code ? `${selectedStateCode?.value}` : ''}
                        onValueChange={handleStateChange}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Select Your City</Text>
                    <Dropdown
                        label="Select City"
                        options={cities}
                        selectedValue={selectedCity}
                        onValueChange={setSelectedCity}
                    />
                </View>

                <BottomButton
                    btnStyle={styles.bottomButton}
                    title={'Continue'}
                    clickable={ClickedOnContinue}
                />
            </ScrollView>
        </SafeAreaView>
        </>
    );
};

export default ScreenForUserDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors?.PrimaryBackground,
    },
    scrollContainer: {
        flex: 1
    },
    profileImageContainer: {
        marginTop: 20,
        width: 100,
        height: 100,
        alignSelf: 'center'
    },
    profileImage: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey'
    },
    editIcon: {
        width: 30,
        height: 30,
        position: 'absolute',
        bottom: -10,
        right: -10
    },
    inputContainer: {
        width: width * 0.9,
        alignSelf: 'center',
        marginTop: hp(1)
    },
    inputLabel: {
        fontFamily: AppFonts.Regular,
        fontSize: 16,
        marginLeft: wp(1),
        color: Colors?.DarkText
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    tagItem: {
        padding: 10,
        paddingRight: 5,
        margin: 5,
        marginBottom: 0,
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0dedd',
        borderRadius: 10
    },
    tagText: {
        fontSize: 14,
        fontFamily: AppFonts.Regular
    },
    tagRemoveButton: {
        paddingHorizontal: 5
    },
    tagRemoveIcon: {
        width: 14,
        height: 14
    },
    bottomButton: {
        marginBottom: hp(5),
        marginTop: hp(5)
    }
});
