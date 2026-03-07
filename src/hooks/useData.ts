import { useState, useEffect, useCallback } from 'react';
import { StatusCatalog, User, Asset, Assignment, Repair, Location } from '@/data/types';
import { api } from '@/lib/api';

export function useData() {
  const [statuses, setStatuses] = useState<StatusCatalog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u, a, asgn, r, l] = await Promise.all([
        api.getAll<StatusCatalog>('statuses'),
        api.getAll<User>('users'),
        api.getAll<Asset>('assets'),
        api.getAll<Assignment>('assignments'),
        api.getAll<Repair>('repairs'),
        api.getAll<Location>('locations'),
      ]);
      setStatuses(s);
      setUsers(u);
      setAssets(a);
      setAssignments(asgn);
      setRepairs(r);
      setLocations(l);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getStatusById = (id: number) => statuses.find(s => s.id === id);
  const getStatusByCode = (code: string) => statuses.find(s => s.code === code);
  const getUserById = (id: number) => users.find(u => u.id === id);
  const getAssetById = (id: number) => assets.find(a => a.id === id);
  const getLocationById = (id: number) => locations.find(l => l.id === id);

  const getActiveAssignmentForAsset = (assetId: number) =>
    assignments.find(a => a.asset_id === assetId && !a.returned_at);

  const getAssignedUserName = (assetId: number): string | null => {
    const assignment = getActiveAssignmentForAsset(assetId);
    if (!assignment) return null;
    if (assignment.manual_user_name) return assignment.manual_user_name;
    if (assignment.user_id) {
      const user = getUserById(assignment.user_id);
      return user?.display_name || null;
    }
    return null;
  };

  const getStatusClass = (code: string): string => {
    const map: Record<string, string> = {
      DISPONIBLE: 'status-available',
      ASIGNADO: 'status-assigned',
      EN_REPARACION: 'status-repair',
      DANADO_RECUPERABLE: 'status-damaged',
      DANADO_IRRECUPERABLE: 'status-irreparable',
      DONADO: 'status-donated',
      POR_ASIGNAR: 'status-pending',
    };
    return map[code] || '';
  };

  const refresh = fetchAll;

  return {
    statuses, users, assets, assignments, repairs, locations,
    loading, refresh,
    getStatusById, getStatusByCode, getUserById, getAssetById, getStatusClass,
    getLocationById, getAssignedUserName, getActiveAssignmentForAsset,
  };
}
