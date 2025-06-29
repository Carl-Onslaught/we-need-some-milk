import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <Container maxW="container.sm" py={10}>
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
        textAlign="center"
      >
        <VStack spacing={4}>
          <Heading size="2xl">404</Heading>
          <Heading size="lg">Page Not Found</Heading>
          <Text>
            The page you're looking for doesn't exist or has been moved.
          </Text>
          <Button as={Link} to="/" colorScheme="blue">
            Go Home
          </Button>
        </VStack>
      </Box>
    </Container>
  );
}

export default NotFound; 