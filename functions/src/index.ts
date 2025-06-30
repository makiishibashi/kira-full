import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";



// Firebase Admin SDKを初期化
initializeApp();
const db = getFirestore();

// パートナー接続のCloud Function
export const connectPartner = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "ログインが必要です");
  }

  const currentUserId = request.auth.uid;
  const inviteCode = request.data.inviteCode;

  if (!inviteCode) {
    throw new HttpsError("invalid-argument", "招待コードが必要です");
  }
  console.log(`connectPartner called by ${currentUserId} with code: ${inviteCode}`);

  try {
    // 招待コードでパートナーを検索
    const usersRef = db.collection("users");
    const partnerQuery = await usersRef.where("inviteCode", "==", inviteCode).get();

    // デバッグ用のログ
    console.log(`Query for invite code ${inviteCode} found ${partnerQuery.size} documents.`);

    if (partnerQuery.empty) {
      throw new HttpsError("not-found", "無効な招待コードです");
    }

    const partnerDoc = partnerQuery.docs[0];
    const partnerId = partnerDoc.id;
    const partnerData = partnerDoc.data();

    if (!partnerData) {
      throw new HttpsError("internal", "パートナーのデータが見つかりません。");
    }

    if (partnerId === currentUserId) {
      throw new HttpsError("invalid-argument", "自分の招待コードは使用できません");
    }

    const currentUserDoc = await usersRef.doc(currentUserId).get();
    if (!currentUserDoc.exists) {
      throw new HttpsError("not-found", "ユーザーが見つかりません");
    }
    const currentUserData = currentUserDoc.data();
    if (!currentUserData) {
      throw new HttpsError("internal", "あなたのデータが見つかりません。");
    }

    if (currentUserData.partnerId === partnerId) {
      throw new HttpsError("already-exists", "既に接続済みです");
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
  } catch (error) {
    console.error("Error in connectPartner:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "接続中にエラーが発生しました");
  }
});

// パートナー接続解除のCloud Function
export const disconnectPartner = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "ログインが必要です");
  }

  const currentUserId = request.auth.uid;
  console.log(`disconnectPartner called by ${currentUserId}`);

  try {
    const usersRef = db.collection("users");
    const currentUserDoc = await usersRef.doc(currentUserId).get();

    if (!currentUserDoc.exists) {
      throw new HttpsError("not-found", "ユーザーが見つかりません");
    }
    const currentUserData = currentUserDoc.data();
    if (!currentUserData) {
      throw new HttpsError("internal", "あなたのデータが見つかりません。");
    }

    const partnerId = currentUserData.partnerId;
    if (!partnerId) {
      throw new HttpsError("failed-precondition", "パートナーが設定されていません");
    }

    const batch = db.batch();

    // 現在のユーザーからパートナー情報を削除
    batch.update(usersRef.doc(currentUserId), {
      partnerId: FieldValue.delete(),
      partnerName: FieldValue.delete(),
      partnerEmail: FieldValue.delete(),
      updatedAt: new Date(),
    });

    // パートナーからも現在のユーザー情報を削除
    batch.update(usersRef.doc(partnerId), {
      partnerId: FieldValue.delete(),
      partnerName: FieldValue.delete(),
      partnerEmail: FieldValue.delete(),
      updatedAt: new Date(),
    });

    await batch.commit();
    console.log(`Successfully disconnected ${currentUserId} from ${partnerId}`);

    return {
      success: true,
      message: "パートナーとの接続を解除しました",
    };
  } catch (error) {
    console.error("Error in disconnectPartner:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "接続解除中にエラーが発生しました");
  }
});