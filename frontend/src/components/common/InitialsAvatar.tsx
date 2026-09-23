import React from 'react';

interface InitialsAvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name,
  avatar,
  size = 'md',
  className = '',
}) => {
  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-24 h-24 text-2xl font-black',
  }[size];

  if (avatar) {
    const src = avatar.startsWith('/') ? avatar : avatar;
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover border border-gray-200 shadow-xs ${className}`}
        onError={(e) => {
          // If avatar fails to load, hide image and fallback to initials
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-xs border border-white/20 select-none ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};
