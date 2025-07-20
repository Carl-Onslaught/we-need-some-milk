import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Select,
  Flex,
  Text,
  useToast,
  Badge,
  Icon,
  HStack,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaUserPlus } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const PendingRegistrations = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('username');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  useEffect(() => {
    fetchPendingRegistrations();
  }, [currentPage]);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await axios.get('/admin/pending-registrations');
      setPendingRegistrations(response.data);
      setTotalPages(Math.ceil(response.data.length / 10));
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending registrations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleApprove = async (userId) => {
    console.log('Approving user:', userId);
    try {
      await axios.post(`/admin/registrations/${userId}/approve`);
      toast({
        title: 'Success',
        description: 'Registration approved successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchPendingRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleReject = async (userId) => {
    console.log('Rejecting user:', userId);
    try {
      await axios.post(`/admin/registrations/${userId}/reject`);
      toast({
        title: 'Success',
        description: 'Registration rejected successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchPendingRegistrations();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject registration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredRegistrations = pendingRegistrations; // filtering disabled


  const paginatedRegistrations = filteredRegistrations.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  return (
    <AdminLayout>
      <Container maxW="7xl" py={8}>
        <Box mb={8}>
          <Heading size="lg" color="white" mb={6}>
            Pending Registrations
          </Heading>
          

            {/* <Select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              bg="#242C2E"
              color="white"
              borderColor="#181E20"
              w={{ base: 'full', md: '200px' }}
              _hover={{ borderColor: '#FDB137' }}
              _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
            >
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="referrer">Referrer</option>
              <option value="date">Date</option>
            </Select>
            
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="#FDB137" />
              </InputLeftElement>
              <Input
                placeholder={`Search by ${searchField}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="#242C2E"
                color="white"
                borderColor="#181E20"
                _hover={{ borderColor: '#FDB137' }}
                _focus={{ borderColor: '#FDB137', boxShadow: '0 0 0 1px #FDB137' }}
              />
            */} 
          <Text color="#E0E0E0" mb={4}>
            Found {filteredRegistrations.length} results
          </Text>

          <Box overflowX="auto" bg="#242C2E" borderRadius="lg" borderWidth="1px" borderColor="#181E20" p={2}>
            <Table variant="simple" colorScheme="whiteAlpha">
              <Thead>
                <Tr>
                  <Th color="#E0E0E0">Username</Th>
                  <Th color="#E0E0E0">Email/Phone</Th>
                  <Th color="#E0E0E0">Referrer</Th>
                  <Th color="#E0E0E0">Date</Th>
                  <Th color="#E0E0E0">Status</Th>
                  <Th color="#E0E0E0">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedRegistrations.map((reg) => (
                  <Tr key={reg._id}>
                    <Td color="white">{reg.username}</Td>
                    <Td color="white">{reg.email}</Td>
                    <Td color="white">{reg.referrer || 'N/A'}</Td>
                    <Td color="white">{new Date(reg.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <Badge colorScheme="yellow">Pending</Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          bg="#FDB137"
                          color="#181E20"
                          fontWeight="bold"
                          boxShadow="0 2px 8px rgba(0,0,0,0.12)"
                          _hover={{ bg: '#BD5301', color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transform: 'translateY(-2px)' }}
                          onClick={() => handleApprove(reg._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          bg="#E53935"
                          color="white"
                          fontWeight="bold"
                          boxShadow="0 2px 8px rgba(0,0,0,0.12)"
                          _hover={{ bg: '#B71C1C', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transform: 'translateY(-2px)' }}
                          onClick={() => handleReject(reg._id)}
                        >
                          Reject
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {totalPages > 1 && (
            <Flex justify="center" mt={6} gap={2}>
              <Button
                leftIcon={<FaChevronLeft />}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                isDisabled={currentPage === 1}
                bg="#242C2E"
                color="white"
                _hover={{ bg: '#FDB137', color: '#181E20' }}
              >
                Previous
              </Button>
              <Button
                rightIcon={<FaChevronRight />}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                isDisabled={currentPage === totalPages}
                bg="#242C2E"
                color="white"
                _hover={{ bg: '#FDB137', color: '#181E20' }}
              >
                Next
              </Button>
            </Flex>
          )}
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default PendingRegistrations; 