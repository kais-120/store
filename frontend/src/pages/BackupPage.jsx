import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Flex, SimpleGrid, Card, CardHeader, CardBody, Heading, Text, Button, IconButton, Tooltip,
  Badge, HStack, Table, Thead, Tbody, Tr, Th, Td, Spinner, Center, useToast
} from '@chakra-ui/react'
import {
  DatabaseBackup, HardDrive, Cloud, CloudOff, RefreshCw, CheckCircle2, XCircle, Clock
} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import { Axios } from '../API/Api'

// تنسيق الحجم بوحدات عربية (بايت، ك.ب، م.ب، ج.ب)
const formatSize = (bytes) => {
  if (bytes === null || bytes === undefined) return '—'
  const units = ['بايت', 'ك.ب', 'م.ب', 'ج.ب']
  let value = bytes
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i += 1
  }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

// أرقام لاتينية للتوافق مع بقية لوحة التحكم
const formatDateTime = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const STATUS_MAP = {
  success: { label: 'ناجحة', scheme: 'green', icon: CheckCircle2 },
  error: { label: 'فاشلة', scheme: 'red', icon: XCircle },
  running: { label: 'قيد التنفيذ', scheme: 'yellow', icon: Clock },
}

const StatusBadge = ({ status }) => {
  const { label, scheme, icon: Icon } = STATUS_MAP[status] || STATUS_MAP.success
  return (
    <Badge colorScheme={scheme} display="inline-flex" alignItems="center" gap={1}>
      <Icon size={12} />
      {label}
    </Badge>
  )
}

const InfoCard = ({ icon: Icon, accent, label, value, caption, children }) => (
  <Card>
    <CardBody>
      <HStack spacing={3} mb={2}>
        <Flex w="36px" h="36px" borderRadius="lg" bg={`${accent}`} opacity={0.95} align="center" justify="center" color="white">
          <Icon size={18} />
        </Flex>
        <Text fontSize="sm" color="ink.muted" fontWeight="600">{label}</Text>
      </HStack>
      <Text fontSize="xl" fontWeight="800">{value}</Text>
      {caption && <Text fontSize="xs" color="ink.muted" mt={1}>{caption}</Text>}
      {children && <Box mt={2}>{children}</Box>}
    </CardBody>
  </Card>
)

export default function BackupPage() {
  const toast = useToast()
  const [status, setStatus] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [runningBackup, setRunningBackup] = useState(false)

  const notify = useCallback(
    (title, kind = 'success') =>
      toast({ title, status: kind, duration: 4000, isClosable: true, position: 'bottom' }),
    [toast]
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statusRes, historyRes] = await Promise.all([
        Axios.get('/backup/status'),
        Axios.get('/backup/history'),
      ])
      setStatus(statusRes.data)
      setHistory(historyRes.data)
    } catch (err) {
      notify('حدث خطأ أثناء تحميل معلومات النسخ الاحتياطي.', 'error')
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRunNow = async () => {
    setRunningBackup(true)
    try {
      await Axios.post('/backup/run-now')
      notify('تم إنشاء النسخة الاحتياطية بنجاح.')
      await fetchData()
    } catch (err) {
      console.error(err)
      notify('فشلت عملية النسخ الاحتياطي. حاول مرة أخرى.', 'error')
    } finally {
      setRunningBackup(false)
    }
  }

  if (loading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  const driveConnected = status?.googleDriveConnected

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={3}>
        <PageHeader title="النسخ الاحتياطي" subtitle="حماية بيانات المحل واستعادتها" />
        <HStack spacing={2}>
          <Tooltip label="تحديث">
            <IconButton
              aria-label="تحديث"
              icon={<RefreshCw size={18} />}
              variant="outline"
              colorScheme="brand"
              onClick={fetchData}
            />
          </Tooltip>
          <Button
            leftIcon={runningBackup ? undefined : <DatabaseBackup size={18} />}
            onClick={handleRunNow}
            isLoading={runningBackup}
            loadingText="جارٍ النسخ..."
          >
            إنشاء نسخة احتياطية
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4} mb={6}>
        <InfoCard
          icon={Clock}
          accent="gold.500"
          label="آخر نسخة احتياطية"
          value={formatDateTime(status?.lastBackupAt)}
        >
          {status?.lastBackupStatus && <StatusBadge status={status.lastBackupStatus} />}
        </InfoCard>

        <InfoCard
          icon={HardDrive}
          accent="brand.500"
          label="النسخ المحلية"
          value={`${status?.localCount ?? 0} ملف`}
          caption={`${formatSize(status?.localTotalSize)} • عدد النسخ المحفوظة: ${status?.retentionCount ?? 30}`}
        />

        <InfoCard
          icon={driveConnected ? Cloud : CloudOff}
          accent={driveConnected ? 'olive.500' : 'brick.500'}
          label="Google Drive"
          value={driveConnected ? 'متصل' : 'غير متصل'}
          caption={
            driveConnected
              ? `آخر رفع: ${formatDateTime(status?.lastDriveUploadAt)}`
              : 'يلزم تسجيل الدخول لربط الحساب'
          }
        />
      </SimpleGrid>

      <Card>
        <CardHeader pb={0}>
          <Heading size="sm">سجل النسخ الاحتياطية</Heading>
        </CardHeader>
        <CardBody overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>التاريخ</Th>
                <Th>الحجم</Th>
                <Th>مكان الحفظ</Th>
                <Th>الحالة</Th>
              </Tr>
            </Thead>
            <Tbody>
              {history.length === 0 ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={6} color="ink.muted">
                    لا توجد نسخ احتياطية بعد. اضغط «إنشاء نسخة احتياطية» للبدء.
                  </Td>
                </Tr>
              ) : (
                history.map((entry) => (
                  <Tr key={entry.id}>
                    <Td fontWeight="600">{formatDateTime(entry.createdAt)}</Td>
                    <Td>{formatSize(entry.size)}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <Badge colorScheme="brand" variant="subtle">محلي</Badge>
                        {entry.uploadedToDrive && (
                          <Badge colorScheme="green" variant="subtle">Google Drive</Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td><StatusBadge status={entry.status} /></Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  )
}