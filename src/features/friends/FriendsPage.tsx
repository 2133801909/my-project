import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';
import type { Invite, User } from '@/domain/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader, Tag } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/toast/context';
import { AddFriendDialog, InviteDialog } from './FriendDialogs';

function InviteRow({ invite }: { invite: Invite }) {
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const user = state.users.find((item) => item.id === invite.userId);
  const incoming = invite.direction === 'incoming';

  return (
    <li className="invite-row">
      <span className={`pill ${incoming ? 'pill--soft' : ''}`}>
        {incoming ? '收到邀约' : '已发出'}
      </span>
      <div className="invite-row__main">
        <strong>{invite.title}</strong>
        <small>
          {user?.name ?? '同学'} · {invite.time} · {invite.place || '地点待定'}
        </small>
      </div>
      {invite.status === 'pending' ? (
        <div className="inline-actions">
          {incoming ? (
            <>
              <Button
                size="sm"
                onClick={() => {
                  dispatch({ type: 'invites/respond', id: invite.id, status: 'accepted' });
                  show('已接受邀约（本地演示）', 'success');
                }}
              >
                接受
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  dispatch({ type: 'invites/respond', id: invite.id, status: 'declined' })
                }
              >
                拒绝
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                dispatch({ type: 'invites/respond', id: invite.id, status: 'cancelled' })
              }
            >
              取消
            </Button>
          )}
        </div>
      ) : (
        <span className="muted">
          {invite.status === 'accepted'
            ? '已接受'
            : invite.status === 'declined'
              ? '已拒绝'
              : '已取消'}
        </span>
      )}
    </li>
  );
}

function FriendCard({ user, onMenu }: { user: User; onMenu: (user: User) => void }) {
  return (
    <li className="friend-card">
      <Avatar name={user.name} size="lg" />
      <div className="friend-card__main">
        <strong>{user.name}</strong>
        <small>
          {user.department} · {user.year}
        </small>
        <p>{user.free}</p>
        <div className="friend-card__tags">
          {user.interests.slice(0, 3).map((interest) => (
            <Tag key={interest}>{interest}</Tag>
          ))}
        </div>
      </div>
      <div className="friend-card__actions">
        <Link to={ROUTES.chat(user.id)} className="btn btn--primary btn--sm">
          <Icon name="chat" size={15} /> 聊天
        </Link>
        <Button variant="secondary" size="sm" onClick={() => onMenu(user)}>
          更多
        </Button>
      </div>
    </li>
  );
}

