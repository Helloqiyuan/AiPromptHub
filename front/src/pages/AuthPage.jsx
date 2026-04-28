import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { api } from '../lib/api';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '', passwordConfirm: '' });

  async function submit(e) {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await api.login({ email: form.email, password: form.password });
        login(res.data);
        navigate('/');
      } else {
        await api.register(form);
        alert('注册成功，请登录');
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section className="auth-wrap">
      <h1>{isLogin ? '登录' : '注册'}</h1>
      <form className="auth-form" onSubmit={submit}>
        {!isLogin && <input placeholder="用户名" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />}
        <input type="email" placeholder="邮箱" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        {!isLogin && <input placeholder="手机号(选填)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}
        <input type="password" placeholder="密码" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {!isLogin && <input type="password" placeholder="确认密码" value={form.passwordConfirm} onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })} required />}
        <button type="submit">{isLogin ? '立即登录' : '提交注册'}</button>
      </form>
      <button className="link-btn" onClick={() => setIsLogin((v) => !v)}>{isLogin ? '没有账号？去注册' : '已有账号？去登录'}</button>
    </section>
  );
}
