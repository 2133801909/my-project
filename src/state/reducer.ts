import type {
  AppState,
  Campus,
  ChatMessage,
  Course,
  EventItem,
  FriendRequest,
  Invite,
  Post,
  PostComment,
  Profile,
  Task,
  User,
  Visibility,
} from '@/domain/types';
import { withdrawPost } from '@/domain/forum';
import { toggleTask } from '@/domain/tasks';

export type AppAction =
  | { type: 'state/replace'; state: AppState }
  | { type: 'state/reset'; state: AppState }
  | { type: 'profile/update'; profile: Partial<Profile> }
  | { type: 'profile/toggle-matching' }
  | { type: 'settings/set-visibility'; visibility: Visibility }
  | { type: 'settings/toggle-busy-only' }
  | { type: 'settings/toggle-reminders' }
  | { type: 'courses/add'; course: Course }
  | { type: 'courses/update'; course: Course }
  | { type: 'courses/delete'; id: string }
  | { type: 'week/set-start'; start: string }
  | { type: 'tasks/add'; task: Task }
  | { type: 'tasks/toggle'; id: string }
  | { type: 'tasks/delete'; id: string }
  | { type: 'events/add'; event: EventItem }
  | { type: 'events/delete'; id: string }
  | { type: 'events/toggle-reminder'; id: string }
  | { type: 'friends/request'; request: FriendRequest }
  | { type: 'friends/accept'; requestId: string }
  | { type: 'friends/decline'; requestId: string }
  | { type: 'friends/remove'; userId: string }
  | { type: 'friends/block'; userId: string }
  | { type: 'invites/add'; invite: Invite }
  | { type: 'invites/respond'; id: string; status: Invite['status'] }
  | { type: 'chat/send'; userId: string; message: ChatMessage }
  | { type: 'forum/add-post'; post: Post }
  | { type: 'forum/toggle-like'; id: string }
  | { type: 'forum/comment'; postId: string; comment: PostComment }
  | { type: 'forum/withdraw'; id: string }
  | { type: 'map/select'; campus: Campus };

function updateUser(users: User[], userId: string, update: (user: User) => User): User[] {
  return users.map((user) => (user.id === userId ? update(user) : user));
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'state/replace':
    case 'state/reset':
      return action.state;

    case 'profile/update':
      return { ...state, profile: { ...state.profile, ...action.profile } };

    case 'profile/toggle-matching':
      return {
        ...state,
        profile: { ...state.profile, matchingEnabled: !state.profile.matchingEnabled },
      };

    case 'settings/set-visibility':
      return { ...state, settings: { ...state.settings, visibility: action.visibility } };

    case 'settings/toggle-busy-only':
      return {
        ...state,
        settings: { ...state.settings, shareBusyOnly: !state.settings.shareBusyOnly },
      };

    case 'settings/toggle-reminders':
      return { ...state, settings: { ...state.settings, reminders: !state.settings.reminders } };

    case 'courses/add':
      return { ...state, courses: [...state.courses, action.course] };

    case 'courses/update':
      return {
        ...state,
        courses: state.courses.map((course) =>
          course.id === action.course.id ? action.course : course,
        ),
      };

    case 'courses/delete':
      return { ...state, courses: state.courses.filter((course) => course.id !== action.id) };

    case 'week/set-start':
      return { ...state, weekCalendar: { start: action.start } };

    case 'tasks/add':
      return { ...state, tasks: [...state.tasks, action.task] };

    case 'tasks/toggle':
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.id ? toggleTask(task) : task)),
      };

    case 'tasks/delete':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) };

    case 'events/add':
      return { ...state, events: [...state.events, action.event] };

    case 'events/delete':
      return { ...state, events: state.events.filter((event) => event.id !== action.id) };

    case 'events/toggle-reminder':
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.id ? { ...event, reminder: !event.reminder } : event,
        ),
      };

    case 'friends/request': {
      const exists = state.requests.some(
        (request) => request.userId === action.request.userId && request.status === 'outgoing',
      );
      if (exists) return state;
      return { ...state, requests: [...state.requests, action.request] };
    }

    case 'friends/accept': {
      const request = state.requests.find((item) => item.id === action.requestId);
      if (!request) return state;
      return {
        ...state,
        requests: state.requests.map((item) =>
          item.id === action.requestId ? { ...item, status: 'accepted' } : item,
        ),
        users: updateUser(state.users, request.userId, (user) => ({ ...user, friend: true })),
      };
    }

    case 'friends/decline':
      return {
        ...state,
        requests: state.requests.filter((request) => request.id !== action.requestId),
      };

    case 'friends/remove':
      return {
        ...state,
        users: updateUser(state.users, action.userId, (user) => ({ ...user, friend: false })),
      };

    case 'friends/block':
      return {
        ...state,
        blocked: state.blocked.includes(action.userId)
          ? state.blocked
          : [...state.blocked, action.userId],
        users: updateUser(state.users, action.userId, (user) => ({
          ...user,
          friend: false,
          blocked: user.blocked.includes(state.profile.id)
            ? user.blocked
            : [...user.blocked, state.profile.id],
        })),
      };

    case 'invites/add':
      return { ...state, invites: [action.invite, ...state.invites] };

    case 'invites/respond':
      return {
        ...state,
        invites: state.invites.map((invite) =>
          invite.id === action.id ? { ...invite, status: action.status } : invite,
        ),
      };

    case 'chat/send': {
      const messages = state.conversations[action.userId] ?? [];
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [action.userId]: [...messages, action.message],
        },
      };
    }

    case 'forum/add-post':
      return { ...state, posts: [action.post, ...state.posts] };

    case 'forum/toggle-like':
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.id
            ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
            : post,
        ),
      };

    case 'forum/comment':
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.postId
            ? { ...post, comments: [...post.comments, action.comment] }
            : post,
        ),
      };

    case 'forum/withdraw':
      return {
        ...state,
        posts: withdrawPost(state.posts, action.id, state.profile.name),
      };

    case 'map/select':
      return { ...state, mapCampus: action.campus };

    default:
      return state;
  }
}
