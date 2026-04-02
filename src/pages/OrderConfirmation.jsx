import { Box, Heading, Text } from '@chakra-ui/react';
import { Button, Stack } from '@chakra-ui/react';
import LayoutContainer from '../components/LayoutContainer';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { cart as cartAtom, totalAmt as totalAmtAtom, menu as menuAtom } from '../atoms';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const setCart = useSetRecoilState(cartAtom);
  const setTotalAmt = useSetRecoilState(totalAmtAtom);
  const setMenu = useSetRecoilState(menuAtom);

  // Safety net: ensure cart is cleared when viewing confirmation
  useEffect(() => {
    setCart([]);
    setTotalAmt(0);
    setMenu(prev => Array.isArray(prev) ? prev.map(i => ({ ...i, count: 0 })) : []);
  }, [setCart, setTotalAmt, setMenu]);

  const goToMenu = () => navigate('/menu', { replace: true });
  const goHome = () => navigate('/', { replace: true });

  return (
    <LayoutContainer>
      <Box maxW={{ base: '100%', md: '700px' }} mx="auto" mt={{ base: 6, md: 10 }} p={{ base: 4, md: 6 }} borderWidth={1} borderRadius="lg" shadow="md">
        <Heading mb={6} textAlign="center">Order Confirmation</Heading>
        <Text fontSize="lg">
          Thank you for your order! Your order has been successfully placed. You will receive a confirmation email shortly.
        </Text>

        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={8} justify="center">
          <Button colorScheme="teal" onClick={goToMenu}>
            Back to Menu
          </Button>
          <Button variant="outline" onClick={goHome}>
            Go to Home
          </Button>
        </Stack>
      </Box>
    </LayoutContainer>
  );
}