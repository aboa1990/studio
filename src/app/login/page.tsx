
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState('sign-in');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {view === 'sign-in' ? 'Login' : 'Sign Up'}
            </h1>
            <p className="text-balance text-muted-foreground">
              {view === 'sign-in'
                ? 'Enter your email below to login to your account'
                : 'Enter your information to create an account'}
            </p>
          </div>

          <form onSubmit={view === 'sign-in' ? handleSignIn : handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              {view === 'sign-in' ? 'Login' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {view === 'sign-in' ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => setView('sign-up')} className="underline text-primary">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setView('sign-in')} className="underline text-primary">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center">
        <div className="w-1/2 text-center">
            <div className="mx-auto h-24 w-24 bg-primary rounded-3xl flex items-center justify-center text-primary-foreground font-black text-4xl mb-6">F</div>
            <h2 className="text-3xl font-bold text-foreground mt-4">ForgeDocs</h2>
            <p className="text-muted-foreground mt-2">Professional document management for Maldivian businesses.</p>
        </div>
      </div>
    </div>
  );
}
