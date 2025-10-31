import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ShareInvite = ({ userRole }) => {
  const [showCopied, setShowCopied] = useState(false);

  // Determine the role we're inviting based on current user's role
  const inviteRole = userRole === 'client' ? 'youth' : 'client';
  
  // Create the invite link with pre-selected role
  const inviteLink = `${window.location.origin}/register?role=${inviteRole}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setShowCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link. Please try selecting and copying manually.');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join our Task Platform',
          text: userRole === 'client' 
            ? 'Join our platform as a youth worker and start earning!' 
            : 'Join our platform and post tasks for skilled youth workers!',
          url: inviteLink
        });
      } else {
        handleCopyLink();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        handleCopyLink();
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {userRole === 'client' 
          ? '🤝 Invite Youth Workers' 
          : '🤝 Invite Clients'}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {userRole === 'client'
          ? 'Share this link with skilled youth workers to help them join the platform and find tasks.'
          : 'Know someone who needs tasks done? Share this link to help them post tasks on the platform.'}
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Link
        </button>
        
        <button
          onClick={handleCopyLink}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {showCopied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
};

export default ShareInvite;