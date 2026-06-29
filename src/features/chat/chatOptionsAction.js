// features/chat/chatOptionsAction.js
import {
  CHAT_MUTE_REQUEST,
  CHAT_MUTE_SUCCESS,
  CHAT_MUTE_FAILED,
  CHAT_BLOCK_REQUEST,
  CHAT_BLOCK_SUCCESS,
  CHAT_BLOCK_FAILED,
  CHAT_CLEAR_HISTORY_REQUEST,
  CHAT_CLEAR_HISTORY_SUCCESS,
  CHAT_CLEAR_HISTORY_FAILED,
  CHAT_REPORT_REQUEST,
  CHAT_REPORT_SUCCESS,
  CHAT_REPORT_FAILED,
  CHAT_OPTIONS_STATUS_REQUEST,
  CHAT_OPTIONS_STATUS_SUCCESS,
  CHAT_OPTIONS_STATUS_FAILED,
} from "./chatOptionsType";

/* ── MUTE ────────────────────────────────────────────────────────── */
export const chatMuteRequest = (conversationId) => ({
  type: CHAT_MUTE_REQUEST,
  payload: { conversationId },
});
export const chatMuteSuccess = (conversationId, muted) => ({
  type: CHAT_MUTE_SUCCESS,
  payload: { conversationId, muted },
});
export const chatMuteFailed = (error) => ({
  type: CHAT_MUTE_FAILED,
  payload: error,
});

/* ── BLOCK ───────────────────────────────────────────────────────── */
export const chatBlockRequest = (targetUserId) => ({
  type: CHAT_BLOCK_REQUEST,
  payload: { targetUserId },
});
export const chatBlockSuccess = (targetUserId, blocked) => ({
  type: CHAT_BLOCK_SUCCESS,
  payload: { targetUserId, blocked },
});
export const chatBlockFailed = (error) => ({
  type: CHAT_BLOCK_FAILED,
  payload: error,
});

/* ── CLEAR HISTORY ───────────────────────────────────────────────── */
export const chatClearHistoryRequest = (conversationId, otherUserId) => ({
  type: CHAT_CLEAR_HISTORY_REQUEST,
  payload: { conversationId, otherUserId },
});
export const chatClearHistorySuccess = (otherUserId) => ({
  type: CHAT_CLEAR_HISTORY_SUCCESS,
  payload: { otherUserId },
});
export const chatClearHistoryFailed = (error) => ({
  type: CHAT_CLEAR_HISTORY_FAILED,
  payload: error,
});

/* ── REPORT ──────────────────────────────────────────────────────── */
// reason: 'abuse' | 'spam' | 'fake_profile'
export const chatReportRequest = (targetUserId, reason, details) => ({
  type: CHAT_REPORT_REQUEST,
  payload: { targetUserId, reason, details },
});
export const chatReportSuccess = () => ({
  type: CHAT_REPORT_SUCCESS,
});
export const chatReportFailed = (error) => ({
  type: CHAT_REPORT_FAILED,
  payload: error,
});

/* ── INIT STATUS ─────────────────────────────────────────────────── */
export const chatOptionsStatusRequest = (conversationId, targetUserId) => ({
  type: CHAT_OPTIONS_STATUS_REQUEST,
  payload: { conversationId, targetUserId },
});
export const chatOptionsStatusSuccess = (conversationId, targetUserId, muted, blocked) => ({
  type: CHAT_OPTIONS_STATUS_SUCCESS,
  payload: { conversationId, targetUserId, muted, blocked },
});
export const chatOptionsStatusFailed = (error) => ({
  type: CHAT_OPTIONS_STATUS_FAILED,
  payload: error,
});