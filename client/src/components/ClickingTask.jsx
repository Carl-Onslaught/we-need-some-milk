import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import GoldCoin from './GoldCoin';

const ClickingTask = ({ onEarn, dailyClicks = 0, dailyEarnings = 0, maxClicks = 50, maxReward = 10 }) => {
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
            Complete {maxClicks} clicks to earn up to ₱{maxReward.toFixed(2)} per day
          </Text>
        </Text>

        <Box
          w="100%"
          display="flex"
          justifyContent="center"
        >
          <GoldCoin onEarn={onEarn} />
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
