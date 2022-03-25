import {
    Box,
    Flex,
    Text,
    Button,
    Stack,
    useColorModeValue,
    useBreakpointValue,
    useDisclosure,
} from '@chakra-ui/react';
import {
    ArrowForwardIcon
} from '@chakra-ui/icons';
import { useRouter } from 'next/router';

export default function TopBar() {
    const router = useRouter();
    return (
        <Box>
            <Flex
                bg={useColorModeValue('white', 'gray.800')}
                color={useColorModeValue('gray.600', 'white')}
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={'solid'}
                borderColor={useColorModeValue('gray.200', 'gray.900')}
                align={'center'}>
                <Flex
                    flex={{ base: 1, md: 'auto' }}
                    ml={{ base: -2 }}
                    display={{ base: 'flex', md: 'none' }}>
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
                    <Text
                        textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                        fontFamily={'heading'}
                        color={useColorModeValue('gray.800', 'white')}>
                        Logo
                    </Text>
                </Flex>

                <Stack
                    flex={{ base: 1, md: 0 }}
                    justify={'flex-end'}
                    direction={'row'}
                    spacing={6}>
                    <Button
                        display={{ base: 'none', md: 'inline-flex' }}
                        fontSize={'sm'}
                        fontWeight={600}
                        onClick={() => router.push('/explore')}
                        rounded={'full'}
                        size={'lg'}
                        colorScheme='teal'
                        backgroundColor='rgb(55,99,27)'
                        px={6}
                        _hover={{ bg: 'rgb(197, 233, 175)' }}
                        leftIcon={<ArrowForwardIcon h={4} w={4} color={'gray.900'} />}
                    >
                        Open App
                    </Button>
                </Stack>
            </Flex>
        </Box >
    );
}
