// features/chat/chatOptionsReducer.js
// ── CHAT_WIPE_LOCAL REMOVED from here (it belongs in chatReducer) ──

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
} from './chatOptionsType';

const initialState = {
  muted: {}, // muted[conversationId]  = true | false
  blocked: {}, // blocked[targetUserId]  = true | false
  muteLoading: false,
  blockLoading: false,
  clearLoading: false,
  reportLoading: false,
  statusLoading: false,
  error: null,
  reportSubmitted: false,
};

export default function chatOptionsReducer(state = initialState, action) {
  switch (action.type) {
    /* ── MUTE ── */
    case CHAT_MUTE_REQUEST:
      return { ...state, muteLoading: true, error: null };
    case CHAT_MUTE_SUCCESS: {
      const { conversationId, muted } = action.payload;
      return {
        ...state,
        muteLoading: false,
        muted: { ...state.muted, [conversationId]: muted },
      };
    }
    case CHAT_MUTE_FAILED:
      return { ...state, muteLoading: false, error: action.payload };

    /* ── BLOCK ── */
    case CHAT_BLOCK_REQUEST:
      return { ...state, blockLoading: true, error: null };
    case CHAT_BLOCK_SUCCESS: {
      const { targetUserId, blocked } = action.payload;
      return {
        ...state,
        blockLoading: false,
        blocked: { ...state.blocked, [targetUserId]: blocked },
      };
    }
    case CHAT_BLOCK_FAILED:
      return { ...state, blockLoading: false, error: action.payload };

    /* ── CLEAR HISTORY ── */
    case CHAT_CLEAR_HISTORY_REQUEST:
      return { ...state, clearLoading: true, error: null };
    case CHAT_CLEAR_HISTORY_SUCCESS:
      // Message wipe handled by CHAT_WIPE_LOCAL in chatReducer
      return { ...state, clearLoading: false };
    case CHAT_CLEAR_HISTORY_FAILED:
      return { ...state, clearLoading: false, error: action.payload };

    /* ── REPORT ── */
    case CHAT_REPORT_REQUEST:
      // Reset reportSubmitted every time a new report starts
      return {
        ...state,
        reportLoading: true,
        error: null,
        reportSubmitted: false,
      };
    case CHAT_REPORT_SUCCESS:
      return { ...state, reportLoading: false, reportSubmitted: true };
    case CHAT_REPORT_FAILED:
      return { ...state, reportLoading: false, error: action.payload };

    /* ── STATUS ── */
    case CHAT_OPTIONS_STATUS_REQUEST:
      return { ...state, statusLoading: true, error: null };
    case CHAT_OPTIONS_STATUS_SUCCESS: {
      const { conversationId, targetUserId, muted, blocked } = action.payload;
      return {
        ...state,
        statusLoading: false,
        muted: { ...state.muted, [conversationId]: muted },
        blocked: { ...state.blocked, [targetUserId]: blocked },
      };
    }
    case CHAT_OPTIONS_STATUS_FAILED:
      return { ...state, statusLoading: false, error: action.payload };

    default:
      return state;
  }
}
