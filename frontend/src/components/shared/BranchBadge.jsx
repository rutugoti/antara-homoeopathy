import React from 'react';
import { Badge } from '../ui/Badge';
import { BRANCHES } from '../../constants';

export function BranchBadge({ branch }) {
  const branchObj = BRANCHES.find(b => b.value === branch);
  const label = branchObj ? branchObj.label : branch;
  return <Badge variant="default">{label}</Badge>;
}
