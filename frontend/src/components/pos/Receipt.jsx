import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { formatMoney, formatQty, lineTotal } from '../../utils/format'

Font.register({
  family: 'Cairo',
  src: '/fonts/Cairo-Regular.ttf',
})

const styles = StyleSheet.create({
  page: { fontFamily: 'Cairo', fontSize: 10, padding: 16 },
  center: { textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 14, marginBottom: 2 },
  line: { borderBottomWidth: 1, borderBottomColor: '#ccc', borderBottomStyle: 'solid', marginVertical: 6 },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 4 },
  total: { fontSize: 12, marginTop: 8 },
})

const formatDate = (date) => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} - ${hours}:${minutes}`
}

export default function Receipt({ cart, total, discount, invoiceId }) {
  return (
    <Document>
      <Page size={[227, 500]} style={styles.page}>
        <View style={styles.center}>
          <Text style={styles.title}>مغازة البركة</Text>
          <Text>فاتورة #{invoiceId}</Text>
          <Text>{formatDate(new Date())}</Text>
        </View>
        <View style={styles.line} />
        {cart.map((item) => (
          <View style={styles.row} key={item.id}>
            <Text>{item.name} × {formatQty(item.qty, item.step)} {item.unit}</Text>
            <Text>{formatMoney(lineTotal(item))}</Text>
          </View>
        ))}
        <View style={styles.line} />
        {discount > 0 && (
          <View style={styles.row}>
            <Text>تخفيض</Text>
            <Text>-{formatMoney(discount)}</Text>
          </View>
        )}
        <View style={[styles.row, styles.total]}>
          <Text>المجموع</Text>
          <Text>{formatMoney(total)}</Text>
        </View>
      </Page>
    </Document>
  )
}