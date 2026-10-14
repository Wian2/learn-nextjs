'use client';

import { useState, useTransition } from 'react';
import { deleteAppointment } from '@/app/lib/actions';

export default function AppointmentDeleteButton({
  id,
}: {
  id: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm('Delete this appointment?')) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteAppointment(id);
      setMessage(result.message);
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        {isPending ? 'Deleting…' : 'Delete'}
      </button>
      {message && (
        <p role="alert" className="max-w-xs whitespace-normal text-xs text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
