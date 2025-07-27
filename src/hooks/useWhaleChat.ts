import { useState, useCallback } from 'react';
import { 
  whaleUsers, 
  whaleResponses, 
  privateTxResponses,
  MockMessage,
  MockUser 
} from '../lib/mockData';

export interface WhaleMessage extends MockMessage {
  isWhaleMessage?: boolean;
}

export const useWhaleChat = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [usedWhales, setUsedWhales] = useState<string[]>([]);

  const generateWhaleResponse = useCallback((chatId: string, userMessage: string): WhaleMessage | null => {
    if (isSimulating) return null;

    // Filter out whales that have already responded recently
    const availableWhales = whaleUsers.filter(user => 
      user.id !== 'current-user' && !usedWhales.includes(user.id)
    );
    
    // If all whales have been used, reset the list
    const whalesToChooseFrom = availableWhales.length > 0 ? availableWhales : whaleUsers.filter(user => user.id !== 'current-user');
    const selectedWhale = whalesToChooseFrom[Math.floor(Math.random() * whalesToChooseFrom.length)];
    
    // Track this whale as used
    setUsedWhales(prev => {
      const newUsed = [...prev, selectedWhale.id];
      // Reset if we've used too many whales
      if (newUsed.length > Math.floor(whaleUsers.length * 0.7)) {
        return [selectedWhale.id];
      }
      return newUsed;
    });

    // Determine response type based on message content
    let responses: string[];
    if (userMessage.toLowerCase().includes('hushr') || 
        userMessage.toLowerCase().includes('private') || 
        userMessage.toLowerCase().includes('0.2 eth') ||
        userMessage.toLowerCase().includes('transaction') ||
        userMessage.toLowerCase().includes('sent') ||
        userMessage.toLowerCase().includes('send')) {
      responses = privateTxResponses;
    } else {
      responses = whaleResponses;
    }

    const response = responses[Math.floor(Math.random() * responses.length)];

    return {
      id: `whale-${Date.now()}-${Math.random()}`,
      content: response,
      sender_id: selectedWhale.id,
      created_at: new Date().toISOString(),
      sender: selectedWhale,
      isWhaleMessage: true,
    };
  }, [isSimulating, usedWhales]);

  const generatePrivateTxDiscussion = useCallback((chatId: string): WhaleMessage[] => {
    const messages: WhaleMessage[] = [];
    const shuffledWhales = [...whaleUsers].sort(() => Math.random() - 0.5);
    
    // Initial private tx announcement
    messages.push({
      id: `whale-init-${Date.now()}`,
      content: "Just used the private tx feature to move 0.2 ETH 👀",
      sender_id: shuffledWhales[0].id,
      created_at: new Date(Date.now() - 300000).toISOString(),
      sender: shuffledWhales[0],
      isWhaleMessage: true,
    });

    // Follow-up responses
    const followUps = [
      "Nice! How were the fees?",
      "Privacy is everything in this game",
      "Was it smooth? Thinking of trying it myself",
      "Smart move, especially with these amounts",
      "The future is private transactions fr"
    ];

    followUps.slice(0, 3).forEach((content, index) => {
      messages.push({
        id: `whale-followup-${Date.now()}-${index}`,
        content,
        sender_id: shuffledWhales[index + 1].id,
        created_at: new Date(Date.now() - 250000 + (index * 30000)).toISOString(),
        sender: shuffledWhales[index + 1],
        isWhaleMessage: true,
      });
    });

    return messages;
  }, []);

  return {
    generateWhaleResponse,
    generatePrivateTxDiscussion,
    isSimulating,
    setIsSimulating,
  };
};