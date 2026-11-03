import { useState } from 'react';
import { useApp } from '@/app/context';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHeader, Tag } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/toast/context';
import { InterestsDialog, ProfileDialog, VisibilityControl } from './SettingsDialogs';

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>{label}</strong>
        <small>{description}</small>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`toggle${checked ? ' is-on' : ''}`}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const { state, dispatch, session, resetDemoData, signOut } = useApp();
  const { show } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(false);

  const accountLabel =
    session?.mode === 'account' ? session.name : session?.mode === 'guest' ? '访客' : '未登录';

  const exportData = () => {
    if (typeof URL.createObjectURL !== 'function') {
      show('当前环境不支持文件导出', 'error');
      return;
    }
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '同频-本地演示数据.json';
    anchor.click();
    URL.revokeObjectURL(url);
    show('已导出演示数据', 'success');
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="隐私与数据"
        title="隐私与设置"
        description="你可以随时查看、调整或撤回信息分享；所有设置只影响当前浏览器。"
      />

      <div className="settings-layout">
        <section className="panel settings-section">
          <div className="settings-section__head">
            <h2>演示资料</h2>
            <span className="pill pill--soft">{accountLabel}</span>
          </div>
          <div className="profile-summary">
            <Avatar name={state.profile.name} size="lg" />
            <div>
              <strong>{state.profile.name}</strong>
              <small>
                {state.profile.department} · {state.profile.year}
              </small>
              <div className="friend-card__tags">
                {state.profile.interests.map((interest) => (
                  <Tag key={interest}>{interest}</Tag>
                ))}
              </div>
            </div>
            <span className="spacer" />
            <div className="inline-actions">
              <Button variant="secondary" size="sm" onClick={() => setProfileOpen(true)}>
                编辑资料
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setInterestsOpen(true)}>
                编辑兴趣
              </Button>
            </div>
          </div>
        </section>

        <section className="panel settings-section">
          <h2>课表隐私</h2>
          <VisibilityControl />
          <ToggleRow
            label="只分享忙闲"
            description="开启后，好友只能看到某时段是否忙碌，不显示课程名和地点。"
            checked={state.settings.shareBusyOnly}
            onChange={() => dispatch({ type: 'settings/toggle-busy-only' })}
          />
        </section>

        <section className="panel settings-section">
          <h2>提醒</h2>
          <ToggleRow
            label="应用内提醒"
            description="仅展示页面内状态，不会在浏览器关闭后推送系统通知。"
            checked={state.settings.reminders}
            onChange={() => dispatch({ type: 'settings/toggle-reminders' })}
          />
        </section>

        <section className="panel settings-section">
          <h2>本地数据</h2>
          <p className="muted">
            导出为 JSON 便于检查演示数据；重置会清除当前浏览器中的修改并恢复初始演示数据。
          </p>
          <div className="inline-actions">
            <Button
              variant="secondary"
              icon={<Icon name="download" size={16} />}
              onClick={exportData}
            >
              导出 JSON
            </Button>
            <Button
              variant="danger"
              icon={<Icon name="refresh" size={16} />}
              onClick={() => {
                if (!window.confirm('清除本地修改并恢复初始演示数据？')) return;
                resetDemoData();
              }}
            >
              重置演示数据
            </Button>
            <Button variant="ghost" icon={<Icon name="logOut" size={16} />} onClick={signOut}>
              退出登录
            </Button>
          </div>
        </section>

        <section className="panel settings-section">
          <h2>演示边界</h2>
          <ul className="plain-list">
            <li>修改仅保存在当前浏览器的 localStorage，不会同步到其他设备。</li>
            <li>
              好友、匹配、邀请、论坛、提醒和举报均为本地演示，不会联系真实用户或发送后台通知。
            </li>
            <li>登录、注册仅按昵称保存不同演示资料；不验证身份、密码或学校账号，不保存密码。</li>
            <li>地图仅展示校区名称，未接入建筑坐标、室内信息或导航。</li>
            <li>该原型没有杭州电子科技大学官方背书。</li>
          </ul>
        </section>

        <section className="panel settings-section">
          <h2>来源</h2>
          <ul className="plain-list">
            <li>
              <a href="https://www.hdu.edu.cn/659/list.htm" target="_blank" rel="noreferrer">
                杭州电子科技大学 · 学校简介
              </a>
            </li>
            <li>
              <a href="https://www.hdu.edu.cn/" target="_blank" rel="noreferrer">
                杭州电子科技大学官网
              </a>
            </li>
          </ul>
        </section>
      </div>

      {profileOpen ? <ProfileDialog onClose={() => setProfileOpen(false)} /> : null}
      {interestsOpen ? <InterestsDialog onClose={() => setInterestsOpen(false)} /> : null}
    </div>
  );
}
