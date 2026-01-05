import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Building } from 'lucide-react';

const TenantLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { tenantCompany, isLoading: tenantLoading, error: tenantError } = useTenant();
  const hasRedirectedRef = useRef(false);

  // CRITICAL FIX: Redirect mit useEffect und Ref um Endlosschleifen zu vermeiden
  useEffect(() => {
    if (isAuthenticated && user && tenantCompany && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      console.log('✅ Tenant login successful - redirecting to dashboard');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [isAuthenticated, user, tenantCompany, navigate]);

  // Zeige Fehler wenn Tenant nicht gefunden
  if (tenantError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md p-8 text-center">
          <Building className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Firma nicht gefunden</h1>
          <p className="text-gray-600 mb-6">{tenantError}</p>
          <Button 
            onClick={() => window.location.href = 'https://minute.app'}
            variant="outline"
          >
            Zur Hauptseite
          </Button>
        </Card>
      </div>
    );
  }

  // Loading state
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Lade Firmendaten...</p>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Registrierung
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              company_id: tenantCompany?.id
            }
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        setError('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails.');
      } else {
        // Login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        // Prüfe ob User zur Firma gehört
        if (data.user && tenantCompany) {
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('company_id')
            .eq('user_id', data.user.id)
            .eq('company_id', tenantCompany.id)
            .single();

          if (!userRole) {
            await supabase.auth.signOut();
            setError('Sie haben keinen Zugang zu dieser Firma.');
            return;
          }
        }

        navigate('/dashboard');
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!tenantCompany) {
    return null;
  }

  const brandStyle = {
    '--company-primary': tenantCompany.primary_color,
    '--company-secondary': tenantCompany.secondary_color,
    fontFamily: tenantCompany.brand_font
  } as React.CSSProperties;

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      style={brandStyle}
    >
      <Card className="w-full max-w-md p-8 shadow-card-elevated border border-border/50 backdrop-blur-sm">
        {/* Firmen-Header */}
        <div className="text-center mb-8">
          {tenantCompany.logo_url ? (
            <img 
              src={tenantCompany.logo_url} 
              alt={tenantCompany.name} 
              className="h-20 mx-auto mb-6 object-contain drop-shadow-sm"
              style={{ 
                filter: `brightness(0) saturate(100%) contrast(100%)`,
                color: tenantCompany.primary_color 
              }}
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg"
              style={{ backgroundColor: tenantCompany.primary_color }}
            >
              {tenantCompany.name.charAt(0)}
            </div>
          )}
          <h1 
            className="text-2xl font-bold mb-3"
            style={{ color: tenantCompany.primary_color }}
          >
            {tenantCompany.name}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Registrierung' : 'Anmeldung'} zum HR-Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">E-Mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre.email@firma.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <Alert variant={error.includes('erfolgreich') ? 'default' : 'destructive'}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            style={{ 
              backgroundColor: tenantCompany.primary_color,
              borderColor: tenantCompany.primary_color 
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isSignUp ? 'Registrieren' : 'Anmelden'}
          </Button>
        </form>

        {/* Toggle zwischen Login/Register */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm hover:underline"
            style={{ color: tenantCompany.primary_color }}
          >
            {isSignUp 
              ? 'Bereits ein Konto? Hier anmelden' 
              : 'Noch kein Konto? Hier registrieren'
            }
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-muted-foreground">
          <p className="font-medium">Powered by MINUTE</p>
        </div>
      </Card>
    </div>
  );
};

export default TenantLoginPage;