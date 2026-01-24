import FastImage from "@d11/react-native-fast-image";
import {
    Dimensions,
    Image,
    Platform,
    Pressable,
    StatusBar,
    Text,
    View,
    PermissionsAndroid,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    ScrollView
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Dropdown from "../Components/DropDown";
import { hp, wp } from "../Keys/dimension";
import { useEffect, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Images from "../Keys/Images";
import ImageCropPicker from "react-native-image-crop-picker";
import BottomButton from "../Components/BottomButton";
import useFireStoreUtil from "../Functions/FireStoreUtils";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "../Routes/AppRoutes";
import { Country, State, City } from "country-state-city";
import Header from "../Components/Header";
import { setUserData, setUserId } from "../Redux/Reducers/userData";
import Geolocation from "@react-native-community/geolocation";
import AppFonts from "../Functions/Fonts";
import Colors from "../Keys/colors";
import { deleteUser, getUserProfile, updatingUserApi } from "../Apis";
import { apiUrl } from "../env";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DeleteConfirmation from "../Modal/DeleteConfirmation";
import LogoutConfirmation from "../Modal/LogoutConfirmation";

const { width, height } = Dimensions.get("window");

const Profile = () => {
    const [profileImage, setProfileImage] = useState<any>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState("Kharar");
    const navigation = useNavigation();
    const [states, setStates] = useState<string[]>([]);
    const [selectedStateCode, setSelectedStateCode] = useState<any>({
        code: "PB",
        value: "Punjab"
    });
    const insets = useSafeAreaInsets();
    const [selected, setSelected] = useState('18');
    const [name, setName] = useState("");
    const [selectedGender, setSelectedGender] = useState('Female');
    const [selectedTags, setSelectedTags] = useState([]);
    const [loader, setLoader] = useState(false)
    const ageOptions = Array.from({ length: 89 }, (_, i) => (i + 12).toString());
    const focus = useIsFocused();
    const { user_id, userData } = useSelector((state: any) => state.userData);
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showLogoutPopUp, setShowLogoutPopUp] = useState(false)
    const dispatch = useDispatch();

    async function reverseGeocode(lat: number, lng: number) {
        const apiKey = "YOUR_API_KEY";
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const components = data.results[0].address_components;
            const getComponent = (type: string) =>
                components.find((c: any) => c.types.includes(type))?.long_name;
            const city = getComponent("locality") || getComponent("administrative_area_level_2");
            const state = getComponent("administrative_area_level_1");
            const country = getComponent("country");
            const postalCode = getComponent("postal_code");
            console.log({ city, state, country, postalCode });
        } catch (err) {
            console.error("Geocoding error:", err);
        }
    }

    async function getUserLocation() {
        if (Platform.OS === "android") {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.warn("Location permission denied");
                return;
            }
        }

        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                reverseGeocode(latitude, longitude);
            },
            error => { },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }

    const fetchingUserDetail = async () => {
        try {
            setLoader(true)
            const res = await getUserProfile({ user_id });
            dispatch(setUserData(res?.data?.data));
            setSelectedStateCode({
                code: res?.data?.data?.stateCode,
                value: res?.data?.data?.state
            });
            setName(res?.data?.data?.name)
            setProfileImage(res?.data?.data?.profile_picture);
            setSelectedTags(res?.data?.data?.interest);
            setSelectedCity(res?.data?.data?.city);
            setLoader(false)
        } catch (error) {
        } finally {
            setLoader(false)
        }
    }



    useEffect(() => {
        fetchingUserDetail();
    }, [focus]);

    const openGallery = () => {
        try {
            ImageCropPicker.openPicker({
                width: 400,
                height: 400,
                cropping: false,
                mediaType: "photo",
                multiple: false
            }).then(async image => {
                setProfileImage(image);
            });
        } catch (error: any) {
            console.log("Error opening picker", error);
        }
    };

    const ClickedOnContinue = async () => {

        try {
            setLoader(true)
            const fireUtils = useFireStoreUtil();
            var profile_picture: any = profileImage;
            if (profileImage?.path) {
                profile_picture = await fireUtils.uploadMediaToFirebase(profileImage?.path);
            }
            const ref = await updatingUserApi({
                age: Number(selected),
                _id: user_id,
                gender: selectedGender.toLocaleLowerCase(),
                stateCode: selectedStateCode?.code,
                state: selectedStateCode?.value,
                city: selectedCity,
                profile_picture: profile_picture,
                interest: selectedTags,
                name: name
            })

            if (ref?.status == 200) {
                dispatch(setUserData(ref?.data?.userData))
                navigation.goBack();
            }
        } catch (error) {

        } finally {
            setLoader(true)
        }
    };

    const handleStateChange = (value: string) => {
        const match: any = value.match(/^(.*)\s\((.*)\)$/);
        setSelectedStateCode({
            code: match[2],
            value: match[1]
        });
        const citiesList = City.getCitiesOfState("IN", match[2]);
        setCities(citiesList.map(c => c.name));
        setSelectedCity("");
    };

    const loggingOut = () => {
        dispatch(setUserData({}));
        dispatch(setUserId(""));
        navigation.reset({
            index: 0,
            routes: [{ name: AppRoutes?.Login }]
        });
    };

    const removeItem = (itemToRemove: string) => {
        setSelectedTags(prevItems => prevItems.filter(item => item !== itemToRemove));
    };

    const RenderItemForSelectedProduct = ({ item }: { item: any }) => {
        return (
            <View style={styles.tagItem}>
                <Text>{item}</Text>
                <Pressable onPress={() => removeItem(item)} style={styles.tagRemoveButton}>
                    <Image source={Images?.Cancel} style={styles.tagRemoveIcon} resizeMode="contain" />
                </Pressable>
            </View>
        );
    };

    const onDeleting = async () => {
        const res = await deleteUser({ user_id });
        if (res?.status == 200) {
            loggingOut();
        }
    }

    const RenderItem = ({ item, onPress }: any) => {
        console.log("data in render itme -- ", item, onPress)
        return (
            <Pressable
                style={styles.menuItem}
                onPress={onPress ? onPress : () => navigation.navigate(item?.navigationTitle)}
            >
                <Text>{item?.title}</Text>
                <FastImage
                    source={Images?.upArrow}
                    style={styles.arrowIcon}
                    tintColor={Colors?.buttonPrimaryColor}
                    resizeMode="contain"
                />
            </Pressable>
        )
    }


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
            <View style={{ marginTop: insets.top, flex: 1 }}>
                <Header title={"Profile"} rightIcon={Images?.logout} rightClick={()=>{setShowLogoutPopUp(true)}} />

                <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.scrollContainer} bounces={false} showsVerticalScrollIndicator={false}>

                    <View style={styles.profileImageWrapper}>
                        <FastImage
                            style={styles.profileImage}
                            source={
                                profileImage && !profileImage?.path
                                    ? { uri: profileImage }
                                    : !profileImage && !profileImage?.path
                                        ? Images?.person
                                        : { uri: profileImage.path }
                            }
                        />
                    </View>

                    <View style={{ alignSelf: 'center' }}>
                        <Text style={styles.profileName}>{name}</Text>
                    </View>

                    {/* <View style={[styles.inputContainer, {}]}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <View style={styles?.dropdown}>
                            <TextInput
                                value={name}
                                style={{ fontFamily: AppFonts.Regular, fontSize: 16 }}
                                placeholder="name"
                                placeholderTextColor={Colors?.DarkText}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    <View style={[styles.inputContainer, {}]}>
                        <Text style={styles.inputLabel}>Select Your Age</Text>
                        <Dropdown
                            options={ageOptions}
                            selectedValue={selected}
                            onValueChange={setSelected}
                        />
                    </View>

                    <View style={styles.dropdownWrapper}>
                        <Text style={styles.inputLabel}>Interest</Text>
                        <View style={styles.tagsContainer}>
                            {selectedTags?.map((item, index) => (
                                <RenderItemForSelectedProduct key={index} item={item} />
                            ))}
                        </View>
                        <Dropdown
                            options={["Saree", "Suits", "Toy gun", "Crockery", "Pants", "Shirts"]}
                            selectedValue={""}
                            alreadySelectedOptions={selectedTags}
                            onValueChange={(item) => {
                                let oldItems: any = [...selectedTags, item];
                                setSelectedTags(oldItems);
                            }}
                            removeItem={(item: any) => {
                                const newArr = selectedTags.filter((items: any) => items !== item);
                                setSelectedTags(newArr)
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

                    <View style={[styles.dropdownWrapper, {}]}>
                        <Text style={styles.inputLabel}>Select Your state</Text>
                        <Dropdown
                            options={states}
                            selectedValue={selectedStateCode?.code ? `${selectedStateCode?.value}` : ""}
                            onValueChange={handleStateChange}
                        />
                    </View>

                    <View style={[styles.dropdownWrapper]}>
                        <Text style={styles.inputLabel}>Select Your City</Text>
                        <Dropdown
                            label="Select City"
                            options={cities}
                            selectedValue={selectedCity}
                            onValueChange={setSelectedCity}
                        />
                    </View> */}

                    {/* <View style={styles.flexSpacer} />

                    <BottomButton btnStyle={styles.bottomButton} title={"Continue"} clickable={ClickedOnContinue} /> */}


                    <View style={styles.menuWrapper}>
                        <RenderItem item={{ title: 'Edit Profile', navigationTitle: AppRoutes?.EditProfile }} />
                        <RenderItem item={{ title: 'Terms', navigationTitle: AppRoutes?.Terms }} />
                        <RenderItem item={{ title: 'Privacy Policy', navigationTitle: AppRoutes?.PrivacyPolicy }} />
                        <RenderItem item={{ title: 'Logout', navigationTitle: AppRoutes?.Terms }} onPress={() => {
                            setShowLogoutPopUp(true)
                        }} />
                        <RenderItem item={{ title: 'Delete Account' }} onPress={() => {
                            setShowDeleteModal(true)
                        }} />
                    </View>

                    {showDeleteModal &&
                        <DeleteConfirmation visible={showDeleteModal} confimation={onDeleting} onClosePress={() => setShowDeleteModal(false)} message={"Are you sure you want to delete this account"} />
                    }
                    {
                        showLogoutPopUp &&
                        <LogoutConfirmation 
                        confimation={loggingOut} 
                        onClosePress={()=>{
                            setShowLogoutPopUp(false)
                        }}
                        />
                    }

                </KeyboardAwareScrollView>
            </View>
        </>
    );
};

