// utils/audioPlayerManager.js
//
// Single shared playback instance for all voice-note bubbles in the chat.
// Uses `react-native-nitro-sound`'s default-exported singleton (`Sound`) —
// the SAME package already working in your app for the message-tone sound
// effect in SocketProvider.js, just used here via its full recorder/player
// API instead of the one-shot createSound() helper.
//
// Being a module-level singleton here too (not tied to any component's
// lifecycle) is what makes these work automatically:
//   - tapping a new bubble stops whatever was previously playing (item 10/11)
//   - audio keeps playing while the FlatList scrolls and bubbles
//     mount/unmount off-screen (item 12), since playback state lives here,
//     not inside the bubble component.
//
// NOTE: this does NOT configure a native background audio session — if the
// app itself is backgrounded (not just scrolled), continued playback and
// lock-screen controls need additional native audio-session configuration,
// which is out of scope here.

import Sound from 'react-native-nitro-sound';

class AudioPlayerManager {
  constructor() {
    this.currentId = null;
    this.currentPosition = 0;
    this.duration = 0;
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    // Push current state immediately so a newly-mounted bubble knows right
    // away whether it's the one currently playing.
    callback(this._snapshot());
    return () => this.listeners.delete(callback);
  }

  _snapshot() {
    return {
      currentId: this.currentId,
      currentPosition: this.currentPosition,
      duration: this.duration,
    };
  }

  _notify() {
    const snap = this._snapshot();
    this.listeners.forEach(cb => cb(snap));
  }

  async play(id, url) {
    // Tapping the currently-playing bubble pauses it.
    if (this.currentId === id) {
      try {
        await Sound.pausePlayer();
      } catch (e) {
        console.log('[voice] pause error', e);
      }
      this.currentId = null;
      this._notify();
      return;
    }

    // Switching to a different bubble stops whatever was playing.
    if (this.currentId) {
      await this.stop();
    }

    try {
      this.currentId = id;
      this.currentPosition = 0;
      this._notify();

      await Sound.startPlayer(url);

      Sound.addPlayBackListener(e => {
        this.currentPosition = e.currentPosition;
        this.duration = e.duration;
        this._notify();
      });

      Sound.addPlaybackEndListener(() => {
        this.stop();
      });
    } catch (e) {
      console.log('[voice] play error', e);
      this.currentId = null;
      this._notify();
    }
  }

  async seek(positionMs) {
    if (!this.currentId) return;
    try {
      await Sound.seekToPlayer(Math.max(0, Math.round(positionMs)));
    } catch (e) {
      console.log('[voice] seek error', e);
    }
  }

  async stop() {
    try {
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      await Sound.stopPlayer();
    } catch (e) {
      // stopPlayer throws if nothing is playing — safe to ignore.
    }
    this.currentId = null;
    this.currentPosition = 0;
    this.duration = 0;
    this._notify();
  }
}

export default new AudioPlayerManager();