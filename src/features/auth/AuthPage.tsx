import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '@/app/context';
import { ROUTES } from '@/app/routes';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

type Mode = 'login' | 'register';

export function AuthPage() {
  const { session, signIn, register, continueAsGuest } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (session) return <Navigate to={ROUTES.dashboard} replace />;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = mode === 'login' ? signIn(name) : register(name);
    if (!result.ok) {
      setError(result.error ?? '操作失败，请重试');
      return;
    }
    navigate(ROUTES.dashboard, { replace: true });
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  return (
    <main className="auth-screen">
      <section className="auth-intro">
        <span className="brand__mark brand__mark--large">同</span>
        <p className="eyebrow">TÓNGPÍN · CAMPUS</p>
        <h1>把课表、待办和校园连接，放在同一个节奏里。</h1>
        <p>
          同频是一个面向大学生的校园生活助手原型：课表、作业、个人安排、好友邀约、同系匹配与校园论坛，
          都以本地演示数据呈现。
        </p>
        <ul className="auth-points">
          <li>
            <Icon name="shield" /> 不收集密码，不联网同步
          </li>
          <li>
            <Icon name="users" /> 好友与匹配只在当前浏览器模拟
          </li>
          <li>
            <Icon name="map" /> 地图为明确标注的占位数据
          </li>
        </ul>
      </section>

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-tabs" role="tablist" aria-label="演示账号入口">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => switchMode('login')}
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => switchMode('register')}
          >
            注册
          </button>
        </div>

        <h2 id="auth-title">{mode === 'login' ? '进入演示账号' : '创建演示账号'}</h2>
        <p className="muted">
          登录、注册仅为界面演示：仅按昵称在当前浏览器保存不同资料，不验证身份、密码或学校账号。
        </p>

        <form id="auth-form" className="stack" onSubmit={submit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="demo-name">
              演示昵称
            </label>
            <input
              id="demo-name"
              name="demoName"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：小林同学"
              autoComplete="nickname"
              maxLength={40}
            />
            <span className="field__hint">2–40 个字符；不会要求输入密码。</span>
          </div>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="btn--block">
            {mode === 'login' ? '登录' : '创建账号'}
          </Button>
        </form>

        <div className="auth-divider">
          <span>或</span>
        </div>

        <Button
          variant="secondary"
          className="btn--block"
          onClick={() => {
            continueAsGuest();
            navigate(ROUTES.dashboard, { replace: true });
          }}
        >
          演示访客进入
        </Button>

        <p className="auth-note">
          退出后需再次输入同一昵称进入。此流程不构成真实账号认证，不收集、不保存密码。
        </p>
      </section>
    </main>
  );
}
