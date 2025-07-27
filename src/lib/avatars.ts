import { getAssetPath } from './paths';

// Whale user avatar mapping
const whaleAvatars: { [key: string]: string } = {
  'whale-skyler': '/img1.jpg',
  'whale-mel': '/img2.jpg',
  'whale-amro': '/img3.jpg',
  'whale-dylan': '/img4.jpg',
  'whale-unkn0wn': '/img5.jpg',
  'whale-spyder': '/img6.jpg',
  'whale-ronnie': '/img7.jpg',
  'whale-einstein': '/img8.jpg',
  'whale-noah': '/img9.jpg',
  'whale-assure': '/img10.jpg',
  'whale-wulf': '/img11.jpg',
  'whale-sully': '/img12.jpg',
  'whale-arcane': '/img13.jpg',
  'whale-degenbarbie': '/img14.jpg',
  'whale-polly': '/img15.jpg',
  'whale-bossman': '/img16.jpg',
  'whale-lyxe': '/img17.jpg',
  'whale-wisdom': '/img18.jpg',
};

export const getAvatarForUser = (userId: string | number): string => {
  const userIdStr = userId.toString();
  
  // Check if this is a whale user
  if (whaleAvatars[userIdStr]) {
    return getAssetPath(whaleAvatars[userIdStr]);
  }
  
  // For wallet addresses that match whale display names, use whale avatars
  const whaleWalletMapping: { [key: string]: string } = {
    '0xSkyler...Whale': '/img1.jpg',
    '0xMel...Crypto': '/img2.jpg',
    '0xAmro...DeFi': '/img3.jpg',
    '0xDylan...ETH': '/img4.jpg',
    '0xUnkn0wn...Anon': '/img5.jpg',
    '0xSpyder...Web3': '/img6.jpg',
    '0xRonnie...HODL': '/img7.jpg',
    '0xEinstein...Genius': '/img8.jpg',
    '0xNoah...Ark': '/img9.jpg',
    '0xAssure...DeFi': '/img10.jpg',
    '0xWulf...Pack': '/img11.jpg',
    '0xSully...Trade': '/img12.jpg',
    '0xArcane...Josh': '/img13.jpg',
    '0xDegen...Barbie': '/img14.jpg',
    '0xPolly...Protocol': '/img15.jpg',
    '0xBoss...Man': '/img16.jpg',
    '0xLyxe...Lux': '/img17.jpg',
    '0xWisdom...Sage': '/img18.jpg',
  };
  
  if (whaleWalletMapping[userIdStr]) {
    return getAssetPath(whaleWalletMapping[userIdStr]);
  }
  
  // Default avatar generation for non-whale users
  let hash = 0;
  for (let i = 0; i < userIdStr.length; i++) {
    const char = userIdStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const avatarNumber = Math.abs(hash % 16) + 1;

  return getAssetPath(`/avatars/${avatarNumber}.webp`);
};

export const getAvatarForWallet = (walletAddress: string): string => {
  const suffix = walletAddress.slice(-8);
  return getAvatarForUser(suffix);
};
