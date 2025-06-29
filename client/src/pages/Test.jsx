import { Box, Text, Container } from '@chakra-ui/react';

export default function Test() {
  return (
    <Container maxW="container.xl" py={8}>
      <Box p={8} bg="white" shadow="lg" borderRadius="lg">
        <Text fontSize="2xl" fontWeight="bold">Test Page</Text>
        <Text mt={4}>If you can see this, React is working correctly!</Text>
      </Box>
    </Container>
  );
}
