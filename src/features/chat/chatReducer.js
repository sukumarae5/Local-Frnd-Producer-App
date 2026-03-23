import {
  CHAT_HISTORY_REQUEST,
  CHAT_HISTORY_SUCCESS,
  CHAT_HISTORY_FAILED,
  CHAT_MESSAGE_ADD,
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
};

export default function chatReducer(state = initialState, action) {
  switch (action.type) {
    case CHAT_HISTORY_REQUEST:
      return {
        ...state,
        loading: true,
      };

    // case CHAT_HISTORY_SUCCESS: {
    //   const { otherUserId, messages } = action.payload;

    //   const existing = state.conversations[otherUserId] || [];

    //   const map = new Map();

    //   [...existing, ...messages].forEach(m => {
    //     const msg = m.message ?? m;
    //     map.set(msg.message_id, msg);
    //   });

    //   return {
    //     ...state,
    //     loading: false,
    //     conversations: {
    //       ...state.conversations,
    //       [otherUserId]: Array.from(map.values()).sort(
    //         (a, b) => new Date(a.sent_at) - new Date(b.sent_at),
    //       ),
    //     },
    //     conversationIds: {
    //       ...state.conversationIds,
    //       [otherUserId]: action.payload.conversationId,
    //     },
    //   };
    // }

    case CHAT_HISTORY_SUCCESS: {
  const { otherUserId, messages } = action.payload;

  const normalizedMessages = messages.map(m => m.message ?? m);

  const map = new Map();

  normalizedMessages.forEach(msg => {
    map.set(msg.message_id, msg);
  });

  return {
    ...state,
    loading: false,
    conversations: {
      ...state.conversations,
      [otherUserId]: Array.from(map.values()).sort(
        (a, b) => new Date(a.sent_at) - new Date(b.sent_at)
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
   

//    case CHAT_MESSAGE_ADD: {
//   const { otherUserId, message } = action.payload;

//   const old = state.conversations[otherUserId] || [];
//   const normalized = message.message ?? message;

//   // ✅ STRICT duplicate check
//   const exists = old.some(
//     m =>
//       String((m.message ?? m).message_id) ===
//       String(normalized.message_id)
//   );

//   if (exists) return state;

//   return {
//     ...state,
//     conversations: {
//       ...state.conversations,
//       [otherUserId]: [...old, normalized],
//     },
//   };
// }


case CHAT_MESSAGE_ADD: {
  const { otherUserId, message } = action.payload;

  const old = state.conversations[otherUserId] || [];
  const normalized = message.message ?? message;

  // ✅ REMOVE TEMP MESSAGE (important fix)
  const filtered = old.filter(m => {
    const msg = m.message ?? m;

    // remove temp message if same sender + content
    if (
      String(msg.message_id).startsWith('temp-') &&
      Number(msg.sender_id) === Number(normalized.sender_id) &&
      msg.content === normalized.content
    ) {
      return false;
    }

    return true;
  });

  // ✅ PREVENT DUPLICATE REAL MESSAGE
  const exists = filtered.some(
    m =>
      String((m.message ?? m).message_id) ===
      String(normalized.message_id)
  );

  if (exists) return state;

  return {
    ...state,
    conversations: {
      ...state.conversations,
      [otherUserId]: [...filtered, normalized],
    },
  };
}
    case CHAT_MARK_READ_SUCCESS: {
      // single message read (socket)
      if (action.payload?.messageId) {
        const { messageId } = action.payload;

        const conversations = {};

        for (const uid in state.conversations) {
          conversations[uid] = state.conversations[uid].map(m => {
            const msg = m.message ?? m;

            if (msg.message_id === messageId) {
              return {
                ...msg,
                is_read: 1,
                read_at: msg.read_at || new Date().toISOString(),
              };
            }

            return { ...msg };
          });
        }

        return {
          ...state,
          conversations,
        };
      }

      // conversation read (API)
      const { otherUserId } = action.payload;

      const list = state.conversations[otherUserId] || [];

      const updated = list.map(m => {
        const msg = m.message ?? m;

        if (Number(msg.sender_id) === Number(otherUserId)) {
          return {
            ...msg,
            is_read: 1,
            read_at: msg.read_at || new Date().toISOString(),
          };
        }

        return { ...msg };
      });

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
case CHAT_MESSAGE_DELIVERED: {
  const { messageId } = action.payload;

  const conversations = {};

  for (const uid in state.conversations) {
    conversations[uid] = state.conversations[uid].map(m => {
      const msg = m.message ?? m;

      if (msg.message_id === messageId) {
        return {
          ...msg,
          delivered: 1,
        };
      }

      return msg;
    });
  }

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

    default:
      return state;
  }
}
