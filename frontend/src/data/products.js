export const categories = [
  { id: 'all', label: 'الكل' },
  { id: 'food', label: 'مواد غذائية' },
  { id: 'drinks', label: 'مشروبات' },
  { id: 'spices', label: 'توابل' },
  { id: 'canned', label: 'معلبات' },
  { id: 'cleaning', label: 'مواد تنظيف' },
  { id: 'sweets', label: 'حلويات' },
  { id: 'other', label: 'أخرى' },
]

export const initialProducts = [
  { id: 'p1', name: 'سكر 1 كغ', category: 'food', price: 2.5, purchasePrice: 2.05, unit: 'كغ', stock: 42, minStock: 10, step: 0.1 },
  { id: 'p2', name: 'قهوة 250 غ', category: 'food', price: 4.8, purchasePrice: 3.9, unit: 'قطعة', stock: 18, minStock: 8, step: 1 },
  { id: 'p3', name: 'حليب 1 لتر', category: 'food', price: 1.5, purchasePrice: 1.2, unit: 'لتر', stock: 6, minStock: 12, step: 0.1 },
  { id: 'p4', name: 'زيت نباتي 1 لتر', category: 'food', price: 4.2, purchasePrice: 3.6, unit: 'لتر', stock: 25, minStock: 10, step: 0.1 },
  { id: 'p5', name: 'أرز 1 كغ', category: 'food', price: 3.9, purchasePrice: 3.2, unit: 'كغ', stock: 30, minStock: 10, step: 0.1 },
  { id: 'p6', name: 'ماء معدني 1.5 لتر', category: 'drinks', price: 0.8, purchasePrice: 0.55, unit: 'قطعة', stock: 96, minStock: 24, step: 1 },
  { id: 'p7', name: 'فلفل أحمر', category: 'spices', price: 1.2, purchasePrice: 0.9, unit: 'غ', stock: 1500, minStock: 500, step: 100 },
  { id: 'p8', name: 'طماطم معلبة', category: 'canned', price: 2.3, purchasePrice: 1.8, unit: 'قطعة', stock: 40, minStock: 12, step: 1 },
  { id: 'p9', name: 'كسكسي 1 كغ', category: 'food', price: 2.9, purchasePrice: 2.3, unit: 'كغ', stock: 22, minStock: 8, step: 0.1 },
  { id: 'p10', name: 'جبن مثلثات', category: 'food', price: 2.1, purchasePrice: 1.7, unit: 'قطعة', stock: 5, minStock: 10, step: 1 },
  { id: 'p11', name: 'تمر 500 غ', category: 'sweets', price: 5.5, purchasePrice: 4.4, unit: 'قطعة', stock: 14, minStock: 6, step: 1 },
  { id: 'p12', name: 'عصير برتقال 1 لتر', category: 'drinks', price: 2.4, purchasePrice: 1.9, unit: 'لتر', stock: 20, minStock: 8, step: 0.1 },
  { id: 'p13', name: 'مشروب غازي 1.5 لتر', category: 'drinks', price: 2.6, purchasePrice: 2.0, unit: 'قطعة', stock: 3, minStock: 12, step: 1 },
  { id: 'p14', name: 'كمون مطحون', category: 'spices', price: 1.8, purchasePrice: 1.3, unit: 'غ', stock: 1700, minStock: 500, step: 100 },
  { id: 'p15', name: 'هريسة معلبة', category: 'canned', price: 1.4, purchasePrice: 1.0, unit: 'قطعة', stock: 33, minStock: 10, step: 1 },
  { id: 'p16', name: 'مسحوق غسيل 3 كغ', category: 'cleaning', price: 9.9, purchasePrice: 8.0, unit: 'قطعة', stock: 9, minStock: 6, step: 1 },
  { id: 'p17', name: 'سائل تنظيف الأواني', category: 'cleaning', price: 2.2, purchasePrice: 1.6, unit: 'قطعة', stock: 27, minStock: 8, step: 1 },
  { id: 'p18', name: 'مكرونة 500 غ', category: 'food', price: 1.3, purchasePrice: 1.0, unit: 'قطعة', stock: 50, minStock: 15, step: 1 },
  { id: 'p19', name: 'شكلاطة حلويات', category: 'sweets', price: 3.2, purchasePrice: 2.5, unit: 'قطعة', stock: 12, minStock: 10, step: 1 },
  { id: 'p20', name: 'خبز توست', category: 'food', price: 1.7, purchasePrice: 1.3, unit: 'قطعة', stock: 8, minStock: 10, step: 1 },
  { id: 'p21', name: 'شاي أخضر 100 غ', category: 'drinks', price: 3.4, purchasePrice: 2.7, unit: 'قطعة', stock: 19, minStock: 6, step: 1 },
  { id: 'p22', name: 'أكياس بلاستيك', category: 'other', price: 0.3, purchasePrice: 0.15, unit: 'قطعة', stock: 200, minStock: 50, step: 10 },
  { id: 'p23', name: 'أعواد ثقاب', category: 'other', price: 0.4, purchasePrice: 0.25, unit: 'قطعة', stock: 60, minStock: 20, step: 1 },
  { id: 'p24', name: 'زيتون معلب', category: 'canned', price: 2.9, purchasePrice: 2.3, unit: 'قطعة', stock: 16, minStock: 8, step: 1 },
]

export const stockStatus = (product) => {
  if (product.stock <= 0) return { key: 'out', label: 'نفد المخزون', color: 'brick' }
  if (product.stock <= product.minStock) return { key: 'low', label: 'كمية منخفضة', color: 'amber' }
  return { key: 'ok', label: 'متوفر', color: 'olive' }
}