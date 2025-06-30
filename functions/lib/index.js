"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPartner = exports.connectPartner = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
// Firebase Admin SDKを初期化
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// パートナー接続のCloud Function
exports.connectPartner = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "ログインが必要です");
    }
    const currentUserId = request.auth.uid;
    const inviteCode = request.data.inviteCode;
    if (!inviteCode) {
        throw new https_1.HttpsError("invalid-argument", "招待コードが必要です");
    }
    console.log(`connectPartner called by ${currentUserId} with code: ${inviteCode}`);
    try {
        // 招待コードでパートナーを検索
        const usersRef = db.collection("users");
        const partnerQuery = await usersRef.where("inviteCode", "==", inviteCode).get();
        // デバッグ用のログ
        console.log(`Query for invite code ${inviteCode} found ${partnerQuery.size} documents.`);
        if (partnerQuery.empty) {
            throw new https_1.HttpsError("not-found", "無効な招待コードです");
        }
        const partnerDoc = partnerQuery.docs[0];
        const partnerId = partnerDoc.id;
        const partnerData = partnerDoc.data();
        if (!partnerData) {
            throw new https_1.HttpsError("internal", "パートナーのデータが見つかりません。");
        }
        if (partnerId === currentUserId) {
            throw new https_1.HttpsError("invalid-argument", "自分の招待コードは使用できません");
        }
        const currentUserDoc = await usersRef.doc(currentUserId).get();
        if (!currentUserDoc.exists) {
            throw new https_1.HttpsError("not-found", "ユーザーが見つかりません");
        }
        const currentUserData = currentUserDoc.data();
        if (!currentUserData) {
            throw new https_1.HttpsError("internal", "あなたのデータが見つかりません。");
        }
        if (currentUserData.partnerId === partnerId) {
            throw new https_1.HttpsError("already-exists", "既に接続済みです");
        }
        const batch = db.batch();
        // 現在のユーザーを更新
        batch.update(usersRef.doc(currentUserId), {
            partnerId: partnerId,
            partnerName: partnerData.name,
            partnerEmail: partnerData.email,
            updatedAt: new Date(),
        });
        // パートナーを更新
        batch.update(usersRef.doc(partnerId), {
            partnerId: currentUserId,
            partnerName: currentUserData.name,
            partnerEmail: currentUserData.email,
            updatedAt: new Date(),
        });
        await batch.commit();
        console.log(`Successfully connected ${currentUserId} with ${partnerId}`);
        return {
            success: true,
            message: "パートナーと接続しました",
            partnerId: partnerId,
            partnerName: partnerData.name,
        };
    }
    catch (error) {
        console.error("Error in connectPartner:", error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError("internal", "接続中にエラーが発生しました");
    }
});
// パートナー接続解除のCloud Function
exports.disconnectPartner = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "ログインが必要です");
    }
    const currentUserId = request.auth.uid;
    console.log(`disconnectPartner called by ${currentUserId}`);
    try {
        const usersRef = db.collection("users");
        const currentUserDoc = await usersRef.doc(currentUserId).get();
        if (!currentUserDoc.exists) {
            throw new https_1.HttpsError("not-found", "ユーザーが見つかりません");
        }
        const currentUserData = currentUserDoc.data();
        if (!currentUserData) {
            throw new https_1.HttpsError("internal", "あなたのデータが見つかりません。");
        }
        const partnerId = currentUserData.partnerId;
        if (!partnerId) {
            throw new https_1.HttpsError("failed-precondition", "パートナーが設定されていません");
        }
        const batch = db.batch();
        // 現在のユーザーからパートナー情報を削除
        batch.update(usersRef.doc(currentUserId), {
            partnerId: firestore_1.FieldValue.delete(),
            partnerName: firestore_1.FieldValue.delete(),
            partnerEmail: firestore_1.FieldValue.delete(),
            updatedAt: new Date(),
        });
        // パートナーからも現在のユーザー情報を削除
        batch.update(usersRef.doc(partnerId), {
            partnerId: firestore_1.FieldValue.delete(),
            partnerName: firestore_1.FieldValue.delete(),
            partnerEmail: firestore_1.FieldValue.delete(),
            updatedAt: new Date(),
        });
        await batch.commit();
        console.log(`Successfully disconnected ${currentUserId} from ${partnerId}`);
        return {
            success: true,
            message: "パートナーとの接続を解除しました",
        };
    }
    catch (error) {
        console.error("Error in disconnectPartner:", error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError("internal", "接続解除中にエラーが発生しました");
    }
});
//# sourceMappingURL=index.js.map