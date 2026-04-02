import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import ProfileNavBtn from '../components/buttons/ProfileNavBtn';
import {
  VStack,
  Text,
  Box,
  Button,
  Divider,
  Skeleton,
  HStack,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { db } from '../firebase';
import {
  getDocs,
  collection,
  where,
  query,
  getDoc,
  doc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { UserAuth } from '../context/AuthContext';
import { orders as ordersAtom, wallet as walletAtom } from '../atoms';
import { useRecoilState } from 'recoil';

export default function Orders() {
  const [orders, setOrders] = useRecoilState(ordersAtom);
  const [wallet, setWallet] = useRecoilState(walletAtom);
  const { user } = UserAuth();
  const uid = user?.uid;
  const [loading, setLoading] = useState(true);
  const {
    isOpen: isClearOpen,
    onOpen: onClearOpen,
    onClose: onClearClose,
  } = useDisclosure();
  const cancelRef = useRef();
  useEffect(() => {
    document.title = 'Orders';
  });

  useEffect(() => {
    async function fetchWallet() {
      const userData = await getDoc(doc(db, 'users', user.uid));
      return setWallet(undefined);
    }

    if (!user?.uid) return;
    fetchWallet()
      .then(data => setWallet(undefined))
      .catch(() => {});
  }, [user?.uid, setWallet]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'orders'), where('uid', '==', uid));
    return onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => {
        const rawTime = d.get('orderTime') || d.get('createdAt');
        let orderTimeStr;
        if (rawTime && typeof rawTime.toDate === 'function') {
          orderTimeStr = rawTime.toDate().toString();
        } else if (rawTime) {
          orderTimeStr = String(rawTime);
        } else {
          orderTimeStr = new Date().toString();
        }
        list.push({
          id: d.get('orderId') || d.id,
          amount: d.get('amount') ?? 0,
          orderNum: d.get('orderNum') || '—',
          orderTime: orderTimeStr,
          orders: Array.isArray(d.get('orders')) ? d.get('orders') : [],
          uid: d.get('uid'),
          refId: d.id,
        });
      });
      // sort newest first if orderTime is a date string
      list.sort((a,b) => new Date(b.orderTime) - new Date(a.orderTime));
      setOrders(list);
      setLoading(false);
    }, (err) => console.log(err));
  }, [uid, setOrders]);

  async function clearHistory() {
    try {
      if (!uid) return;
      const snap = await getDocs(query(collection(db, 'orders'), where('uid','==', uid)));
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(doc(db, 'orders', d.id)));
      await batch.commit();
      setOrders([]);
      onClearClose();
    } catch (e) {
      console.log('clear history error', e);
    }
  }

  return (
    <>
      <Navbar title={`Orders`} navBtn={<ProfileNavBtn />} hasCheckout />
      <VStack align="normal" p="8" spacing={4}>
        <Text fontSize="3xl" pb="2">Your orders</Text>
        <Box textAlign="right" pb={2}>
          <Button size="sm" colorScheme="red" variant="outline" onClick={onClearOpen}>
            Clear History
          </Button>
        </Box>

        {loading && (
          <VStack align="stretch" spacing={4}>
            {[...Array(2)].map((_, i) => (
              <Box key={i} p={4} bg="gray.800" rounded="md" borderWidth="1px" borderColor="gray.700">
                <Skeleton height="20px" mb={2} />
                <Skeleton height="14px" mb={4} />
                <Skeleton height="12px" />
              </Box>
            ))}
          </VStack>
        )}

        {!loading && (orders || []).length === 0 && (
          <Box p={6} bg="gray.800" rounded="md" borderWidth="1px" borderColor="gray.700">
            <Text color="gray.300">No orders yet. Explore the menu and place your first order!</Text>
          </Box>
        )}

        <Accordion defaultIndex={[0]} allowMultiple>
          {(orders || []).map((order, index) => (
            <AccordionItem key={index}>
              <h2>
                <AccordionButton>
                  <Box flex="2" textAlign="left">
                    <Text flex="1" fontSize="xl" color="gray.200">
                      Order = <Text as="span" fontWeight="bold">{order.orderNum}</Text>
                    </Text>
                    <Text flex="1" color="gray.400">{new Date(order.orderTime).toLocaleString()}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Box p={4} bg="gray.800" rounded="md" borderWidth="1px" borderColor="gray.700">
                  <HStack justify="space-between" mb={2}>
                    <Text>Order Id: <Text as="span" fontFamily="mono">{order.id}</Text></Text>
                    <IconButton aria-label="Copy Order Id" size="sm" onClick={() => navigator.clipboard?.writeText(String(order.id || ''))}>📋</IconButton>
                  </HStack>
                  <Divider borderColor="gray.700" mb={3} />
                  <Text fontWeight="semibold" mb={1}>Amount: ₹{order.amount}</Text>
                  {(() => {
                    const items = (order.orders || []).filter(i => (i?.count || 0) > 0);
                    const namesLine = items.map(i => `${i.itemName} x ${i.count}`).join(', ');
                    const costLine = items.map(i => `${i.itemName} ₹${i.cost * i.count} for ${i.count}`).join(', ');
                    return (
                      <Box mt={2} color="gray.200">
                        <Text>No.of Items = {items.length}</Text>
                        <Text>Item Names: {namesLine || '—'}</Text>
                        <Text>Cost: {costLine || '—'}</Text>
                      </Box>
                    );
                  })()}
                </Box>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        <AlertDialog isOpen={isClearOpen} leastDestructiveRef={cancelRef} onClose={onClearClose}>
          <AlertDialogOverlay>
            <AlertDialogContent bg="gray.900" color="gray.100">
              <AlertDialogHeader>Clear order history?</AlertDialogHeader>
              <AlertDialogBody>
                This will delete all your orders permanently. This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClearClose} mr={3}>Cancel</Button>
                <Button colorScheme="red" onClick={clearHistory}>Clear</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

      </VStack>
    </>
  );
}
