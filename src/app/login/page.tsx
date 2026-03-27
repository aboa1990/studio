
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Cloud, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState('sign-in');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  if (checkingAuth) {
    return (
      <div className="h-svh w-full flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center py-12 relative">
        <div className="mx-auto grid w-[320px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-2xl font-black tracking-tight">
              {view === 'sign-in' ? 'Login' : 'Sign Up'}
            </h1>
            <p className="text-muted-foreground text-[11px] font-medium leading-relaxed">
              {view === 'sign-in'
                ? 'Enter your credentials to access your Cloud Office workspace.'
                : 'Create your professional account to start managing documents.'}
            </p>
          </div>

          {view === 'sign-in' && (
            <Alert className="bg-primary/5 border-primary/10 py-2">
              <Info className="size-3.5 text-primary" />
              <AlertDescription className="text-[10px] text-muted-foreground leading-tight">
                New here? Click <span className="font-bold text-primary">Register now</span> below to create your own admin account.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={view === 'sign-in' ? handleSignIn : handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                className="bg-muted/30 border-white/5 h-10 text-xs"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" title="Password" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                className="bg-muted/30 border-white/5 h-10 text-xs"
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>
            {error && <p className="text-[10px] font-bold text-destructive uppercase tracking-tight bg-destructive/5 p-2 rounded border border-destructive/10">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full h-10 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/10">
              {loading ? <Loader2 className="size-4 animate-spin" /> : (view === 'sign-in' ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="text-center text-[10px] font-medium text-muted-foreground">
            {view === 'sign-in' ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => setView('sign-up')} className="font-black text-primary hover:underline underline-offset-4">
                  Register now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setView('sign-in')} className="font-black text-primary hover:underline underline-offset-4">
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>
        <div className="absolute bottom-8 flex flex-col items-center gap-1 opacity-20">
          <p className="text-[8px] text-muted-foreground font-black tracking-[0.3em] uppercase">
            &copy; {new Date().getFullYear()} ABOA WORKS
          </p>
        </div>
      </div>
      <div className="hidden bg-muted/30 lg:flex items-center justify-center border-l border-white/5">
        <div className="w-1/2 text-center flex flex-col items-center">
            <div className="size-24 bg-primary rounded-[2.5rem] flex items-center justify-center text-primary-foreground shadow-2xl mb-8 animate-in zoom-in duration-1000">
              <Cloud className="size-12 fill-current" />
            </div>
            <h2 className="text-5xl font-black text-foreground tracking-tighter animate-in slide-in-from-bottom duration-700">Cloud Office</h2>
            <p className="text-muted-foreground mt-4 text-xs font-medium tracking-wide max-w-[240px] leading-relaxed opacity-60">
              Professional document lifecycle management for elite Maldivian enterprises.
            </p>
        </div>
      </div>
    </div>
  );
}
