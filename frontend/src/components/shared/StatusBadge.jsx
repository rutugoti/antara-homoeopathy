import React from 'react';
import { Badge } from '../ui/Badge';

export function StatusBadge({ status }) {
  const colors = {
    PENDING: 'warning',
    CONFIRMED: 'primary',
    CLOSED: 'success',
    CANCELLED: 'error'
  };

  if (status === 'IN') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f0fdfa] text-[#0f766e]">
        In
      </span>
    );
  }

  return (
    <Badge variant={colors[status] || 'default'}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown'}
    </Badge>
  );
}
