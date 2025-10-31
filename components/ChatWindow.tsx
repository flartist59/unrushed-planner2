import React from 'react';
import type { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="flex flex-col space-y-4">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`p-3 rounded-lg max-w-3xl ${
            msg.role === 'user' ? 'self-end bg-teal-100 text-teal-900' : 'self-start bg-gray-100 text-gray-900'
          }`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
