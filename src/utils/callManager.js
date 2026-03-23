import { CommonActions } from "@react-navigation/native";

class CallManager {
  constructor() {
    this.currentSession = null;
    this.lastNavigatedSession = null;
  }

  setSession(session_id) {
    this.currentSession = session_id;
  }

  isSameSession(session_id) {
    return this.currentSession === session_id;
  }

  reset() {
    this.currentSession = null;
    this.lastNavigatedSession = null;
  }
  safeNavigate(navigationRef, screen, params = {}) {

  if (!navigationRef.current) {
    console.log("⛔ NAV NOT READY");
    return;
  }

  console.log("🚀 NAVIGATING →", screen, params);

  navigationRef.current.dispatch(
    CommonActions.navigate({
      name: screen,
      params,
    })
  );
}
}

export default new CallManager();