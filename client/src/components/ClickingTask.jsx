import React from 'react';
import { Box, Text, VStack, Button, useToast } from '@chakra-ui/react';
import GoldCoin from './GoldCoin';
import axios from 'axios';

const ClickingTask = ({ onEarn, dailyClicks = 0, dailyEarnings = 0, maxClicks = 50, maxReward = 10, isActivated = false, walletBalance = 0, onActivationSuccess }) => {
  const toast = useToast();

  const handleActivateClickingTask = async () => {
    try {
      const response = await axios.post('/agent/activate-clicking-task');
      
      toast({
        title: 'Success',
        description: 'Clicking task activated successfully! You can now start earning.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Call the callback to refresh dashboard data
      if (onActivationSuccess) {
        onActivationSuccess(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to activate clicking task',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!isActivated) {
    return (
      <Box
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        py={{ base: 8, md: 12 }}
        px={{ base: 4, md: 8 }}
      >
        <VStack
          w="100%"
          maxW={{ base: "100%", md: "800px" }}
          spacing={6}
          align="center"
        >
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            color="hsl(220, 14%, 90%)"
            textAlign="center"
            fontWeight="medium"
            lineHeight="1.6"
            px={4}
            textShadow="0 2px 4px rgba(0,0,0,0.2)"
          >
            Activate Your Clicking Task to Start Earning! 💰
            <Text as="span" display="block" fontSize={{ base: "sm", md: "md" }} color="hsl(220, 14%, 70%)" mt={2}>
              Complete 50 clicks to earn up to ₱10.00 per day
            </Text>
          </Text>

          <Box
            w="100%"
            display="flex"
            justifyContent="center"
            opacity="0.5"
            pointerEvents="none"
          >
            <GoldCoin onEarn={() => {}} dailyClicks={0} maxClicks={maxClicks} disabled={true} />
          </Box>
          
          <VStack spacing={3}>
            <Text fontSize="md" color="hsl(220, 14%, 90%)" textShadow="0 0 5px rgba(0, 0, 0, 0.5)">
              Current Balance: ₱{walletBalance.toFixed(2)}
            </Text>
            <Text fontSize="md" color="hsl(220, 14%, 70%)" textAlign="center">
              You need ₱100 balance to activate the clicking task
            </Text>
            
            <Button
              bg="#FDB137"
              color="#181E20"
              size="lg"
              fontWeight="bold"
              _hover={{
                bg: '#BD5301',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
              }}
              onClick={handleActivateClickingTask}
              isDisabled={walletBalance < 100}
              disabled={walletBalance < 100}
            >
              {walletBalance < 100 ? 'Insufficient Balance' : 'Activate Clicking Task (₱100)'}
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      py={{ base: 8, md: 12 }}
      px={{ base: 4, md: 8 }}
    >
      <VStack
        w="100%"
        maxW={{ base: "100%", md: "800px" }}
        spacing={4}
        align="center"
      >
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          color="hsl(220, 14%, 90%)"
          textAlign="center"
          fontWeight="medium"
          lineHeight="1.6"
          px={4}
          textShadow="0 2px 4px rgba(0,0,0,0.2)"
        >
          Click the gold coin to earn daily rewards! 💰
          <Text as="span" display="block" fontSize={{ base: "sm", md: "md" }} color="hsl(220, 14%, 70%)" mt={2}>
            Complete 50 clicks to earn up to ₱10.00 per day
          </Text>
        </Text>

        <Box
          w="100%"
          display="flex"
          justifyContent="center"
        >
          <GoldCoin onEarn={onEarn} dailyClicks={dailyClicks} maxClicks={maxClicks} />
        </Box>
        
        <VStack spacing={1} mt={2}>
          <Text fontSize="md" color="hsl(220, 14%, 90%)" textShadow="0 0 5px rgba(0, 0, 0, 0.5)">
            Clicks: {dailyClicks}/{maxClicks}
          </Text>
          <Text fontSize="md" color="hsl(220, 14%, 90%)" textShadow="0 0 5px rgba(0, 0, 0, 0.5)">
            Earnings: ₱{dailyEarnings.toFixed(2)}/₱{maxReward.toFixed(2)}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default ClickingTask;
