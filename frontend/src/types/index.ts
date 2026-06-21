export interface User {
  staff_uid: string;
  staff_id: number;
  name: string;
  department_id: string;
  department_name: string;
  is_admin: boolean;
}

export interface InventoryItem {
  Item_ID: string;
  Item_Name: string;
  Category: string;
  Current_Stock: number;
  Low_Stock_Threshold: number;
  Item_Image?: string;
}

export interface CartItem {
  itemId: string;
  itemName: string;
  quantity: number;
  stock: number;
}

export interface Order {
  Order_ID: string;
  Department_ID: string;
  Staff_ID: string;
  Order_Timestamp: string;
  Order_Status: 'Pending' | 'Packed' | 'Dispatched' | 'Rejected';
  User_Department?: { Department_Name: string };
  Staff_Master?: { Staff_Name: string };
  Order_Line_Items?: OrderLineItem[];
}

export interface OrderLineItem {
  Line_Item_ID: string;
  Order_ID: string;
  Item_ID: string;
  Quantity_Requested: number;
  Item_Name?: string;
  Category?: string;
  Inventory_Items?: { Item_Name: string; Category: string };
}
