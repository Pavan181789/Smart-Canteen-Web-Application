import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Text,
  Image,
  VStack,
  HStack,
  Button,
  Spinner,
  List,
  ListItem,
  Divider,
} from '@chakra-ui/react';
import aiService from '../services/aiService';

export default function FoodInfoModal({ isOpen, onClose, itemName, thumbnail }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null); // { ok, data | text }

  useEffect(() => {
    async function load() {
      if (!isOpen || !itemName) return;
      setLoading(true);
      setError('');
      setInfo(null);
      try {
        const res = await aiService.getFoodInfo(itemName);
        setInfo(res);
      } catch (e) {
        setError(e?.message || 'Failed to load info');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isOpen, itemName]);

  const renderContent = () => {
    if (loading) return (<HStack><Spinner /><Text>Fetching details...</Text></HStack>);
    if (error) return (<Text color="red.300">{error}</Text>);
    if (!info) return null;

    if (info.ok && info.data) {
      const d = info.data;
      return (
        <VStack align="stretch" spacing={3}>
          <HStack align="start" spacing={4}>
            {thumbnail ? <Image src={thumbnail} boxSize="80px" rounded="md" alt={itemName} /> : null}
            <Box>
              <Text fontWeight="bold" fontSize="lg">{d.name || itemName}</Text>
              <Text color="gray.300">{d.description}</Text>
            </Box>
          </HStack>

          <Divider />

          <Box>
            <Text fontWeight="semibold" mb={1}>Ingredients</Text>
            <List spacing={1} styleType="disc" pl={5}>
              {(d.ingredients || []).map((ing, i) => (
                <ListItem key={i}>{ing}</ListItem>
              ))}
            </List>
          </Box>

          <Box>
            <Text fontWeight="semibold" mb={1}>Nutrition (per 100g)</Text>
            <VStack align="start" spacing={1} color="gray.200">
              <Text>Calories: {d.macros_per_100g?.calories_kcal ?? '—'} kcal</Text>
              <Text>Protein: {d.macros_per_100g?.protein_g ?? '—'} g</Text>
              <Text>Carbs: {d.macros_per_100g?.carbs_g ?? '—'} g</Text>
              <Text>Fat: {d.macros_per_100g?.fat_g ?? '—'} g</Text>
              <Text>Fiber: {d.macros_per_100g?.fiber_g ?? '—'} g</Text>
              <Text>Sugar: {d.macros_per_100g?.sugar_g ?? '—'} g</Text>
            </VStack>
            {d.typical_serving_g ? (
              <Text mt={2} color="gray.300">Typical serving: {d.typical_serving_g} g</Text>
            ) : null}
          </Box>

          <Box>
            <Text fontWeight="semibold" mb={1}>Benefits</Text>
            <List spacing={1} styleType="disc" pl={5}>
              {(d.benefits || []).map((b, i) => (
                <ListItem key={i}>{b}</ListItem>
              ))}
            </List>
          </Box>

          <Box>
            <Text fontWeight="semibold" mb={1}>Cautions</Text>
            <List spacing={1} styleType="disc" pl={5}>
              {(d.cautions || []).map((c, i) => (
                <ListItem key={i}>{c}</ListItem>
              ))}
            </List>
          </Box>
        </VStack>
      );
    }

    // Fallback plain text
    return (
      <VStack align="stretch" spacing={3}>
        {thumbnail ? <Image src={thumbnail} boxSize="80px" rounded="md" alt={itemName} /> : null}
        <Text whiteSpace="pre-wrap">{info.text}</Text>
      </VStack>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg="gray.900" color="gray.100">
        <ModalHeader>About {itemName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {renderContent()}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
