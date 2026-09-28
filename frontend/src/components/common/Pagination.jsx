import React from 'react'
import { HStack, IconButton, Text } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// RTL layout: "previous" points right, "next" points left.
export default function Pagination({ page, pages, onChange, isLoading = false }) {
  if (!pages || pages <= 1) return null

  return (
    <HStack mt={4} justify="center" spacing={3}>
      <IconButton
        aria-label="الصفحة السابقة" icon={<ChevronRight size={16} />} size="sm" variant="outline"
        onClick={() => onChange(Math.max(1, page - 1))}
        isDisabled={page <= 1}
      />
      <Text fontSize="sm">صفحة {page} من {pages}</Text>
      <IconButton
        aria-label="الصفحة التالية" icon={<ChevronLeft size={16} />} size="sm" variant="outline"
        onClick={() => onChange(Math.min(pages, page + 1))}
        isDisabled={page >= pages || isLoading}
      />
    </HStack>
  )
}