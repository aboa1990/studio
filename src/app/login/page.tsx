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
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setView('check-email');
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await supabase.auth.signInWithPassword({
      email,
      password,
    });
    router.push('/');
    router.refresh();
  };

  const handleMagicLink = async () => {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setView('check-email');
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

          {view === 'check-email' ? (
            <div className="text-center">
              <p className="text-gray-700 mb-4">We've sent a magic link to your email. Click the link to sign in automatically.</p>
              <Button onClick={() => setView('sign-in')} variant='link'>Back to Sign In</Button>
            </div>
          ) : view === 'sign-in' ? (
            <form onSubmit={handleSignIn} className="grid gap-4">
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button variant="outline" className="w-full" type="button" onClick={handleMagicLink}>
                Sign in with Magic Link
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="grid gap-4">
               <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={(e) => setEmail(e.targe.value)}
                  value={email}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)} value={password} />
              </div>
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            {view === 'sign-in' ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => setView('sign-up')} className="underline">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setView('sign-in')} className="underline">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        
      </div>
    </div>
  );
}
