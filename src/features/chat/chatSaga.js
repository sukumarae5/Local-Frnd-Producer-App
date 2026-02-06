import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  CHAT_HISTORY_REQUEST,
  CHAT_LIST_REQUEST ,
  CHAT_MARK_READ_REQUEST
} from "./chatType";

import {
  chatHistorySuccess,
  chatHistoryFailed,
  chatListSuccess,
  chatListFailed,
  chatMarkReadSuccess,
  chatMarkReadFailed
} from "./chatAction";

import {
  chatHistoryApi,
  chatListApi ,
  chatReadConversationApi
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

}
