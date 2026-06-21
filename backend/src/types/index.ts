export interface UserDepartment {
  Department_ID: string;
  Department_Name: string;
}

export interface StaffMaster {
  Staff_UID: string;
  Staff_3_Digit_ID: number;
  Staff_Name: string;
  Department_ID: string;
}

export interface InventoryItem {
  Item_ID: string;
  Item_Name: string;
  Category: string;
  Current_Stock: number;
  Low_Stock_Threshold: number;
  Item_Image?: string;
}

export interface RequisitionOrder {
  Order_ID: string;
  Department_ID: string;
  Staff_ID: string;
  Order_Timestamp: string;
  Order_Status: 'Pending' | 'Packed' | 'Dispatched' | 'Rejected';
}

export interface OrderLineItem {
  Line_Item_ID: string;
  Order_ID: string;
  Item_ID: string;
  Quantity_Requested: number;
}

export interface AuthPayload {
  staff_uid: string;
  staff_id: number;
  name: string;
  department_id: string;
  department_name: string;
  is_admin: boolean;
}
