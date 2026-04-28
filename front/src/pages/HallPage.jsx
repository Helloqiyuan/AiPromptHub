import React, { useEffect, useMemo, useState } from 'react';
import PromptCard from '../components/PromptCard';
import { api } from '../lib/api';

export default function HallPage() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ keyword: '', l2: '', l3: '', tagId: '' });

  useEffect(() => {
    Promise.all([api.categories(), api.tags()]).then(([c, t]) => {
      setCategories(c.data || []);
      setTags(t.data || []);
    });
  }, []);

  const l2Categories = useMemo(() => categories.filter((c) => c.parentId === 1), [categories]);
  const l3Categories = useMemo(() => categories.filter((c) => Number(c.parentId) === Number(filters.l2 || -999)), [categories, filters.l2]);

  function load(page = 1) {
    const params = { page, pageSize: pagination.pageSize, keyword: filters.keyword || undefined, tagId: filters.tagId || undefined };
    if (filters.l3) params.categoryId = filters.l3;
    else if (filters.l2) params.parentCategoryId = filters.l2;
    api.listPrompts(params).then((res) => {
      setList(res.data.list || []);
      setPagination(res.data.pagination);
    }).catch((e) => alert(e.message));
  }

  useEffect(() => { load(1); }, [filters.l2, filters.l3, filters.tagId]);

  return (
    <section>
      <h1>Prompt 大厅</h1>
      <div className="panel">
        <input placeholder="搜索标题/内容" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
        <button onClick={() => load(1)}>搜索</button>
        <select value={filters.l2} onChange={(e) => setFilters({ ...filters, l2: e.target.value, l3: '' })}>
          <option value="">全部二级分类</option>
          {l2Categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.l3} onChange={(e) => setFilters({ ...filters, l3: e.target.value })}>
          <option value="">全部三级分类</option>
          {l3Categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.tagId} onChange={(e) => setFilters({ ...filters, tagId: e.target.value })}>
          <option value="">全部标签</option>
          {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="grid">
        {list.map((item) => <PromptCard key={item.id} item={item} onChanged={(id, payload, type) => setList((prev) => prev.map((p) => p.id !== id ? p : { ...p, ...(type === 'like' ? { liked: payload.liked, likeCount: payload.likeCount } : { favorited: payload.favorited, favoriteCount: payload.favoriteCount }) }))} />)}
      </div>
      <div className="pager">
        <button disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>上一页</button>
        <span>{pagination.page} / {pagination.totalPages}</span>
        <button disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>下一页</button>
      </div>
    </section>
  );
}
