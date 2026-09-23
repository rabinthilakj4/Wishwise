import React, { useEffect, useState } from 'react';
import { Users, Shield, UserCheck, Lock } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { User, Role } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { InitialsAvatar } from '../../components/common/InitialsAvatar';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res: any = await adminService.getUsers();
      setUsers(res.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    await adminService.updateUserRole(userId, role);
    fetchUsers();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-500" /> User Role Management (RBAC)
          </h1>
          <p className="text-xs text-gray-400">Manage user accounts, assign roles (Customer, Manager, Admin), and update active status.</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 uppercase text-[10px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Role Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-700/30 transition">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-3">
                    <InitialsAvatar name={u.name} avatar={u.avatar} size="sm" />
                    {u.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                      u.role === 'ADMIN' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      u.role === 'MANAGER' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-slate-700 text-gray-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-bold">Active</span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
};
