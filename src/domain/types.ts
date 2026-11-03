export type WeekType = 'every' | 'odd' | 'even';
export type Visibility = 'private' | 'friends' | 'public';
export type CourseColor = 'blue' | 'plum' | 'green' | 'orange';
export type WeekMode = 'current' | 'odd' | 'even';
export type Campus = '下沙校区' | '文一校区' | '东岳校区' | '绍兴校区' | '青山湖校区';
export type PostType = '讨论' | '分享' | '项目';
export type FriendRequestStatus = 'incoming' | 'outgoing' | 'accepted';
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface Profile {
  id: string;
  name: string;
  department: string;
  year: string;
  interests: string[];
  matchingEnabled: boolean;
}

export interface Settings {
  visibility: Visibility;
  shareBusyOnly: boolean;
  reminders: boolean;
}

export interface Course {
  id: string;
  title: string;
  day: number;
  start: string;
  end: string;
  location: string;
  teacher: string;
  color: CourseColor;
  weekType: WeekType;
}

export interface Task {
  id: string;
  title: string;
  course: string;
  due: string;
  note: string;
  done: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  place: string;
  note: string;
  reminder: boolean;
}

export interface User {
  id: string;
  name: string;
  department: string;
  year: string;
  interests: string[];
  matchingEnabled: boolean;
  blocked: string[];
  avatar: string;
  friend: boolean;
  free: string;
}

export interface FriendRequest {
  id: string;
  userId: string;
  status: FriendRequestStatus;
}

export interface Invite {
  id: string;
  userId: string;
  title: string;
  time: string;
  place: string;
  status: InviteStatus;
  direction: 'incoming' | 'outgoing';
}

export interface TextMessage {
  id: string;
  author: string;
  time: string;
  mine: boolean;
  type: 'text' | 'emoji';
  body: string;
}

export interface ImageMessage {
  id: string;
  author: string;
  time: string;
  mine: boolean;
  type: 'image';
  dataUrl: string;
  name?: string;
}

export interface AudioMessage {
  id: string;
  author: string;
  time: string;
  mine: boolean;
  type: 'audio';
  dataUrl: string;
  duration: number;
}

export type ChatMessage = TextMessage | ImageMessage | AudioMessage;

export interface PostComment {
  id: string;
  author: string;
  body: string;
}

export interface Post {
  id: string;
  type: PostType;
  author: string;
  time: string;
  title: string;
  body: string;
  tags: string[];
  likes: number;
  liked: boolean;
  comments: PostComment[];
}

export interface AppState {
  profile: Profile;
  settings: Settings;
  courses: Course[];
  tasks: Task[];
  events: EventItem[];
  users: User[];
  requests: FriendRequest[];
  invites: Invite[];
  conversations: Record<string, ChatMessage[]>;
  posts: Post[];
  blocked: string[];
  mapCampus: Campus;
  weekCalendar: { start: string };
}

export type DemoSession = { mode: 'account'; name: string } | { mode: 'guest' } | null;

export interface PersistenceResult {
  ok: boolean;
  reason?: 'unavailable' | 'quota';
}
