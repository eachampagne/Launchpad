import { useState, useRef, useEffect } from 'react';
import { Box, Flex, Input, IconButton, Text, VStack, Heading, Spacer, Icon} from '@chakra-ui/react';
import type { WidgetSettings } from '../../types/LayoutTypes';

import { LuBot } from "react-icons/lu";

type Message = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

function AiChat({widgetId, textColor, settings}: {widgetId: number, textColor: string, settings: WidgetSettings | null}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text }] };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: updatedMessages }),
      });

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response.';
      setMessages(m => [...m, { role: 'model', parts: [{ text: reply }] }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'model', parts: [{ text: 'Error reaching Gemini.' }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" height="100%" width="100%" p={2} gap={2} color={textColor}>
      <Flex align="center" marginBottom="0.5rem">
        {" "}
        {/* Inner flex box means icon is vertically centered against text */}
        <Icon size="lg" marginRight="0.5rem">
          <LuBot />
        </Icon>
        <Heading>AI Chat</Heading>
        <Spacer />
      </Flex>
      <VStack flex={1} overflowY="auto" align="stretch" gap={1} fontSize="xs">
        {messages.length === 0 && (
          <Text color="inherit" fontSize="xs" textAlign="center" mt={2}>
            Ask Gemini anything...
          </Text>
        )}
        {messages.map((msg, i) => (
          <Box
            key={i}
            alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
            bg={msg.role === "user" ? "orange.100" : "gray.100"}
            color="gray.800"
            px={2}
            py={1}
            borderRadius="md"
            maxW="90%"
            whiteSpace="pre-wrap"
          >
            {msg.parts[0].text}
          </Box>
        ))}
        {loading && (
          <Box
            alignSelf="flex-start"
            bg="gray.100"
            px={2}
            py={1}
            borderRadius="md"
            color="gray.500"
            fontSize="xs"
          >
            Thinking...
          </Box>
        )}
        <div ref={bottomRef} />
      </VStack>

      <Flex gap={1}>
        <Input
          size="xs"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Message Gemini..."
          borderRadius="md"
          flex={1}
          borderColor={'whiteAlpha.800'}
          css={{ "&::placeholder": { color: "inherit" } }}
        />
        <IconButton
          size="xs"
          aria-label="Send"
          onClick={sendMessage}
          loading={loading}
          colorScheme="orange"
        >
          ➤
        </IconButton>
      </Flex>
    </Flex>
  );
}

export default AiChat;