export function FriendsPage() {
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  const [inviteUser, setInviteUser] = useState<User | null>(null);

  const incoming = state.requests.filter((request) => request.status === 'incoming');
  const outgoing = state.requests.filter((request) => request.status === 'outgoing');
  const friends = state.users.filter((user) => user.friend && !state.blocked.includes(user.id));
  const pendingInvites = state.invites.filter(
    (invite) => invite.status === 'pending' && invite.direction === 'incoming',
  );

  const block = (user: User) => {
    if (!window.confirm(`拉黑 ${user.name}？其资料将从好友和匹配中隐藏。`)) return;
    dispatch({ type: 'friends/block', userId: user.id });
    setMenuUser(null);
    show('已拉黑该演示用户', 'info');
  };

  const remove = (user: User) => {
    if (!window.confirm(`移除好友 ${user.name}？`)) return;
    dispatch({ type: 'friends/remove', userId: user.id });
    setMenuUser(null);
    show('已移除好友（演示）', 'info');
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="校园连接"
        title="好友与邀约"
        description="好友、申请和邀约都只保存在当前浏览器，不会联系真实用户。"
        actions={
          <Button icon={<Icon name="plus" size={16} />} onClick={() => setAddOpen(true)}>
            查找同学
          </Button>
        }
      />

      <div className="two-column two-column--wide">
        <section className="panel">
          <div className="panel__head">
            <h2>好友申请</h2>
            <span className="pill">{incoming.length} 条待处理</span>
          </div>
          {incoming.length === 0 && outgoing.length === 0 ? (
            <EmptyState
              icon="users"
              title="没有新的好友申请"
              description="去论坛或匹配页认识新同学。"
            />
          ) : (
            <ul className="request-list">
              {incoming.map((request) => {
                const user = state.users.find((item) => item.id === request.userId);
                return (
                  <li key={request.id} className="request-row">
                    <Avatar name={user?.name ?? '同学'} size="sm" />
                    <div>
                      <strong>{user?.name ?? '同学'}</strong>
                      <small>{user?.department ?? '院系未知'}</small>
                    </div>
                    <span className="spacer" />
                    <Button
                      size="sm"
                      onClick={() => {
                        dispatch({ type: 'friends/accept', requestId: request.id });
                        show('已添加为好友（本地演示）', 'success');
                      }}
                    >
                      接受
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dispatch({ type: 'friends/decline', requestId: request.id })}
                    >
                      忽略
                    </Button>
                  </li>
                );
              })}
              {outgoing.map((request) => {
                const user = state.users.find((item) => item.id === request.userId);
                return (
                  <li key={request.id} className="request-row">
                    <Avatar name={user?.name ?? '同学'} size="sm" />
                    <div>
                      <strong>{user?.name ?? '同学'}</strong>
                      <small>等待对方处理</small>
                    </div>
                    <span className="spacer" />
                    <span className="pill pill--soft">已发送</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>邀约</h2>
            <span className="pill">{pendingInvites.length} 个待回复</span>
          </div>
          {state.invites.length === 0 ? (
            <EmptyState
              icon="invite"
              title="还没有邀约"
              description="从好友卡片发起一次自习或运动邀约。"
            />
          ) : (
            <ul className="invite-list">
              {state.invites.map((invite) => (
                <InviteRow key={invite.id} invite={invite} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel__head">
          <h2>我的好友</h2>
          <span className="pill">{friends.length} 位</span>
        </div>
        {friends.length === 0 ? (
          <EmptyState
            icon="users"
            title="还没有好友"
            description="通过论坛作者头像或匹配页发送好友申请。"
            action={<Button onClick={() => setAddOpen(true)}>查找同学</Button>}
          />
        ) : (
          <ul className="friend-grid">
            {friends.map((user) => (
              <FriendCard key={user.id} user={user} onMenu={setMenuUser} />
            ))}
          </ul>
        )}
      </section>

      {addOpen ? <AddFriendDialog onClose={() => setAddOpen(false)} /> : null}

      {menuUser ? (
        <Dialog title={`${menuUser.name} · 好友操作`} onClose={() => setMenuUser(null)}>
          <div className="stack">
            <Button
              variant="secondary"
              icon={<Icon name="chat" size={16} />}
              onClick={() => navigate(ROUTES.chat(menuUser.id))}
            >
              进入聊天
            </Button>
            <Button
              variant="secondary"
              icon={<Icon name="invite" size={16} />}
              onClick={() => {
                setInviteUser(menuUser);
                setMenuUser(null);
              }}
            >
              发起邀约
            </Button>
            <Button
              variant="ghost"
              icon={<Icon name="report" size={16} />}
              onClick={() => {
                show('演示举报已记录；正式版本需接入内容审核流程', 'info');
                setMenuUser(null);
              }}
            >
              举报
            </Button>
            <Button
              variant="ghost"
              icon={<Icon name="block" size={16} />}
              onClick={() => block(menuUser)}
            >
              拉黑
            </Button>
            <Button
              variant="danger"
              icon={<Icon name="userMinus" size={16} />}
              onClick={() => remove(menuUser)}
            >
              移除好友
            </Button>
          </div>
        </Dialog>
      ) : null}

      {inviteUser ? <InviteDialog user={inviteUser} onClose={() => setInviteUser(null)} /> : null}
    </div>
  );
}
