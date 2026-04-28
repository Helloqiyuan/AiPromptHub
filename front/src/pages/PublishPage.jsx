import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function PublishPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState({ title: '', summary: '', image: '', content: '', usageScenario: '', exampleInput: '', exampleOutput: '', l2: '', categoryId: '', tagIds: [] });

  useEffect(() => {
    Promise.all([api.categories(), api.tags()]).then(([c, t]) => {
      setCategories(c.data || []);
      setTags(t.data || []);
    });
  }, []);

  const l2List = useMemo(() => categories.filter((c) => c.parentId === 1), [categories]);
  const l3List = useMemo(() => categories.filter((c) => Number(c.parentId) === Number(form.l2 || -999)), [categories, form.l2]);

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.createPrompt({ ...form, categoryId: Number(form.categoryId), tagIds: form.tagIds.map(Number) });
      navigate(`/prompts/${res.data.id}`);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section>
      <h1>发布 Prompt</h1>
      <form className="panel form" onSubmit={submit}>
        <input required placeholder="标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="摘要" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <input placeholder="封面图URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <textarea required placeholder="Prompt 内容" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <input placeholder="使用场景" value={form.usageScenario} onChange={(e) => setForm({ ...form, usageScenario: e.target.value })} />
        <textarea placeholder="示例输入" value={form.exampleInput} onChange={(e) => setForm({ ...form, exampleInput: e.target.value })} />
        <textarea placeholder="示例输出" value={form.exampleOutput} onChange={(e) => setForm({ ...form, exampleOutput: e.target.value })} />
        <select value={form.l2} onChange={(e) => setForm({ ...form, l2: e.target.value, categoryId: '' })}>
          <option value="">选择二级分类</option>
          {l2List.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          <option value="">选择三级分类</option>
          {l3List.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select multiple value={form.tagIds.map(String)} onChange={(e) => setForm({ ...form, tagIds: Array.from(e.target.selectedOptions).map((o) => o.value) })}>
          {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button type="submit">发布</button>
      </form>
    </section>
  );
}
