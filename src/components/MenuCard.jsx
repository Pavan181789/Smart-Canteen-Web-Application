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
    <Box key={item.id} bg="blue.800" h="100%" rounded="10px" overflow="hidden">
      <HStack align="stretch" spacing={[2, 3]} p={[2, 3]}>
        <Image
          src={item.thumbnail}
          borderRadius="8px"
          boxSize={["72px", "96px", "120px"]}
          minW={["72px", "96px", "120px"]}
          objectFit="cover"
          cursor={onInfoClick ? 'pointer' : 'default'}
          onClick={onInfoClick ? () => onInfoClick(item) : undefined}
          alt={item.itemName}
        />
        <VStack alignItems="start" spacing={[1, 2]} w="full">
          <HStack w="full" justifyContent="space-between" alignItems="start">
            <Text fontSize={["md", "lg", "xl"]} color="white" fontWeight="bold" noOfLines={2}>
              {item.itemName}
            </Text>
            <Badge colorScheme={isVeg ? 'green' : 'red'} rounded="full" px={[2, 2]} py={[0.5, 0.5]} fontSize={["0.6rem", "0.7rem"]}>
              {isVeg ? 'Veg' : 'Non-veg'}
            </Badge>
          </HStack>
          <Text
            fontSize={["sm", "md", "lg"]}
            color="gray.300"
            fontWeight="semibold"
            align="left"
          >
            ₹{item.cost}.00
          </Text>
        </VStack>
        {forCart ? (
          <VStack align="center" justify="center" pr={[1, 2]} spacing={[1, 2]}>
            <IconButton
              onClick={() => incrementCart(item.id)}
              size={["xs", "sm"]}
              icon={<FaPlus />}
              aria-label="Add"
            />
            <Text fontSize={["sm", "md"]}>{item.count}</Text>
            <IconButton
              onClick={() => decrementCart(item.id)}
              size={["xs", "sm"]}
              icon={<FaMinus />}
              aria-label="Remove"
            />
          </VStack>
        ) : null}
      </HStack>
    </Box>
  );
}
