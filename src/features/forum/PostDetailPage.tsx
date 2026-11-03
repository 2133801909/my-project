import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';
import { canWithdrawPost } from '@/domain/forum';
import { uid } from '@/domain/ids';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader, Tag } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/toast/context';

export function PostDetailPage() {
  const { postId = '' } = useParams();
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();
  const post = state.posts.find((item) => item.id === postId);
  const author = state.users.find((user) => user.name === post?.author);
  const own = post ? canWithdrawPost(post, state.profile.name) : false;

  if (!post) {
    return (
      <div className="page">
        <EmptyState
          icon="forum"
          title="找不到这条内容"
          description="它可能已经被撤回。"
          action={<Link to={ROUTES.forum}>返回论坛</Link>}
        />
      </div>
    );
  }

  const comment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = String(form.get('comment') ?? '').trim();
    if (!body) return;
    dispatch({
      type: 'forum/comment',
      postId: post.id,
      comment: { id: uid('pc'), author: state.profile.name, body },
    });
    event.currentTarget.reset();
    show('评论已添加', 'success');
  };

  const withdraw = () => {
    if (!window.confirm('确定撤回这条自己发布的内容吗？')) return;
    dispatch({ type: 'forum/withdraw', id: post.id });
    show('内容已撤回', 'info');
    navigate(ROUTES.forum);
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="内容详情"
        title={post.title}
        description={`${post.type} · ${post.time}`}
        actions={
          <Link to={ROUTES.forum} className="btn btn--ghost btn--md">
            <Icon name="arrowLeft" size={16} /> 返回论坛
          </Link>
        }
      />

      <div className="post-detail-layout">
        <article className="panel post-detail">
          <header className="post-detail__author">
            <Avatar name={post.author} size="md" decorative />
            <div>
              <strong>{post.author}</strong>
              <small>{author ? `${author.department} · ${author.year}` : '演示用户'}</small>
            </div>
            <span className="spacer" />
            {own ? (
              <Button variant="ghost" size="sm" onClick={withdraw}>
                撤回
              </Button>
            ) : null}
          </header>

          <p className="post-detail__body">{post.body}</p>

          <div className="friend-card__tags">
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>

          <div className="post-card__actions">
            <button
              type="button"
              className={`action-button${post.liked ? ' is-active' : ''}`}
              aria-pressed={post.liked}
              onClick={() => dispatch({ type: 'forum/toggle-like', id: post.id })}
            >
              ♡ {post.likes}
            </button>
            <span className="muted">{post.comments.length} 条评论</span>
            <span className="spacer" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => show('演示举报已记录；正式版本需接入内容审核流程', 'info')}
            >
              举报
            </Button>
          </div>

          <section className="comments">
            <h2>评论</h2>
            {post.comments.length === 0 ? (
              <p className="muted">还没有评论，来聊聊吧。</p>
            ) : (
              <ul className="comment-list">
                {post.comments.map((item) => (
                  <li key={item.id} className="comment-row">
                    <Avatar name={item.author} size="sm" decorative />
                    <div>
                      <strong>{item.author}</strong>
                      <p>{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form className="comment-form" onSubmit={comment}>
              <label className="field" htmlFor="comment">
                <span className="field__label">写评论</span>
                <textarea
                  id="comment"
                  name="comment"
                  className="input textarea"
                  rows={3}
                  placeholder="友善交流，尊重不同观点"
                />
              </label>
              <Button type="submit">发表评论</Button>
            </form>
          </section>
        </article>

        <aside className="panel forum-aside">
          <h2>关于作者</h2>
          <Avatar name={post.author} size="lg" decorative />
          <p>
            <strong>{post.author}</strong>
          </p>
          <p className="muted">{author?.department ?? '院系未知'}</p>
          {author && !author.friend && author.name !== state.profile.name ? (
            <Button
              variant="secondary"
              onClick={() => {
                dispatch({
                  type: 'friends/request',
                  request: { id: uid('r'), userId: author.id, status: 'outgoing' },
                });
                show('好友申请已记录（本地演示）', 'success');
              }}
            >
              加为好友
            </Button>
          ) : null}
          {author?.friend ? (
            <Link to={ROUTES.chat(author.id)} className="btn btn--primary btn--md">
              进入聊天
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
