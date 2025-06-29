import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Badge,
  Text,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Heading,
  ButtonGroup,
  Center,
  Spinner
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PackageRequests() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [loadingAction, setLoadingAction] = useState(null);

  const fetchPackages = async () => {
    try {
      const response = await axios.get('/api/package/pending');
      setPackages(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching packages',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleAction = async (id, action) => {
    try {
      setLoadingAction(id);
      await axios.put(`/api/package/${action}/${id}`);
      toast({
        title: `Package ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchPackages();
    } catch (error) {
      toast({
        title: `Error ${action.charAt(0).toUpperCase() + action.slice(1)}ing package`,
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  if (loading) {
    return (
      <Center>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Package Requests</Heading>
      </CardHeader>
      <CardBody>
        {packages.length === 0 ? (
          <Text>No pending package requests</Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Package Name</Th>
                <Th>Amount</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {packages.map((pkg) => (
                <Tr key={pkg._id}>
                  <Td>{pkg.user.name}</Td>
                  <Td>{pkg.name}</Td>
                  <Td>${pkg.amount}</Td>
                  <Td>{pkg.duration} days</Td>
                  <Td>
                    <Badge colorScheme={pkg.status === 'pending' ? 'yellow' : pkg.status === 'approved' ? 'green' : 'red'}>
                      {pkg.status}
                    </Badge>
                  </Td>
                  <Td>
                    <ButtonGroup size="sm">
                      <Button
                        colorScheme="green"
                        onClick={() => handleAction(pkg._id, 'approve')}
                        isLoading={loadingAction === pkg._id}
                        isDisabled={pkg.status !== 'pending'}
                      >
                        Approve
                      </Button>
                      <Button
                        colorScheme="red"
                        onClick={() => handleAction(pkg._id, 'reject')}
                        isLoading={loadingAction === pkg._id}
                        isDisabled={pkg.status !== 'pending'}
                      >
                        Reject
                      </Button>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
} 