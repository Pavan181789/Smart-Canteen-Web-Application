import React from 'react';
import { Box, Text, HStack, Image, VStack, IconButton, Badge } from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';

export default function MenuCard({
  item,
  forCart,
  incrementCart,
  decrementCart,
  onInfoClick,
}) {
  // Determine Veg / Non-veg label (fallback to name-based heuristic)
  const name = (item?.itemName || '').toLowerCase();
  const nonVegHint = /(chicken|mutton|fish|egg|beef|prawn|prawns|shrimp|meat)/i.test(name);
  const tag = item?.veg ? String(item.veg).toLowerCase() : (nonVegHint ? 'nonveg' : 'veg');
  const isVeg = tag === 'veg';

  return (
    <Box key={item.id} bg="blue.800" h="100%" rounded="10px">
      <HStack>
        <Image
          src={item.thumbnail}
          borderLeftRadius="10px"
          boxSize="120px"
          cursor={onInfoClick ? 'pointer' : 'default'}
          onClick={onInfoClick ? () => onInfoClick(item) : undefined}
          alt={item.itemName}
        />
        <VStack alignItems="start" p="3" w="full">
          <HStack w="full" justifyContent="space-between" alignItems="start">
            <Text fontSize={['xl', '2xl']} color="white" fontWeight="bold">
              {item.itemName}
            </Text>
            <Badge colorScheme={isVeg ? 'green' : 'red'} rounded="full" px={2} py={0.5} fontSize="0.75rem">
              {isVeg ? 'Veg' : 'Non-veg'}
            </Badge>
          </HStack>
          <Text
            fontSize={['md', 'lg', 'xl']}
            color="gray.400"
            fontWeight="medium"
            align="left"
          >
            ₹{item.cost}.00
          </Text>
        </VStack>
        {forCart ? (
          <HStack align="center" pr="3">
            <IconButton
              onClick={() => incrementCart(item.id)}
              size="sm"
              icon={<FaPlus />}
            ></IconButton>
            <Text fontSize="md">{item.count}</Text>
            <IconButton
              onClick={() => decrementCart(item.id)}
              size="sm"
              icon={<FaMinus />}
            ></IconButton>
          </HStack>
        ) : null}
      </HStack>
    </Box>
  );
}
