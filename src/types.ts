export interface Passenger {
  sn: number;
  name: string;
  phone: string;
  seatNo: number;
  destination: string;
  time: string;
  busNo: string;
  attendance: "Pending" | "Present" | "Absent";
  ticketNo: string;
  gender: string;
  age: string;
  paymentStatus: "Paid" | "Pending" | "Cancelled";
  paymentMethod: string;
}

export interface Trip {
  tripId: string;
  routeFrom: string;
  routeTo: string;
  busNo: string;
  driverName: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  capacity: number;
  bookedSeats: number;
  status: "ON TIME" | "DELAYED" | "DEPARTED" | "CANCELLED";
  attendanceLocked: boolean;
  attendanceOverridden: boolean;
}

export interface Bus {
  busNo: string;
  plateNo: string;
  model: string;
  capacity: number;
  driverName: string;
  status: "Active" | "Maintenance" | "Fueling" | "Out of Service";
  fuelLevel: number;
  nextMaintenance: string;
}

export interface Driver {
  name: string;
  phone: string;
  licenseNo: string;
  experience: string;
  assignedBus: string;
  assignedRoute: string;
  availability: "Active" | "Off Duty" | "On Trip";
  rating: number;
}

export interface Cargo {
  trackingNo: string;
  sender: string;
  receiver: string;
  receiverPhone: string;
  origin: string;
  destination: string;
  weight: number;
  type: string;
  price: number;
  status: "Warehouse" | "In Transit" | "Delivered";
  date: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface ERPState {
  passengers: Passenger[];
  trips: Trip[];
  buses: Bus[];
  drivers: Driver[];
  cargo: Cargo[];
  routes: string[];
  auditLogs: AuditLog[];
  currentUser: {
    username: string;
    role: "Super Admin" | "Admin" | "Office Manager" | "Customer Attendant" | "Driver" | "Customer";
    name: string;
  };
}
