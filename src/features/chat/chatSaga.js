import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  CHAT_HISTORY_REQUEST,
  CHAT_LIST_REQUEST,
  CHAT_MARK_READ_REQUEST,
  CHAT_FILE_UPLOAD_REQUEST
} from "./chatType";

import {
  chatHistorySuccess,
  chatHistoryFailed,
  chatListSuccess,
  chatListFailed,
  chatMarkReadSuccess,
  chatMarkReadFailed,
  chatFileUploadSuccess,
  chatFileUploadFailed
} from "./chatAction";

import {
  chatHistoryApi,
  chatListApi,
  chatReadConversationApi,
  chatUploadApi
} from "../../api/userApi";


function* fetchChatHistorySaga(action) {
  try {

    const token = yield call(AsyncStorage.getItem, "twittoke");

    const { otherUserId } = action.payload;

    const response = yield call(
      axios.get,
      `${chatHistoryApi}/${otherUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log("💬 Fetched chat history:", response);
    yield put(
      chatHistorySuccess(
        otherUserId,
        response.data.messages,
        response.data.conversationId
      )
    );

  } catch (e) {
    yield put(chatHistoryFailed(e.message));
  }
}

function* fetchChatListSaga() {
  try {

    const token = yield call(AsyncStorage.getItem, "twittoke");

    const response = yield call(
      axios.get,
      chatListApi,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("💬 Fetched chat list:", response);
    yield put(chatListSuccess(response.data));

  } catch (e) {
    yield put(chatListFailed(e.message));
  }
}

function* markConversationReadSaga(action) {
  try {

    const token = yield call(AsyncStorage.getItem, "twittoke");

    const { conversationId, otherUserId } = action.payload;

    yield call(
      axios.post,
      `${chatReadConversationApi}/${conversationId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    yield put(chatMarkReadSuccess(otherUserId));

  } catch (e) {
    yield put(chatMarkReadFailed(e.message));
  }
}

function* uploadChatFileSaga(action) {
  const { file, receiverId, message_type, socket, tempId, duration } =
    action.payload;

  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    console.log("[voice] uploadChatFileSaga starting", {
      uri: file.uri,
      fileName: file.fileName,
      type: file.type,
      message_type,
      duration,
      tempId,
    });

    const formData = new FormData();

    formData.append("file", {
  uri:
    Platform.OS === "android"
      ? file.uri
      : file.uri.replace("file://", ""),
  name: file.fileName || "voice.mp4",
  type: file.type || "audio/mp4",
});
console.log("UPLOAD URL:", chatUploadApi);
console.log("TOKEN:", token);
console.log("FORM DATA FILE:", file);
    // IMPORTANT: no manual "Content-Type" header — let axios/RN attach the
    // correct multipart boundary automatically. A hardcoded header without
    // a boundary produces a malformed request multer can't parse reliably.
    const response = yield call(
  axios.post,
  chatUploadApi,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
       Accept: "application/json",
      "Content-Type": "multipart/form-data",
    },
  }
);
console.log("response", response);
    console.log("[voice] upload response:", response.data);

    const uploaded = response.data;

    if (!uploaded?.file_url) {
      throw new Error("Upload succeeded but no file_url was returned");
    }

    console.log("[voice] emitting chat_send", {
      receiverId,
      message_type,
      duration,
    });

    socket.emit("chat_send", {
      receiverId,
      content: uploaded.file_url,
      message_type,
      duration: duration ?? null,
    });

    yield put(chatFileUploadSuccess(tempId, receiverId));

  } catch (e) {
    console.log("[voice] uploadChatFileSaga error:", e?.response?.data || e.message);
    yield put(
      chatFileUploadFailed(
        e?.response?.data?.message || e.message,
        tempId,
        receiverId,
      ),
    );
  }
}

export default function* chatSaga() {
  yield takeLatest(
    CHAT_HISTORY_REQUEST,
    fetchChatHistorySaga
  );
  yield takeLatest(CHAT_LIST_REQUEST, fetchChatListSaga);
  yield takeLatest(
    CHAT_MARK_READ_REQUEST,
    markConversationReadSaga
  );
  yield takeLatest(
    CHAT_FILE_UPLOAD_REQUEST,
    uploadChatFileSaga
  );
}