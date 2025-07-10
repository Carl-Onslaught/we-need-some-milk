import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Heading,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import axios from 'axios';
import { DeleteIcon } from '@chakra-ui/icons';

const LoadSharedCapital = () => {
  const [formData, setFormData] = useState({
    username: '',
    amount: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalSent, setTotalSent] = useState(null);
  const [history, setHistory] = useState([]);
  const toast = useToast();

  useEffect(() => {
    // Fetch total sent points
    const fetchTotalSent = async () => {
      try {
        const res = await axios.get('/admin/load-capital/total-sent');
        setTotalSent(res.data.totalSent);
      } catch (err) {
        setTotalSent('Error');
      }
    };
    fetchTotalSent();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/admin/shared-capital/history');
      setHistory(res.data.transactions || []);
    } catch (err) {
      setHistory([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.username.trim()) {
        throw new Error('Username is required');
      }
      if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) < 100) {
        throw new Error('Amount must be at least 100 points');
      }

      // Make API request
      await axios.post('/admin/load-capital', {
        username: formData.username,
        amount: parseFloat(formData.amount)
      });

      // Show success message
      toast({
        title: 'Success',
        description: 'Shared capital loaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        username: '',
        amount: '',
      });

      await fetchHistory();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to load shared capital');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async (txId) => {
    try {
      await axios.post(`/admin/shared-capital/revert/${txId}`);
      toast({
        title: 'Reverted',
        description: 'Load reverted and agent wallet updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await fetchHistory();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to revert load',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Only show non-reverted transactions
  const visibleHistory = history.filter(tx => tx.status !== 'failed');

  return (
    <Flex minH="100vh" direction="column" align="center" justify="flex-start" bg="transparent" px={2} position="relative">
      {/* Stats text at top right */}
      <Box position="absolute" top={6} right={8} zIndex={1} textAlign="right">
        <Text color="#FDB137" fontWeight="extrabold" fontSize="2xl">Total Points Sent</Text>
        <Text color="white" fontSize="xl" fontWeight="bold">
          {totalSent === null ? 'Loading...' : totalSent === 'Error' ? 'Error' : totalSent.toLocaleString() + ' points'}
        </Text>
      </Box>
      {/* Main form box */}
      <Box
        w="100%"
        maxW="420px"
        p={{ base: 6, md: 10 }}
        bg="#242C2E"
        borderRadius="2xl"
        boxShadow="lg"
        borderWidth="1px"
        borderColor="#181E20"
        display="flex"
        flexDirection="column"
        alignItems="center"
        mt={40}
        mb={10}
      >
        <VStack spacing={8} align="stretch" w="100%">
          <Box mb={2} textAlign="center">
            <Heading size="lg" color="white" mb={1}>
              Load Shared Capital
            </Heading>
            <Text color="#E0E0E0" fontSize="md">
              Load shared capital points to agent accounts
            </Text>
          </Box>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={5} align="stretch">
              <FormControl>
                <FormLabel color="#E0E0E0">Username</FormLabel>
                <Input
                  placeholder="Enter agent username"
                  value={formData.username}
                  onChange={handleChange}
                  name="username"
                  bg="#181E20"
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
                  value={formData.amount}
                  onChange={handleChange}
                  name="amount"
                  type="number"
                  bg="#181E20"
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
                isLoading={isLoading}
                w="100%"
                mt={2}
              >
                Load Capital
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
      {/* History section in its own container below the form */}
      <Box w="100%" maxW="1000px" bg="#242C2E" borderRadius="2xl" boxShadow="lg" p={6} mt={8} alignSelf="center">
        <Heading size="md" mb={4} color="white" textAlign="center">Load Shared Capital History</Heading>
        <Table variant="simple" colorScheme="gray" width="100%">
          <Thead>
            <Tr>
              <Th color="white" fontWeight="bold">Date</Th>
              <Th color="white" fontWeight="bold">Agent</Th>
              <Th color="white" fontWeight="bold">Amount</Th>
              <Th color="white" fontWeight="bold">Description</Th>
              <Th color="white" fontWeight="bold" textAlign="center">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {visibleHistory.length === 0 ? (
              <Tr>
                <Td colSpan={5} color="gray.400" textAlign="center">No history found.</Td>
              </Tr>
            ) : (
              visibleHistory.map((tx) => (
                <Tr key={tx._id} _hover={{ bg: '#23282D' }}>
                  <Td color="white">{new Date(tx.createdAt).toLocaleString()}</Td>
                  <Td color="white">{tx.user?.username || 'Unknown'}</Td>
                  <Td color="white">₱{tx.amount.toLocaleString()}</Td>
                  <Td color="white">{tx.description}</Td>
                  <Td textAlign="center">
                    <Button size="sm" colorScheme="red" leftIcon={<DeleteIcon />} onClick={() => handleRevert(tx._id)}>
                      Revert
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

export default LoadSharedCapital; 