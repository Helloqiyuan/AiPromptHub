import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { AppContext } from '../App';

export default function PromptCard({ item, onChanged }) {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  async function toggle(type, event) {
    event.stopPropagation();
    if (!user) return alert('请先登录');
    try {
      const res = type === 'like' ? await api.toggleLike(item.id) : await api.toggleFavorite(item.id);
      onChanged(item.id, res.data, type);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <article className="card fade-in" onClick={() => navigate(`/prompts/${item.id}`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/prompts/${item.id}`); }}>
      {item.image && <img src={item.image} alt={item.title} className="thumb" />}
      <div className="card-body">
        <div className="title">{item.title}</div>
        <p className="summary">{item.summary || item.usageScenario || '暂无摘要'}</p>
        <div className="meta">#{item.category?.name || '未分类'} · by {item.author?.username || '匿名'}</div>
        <div className="tag-row">{(item.tags || []).map((tag) => <span key={tag.id}>#{tag.name}</span>)}</div>
        <div className="actions">
          <button className={item.liked ? 'active' : ''} onClick={(e) => toggle('like', e)}>点赞 {item.likeCount}</button>
          <button className={item.favorited ? 'active' : ''} onClick={(e) => toggle('fav', e)}>收藏 {item.favoriteCount}</button>
          <span>评论 {item.commentCount}</span>
        </div>
      </div>
    </article>
  );
}
