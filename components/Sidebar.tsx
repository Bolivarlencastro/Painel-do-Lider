import React from 'react';
import { Icon } from './Icon';
import { analytics } from '../services/analytics';
import { View } from '../types';

interface SidebarProps {
    currentView: 'leader' | 'admin';
    setCurrentView: (view: 'leader' | 'admin') => void;
    activeView: View;
    setActiveView: (view: View) => void;
    activeSidebarItem: string;
    setActiveSidebarItem: (id: string) => void;
}

const mainNavItems = [
  { id: 'home', icon: 'home', label: 'Conteúdos', targetView: 'visaoGeral' as View },
  { id: 'pulses', icon: 'track_changes', label: 'Pulses', targetView: 'pulses' as View },
  { id: 'enrollments', icon: 'school', label: 'Matrículas', targetView: 'cursos' as View },
  { id: 'ranking', icon: 'leaderboard', label: 'Ranking', targetView: 'visaoGeral' as View },
    { id: 'dashboard', icon: 'supervisor_account', label: 'Painel do Líder', targetView: 'visaoGeral' as View },
];

const NavItem: React.FC<{
  icon: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}> = ({ icon, label, isActive = false, onClick }) => {
  const baseClasses = "w-full py-3 px-2 rounded-lg flex flex-col items-center gap-1 transition-colors";
  const activeClasses = "bg-black/25 text-white";
  const inactiveClasses = "text-white/75 hover:bg-white/10 hover:text-white";
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-label={label}
    >
      <Icon name={icon} className="text-2xl" />
      <span className="text-xs font-medium text-center break-words">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, setActiveView, activeSidebarItem, setActiveSidebarItem }) => {

  const handleMainNavClick = (item: typeof mainNavItems[0]) => {
    analytics.track('sidebar_nav_clicked', { item: item.id, target_view: item.targetView });
    setCurrentView('leader');
    setActiveView(item.targetView);
    setActiveSidebarItem(item.id);
  };

  const handleAdminClick = () => {
    analytics.track('view_changed', { from: currentView, to: 'admin' });
    setCurrentView('admin');
    setActiveSidebarItem('admin');
  };

  return (
    <aside
      className="w-[112px] bg-purple-900 p-2 flex flex-col items-center"
      aria-label="Main Navigation"
    >
      <div className="h-[98px] flex items-center justify-center shrink-0">
        <Icon name="widgets" className="text-4xl text-white opacity-90" aria-label="Workspace Logo" />
      </div>

      <nav className="w-full space-y-2">
        {mainNavItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={currentView === 'leader' && activeSidebarItem === item.id}
            onClick={() => handleMainNavClick(item)}
          />
        ))}
      </nav>

      <div className="flex-grow" />

      <nav className="w-full space-y-2 mb-2">
        <NavItem
          icon="settings"
          label="Admin"
          isActive={activeSidebarItem === 'admin'}
          onClick={handleAdminClick}
        />
        <NavItem
          icon="help"
          label="Ajuda"
          onClick={() => analytics.track('help_button_clicked', { from: 'sidebar' })}
        />
      </nav>
    </aside>
  );
};