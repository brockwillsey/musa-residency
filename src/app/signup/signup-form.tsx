'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { signupAction } from '@/app/actions/auth';

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await signupAction(formData);

    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1"
            minLength={6}
          />
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="City, Country"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="bio">About You</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell us about yourself, your creative practice, and what kind of experiences you're looking for..."
            className="mt-1"
            rows={4}
          />
        </div>
        
        <div>
          <Label htmlFor="workInfo">Work Information</Label>
          <Input
            id="workInfo"
            name="workInfo"
            type="text"
            placeholder="Artist, Writer, Designer, etc."
            className="mt-1"
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}