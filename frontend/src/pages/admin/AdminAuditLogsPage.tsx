import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock, User, Activity } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminLayout } from '../../components/layout/AdminLayout';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getAuditLogs()
      .then((res: any) => setLogs(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-500" /> Administrative Audit Trail
          </h1>
          <p className="text-xs text-gray-400">Security event log tracking administrative modifications and critical system activities.</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 uppercase text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/30 transition">
                  <td className="py-3 px-4 font-mono text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-white">{log.actor?.name || 'System'}</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{log.action}</td>
                  <td className="py-3 px-4 text-purple-400">{log.entity}</td>
                  <td className="py-3 px-4 font-mono text-gray-400">{JSON.stringify(log.metadata || {})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
};
