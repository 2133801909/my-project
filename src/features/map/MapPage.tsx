import { useState } from 'react';
import { useApp } from '@/app/context';
import type { Campus } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';

const CAMPUSES: Campus[] = ['下沙校区', '文一校区', '东岳校区', '绍兴校区', '青山湖校区'];

export function MapPage() {
  const { state, dispatch } = useApp();
  const [dialog, setDialog] = useState<'info' | 'search' | null>(null);

  return (
    <div className="page">
      <PageHeader
        eyebrow="校园空间"
        title="校园地图"
        description="校区名称参考学校官网；建筑坐标、室内信息与导航尚未接入，页面明确标注为占位地图。"
        actions={
          <Button
            variant="secondary"
            icon={<Icon name="search" size={16} />}
            onClick={() => setDialog('search')}
          >
            地点搜索
          </Button>
        }
      />

      <div className="map-toolbar">
        <label className="field map-toolbar__select" htmlFor="campus-select">
          <span className="field__label">选择校区</span>
          <select
            id="campus-select"
            className="input"
            value={state.mapCampus}
            onChange={(event) =>
              dispatch({ type: 'map/select', campus: event.target.value as Campus })
            }
          >
            {CAMPUSES.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </label>
        <span className="pill pill--warn">地图数据未接入</span>
      </div>

      <section className="map-placeholder" aria-label="校园地图占位">
        <div className="map-grid" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="map-placeholder__content">
          <Icon name="map" size={30} />
          <h2>{state.mapCampus} · 占位地图</h2>
          <p>
            当前没有接入杭州电子科技大学的地图服务或校方地点数据，因此不展示假造的建筑坐标、校内路线或导航结果。
          </p>
          <Button variant="secondary" onClick={() => setDialog('info')}>
            了解接入说明
          </Button>
        </div>
      </section>

      <div className="map-cards">
        <article className="panel">
          <h2>已支持的校区名称</h2>
          <ul className="plain-list">
            {CAMPUSES.map((campus) => (
              <li key={campus}>
                <Icon name="check" size={15} /> {campus}
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>正式接入前需要</h2>
          <ul className="plain-list">
            <li>校方可公开的地图数据与地点目录</li>
            <li>地图服务使用许可与密钥管理</li>
            <li>无障碍路线与隐私影响评估</li>
          </ul>
        </article>
      </div>

      {dialog === 'info' ? (
        <Dialog title="地图接入说明" onClose={() => setDialog(null)}>
          <div className="stack">
            <p>
              当前没有接入杭州电子科技大学的地图服务或校方地点数据，因此不展示假造的建筑坐标、校内路线或导航结果。
            </p>
            <p>
              正式接入需确认校方可公开的地图数据、地点目录和地图服务使用许可，并安全配置地图服务密钥。
            </p>
            <Button onClick={() => setDialog(null)}>知道了</Button>
          </div>
        </Dialog>
      ) : null}

      {dialog === 'search' ? (
        <Dialog title="地点搜索" onClose={() => setDialog(null)}>
          <div className="stack">
            <p>地图数据尚未接入，目前不能搜索真实教学楼、食堂或图书馆位置。</p>
            <Button onClick={() => setDialog(null)}>知道了</Button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
