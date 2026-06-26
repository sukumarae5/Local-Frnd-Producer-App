// features/chat/chatOptionsSaga.js

import { call, put, takeLatest, all } from 'redux-saga/effects';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CHAT_MUTE_REQUEST,
  CHAT_BLOCK_REQUEST,
  CHAT_CLEAR_HISTORY_REQUEST,
  CHAT_REPORT_REQUEST,
  CHAT_OPTIONS_STATUS_REQUEST,
} from './chatOptionsType';

import {
  chatMuteSuccess,
  chatMuteFailed,
  chatBlockSuccess,
  chatBlockFailed,
  chatClearHistorySuccess,
  chatClearHistoryFailed,
  chatReportSuccess,
  chatReportFailed,
  chatOptionsStatusSuccess,
  chatOptionsStatusFailed,
} from './chatOptionsAction';

// Uses the same MAIN_BASE_URL pattern as your existing userApi.js
import { chatoptionApi } from '../../api/userApi';

const getToken = () => AsyncStorage.getItem('twittoke');
const authHeader = token => ({ headers: { Authorization: `Bearer ${token}` } });

/* ── MUTE ───────────────────────────────────────────────────────────────── */
function* muteSaga(action) {
  try {
    const token = yield call(getToken);
    const { conversationId } = action.payload;

    const { data } = yield call(() =>
      axios.post(`${chatoptionApi}/mute/${conversationId}`, {}, authHeader(token))
    );

    yield put(chatMuteSuccess(conversationId, data.muted));
  } catch (e) {
    yield put(chatMuteFailed(e?.response?.data?.message ?? e.message));
  }
}

/* ── BLOCK ──────────────────────────────────────────────────────────────── */
function* blockSaga(action) {
  try {
    const token = yield call(getToken);
    const { targetUserId } = action.payload;

    const { data } = yield call(() =>
      axios.post(`${chatoptionApi}/block/${targetUserId}`, {}, authHeader(token))
    );

    yield put(chatBlockSuccess(targetUserId, data.blocked));
  } catch (e) {
    yield put(chatBlockFailed(e?.response?.data?.message ?? e.message));
  }
}

/* ── CLEAR HISTORY ──────────────────────────────────────────────────────── */
function* clearHistorySaga(action) {
  try {
    const token = yield call(getToken);
    const { conversationId, otherUserId } = action.payload;

    // Hit the backend to record cleared_at timestamp
    yield call(() =>
      axios.delete(`${chatoptionApi}/clear/${conversationId}`, authHeader(token))
    );

    // 1. Mark clearLoading = false in chatOptionsReducer
    yield put(chatClearHistorySuccess(otherUserId));

    // 2. Wipe the local message list in chatReducer (THIS is the fix —
    //    chatReducer owns `conversations`, so it must handle this action)
    yield put({ type: 'CHAT_WIPE_LOCAL', payload: { otherUserId } });

  } catch (e) {
    yield put(chatClearHistoryFailed(e?.response?.data?.message ?? e.message));
  }
}

/* ── REPORT ─────────────────────────────────────────────────────────────── */
// FIX: The backend returns 409 when the same reason has already been reported.
// We treat 409 as a SUCCESS (the report exists) so the UI shows "submitted"
// instead of an error. For any other error status we show the real error.
function* reportSaga(action) {
  try {
    const token = yield call(getToken);
    const { targetUserId, reason, details } = action.payload;

    yield call(() =>
      axios.post(
        `${chatoptionApi}/report/${targetUserId}`,
        { reason, details: details || '' },
        authHeader(token)
      )
    );

    yield put(chatReportSuccess());
  } catch (e) {
    // 409 = "already reported" → still show success UI, not an error
    if (e?.response?.status === 409) {
      yield put(chatReportSuccess());
      return;
    }
    yield put(chatReportFailed(e?.response?.data?.message ?? e.message));
  }
}

/* ── STATUS (load mute + block on chat open) ────────────────────────────── */
function* statusSaga(action) {
  try {
    const token = yield call(getToken);
    const { conversationId, targetUserId } = action.payload;

    // Run both requests in parallel with saga's `all`
    const [muteRes, blockRes] = yield all([
      call(() =>
        axios.get(`${chatoptionApi}/mute/${conversationId}`, authHeader(token))
      ),
      call(() =>
        axios.get(`${chatoptionApi}/block/${targetUserId}`, authHeader(token))
      ),
    ]);

    yield put(
      chatOptionsStatusSuccess(
        conversationId,
        targetUserId,
        muteRes.data.muted,
        blockRes.data.blocked
      )
    );
  } catch (e) {
    yield put(chatOptionsStatusFailed(e?.response?.data?.message ?? e.message));
  }
}

/* ── ROOT ───────────────────────────────────────────────────────────────── */
export default function* chatOptionsSaga() {
  yield takeLatest(CHAT_MUTE_REQUEST,           muteSaga);
  yield takeLatest(CHAT_BLOCK_REQUEST,          blockSaga);
  yield takeLatest(CHAT_CLEAR_HISTORY_REQUEST,  clearHistorySaga);
  yield takeLatest(CHAT_REPORT_REQUEST,         reportSaga);
  yield takeLatest(CHAT_OPTIONS_STATUS_REQUEST, statusSaga);
}