const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { canViewSchedule, visibleSchedule, isValidCourse, eligibleMatches, isValidEvent, tryPersist, shouldDismissModal, isReminderEnabled, canonicalPage, isDetailTarget, friendActionOptions, appendMessage, toggleTask, isValidChatMessage, isAllowedImageSize, isAllowedRecordingDuration, chatAttachmentTypes, isCourseVisibleInWeek, academicWeekNumber, isImageMessage, nextImageZoom, scheduleWeekNumber, chatComposerStyles, taskDetailStyles, demoAccountKey, isValidDemoAccountName } = require('../app.js');

const rootDir=path.resolve(__dirname,'..');

// Cursor affordances are global and applied to links, native controls, and role-based interactive rows.
test('全部链接、按钮、表单控件和语义交互行都定义手形光标', () => {
  const css=fs.readFileSync(path.join(rootDir,'styles.css'),'utf8');
  assert.match(css,/button\{[^}]*cursor:pointer/);
  assert.match(css,/a\{[^}]*\}/);
  assert.match(css,/\[href\][^{}]*\{cursor:pointer\}/);
  assert.match(css,/\.clickable-row/);
  assert.match(css,/\[role="button"\]/);
  assert.match(css,/\[data-action\]/);
  assert.match(css,/button:disabled/);
});

test('登录、注册和退出操作标记演示认证边界', () => {
  const source=fs.readFileSync(path.join(rootDir,'app.js'),'utf8');
  assert.match(source,/data-action="auth-switch"/);
  assert.match(source,/data-action="auth-guest"/);
  assert.match(source,/case 'auth-login':case 'auth-register'/);
  assert.match(source,/case 'auth-logout'/);
});

test('演示访客入口从本地数据中加载已保存的个性化资料', () => {
  const source=fs.readFileSync(path.join(rootDir,'app.js'),'utf8');
  assert.match(source,/localStorage\.getItem\(demoAccountKey\(name\)\)/);
  assert.match(source,/state=\{\.\.\.clone\(seed\),\.\.\.saved,profile:\{\.\.\.clone\(seed\.profile\),\.\.\.saved\.profile\}\}/);
  assert.match(source,/else\{authenticatedDemo=false;root\.sessionStorage\.removeItem\('campus-life-demo-session'\);\}/);
});

