export type EmployeeDto = {
  id: string;
  name: string;
  color: number | null;
  department: string | null;
  location: string | null;
  floor: string | null;
  building: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type MachineDto = {
  id: string;
  name: string;
  vin: string | null;
  organizationId: string | null;
  status: string;
  battery: number;
  lat: number | null;
  lng: number | null;
  location: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ItemDto = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  slotNumber: string | null;
  isAvailable: boolean;
  imageUrl: string | null;
  barcode: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type WarehouseInventoryRowDto = {
  itemId: number;
  sku: string;
  name: string;
  quantity: number;
  barcode: string | null;
};

export type MachineInventoryItemDto = {
  itemId: number;
  sku: string;
  name: string;
  quantity: number;
  barcode: string | null;
  slotNumber: string | null;
};

export type MachineInventorySnapshotDto = {
  machineId: string;
  machineName: string;
  status: string;
  location: string | null;
  items: MachineInventoryItemDto[];
};

export type RouteStopDto = {
  machineId: string;
  name: string;
  lat: number;
  lng: number;
  location: string | null;
  position: number;
};

export type RouteDto = {
  id: number | null;
  employeeId: string;
  employeeName: string;
  distanceMeters: number;
  durationSeconds: number;
  stops: RouteStopDto[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type ShipmentDto = {
  id: number;
  description: string;
  amount: number;
  scheduledFor: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type DailyStatDto = {
  date: string;
  amount: number;
  transactionCount: number;
};
