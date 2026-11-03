import { addDays, mondayOf, pad2, toISODate } from '@/domain/dates';
import type { AppState, Campus, Course, EventItem, Invite, Post, Task, User } from '@/domain/types';

const CAMPUSES: Campus[] = ['下沙校区', '文一校区', '东岳校区', '绍兴校区', '青山湖校区'];

function at(date: Date, hours: number, minutes = 0): string {
  const copy = new Date(date);
  copy.setHours(hours, minutes, 0, 0);
  return `${toISODate(copy)}T${pad2(copy.getHours())}:${pad2(copy.getMinutes())}`;
}

const courses: Course[] = [
  {
    id: 'c1',
    title: '数据结构与算法',
    day: 1,
    start: '08:00',
    end: '09:40',
    location: '教一 · 204',
    teacher: '张老师',
    color: 'blue',
    weekType: 'every',
  },
  {
    id: 'c2',
    title: '大学英语（提升）',
    day: 1,
    start: '13:30',
    end: '15:10',
    location: '教三 · 312',
    teacher: '李老师',
    color: 'plum',
    weekType: 'odd',
  },
  {
    id: 'c3',
    title: '概率论与数理统计',
    day: 2,
    start: '10:00',
    end: '11:40',
    location: '教二 · 108',
    teacher: '王老师',
    color: 'green',
    weekType: 'every',
  },
  {
    id: 'c4',
    title: '计算机组成原理',
    day: 3,
    start: '08:00',
    end: '09:40',
    location: '教一 · 402',
    teacher: '陈老师',
    color: 'orange',
    weekType: 'every',
  },
  {
    id: 'c5',
    title: '形势与政策',
    day: 4,
    start: '13:30',
    end: '15:10',
    location: '学生活动中心',
    teacher: '课程组',
    color: 'blue',
    weekType: 'even',
  },
  {
    id: 'c6',
    title: '数据库系统',
    day: 5,
    start: '10:00',
    end: '11:40',
    location: '教四 · 205',
    teacher: '赵老师',
    color: 'green',
    weekType: 'every',
  },
];

const users: User[] = [
  {
    id: 'u1',
    name: '周同学',
    department: '计算机学院',
    year: '大三',
    interests: ['开源', '摄影', '咖啡'],
    matchingEnabled: true,
    blocked: [],
    avatar: '周',
    friend: true,
    free: '今天 16:00 后空闲',
  },
  {
    id: 'u2',
    name: '陈同学',
    department: '计算机学院',
    year: '大二',
    interests: ['徒步', '开源', '桌游'],
    matchingEnabled: true,
    blocked: [],
    avatar: '陈',
    friend: false,
    free: '周三下午有空',
  },
  {
    id: 'u3',
    name: '许同学',
    department: '电子信息学院',
    year: '大二',
    interests: ['摄影', '音乐'],
    matchingEnabled: true,
    blocked: [],
    avatar: '许',
    friend: false,
    free: '周四傍晚有空',
  },
  {
    id: 'u4',
    name: '林同学',
    department: '计算机学院',
    year: '大三',
    interests: ['设计', '跑步'],
    matchingEnabled: false,
    blocked: [],
    avatar: '林',
    friend: false,
    free: '周末可约',
  },
];

/** Build a fresh, time-relative demo state. Pure except for the supplied clock. */
export function createSeed(now = new Date()): AppState {
  const today = new Date(now);
  const weekStart = mondayOf(addDays(today, -56));

  const tasks: Task[] = [
    {
      id: 't1',
      title: '完成链表实验报告',
      course: '数据结构与算法',
      due: at(addDays(today, 1), 23),
      note: '整理复杂度分析与测试截图',
      done: false,
    },
    {
      id: 't2',
      title: '英语演讲稿初稿',
      course: '大学英语（提升）',
      due: at(addDays(today, 3), 18),
      note: '主题：Technology and daily life',
      done: false,
    },
    {
      id: 't3',
      title: '数据库 ER 图练习',
      course: '数据库系统',
      due: at(addDays(today, 5), 20),
      note: '上传 PDF 至课程平台',
      done: false,
    },
    {
      id: 't4',
      title: '阅读：算法导论第 3 章',
      course: '数据结构与算法',
      due: at(addDays(today, -1), 20),
      note: '',
      done: true,
    },
  ];

  const events: EventItem[] = [
    {
      id: 'e1',
      title: '开源社例会',
      date: at(addDays(today, 1), 19),
      place: '线上 · 腾讯会议',
      note: '讨论新手任务',
      reminder: true,
    },
    {
      id: 'e2',
      title: '图书馆自习',
      date: at(addDays(today, 2), 14),
      place: '图书馆一楼',
      note: '',
      reminder: true,
    },
  ];

  const invites: Invite[] = [
    {
      id: 'i1',
      userId: 'u1',
      title: '一起去图书馆自习？',
      time: '今天 16:30',
      place: '图书馆一楼',
      status: 'pending',
      direction: 'incoming',
    },
  ];

  const posts: Post[] = [
    {
      id: 'p1',
      type: '讨论',
      author: '周同学',
      time: '今天 10:24',
      title: '第一次参加开源项目，从哪里开始比较好？',
      body: '想找适合新手的 issue 和协作流程，欢迎分享你们的经验。',
      tags: ['开源', '求建议'],
      likes: 8,
      liked: false,
      comments: [
        {
          id: 'pc1',
          author: '陈同学',
          body: '可以先看 good first issue 标签，先跑通本地环境。',
        },
      ],
    },
    {
      id: 'p2',
      type: '项目',
      author: '林同学',
      time: '昨天 18:40',
      title: '校园空教室查询小工具',
      body: '课程设计项目，想找一位熟悉前端的同学一起完善交互。欢迎对校园信息服务感兴趣的同学交流。',
      tags: ['项目招募', '前端'],
      likes: 12,
      liked: false,
      comments: [],
    },
    {
      id: 'p3',
      type: '分享',
      author: '许同学',
      time: '周五',
      title: '周末校园摄影散步路线',
      body: '整理了几处适合拍建筑和光影的地方，欢迎补充分享。',
      tags: ['摄影', '校园生活'],
      likes: 5,
      liked: false,
      comments: [],
    },
  ];

  return {
    profile: {
      id: 'you',
      name: '林同学',
      department: '计算机学院',
      year: '大二',
      interests: ['开源', '徒步', '咖啡'],
      matchingEnabled: false,
    },
    settings: { visibility: 'private', shareBusyOnly: true, reminders: true },
    courses: courses.map((course) => ({ ...course })),
    tasks,
    events,
    users: users.map((user) => ({
      ...user,
      interests: [...user.interests],
      blocked: [...user.blocked],
    })),
    requests: [{ id: 'r1', userId: 'u2', status: 'incoming' }],
    invites,
    conversations: {
      u1: [
        {
          id: 'm1',
          author: '周同学',
          body: '周末去图书馆吗？',
          time: '昨天 18:20',
          mine: false,
          type: 'text',
        },
        {
          id: 'm2',
          author: '我',
          body: '可以，周六下午见。',
          time: '昨天 18:26',
          mine: true,
          type: 'text',
        },
      ],
      u2: [],
    },
    posts,
    blocked: [],
    mapCampus: CAMPUSES[0],
    weekCalendar: { start: toISODate(weekStart) },
  };
}
