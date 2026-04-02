import React from 'react';
import { Container } from '@chakra-ui/react';

export default function LayoutContainer({ children }) {
  return (
    <Container
      maxW={{ base: '100%', md: 'container.md', lg: 'container.xl' }}
      px={{ base: 3, md: 6 }}
      py={{ base: 3, md: 6 }}
    >
      {children}
    </Container>
  );
}
