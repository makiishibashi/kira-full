"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPartner = exports.connectPartner = void 0;
var functions = require("firebase-functions");
var admin = require("firebase-admin");
// Firebase Admin SDKを初期化
admin.initializeApp();
var db = admin.firestore();
// パートナー接続のCloud Function
exports.connectPartner = functions.https.onCall(function (data, context) { return __awaiter(void 0, void 0, void 0, function () {
    var currentUserId, inviteCode, usersRef, partnerQuery, partnerDoc, partnerId, partnerData, currentUserDoc, currentUserData, batch, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // 認証チェック
                if (!context.auth) {
                    throw new functions.https.HttpsError('unauthenticated', 'ログインが必要です');
                }
                currentUserId = context.auth.uid;
                inviteCode = data.inviteCode;
                if (!inviteCode) {
                    throw new functions.https.HttpsError('invalid-argument', '招待コードが必要です');
                }
                console.log("connectPartner called by ".concat(currentUserId, " with code: ").concat(inviteCode));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                usersRef = db.collection('users');
                return [4 /*yield*/, usersRef.where('inviteCode', '==', inviteCode).get()];
            case 2:
                partnerQuery = _a.sent();
                if (partnerQuery.empty) {
                    throw new functions.https.HttpsError('not-found', '無効な招待コードです');
                }
                partnerDoc = partnerQuery.docs[0];
                partnerId = partnerDoc.id;
                partnerData = partnerDoc.data();
                // 自分自身の招待コードかチェック
                if (partnerId === currentUserId) {
                    throw new functions.https.HttpsError('invalid-argument', '自分の招待コードは使用できません');
                }
                return [4 /*yield*/, usersRef.doc(currentUserId).get()];
            case 3:
                currentUserDoc = _a.sent();
                if (!currentUserDoc.exists) {
                    throw new functions.https.HttpsError('not-found', 'ユーザーが見つかりません');
                }
                currentUserData = currentUserDoc.data();
                // 既に接続済みかチェック
                if (currentUserData.partnerId === partnerId) {
                    throw new functions.https.HttpsError('already-exists', '既に接続済みです');
                }
                batch = db.batch();
                // 現在のユーザーを更新
                batch.update(usersRef.doc(currentUserId), {
                    partnerId: partnerId,
                    partnerName: partnerData.name,
                    partnerEmail: partnerData.email,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                // パートナーを更新
                batch.update(usersRef.doc(partnerId), {
                    partnerId: currentUserId,
                    partnerName: currentUserData.name,
                    partnerEmail: currentUserData.email,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                return [4 /*yield*/, batch.commit()];
            case 4:
                _a.sent();
                console.log("Successfully connected ".concat(currentUserId, " with ").concat(partnerId));
                return [2 /*return*/, {
                        success: true,
                        message: 'パートナーと接続しました',
                        partnerId: partnerId,
                        partnerName: partnerData.name
                    }];
            case 5:
                error_1 = _a.sent();
                console.error('Error in connectPartner:', error_1);
                if (error_1 instanceof functions.https.HttpsError) {
                    throw error_1;
                }
                throw new functions.https.HttpsError('internal', '接続中にエラーが発生しました');
            case 6: return [2 /*return*/];
        }
    });
}); });
// パートナー接続解除のCloud Function
exports.disconnectPartner = functions.https.onCall(function (data, context) { return __awaiter(void 0, void 0, void 0, function () {
    var currentUserId, usersRef, currentUserDoc, currentUserData, partnerId, batch, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // 認証チェック
                if (!context.auth) {
                    throw new functions.https.HttpsError('unauthenticated', 'ログインが必要です');
                }
                currentUserId = context.auth.uid;
                console.log("disconnectPartner called by ".concat(currentUserId));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                usersRef = db.collection('users');
                return [4 /*yield*/, usersRef.doc(currentUserId).get()];
            case 2:
                currentUserDoc = _a.sent();
                if (!currentUserDoc.exists) {
                    throw new functions.https.HttpsError('not-found', 'ユーザーが見つかりません');
                }
                currentUserData = currentUserDoc.data();
                partnerId = currentUserData.partnerId;
                if (!partnerId) {
                    throw new functions.https.HttpsError('failed-precondition', 'パートナーが設定されていません');
                }
                batch = db.batch();
                // 現在のユーザーからパートナー情報を削除
                batch.update(usersRef.doc(currentUserId), {
                    partnerId: admin.firestore.FieldValue.delete(),
                    partnerName: admin.firestore.FieldValue.delete(),
                    partnerEmail: admin.firestore.FieldValue.delete(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                // パートナーからも現在のユーザー情報を削除
                batch.update(usersRef.doc(partnerId), {
                    partnerId: admin.firestore.FieldValue.delete(),
                    partnerName: admin.firestore.FieldValue.delete(),
                    partnerEmail: admin.firestore.FieldValue.delete(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                return [4 /*yield*/, batch.commit()];
            case 3:
                _a.sent();
                console.log("Successfully disconnected ".concat(currentUserId, " from ").concat(partnerId));
                return [2 /*return*/, {
                        success: true,
                        message: 'パートナーとの接続を解除しました'
                    }];
            case 4:
                error_2 = _a.sent();
                console.error('Error in disconnectPartner:', error_2);
                if (error_2 instanceof functions.https.HttpsError) {
                    throw error_2;
                }
                throw new functions.https.HttpsError('internal', '接続解除中にエラーが発生しました');
            case 5: return [2 /*return*/];
        }
    });
}); });
