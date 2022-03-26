import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Icon,
    Text,
    Stack,
    HStack,
    VStack,
    Link,
    Center
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

// // Replace test data with your own
// const features = Array.apply(null, Array(8)).map(function (x, i) {
//     return {
//         id: i,
//         title: 'Lorem ipsum dolor sit amet',
//         text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam.',
//     };
// });

const features = [
    {
        id: 1,
        title: 'React',
        href: 'https://reactjs.org/',
    },
    {
        id: 2,
        title: 'Next.js',
        href: 'https://nextjs.org/',
    },
    {
        id: 3,
        title: 'Chakra UI',
        href: 'https://chakra-ui.com/',
    },
    {
        id: 4,
        title: 'Ethers.js',
        href: 'https://docs.ethers.io/v5/',
    },
    {
        id: 5,
        title: 'wagmi',
        href: 'https://wagmi.sh/',
    },
    {
        id: 6,
        title: 'Apollo Client',
        href: 'https://www.apollographql.com/docs/react/',
    }

]
export default function ListTechnologies() {
    return (
        <>
            <Center>
                <Heading
                    lineHeight={1.1}
                    fontWeight={200}
                    fontSize={{ base: '3xl', sm: '4xl', lg: '6xl' }}
                    marginBottom={{ base: 5, md: 10 }}
                >
                    Built with
                </Heading>
            </Center>
            <SimpleGrid
                columns={{ base: 1, md: 2, lg: 3 }}
                spacing={4}
                margin='auto'
            >
                {features.map((feature) => (
                    <Center key={feature.id}>
                        <Link href={feature.href}>
                            <Text fontWeight={600}>{feature.title}</Text>
                        </Link>
                    </Center>
                ))}
            </SimpleGrid>
        </>
    );
}
