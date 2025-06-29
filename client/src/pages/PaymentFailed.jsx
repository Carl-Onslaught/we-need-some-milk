import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Box,
} from '@chakra-ui/react';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <Container centerContent py={20}>
      <VStack spacing={8} textAlign="center">
        <Box color="red.500">
          <FaTimesCircle size="64px" />
        </Box>
        <Heading>Payment Failed</Heading>
        <Text fontSize="lg" color="gray.600">
          We couldn't process your payment. Please try again or contact support if the problem persists.
        </Text>
        <VStack spacing={4}>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/support')}
          >
            Contact Support
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
};

export default PaymentFailed; 