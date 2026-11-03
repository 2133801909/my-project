/** Browser media helpers. Kept outside components so feature code stays declarative. */

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export function canRecordAudio(): boolean {
  return Boolean(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof MediaRecorder !== 'undefined',
  );
}

export function readFileAsDataUrl(file: Blob): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result ?? ''));
  reader.onerror = () => reject(reader.error ?? new Error('读取文件失败'));
  reader.readAsDataURL(file);
  return promise;
}

/** Downscale large images before storing them in localStorage. */
export async function compressImage(file: File, maxSide = 1280, quality = 0.72): Promise<string> {
  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  if (!context) return source;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const { promise, resolve, reject } = Promise.withResolvers<HTMLImageElement>();
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('图片解码失败'));
  image.src = src;
  return promise;
}

export interface RecorderHandle {
  stop: () => void;
}

/** Start a mic recording; resolves after the recorder is actually recording. */
export async function startMicrophoneRecording(
  onStop: (dataUrl: string, durationSeconds: number) => void,
  maxSeconds = 20,
): Promise<RecorderHandle> {
  if (!canRecordAudio()) throw new Error('此环境不支持录音');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  const startedAt = Date.now();

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  recorder.start();
  const timer = window.setTimeout(() => {
    if (recorder.state === 'recording') recorder.stop();
  }, maxSeconds * 1000);

  recorder.onstop = () => {
    window.clearTimeout(timer);
    stream.getTracks().forEach((track) => track.stop());
    const duration = Math.min(maxSeconds, Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
    void readFileAsDataUrl(blob)
      .then((dataUrl) => onStop(dataUrl, duration))
      .catch(() => onStop('', duration));
  };

  return {
    stop: () => {
      if (recorder.state === 'recording') recorder.stop();
    },
  };
}
