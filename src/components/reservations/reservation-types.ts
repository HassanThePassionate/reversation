import type { ReservationStatus } from "@prisma/client";

export interface ReservationItem {
  id: string;
  title: string;
  notes: string | null;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
  resource: { id: string; name: string; location: string | null };
  user: { id: string; name: string; email: string };
  isCompleted?: boolean;
}

export interface ReservationRowProps {
  reservation: ReservationItem;
  viewerId: string;
  isAdmin: boolean;
}
