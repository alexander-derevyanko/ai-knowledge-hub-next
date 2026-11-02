import type { Metadata } from 'next';

import ChatPage from '@/features/chat/ChatPage';

export const metadata: Metadata = {
  title: 'AI Chat',
  description: 'Ask questions about your knowledge base.',
};

export default function Page() {
  return <ChatPage />;
}
