import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { api } from './lib/api';
import { clearAuth, getCachedUser, getToken, setAuth } from './lib/auth';
import HallPage from './pages/HallPage';
import AuthPage from './pages/AuthPage';
import PromptDetailPage from './pages/PromptDetailPage';
import ProfilePage from './pages/ProfilePage';
import PublishPage from './pages/PublishPage';
import AdminPage from './pages/AdminPage';

export const AppContext = createContext(null);

function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/auth" replace />;
}

function Header({ user, onLogout }) {
  return (
    <header className="topbar">
      <a className="brand" href="/">AI Prompt Hub</a>
      <nav>
        <a href="/">大厅</a>
        <a href="/publish">发布</a>
        {user && <a href="/profile">我的</a>}
        {user && (user.role === 'admin' || user.role === 'super_admin') && <a href="/admin">管理</a>}
        {user ? <button onClick={onLogout}>退出</button> : <a href="/auth">登录/注册</a>}
      </nav>
    </header>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCachedUser());

  useEffect(() => {
    if (!getToken()) return;
    api.me().then((res) => setUser(res.data)).catch(() => setUser(null));
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    login(data) {
      setAuth(data.token, data.user);
      setUser(data.user);
    },
    logout() {
      clearAuth();
      setUser(null);
      navigate('/');
    },
  }), [user, navigate]);

  return (
    <AppContext.Provider value={value}>
      <Header user={user} onLogout={value.logout} />
      <main className="page">
        <Routes>
          <Route path="/" element={<HallPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/prompts/:id" element={<PromptDetailPage />} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/publish" element={<RequireAuth><PublishPage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
        </Routes>
      </main>
    </AppContext.Provider>
  );
}
