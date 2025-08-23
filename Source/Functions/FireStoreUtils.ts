import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import FireKeys from "./FireKeys";
import moment from "moment";
import { Platform } from "react-native";
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';

export default function useFireStoreUtil() {

    const creatingCustomerUserId = async (phoneNumber: string, email: string) => {
        try {
            const phoneQuery = await firestore()
                .collection(FireKeys.CustomerUser)
                .where('phoneNumber', '==', phoneNumber)
                .get();
            if (!phoneQuery.empty) {
                return phoneQuery.docs[0].id;
            }
            const emailQuery = await firestore()
                .collection(FireKeys.CustomerUser)
                .where('email', '==', email)
                .get();

            if (!emailQuery.empty) {
                return emailQuery.docs[0].id;
            }
            return null;
        } catch (error) {
            console.error('Error searching for user:', error);
            throw error;
        }
    };


    const creatingCustomerUser = async (profile_picture: string, name: string, email: string, phoneNumber: string): Promise<string> => {
        try {
            const roomId = await creatingCustomerUserId(phoneNumber, email);
            let roomRef;
            let docId: string;
            if (roomId) {
                roomRef = firestore().collection(FireKeys.CustomerUser).doc(roomId);
                const roomSnap = await roomRef.get();
                docId = roomSnap.id;
            } else {
                const newDocRef = await firestore().collection(FireKeys.CustomerUser).add({
                    createdAt: moment().unix(),
                    name: name,
                    profile_picture: profile_picture,
                    email: email
                });
                await newDocRef.update({
                    user_id: newDocRef.id
                });
                console.log("user id for login is 3 (new doc)", newDocRef.id);
                docId = newDocRef.id;
            }
            return docId;
        } catch (error) {
            console.error("🔥 Error in creatingCustomerUser:", error);
            throw error;
        }
    };

    const customerRoomRef = async (user_id: string) => {
        let roomRef = firestore().collection(FireKeys.CustomerUser).doc(user_id);

        return roomRef
    }

    const getCustomerUserRefById = async (user_id: string) => {
        const querySnapshot = await firestore()
            .collection(FireKeys.CustomerUser)
            .where("user_id", "==", user_id)
            .get();
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]; // First matching do
            const roomRef = firestore().collection(FireKeys.CustomerUser).doc(doc.id);
            return roomRef;
        } else {
            throw new Error(`❌ No user found with email: ${user_id}`);
        }
    };


    const updatingCustomerUserDetail = async (data: any) => {
        try {
            const roomRef = await getCustomerUserRefById(data?.user_id);
            if (data?.age && data?.gender) {
                await roomRef.update({
                    gender: data?.gender ?? '',
                    age: data?.age ?? 18,
                    stateCode: data?.stateCode ?? 'PB',
                    state: data?.state ?? 'punjab',
                    city: data?.city ?? 'Kharar',
                    profile_picture: data?.profile_picture ?? '',
                    interest: data?.interest ?? [],
                });
            } else {
                await roomRef.update({
                    stateCode: data?.stateCode ?? 'PB',
                    state: data?.state ?? 'punjab',
                    city: data?.city ?? 'Kharar',
                    interest: data?.interest ?? [],
                    profile_picture: data?.profile_picture ?? '',
                });
            }
            return roomRef
        } catch (error) {
            console.error("❌ Error updating user document:", error);
            return null
        }
    };


    const uploadMediaToFirebase = async (data: any) => {
        try {
            const uri = data;
            if (!uri) throw new Error("No file URI");
            const fileName = `file_${Date.now()}.jpg`;
            const pathToFile = Platform.OS === 'ios' ? uri.replace('file://', '') : uri.replace('file://', '');
            const fileExists = await RNFS.exists(pathToFile);
            if (!fileExists) {
                return;
            }
            const uploadRef = storage().ref(`uploads/${fileName}`);
            const task = uploadRef.putFile(pathToFile);

            await task;
            const downloadURL = await uploadRef.getDownloadURL();
            return downloadURL;
        } catch (err: any) {
            console.error('❌ Upload failed:', err.code, err.message);
        }
    };

    const gettingProductForHome = async (customerUserId: any) => {
        const productsSnapshot = await firestore()
            .collection(FireKeys?.Products)
            .limit(5)
            .get();

        console.log("gettingProductForHome------------ 1", new Date())
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const enrichedProducts = await Promise.all(
            products.map(async (product: any) => {
                console.log("gettingProductForHome------------ 2", new Date())
                try {
                    const userDoc = await firestore()
                        .collection(FireKeys.BusinessUser)
                        .doc(product.user_id)
                        .get();
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    const userFollowState = await firestore().collection(FireKeys.Follower).doc(product.user_id).collection('List').doc(customerUserId).get();
                    const userLikedState = await firestore().collection(FireKeys.Likes).doc(product?.id).collection('List').doc(customerUserId).get();
                    const userSavedState = await firestore().collection(FireKeys?.WishList).doc(customerUserId).collection("List").doc(product.id).get();

                    let isFollowing = false;
                    let isLiked = false;
                    let saved = false

                    if (userFollowState.exists()) {
                        isFollowing = true
                    }
                    if (userLikedState.exists()) {
                        isLiked = true;
                    }
                    if (userSavedState.exists()) {
                        saved = true
                    }


                    return {
                        ...product,
                        follow: isFollowing,
                        isLiked: isLiked,
                        saved: saved,
                        businessUser: {
                            name: userData?.businessName || '',
                            photo: userData?.profile_picture || '',
                        }
                    };
                } catch (error) {
                    console.error("❌ Error fetching business user:", error);
                    return {
                        ...product,
                        businessUser: {
                            name: '',
                            photo: '',
                        }
                    };
                }
            })
        );
        return enrichedProducts;
    };

    const fetchingSellerProducts = async (customerUserId: any, seller_id: any) => {
        const productsSnapshot = await firestore()
            .collection(FireKeys?.Products)
            .where('user_id', '==', seller_id)
            .get();

        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));


        const enrichedProducts = await Promise.all(
            products.map(async (product: any) => {
                try {
                    const userDoc = await firestore()
                        .collection(FireKeys.BusinessUser)
                        .doc(product.user_id)
                        .get();
                    const userData = userDoc.exists ? userDoc.data() : {};

                    const userFollowState = await firestore().collection(FireKeys.Follower).doc(product.user_id).collection('List').doc(customerUserId).get();
                    const userLikedState = await firestore().collection(FireKeys.Likes).doc(product?.id).collection('List').doc(customerUserId).get();

                    let isFollowing = false;
                    let isLiked = false;

                    if (userFollowState.exists) {
                        isFollowing = true
                    }
                    if (userLikedState.exists) {
                        isLiked = true;
                    }


                    return {
                        ...product,
                        follow: isFollowing,
                        isLiked: isLiked,
                        businessUser: {
                            name: userData?.businessName || '',
                            photo: userData?.profile_picture || '',
                        }
                    };
                } catch (error) {
                    console.error("❌ Error fetching business user:", error);
                    return {
                        ...product,
                        businessUser: {
                            name: '',
                            photo: '',
                        }
                    };
                }
            })
        );

        return enrichedProducts;
    };

    const toggleFollowInSubcollection = async (targetUserId: string, myUserId: string) => {
        const listDocRef = firestore()
            .collection('Follower')
            .doc(targetUserId)
            .collection('List')
            .doc(myUserId);

        try {
            return await firestore().runTransaction(async (transaction) => {
                const docSnap = await transaction.get(listDocRef);
                if (docSnap.exists()) {
                    await transaction.delete(listDocRef);
                    return false;
                } else {
                    await transaction.set(listDocRef, {
                        followedAt: moment().unix(),
                    });
                    return true;
                }
            });
        } catch (error) {
            throw error;
        }
    };


    const toggleSavingInWishlist = async (myUserId: string, productId: string) => {
        const listDocRef = firestore().collection(FireKeys?.WishList).doc(myUserId).collection('List').doc(productId);
        try {
            return await firestore().runTransaction(async (transaction) => {
                const docSnap = await transaction.get(listDocRef);
                if (docSnap.exists()) {
                    await transaction.delete(listDocRef);
                    return false;
                } else {
                    await transaction.set(listDocRef, {
                        savedAt: moment().unix(),
                    });
                    return true;
                }
            });
        } catch (error) {
            throw error;
        }
    };

    const likingCard = async (productUserId: string, myUserId: string) => {
        const listDocRef = firestore()
            .collection(FireKeys?.Likes)
            .doc(productUserId)
            .collection('List')
            .doc(myUserId);
        const productDocRef = firestore().collection(FireKeys?.Products).doc(productUserId);
        try {
            return await firestore().runTransaction(async (transaction) => {
                const docSnap = await transaction.get(listDocRef);
                const productDoc = await transaction.get(productDocRef);

                const currentLikeCount = productDoc.data()?.likeCount || 0;

                if (docSnap.exists()) {
                    await transaction.delete(listDocRef);
                    await transaction.update(productDocRef, {
                        likeCount: currentLikeCount - 1
                    });
                    return {
                        state: false,
                        likeCount: currentLikeCount - 1
                    };
                } else {
                    await transaction.set(listDocRef, {
                        followedAt: moment().unix(),
                    });
                    await transaction.update(productDocRef, {
                        likeCount: currentLikeCount + 1
                    });
                    return {
                        state: true,
                        likeCount: currentLikeCount + 1
                    };
                }
            });
        } catch (error) {
            throw error;
        }
    };


    const recordingView = async (productUserId: string) => {
        const productDocRef = firestore().collection(FireKeys?.Products).doc(productUserId);
        try {
            return await firestore().runTransaction(async (transaction) => {
                const productDoc = await transaction.get(productDocRef);

                const currentViewCount = productDoc.data()?.viewCount || 0;

                await transaction.update(productDocRef, {
                    viewCount: currentViewCount + 1
                });
                return currentViewCount + 1
            });
        } catch (error) {
            throw error;
        }

    }

    const fetchingSellerProfile = async (seller_id: string) => {
        const sellerDocRef = firestore().collection(FireKeys?.BusinessUser).doc(seller_id);
        try {
            return await firestore().runTransaction(async (transaction) => {
                const productDoc = await transaction.get(sellerDocRef);
                return productDoc.data()
            });
        } catch (error) {
            throw error;
        }
    }

    const fetchingSavedProduct = async (customerUserId: any) => {
        const productsSnapshot = await firestore()
            .collection(FireKeys?.WishList).doc(customerUserId).collection('List').get()

        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const enrichedProducts = await Promise.all(
            products.map(async (product: any) => {
                try {
                    const productDoc = await firestore().collection(FireKeys.Products).doc(product.id).get();
                    const productData: any = productDoc.exists ? productDoc.data() : {};

                    const userDoc = await firestore()
                        .collection(FireKeys.BusinessUser)
                        .doc(productData.user_id)
                        .get();
                    const userData = userDoc.exists ? userDoc.data() : {};
                    const userFollowState = await firestore().collection(FireKeys.Follower).doc(productData.user_id).collection('List').doc(customerUserId).get();
                    const userLikedState = await firestore().collection(FireKeys.Likes).doc(product.id).collection('List').doc(customerUserId).get();
                    let isFollowing = false;
                    let isLiked = false;
                    if (userFollowState.exists) {
                        isFollowing = true
                    }
                    if (userLikedState.exists) {
                        isLiked = true;
                    }
                    return {
                        ...productData,
                        id: product.id,
                        follow: isFollowing,
                        isLiked: isLiked,
                        saved: true,
                        businessUser: {
                            name: userData?.businessName || '',
                            photo: userData?.profile_picture || '',
                        }
                    };
                } catch (error) {
                    console.error("❌ Error fetching business user:", error);
                    return {};
                }
            })
        );

        return enrichedProducts;
    }

    const addingCommentForTheProduct = async (productId: any, text: any, userId: string, name: string, profile_picture: string) => {
        try {
            const commentData = {
                userId: userId,
                comment: text,
                productId: productId,
                name: name,
                profile_picture: profile_picture,
                createdAt: moment().unix(),
            };
            const docRef = await firestore()
                .collection(FireKeys.Comment)
                .doc(productId)
                .collection('List')
                .add(commentData);

            return {
                state: true,
                id: docRef.id
            }
        } catch (error) {
            console.error("❌ Error adding comment:", error);
            return {
                state: false
            }
        }
    }

    const deletingCommentForTheProduct = async (productId: any, commentId: any) => {
        try {
            await firestore()
                .collection(FireKeys.Comment)
                .doc(productId)
                .collection('List')
                .doc(commentId)
                .delete();

            return true
        } catch (error) {
            console.error("❌ Error removing comment:", error);
            return {
                state: false
            }
        }
    }

    const deletingCommentForTheProductForNesting = async (productId: any, commentId: any, id: any) => {
        try {
            await firestore()
                .collection(FireKeys.Comment)
                .doc(productId)
                .collection('List')
                .doc(commentId)
                .collection('replies')
                .doc(id)
                .delete();

            return true
        } catch (error) {
            console.error("❌ Error removing comment:", error);
            return {
                state: false
            }
        }
    }

    const addingCommentForNestedProduct = async (parent_id: any, productId: any, text: any, userId: string, name: string, profile_picture: string) => {
        try {
            // console.log("all id ---------- ", productId, parent_id, text, userId, name, profile_picture)
            const commentData = {
                userId: userId,
                comment: text,
                productId: productId,
                parent_id: parent_id,
                name: name,
                profile_picture: profile_picture,
                createdAt: moment().unix(),
            };
            const docRef = await firestore()
                .collection(FireKeys.Comment)
                .doc(productId)
                .collection('List')
                .doc(parent_id).collection('replies').add(commentData)

            return {
                state: true,
                id: docRef.id
            }
        } catch (error) {
            console.error("❌ Error adding comment:", error);
            return {
                state: false,
                id: ''
            }
        }
    }

    const updatingCommentForTheProduct = async (productId: any, text: any, commentId: string) => {
        try {
            await firestore().collection(FireKeys.Comment).doc(productId).collection('List').doc(commentId).update({
                comment: text,
                updatedAt: moment().unix(),
            })
            return true
        } catch (error) {
            console.error("❌ Error adding comment:", error);
            return false
        }
    }

    const updatingCommentForTheProductNested = async (productId: any, text: any, commentId: string, id: string) => {
        try {
            await firestore().collection(FireKeys.Comment).doc(productId).collection('List').doc(commentId).collection('replies').doc(id).update({
                comment: text,
                updatedAt: moment().unix(),
            })
            return true
        } catch (error) {
            console.error("❌ Error adding comment:", error);
            return false
        }
    }

    const gettingAllComments = async (productId: string) => {
        try {
            const response = await firestore()
                .collection(FireKeys.Comment)
                .doc(productId)
                .collection("List")
                .orderBy("createdAt", "desc")
                .get();

            const comments = response.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            return comments;
        } catch (error) {
            console.error("❌ Error getting comments:", error);
            return [];
        }
    };

    const gettingAllCommentsWithReplies = async (productId: string) => {
        try {
            const commentSnapshot = await firestore()
                .collection(FireKeys.Comment)
                .doc(productId)
                .collection("List")
                .orderBy("createdAt", "desc") // optional: latest first
                .get();

            const comments = await Promise.all(
                commentSnapshot.docs.map(async (doc) => {
                    const commentData = {
                        id: doc.id,
                        ...doc.data(),
                        replies: [] as any[], // default empty
                    };
                    try {
                        const repliesSnapshot = await doc.ref.collection("replies").orderBy("createdAt", "desc").get();
                        const replies = repliesSnapshot.docs.map(replyDoc => ({
                            id: replyDoc.id,
                            ...replyDoc.data(),
                        }));

                        commentData.replies = replies;
                    } catch (repliesError) {
                        console.error(`❌ Error fetching replies for comment ${doc.id}:`, repliesError);
                    }

                    return commentData;
                })
            );

            console.log("✅ All comments with replies:", comments);
            return comments;
        } catch (error) {
            console.error("❌ Error getting comments with replies:", error);
            return [];
        }
    };

    const createOrGetChatRoom = async (sellerId: string, customerId: string) => {
        const chatRoomId = sellerId + '_' + customerId;
        const chatRoomRef = firestore().collection('Chats').doc(chatRoomId);

        const chatDoc = await chatRoomRef.get();

        if (!chatDoc.exists) {
            await chatRoomRef.set({
                sellerId: sellerId,
                customerId: customerId,
                unseenMessages: 0,
                lastMessage: '',
                lastUpdated: firestore.FieldValue.serverTimestamp(),
            });
        }

        return chatRoomRef;
    };

    const fetchMessagesWithPagination = async (
        chatRoomRef: FirebaseFirestoreTypes.DocumentReference,
        pageSize: number,
        lastDoc: FirebaseFirestoreTypes.DocumentSnapshot | null = null
    ) => {
        let query = chatRoomRef
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(pageSize);

        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

        return {
            messages,
            lastDoc: lastVisible,
        };
    };

    const sendMessageToRoom = async (
        chatRoomRef: FirebaseFirestoreTypes.DocumentReference,
        senderId: string,
        text: string,
        imagesUrl?: any,
    ) => {
        var messageData
        if (imagesUrl.length > 0) {
            messageData = {
                senderId,
                imagesUrl,
                text,
                timestamp: firestore.FieldValue.serverTimestamp(),
            };
        } else {
            messageData = {
                senderId,
                text,
                timestamp: firestore.FieldValue.serverTimestamp(),
            };
        }

        await chatRoomRef.collection('messages').add(messageData);


        await chatRoomRef.update({
            lastMessage: text,
            lastUpdated: firestore.FieldValue.serverTimestamp(),
        });

        return true
    };


    const gettingAllChats = async (id: string) => {
        if (!id) return [];

        const snapshot = await firestore()
            .collection('Chats')
            .where('customerId', '==', id)
            .get();

        const chats: any = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));


        const finalList = [];

        for (const chat of chats) {
            const sellerId = chat?.sellerId
            const customerId = chat?.customerId
            const sellerSnap = await firestore()
                .collection(FireKeys?.BusinessUser)
                .doc(sellerId)
                .get();
            const sellerData = sellerSnap.exists ? sellerSnap.data() : null;

            const customerSnap = await firestore()
                .collection(FireKeys?.CustomerUser)
                .doc(customerId)
                .get();
            const customerData = customerSnap.exists ? customerSnap.data() : null;

            finalList.push({
                chatId: chat.id,
                business_name: sellerData?.businessName,
                business_picture: sellerData?.profile_picture,
                customer_name: customerData?.name,
                customer_picture: customerData?.profile_picture,
                ...chat
            });
        }

        return finalList;
    };

    const getProduct = async (id: string, customerUserId: string) => {
        if (!id) return {};
        try {
            const productSnap = await firestore()
                .collection(FireKeys?.Products)
                .doc(id)
                .get();

            const productData = productSnap.exists() ? productSnap.data() : null;
            const userLikedState = await firestore().collection(FireKeys.Likes).doc(id).collection('List').doc(customerUserId).get();
            const userSavedState = await firestore().collection(FireKeys?.WishList).doc(customerUserId).collection("List").doc(id).get();

            let isLiked = false;
            let saved = false

            if (userLikedState.exists()) {
                isLiked = true;
            }
            if (userSavedState.exists()) {
                saved = true
            }

            if (!productData) {
                console.warn("No product found with ID:", id);
            } else {
                console.log("Fetched product:", productData);
            }

            return {
                ...productData,
                isLiked: isLiked,
                saved: saved
            };
        } catch (error) {
            console.error("Error fetching product:", error);
            return null;
        }
    }




    return {
        creatingCustomerUser,
        updatingCustomerUserDetail,
        uploadMediaToFirebase,
        gettingProductForHome,
        toggleFollowInSubcollection,
        likingCard,
        recordingView,
        fetchingSellerProfile,
        sendMessageToRoom,
        fetchMessagesWithPagination,
        createOrGetChatRoom,
        fetchingSellerProducts,
        toggleSavingInWishlist,
        fetchingSavedProduct,
        addingCommentForTheProduct,
        gettingAllComments,
        updatingCommentForTheProduct,
        updatingCommentForTheProductNested,
        gettingAllCommentsWithReplies,
        deletingCommentForTheProduct,
        addingCommentForNestedProduct,
        deletingCommentForTheProductForNesting,
        gettingAllChats,
        getProduct
    };
}
