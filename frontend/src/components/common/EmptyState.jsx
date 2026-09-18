import React from 'react'
import { VStack, Icon, Text } from '@chakra-ui/react'
import { Inbox } from 'lucide-react'

export default function EmptyState({ text = 'لا توجد بيانات لعرضها', icon = Inbox }) {
  return (
    <VStack py={10} spacing={3} color="ink.muted">
      <Icon as={icon} boxSize={9} />
      <Text fontWeight="600">{text}</Text>
    </VStack>
  )
}
