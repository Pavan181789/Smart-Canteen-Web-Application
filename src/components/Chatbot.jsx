import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Input, Text, VStack, HStack, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton, Avatar, Select, Switch, FormControl, FormLabel } from '@chakra-ui/react';
import { FiMessageSquare, FiSend, FiMic, FiMicOff } from 'react-icons/fi';
import aiService from '../services/aiService';
import { UserAuth } from '../context/AuthContext';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your canteen assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const messagesEndRef = useRef(null);
  const { user } = UserAuth?.() || {};
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const recognitionRef = useRef(null);
  const [recognitionLang, setRecognitionLang] = useState('en-IN');
  const [interimEnabled, setInterimEnabled] = useState(true);
  const [autoStop, setAutoStop] = useState(true);

  const quickQuestions = [
    "What's the special today?",
    "Suggest a veg combo under ₹100",
    "When does the canteen open?",
    "I have a complaint about my order",
    "What's the menu for today?",
    "When does the canteen Close?"
    

    
  ];

  const renderBold = (text) => {
    if (typeof text !== 'string') return text;
    const parts = [];
    let lastIndex = 0;
    const regex = /\*\*(.+?)\*\*/g; // match **bold**
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(<strong key={parts.length}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length ? parts : text;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      return;
    }
    setHasSpeechSupport(true);
    const recognition = new SpeechRecognition();
    recognition.lang = recognitionLang;
    recognition.interimResults = interimEnabled;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        } else {
          interimTranscript += res[0].transcript;
        }
      }
      if (finalTranscript) {
        setInput(finalTranscript.trim());
      } else if (interimTranscript) {
        // show interim lightly; do not commit to final content
        setInput(interimTranscript.trim());
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    if (autoStop) {
      recognition.onspeechend = () => {
        try { recognition.stop(); } catch (_) {}
      };
    }
    recognitionRef.current = recognition;
  }, [recognitionLang, interimEnabled, autoStop]);

  const startListening = () => {
    if (!recognitionRef.current || isLoading) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (_) {}
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (_) {}
  };

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
      {!isOpen && (
        <IconButton
          position="fixed"
          bottom={8}
          right={8}
          size="lg"
          colorScheme="blue"
          borderRadius="full"
          icon={<FiMessageSquare />}
          onClick={onOpen}
          zIndex={9999}
          boxShadow="lg"
        />
      )}

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent bg="gray.900" color="gray.100">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" bg="blue.600" color="white" boxShadow="sm">
            Canteen Assistant
          </DrawerHeader>
          <DrawerBody p={0} display="flex" flexDirection="column">
            <Box flex={1} overflowY="auto" p={4}>
              <VStack spacing={4} align="stretch">
                {messages.map((message, index) => {
                  const isUser = message.sender === 'user';
                  return (
                    <HStack key={index} justify={isUser ? 'flex-end' : 'flex-start'} align="flex-end">
                      {!isUser && (
                        <Avatar size="sm" name="Canteen" bg="blue.600" color="white" />
                      )}
                      <Box
                        bg={isUser ? 'blue.500' : 'gray.700'}
                        color={isUser ? 'white' : 'gray.100'}
                        px={4}
                        py={3}
                        borderRadius="lg"
                        maxW="75%"
                        boxShadow={isUser ? 'md' : 'sm'}
                      >
                        <Text whiteSpace="pre-wrap">{renderBold(message.text)}</Text>
                      </Box>
                      {isUser && (
                        <Avatar
                          size="sm"
                          name={user?.displayName || 'You'}
                          src={user?.photoURL || undefined}
                        />
                      )}
                    </HStack>
                  );
                })}
                {isLoading && (
                  <HStack justify="flex-start" align="flex-end">
                    <Avatar size="sm" name="Canteen" bg="blue.600" color="white" />
                    <Box bg="gray.700" px={4} py={3} borderRadius="lg">
                      <Text color="gray.200">Typing...</Text>
                    </Box>
                  </HStack>
                )}
                <div ref={messagesEndRef} />
              </VStack>
            </Box>

            <Box p={4} borderTopWidth="1px" borderColor="gray.700" bg="gray.850">
              <VStack spacing={3} align="stretch">
                <HStack spacing={4} align="center">
                  <FormControl display="flex" alignItems="center" maxW="220px">
                    <FormLabel m={0} fontSize="sm" color="gray.300">Language</FormLabel>
                    <Select size="sm" value={recognitionLang} onChange={(e) => setRecognitionLang(e.target.value)} bg="gray.800" borderColor="gray.700" color="gray.100">
                      <option value="en-IN">English (India)</option>
                      <option value="hi-IN">Hindi (India)</option>
                      <option value="te-IN">Telugu (India)</option>
                      <option value="ta-IN">Tamil (India)</option>
                      <option value="kn-IN">Kannada (India)</option>
                      <option value="ml-IN">Malayalam (India)</option>
                    </Select>
                  </FormControl>
                  <FormControl display="flex" alignItems="center" w="auto">
                    <FormLabel m={0} fontSize="sm" color="gray.300" htmlFor="interimSwitch">Interim</FormLabel>
                    <Switch id="interimSwitch" isChecked={interimEnabled} onChange={(e) => setInterimEnabled(e.target.checked)} colorScheme="blue" ml={2} />
                  </FormControl>
                  <FormControl display="flex" alignItems="center" w="auto">
                    <FormLabel m={0} fontSize="sm" color="gray.300" htmlFor="autoStopSwitch">Auto‑stop</FormLabel>
                    <Switch id="autoStopSwitch" isChecked={autoStop} onChange={(e) => setAutoStop(e.target.checked)} colorScheme="blue" ml={2} />
                  </FormControl>
                </HStack>
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
                  <Avatar
                    size="sm"
                    name={user?.displayName || 'You'}
                    src={user?.photoURL || undefined}
                  />
                  <Input
                    placeholder={isListening ? "Listening..." : "Type your message..."}
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
                    colorScheme={isListening ? 'red' : 'gray'}
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                    icon={isListening ? <FiMicOff /> : <FiMic />}
                    onClick={() => (isListening ? stopListening() : startListening())}
                    isDisabled={isLoading || !hasSpeechSupport}
                    borderRadius="full"
                    boxShadow="md"
                    title={hasSpeechSupport ? (isListening ? 'Stop voice input' : 'Speak') : 'Voice not supported in this browser'}
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
