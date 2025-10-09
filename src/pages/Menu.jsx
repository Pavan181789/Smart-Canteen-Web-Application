import React, { useState, useLayoutEffect, useEffect } from 'react';
import Nav from '../components/Navbar';
import ProfileNavBtn from '../components/buttons/ProfileNavBtn';
import { Box, Text, SimpleGrid, VStack, HStack, Button } from '@chakra-ui/react';
import { db } from '../firebase';
import { getDocs, collection, getDoc, doc } from 'firebase/firestore';
import {
  menu as menuAtom,
  totalAmt as totalAmtAtom,
  cart as cartAtom,
  wallet as walletAtom,
} from '../atoms';
import { useRecoilState } from 'recoil';
import MenuCard from '../components/MenuCard';
import { UserAuth } from '../context/AuthContext';

// Define the menu sections and their timings
const MENU_SECTIONS = {
  Tiffin: '8:00 AM - 12:00 PM',
  Lunch: '12:00 PM - 17:00 PM',
  Snacks: '17:00 PM - 19:00 PM',
  Dinner: '19:00 PM - 21:00 PM',
  'Ice Cream': 'All Day',
  Juices: 'All Day',

};

export default function Profile() {
  const [sWidth, setSWidth] = useState(document.body.clientWidth);
  const [menu, setMenu] = useRecoilState(menuAtom);
  const [, setTotalAmt] = useRecoilState(totalAmtAtom); // Removed unused totalAmt
  const [, setWallet] = useRecoilState(walletAtom); // Removed unused wallet
  const [, setCart] = useRecoilState(cartAtom); // Removed unused cart
  const { user } = UserAuth();

  // State to manage the selected category
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(MENU_SECTIONS)[0]);
  // Veg mode: 'all' | 'veg' | 'nonveg'
  const [vegMode, setVegMode] = useState('all');

  // Handle resizing for responsive UI
  useLayoutEffect(() => {
    function updateSize() {
      setSWidth(document.body.clientWidth);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
  }, []);

  // Set document title
  useEffect(() => {
    document.title = 'Your Menu';
  }, []);

  // Listen for chatbot events to sync UI (section and veg mode)
  useEffect(() => {
    function onSection(e) {
      const section = e?.detail;
      if (section && MENU_SECTIONS[section]) setSelectedCategory(section);
    }
    function onVeg(e) {
      const mode = e?.detail;
      if (mode === 'veg' || mode === 'nonveg' || mode === 'all') setVegMode(mode);
      // default to 'veg'/'nonveg' if provided, otherwise ignore
    }
    window.addEventListener('setMenuSection', onSection);
    window.addEventListener('setVegMode', onVeg);
    return () => {
      window.removeEventListener('setMenuSection', onSection);
      window.removeEventListener('setVegMode', onVeg);
    };
  }, []);

  // Fetch menu items from Firestore and set the menu state
  useEffect(() => {
    getDocs(collection(db, 'menu'))
      .then((data) => {
        const getMenu = [];
        data.forEach((doc) =>
          getMenu.push({
            id: doc.id,
            itemName: doc.get('itemName'),
            cost: doc.get('cost'),
            thumbnail: doc.get('thumbnail'),
            category: doc.get('category'),
            count: 0,
          })
        );
        setMenu(getMenu);
      })
      .catch((err) => console.error('Error fetching menu:', err));
  }, [setMenu]); // Added setMenu as dependency

  // Fetch the user's wallet details (guard until user is ready)
  useEffect(() => {
    async function fetchWallet() {
      try {
        if (!user?.uid) return; // guard
        const userData = await getDoc(doc(db, 'users', user.uid));
        const walletAmount = userData.get('wallet');
        setWallet(walletAmount ?? 0);
      } catch (err) {
        console.error('Failed to fetch wallet:', err);
      }
    }

    fetchWallet();
  }, [user?.uid, setWallet]); // depend on uid

  // Increment the cart count and update state
  function incrementCart(id) {
    const newMenu = menu.map((obj) => {
      if (obj.id === id) {
        if (obj.count === 0) setCart((cart) => [...cart, obj]);
        setTotalAmt((amt) => amt + obj.cost);
        return { ...obj, count: obj.count + 1 };
      }
      return obj;
    });

    setMenu(newMenu);
  }

  // Decrement the cart count and update state
  function decrementCart(id) {
    const newMenu = menu.map((obj) => {
      if (obj.id === id && obj.count > 0) {
        setCart((cart) => cart.filter((item) => item.id !== obj.id));
        setTotalAmt((amt) => amt - obj.cost);
        return { ...obj, count: obj.count - 1 };
      }
      return obj;
    });
    setMenu(newMenu);
  }

  return (
    <>
      <Nav
        title={`Welcome, ${user?.displayName || 'Guest'}`}
        navBtn={<ProfileNavBtn />}
        hasCheckout
      />
      <Box borderBottom="2px" borderBottomColor="gray.700">
        <Text fontSize="3xl" m={4}>
          Menu ({menu.length})
        </Text>
      </Box>

      {/* Veg / Non-veg Toggle */}
      <HStack spacing={4} justify="center" marginTop={6}>
        <Button size="md" colorScheme={vegMode === 'all' ? 'teal' : 'gray'} onClick={() => setVegMode('all')}>All</Button>
        <Button size="md" colorScheme={vegMode === 'veg' ? 'teal' : 'gray'} onClick={() => setVegMode('veg')}>Veg</Button>
        <Button size="md" colorScheme={vegMode === 'nonveg' ? 'teal' : 'gray'} onClick={() => setVegMode('nonveg')}>Non-veg</Button>
      </HStack>

      {/* Render the section selector */}
      <HStack spacing={4} justify="center" marginY={6}>
        {Object.keys(MENU_SECTIONS).map((section) => (
          <Button
            key={section}
            onClick={() => setSelectedCategory(section)}
            colorScheme={selectedCategory === section ? 'teal' : 'gray'}
            size="lg"
          >
            {section}
          </Button>
        ))}
      </HStack>

      {/* Dynamically render the selected menu section */}
      <VStack align="start" spacing={4} m={5}>
        <Text fontSize="2xl" fontWeight="bold">
          {selectedCategory} ({MENU_SECTIONS[selectedCategory]})
        </Text>
        <SimpleGrid
          columns={sWidth >= 768 ? (sWidth >= 1024 ? 3 : 2) : 1}
          spacing={6}
          w="100%"
        >
          {menu
            .filter((item) => item.category === selectedCategory)
            .filter((item) => {
              if (vegMode === 'all') return true;
              const name = (item.itemName || '').toLowerCase();
              const isNonVeg = /(chicken|mutton|fish|egg|beef|prawn|shrimp)/i.test(name);
              const tag = item.veg ? String(item.veg).toLowerCase() : (isNonVeg ? 'nonveg' : 'veg');
              return vegMode === 'veg' ? tag === 'veg' : tag === 'nonveg';
            })
            .map((item, index) => (
              <MenuCard
                key={index}
                item={item}
                forCart
                incrementCart={incrementCart}
                decrementCart={decrementCart}
              />
            ))}
        </SimpleGrid>
      </VStack>
    </>
  );
}