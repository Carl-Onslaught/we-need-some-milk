import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  Button,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Select,
  Divider,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import AgentLayout from '../../components/AgentLayout';
import { FaUsers, FaChartLine, FaWallet } from 'react-icons/fa';
import { BASE_URL } from '../../config';

export default function Withdraw() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [source, setSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaimingPackages, setIsClaimingPackages] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({
    wallet: 0,
    directReferral: 0,
    indirectReferral: 0,
    totalClicks: 0,
    sharedEarnings: 0,
    pendingEarnings: 0,
    immaturePackages: 0,
    immatureAmount: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchWithdrawals();
    fetchStats();

    // Connect to WebSocket server with improved reconnection logic
    const socket = io(BASE_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity, // Keep trying to reconnect forever
      reconnectionDelay: 1000, // Start with 1 second delay
      reconnectionDelayMax: 5000, // Maximum 5 seconds delay between attempts
      timeout: 60000,
      autoConnect: true,
      forceNew: true,
      path: '/socket.io/',
      withCredentials: true
    });

    // Handle connection state
    socket.on('connect', () => {
      console.log('WebSocket connected with ID:', socket.id);
      setIsConnected(true);
      // Fetch initial data
      fetchStats();
      fetchWithdrawals();
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected. Attempting to reconnect...');
      setIsConnected(false);
      
      // If the disconnection wasn't initiated by the client, try to reconnect
      if (reason !== 'io client disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.log('WebSocket connection error:', error);
      // Will automatically try to reconnect
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      // Refresh data after reconnection
      fetchStats();
      fetchWithdrawals();
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Attempting to reconnect... (attempt', attemptNumber, ')');
    });

    socket.on('reconnect_error', (error) => {
      console.log('WebSocket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.log('WebSocket reconnection failed');
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to server. Please refresh the page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });

    // Listen for withdrawal status updates
    socket.on('withdrawal_status_update', (data) => {
      console.log('Received withdrawal update:', data);
      if (data.agentId === user._id) {
        console.log('Updating balances:', data.updatedBalances);
        // Update stats with the new balances
        setStats(prev => ({
          ...prev,
          wallet: data.updatedBalances.wallet || 0,
          directReferral: data.updatedBalances.referralEarnings?.direct || 0,
          indirectReferral: data.updatedBalances.referralEarnings?.indirect || 0,
          totalClicks: data.updatedBalances.clickEarnings || 0
        }));
        
        // Refresh withdrawals list and stats
        fetchWithdrawals();
        fetchStats();
        
        toast({
          title: 'Withdrawal Status Updated',
          description: `Your withdrawal has been ${data.status}. Your balance has been updated.`,
          status: data.status === 'rejected' ? 'info' : 'success',
          duration: 5000,
        });
      }
    });

    // Listen for earnings updates
    socket.on('earnings_update', (data) => {
      console.log('Received earnings update:', data);
      if (data.agentId === user._id) {
        console.log('Updating earnings:', data.earnings);
        setStats(prev => ({
          ...prev,
          directReferral: Number(data.earnings.directReferral || 0),
          indirectReferral: Number(data.earnings.indirectReferral || 0),
          totalClicks: Number(parseFloat(data.earnings.totalClicks || 0).toFixed(2)),
          sharedEarnings: Number(data.earnings.sharedEarnings || 0)
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user._id]);

  const fetchWithdrawals = async () => {
    try {
      const { data } = await axios.get('/api/agent/withdrawals');
      setWithdrawals(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch withdrawal history',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/agent/earnings');
      console.log('Updated stats:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error fetching stats',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    console.log('Form submitted with values:', { amount, method, accountNumber, accountName, source });

    if (!amount || !method || !accountNumber || !accountName || !source) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (parseFloat(amount) < 100) {
      toast({
        title: 'Error',
        description: 'Minimum withdrawal amount is ₱100',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Check balance based on source
    let sourceBalance = 0;
    if (source === 'direct_indirect') {
      sourceBalance = stats.directReferral + stats.indirectReferral;
    } else if (source === 'click_earnings') {
      sourceBalance = stats.totalClicks;
    } else if (source === 'shared_capital') {
      sourceBalance = stats.sharedEarnings;
    }

    if (parseFloat(amount) > sourceBalance) {
      toast({
        title: 'Error',
        description: 'Insufficient balance for selected source',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Source type is already correct, no need to map

      try {
        console.log('Sending withdrawal request with:', {
          amount: parseFloat(amount),
          method,
          accountNumber,
          accountName,
          source
        });
        
        const response = await axios.post('/api/agent/withdraw', {
          amount: parseFloat(amount),
          method,
          accountNumber,
          accountName,
          source
        });
        
        console.log('Server response:', response.data);
      } catch (error) {
        console.error('Server error:', error.response?.data || error.message);
        throw error;
      }

      toast({
        title: 'Withdrawal Request Submitted',
        description: `Your withdrawal request for ₱${amount} has been submitted and is pending admin approval.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh data
      await fetchWithdrawals();
      await fetchStats();

      // Reset form and refresh data
      setAmount('');
      setMethod('');
      setAccountNumber('');
      setAccountName('');
      setSource('');
      fetchWithdrawals();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit withdrawal request',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimPackages = async () => {
    try {
      setIsClaimingPackages(true);
      const response = await axios.post('/api/agent/claim-packages');
      
      toast({
        title: 'Success',
        description: `Successfully claimed ₱${response.data.amount.toLocaleString()} from matured packages`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh stats
      await fetchStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to claim packages',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsClaimingPackages(false);
    }
  };

  return (
    <AgentLayout>
      <Box>
        {/* Balance Card */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Card 
            bg="#1E2528" 
            borderWidth="1px" 
            borderColor="gray.700" 
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ 
              transform: 'translateY(-2px)',
              borderColor: '#FDB137',
              boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
            }}
          >
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text color="gray.400">Referral Earnings</Text>
                <Heading size="lg" color="white">
                  ₱{(stats.directReferral + stats.indirectReferral).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </Heading>
              </VStack>
            </CardBody>
          </Card>
          <Card 
            bg="#1E2528" 
            borderWidth="1px" 
            borderColor="gray.700" 
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ 
              transform: 'translateY(-2px)',
              borderColor: '#FDB137',
              boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
            }}
          >
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text color="gray.400">Click Earnings</Text>
                <Heading size="lg" color="white">
                  ₱{stats.totalClicks.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </Heading>
              </VStack>
            </CardBody>
          </Card>
          <Card 
            bg="#1E2528" 
            borderWidth="1px" 
            borderColor="gray.700" 
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ 
              transform: 'translateY(-2px)',
              borderColor: '#FDB137',
              boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
            }}
          >
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text color="gray.400">Shared Capital Earnings</Text>
                <Heading size="lg" color="white">
                  ₱{stats.sharedEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </Heading>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Pending Matured Packages */}
        {stats.pendingEarnings > 0 && (
          <Card 
            bg="#1E2528" 
            borderWidth="1px"
            borderColor="gray.700"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ 
              transform: 'translateY(-2px)',
              borderColor: '#FDB137',
              boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
            }}
            mb={8}
          >
            <CardBody>
              <VStack align="start" spacing={4}>
                <Box>
                  <Text color="gray.400" mb={2}>Pending Matured Packages</Text>
                  <Heading size="lg" color="white">
                    ₱{stats.pendingEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </Heading>
                </Box>
                <Button
                  onClick={handleClaimPackages}
                  bg="#FDB137"
                  color="#181E20"
                  isLoading={isClaimingPackages}
                  loadingText="Claiming"
                  w="full"
                  _hover={{
                    transform: 'scale(0.95)',
                    bg: '#BD5301',
                  }}
                  transition="all 0.2s"
                >
                  Claim Matured Packages
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Withdrawal Form */}
        <Card 
          bg="#1E2528" 
          borderWidth="1px"
          borderColor="gray.700"
          boxShadow="lg"
          transition="all 0.3s"
          _hover={{ 
            transform: 'translateY(-2px)',
            borderColor: '#FDB137',
            boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
          }}
          mb={8}
        >
          <CardBody>
            <VStack spacing={6} as="form" onSubmit={handleWithdraw}>
              <Heading size="md" color="white">Withdraw Funds</Heading>
              
              <FormControl isRequired>
                <FormLabel color="white">Amount</FormLabel>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={100}
                  bg="#181E20"
                  color="gray.400"
                  borderColor="gray.700"
                  _hover={{ borderColor: '#FDB137' }}
                  _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white">Payment Method</FormLabel>
                <Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder="Select payment method"
                  bg="#181E20"
                  color="gray.400"
                  borderColor="gray.700"
                  _hover={{ borderColor: '#FDB137' }}
                  _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  _placeholder={{ color: "gray.400" }}
                >
                  <option value="gcash" style={{ background: '#181E20', color: 'gray.400' }}>GCash</option>
                  <option value="gotyme" style={{ background: '#181E20', color: 'gray.400' }}>GoTyme Bank</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white">Account Number</FormLabel>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  bg="#181E20"
                  color="gray.400"
                  borderColor="gray.700"
                  _hover={{ borderColor: '#FDB137' }}
                  _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white">Account Name</FormLabel>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter account name"
                  bg="#181E20"
                  color="gray.400"
                  borderColor="gray.700"
                  _hover={{ borderColor: '#FDB137' }}
                  _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white">Source of Funds</FormLabel>
                <Select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Select source"
                  bg="#181E20"
                  color="gray.400"
                  borderColor="gray.700"
                  _hover={{ borderColor: '#FDB137' }}
                  _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
                  _placeholder={{ color: "gray.400" }}
                >
                  <option value="direct_indirect" style={{ background: '#181E20', color: 'gray.400' }}>
                    Referral Earnings (₱{(stats.directReferral + stats.indirectReferral).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                  </option>
                  <option value="click_earnings" style={{ background: '#181E20', color: 'gray.400' }}>
                    Click Earnings (₱{stats.totalClicks.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                  </option>
                  <option value="shared_capital" style={{ background: '#181E20', color: 'gray.400' }}>
                    Shared Capital Earnings (₱{stats.sharedEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                  </option>
                </Select>
              </FormControl>

              <Button
                type="submit"
                bg="#FDB137"
                color="#181E20"
                isLoading={isSubmitting}
                loadingText="Processing"
                w="full"
                _hover={{
                  transform: 'scale(0.95)',
                  bg: '#BD5301',
                }}
                transition="all 0.2s"
              >
                Submit Withdrawal
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Withdrawal History */}
        <Card 
          bg="#1E2528" 
          borderWidth="1px"
          borderColor="gray.700"
          boxShadow="lg"
          transition="all 0.3s"
          _hover={{ 
            transform: 'translateY(-2px)',
            borderColor: '#FDB137',
            boxShadow: '0 0 20px rgba(253, 177, 55, 0.1)'
          }}
        >
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="white">Withdrawal History</Heading>
              <Divider borderColor="gray.700" />
              {withdrawals.length > 0 ? (
                withdrawals.map((withdrawal, index) => (
                  <Box 
                    key={index} 
                    p={4} 
                    bg="#181E20" 
                    borderRadius="md"
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateX(4px)',
                      borderColor: '#FDB137',
                    }}
                  >
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color="white">₱{withdrawal.amount.toLocaleString()}</Text>
                      <Text fontSize="sm" color="gray.400">
                        {withdrawal.method.toUpperCase()} • {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </Text>
                      <Text
                        fontSize="sm"
                        color={
                          withdrawal.status === 'completed'
                            ? 'green.400'
                            : withdrawal.status === 'pending'
                            ? '#FDB137'
                            : 'red.400'
                        }
                        textTransform="uppercase"
                        fontWeight="bold"
                      >
                        {withdrawal.status}
                      </Text>
                    </VStack>
                  </Box>
                ))
              ) : (
                <Text color="gray.400" textAlign="center" py={4}>
                  No withdrawal history yet
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </AgentLayout>
  );
}
