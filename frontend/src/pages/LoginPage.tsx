import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './css/LoginPage.module.css';
import bgImage from '../assets/login_background.jpg';
import { api } from '../services/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMsg = 'E-mail ou senha inválidos';
        if (errorData && errorData.message) {
            errorMsg = Array.isArray(errorData.message) ? errorData.message[0] : errorData.message;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        navigate('/dashboard');
      } else {
        throw new Error('Nenhum token recebido');
      }
    } catch (err: any) {
      let finalMessage = err.message || 'Ocorreu um erro durante o login';
      if (finalMessage.includes('Failed to fetch')) {
        finalMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou se o servidor está online.';
      }
      setError(finalMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer} style={{ backgroundImage: `url(${bgImage})` }}>
      <div className={styles.loginOverlay}></div>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>Bem-vindo de volta</h1>
          <p>Faça login na sua conta</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Endereço de E-mail</label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/register" style={{ color: '#a1a1aa', fontSize: '0.9rem', textDecoration: 'none' }}>
              Não possui uma conta? Cadastre-se agora.
            </Link>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
