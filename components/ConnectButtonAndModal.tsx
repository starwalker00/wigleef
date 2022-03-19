import {
    Text,
    Button,
    Flex,
    Box,
    Spacer
} from '@chakra-ui/react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';

import { useConnect, useAccount } from 'wagmi';

function ConnectButtonAndModal() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [{ data: connectData, error: connectError }, connect] = useConnect();
    const [{ data: accountData }, disconnect] = useAccount({
        fetchEns: true,
    });

    if (accountData) {
        return (
            <>
                <Flex flexDirection='column'>
                    <Box p='4' bg='blue.400'>
                        {accountData.ens?.name
                            ? <Text fontSize='xs'>{accountData.ens?.name}</Text>
                            : <Text fontSize='xs'>{accountData.address}</Text>}
                    </Box>
                    <Spacer />
                    <Box p='4' bg='green.400'>
                        <Text fontSize='xs'>Connected to {accountData.connector.name}</Text>
                    </Box>
                    <Button onClick={() => { disconnect(); onClose(); }}>Disconnect</Button>
                </Flex>
            </>
        )
    }
    else {
        return (
            <>
                <Button onClick={onOpen}>Connect Wallet</Button>

                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Modal Title</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {connectData.connectors.map((connector) => (
                                <Button
                                    disabled={!connector.ready}
                                    key={connector.id}
                                    onClick={() => connect(connector)}
                                >
                                    {connector.name}
                                    {!connector.ready && ' (unsupported)'}
                                </Button>
                            ))}

                            {connectError && <div>{connectError?.message ?? 'Failed to connect'}</div>}
                        </ModalBody>
                        <ModalFooter>
                            <Button mr={3} onClick={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </>
        )
    }
}

export default ConnectButtonAndModal;
