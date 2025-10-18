import { MessageSquare, FileText, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: 'chat' | 'documents' | 'history' | 'settings';
  onViewChange: (view: 'chat' | 'documents' | 'history' | 'settings') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
    { id: 'documents' as const, icon: FileText, label: 'Documents' },
    { id: 'history' as const, icon: History, label: 'History' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 glass border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MuseAI
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Your knowledge companion</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
              activeView === item.id
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'hover:bg-muted text-foreground'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        <p>Privacy-first • Local storage</p>
        <p className="mt-1">No data leaves your device</p>
      </div>
    </aside>
  );
}