export default Profile;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "rgba(233, 174, 160, 0.1)"
    },
    profileImageWrapper: {
        marginTop: 20,
        width: 150,
        height: 150,
        alignSelf: "center"
    },
    profileImage: {
        width: 150,
        height: 150,
        alignSelf: "center",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "grey"
    },
    scrollContainer: {
        flex: 1
    },
    editIcon: {
        width: 30,
        height: 30,
        position: "absolute",
        bottom: -10,
        right: -10
    },
    dropdownWrapper: {
        width: width * 0.9,
        alignSelf: "center",
        marginTop: hp(1)
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap"
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
    profileName: {
        fontFamily: AppFonts.Bold,
        fontSize: 16
    },
    tagRemoveButton: {
        paddingHorizontal: 5
    },
    tagRemoveIcon: {
        width: 14,
        height: 14
    },
    flexSpacer: {
        flex: 1
    },
    bottomButton: {
        marginTop: hp(5),
        marginBottom: hp(5)
    },
    inputLabel: {
        fontFamily: AppFonts.Regular,
        fontSize: 16,
        marginLeft: wp(1),
        color: Colors?.DarkText
    },
    inputContainer: {
        width: width * 0.9,
        alignSelf: 'center',
        marginTop: hp(1)
    },
    dropdown: {
        paddingHorizontal: 12,
        height: wp(12),
        borderWidth: 1,
        justifyContent: 'center',
        borderColor: Colors?.buttonPrimaryColor,
        borderRadius: 8,
    },
    menuWrapper: {
        borderWidth: 1,
        width: wp(90),
        alignSelf: 'center',
        borderColor: Colors.buttonPrimaryColor,
        borderRadius: wp(2),
        marginTop: wp(2)
    },
    menuItem: {
        borderBottomWidth: 1,
        flexDirection: 'row',
        height: wp(12),
        width: wp(90),
        borderColor: Colors?.buttonPrimaryColor,
        alignSelf: 'center',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(3),
    },
    arrowIcon: {
        width: wp(5),
        height: wp(5),
        transform: [{ rotate: '90deg' }],
    }
});
