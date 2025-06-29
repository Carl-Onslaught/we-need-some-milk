import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Image,
  Spinner,
  Container,
  Card,
  CardBody,
} from '@chakra-ui/react';
import AgentLayout from '../../components/AgentLayout';
import axios from 'axios';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await axios.get('/api/payment/methods');
        setMethods(res.data || []);
      } catch (err) {
        setMethods([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  return (
    <AgentLayout>
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg" color="white" textAlign="center" w="100%" mx="auto">Mode of Payment</Heading>
          {loading ? (
            <Box textAlign="center" py={8}><Spinner size="lg" color="#FDB137" /></Box>
          ) : methods.filter(method => method.accountName || method.accountNumber || method.qr || method.details).length === 0 ? (
            <Box textAlign="center" py={8} color="gray.400">No payment methods available.</Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} minChildWidth="400px">
              {methods.filter(method => method.accountName || method.accountNumber || method.qr || method.details).map((method, idx) => (
                <Card
                  key={idx}
                  bg="#1E2528"
                  borderColor="gray.700"
                  borderWidth="1px"
                  _hover={{
                    borderColor: '#FDB137',
                    boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
                  }}
                  transition="all 0.3s"
                  minW="400px"
                  maxW="500px"
                  w="100%"
                  p={8}
                  m="auto"
                >
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      {method.accountName && (
                        <Text color="white" fontSize="xl">
                          <b>Account Name:</b> {method.accountName}
                        </Text>
                      )}
                      {method.accountNumber && (
                        <Text color="white" fontSize="xl">
                          <b>Account Number:</b> {method.accountNumber}
                        </Text>
                      )}
                      {method.qr && (
                        <Box
                          textAlign="center"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          w="100%"
                          my={2}
                        >
                          <Image
                            src={method.qr}
                            alt="QR Code"
                            boxSize="300px"
                            borderRadius="16px"
                            background="#fff"
                            p={3}
                            boxShadow="0 4px 16px rgba(0,0,0,0.15)"
                            mx="auto"
                            objectFit="contain"
                          />
                        </Box>
                      )}
                      {method.details && null}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </AgentLayout>
  );
} 