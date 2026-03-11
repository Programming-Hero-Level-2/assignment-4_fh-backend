export const OrderSearchableFields: string[] = [];

export const PROVIDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PLACED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};
