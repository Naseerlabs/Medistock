-- MediStock SaaS MVP - Seed Data

-- Departments
INSERT INTO "User_Department" ("Department_ID", "Department_Name") VALUES
  ('dept_opd', 'OPD'),
  ('dept_icu', 'ICU'),
  ('dept_dialysis', 'Dialysis'),
  ('dept_dental', 'Dental'),
  ('dept_xray', 'X-ray'),
  ('dept_pathalogy', 'Pathalogy'),
  ('dept_admin', 'Admin')
ON CONFLICT ("Department_ID") DO NOTHING;

-- Staff
INSERT INTO "Staff_Master" ("Staff_UID", "Staff_3_Digit_ID", "Staff_Name", "Department_ID") VALUES
  ('stf_001', 100, 'Dr.sam', 'dept_icu'),
  ('stf_002', 101, 'jun', 'dept_opd'),
  ('stf_003', 102, 'Dr.rio', 'dept_icu'),
  ('stf_004', 103, 'fill', 'dept_dialysis'),
  ('stf_005', 104, 'Dr.jack', 'dept_icu'),
  ('stf_006', 105, 'loui', 'dept_opd'),
  ('stf_007', 106, 'robin', 'dept_dialysis'),
  ('stf_008', 107, 'lois', 'dept_opd'),
  ('stf_009', 108, 'akrum', 'dept_dental'),
  ('stf_010', 109, 'GPT', 'dept_pathalogy'),
  ('stf_011', 110, 'Claude', 'dept_dental'),
  ('stf_012', 111, 'gimini', 'dept_xray'),
  ('stf_013', 99, 'lotus', 'dept_opd'),
  ('stf_014', 98, 'flower', 'dept_dialysis'),
  ('stf_015', 97, 'look', 'dept_dialysis'),
  ('stf_016', 112, 'hiill', 'dept_opd'),
  ('stf_017', 113, 'gidd', 'dept_xray'),
  ('stf_018', 114, 'nood', 'dept_dialysis'),
  ('stf_019', 115, 'tall', 'dept_opd'),
  ('stf_020', 116, 'pill', 'dept_pathalogy'),
  ('stf_021', 222, 'ravi', 'dept_admin')
ON CONFLICT ("Staff_UID") DO NOTHING;

-- Inventory Items
INSERT INTO "Inventory_Items" ("Item_ID", "Item_Name", "Category", "Current_Stock", "Low_Stock_Threshold") VALUES
  ('inv_001', 'A4 Paper Ream', 'General Stationery', 450, 50),
  ('inv_002', 'Ballpoint Pens (Blue)', 'General Stationery', 320, 40),
  ('inv_003', 'Permanent Markers', 'General Stationery', 180, 20),
  ('inv_004', 'Stapler Machines', 'General Stationery', 75, 10),
  ('inv_005', 'Staple Pins Box', 'General Stationery', 280, 30),
  ('inv_006', 'File Folders', 'General Stationery', 210, 25),
  ('inv_007', 'Sticky Notes Pack', 'General Stationery', 150, 20),
  ('inv_008', 'Clipboards', 'General Stationery', 95, 10),
  ('inv_009', 'Scissors', 'General Stationery', 60, 10),
  ('inv_010', 'Printer Ink Cartridges', 'Office Equipment', 85, 10),
  ('inv_011', 'Patient Registration Forms', 'Printed Forms', 500, 100),
  ('inv_012', 'Prescription Pads', 'Printed Forms', 350, 50),
  ('inv_013', 'Medical Record Files', 'Printed Forms', 275, 40),
  ('inv_014', 'Patient ID Wristbands', 'Medical Supplies', 420, 50),
  ('inv_015', 'Laboratory Request Forms', 'Printed Forms', 310, 50),
  ('inv_016', 'X-Ray Request Forms', 'Printed Forms', 240, 30),
  ('inv_017', 'Consent Forms', 'Printed Forms', 190, 25),
  ('inv_018', 'Temperature Charts', 'Printed Forms', 130, 15),
  ('inv_019', 'Nursing Notes Sheets', 'Printed Forms', 390, 50),
  ('inv_020', 'Appointment Cards', 'General Stationery', 260, 30)
ON CONFLICT ("Item_ID") DO NOTHING;
