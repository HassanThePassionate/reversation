export interface ResourceTypeOption {
  id: string;
  name: string;
}

export interface ResourceFiltersProps {
  types: ResourceTypeOption[];
  currentSearch?: string;
  currentTypeId?: string;
  currentStatus?: string;
}
