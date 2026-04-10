import React, { useState, useEffect, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    let errorMessage = "Ocorreu um erro inesperado.";
    
    try {
      if (error?.message) {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.error.includes('permissions')) {
          errorMessage = "Você não tem permissão para realizar esta ação ou acessar estes dados.";
        }
      }
    } catch (e) {
      errorMessage = error?.message || errorMessage;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-border text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-secondary">Ops! Algo deu errado</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar Aplicativo
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
