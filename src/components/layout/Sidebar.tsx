import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  GitBranch,
  CalendarDays,
  Users,
  BarChart3,
  Building2,
  Settings,
  LogOut,
  Sparkles,
  FileDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/utils/format';

const menuItems = [
  { path: '/dashboard', label: '工作台', icon: LayoutDashboard, roles: ['admin', 'storeManager', 'consultant', 'scheduler'] },
  { path: '/clues', label: '门店线索池', icon: Receipt, roles: ['admin', 'storeManager', 'consultant'] },
  { path: '/transfer', label: '跨店转派', icon: GitBranch, roles: ['admin', 'storeManager'] },
  { path: '/schedule', label: '预约排班', icon: CalendarDays, roles: ['admin', 'scheduler', 'storeManager'] },
  { path: '/duplicate', label: '重复客户识别', icon: Users, roles: ['admin'] },
  { path: '/reports', label: '经营报表', icon: BarChart3, roles: ['admin', 'storeManager'] },
  { path: '/exports', label: '导出申请中心', icon: FileDown, roles: ['admin', 'storeManager'] },
  { path: '/rules', label: '总部规则', icon: Settings, roles: ['admin'] },
  { path: '/stores', label: '门店管理', icon: Building2, roles: ['admin'] },
];

export function Sidebar() {
  const { user, logout, hasPermission } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = menuItems.filter(item => hasPermission(item.roles as any));

  return (
    <aside className="w-60 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col h-screen flex-shrink-0">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <div className="font-semibold text-base">医美线索协同</div>
          <div className="text-xs text-white/50">连锁门店后台</div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200',
                isActive
                  ? 'bg-teal-600/20 text-teal-300 font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-sm font-medium">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-white/50">
              {user?.role === 'admin' ? '总部管理员' : user?.role === 'storeManager' ? '门店店长' : user?.role === 'consultant' ? '接待咨询师' : '排班管理员'}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        >
          <LogOut size={16} />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
