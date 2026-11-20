'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import './RegisterForm.css';
import type { RegisterCredentials } from '../../types/auth';
import { register as registerAccount } from '../../api/authApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCredentials>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      organizationName: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (credentials: RegisterCredentials) => {
    clearErrors('root.server');

    try {
      await registerAccount(credentials);

      router.replace('/dashboard');
    } catch (error) {
      setError('root.server', {
        type: 'server',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <main className="register-page">
      <div className="register-card">
        <div className="register-icon">
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

        <div className="register-heading">
          <h1>Create your account</h1>
          <p>Start building your personal AI Knowledge Hub</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="register-form">
          <div className="register-field">
            <label htmlFor="name">Full name</label>
            <input
              {...register('name', {
                required: 'Name is required',
                maxLength: {
                  value: 100,
                  message: 'Name must not exceed 100 characters',
                },
                validate: (value) => value.trim().length > 0 || 'Name is required',
                setValueAs: (value: string) => value.trim(),
              })}
              id="name"
              type="text"
              placeholder="John Doe"
              disabled={isSubmitting}
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className="register-field-error" role="alert">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="register-field">
            <label htmlFor="email">Email</label>
            <input
              {...register('email', {
                required: 'Email is required',
                maxLength: {
                  value: 254,
                  message: 'Email must not exceed 254 characters',
                },
                pattern: {
                  value: EMAIL_REGEX,
                  message: 'Please enter a valid email address',
                },
                setValueAs: (value: string) => value.trim(),
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
              <span id="email-error" className="register-field-error" role="alert">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="register-field">
            <label htmlFor="password">Password</label>

            <div className="register-password-wrapper">
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must contain at least 8 characters',
                  },
                  maxLength: {
                    value: 128,
                    message: 'Password must not exceed 128 characters',
                  },
                })}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                disabled={isSubmitting}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />

              <button
                type="button"
                className="register-password-toggle"
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
              <span id="password-error" className="register-field-error" role="alert">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="register-field">
            <label htmlFor="organizationName">Organization name</label>
            <input
              {...register('organizationName', {
                required: 'Organization name is required',
                maxLength: {
                  value: 100,
                  message: 'Organization name must not exceed 100 characters',
                },
                validate: (value) => value.trim().length > 0 || 'Organization name is required',
                setValueAs: (value: string) => value.trim(),
              })}
              id="organizationName"
              type="text"
              placeholder="My Workspace"
              disabled={isSubmitting}
              autoComplete="organization"
              aria-invalid={!!errors.organizationName}
              aria-describedby={errors.organizationName ? 'organization-error' : undefined}
            />
            {errors.organizationName && (
              <span id="organization-error" className="register-field-error" role="alert">
                {errors.organizationName.message}
              </span>
            )}
          </div>

          {errors.root?.server && (
            <div className="register-backend-error" role="alert">
              {errors.root.server.message}
            </div>
          )}

          <button type="submit" className="register-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="register-loading">
                <span className="register-spinner" />
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div className="register-footer">
          <span>Already have an account?</span>
          <Link href="/login" className="register-link">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
