export const CATEGORIES = [
  'Printed Forms',
  'General Stationery',
  'Medical Supplies',
  'Office Equipment',
];

export const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Packed: 'bg-blue-100 text-blue-800 border-blue-300',
  Dispatched: 'bg-green-100 text-green-800 border-green-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
};

export const API_BASE = '/api';
