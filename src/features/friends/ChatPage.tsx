import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';
import {
  isAllowedImageSize,
  isValidChatMessage,
  nextImageZoom,
  type ChatPayload,
} from '@/domain/chat';
import { formatChatTime } from '@/domain/dates';
import { uid } from '@/domain/ids';
import type { ChatMessage } from '@/domain/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/toast/context';
import {
  canRecordAudio,
  compressImage,
  formatDuration,
  startMicrophoneRecording,
  type RecorderHandle,
} from '@/services/media';

const EMOJIS = ['😀', '😄', '🥹', '😎', '🤔', '👏', '👍', '🌱', '☕', '📚', '🎧', '🏃'];

function ImagePreview({ src, onClose }: { src: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((current) => nextImageZoom(current, event.deltaY < 0 ? 1 : -1));
    };
    const node = document.getElementById('image-zoom-viewport');
    node?.addEventListener('wheel', onWheel, { passive: false });
    return () => node?.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <Dialog title="图片预览" onClose={onClose} wide>
      <div className="image-zoom">
        <div className="image-zoom__tools">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setZoom((value) => nextImageZoom(value, -1))}
          >
            <Icon name="zoomOut" size={15} />
          </Button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setZoom((value) => nextImageZoom(value, 1))}
          >
            <Icon name="zoomIn" size={15} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setZoom(1)}>
            还原
          </Button>
        </div>
        <div id="image-zoom-viewport" className="image-zoom__viewport">
          <img src={src} alt="聊天图片预览" style={{ transform: `scale(${zoom})` }} />
        </div>
      </div>
    </Dialog>
  );
}

export function ChatPage() {
  const { friendId = '' } = useParams();
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const friend = state.users.find((user) => user.id === friendId);
  const messages = state.conversations[friendId] ?? [];

  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingIssue, setRecordingIssue] = useState('');
  const recorderRef = useRef<RecorderHandle | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  useEffect(() => () => recorderRef.current?.stop(), []);

  if (!friend) {
    return (
      <div className="page">
        <EmptyState
          icon="users"
          title="找不到这位同学"
          description="好友可能已被移除。"
          action={<Link to={ROUTES.friends}>返回好友列表</Link>}
        />
      </div>
    );
  }

  const send = (payload: ChatPayload): boolean => {
    if (!isValidChatMessage(payload)) {
      show('这条消息无法发送，请检查内容或附件', 'error');
      return false;
    }
    const message = {
      ...payload,
      id: uid('m'),
      author: state.profile.name,
      time: formatChatTime(),
      mine: true,
    } as ChatMessage;
    dispatch({ type: 'chat/send', userId: friend.id, message });
    return true;
  };

  const submitText = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) return;
    if (send({ type: 'text', body: draft.trim() })) {
      setDraft('');
      setEmojiOpen(false);
    }
  };

  const attachImage = async (file: File | undefined) => {
    if (!file) return;
    if (!isAllowedImageSize(file.size)) {
      show('图片不能超过 8MB', 'error');
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      if (send({ type: 'image', dataUrl, name: file.name })) show('图片已发送', 'success');
    } catch {
      show('图片处理失败，请换一张试试', 'error');
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    setRecordingIssue('');
    try {
      setRecording(true);
      recorderRef.current = await startMicrophoneRecording((dataUrl, duration) => {
        setRecording(false);
        recorderRef.current = null;
        if (!dataUrl) {
          show('录音失败，请检查麦克风权限', 'error');
          return;
        }
        send({ type: 'audio', dataUrl, duration });
      });
    } catch {
      setRecording(false);
      setRecordingIssue('无法录音。请通过 HTTPS / localhost 打开，并允许麦克风权限。');
      show('此环境无法录音，请检查权限或浏览器安全环境', 'error');
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="好友聊天"
        title={friend.name}
        description={`${friend.department} · ${friend.year} · ${friend.free}`}
        actions={
          <Link to={ROUTES.friends} className="btn btn--ghost btn--md">
            <Icon name="arrowLeft" size={16} /> 返回好友
          </Link>
        }
      />

      <div className="chat-layout">
        <section className="panel chat-panel">
          <div className="chat-head">
            <Avatar name={friend.name} size="sm" />
            <div>
              <strong>{friend.name}</strong>
              <small>聊天仅保存在本地</small>
            </div>
            <span className="pill pill--soft">演示会话</span>
          </div>

          <div className="chat-messages" ref={listRef} aria-live="polite">
            {messages.length === 0 ? (
              <EmptyState
                icon="chat"
                title="还没有消息"
                description="发一句问候，开始本地演示聊天。"
              />
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message${message.mine ? ' mine' : ''}`}>
                  {message.type === 'image' ? (
                    <button
                      type="button"
                      className="chat-image"
                      onClick={() => setPreview(message.dataUrl)}
                      aria-label={`放大查看图片 ${message.name ?? ''}`}
                    >
                      <img src={message.dataUrl} alt={message.name ?? '聊天图片'} />
                    </button>
                  ) : message.type === 'audio' ? (
                    <div className="chat-audio">
                      <audio controls src={message.dataUrl} />
                      <small>{formatDuration(message.duration)}</small>
                    </div>
                  ) : (
                    <p className={message.type === 'emoji' ? 'chat-emoji' : undefined}>
                      {message.body}
                    </p>
                  )}
                  <small>
                    {message.author} · {message.time}
                  </small>
                </div>
              ))
            )}
          </div>

          <div className="chat-compose">
            {emojiOpen ? (
              <div className="emoji-picker" role="group" aria-label="选择表情">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setDraft((value) => value + emoji);
                      setEmojiOpen(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}

            <form className="chat-entry" onSubmit={submitText}>
              <input
                name="message"
                className="input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="输入消息，最多 2000 字"
                maxLength={2000}
                aria-label="聊天消息"
              />
              <Button type="submit" icon={<Icon name="send" size={16} />} aria-label="发送消息">
                发送
              </Button>
            </form>

            <div className="chat-tools">
              <Button
                variant="ghost"
                size="sm"
                aria-label="选择表情"
                onClick={() => setEmojiOpen((value) => !value)}
              >
                <Icon name="smile" size={17} />
              </Button>

              <label className="tool-button">
                <Icon name="image" size={17} />
                <span>图片</span>
                <input
                  type="file"
                  accept="image/*"
                  aria-label="发送图片"
                  onChange={(event) => {
                    void attachImage(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
              </label>

              <Button
                variant={recording ? 'danger' : 'ghost'}
                size="sm"
                onClick={() => void toggleRecording()}
                disabled={!canRecordAudio()}
                icon={<Icon name="mic" size={17} />}
              >
                {recording ? '停止录音' : '语音'}
              </Button>

              <span className="muted">图片 ≤ 8MB · 语音 ≤ 20 秒</span>
            </div>

            {recordingIssue ? (
              <p className="form-error" role="alert">
                {recordingIssue}
              </p>
            ) : null}
          </div>
        </section>

        <aside className="panel chat-aside">
          <Avatar name={friend.name} size="lg" />
          <h3>{friend.name}</h3>
          <p className="muted">
            {friend.department} · {friend.year}
          </p>
          <p>{friend.free}</p>
          <div className="friend-card__tags">
            {friend.interests.map((interest) => (
              <span key={interest} className="tag">
                {interest}
              </span>
            ))}
          </div>
          <p className="auth-note">聊天、图片与语音只保存在当前浏览器；不会上传到服务器。</p>
        </aside>
      </div>

      {preview ? <ImagePreview src={preview} onClose={() => setPreview(null)} /> : null}
    </div>
  );
}
