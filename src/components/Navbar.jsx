import {
  Text,
  Box,
  Flex,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  Button,
  useColorMode,
  useColorModeValue,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';

import { FaMoon, FaSun } from 'react-icons/fa';
import { UserAuth } from '../context/AuthContext';
import CartMenu from './CartMenu';
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';
import { useNavigate } from 'react-router-dom';

export default function Nav({ title, navBtn, hasCheckout }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const { googleSignIn, user } = UserAuth();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await googleSignIn();
      logEvent(analytics, 'login', {
        method: 'Google',
      });
    } catch (error) {
      onOpen();
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Failed to Sign In</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Please use the acccount associated with VES Email Address!
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Text fontSize="2xl" fontWeight="bold">
            {title}
          </Text>
          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={3}>
              <Button onClick={toggleColorMode} variant="ghost">
                {colorMode === 'light' ? <FaMoon /> : <FaSun />}
              </Button>
              {user ? (
                <>
                  {/* Global Menu button */}
                  <Button
                    variant="solid"
                    size="sm"
                    colorScheme="teal"
                    onClick={() => navigate('/menu')}
                  >
                    Menu
                  </Button>
                  {/* My Orders button (match Menu style) */}
                  <Button
                    variant="solid"
                    size="sm"
                    colorScheme="teal"
                    onClick={() => navigate('/orders')}
                  >
                    My Orders
                  </Button>
                  {hasCheckout ? <CartMenu /> : null}
                </>
              ) : null}

              {user == null ? (
                <Button
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
              ) : (
                navBtn
              )}
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
