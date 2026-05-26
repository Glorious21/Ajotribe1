import { create } from 'zustand';

export interface CircleMember {
  id: string;
  display_name: string | null;
  phone_number: string;
  slot_number: number;
  contribution_status: 'confirmed' | 'pending' | 'missed' | null;
  paid_at: string | null;
}

export interface Circle {
  id: string;
  name: string;
  organiser_id: string;
  organiser_name: string;
  amount_naira: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  size: number;
  start_date: string;
  invite_code: string;
  status: 'forming' | 'active' | 'completed';
}

interface CircleState {
  circles: Circle[];
  activeCircle: Circle | null;
  activeMembers: CircleMember[];
  currentRound: number;
  mySlot: number | null;
  totalPot: number;
  isLoading: boolean;
  setCircles: (circles: Circle[]) => void;
  setActiveCircle: (circle: Circle, members: CircleMember[], round: number, mySlot: number, totalPot: number) => void;
  updateMemberStatus: (userId: string, status: 'confirmed' | 'pending' | 'missed') => void;
  setLoading: (loading: boolean) => void;
}

export const useCircleStore = create<CircleState>((set) => ({
  circles: [],
  activeCircle: null,
  activeMembers: [],
  currentRound: 1,
  mySlot: null,
  totalPot: 0,
  isLoading: false,

  setCircles: (circles) => set({ circles }),

  setActiveCircle: (circle, members, round, mySlot, totalPot) =>
    set({ activeCircle: circle, activeMembers: members, currentRound: round, mySlot, totalPot }),

  updateMemberStatus: (userId, status) =>
    set((state) => ({
      activeMembers: state.activeMembers.map((m) =>
        m.id === userId ? { ...m, contribution_status: status } : m
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
