import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';
import { eligibleMatches, sharedInterests } from '@/domain/matching';
import { uid } from '@/domain/ids';
import type { User } from '@/domain/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader, Tag } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/toast/context';
import { InviteDialog } from '@/features/friends/FriendDialogs';

type MatchMode = 'department' | 'interests';

export function MatchingPage() {
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const [mode, setMode] = useState<MatchMode>('department');
  const [interestFilter, setInterestFilter] = useState('全部');
  const [inviteUser, setInviteUser] = useState<User | null>(null);

  const profileWithBlocks = { ...state.profile, blocked: state.blocked };
  const departmentMatches = eligibleMatches(profileWithBlocks, state.users);

  const interests = useMemo(
    () => [...new Set(state.users.flatMap((user) => user.interests))],
    [state.users],
  );

  const visible = departmentMatches.filter((user) => {
    if (mode === 'interests') {
      if (sharedInterests(state.profile.interests, user.interests).length === 0) return false;
    }
    return interestFilter === '全部' || user.interests.includes(interestFilter);
  });

  const addFriend = (user: User) => {
    dispatch({
      type: 'friends/request',
      request: { id: uid('r'), userId: user.id, status: 'outgoing' },
    });
    show(`已向 ${user.name} 发送好友申请（本地演示）`, 'success');
  };

  const pendingFor = (userId: string) =>
    state.requests.some((request) => request.userId === userId && request.status === 'outgoing');

  return (
    <div className="page">
      <PageHeader
        eyebrow="主动连接"
        title="同系匹配"
        description="只有双方都主动开启匹配、且属于同一院系时才会互相出现；兴趣筛选完全可选。"
        actions={
          <Button
            variant={state.profile.matchingEnabled ? 'secondary' : 'primary'}
            icon={<Icon name="sparkles" size={16} />}
            onClick={() => dispatch({ type: 'profile/toggle-matching' })}
          >
            {state.profile.matchingEnabled ? '关闭匹配' : '开启匹配'}
          </Button>
        }
      />

      <div className="match-status">
        <span className={`dot${state.profile.matchingEnabled ? ' is-on' : ''}`} />
        <span>
          {state.profile.matchingEnabled ? '匹配已开启' : '匹配当前关闭'} · 院系：
          {state.profile.department}
        </span>
      </div>

      {!state.profile.matchingEnabled ? (
        <EmptyState
          icon="sparkles"
          title="开启匹配后才会出现同系同学"
          description="匹配遵循双向同意：对方也必须开启匹配。随时可以关闭。"
          action={
            <Button onClick={() => dispatch({ type: 'profile/toggle-matching' })}>
              开启同系匹配
            </Button>
          }
        />
      ) : (
        <>
          <div className="toolbar">
            <div className="segmented" role="group" aria-label="匹配方式">
              <button
                type="button"
                className={mode === 'department' ? 'is-active' : ''}
                onClick={() => {
                  setMode('department');
                  setInterestFilter('全部');
                }}
              >
                同系
              </button>
              <button
                type="button"
                className={mode === 'interests' ? 'is-active' : ''}
                onClick={() => setMode('interests')}
              >
                兴趣重合
              </button>
            </div>

            <div className="tag-filter" role="group" aria-label="兴趣筛选">
              {['全部', ...interests].map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={`tag tag--button${interestFilter === interest ? ' is-active' : ''}`}
                  onClick={() => setInterestFilter(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon="users"
              title="暂时没有匹配的同学"
              description="试试切换兴趣筛选，或稍后再来看看。"
            />
          ) : (
            <ul className="match-grid">
              {visible.map((user) => {
                const shared = sharedInterests(state.profile.interests, user.interests);
                const friend = user.friend;
                const pending = pendingFor(user.id);
                return (
                  <li key={user.id} className="match-card">
                    <Avatar name={user.name} size="lg" />
                    <div className="match-card__head">
                      <strong>{user.name}</strong>
                      <small>
                        {user.department} · {user.year}
                      </small>
                    </div>
                    <p className="muted">{user.free}</p>
                    <div className="friend-card__tags">
                      {user.interests.map((interest) => (
                        <Tag key={interest}>{interest}</Tag>
                      ))}
                    </div>
                    {shared.length > 0 ? (
                      <p className="match-card__shared">共同兴趣：{shared.join('、')}</p>
                    ) : null}
                    <div className="match-card__actions">
                      {friend ? (
                        <Link to={ROUTES.chat(user.id)} className="btn btn--primary btn--sm">
                          <Icon name="chat" size={15} /> 聊天
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          disabled={pending}
                          onClick={() => addFriend(user)}
                          icon={<Icon name="plus" size={15} />}
                        >
                          {pending ? '已申请' : '加好友'}
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => setInviteUser(user)}>
                        邀约
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {inviteUser ? <InviteDialog user={inviteUser} onClose={() => setInviteUser(null)} /> : null}
    </div>
  );
}
