// features/chat/chatOptionsType.js

// ── MUTE ──────────────────────────────────────────────────────────
export const CHAT_MUTE_REQUEST   = "CHAT_MUTE_REQUEST";
export const CHAT_MUTE_SUCCESS   = "CHAT_MUTE_SUCCESS";
export const CHAT_MUTE_FAILED    = "CHAT_MUTE_FAILED";

// ── BLOCK ─────────────────────────────────────────────────────────
export const CHAT_BLOCK_REQUEST  = "CHAT_BLOCK_REQUEST";
export const CHAT_BLOCK_SUCCESS  = "CHAT_BLOCK_SUCCESS";
export const CHAT_BLOCK_FAILED   = "CHAT_BLOCK_FAILED";

// ── CLEAR ─────────────────────────────────────────────────────────
export const CHAT_CLEAR_HISTORY_REQUEST = "CHAT_CLEAR_HISTORY_REQUEST";
export const CHAT_CLEAR_HISTORY_SUCCESS = "CHAT_CLEAR_HISTORY_SUCCESS";
export const CHAT_CLEAR_HISTORY_FAILED  = "CHAT_CLEAR_HISTORY_FAILED";

// ── REPORT ────────────────────────────────────────────────────────
export const CHAT_REPORT_REQUEST = "CHAT_REPORT_REQUEST";
export const CHAT_REPORT_SUCCESS = "CHAT_REPORT_SUCCESS";
export const CHAT_REPORT_FAILED  = "CHAT_REPORT_FAILED";

// ── INIT STATUS (load mute+block state when opening a chat) ───────
export const CHAT_OPTIONS_STATUS_REQUEST = "CHAT_OPTIONS_STATUS_REQUEST";
export const CHAT_OPTIONS_STATUS_SUCCESS = "CHAT_OPTIONS_STATUS_SUCCESS";
export const CHAT_OPTIONS_STATUS_FAILED  = "CHAT_OPTIONS_STATUS_FAILED";