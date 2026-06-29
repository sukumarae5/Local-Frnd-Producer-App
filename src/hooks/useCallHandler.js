import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import callManager from '../utils/callManager';
import { clearCall } from '../features/calls/callAction';
import { CommonActions } from '@react-navigation/native';

export default function useCallHandler(navigationRef, isNavReady) {
  const call = useSelector(state => state.calls.call);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isNavReady) return;
    if (!call?.status) return;

    const status = call.status.toUpperCase();
    const direction = call.direction || 'OUTGOING';

    console.log('🔥 CALL HANDLER:', call);

    /* ── INCOMING RINGING → GlobalIncomingCall owns this ── */
    if (direction === 'INCOMING' && status === 'RINGING') return;

    /* ── INCOMING REJECTED → IncomingCallScreen owns navigation ── */
    if (direction === 'INCOMING' && status === 'REJECTED') return;

    /* ── Session dedup ── */
    if (callManager.currentSession && callManager.currentSession !== call.session_id) {
      callManager.reset();
    }
    callManager.setSession(call.session_id);

    /* ── RANDOM + DIRECT ── */
    if (!call.is_friend) {
      if (status === 'ACCEPTED') {
        if (callManager.lastNavigatedSession === call.session_id) return;
        callManager.lastNavigatedSession = call.session_id;
        callManager.safeNavigate(navigationRef, 'PerfectMatchScreen', {
          session_id: call.session_id,
          call_type: call.call_type,
        });
      }
      return;
    }

    /* ── FRIEND FLOW ── */
    if (call.is_friend) {

      // Caller waiting → show CallStatusScreen
      if (direction === 'OUTGOING' && status === 'RINGING') {
        const navKey = `${call.session_id}_RINGING`;
        if (callManager.lastNavigatedSession === navKey) return;
        callManager.lastNavigatedSession = navKey;
        callManager.safeNavigate(navigationRef, 'CallStatusScreen', {
          session_id: call.session_id,
          call_type: call.call_type,
          role: 'caller',
        });
        return;
      }

      // Accepted → go to call screen
      if (status === 'ACCEPTED') {
        const navKey = `${call.session_id}_ACCEPTED`;
        if (callManager.lastNavigatedSession === navKey) return;
        callManager.lastNavigatedSession = navKey;
        const screen = call.call_type === 'VIDEO' ? 'VideocallScreen' : 'AudiocallScreen';
        callManager.safeNavigate(navigationRef, screen, {
          session_id: call.session_id,
          caller_id: call.caller_id,
          receiver_id: call.receiver_id,
        });
        return;
      }

      // Caller rejected by receiver → go back from CallStatusScreen
      if (direction === 'OUTGOING' && status === 'REJECTED') {
        const navKey = `${call.session_id}_REJECTED`;
        if (callManager.lastNavigatedSession === navKey) return;
        callManager.lastNavigatedSession = navKey;

        if (navigationRef?.current?.canGoBack()) {
          navigationRef.current.goBack();
        } else {
          navigationRef?.current?.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'MaleHomeTabs' }] })
          );
        }
        setTimeout(() => dispatch(clearCall()), 300);
        return;
      }
    }

  }, [call, isNavReady]);
}