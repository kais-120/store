import React, { useMemo, useState } from 'react'
import {
  Box, Card, CardBody, CardHeader, Flex, Heading,
  Table, Thead, Tbody, Tr, Th, Td, Button,
  Spinner, Center, useToast, IconButton, HStack, Text,
  Input
} from '@chakra-ui/react'
import { Plus, Eye, Pencil, Trash2, Tags } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import useFetchData from '../hook/useFetchData'
import { createCategory, getCategories } from '../services/api'
import CategoryFormModal from '../components/tables/CategoryFormModal'

export default function Categories() {
  const toast = useToast()

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { data: categories, isLoading } = useFetchData(
    getCategories,
    isSaving
  )

  const handleSaveCategory = async (values) => {
    try {
      await createCategory(values)

      setIsSaving((prev) => !prev)
      setIsCategoryModalOpen(false)

      toast({
        title: 'تمت إضافة التصنيف بنجاح',
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      console.log('err', error)

      toast({
        title:
          error?.response?.data?.message ||
          'حدث خطأ أثناء إضافة التصنيف',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return (categories || []).filter((category) => {
      if (
        term &&
        !category.name?.toLowerCase().includes(term)
      ) {
        return false
      }

      return true
    })
  }, [categories, searchTerm])
  console.log(categories)

  const noop = () => {}

  return (
    <Box>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
        gap={3}
        mb={4}
      >
        <PageHeader
          title="التصنيفات"
          subtitle="متابعة وإدارة تصنيفات المنتجات"
        />

        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="brand"
          size="sm"
          onClick={() => setIsCategoryModalOpen(true)}
        >
          إضافة تصنيف
        </Button>
      </Flex>

      <Card>
        <CardHeader pb={0}>
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            gap={3}
          >
            <Heading size="sm">
              قائمة التصنيفات
            </Heading>

            <Text fontSize="sm" color="gray.500">
              عدد التصنيفات: {filteredCategories.length}
            </Text>
          </Flex>
        </CardHeader>

        <CardBody overflowX="auto">
          <Flex mb={4}>
            <Input
              placeholder="البحث عن تصنيف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="300px"
            />
          </Flex>

          {isLoading ? (
            <Center py={10}>
              <Spinner />
            </Center>
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              title="لا توجد تصنيفات"
              message="لم يتم تسجيل أي تصنيف بعد. أضف أول تصنيف لتنظيم منتجاتك."
              actionLabel="إضافة تصنيف"
              onAction={() => setIsCategoryModalOpen(true)}
            />
          ) : (
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>اسم التصنيف</Th>
                  <Th>الحالة</Th>
                  <Th textAlign="left">الإجراءات</Th>
                </Tr>
              </Thead>

              <Tbody>
                {filteredCategories.map((category) => (
                  <Tr key={category.id}>
                    <Td fontWeight="600">
                      {category.name}
                    </Td>

                    <Td>
                      <Text
                        fontSize="sm"
                        color={
                          category.status === 'active'
                            ? 'green.500'
                            : 'red.500'
                        }
                      >
                        {category.status === 'active'
                          ? 'نشط'
                          : 'محذوف'}
                      </Text>
                    </Td>

                    <Td>
                      <HStack
                        spacing={1}
                        justify="flex-end"
                      >
                        <IconButton
                          aria-label="عرض"
                          icon={<Eye size={16} />}
                          size="sm"
                          variant="ghost"
                          onClick={noop}
                        />

                        <IconButton
                          aria-label="تعديل"
                          icon={<Pencil size={16} />}
                          size="sm"
                          variant="ghost"
                          onClick={noop}
                        />

                        <IconButton
                          aria-label="حذف"
                          icon={<Trash2 size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={noop}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />
    </Box>
  )
}