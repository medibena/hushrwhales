import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useWhaleChat } from '../../hooks/useWhaleChat';
import { getAvatarForUser } from '../../lib/avatars';
import { getAssetPath } from '../../lib/paths';
import {
  mockUsers,
  agreeResponses,
  disagreeResponses,
  createMockChats,
  MockMessage,
  Chat,
} from '../../lib/mockData';

interface MessagesViewProps {
  onNotificationChange: (hasNotification: boolean) => void;
  selectedChatId?: string;
}

const MessagesView: React.FC<MessagesViewProps> = ({
  onNotificationChange,
  selectedChatId: propSelectedChatId,
}) => {
  const { walletAddress } = useAuth();
  const { generateWhaleResponse } = useWhaleChat();
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(
    propSelectedChatId || 'chat-1'
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userColors = [
    '#4080F8',
    '#40F8F8',
    '#8040F8',
    '#F84040',
    '#F840B8',
    '#F88040',
    '#F8E040',
  ];

  const getUserColor = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % userColors.length;
    return userColors[colorIndex];
  };

  const [chats, setChats] = useState<Chat[]>(
    createMockChats(walletAddress || undefined)
  );

  useEffect(() => {
    if (propSelectedChatId) {
      setSelectedChatId(propSelectedChatId);
    }
  }, [propSelectedChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, selectedChatId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const generateAutoResponse = (userMessage: string) => {
    // Check if we're in the whale chat
    if (selectedChatId === 'chat-5') {
      // Check if message mentions private tx features
      const isPrivateTxMessage = userMessage.toLowerCase().includes('private tx') || 
                                 userMessage.toLowerCase().includes('hushr') || 
                                 userMessage.toLowerCase().includes('0.2 eth') ||
                                 userMessage.toLowerCase().includes('private transaction');
      
      if (isPrivateTxMessage) {
        // Generate 4-5 sequential whale responses with 1-second delays
        const numberOfResponses = 4 + Math.floor(Math.random() * 2); // 4-5 responses
        
        for (let i = 0; i < numberOfResponses; i++) {
          setTimeout(() => {
            const whaleResponse = generateWhaleResponse(selectedChatId, userMessage);
            if (whaleResponse) {
              setChats((prevChats) =>
                prevChats.map((chat) =>
                  chat.id === selectedChatId
                    ? {
                        ...chat,
                        messages: [...chat.messages, whaleResponse],
                        lastMessage: whaleResponse.content,
                      }
                    : chat
                )
              );
            }
          }, (i + 1) * 1000); // 1-second delay between each response
        }
      } else {
        // For non-private tx messages, generate 1-2 casual responses
        const whaleResponse1 = generateWhaleResponse(selectedChatId, userMessage);
        const whaleResponse2 = generateWhaleResponse(selectedChatId, userMessage);
        
        if (whaleResponse1) {
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === selectedChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, whaleResponse1],
                    lastMessage: whaleResponse1.content,
                  }
                : chat
            )
          );

          if (whaleResponse2 && Math.random() > 0.5) {
            setTimeout(() => {
              setChats((prevChats) =>
                prevChats.map((chat) =>
                  chat.id === selectedChatId
                    ? {
                        ...chat,
                        messages: [...chat.messages, whaleResponse2],
                        lastMessage: whaleResponse2.content,
                      }
                    : chat
                )
              );
            }, 1500 + Math.random() * 1000);
          }
        }
      }
      return;
    }

    // Original logic for other chats
    const availableUsers = mockUsers.filter(
      (user) => user.id !== 'current-user'
    );

    // Pick two different users
    const shuffledUsers = [...availableUsers].sort(() => Math.random() - 0.5);
    const firstUser = shuffledUsers[0];
    const secondUser = shuffledUsers[1] || shuffledUsers[0]; // fallback if only one user

    // First user agrees
    const agreeResponse =
      agreeResponses[Math.floor(Math.random() * agreeResponses.length)];
    const firstResponse: MockMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      content: agreeResponse,
      sender_id: firstUser.id,
      created_at: new Date().toISOString(),
      sender: firstUser,
    };

    // Second user disagrees
    const disagreeResponse =
      disagreeResponses[Math.floor(Math.random() * disagreeResponses.length)];
    const secondResponse: MockMessage = {
      id: `msg-${Date.now() + 1}-${Math.random()}`,
      content: disagreeResponse,
      sender_id: secondUser.id,
      created_at: new Date(Date.now() + 1000).toISOString(),
      sender: secondUser,
    };

    // Add first response
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [...chat.messages, firstResponse],
              lastMessage: agreeResponse,
            }
          : chat
      )
    );

    // Add second response after a delay
    setTimeout(() => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                messages: [...chat.messages, secondResponse],
                lastMessage: disagreeResponse,
              }
            : chat
        )
      );
    }, 1500 + Math.random() * 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    const messageId = `msg-${Date.now()}`;
    const userMessage: MockMessage = {
      id: messageId,
      content: newMessage || (selectedImage ? 'Image' : ''),
      sender_id: 'current-user',
      created_at: new Date().toISOString(),
      sender: {
        id: 'current-user',
        wallet_address: walletAddress || '0x5B...42A8',
        display_name: 'You',
      },
      image: selectedImage || undefined,
      ticks: 'one',
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              lastMessage: newMessage,
            }
          : chat
      )
    );

    setNewMessage('');
    setSelectedImage(null);

    setTimeout(() => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, ticks: 'two' } : msg
                ),
              }
            : chat
        )
      );

      generateAutoResponse(newMessage);
    }, 1000 + Math.random() * 2000);

    onNotificationChange(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getUniqueMembersCount = (chat: Chat) => {
    const uniqueSenders = new Set();
    chat.messages.forEach((message) => {
      uniqueSenders.add(message.sender_id);
    });
    return uniqueSenders.size;
  };

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const currentMessages = selectedChat ? selectedChat.messages : [];

  return (
    <div className="flex h-screen w-full min-w-[696px] max-w-[696px] border-l border-r border-hushr-gray lg:border-l lg:border-r border-l-0 border-r-0 relative">
      <div className="flex flex-col w-full">
        <div className="sticky top-0 bg-black border-b border-hushr-gray p-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
              <div className="w-full h-full flex items-center justify-center text-black font-bold">
                {selectedChat?.name.substring(0, 2).toUpperCase() || 'CD'}
              </div>
            </div>
            <div>
              <div className="text-white font-quicksand font-semibold text-base">
                {selectedChat?.name || 'Cases Discussion'}
              </div>
              <div className="text-white/70 font-quicksand text-sm">
                {selectedChat
                  ? `${getUniqueMembersCount(selectedChat)} members`
                  : '3 members'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-8">
          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === 'current-user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              {message.sender_id !== 'current-user' && (
                <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <img
                    src={getAvatarForUser(message.sender?.wallet_address || '')}
                    alt={message.sender?.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`max-w-md ${
                  message.sender_id === 'current-user' ? 'ml-12' : 'mr-12'
                }`}
              >
                <div className="px-4 py-2 rounded-2xl bg-white/10 text-white">
                  <div className="mb-1 text-left">
                    <span
                      className="font-quicksand font-semibold text-sm"
                      style={{
                        color:
                          message.sender_id === 'current-user'
                            ? '#40F8AB'
                            : getUserColor(message.sender_id),
                      }}
                    >
                      {message.sender_id === 'current-user'
                        ? `${(message.sender?.wallet_address || '').slice(
                            0,
                            6
                          )}...${(message.sender?.wallet_address || '').slice(
                            -4
                          )}`
                        : message.sender?.display_name || message.sender?.wallet_address}
                    </span>
                  </div>

                  {message.image && (
                    <div
                      className={
                        message.content && message.content !== 'Image'
                          ? 'mb-2'
                          : ''
                      }
                    >
                      <img
                        src={message.image}
                        alt="Shared image"
                        className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                      />
                    </div>
                  )}

                  {message.content && message.content !== 'Image' && (
                    <div className="flex items-end justify-between gap-2">
                      <p className="font-quicksand text-sm flex-1">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-white/50 font-quicksand text-xs">
                          {formatTime(message.created_at)}
                        </span>
                        {message.sender_id === 'current-user' &&
                          message.ticks && (
                            <img
                              src={
                                message.ticks === 'one'
                                  ? getAssetPath('/chat/1tick.svg')
                                  : getAssetPath('/chat/2ticks.svg')
                              }
                              alt={
                                message.ticks === 'one' ? '1 tick' : '2 ticks'
                              }
                              className="w-4 h-3"
                            />
                          )}
                      </div>
                    </div>
                  )}

                  {message.image &&
                    (!message.content || message.content === 'Image') && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-white/50 font-quicksand text-xs">
                          {formatTime(message.created_at)}
                        </span>
                        {message.sender_id === 'current-user' &&
                          message.ticks && (
                            <img
                              src={
                                message.ticks === 'one'
                                  ? getAssetPath('/chat/1tick.svg')
                                  : getAssetPath('/chat/2ticks.svg')
                              }
                              alt={
                                message.ticks === 'one' ? '1 tick' : '2 ticks'
                              }
                              className="w-4 h-3"
                            />
                          )}
                      </div>
                    )}
                </div>
              </div>

              {message.sender_id === 'current-user' && (
                <div className="w-8 h-8 rounded-full overflow-hidden ml-3 flex-shrink-0">
                  <img
                    src={getAvatarForUser(walletAddress || 'current-user')}
                    alt="You"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallbackUrl = getAssetPath('/avatars/1.webp');
                      if (target.src !== fallbackUrl) {
                        target.src = fallbackUrl;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {selectedImage && (
          <div className="absolute bottom-24 left-4 z-20">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected"
                className="max-w-[100px] max-h-[100px] rounded-lg object-cover shadow-lg"
              />
              <button
                onClick={removeSelectedImage}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="sticky bottom-8 flex flex-col items-start px-4 z-10">
          <form onSubmit={handleSendMessage} className="w-full max-w-[664px]">
            <div className="flex items-center justify-between px-4 py-4 gap-4 w-full h-16 bg-black border border-hushr-gray rounded-2xl">
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="group w-6 h-6 text-white/50 hover:text-hushr-green transition-colors"
                >
                  <img
                    src={getAssetPath('/buttons/attachImage.svg')}
                    alt="Attach Image"
                    className="w-full h-full group-hover:opacity-100 opacity-50 transition-opacity"
                  />
                </button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Speak safely..."
                  className="flex-1 bg-transparent text-white placeholder-white/50 font-quicksand font-medium text-base leading-5 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!newMessage.trim() && !selectedImage}
                className="w-7 h-7 disabled:opacity-30 transition-opacity"
              >
                <img
                  src={
                    newMessage.trim() || !selectedImage
                      ? getAssetPath('/buttons/createPostAble.svg')
                      : getAssetPath('/buttons/createPostDisable.svg')
                  }
                  alt={'send message'}
                  className="w-full h-full"
                />
              </button>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesView;
