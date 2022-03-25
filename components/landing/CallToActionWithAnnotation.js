import Head from 'next/head';
import {
    Box,
    Heading,
    Container,
    Text,
    Button,
    Stack,
    Icon,
    useColorModeValue,
    createIcon,
    Link,
    Image
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';

export default function CallToActionWithAnnotation() {
    const router = useRouter();
    return (
        <>
            <Head>
            </Head>

            <Container maxW={'3xl'}
                // style={{ backgroundImage: 'url("./landing-img1.jpg")!important;', width: '100 %;' }}
                bgGradient='linear(to-r, teal.500, green.500)'
                color={'whiteAlpha.900'}
                minHeight='100%'
            >
                <Stack
                    as={Box}
                    textAlign={'center'}
                    spacing={{ base: 16, md: 24 }}
                    py={{ base: 36, md: 36 }}>
                    <Heading
                        fontWeight={600}
                        fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
                        lineHeight={'110%'}>
                        Own your tweets with <br />
                        {/* <Text as={'span'} color={'green.400'}>
                            OWNEET
                        </Text> */}
                        <Text as={'span'}
                            fontFamily='"Space Grotesk", sans-serif;'
                            // color='rgb(0, 80, 30)' backgroundColor='rgb(171 254 44)'
                            letterSpacing={2}
                            bgGradient='linear(to-r, white.500, green.500)'
                            // bgClip='text'
                            fontWeight='extrabold'
                        >
                            OWNEET
                        </Text>
                    </Heading>
                    {/* <Text color={'gray.500'}>
                        Monetize your content by charging your most loyal readers and reward
                        them loyalty points. Give back to your loyal readers by granting
                        them access to your pre-releases and sneak-peaks.
                    </Text> */}
                    <Stack
                        direction={'column'}
                        spacing={3}
                        align={'center'}
                        alignSelf={'center'}
                        position={'relative'}>
                        <Button
                            px={6}
                            color={'gray.900'}
                            onClick={() => router.push('/explore')}
                        >
                            Open App
                        </Button>
                    </Stack>
                    {/* <Image src={'/landing-img1.jpg'}
                        boxSize='80%'
                        maxHeight='300px'
                        objectFit='contain'
                        alignSelf={'center'}
                    /> */}
                    <Stack
                        direction={'row'}
                        direction={{ base: 'column', sm: 'row' }}
                        spacing={2}
                        align={'baseline'}
                        alignSelf={'center'}
                        alignItems={'center'}
                    >
                        <Text fontSize={'md'}>Plugged into</Text>
                        <Link href='https://lens.dev' isExternal>
                            <Text fontSize={'md'} fontWeight={500}
                                // color='rgb(0, 80, 30)'
                                color='rgb(171 254 44)'
                                fontFamily='"Space Grotesk", sans-serif;'
                            // backgroundColor='rgb(171 254 44)'
                            >
                                LENS PROTOCOL<ExternalLinkIcon mx='2px' />
                            </Text>
                        </Link>

                    </Stack>
                </Stack>
            </Container >
        </>
    );
}
