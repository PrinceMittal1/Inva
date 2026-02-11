import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    TextInput,
} from 'react-native';
import Colors from '../Keys/colors';
import AppFonts from '../Functions/Fonts';

interface DropdownProps {
    options: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    alreadySelectedOptions?: any;
    removeItem?: any;
    changingSearchVal?: any;
    label?: string;
}

const DropDownForInterset: React.FC<DropdownProps> = ({
    options,
    selectedValue,
    alreadySelectedOptions,
    changingSearchVal,
    onValueChange,
    removeItem,
    label,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('')

    const handleSelect = (value: string) => {
        onValueChange(value);
        setModalVisible(false);
    };

    const removeItems = (value: string) => {
        removeItem(value);
        setModalVisible(false);
    }

    const selectedOrNot = (items) => {
        if (!alreadySelectedOptions || alreadySelectedOptions?.length == 0) return false
        if (alreadySelectedOptions.some(
            item => item.label === items?.label
        )) return true
        return false
    }

    return (
        <View style={styles.container}>

            <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.selectedText}>{selectedValue || 'Select an option'}</Text>
            </TouchableOpacity>

            <Modal transparent visible={modalVisible} animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>

                        <TextInput
                            value={searchValue}
                            onChangeText={(t) => {
                                setSearchValue(t)
                                changingSearchVal(t)
                            }}
                            style={{ borderWidth: 1, borderColor: 'grey', borderRadius: 10 }}
                        />
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={selectedOrNot(item) ? styles.optionSelected : styles?.option}
                                    onPress={() => { selectedOrNot(item) ? removeItems(item) : handleSelect(item) }}
                                >
                                    <Text>{item?.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default DropDownForInterset;

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        width: '100%',
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
        color: '#333',
    },
    optionSelected: {
        padding: 12,
        borderBottomWidth: 1,
        backgroundColor: Colors?.buttonPrimaryColor,
        borderBottomColor: '#eee',
    },
    dropdown: {
        padding: 12,
        borderWidth: 1,
        borderColor: Colors?.buttonPrimaryColor,
        borderRadius: 8,
    },
    selectedText: {
        fontSize: 16,
        color: Colors?.DarkText,
        fontFamily: AppFonts.Regular
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#00000080',
    },
    modalContainer: {
        marginHorizontal: 40,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        maxHeight: '50%',
    },
    option: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});
