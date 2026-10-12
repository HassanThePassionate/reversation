export interface ResourceOption {
  id: string;
  name: string;
}

export interface UserOption {
  id: string;
  name: string;
}

export interface ReservationFiltersProps {
  resources: ResourceOption[];
  users?: UserOption[];
  isAdmin: boolean;
  searchParams: {
    resourceId?: string;
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}
