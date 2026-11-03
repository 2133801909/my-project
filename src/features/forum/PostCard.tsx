import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';
import { canWithdrawPost, forumAuthorAction } from '@/domain/forum';
import { uid } from '@/domain/ids';
import type { Post } from '@/domain/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/toast/context';

interface PostCardProps {
  post: Post;
  onReport: (post: Post) => void;
}

export function PostCard({ post, onReport }: PostCardProps) {
  const { state, dispatch } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();
  const author = state.users.find((user) => user.name === post.author);
  const action = forumAuthorAction(author, state);
  const own = canWithdrawPost(post, state.profile.name);

  const handleAuthor = () => {
    if (!author) {
      show('这位作者没有可用的演示资料', 'info');
      return;
    }
    if (action.kind === 'add') {
      dispatch({
        type: 'friends/request',
        request: { id: uid('r'), userId: author.id, status: 'outgoing' },
      });
      show(`已向 ${author.name} 发送好友申请（本地演示）`, 'success');
      return;
    }
    if (action.kind === 'friend') {
      navigate(ROUTES.chat(author.id));
      return;
    }
    if (action.kind === 'pending') show('好友申请已发送，等待对方处理（演示）', 'info');
  };

  const withdraw = () => {
    if (!window.confirm('确定撤回这条自己发布的内容吗？')) return;
    dispatch({ type: 'forum/withdraw', id: post.id });
    show('内容已撤回', 'info');
  };

  return (
    <article className="post-card">
      <header className="post-card__head">
        <button
          type="button"
          className="author-button"
          onClick={handleAuthor}
          disabled={!author || own}
          aria-label={own ? `${post.author}（你自己）` : `查看 ${post.author} 并添加好友`}
        >
          <Avatar name={post.author} size="sm" decorative />
          <span>
            <strong>{post.author}</strong>
            <small>{post.time}</small>
          </span>
        </button>
        <span className="pill pill--soft">{post.type}</span>
      </header>

      <Link to={ROUTES.post(post.id)} className="post-card__title">
        <h3>{post.title}</h3>
      </Link>
      <p className="post-card__body">{post.body}</p>

      {post.tags.length > 0 ? (
        <div className="friend-card__tags">
          {post.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      ) : null}

      <footer className="post-card__actions">
        <button
          type="button"
          className={`action-button${post.liked ? ' is-active' : ''}`}
          aria-pressed={post.liked}
          onClick={() => dispatch({ type: 'forum/toggle-like', id: post.id })}
        >
          ♡ {post.likes}
        </button>
        <Link to={ROUTES.post(post.id)} className="action-button">
          <Icon name="chat" size={15} /> {post.comments.length}
        </Link>
        <span className="spacer" />
        <Button variant="ghost" size="sm" onClick={() => onReport(post)}>
          举报
        </Button>
        {own ? (
          <Button variant="ghost" size="sm" onClick={withdraw}>
            撤回
          </Button>
        ) : null}
      </footer>
    </article>
  );
}
