import React from 'react';
import ChatWindow from './ChatWindow';

const ChatModal = ({ open, onClose, taskId, currentUserMongoId, currentUserName, currentUserAvatar, currentUser }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose}></div>
      <div className="relative w-full md:w-3/4 lg:w-1/2 h-3/4 bg-white rounded-t-lg md:rounded-lg overflow-hidden shadow-xl transform transition-transform">
        {currentUserMongoId ? (
          <ChatWindow
            taskId={taskId}
            currentUserMongoId={currentUserMongoId}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            onClose={onClose}
          />
        ) : (
          <div className="p-6">
            <p className="text-gray-700">You must be logged in to use chat.</p>
            <div className="mt-4">
              <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
