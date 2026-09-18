export const initialSuppliers = [
  { id: 's1', name: 'شركة الأمان للمواد الغذائية', phone: '71234567', debt: 1200.0 },
  { id: 's2', name: 'مؤسسة النور', phone: '71987654', debt: 650.0 },
  { id: 's3', name: 'شركة تونس للتوزيع', phone: '71556677', debt: 300.0 },
]

export const initialPurchases = [
  { id: 'pu1001', supplierId: 's1', supplierName: 'شركة الأمان للمواد الغذائية', date: '2026-09-16', amount: 850.0, status: 'مدفوعة' },
  { id: 'pu1002', supplierId: 's2', supplierName: 'مؤسسة النور', date: '2026-09-14', amount: 420.5, status: 'معلقة' },
  { id: 'pu1003', supplierId: 's3', supplierName: 'شركة تونس للتوزيع', date: '2026-09-10', amount: 610.0, status: 'مدفوعة جزئيًا' },
  { id: 'pu1004', supplierId: 's1', supplierName: 'شركة الأمان للمواد الغذائية', date: '2026-09-05', amount: 275.75, status: 'مدفوعة' },
]
