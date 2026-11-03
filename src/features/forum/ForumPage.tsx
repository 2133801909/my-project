import { useMemo, useState } from 'react';
import { useApp } from '@/app/context';
import { postsForFilter, POST_TYPES } from '@/domain/forum';
import type { Post, PostType } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, PageHeader, Tag } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/toast/context';
import { CreatePostDialog } from './CreatePostDialog';
import { PostCard } from './PostCard';

type Filter = PostType | '全部';

export function ForumPage() {
  const { state } = useApp();
  const { show } = useToast();
  const [filter, setFilter] = useState<Filter>('全部');
  const [createOpen, setCreateOpen] = useState(false);

  const visible = postsForFilter(state.posts, filter);
  const topics = useMemo(
    () => [...new Set(state.posts.flatMap((post) => post.tags))],
    [state.posts],
  );

  const report = (_post: Post) => {
    show('演示举报已记录；正式版本需接入内容审核和举报处理流程', 'info');
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="校园社区"
        title="校园论坛"
        description="讨论校园生活、交流经验，也分享项目。项目分享是内容类型，不单独占一个页面。"
        actions={
          <Button icon={<Icon name="plus" size={16} />} onClick={() => setCreateOpen(true)}>
            发布内容
          </Button>
        }
      />

      <div className="forum-layout">
        <section>
          <div className="forum-filters" role="group" aria-label="内容筛选">
            {(['全部', ...POST_TYPES] as Filter[]).map((item) => (
              <button
                key={item}
                type="button"
                className={`segmented__item${filter === item ? ' is-active' : ''}`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon="forum"
              title="这个分类还没有内容"
              description="发布第一条讨论或项目分享。"
              action={<Button onClick={() => setCreateOpen(true)}>发布内容</Button>}
            />
          ) : (
            <div className="post-list">
              {visible.map((post) => (
                <PostCard key={post.id} post={post} onReport={report} />
              ))}
            </div>
          )}
        </section>

        <aside className="forum-aside">
          <section className="panel">
            <h2>社区规范</h2>
            <p className="muted">
              尊重不同观点，不骚扰、不歧视；未经同意不发布他人联系方式、照片、位置和课程安排。
            </p>
            <p className="muted">演示版举报只显示本地提示，尚无管理员审核。</p>
          </section>

          <section className="panel">
            <h2>热门标签</h2>
            <div className="friend-card__tags">
              {topics.map((topic) => (
                <Tag key={topic}>{topic}</Tag>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {createOpen ? <CreatePostDialog onClose={() => setCreateOpen(false)} /> : null}
    </div>
  );
}
