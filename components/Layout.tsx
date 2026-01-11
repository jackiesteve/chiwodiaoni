
import React from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const navItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'STANDINGS', label: '积分榜', icon: '📊' },
    { id: 'TEAMS', label: '参赛球队', icon: '🛡️' },
    { id: 'STATS', label: '球员数据', icon: '⚽' },
    { id: 'MATCHES', label: '赛程结果', icon: '⏱️' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 侧边栏 */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400 flex items-center gap-2">
            <span className="text-3xl">⚽</span> 进球大师
          </h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">赛事管理中心</p>
        </div>
        
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeView === item.id 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
