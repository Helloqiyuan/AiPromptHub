import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { api } from '../lib/api';

export default function AdminPage() {
  const { user } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [users, setUsers] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', parentId: 1, sort: 0, description: '' });

  async function load() {
    try {
      const [s, p, u] = await Promise.all([
        api.adminStats(),
        api.adminPrompts({ page: 1, pageSize: 20 }),
        api.adminUsers({ page: 1, pageSize: 20 }),
      ]);
      setStats(s.data);
      setPrompts(p.data.list || []);
      setUsers(u.data.list || []);
    } catch (e) {
      alert(e.message);
    }
  }

  useEffect(() => { load(); }, []);
  if (!['admin', 'super_admin'].includes(user?.role)) return <div>无权限</div>;

  return (
    <section>
      <h1>后台管理</h1>
      {stats && <div className="panel">用户 {stats.userCount} | Prompt {stats.promptCount} | 评论 {stats.commentCount} | 点赞 {stats.likeCount}</div>}
      <h2>审核 Prompt</h2>
      <div className="panel">{prompts.map((p) => (
        <div key={p.id} className="row">
          <span>{p.title} ({p.status})</span>
          <button onClick={() => api.reviewPrompt(p.id, 'published').then(load)}>通过</button>
          <button onClick={() => api.reviewPrompt(p.id, 'rejected').then(load)}>驳回</button>
          <button onClick={() => api.adminDeletePrompt(p.id).then(load)}>删除</button>
        </div>
      ))}</div>
      <h2>用户管理</h2>
      <div className="panel">{users.map((u) => (
        <div key={u.id} className="row">
          <span>{u.username} / {u.role} / {u.status}</span>
          {user.role === 'super_admin' && <button onClick={() => api.updateUserRole(u.id, u.role === 'user' ? 'admin' : 'user').then(load)}>切换角色</button>}
          <button onClick={() => api.updateUserStatus(u.id, u.status === 'active' ? 'disabled' : 'active').then(load)}>切换状态</button>
        </div>
      ))}</div>
      <h2>新增分类</h2>
      <div className="panel form-inline">
        <input placeholder="名称" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
        <input placeholder="父ID" type="number" value={newCategory.parentId} onChange={(e) => setNewCategory({ ...newCategory, parentId: Number(e.target.value) })} />
        <input placeholder="排序" type="number" value={newCategory.sort} onChange={(e) => setNewCategory({ ...newCategory, sort: Number(e.target.value) })} />
        <input placeholder="描述" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
        <button onClick={() => api.createCategory(newCategory).then(() => { alert('创建成功'); setNewCategory({ name: '', parentId: 1, sort: 0, description: '' }); })}>创建</button>
      </div>
    </section>
  );
}
