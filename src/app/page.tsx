'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import TabNav from '../components/TabNav';
import EntrenamientosPage from '../components/EntrenamientosPage';
import ProgresoPage from '../components/ProgresoPage';

export default function Home() {
  const [tab, setTab] = useState<'entrenamientos' | 'progreso'>('entrenamientos');
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TabNav tab={tab} onChange={setTab} />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-8">
        {tab === 'entrenamientos' ? <EntrenamientosPage /> : <ProgresoPage />}
      </main>
    </div>
  );
}
