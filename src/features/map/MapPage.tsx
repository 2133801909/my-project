import { useState } from 'react';
import { useApp } from '@/app/context';
import type { Campus } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { PageHeader } from '@/components/ui/PageHeader';
import xiasha from '@/assets/maps/xiasha.svg';
import wenyi from '@/assets/maps/wenyi.svg';
import dongyue from '@/assets/maps/dongyue.svg';
import shaoxing from '@/assets/maps/shaoxing.svg';
import qingshanhu from '@/assets/maps/qingshanhu.svg';

const CAMPUSES: Campus[] = ['下沙校区', '文一校区', '东岳校区', '绍兴校区', '青山湖校区'];

const MAPS: Record<Campus, string> = {
  下沙校区: xiasha,
  文一校区: wenyi,
  东岳校区: dongyue,
  绍兴校区: shaoxing,
  青山湖校区: qingshanhu,
};

export function MapPage() {
  const { state, dispatch } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="page">
      <PageHeader
        eyebrow="校园空间"
        title="校园地图"
        description="基于 OpenStreetMap 的离线地图，仅供参考；数据可能不完整或过时，不提供地点搜索和导航。"
        actions={
          <Button variant="secondary" onClick={() => setSearchOpen(true)}>
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
        <span className="pill">离线地图 · 仅供参考</span>
      </div>

      <figure className="campus-map">
        <a href={MAPS[state.mapCampus]} target="_blank" rel="noreferrer">
          <img src={MAPS[state.mapCampus]} alt={`${state.mapCampus}的 OpenStreetMap 离线地图`} />
        </a>
        <figcaption>
          地图数据 © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap 贡献者</a>，
          遵循 ODbL 许可。点击地图可查看原图。地图并非校方提供，内容可能不完整或过时。
        </figcaption>
      </figure>

      {searchOpen ? (
        <Dialog title="地点搜索" onClose={() => setSearchOpen(false)}>
          <div className="stack">
            <p>当前为静态离线地图，地点搜索、室内信息和路线导航尚未接入。</p>
            <Button onClick={() => setSearchOpen(false)}>知道了</Button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
