import React from 'react';
import { getAvatarForUser } from '../../lib/avatars';
import { getAssetPath } from '../../lib/paths';

interface Chat {
  id: string;
  name: string;
  wallet_address: string;
  lastMessage: string;
  isActive?: boolean;
}

interface ChatSidebarProps {
  selectedChatId?: string;
  onChatSelect?: (chatId: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedChatId = 'chat-2',
  onChatSelect,
}) => {
  const chats: Chat[] = [
    {
      id: 'chat-1',
      name: 'DeFi Traders',
      wallet_address: '0x1bp5...0x15',
      lastMessage: 'GM! Ready for trading?',
      isActive: selectedChatId === 'chat-1',
    },
    {
      id: 'chat-2',
      name: 'Cases Discussion',
      wallet_address: '0xCases...Disc',
      lastMessage: 'Looking forward to it',
      isActive: selectedChatId === 'chat-2',
    },
    {
      id: 'chat-3',
      name: '0x3456...789a',
      wallet_address: '0x3456...789a',
      lastMessage: 'Always DYOR before investing',
      isActive: selectedChatId === 'chat-3',
    },
    {
      id: 'chat-4',
      name: 'NFT Collectors',
      wallet_address: '0xNFT...Coll',
      lastMessage: '0.1 ETH per NFT',
      isActive: selectedChatId === 'chat-4',
    },
    {
      id: 'chat-5',
      name: 'Crypto Whales',
      wallet_address: '0xWhales...Group',
      lastMessage: 'The real OGs know about private routes',
      isActive: selectedChatId === 'chat-5',
    },
  ];

  const handleChatClick = (chatId: string) => {
    if (onChatSelect) {
      onChatSelect(chatId);
    }
  };

  return (
    <div className="flex flex-col items-end py-8 gap-8 w-[280px] h-screen">
      <div className="flex justify-end items-center gap-4 w-[265px] h-[57px]">
        <div className="flex items-center gap-2 w-[46px] h-[25px]">
          <span className="text-hushr-green font-quicksand font-medium text-xl leading-[25px]">
            +21%
          </span>
        </div>

        <button className="flex justify-center items-center px-6 py-4 gap-2 w-[203px] h-[57px] border border-hushr-green rounded-2xl hover:bg-hushr-green/10 transition-colors">
          <img
            width={24}
            height={24}
            src={getAssetPath('/favicon.png')}
            alt="Buy $hushr"
          />
          <span className="text-hushr-green font-quicksand font-semibold text-xl leading-[25px]">
            Buy $hushr
          </span>
        </button>
      </div>

      <div className="flex flex-col items-start px-8 py-8 gap-8 w-[280px] border border-white/25 rounded-2xl">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-white font-quicksand font-semibold text-2xl leading-[30px]">
            Your chats
          </h2>
          <img src={getAssetPath('/chat/chreateChat.svg')} alt="Create Chat" />
        </div>

        <div className="flex flex-col items-start gap-8 w-[216px]">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              className={`flex items-center gap-3 w-full p-3 -m-3 rounded-lg transition-colors cursor-pointer ${
                chat.isActive
                  ? 'bg-hushr-green/10 border border-hushr-green/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={getAvatarForUser(chat.wallet_address)}
                  alt={chat.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-white font-quicksand font-semibold text-sm truncate">
                  {chat.name}
                </div>
                <div className="text-white/50 font-quicksand text-xs truncate">
                  {chat.lastMessage}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-hushr-green font-quicksand font-semibold text-base leading-5 cursor-pointer hover:text-hushr-green/80 transition-colors">
            Show more
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
