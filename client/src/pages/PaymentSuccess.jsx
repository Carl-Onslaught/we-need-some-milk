import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import paymentService from '../services/paymentService';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const paymentId = searchParams.get('payment_id');
        
        if (!paymentId) {
          throw new Error('No payment ID found');
        }

        // Start polling for payment status
        const response = await paymentService.pollPaymentStatus(paymentId);
        setPaymentStatus(response.status);

        if (response.status === 'completed') {
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been processed successfully',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } else if (response.status === 'failed') {
          throw new Error('Payment failed');
        }
      } catch (error) {
        setError(error.message);
        toast({
          title: 'Error',
          description: error.message || 'Failed to verify payment',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/payment/failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location, navigate, toast]);

  if (loading) {
    return (
      <Container centerContent py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Verifying your payment...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container centerContent py={20}>
        <VStack spacing={8} textAlign="center">
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container centerContent py={20}>
      <VStack spacing={8} textAlign="center">
        <Box color="green.500">
          <FaCheckCircle size="64px" />
        </Box>
        <Heading>Payment Successful!</Heading>
        <Text fontSize="lg" color="gray.600">
          Thank you for your payment. Your balance will be updated shortly.
        </Text>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </VStack>
    </Container>
  );
};

export default PaymentSuccess; 