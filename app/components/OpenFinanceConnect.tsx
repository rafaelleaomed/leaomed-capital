import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const PluggyConnect = dynamic(
  () => import('react-pluggy-connect').then((mod) => mod.PluggyConnect),
  { ssr: false }
);

export default function OpenFinanceConnect() {
  const [connectToken, setConnectToken] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function fetchToken() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError('Usuário não autenticado. Faça login primeiro.');
          return;
        }

        const res = await fetch('/api/connect-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientUserId: session.user.id // Vinculado ao Auth do Supabase!
          })
        });
        
        const data = await res.json();
        setConnectToken(data.accessToken);
      } catch (err) {
        console.error('Erro ao buscar o connect-token:', err);
        setError('Erro ao iniciar conexão com Open Finance.');
      }
    }
    
    fetchToken();
  }, [supabase.auth]);

  if (error) return <div className="text-red-500">{error}</div>;

  if (!connectToken) return <div>Carregando conexão com Open Finance...</div>;

  return (
    <div className="pluggy-connect-container">
      <PluggyConnect
        connectToken={connectToken}
        includeSandbox={true}
        onSuccess={(itemData) => {
          console.log('🔌 Conectado com sucesso!', itemData);
          // Aqui enviaremos o itemData.item.id para o nosso backend Python ou Supabase
        }}
        onError={(error) => {
          console.error('❌ Falha na conexão:', error);
        }}
      />
    </div>
  );
}
