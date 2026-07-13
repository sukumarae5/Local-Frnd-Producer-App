import {
  CHAT_HISTORY_REQUEST,
  CHAT_HISTORY_SUCCESS,
  CHAT_HISTORY_FAILED,
  CHAT_MESSAGE_ADD,
  CHAT_MESSAGE_REMOVE,
  CHAT_MESSAGE_UPDATE,
  CHAT_LIST_REQUEST,
  CHAT_LIST_SUCCESS,
  CHAT_LIST_FAILED,
  CHAT_CLEAR,
  CHAT_UNREAD_CLEAR,
  CHAT_MARK_READ_SUCCESS,
  CHAT_SET_ACTIVE,
  CHAT_CLEAR_ACTIVE,
  CHAT_UNREAD_INCREASE,
  CHAT_MESSAGE_DELIVERED,
  CHAT_FILE_UPLOAD_REQUEST,
  CHAT_FILE_UPLOAD_SUCCESS,
  CHAT_FILE_UPLOAD_FAILED,
} from './chatType';

const initialState = {
  loading: false,
  error: null,
  activeUser: null,

  conversations: {
    // otherUserId : [ messages ]
  },
  unread: {
    // otherUserId : count
  },
  conversationIds: {
    // otherUserId : conversationId
  },

  // Tracks file/voice-note upload progress so the UI can show a spinner
  // and surface errors instead of silently guessing.
  fileUploading: false,
  fileUploadError: null,
};

