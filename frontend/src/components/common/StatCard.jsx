import React from 'react'
import { Card, CardBody, HStack, VStack, Text, Icon, Flex } from '@chakra-ui/react'

export default function StatCard({ label, value, icon, accent = 'brand.500', suffix }) {
  return (
    <Card>
      <CardBody>
        <HStack spacing={4} align="flex-start">
          <Flex w="46px" h="46px" borderRadius="lg" bg={accent} align="center" justify="center" flexShrink={0}>
            <Icon as={icon} boxSize={5} color="white" />
          </Flex>
          <VStack align="stretch" spacing={0}>
            <Text fontSize="sm" color="ink.muted" fontWeight="500">{label}</Text>
            <Text fontSize="xl" fontWeight="800">{value}{suffix}</Text>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )
}
