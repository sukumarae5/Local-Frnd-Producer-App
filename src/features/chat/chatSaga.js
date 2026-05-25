import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  CHAT_HISTORY_REQUEST,
  CHAT_LIST_REQUEST ,
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
  chatListApi ,
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
console.log("💬 Fetched chat history:", response)  ;
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
console.log("💬 Fetched chat list:", response)  ;
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
  try {
    const token = yield call(AsyncStorage.getItem, "twittoke");

    const { file, receiverId, message_type, socket } = action.payload;

    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      name: file.fileName || "file",
      type: file.type || "application/octet-stream",
    });

    const response = yield call(
      axios.post,
      `${chatUploadApi}`, // ✅ create this API
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const uploaded = response.data;

    // ✅ SEND VIA SOCKET AFTER UPLOAD
    socket.emit("chat_send", {
      receiverId,
      content: uploaded.file_url,
      message_type,
    });

    yield put(chatFileUploadSuccess());

  } catch (e) {
    yield put(chatFileUploadFailed(e.message));
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
