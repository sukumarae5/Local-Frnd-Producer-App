import { useRef, useState, useCallback, useEffect } from 'react';
import FaceDetection from '@react-native-ml-kit/face-detection';
import { captureRef } from 'react-native-view-shot';

const CHECK_INTERVAL_MS = 1500;
const MISS_THRESHOLD    = 2;
const MIN_FACE_SIZE     = 0.04;

export const useFaceDetection = ({
  enabled = false,
  viewRef,
  onFaceGone,
  onFaceBack,
} = {}) => {
  const [faceStatus, setFaceStatus] = useState('detecting');
  const [faceCount,  setFaceCount]  = useState(0);

  const intervalRef    = useRef(null);
  const isRunning      = useRef(false);
  const mounted        = useRef(true);
  const everFound      = useRef(false);
  const missCount      = useRef(0);
  const warningShown   = useRef(false);

  const detect = useCallback(async () => {
    if (!enabled || !viewRef?.current || isRunning.current || !mounted.current) return;
    isRunning.current = true;

    try {
      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.6,
        result: 'tmpfile',
        handleGLSurfaceViewOnAndroid: true,
      });

      const faces = await FaceDetection.detect(uri, {
        performanceMode: 'fast',
        landmarkMode: 'none',
        classificationMode: 'none',
        minFaceSize: MIN_FACE_SIZE,
      });

      if (!mounted.current) return;

      const count = faces?.length ?? 0;
      console.log(`👤 Faces: ${count} | misses: ${missCount.current}`);

      if (count > 0) {
        everFound.current = true;
        missCount.current = 0;

        if (warningShown.current) {
          warningShown.current = false;
          onFaceBack?.();
        }

        setFaceStatus(count >= 2 ? 'multiple_faces' : 'face_found');
        setFaceCount(count);
      } else {
        missCount.current += 1;

        if (
          everFound.current &&
          missCount.current >= MISS_THRESHOLD &&
          !warningShown.current
        ) {
          warningShown.current = true;
          console.log('🚨 FACE GONE');
          setFaceStatus('no_face');
          setFaceCount(0);
          onFaceGone?.();
        }
      }
    } catch (err) {
      console.log('Detection error:', err?.message);
    } finally {
      isRunning.current = false;
    }
  }, [enabled, viewRef, onFaceGone, onFaceBack]);

  useEffect(() => {
    mounted.current = true;

    if (!enabled) {
      clearInterval(intervalRef.current);
      intervalRef.current  = null;
      everFound.current    = false;
      missCount.current    = 0;
      warningShown.current = false;
      setFaceStatus('detecting');
      setFaceCount(0);
      return;
    }

    console.log('🎯 Face detection started');
    const delay = setTimeout(() => {
      detect();
      intervalRef.current = setInterval(detect, CHECK_INTERVAL_MS);
    }, 2000);

    return () => {
      clearTimeout(delay);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [enabled, detect]);

  useEffect(() => {
    return () => {
      mounted.current = false;
      clearInterval(intervalRef.current);
    };
  }, []);

  return { faceStatus, faceCount };
};