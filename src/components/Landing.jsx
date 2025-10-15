import {
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
  Box,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';

export default function Landing() {
  useEffect(() => {
    document.title = 'ScanToEat';
  });

  return (
    <Box position="relative" minH={'100vh'}>
      {/* Full-page background video */}
      <Box position="absolute" inset={0} zIndex={0} overflow="hidden">
        <video
          src="https://webfiles.amrita.edu/2025/02/amrita-vishwa-vidyapeetham-chennaicampus-banner.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Optional dark overlay for text readability */}
        <Box position="absolute" inset={0} bg="blackAlpha.600" />
      </Box>

      {/* Foreground content */}
      <Flex position="relative" zIndex={1} p={8} align={'center'} justify={'flex-start'} minH={'100vh'}>
        <Stack spacing={6} w={'full'} maxW={'lg'} ml={{ base: 0, md: 4 }}>
          <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
            <Text
              as={'span'}
              position={'relative'}
              _after={{
                content: "''",
                width: 'full',
                height: useBreakpointValue({ base: '20%', md: '30%' }),
                position: 'absolute',
                bottom: 1,
                left: 0,
                bg: 'blue.400',
                zIndex: -1,
              }}
            >
              Smart Canteen
            </Text>
            <br />{' '}
            <Text color={'blue.400'} as={'span'}>
              for colleges
            </Text>{' '}
          </Heading>
          <Text fontSize={{ base: 'md', lg: 'lg' }} color={'gray.200'}>
            Students & Facultys Canteen App Amritha vidya peetham  Chennai .
          </Text>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <Button
              rounded={'full'}
              bg={'blue.400'}
              color={'white'}
              _hover={{
                bg: 'blue.500',
              }}
            >
              <Link to={'/auth'}>Create Account</Link>
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </Box>
  );
}
