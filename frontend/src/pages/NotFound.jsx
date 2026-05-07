import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-9xl font-extrabold text-[var(--color-primary)]">
            404
          </h2>
          <p className="mt-2 text-3xl font-bold text-[var(--color-text-dark)]">Page not found</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate('/')} size="lg">
            Go back home
          </Button>
        </div>
      </div>
    </div>
  );
}
