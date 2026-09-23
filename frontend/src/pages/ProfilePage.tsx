import React, { useState, useRef } from 'react';
import { User as UserIcon, Upload, Trash2, CheckCircle2, AlertCircle, Camera, Shield } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { InitialsAvatar } from '../components/common/InitialsAvatar';

export const ProfilePage: React.FC = () => {
  const { user, fetchProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedBase64, setSelectedBase64] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!user) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format: JPG, JPEG, PNG, WEBP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Please upload a JPG, JPEG, PNG, or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate maximum file size: 5 MB (5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Profile photo must be smaller than 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setSelectedBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!selectedBase64) return;
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await authService.uploadProfilePhoto(selectedBase64);
      await fetchProfile();
      setSuccessMessage('Profile photo updated successfully!');
      setPreviewUrl(null);
      setSelectedBase64(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    setSelectedBase64(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      await authService.removeProfilePhoto();
      await fetchProfile();
      setSuccessMessage('Profile photo removed.');
      setPreviewUrl(null);
      setSelectedBase64(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Account Profile</h1>
            <p className="text-xs text-gray-500">Manage your profile details and personal avatar.</p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {user.role}
          </span>
        </div>

        {/* Success / Error Alerts */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Profile Photo Upload Section */}
        <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-200/60 flex flex-col items-center text-center space-y-4">
          
          <div className="relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-pink-500 shadow-lg"
              />
            ) : (
              <InitialsAvatar name={user.name} avatar={user.avatar} size="xl" />
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-md border-2 border-white transition"
              title="Upload Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
          />

          {previewUrl ? (
            <div className="space-y-3 animate-in fade-in">
              <p className="text-xs font-bold text-gray-800">Selected Photo Preview</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSavePhoto}
                  disabled={isUploading}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white rounded-xl text-xs font-bold shadow transition"
                >
                  {isUploading ? 'Uploading...' : 'Save Photo'}
                </button>
                <button
                  onClick={handleCancelPreview}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Profile Photo
                </button>

                {user.avatar && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={isUploading}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400">JPG, JPEG, PNG, WEBP (Maximum size: 5 MB)</p>
            </div>
          )}

        </div>

        {/* User Info Fields */}
        <div className="space-y-3 text-xs pt-2">
          <div className="flex justify-between py-2.5 border-b border-gray-100">
            <span className="font-semibold text-gray-500">Full Name</span>
            <span className="font-bold text-gray-900">{user.name}</span>
          </div>

          <div className="flex justify-between py-2.5 border-b border-gray-100">
            <span className="font-semibold text-gray-500">Email Address</span>
            <span className="font-mono text-gray-800">{user.email}</span>
          </div>

          <div className="flex justify-between py-2.5">
            <span className="font-semibold text-gray-500">Account Role</span>
            <span className="font-bold text-indigo-600 uppercase">{user.role}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
