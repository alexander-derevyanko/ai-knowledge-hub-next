'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import './LoginForm.css';
import type { LoginCredentials } from '../../types/auth';
import { login } from '../../api/authApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (credentials: LoginCredentials) => {
    clearErrors('root.server');

    try {
      await login(credentials);

      router.replace('/dashboard');
    } catch (error) {
      setError('root.server', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M24 7v34" />
            <path d="M24 13c-3-5-9-5-12-1-3 4-1 8 2 10-5 3-5 10 0 13 3 2 8 1 10-3" />
            <path d="M24 13c3-5 9-5 12-1" />
            <path d="M24 22h9" />
            <path d="M24 31h9" />
            <path d="M24 39c3 3 9 3 12-1" />
            <path d="M36 12v-4" />
            <path d="M36 22h5" />
            <path d="M36 31h5" />
            <path d="M36 38v4" />
          </svg>
        </div>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to your AI Knowledge Hub</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email</label>

            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: EMAIL_REGEX, message: 'Please enter a valid email address' },
              })}
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />

            {errors.email && (
              <span id="email-error" className="field-error" role="alert">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>

            <div className="password-input-wrapper">
              <input
                {...register('password', {
                  required: 'Password is required',
                })}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                disabled={isSubmitting}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.9 5.2A11 11 0 0112 5c5 0 9 5 9 7s-4 7-9 7a9.5 9.5 0 01-5.1-1.5" />
                    <path d="M6.2 6.2C3.5 7.8 2 10.3 2 12c0 1.2 1.5 3.5 3.5 5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {errors.password && (
              <span id="password-error" className="field-error" role="alert">
                {errors.password.message}
              </span>
            )}

            <div className="forgot-password-wrapper">
              <button type="button" className="forgot-password">
                Forgot password?
              </button>
            </div>
          </div>

          {errors.root?.server && (
            <div className="backend-error" role="alert">
              {errors.root.server.message}
            </div>
          )}

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="login-loading">
                <span className="loading-spinner" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="login-footer">
          <span>Don&apos;t have an account?</span>
          <button type="button" className="register-link">
            Sign up
          </button>
        </div>
      </div>
    </main>
  );
}
