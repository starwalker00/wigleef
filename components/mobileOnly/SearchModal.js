import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure
} from '@chakra-ui/react'
import { BiSearch } from 'react-icons/bi'
import SearchBar from '../../components/SearchBar';

export default function SearchModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <>
            {/* icon */}
            <BiSearch onClick={onOpen} />

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Search a profile</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <SearchBar afterSelected={onClose} />
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}