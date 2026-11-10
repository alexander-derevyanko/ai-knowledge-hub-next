'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { logout } from '../../api/authApi';

import './LogoutButton.css';

interface LogoutButtonProps {
  setIsOpen: (value: boolean) => void;
}

export default function LogoutButton({ setIsOpen }: LogoutButtonProps) {
  const router = useRouter();
  const isLoggingOut = useRef(false);

  const performLogout = async () => {
    if (isLoggingOut.current) {
      return;
    }

    isLoggingOut.current = true;

    const toastId = toast.loading('Signing out...');

    try {
      await logout();

      toast.dismiss(toastId);

      router.replace('/login');
    } catch {
      toast.error('Unable to sign out. Please try again.', {
        id: toastId,
        duration: Infinity,
        action: {
          label: 'Retry',
          onClick: () => {
            void performLogout();
          },
        },
      });
    } finally {
      isLoggingOut.current = false;
    }
  };

  const handleLogout = () => {
    setIsOpen(false);

    void performLogout();
  };

  return (
    <button
      type="button"
      className="user-menu__item user-menu__item--danger"
      role="menuitem"
      onClick={handleLogout}
    >
      Sign out
    </button>
  );
}
