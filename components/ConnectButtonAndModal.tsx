import {
    Text,
    Button,
    Flex,
    Box,
    Spacer,
    Stack
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
import SelectProfile from '../components/SelectProfile'
import { truncateEthAddress } from '../lib/helpers';

function ConnectButtonAndModal({ showConnected = true, autoFocus = false, colorScheme = 'gray', size = 'md' }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [{ data: connectData, error: connectError }, connect] = useConnect();
    const [{ data: accountData }, disconnect] = useAccount({
        fetchEns: true,
    });

    if (accountData && showConnected) {
        return (
            <>
                <Stack direction='column' maxWidth='90%' alignItems='center' >
                    {accountData.ens?.name
                        ? <Text fontSize='lg'>{accountData.ens?.name}</Text>
                        : <Text fontSize='lg'>{truncateEthAddress(accountData.address)}</Text>}
                    {/* <Text fontSize='xs'>Connected to {accountData.connector.name}</Text> */}
                    <SelectProfile address={accountData.address} />
                    <Button onClick={() => { disconnect(); onClose(); }}>Disconnect</Button>
                </Stack>
            </>
        )
    }
    // option to hide when connected
    else if (accountData && !showConnected) {
        return (<></>)
    }
    else {
        return (
            <>
                <Button onClick={onOpen} autoFocus={autoFocus} colorScheme={colorScheme} size={size}>Connect Wallet</Button>

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
