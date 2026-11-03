import type { ChatMessage } from './types';

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_DATA_URL_LENGTH = 3 * 1024 * 1024;
export const MAX_RECORDING_SECONDS = 20;
export const MAX_TEXT_LENGTH = 2000;

export type ChatPayload =
  | { type: 'text'; body: string }
  | { type: 'emoji'; body: string }
  | { type: 'image'; dataUrl: string; name?: string }
  | { type: 'audio'; dataUrl: string; duration: number };

export function isValidChatMessage(message?: Partial<ChatPayload> | null): boolean {
  if (!message) return false;
  if (message.type === 'text') {
    const body = String(message.body ?? '').trim();
    return body.length > 0 && body.length <= MAX_TEXT_LENGTH;
  }
  if (message.type === 'emoji') return String(message.body ?? '').trim().length > 0;
  if (message.type === 'image') {
    const dataUrl = String(message.dataUrl ?? '');
    return (
      dataUrl.startsWith('data:image/') &&
      dataUrl.length > 0 &&
      dataUrl.length <= MAX_IMAGE_DATA_URL_LENGTH
    );
  }
  if (message.type === 'audio') {
    const dataUrl = String(message.dataUrl ?? '');
    return (
      dataUrl.startsWith('data:audio/') && isAllowedRecordingDuration(Number(message.duration))
    );
  }
  return false;
}

export function isAllowedImageSize(bytes: number): boolean {
  return Number.isFinite(bytes) && bytes > 0 && bytes <= MAX_IMAGE_BYTES;
}

export function isAllowedRecordingDuration(seconds: number): boolean {
  return Number.isFinite(seconds) && seconds > 0 && seconds <= MAX_RECORDING_SECONDS;
}

export function isImageMessage(message?: ChatMessage | null): boolean {
  return Boolean(
    message &&
    message.type === 'image' &&
    typeof message.dataUrl === 'string' &&
    message.dataUrl.startsWith('data:image/'),
  );
}

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

export function nextImageZoom(scale: number, direction: number): number {
  const current = Number.isFinite(Number(scale)) ? Number(scale) : 1;
  if (direction === 0) return 1;
  const next = current + Math.sign(direction) * ZOOM_STEP;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(next * 100) / 100));
}
