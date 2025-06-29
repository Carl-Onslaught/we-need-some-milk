import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaUser, FaMoneyBill, FaCalendar, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

export default function LoadSharedCapital() {
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [packageType, setPackageType] = useState('1');
  const [loading, setLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchTotalPoints();
    fetchHistory();
  }, []);

  const fetchTotalPoints = async () => {
    const res = await axios.get('/api/admin/load-capital/total-sent');
    setTotalPoints(res.data.totalSent || 0);
  };

  const fetchHistory = async () => {
    const res = await axios.get('/api/admin/shared-capital/history');
    setHistory(res.data.transactions || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/admin/shared/load', {
        username,
        amount: parseFloat(amount),
        packageType: parseInt(packageType)
      });

      toast({
        title: 'Success',
        description: 'Shared capital loaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setUsername('');
      setAmount('');
      setPackageType('1');
      await fetchTotalPoints();
      await fetchHistory();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load shared capital',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPackageDetails = (type) => {
    switch (type) {
      case '1':
        return { duration: '12 Days', income: '20% total (≈1.67% daily)' };
      case '2':
        return { duration: '20 Days', income: '50% total (2.5% daily)' };
      default:
        return { duration: 'N/A', income: 'N/A' };
    }
  };

  const selectedPackage = getPackageDetails(packageType);

  return (
    <AdminLayout>
      <Flex minH="100vh" direction="column" align="center" justify="flex-start" bg="transparent">
        <Box w="100%" maxW="420px" mb={8} display="flex" justifyContent="center">
          <Box p={4} bg="#181E20" borderRadius="lg" boxShadow="md" w="100%">
            <Text color="#FDB137" fontWeight="bold" fontSize="lg">Total Points Sent</Text>
            <Text color="white" fontSize="2xl" fontWeight="bold">{totalPoints.toLocaleString()} points</Text>
          </Box>
        </Box>
        <Box
          w="100%"
          maxW="420px"
          p={{ base: 6, md: 10 }}
          bg="#242C2E"
          borderRadius="2xl"
          boxShadow="0 8px 32px rgba(0,0,0,0.25)"
          borderWidth="1px"
          borderColor="#181E20"
        >
          <VStack spacing={8} align="stretch">
            <Box mb={2}>
              <Heading size="lg" color="white" mb={1}>
                Load Shared Capital
              </Heading>
              <Text color="#E0E0E0" fontSize="md">
                Load shared capital points to agent accounts
              </Text>
            </Box>
            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                <FormControl>
                  <FormLabel color="#E0E0E0">Username</FormLabel>
                  <Input
                    placeholder="Enter agent username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    bg="#242C2E"
                    borderColor="#181E20"
                    color="white"
                    _hover={{ borderColor: "#FDB137" }}
                    _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #FDB137" }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="#E0E0E0">Amount (Points)</FormLabel>
                  <Input
                    placeholder="Enter amount (minimum 100 points)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    bg="#242C2E"
                    borderColor="#181E20"
                    color="white"
                    _hover={{ borderColor: "#FDB137" }}
                    _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #FDB137" }}
                  />
                </FormControl>
                <Button
                  type="submit"
                  bg="#FDB137"
                  color="#181E20"
                  boxShadow="0 2px 8px rgba(0,0,0,0.12)"
                  _hover={{
                    bg: "#BD5301",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                    transform: "translateY(-2px)"
                  }}
                  size="lg"
                  fontWeight="bold"
                  isLoading={loading}
                  w="100%"
                  mt={2}
                >
                  Load Capital
                </Button>
              </VStack>
            </form>
            <Box mt={10}>
              <Heading size="md" mb={4} color="white">Load Shared Capital History</Heading>
              <Box bg="#181E20" borderRadius="lg" p={4}>
                <SimpleGrid columns={4} spacing={4} mb={2} fontWeight="bold" color="#FDB137">
                  <Text>Date</Text>
                  <Text>Agent</Text>
                  <Text>Amount</Text>
                  <Text>Description</Text>
                </SimpleGrid>
                {history.length === 0 ? (
                  <Text color="gray.400">No history found.</Text>
                ) : (
                  history.map(tx => (
                    <SimpleGrid columns={4} spacing={4} key={tx._id} py={2} borderBottom="1px solid #23282D">
                      <Text color="white">{new Date(tx.createdAt).toLocaleString()}</Text>
                      <Text color="white">{tx.user?.username || 'Unknown'}</Text>
                      <Text color="white">₱{tx.amount.toLocaleString()}</Text>
                      <Text color="white">{tx.description}</Text>
                    </SimpleGrid>
                  ))
                )}
              </Box>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </AdminLayout>
  );
}
