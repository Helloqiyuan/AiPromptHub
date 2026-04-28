import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentTree from '../components/CommentTree';
import { AppContext } from '../App';
import { api } from '../lib/api';

export default function PromptDetailPage() {
  const { id } = useParams();
  const { user } = useContext(AppContext);
  const [prompt, setPrompt] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [reply, setReply] = useState(null);

  function load() {
    Promise.all([api.promptDetail(id), api.commentTree(id)]).then(([p, c]) => {
      setPrompt(p.data);
      setComments(c.data || []);
    }).catch((e) => alert(e.message));
  }

  useEffect(() => { load(); }, [id]);

  async function submitComment() {
    if (!user) return alert('请先登录');
    if (!content.trim()) return;
    try {
      await api.createComment({ promptId: Number(id), content, parentId: reply?.id });
      setContent('');
      setReply(null);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function deleteComment(commentId) {
    try {
      await api.deleteComment(commentId);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  if (!prompt) return <div>加载中...</div>;

  return (
    <section className="detail">
      <h1>{prompt.title}</h1>
      <div className="meta">{prompt.author?.username} · {prompt.category?.name}</div>
      {prompt.image && <img src={prompt.image} alt={prompt.title} className="detail-image" />}
      <pre className="prompt-content">{prompt.content}</pre>
      <p>{prompt.usageScenario}</p>
      {prompt.exampleInput && <pre className="prompt-box">示例输入: {prompt.exampleInput}</pre>}
      {prompt.exampleOutput && <pre className="prompt-box">示例输出: {prompt.exampleOutput}</pre>}
      <div className="panel">
        <textarea placeholder={reply ? `回复 ${reply.author?.username}` : '写下你的评论'} value={content} onChange={(e) => setContent(e.target.value)} />
        <button onClick={submitComment}>发表评论</button>
        {reply && <button onClick={() => setReply(null)}>取消回复</button>}
      </div>
      <CommentTree list={comments} onReply={setReply} onDelete={deleteComment} currentUser={user} />
    </section>
  );
}