export default function chatReducer(state = initialState, action) {
  console.log('Chat Reducer received action:', action);
  switch (action.type) {
    case CHAT_HISTORY_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case CHAT_HISTORY_SUCCESS: {
      const { otherUserId, messages } = action.payload;

      const existing = state.conversations[otherUserId] || [];

      const map = new Map();

      [...existing, ...messages].forEach(m => {
        const msg = m.message ?? m;
        map.set(msg.message_id, msg);
      });

      return {
        ...state,
        loading: false,
        conversations: {
          ...state.conversations,
          [otherUserId]: Array.from(map.values()).sort(
            (a, b) => new Date(a.sent_at) - new Date(b.sent_at),
          ),
        },
        conversationIds: {
          ...state.conversationIds,
          [otherUserId]: action.payload.conversationId,
        },
      };
    }

    case CHAT_HISTORY_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CHAT_LIST_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case CHAT_LIST_SUCCESS: {
      const unreadMap = {};

      action.payload.forEach(row => {
        unreadMap[row.user_id] = row.unread_count || 0;
      });

      return {
        ...state,
        loading: false,
        chatList: action.payload,
        unread: unreadMap,
      };
    }

    case CHAT_LIST_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CHAT_MESSAGE_ADD: {
      const { otherUserId, message } = action.payload;

      const old = state.conversations[otherUserId] || [];
      const normalized = message.message ?? message;

      // ✅ check if message already exists
      const exists = old.some(m => {
        const msg = m.message ?? m;
        return String(msg.message_id) === String(normalized.message_id);
      });

      // ❌ IMPORTANT: if exists → DO NOTHING
      if (exists) return state;

      return {
        ...state,
        conversations: {
          ...state.conversations,
          [otherUserId]: [...old, normalized],
        },
      };
    }

    // NEW: drop a message outright (used to remove an optimistic temp
    // voice-note bubble once the real message arrives from the server).
    case CHAT_MESSAGE_REMOVE: {
      const { otherUserId, messageId } = action.payload;
      const list = state.conversations[otherUserId] || [];
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [otherUserId]: list.filter(
            m => String((m.message ?? m).message_id) !== String(messageId),
          ),
        },
      };
    }

    // NEW: patch fields on a message in place (used to flip a temp bubble
    // from uploading -> failed while keeping its position in the list).
    case CHAT_MESSAGE_UPDATE: {
      const { otherUserId, messageId, changes } = action.payload;
      const list = state.conversations[otherUserId] || [];
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [otherUserId]: list.map(m => {
            const msg = m.message ?? m;
            if (String(msg.message_id) === String(messageId)) {
              return { ...msg, ...changes };
            }
            return m;
          }),
        },
      };
    }

    case CHAT_MARK_READ_SUCCESS: {
      if (action.payload?.messageId) {
        const { messageId } = action.payload;

        let hasChanged = false;
        const conversations = {};

        for (const uid in state.conversations) {
          const oldList = state.conversations[uid];

          const newList = oldList.map(m => {
            const msg = m.message ?? m;

            if (msg.message_id === messageId && !msg.is_read) {
              hasChanged = true;
              return {
                ...msg,
                is_read: 1,
                read_at: msg.read_at || new Date().toISOString(),
              };
            }

            return msg;
          });

          conversations[uid] = newList;
        }

        // 🔥 VERY IMPORTANT
        if (!hasChanged) return state;

        return {
          ...state,
          conversations,
        };
      }

      const { otherUserId } = action.payload;

      const list = state.conversations[otherUserId] || [];

      let hasChanged = false;

      const updated = list.map(m => {
        const msg = m.message ?? m;

        if (Number(msg.sender_id) === Number(otherUserId) && !msg.is_read) {
          hasChanged = true;
          return {
            ...msg,
            is_read: 1,
            delivered: 1,
          };
        }

        return msg;
      });

      if (!hasChanged) return state;

      return {
        ...state,
        conversations: {
          ...state.conversations,
          [otherUserId]: updated,
        },
        unread: {
          ...state.unread,
          [otherUserId]: 0,
        },
      };
    }

    case CHAT_CLEAR:
      return initialState;

    case CHAT_UNREAD_CLEAR:
      return {
        ...state,
        unread: {
          ...state.unread,
          [action.payload]: 0,
        },
      };

    case CHAT_SET_ACTIVE:
      return {
        ...state,
        activeUser: action.payload,
      };

    case CHAT_CLEAR_ACTIVE:
      return {
        ...state,
        activeUser: null,
      };

    case 'CHAT_MESSAGE_DELIVERED': {
      const { messageId } = action.payload;

      let hasChanged = false;
      const conversations = {};

      for (const uid in state.conversations) {
        conversations[uid] = state.conversations[uid].map(m => {
          const msg = m.message ?? m;

          if (String(msg.message_id) === String(messageId) && !msg.delivered) {
            hasChanged = true;
            return {
              ...msg,
              delivered: 1,
            };
          }

          return msg;
        });
      }

      // 🔥 VERY IMPORTANT
      if (!hasChanged) return state;

      return {
        ...state,
        conversations,
      };
    }

    case CHAT_UNREAD_INCREASE: {
      const otherUserId = action.payload;

      // if that chat is open → do not increase
      if (Number(state.activeUser) === Number(otherUserId)) {
        return state;
      }

      return {
        ...state,
        unread: {
          ...state.unread,
          [otherUserId]: (state.unread[otherUserId] || 0) + 1,
        },
      };
    }

    case 'CHAT_WIPE_LOCAL': {
      const { otherUserId } = action.payload;
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [otherUserId]: [],
        },
      };
    }

    // ── file / voice-note upload lifecycle ──────────────────────────────
    case CHAT_FILE_UPLOAD_REQUEST:
      return {
        ...state,
        fileUploading: true,
        fileUploadError: null,
      };

    case CHAT_FILE_UPLOAD_SUCCESS: {
      const { tempId, otherUserId } = action.payload || {};
      let conversations = state.conversations;

      // The real message arrives separately via the 'chat_receive' socket
      // event -> CHAT_MESSAGE_ADD. Here we just remove the optimistic
      // temp bubble so it doesn't sit there duplicated next to the real one.
      if (tempId && otherUserId && state.conversations[otherUserId]) {
        conversations = {
          ...state.conversations,
          [otherUserId]: state.conversations[otherUserId].filter(
            m => String((m.message ?? m).message_id) !== String(tempId),
          ),
        };
      }

      return {
        ...state,
        fileUploading: false,
        fileUploadError: null,
        conversations,
      };
    }

    case CHAT_FILE_UPLOAD_FAILED: {
      const { error, tempId, otherUserId } = action.payload || {};
      let conversations = state.conversations;

      // Keep the temp bubble but flip it to a failed state (with a retry
      // affordance in the UI) instead of losing the user's recording.
      if (tempId && otherUserId && state.conversations[otherUserId]) {
        conversations = {
          ...state.conversations,
          [otherUserId]: state.conversations[otherUserId].map(m => {
            const msg = m.message ?? m;
            if (String(msg.message_id) === String(tempId)) {
              return { ...msg, uploading: false, failed: true };
            }
            return m;
          }),
        };
      }

      return {
        ...state,
        fileUploading: false,
        fileUploadError: error || 'Upload failed',
        conversations,
      };
    }

    default:
      return state;
  }
}