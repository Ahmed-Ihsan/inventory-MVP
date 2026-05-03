export const revenueDebtData = [
  { date: '04/01', paid: 45000, debt: 25000 },
  { date: '04/03', paid: 48000, debt: 27000 },
  { date: '04/05', paid: 60000, debt: 24000 },
  { date: '04/07', paid: 62000, debt: 22000 },
  { date: '04/09', paid: 64000, debt: 20000 },
  { date: '04/11', paid: 67000, debt: 18000 },
  { date: '04/13', paid: 69000, debt: 16000 },
  { date: '04/15', paid: 72000, debt: 14000 },
  { date: '04/17', paid: 74000, debt: 12000 },
  { date: '04/19', paid: 76000, debt: 10000 },
  { date: '04/21', paid: 78000, debt:  9000 },
  { date: '04/23', paid: 80000, debt:  8000 },
  { date: '04/25', paid: 82000, debt:  7000 },
  { date: '04/27', paid: 84000, debt:  6000 },
  { date: '04/30', paid: 85000, debt:  4500 },
];

export const inventoryHealthData = [
  { key: 'healthyStock',  value: 65, color: 'var(--color-success)' },
  { key: 'lowStockItems', value: 25, color: 'var(--color-warning)' },
  { key: 'outOfStock',    value: 10, color: 'var(--color-danger)'  },
];

export const expiringItems = [
  { name: 'Paracetamol 500mg',       batch: 'BATCH-2024-001', expiry: '2024-05-15', status: 'warning' },
  { name: 'Amoxicillin 250mg',       batch: 'BATCH-2024-002', expiry: '2024-05-20', status: 'warning' },
  { name: 'Ibuprofen 200mg',         batch: 'BATCH-2024-003', expiry: '2024-05-25', status: 'warning' },
  { name: 'Aspirin 100mg',           batch: 'BATCH-2024-004', expiry: '2024-06-01', status: 'info'    },
  { name: 'Ciprofloxacin 500mg',     batch: 'BATCH-2024-005', expiry: '2024-06-05', status: 'info'    },
];

export const criticalLowStock = [
  { name: 'Insulin Injection',           stock: 5 },
  { name: 'Morphine Sulfate',            stock: 3 },
  { name: 'Epinephrine Auto-Injector',   stock: 2 },
  { name: 'Warfarin Tablets',            stock: 7 },
  { name: 'Heparin Solution',            stock: 4 },
];

export const topMovingItems = [
  'Paracetamol 500mg',
  'Amoxicillin 250mg',
  'Ibuprofen 200mg',
  'Aspirin 100mg',
  'Omeprazole 20mg',
];

export const recentTransactions = [
  { date: '2024-04-18', description: 'دفعة من صيدلية أ',   amount:  15000, type: 'payment'  },
  { date: '2024-04-17', description: 'أمر شراء #1234',      amount: -8500,  type: 'purchase' },
  { date: '2024-04-16', description: 'دفعة من صيدلية ب',   amount:  22000, type: 'payment'  },
  { date: '2024-04-15', description: 'فاتورة مورد #5678',   amount: -12000, type: 'purchase' },
  { date: '2024-04-14', description: 'دفعة من مستشفى ج',   amount:  18000, type: 'payment'  },
];

export const activityLog = [
  { text: 'تم تحديث مخزون الباراسيتامول',      time: 'منذ دقيقتين'  },
  { text: 'تم إتمام النسخ الاحتياطي للنظام',   time: 'منذ ١٥ دقيقة' },
  { text: 'تسجيل مستخدم جديد: د. أحمد',        time: 'منذ ساعة'     },
];
