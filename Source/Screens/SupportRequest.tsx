import React, { useState } from "react"
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from "react-native"
import Header from "../Components/Header"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { submittingSuggestion } from "../Apis"
import { useNavigation } from "@react-navigation/native"

const SupportRequest = () => {
    const insets = useSafeAreaInsets();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);
    const maxCharacters = 500;
    const navigation = useNavigation();

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert("Error", "Please enter your message before submitting.");
            return;
        }

        if (message.length < 10) {
            Alert.alert("Error", "Please provide more details (minimum 10 characters).");
            return;
        }

        setIsSubmitting(true);
        let data = {
            message: message
        }

        const res: any = await submittingSuggestion(data)
        if (res?.status == 200) {
            Alert.alert("Thanks", "Your suggestion has reached to us.")
        }
        navigation.goBack()
    };

    const handleTextChange = (text) => {
        setMessage(text);
        setCharacterCount(text.length);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}

            keyboardVerticalOffset={0}
        >
            <View style={{ marginTop: insets.top, flex: 1, marginBottom: insets.bottom }}>
                <Header title={"Support Request"} />

                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>How can we help you?</Text>
                        <Text style={styles.subtitle}>
                            Please describe your issue or question in detail. Our support team will get back to you within 24 hours.
                        </Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Describe your issue here..."
                                placeholderTextColor="#999"
                                multiline
                                value={message}
                                onChangeText={handleTextChange}
                                maxLength={maxCharacters}
                                textAlignVertical="top"
                                editable={!isSubmitting}
                            />

                            <View style={styles.characterCounter}>
                                <Text style={[
                                    styles.counterText,
                                    characterCount >= maxCharacters && styles.counterTextError
                                ]}>
                                    {characterCount}/{maxCharacters}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.tipsContainer}>
                            <Text style={styles.tipsTitle}>Tips for better support:</Text>
                            <Text style={styles.tip}>• Include relevant order/account details</Text>
                            <Text style={styles.tip}>• Describe the steps to reproduce the issue</Text>
                            <Text style={styles.tip}>• Attach screenshots if possible (via email)</Text>
                            <Text style={styles.tip}>• Include your contact email for faster response</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Fixed Submit Button at Bottom */}
                <View style={[styles.buttonContainer]}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!message.trim() || isSubmitting) && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={!message.trim() || isSubmitting}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 24,
    },
    inputContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e1e5e9',
        marginBottom: 24,
        overflow: 'hidden',
    },
    textInput: {
        height: 150,
        fontSize: 16,
        color: '#333',
        padding: 16,
        paddingBottom: 40, // Space for character counter
    },
    characterCounter: {
        position: 'absolute',
        bottom: 8,
        right: 12,
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    counterText: {
        fontSize: 12,
        color: '#666',
    },
    counterTextError: {
        color: '#ff3b30',
        fontWeight: '600',
    },
    tipsContainer: {
        backgroundColor: '#e8f4fd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        marginBottom: 8,
    },
    tip: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginLeft: 8,
    },
    buttonContainer: {
        backgroundColor: 'white',
        paddingTop: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#e1e5e9',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    submitButtonDisabled: {
        backgroundColor: '#c7d9f1',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    noteText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 16,
    },
})

export default SupportRequest