import React, { useState } from 'react';
import { Users, UserPlus, Shield, Gift, AlertTriangle } from 'lucide-react';
import { Wishlist } from '../../types';
import { wishlistService } from '../../services/wishlistService';
import { InitialsAvatar } from '../common/InitialsAvatar';

interface CollaborativePanelProps {
  wishlist: Wishlist;
  onRefresh: () => void;
}

export const CollaborativePanel: React.FC<CollaborativePanelProps> = ({ wishlist, onRefresh }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [permission, setPermission] = useState('SUGGEST');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsLoading(true);
    try {
      await wishlistService.addMember(wishlist.id, inviteEmail.trim(), permission);
      alert(`Invited ${inviteEmail} to collaborative wishlist!`);
      setInviteEmail('');
      setShowInviteModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add member.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/wishlists/${wishlist.shareToken || wishlist.id}`;
    navigator.clipboard.writeText(url);
    alert('Wishlist share link copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs mb-6">
      
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-gray-900">Collaborative Wishlist Members</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyShareLink}
            className="text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 border border-gray-200 px-3 py-1.5 rounded-xl transition"
          >
            Copy Share Link
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-xl shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" /> Invite Member
          </button>
        </div>
      </div>

      {/* Member Avatars List */}
      <div className="flex items-center gap-3 pt-4 overflow-x-auto">
        {wishlist.members && wishlist.members.length > 0 ? (
          wishlist.members.map((m) => (
            <div key={m.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200/60 px-3 py-1.5 rounded-full text-xs">
              <InitialsAvatar name={m.user.name} avatar={m.user.avatar} size="sm" />
              <span className="font-medium text-gray-800">{m.user.name}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">
                {m.permission}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic">No collaborative members added yet. Invite friends or family to avoid duplicate gifts!</p>
        )}
      </div>

      {/* Duplicate Gift Prevention Banner */}
      <div className="mt-4 bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl flex items-center justify-between text-xs text-indigo-900">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-indigo-600" />
          <span><strong>Duplicate Gift Prevention Active:</strong> Members can flag items they are planning to buy.</span>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h4 className="font-bold text-base text-gray-900 mb-4">Invite Member to Wishlist</h4>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Friend's Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Permission Level</label>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="VIEW">View Only</option>
                  <option value="SUGGEST">Can Suggest & Mark Purchase Plans</option>
                  <option value="COMMENT">Can Comment & Suggest</option>
                  <option value="MANAGE">Full Co-Manager</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {isLoading ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
