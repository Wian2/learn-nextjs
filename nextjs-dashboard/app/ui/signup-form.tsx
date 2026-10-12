'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUpWithSupabase } from '@/app/lib/actions';

export default function SignupForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    signUpWithSupabase,
    undefined,
  );

  return (
    <form action={formAction} className="w-full max-w-md space-y-4">
      <div className="rounded-lg bg-gray-50 p-6">
        <h1 className="mb-6 text-2xl font-semibold">
          Create your account
        </h1>

        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="email"
        >
          Email
        </label>

        <input
          className="mb-4 block w-full rounded-md border border-gray-300 p-2"
          id="email"
          type="email"
          name="email"
          placeholder="Enter your email address"
          required
        />

        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="password"
        >
          Password
        </label>

        <input
          className="mb-4 block w-full rounded-md border border-gray-300 p-2"
          id="password"
          type="password"
          name="password"
          placeholder="Create a password"
          minLength={6}
          required
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {isPending ? 'Creating account...' : 'Sign up'}
        </button>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-500">
            {errorMessage}
          </p>
        )}

        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
}