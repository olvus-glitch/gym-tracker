interface TabNavProps {
  tab: 'entrenamientos' | 'progreso';
  onChange: (tab: 'entrenamientos' | 'progreso') => void;
}

export default function TabNav({ tab, onChange }: TabNavProps) {
  return (
    <nav className="bg-card-bg border-b border-border sticky top-0 z-30">
      <div className="max-w-2xl mx-auto flex">
        <button
          onClick={() => onChange('entrenamientos')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            tab === 'entrenamientos'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-muted hover:text-foreground'
          }`}
        >
          Entrenamientos
        </button>
        <button
          onClick={() => onChange('progreso')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            tab === 'progreso'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-muted hover:text-foreground'
          }`}
        >
          Progreso
        </button>
      </div>
    </nav>
  );
}
