import { Portal, Button } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';

export default function NewPostButton() {
    const router = useRouter();
    return (
        <Portal>
            <Button
                onClick={() => router.push('/post')}
                leftIcon={<AddIcon />}
                bottom={{ base: '20', md: '10' }}
                right={{ base: '5', md: '10', xl: '100' }} position='fixed'
                boxShadow='lg'
                _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                    // cursor: 'not-allowed'
                }}
            >
                New post
            </Button>
        </Portal>
    )
}
