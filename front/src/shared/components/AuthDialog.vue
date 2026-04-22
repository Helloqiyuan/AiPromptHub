<script setup lang="ts">
import { reactive, watch } from 'vue';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
}

interface LoginForm {
  email: string;
  password: string;
}

const props = defineProps<{
  visible: boolean;
  submitting: boolean;
  errorMessage: string;
  activeTab: 'login' | 'register';
}>();

const emit = defineEmits<{
  close: [];
  switchTab: [tab: 'login' | 'register'];
  login: [payload: LoginForm];
  register: [payload: RegisterForm];
}>();

const loginForm = reactive<LoginForm>({
  email: '',
  password: '',
});

const registerForm = reactive<RegisterForm>({
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
  phone: '',
});

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      return;
    }

    loginForm.email = '';
    loginForm.password = '';
    registerForm.username = '';
    registerForm.email = '';
    registerForm.password = '';
    registerForm.passwordConfirm = '';
    registerForm.phone = '';
  },
);
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
    <section class="modal-card">
      <div class="modal-header">
        <div>
          <p class="modal-kicker">账号中心</p>
          <h2 class="modal-title">登录 / 注册</h2>
        </div>
        <button class="modal-close" type="button" @click="emit('close')">关闭</button>
      </div>

      <div class="modal-tabs">
        <button
          type="button"
          class="modal-tab"
          :class="{ 'modal-tab-active': activeTab === 'login' }"
          @click="emit('switchTab', 'login')"
        >
          登录
        </button>
        <button
          type="button"
          class="modal-tab"
          :class="{ 'modal-tab-active': activeTab === 'register' }"
          @click="emit('switchTab', 'register')"
        >
          注册
        </button>
      </div>

      <p v-if="errorMessage" class="modal-error">{{ errorMessage }}</p>

      <form v-if="activeTab === 'login'" class="modal-body" @submit.prevent="emit('login', { ...loginForm })">
        <h3>欢迎回来，继续管理你的 Prompt 收藏和互动。</h3>
        <div class="modal-form">
          <label class="modal-field">
            <span>邮箱</span>
            <input v-model="loginForm.email" type="email" placeholder="请输入登录邮箱" />
          </label>
          <label class="modal-field">
            <span>密码</span>
            <input v-model="loginForm.password" type="password" placeholder="请输入密码" />
          </label>
        </div>
        <button class="modal-submit" type="submit" :disabled="submitting">
          {{ submitting ? '登录中...' : '登录并同步我的收藏' }}
        </button>
      </form>

      <form v-else class="modal-body" @submit.prevent="emit('register', { ...registerForm })">
        <h3>注册后即可上传 Prompt、评论互动并沉淀个人中心。</h3>
        <div class="modal-form two-column">
          <label class="modal-field">
            <span>用户名</span>
            <input v-model="registerForm.username" placeholder="请输入用户名" />
          </label>
          <label class="modal-field">
            <span>邮箱</span>
            <input v-model="registerForm.email" type="email" placeholder="请输入邮箱" />
          </label>
          <label class="modal-field">
            <span>密码</span>
            <input v-model="registerForm.password" type="password" placeholder="请输入密码" />
          </label>
          <label class="modal-field">
            <span>确认密码</span>
            <input v-model="registerForm.passwordConfirm" type="password" placeholder="再次输入密码" />
          </label>
          <label class="modal-field column-full">
            <span>手机号（可选）</span>
            <input v-model="registerForm.phone" placeholder="请输入手机号" />
          </label>
        </div>
        <button class="modal-submit" type="submit" :disabled="submitting">
          {{ submitting ? '注册中...' : '注册并进入 Prompt 大厅' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(58, 40, 27, 0.32);
  backdrop-filter: blur(12px);
  z-index: 40;
}

.modal-card {
  width: min(640px, 100%);
  display: grid;
  gap: 1rem;
  padding: 1.4rem;
  border-radius: 28px;
  background: rgba(255, 250, 243, 0.98);
  border: 1px solid rgba(122, 93, 70, 0.14);
  box-shadow: 0 22px 50px rgba(66, 45, 31, 0.18);
}

.modal-header,
.modal-tabs {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.modal-kicker {
  margin: 0 0 0.35rem;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent-strong);
}

.modal-title,
.modal-body h3 {
  margin: 0;
  font-family: var(--font-display);
  color: var(--color-ink);
}

.modal-close,
.modal-tab,
.modal-submit {
  min-height: 42px;
  border-radius: 999px;
}

.modal-close,
.modal-tab {
  padding: 0 0.9rem;
  border: 1px solid rgba(122, 93, 70, 0.14);
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-ink);
}

.modal-tab-active,
.modal-submit {
  border-color: transparent;
  background: var(--color-accent);
  color: #fffaf2;
}

.modal-tabs {
  justify-content: start;
}

.modal-error {
  margin: 0;
  padding: 0.8rem 1rem;
  border-radius: 18px;
  background: rgba(182, 79, 47, 0.12);
  color: #8f4022;
}

.modal-body {
  display: grid;
  gap: 0.9rem;
}

.modal-form {
  display: grid;
  gap: 0.8rem;
}

.two-column {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.column-full {
  grid-column: 1 / -1;
}

.modal-field {
  display: grid;
  gap: 0.45rem;
}

.modal-field span {
  color: var(--color-ink);
  font-size: 0.92rem;
}

.modal-field input {
  min-height: 48px;
  padding: 0 1rem;
  border-radius: 18px;
  border: 1px solid rgba(122, 93, 70, 0.14);
  background: rgba(255, 255, 255, 0.7);
  color: var(--color-ink);
}

.modal-submit {
  border: none;
  font-size: 0.95rem;
}

.modal-submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

@media (max-width: 640px) {
  .modal-header {
    align-items: start;
  }

  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>
