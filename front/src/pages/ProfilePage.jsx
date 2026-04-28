import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { api } from '../lib/api';
import PromptCard from '../components/PromptCard';

export default function ProfilePage() {
  const { user, setUser } = useContext(AppContext);
  const [tab, setTab] = useState('prompts');
  const [profile, setProfile] = useState(user);
  const [list, setList] = useState([]);

  function loadTab() {
    const action = tab === 'prompts' ? api.myPrompts : tab === 'favorites' ? api.myFavorites : api.myComments;
    action({ page: 1, pageSize: 20 }).then((res) => setList(res.data.list || [])).catch((e) => alert(e.message));
  }

  useEffect(() => {
    api.me().then((res) => {
      setProfile(res.data);
      setUser(res.data);
    });
  }, [setUser]);

  useEffect(() => { loadTab(); }, [tab]);

  async function saveProfile() {
    try {
      const res = await api.updateMe({ username: profile.username, email: profile.email, phone: profile.phone, bio: profile.bio, avatar: profile.avatar });
      setProfile(res.data);
      setUser(res.data);
      alert('保存成功');
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section>
      <h1>个人中心</h1>
      <div className="profile-grid">
        <div className="panel">
          <input value={profile?.username || ''} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
          <input value={profile?.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <input value={profile?.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          <input value={profile?.avatar || ''} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} />
          <textarea value={profile?.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          <button onClick={saveProfile}>保存资料</button>
        </div>
        <div className="panel">
          <div>我的Prompt: {profile?.stats?.promptCount || 0}</div>
          <div>我的收藏: {profile?.stats?.favoriteCount || 0}</div>
          <div>我的评论: {profile?.stats?.commentCount || 0}</div>
        </div>
      </div>
      <div className="tabs">
        <button onClick={() => setTab('prompts')}>我的Prompt</button>
        <button onClick={() => setTab('favorites')}>我的收藏</button>
        <button onClick={() => setTab('comments')}>我的评论</button>
      </div>
      {tab !== 'comments' ? (
        <div className="grid">{list.map((item) => <PromptCard key={item.id} item={item} onChanged={() => loadTab()} />)}</div>
      ) : (
        <div className="panel">{list.map((c) => <p key={c.id}>[{c.prompt?.title}] {c.content}</p>)}</div>
      )}
    </section>
  );
}
