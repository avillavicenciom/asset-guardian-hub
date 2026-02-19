import { useState } from 'react';
import {
  statuses as mockStatuses,
  users as mockUsers,
  assets as mockAssets,
  assignments as mockAssignments,
  repairs as mockRepairs,
} from '@/data/mockData';
import { StatusCatalog, User, Asset, Assignment, Repair } from '@/data/types';

export function useData() {
  const [statuses] = useState<StatusCatalog[]>(mockStatuses);
  const [users] = useState<User[]>(mockUsers);
  const [assets] = useState<Asset[]>(mockAssets);
  const [assignments] = useState<Assignment[]>(mockAssignments);
  const [repairs] = useState<Repair[]>(mockRepairs);
  const loading = false;

  const getStatusById = (id: number) => statuses.find(s => s.id === id);
  const getStatusByCode = (code: string) => statuses.find(s => s.code === code);
  const getUserById = (id: number) => users.find(u => u.id === id);
  const getAssetById = (id: number) => assets.find(a => a.id === id);

  const getStatusClass = (code: string): string => {
    const map: Record<string, string> = {
      DISPONIBLE: 'status-available',
      ASIGNADO: 'status-assigned',
      EN_REPARACION: 'status-repair',
      DANADO_RECUPERABLE: 'status-damaged',
      DANADO_IRRECUPERABLE: 'status-irreparable',
      DONADO: 'status-donated',
    };
    return map[code] || '';
  };

  const refresh = async () => {};

  return {
    statuses, users, assets, assignments, repairs,
    loading, refresh,
    getStatusById, getStatusByCode, getUserById, getAssetById, getStatusClass,
  };
}
