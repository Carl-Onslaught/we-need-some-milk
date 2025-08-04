import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Container,
  Link as ChakraLink,
  useToast,
  Stack,
  Alert,
  AlertIcon,
  Image,
} from '@chakra-ui/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import loginLogo from '../assets/images/Logo2.png';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'agent',
    referralCode: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();

  useEffect(() => {
    // Get referral code from URL query params
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
    }
  }, [location]);

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

    // Validate required fields
    if (!formData.username.trim()) {
      return setError('Username is required');
    }
    if (!formData.email.trim()) {
      return setError('Email is required');
    }
    if (!formData.referralCode.trim()) {
      return setError('Referral Code is required');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    // Validate email or phone format
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isPhone = /^09\d{9}$/.test(formData.email);
    if (!isEmail && !isPhone) {
      return setError('Please enter a valid email address or Philippine phone number (e.g., 09XXXXXXXXX)');
    }

    setIsLoading(true);
    try {
      await register(formData);
      toast({
        title: 'Registration Submitted Successfully',
        description: `Your account has been created successfully! You can now access your dashboard. The clicking task is disabled until you activate it with ₱100 balance.`,
        status: 'success',
        duration: 8000,
        isClosable: true,
        position: 'top',
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create an account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="#181E20" minH="100vh" py={10}>
      <Container maxW="lg">
        <Box 
          p={8} 
          bg="#242C2E"
          borderRadius="xl"
          boxShadow="dark-lg"
          borderWidth="1px"
          borderColor="#181E20"
        >
          <Stack spacing={4} mb={8} textAlign="center">
            <Heading color="white">Create Account</Heading>
            <Image
              src={loginLogo}
              alt="Wealth Clicks Logo"
              width="150px"
              height="auto"
              mx="auto"
              mb={4}
            />

          </Stack>

          {error && (
            <Alert status="error" mb={4} borderRadius="md" bg="#242C2E" color="#E0E0E0">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel color="#E0E0E0">Username</FormLabel>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  bg="#242C2E"
                  borderColor="#181E20"
                  color="white"
                  _hover={{ borderColor: "#FDB137" }}
                  _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #181E20" }}
                  autoComplete="username"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="#E0E0E0">Email/Phone</FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email or phone number"
                  bg="#242C2E"
                  borderColor="#181E20"
                  color="white"
                  _hover={{ borderColor: "#FDB137" }}
                  _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #181E20" }}
                  autoComplete="email"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="#E0E0E0">Referral Code</FormLabel>
                <Input
                  id="referralCode"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="Enter referral code"
                  bg="#242C2E"
                  borderColor="#181E20"
                  color="white"
                  _hover={{ borderColor: "#FDB137" }}
                  _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #181E20" }}
                  autoComplete="off"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="#E0E0E0">Password</FormLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  bg="#242C2E"
                  borderColor="#181E20"
                  color="white"
                  _hover={{ borderColor: "#FDB137" }}
                  _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #181E20" }}
                  autoComplete="new-password"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="#E0E0E0">Confirm Password</FormLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  bg="#242C2E"
                  borderColor="#181E20"
                  color="white"
                  _hover={{ borderColor: "#FDB137" }}
                  _focus={{ borderColor: "#FDB137", boxShadow: "0 0 0 1px #181E20" }}
                  autoComplete="new-password"
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
              >
                Create Account
              </Button>
            </Stack>
          </form>

          <Text mt={6} textAlign="center" color="#E0E0E0">
            Already have an account?{' '}
            <Text
              as={Link}
              to="/login"
              color="#FDB137"
              _hover={{ textDecoration: 'underline', color: '#BD5301' }}
            >
              Sign In
            </Text>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}

export default Register; 