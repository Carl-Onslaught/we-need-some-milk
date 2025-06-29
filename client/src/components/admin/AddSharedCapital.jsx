import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';

const AddSharedCapital = () => {
  const [formData, setFormData] = useState({
    username: '',
    amount: '',
    packageType: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

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
      if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      if (!formData.packageType) {
        throw new Error('Package type is required');
      }

      // Make API request
      await axios.post('/api/admin/shared-capital', {
        username: formData.username,
        amount: parseFloat(formData.amount),
        packageType: parseInt(formData.packageType)
      });

      // Show success message
      toast({
        title: 'Success',
        description: 'Shared capital investment added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        username: '',
        amount: '',
        packageType: '',
      });
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to add shared capital');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      p={6}
      bg="hsl(222, 14%, 15%)"
      borderRadius="xl"
      boxShadow="dark-lg"
      borderWidth="1px"
      borderColor="hsl(222, 14%, 20%)"
    >
      <VStack spacing={6} align="stretch">
        <Box>
          <FormLabel color="hsl(220, 14%, 90%)" fontSize="xl" fontWeight="bold">
            Add Shared Capital Investment
          </FormLabel>
          <Text color="hsl(220, 14%, 70%)">
            Add shared capital investment to user accounts
          </Text>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md" bg="red.900" color="red.100">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="hsl(220, 14%, 90%)">Username</FormLabel>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                bg="hsl(222, 14%, 20%)"
                borderColor="hsl(222, 14%, 25%)"
                color="hsl(220, 14%, 90%)"
                _hover={{
                  borderColor: "brand.primary"
                }}
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 1px hsl(195, 100%, 50%)"
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="hsl(220, 14%, 90%)">Amount</FormLabel>
              <Input
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                bg="hsl(222, 14%, 20%)"
                borderColor="hsl(222, 14%, 25%)"
                color="hsl(220, 14%, 90%)"
                _hover={{
                  borderColor: "brand.primary"
                }}
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 1px hsl(195, 100%, 50%)"
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="hsl(220, 14%, 90%)">Package Type</FormLabel>
              <Select
                name="packageType"
                value={formData.packageType}
                onChange={handleChange}
                placeholder="Select package type"
                bg="hsl(222, 14%, 20%)"
                borderColor="hsl(222, 14%, 25%)"
                color="hsl(220, 14%, 90%)"
                _hover={{
                  borderColor: "brand.primary"
                }}
                _focus={{
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 1px hsl(195, 100%, 50%)"
                }}
              >
                <option value="1">Package 1</option>
                <option value="2">Package 2</option>
              </Select>
            </FormControl>

            <Button
              type="submit"
              bg="brand.primary"
              color="gray.800"
              size="lg"
              width="full"
              isLoading={isLoading}
              loadingText="Adding Investment..."
              _hover={{
                bg: 'brand.400',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
            >
              Add Investment
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default AddSharedCapital; 