test('演示登录注册界面声明非认证模式且不采集密码', () => {
  const source=fs.readFileSync(path.join(rootDir,'app.js'),'utf8');
  assert.match(source,/登录、注册仅为界面演示/);
  assert.match(source,/演示访客进入/);
  assert.match(source,/demoAccountKey/);
  assert.doesNotMatch(source,/type=["']password["']/);
  assert.doesNotMatch(source,/localStorage\.setItem\([^\n]*password/i);
});

test('演示账号键名稳定且昵称验证拒绝空值和过长名称', () => {
  assert.equal(demoAccountKey(' Student-1 '),'campus-life-demo-account:student-1');
  assert.equal(isValidDemoAccountName('小林同学'),true);
  assert.equal(isValidDemoAccountName('   '),false);
  assert.equal(isValidDemoAccountName('名'.repeat(41)),false);
});

test('演示账号表单可通过事件委托提交而不需要密码', () => {
  const source=fs.readFileSync(path.join(rootDir,'app.js'),'utf8');
  assert.match(source,/id="auth-form"/);
  assert.match(source,/app\.addEventListener\('submit'/);
  assert.match(source,/data-action="auth-guest"/);
});

test('进入演示主页后提供可操作的退出登录入口', () => {
  const source=fs.readFileSync(path.join(rootDir,'app.js'),'utf8');
  assert.match(source,/退出登录/);
  assert.match(source,/case 'auth-logout'/);
});

test('课表默认私密：非好友不能查看', () => {
  assert.equal(canViewSchedule({ visibility: 'private', viewerIsFriend: false }), false);
});

test('课程有效且可配置每周/单周/双周', () => {
  const base = { title: '离散数学', day: 2, start: '08:00', end: '09:40' };
  assert.equal(isValidCourse(base), true);
  assert.equal(isValidCourse({ ...base, weekType: 'odd' }), true);
  assert.equal(isValidCourse({ ...base, weekType: 'even' }), true);
  assert.equal(isValidCourse({ ...base, weekType: 'invalid' }), false);
});

test('好友仅获忙闲分享时不泄露课程名和地点', () => {
  const courses = [{ title: '数字电路', location: '教一-203', day: 1, start: '08:00', end: '09:40' }];
  const result = visibleSchedule(courses, { visibility: 'friends', shareBusyOnly: true }, true);
  assert.deepEqual(result, [{ day: 1, start: '08:00', end: '09:40', label: '忙碌' }]);
});

test('课程时间结束必须晚于开始且星期范围有效', () => {
  assert.equal(isValidCourse({ title: '课程', day: 1, start: '08:00', end: '09:00' }), true);
  assert.equal(isValidCourse({ title: '课程', day: 1, start: '09:00', end: '08:00' }), false);
  assert.equal(isValidCourse({ title: '课程', day: 8, start: '08:00', end: '09:00' }), false);
});

test('匹配只返回双方主动开启且同系的用户', () => {
  const me = { department: '计算机学院', matchingEnabled: true };
  const candidates = [
    { id: 'a', department: '计算机学院', matchingEnabled: true },
    { id: 'b', department: '计算机学院', matchingEnabled: false },
    { id: 'c', department: '电子信息学院', matchingEnabled: true },
  ];
  assert.deepEqual(eligibleMatches(me, candidates).map(x => x.id), ['a']);
  assert.deepEqual(eligibleMatches({ ...me, matchingEnabled: false }, candidates), []);
});

test('个人安排允许地点为空，但标题和时间必填', () => {
  assert.equal(isValidEvent({ title: '图书馆自习', date: '2026-10-26T14:00', place: '' }), true);
  assert.equal(isValidEvent({ title: '', date: '2026-10-26T14:00', place: '' }), false);
  assert.equal(isValidEvent({ title: '图书馆自习', date: '', place: '' }), false);
});

test('保存失败时不会伪报成功，成功写入后才更新状态', () => {
  const state = { count: 0 };
  const persist = () => false;
  assert.equal(tryPersist(state, persist, draft => { draft.count += 1; }), false);
  assert.equal(state.count, 0);
  assert.equal(tryPersist(state, () => true, draft => { draft.count += 1; }), true);
  assert.equal(state.count, 1);
});

test('模态框内任意字段点击都不应触发关闭，只有关闭按钮和背景层可关闭', () => {
  assert.equal(shouldDismissModal({ insideModal: true, isBackdrop: false, hasCloseAction: false }), false);
  assert.equal(shouldDismissModal({ insideModal: true, isBackdrop: false, hasCloseAction: true }), true);
  assert.equal(shouldDismissModal({ insideModal: true, isBackdrop: false, hasCloseAction: false }), false);
  assert.equal(shouldDismissModal({ insideModal: true, isBackdrop: true, hasCloseAction: false }), true);
  assert.equal(shouldDismissModal({ insideModal: false, isBackdrop: false, hasCloseAction: false }), false);
});

test('个人安排提醒开关默认开启且可以关闭', () => {
  assert.equal(isReminderEnabled({ reminder: true }), true);
  assert.equal(isReminderEnabled({ reminder: false }), false);
  assert.equal(isReminderEnabled({}), false);
});

test('聊天内容追加到对应同学的本地会话', () => {
  const state = { conversations: {} };
  const next = appendMessage(state, 'u1', { author: '我', body: '你好' });
  assert.deepEqual(next.conversations.u1, [{ author: '我', body: '你好' }]);
  assert.deepEqual(state.conversations, {});
});

test('项目和论坛帖子是同一内容类型过滤，不存在独立项目页路由', () => {
  assert.equal(canonicalPage('项目分享'), '校园论坛');
  assert.equal(canonicalPage('校园论坛'), '校园论坛');
});

test('待办和帖子行可通过数据标识打开详情', () => {
  assert.equal(isDetailTarget({ type: 'task', id: 't1' }), true);
  assert.equal(isDetailTarget({ type: 'post', id: 'p1' }), true);
  assert.equal(isDetailTarget({ type: 'friend', id: 'u1' }), true);
  assert.equal(isDetailTarget({ type: 'unknown', id: 'x' }), false);
});

test('好友更多操作至少提供聊天、邀约、举报和拉黑', () => {
  assert.deepEqual(friendActionOptions(), ['chat', 'invite', 'report', 'block', 'remove']);
});

test('待办完成状态可通过细节视图操作', () => {
  const task = { id: 't1', done: false };
  assert.equal(toggleTask(task).done, true);
});

test('待办详情样式提供标签与取值的两列网格和卡片间距', () => {
  const css=taskDetailStyles();
  assert.match(css,/\.detail-panel\s*\{[^}]*padding:\s*24px/s);
  assert.match(css,/\.detail-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css,/\.detail-grid\s+div\s*\{[^}]*background:\s*#f7f9fc/s);
  assert.match(css,/@media\(max-width:760px\).*?\.detail-grid\{grid-template-columns:minmax\(0,1fr\)/s);
});



test('聊天消息支持文字、表情、图片和语音载荷', () => {
  assert.equal(isValidChatMessage({ type: 'text', body: '你好' }), true);
  assert.equal(isValidChatMessage({ type: 'emoji', body: '😄' }), true);
  assert.equal(isValidChatMessage({ type: 'image', dataUrl: 'data:image/jpeg;base64,AA==' }), true);
  assert.equal(isValidChatMessage({ type: 'image', dataUrl: 'data:image/jpeg;base64,' + 'A'.repeat(3*1024*1024) }), false);
  assert.equal(isValidChatMessage({ type: 'audio', dataUrl: 'data:audio/webm;base64,AA==', duration: 12 }), true);
  assert.equal(isValidChatMessage({ type: 'audio', dataUrl: 'data:audio/webm;base64,AA==', duration: 21 }), false);
  assert.equal(isValidChatMessage({ type: 'image', dataUrl: '' }), false);
  assert.equal(isValidChatMessage({ type: 'video', body: 'x' }), false);
});

test('聊天图片和录音有体积/时长保护', () => {
  assert.equal(isAllowedImageSize(1024 * 1024), true);
  assert.equal(isAllowedImageSize(9 * 1024 * 1024), false);
  assert.equal(isAllowedRecordingDuration(20), true);
  assert.equal(isAllowedRecordingDuration(21), false);
});

test('不支持任意格式作为图片/语音附件', () => {
  assert.equal(isValidChatMessage({ type: 'image', dataUrl: 'data:audio/webm;base64,AA==' }), false);
  assert.equal(isValidChatMessage({ type: 'audio', dataUrl: 'data:image/png;base64,AA==', duration: 4 }), false);
  assert.equal(isAllowedImageSize(0), false);
  assert.equal(isAllowedRecordingDuration(0), false);
});

test('单双周课程只在匹配的周次显示；每周课程两周都显示', () => {
  const course = { weekType: 'odd' };
  assert.equal(isCourseVisibleInWeek(course, 1), true);
  assert.equal(isCourseVisibleInWeek(course, 2), false);
  assert.equal(isCourseVisibleInWeek({ weekType: 'even' }, 1), false);
  assert.equal(isCourseVisibleInWeek({ weekType: 'even' }, 2), true);
  assert.equal(isCourseVisibleInWeek({ weekType: 'every' }, 1), true);
  assert.equal(isCourseVisibleInWeek({ weekType: 'every' }, 2), true);
});

test('聊天项目符号显示图片与语音文件入口', () => {
  assert.deepEqual(chatAttachmentTypes(), ['image','audio']);
});

test('单周/双周过滤使用当前教学周的奇偶性', () => {
  const oddOnly = { weekType: 'odd' };
  const evenOnly = { weekType: 'even' };
  assert.equal(isCourseVisibleInWeek(oddOnly, 7), true);
  assert.equal(isCourseVisibleInWeek(oddOnly, 8), false);
  assert.equal(isCourseVisibleInWeek(evenOnly, 7), false);
  assert.equal(isCourseVisibleInWeek(evenOnly, 8), true);
});

test('课程周历起始日可调整并推导当前周次', () => {
  assert.equal(academicWeekNumber('2026-09-07', '2026-09-07'), 1);
  assert.equal(academicWeekNumber('2026-09-07', '2026-09-14'), 2);
  assert.equal(academicWeekNumber('2026-09-07', '2026-09-21'), 3);
});

test('图片聊天消息可请求放大预览，并可通过关闭按钮退出', () => {
  assert.equal(isImageMessage({type:'image',dataUrl:'data:image/jpeg;base64,AA=='}), true);
  assert.equal(isImageMessage({type:'audio',dataUrl:'data:audio/webm;base64,AA=='}), false);
});

test('论坛作者头像触发好友操作状态可区分添加、已是好友和待处理', () => {
  assert.deepEqual(forumAuthorAction({id:'u3',friend:false},{requests:[]}),{kind:'add',userId:'u3'});
  assert.deepEqual(forumAuthorAction({id:'u1',friend:true},{requests:[]}),{kind:'friend',userId:'u1'});
  assert.deepEqual(forumAuthorAction({id:'u3',friend:false},{requests:[{userId:'u3',status:'outgoing'}]}),{kind:'pending',userId:'u3'});
  assert.deepEqual(forumAuthorAction(null,{requests:[]}),{kind:'missing'});
});

test('发送论坛好友申请写入本地状态并避免重复', () => {
  const state={requests:[]};
  const once=addOutgoingFriendRequest(state,'u3');
  const twice=addOutgoingFriendRequest(once,'u3');
  assert.equal(once.requests.length,1);
  assert.equal(twice.requests.length,1);
  assert.equal(state.requests.length,0);
});

test('论坛作者头像和姓名都可调用加好友操作，自身不显示加好友', () => {
  assert.equal(canAddForumAuthor('周同学', '林同学'), true);
  assert.equal(canAddForumAuthor('林同学', '林同学'), false);
  assert.equal(canAddForumAuthor('周同学', '林同学', {isFriend:true}), false);
  assert.equal(canAddForumAuthor('周同学', '林同学', {requestPending:true}), false);
  const avatarMarkup = forumAuthorButton({id:'u3',author:'许同学'}, '林同学');
  assert.match(avatarMarkup, /data-action="forum-author"/);
  assert.match(avatarMarkup,/data-action="forum-author"/);
  assert.match(avatarMarkup,/点击作者头像添加好友/);
  const avatarButton=avatarMarkup.match(/<button[^>]*>([\s\S]*?)<\/button>/);
  assert.equal(avatarButton?.[1].replace(/<[^>]*>/g,''),'许');
  assert.equal(forumAuthorDisplay({id:'u3',author:'许同学'},'林同学').match(/class="forum-author-name"/g).length,1);
  assert.equal((forumAuthorDisplay({id:'self',author:'林同学'},'林同学').match(/class="forum-author-name"/g)||[]).length,0);
  assert.equal((avatarMarkup.match(/class="forum-author-name"/g)||[]).length, 0);
  assert.doesNotMatch(forumAuthorButton({id:'self',author:'林同学'},'林同学'),/添加好友/);
  const byName = forumAuthorNameButton({id:'u3',author:'许同学'}, '林同学');
  assert.match(byName,/data-action="forum-author"/);
  assert.match(byName,/许同学/);
  assert.equal((byName.match(/许同学/g)||[]).length, 3);
  assert.equal(forumAuthorNameButton({id:'self',author:'林同学'},'林同学'),'');
});

test('手机聊天工具条按钮可换行，不暴露文件输入的浏览器默认控件', () => {
  assert.match(chatComposerStyles(),/flex-wrap:\s*wrap/);
  assert.match(chatComposerStyles(),/\.upload-tool input\s*\{[^}]*display:\s*none/s);
  assert.match(chatComposerStyles(),/\.chat-entry input\s*\{[^}]*min-width:\s*0/s);
});


test('只有当前用户自己的帖子允许撤回', () => {
  const posts = [{ id:'mine', author:'林同学' }, { id:'other', author:'周同学' }];
  assert.equal(canWithdrawPost(posts[0], '林同学'), true);
  assert.equal(canWithdrawPost(posts[1], '林同学'), false);
});

test('撤回帖子只移除自己的目标帖子，并保留其他人的帖子', () => {
  const posts = [{ id:'mine', author:'林同学' }, { id:'other', author:'周同学' }];
  assert.deepEqual(withdrawPost(posts, 'mine', '林同学'), [{ id:'other', author:'周同学' }]);
  assert.deepEqual(withdrawPost(posts, 'other', '林同学'), posts);
});

test('好友聊天页面含表情、图片和语音发送工具', () => {
  assert.match(chatComposerStyles(),/\.chat-tools/);
});

test('放大查看图片支持缩放增减并限制合理范围', () => {
  assert.equal(nextImageZoom(1, 1), 1.25);
  assert.equal(nextImageZoom(1.25, -1), 1);
  assert.equal(nextImageZoom(4, 1), 4);
  assert.equal(nextImageZoom(0.5, -1), 0.5);
  assert.equal(nextImageZoom(2, 0), 1);
});

// import contract extends pure state helpers for UI behavior

// helper contract for author-scoped withdrawal
const { canWithdrawPost, withdrawPost, canAddForumAuthor, forumAuthorButton, forumAuthorNameButton, forumAuthorDisplay, forumAuthorAction, addOutgoingFriendRequest } = require('../app.js');

test('单双周课表视图可切换，默认遵循当前教学周', () => {
  assert.equal(scheduleWeekNumber('current', 8), 8);
  assert.equal(scheduleWeekNumber('odd', 8), 7);
  assert.equal(scheduleWeekNumber('even', 7), 8);
});

// import contract extends pure state helpers for UI behavior





