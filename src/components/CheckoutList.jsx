import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  totalAmt as totalAmtAtom,
  wallet as walletAtom,
  menu as menuAtom,
} from '../atoms';
import {
  Center,
  Text,
  MenuDivider,
  Button,
  IconButton,
  Box,
} from '@chakra-ui/react';
import { AiOutlineLeft } from 'react-icons/ai';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import uuid from 'react-uuid';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

export default function CheckoutList({ toggleToCheckout }) {
  const [totalAmt, setTotalAmt] = useRecoilState(totalAmtAtom);
  const [wallet, setWallet] = useRecoilState(walletAtom);
  const [menu] = useRecoilState(menuAtom);
  const [loading, setLoading] = useState({
    state: false,
    loadingText: 'Processing...',
  });
  const navigate = useNavigate();
  const { user } = UserAuth();

  useEffect(() => {
    getDoc(doc(db, 'users', user.uid)).then(data => {
      setWallet(data.get('wallet'));
    });
  }, []);

  const pay = () => {
    const orderId = uuid();
    setDoc(doc(db, 'orders', orderId), {
      orderId,
      orderNum: `${user.email
        .split('.')[1]
        .slice(0, 3)
        .toUpperCase()}${Math.floor(Math.random() * 101)}`,
      uid: user.uid,
      amount: totalAmt,
      orders: menu.filter(item => item.count > 0),
      orderTime: Date(),
    })
      .then(() => {
        setTotalAmt(0);
      })
      .then(() => {
        setLoading({ state: false, loadingText: 'Processing...' });
        navigate(`/orders`);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <>
      <Center>
        <IconButton
          icon={<AiOutlineLeft />}
          variant="link"
          onClick={toggleToCheckout}
        />
        <Text pt="2" pb="2" pr="3" fontSize="lg" fontWeight="bold">
          Time to Checkout
        </Text>
      </Center>
      <MenuDivider />
      {/* QuickPay eligibility and wallet balance (info only) */}
      <Text pl="3" pb="2" pt="3" fontSize="xl" fontWeight="medium">
        {wallet >= totalAmt ? 'Eligible for QuickPay' : `You can't QuickPay`}
      </Text>
      <Text pl="3" pb="3" fontSize="md" color={wallet >= totalAmt && wallet > 0 ? 'green.300' : 'red.500'} fontWeight="medium">
        Wallet Balance: ₹{wallet ?? 0}
      </Text>
      {/* Payment Navigation */}
      <Box p={4}>
        <Button
          colorScheme="teal"
          w="full"
          mt={4}
          onClick={() => navigate('/payment')}
        >
          Proceed to Payment
        </Button>

        <Button
          variant="ghost"
          w="full"
          mt={2}
          onClick={toggleToCheckout}
        >
          Back to Cart
        </Button>
      </Box>
    </>
  );
}
