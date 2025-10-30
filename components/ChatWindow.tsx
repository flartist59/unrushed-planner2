
import React from 'react';
import type { Message } from '../types';
import ItineraryCard from './ItineraryCard';

interface ChatWindowProps {
  messages: Message[];
}

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        You
    </div>
);

const ModelIcon = () => (
    <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        AI
    </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="space-y-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-start gap-4 ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {msg.role === 'model' && <ModelIcon />}
          <div
            className={`max-w-xl rounded-2xl p-4 text-base ${
              msg.role === 'user'
                ? 'bg-teal-600 text-white rounded-br-none'
                : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none'
            }`}
          >
            {typeof msg.content === 'string' ? (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            ) : (
              <ItineraryCard itinerary={msg.content} />
            )}
          </div>
          {msg.role === 'user' && <UserIcon />}
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
