import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Input, Text, VStack, HStack, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton } from '@chakra-ui/react';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import aiService from '../services/aiService';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your canteen assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "What's the special today?",
    "Suggest a veg combo under ₹100",
    "When does the canteen open?",
    "I have a complaint about my order"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textOverride) => {
    const raw = textOverride ?? input;
    const messageText = typeof raw === 'string' ? raw.trim() : '';
    if (!messageText) return;

    const userMessage = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    if (!textOverride) setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.handleInquiry(messageText);
      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const friendly = (error && (error.message || error.code)) ? `Error: ${error.message || error.code}` : "I'm sorry, I encountered an error. Please try again later.";
      setMessages(prev => [...prev, { 
        text: friendly, 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  return (
    <>
      <IconButton
        position="fixed"
        bottom={8}
        right={8}
        size="lg"
        colorScheme="blue"
        borderRadius="full"
        icon={isOpen ? <FiX /> : <FiMessageSquare />}
        onClick={isOpen ? onClose : onOpen}
        zIndex={9999}
        boxShadow="lg"
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent bg="gray.900" color="gray.100">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" bg="blue.600" color="white" boxShadow="sm">
            Canteen Assistant
          </DrawerHeader>
          <DrawerBody p={0} display="flex" flexDirection="column">
            <Box flex="1" overflowY="auto" p={4}>
              <VStack spacing={4} align="stretch">
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                    bg={message.sender === 'user' ? 'blue.500' : 'gray.700'}
                    color={message.sender === 'user' ? 'white' : 'gray.100'}
                    px={4}
                    py={3}
                    borderRadius="lg"
                    maxW="80%"
                    boxShadow={message.sender === 'user' ? 'md' : 'sm'}
                  >
                    <Text>{message.text}</Text>
                  </Box>
                ))}
                {isLoading && (
                  <Box alignSelf="flex-start" bg="gray.700" px={4} py={3} borderRadius="lg">
                    <Text color="gray.200">Typing...</Text>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </VStack>
            </Box>

            <Box p={4} borderTopWidth="1px" borderColor="gray.700" bg="gray.850">
              <VStack spacing={3}>
                <HStack spacing={2} flexWrap="wrap">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      colorScheme="gray"
                      onClick={() => handleQuickQuestion(question)}
                      isDisabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </HStack>
                <HStack spacing={3}>
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    isDisabled={isLoading}
                    bg="gray.800"
                    borderColor="gray.700"
                    _placeholder={{ color: 'gray.400' }}
                    color="gray.100"
                    borderRadius="full"
                  />
                  <IconButton
                    colorScheme="blue"
                    aria-label="Send message"
                    icon={<FiSend />}
                    onClick={() => handleSendMessage()}
                    isLoading={isLoading}
                    borderRadius="full"
                    boxShadow="md"
                  />
                </HStack>
              </VStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Chatbot;
