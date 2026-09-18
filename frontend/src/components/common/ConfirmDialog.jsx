import React from 'react'
import {
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Button
} from '@chakra-ui/react'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'تأكيد الحذف', body = 'هل أنت متأكد من هذا الإجراء؟ لا يمكن التراجع عنه.', cancelRef }) {
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontWeight="800">{title}</AlertDialogHeader>
          <AlertDialogBody>{body}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="ghost">إلغاء</Button>
            <Button colorScheme="red" bg="brick.500" _hover={{ bg: 'brick.600' }} onClick={() => { onConfirm(); onClose() }} me={3}>
              حذف
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
