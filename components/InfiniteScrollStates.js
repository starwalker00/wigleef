import {
    Text,
    Box,
    Center,
    CircularProgress
} from '@chakra-ui/react';

export function InfiniteScrollLoading() {
    return (
        <Center overflow='hidden' color='green.500'>
            <Box textAlign='center'>
                <CircularProgress isIndeterminate color='green.500' thickness='6px' />
                <Text>Loading</Text>
            </Box>
        </Center>
    )
}

export function InfiniteScrollLoaded() {
    return (
        <Center overflow='hidden' color='green.500'>
            <Box textAlign='center'>
                <CircularProgress value={100} color='green.500' thickness='6px' />
                <Text>Everything has been loaded</Text>
            </Box>
        </Center>
    )
}
