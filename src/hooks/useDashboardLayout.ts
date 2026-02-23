import { useState, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

export type CardId = 'metrics' | 'expiring-alert' | 'pie-chart' | 'recent-activity';

interface DashboardCard {
  id: CardId;
  label: string;
  visible: boolean;
}

const STORAGE_KEY = 'dashboard_layout';

const DEFAULT_CARDS: DashboardCard[] = [
  { id: 'expiring-alert', label: 'Alerta de Vencimientos', visible: true },
  { id: 'metrics', label: 'Tarjetas Métricas', visible: true },
  { id: 'pie-chart', label: 'Distribución por Estado', visible: true },
  { id: 'recent-activity', label: 'Actividad Reciente', visible: true },
];

function loadLayout(): DashboardCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DashboardCard[];
      // Ensure all default cards exist
      const ids = parsed.map(c => c.id);
      const missing = DEFAULT_CARDS.filter(c => !ids.includes(c.id));
      return [...parsed, ...missing];
    }
  } catch {}
  return DEFAULT_CARDS;
}

export function useDashboardLayout() {
  const [cards, setCards] = useState<DashboardCard[]>(loadLayout);

  const save = useCallback((updated: DashboardCard[]) => {
    setCards(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const toggleCard = useCallback((id: CardId) => {
    save(cards.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  }, [cards, save]);

  const reorder = useCallback((oldIndex: number, newIndex: number) => {
    save(arrayMove(cards, oldIndex, newIndex));
  }, [cards, save]);

  return { cards, toggleCard, reorder };
}
