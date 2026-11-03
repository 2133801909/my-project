import type { FriendRequest, Post, PostType, User } from './types';

export const POST_TYPES: PostType[] = ['讨论', '分享', '项目'];

export function canWithdrawPost(
  post: Pick<Post, 'author'> | null | undefined,
  author: string,
): boolean {
  return Boolean(post && String(post.author) === String(author));
}

export function withdrawPost(posts: Post[], postId: string, author: string): Post[] {
  return posts.filter((post) => post.id !== postId || !canWithdrawPost(post, author));
}

export type ForumAuthorAction =
  | { kind: 'missing' }
  | { kind: 'friend'; userId: string }
  | { kind: 'pending'; userId: string }
  | { kind: 'add'; userId: string };

export function forumAuthorAction(
  user: Pick<User, 'id' | 'friend'> | null | undefined,
  state: { requests?: FriendRequest[] },
): ForumAuthorAction {
  if (!user) return { kind: 'missing' };
  const pending = (state.requests ?? []).some(
    (request) => request.userId === user.id && request.status === 'outgoing',
  );
  if (user.friend) return { kind: 'friend', userId: user.id };
  if (pending) return { kind: 'pending', userId: user.id };
  return { kind: 'add', userId: user.id };
}

export function postsForFilter(posts: Post[], filter: PostType | '全部'): Post[] {
  return filter === '全部' ? posts : posts.filter((post) => post.type === filter);
}
