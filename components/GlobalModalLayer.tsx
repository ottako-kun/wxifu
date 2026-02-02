import React from 'react';
// Fixed: Import Session from local types
import { Session } from '../types';
import { APP_CONFIG } from '../gallery-data';
import UploadButton from './UploadButton';
import UploadModal from './UploadModal';
import ChatWindow from './ChatWindow';
import CoinShopModal from './CoinShopModal';
import DailyRewardModal from './DailyRewardModal';
import LegalModal from './LegalModal';
import { useUI } from '../context/UIContext';
import { useWallet } from '../context/WalletContext';

interface GlobalModalLayerProps {
  session: Session | null;
  // Upload Props (Kept here as they are tied to data refreshing logic in App)
  isUploading: boolean;
  isUploadModalOpen: boolean;
  onUploadClick: () => void;
  onUploadClose: () => void;
  onUploadSubmit: (data: any) => Promise<void>;
}

const GlobalModalLayer: React.FC<GlobalModalLayerProps> = ({
  session,
  isUploading,
  isUploadModalOpen,
  onUploadClick,
  onUploadClose,
  onUploadSubmit,
}) => {
  const { 
    isShopOpen, closeShop,
    activeChatUser, closeChat,
    isDailyRewardOpen, closeDailyReward,
    activeLegalModal, closeLegal
  } = useUI();

  const { claimDailyReward } = useWallet();

  const handleClaimReward = async () => {
      await claimDailyReward();
      closeDailyReward();
  };

  return (
    <>
      {/* Upload Button (Desktop Only via CSS) & Modal */}
      {session && (
        <>
            <UploadButton onClick={onUploadClick} isUploading={isUploading} />
            {isUploadModalOpen && (
                <UploadModal 
                    onClose={onUploadClose} 
                    onSubmit={onUploadSubmit}
                    isSubmitting={isUploading}
                />
            )}
        </>
      )}

      {/* Chat Window */}
      {session && activeChatUser && (
          <ChatWindow 
              currentUser={{ id: session.user.id }}
              targetUser={activeChatUser}
              onClose={closeChat}
          />
      )}
      
      {/* Coin Shop Modal */}
      {isShopOpen && (
          <CoinShopModal onClose={closeShop} />
      )}
      
      {/* Daily Reward Modal */}
      {isDailyRewardOpen && (
          <DailyRewardModal onClaim={handleClaimReward} />
      )}

      {/* Legal Modals */}
      {activeLegalModal === 'privacy' && (
        <LegalModal title="Privacy Policy" onClose={closeLegal}>
            <div className="space-y-4">
                <p><strong className="text-white block mb-1">1. Introduction</strong>Welcome to {APP_CONFIG.name}{APP_CONFIG.nameSuffix}. We are committed to protecting your privacy and ensuring you have a safe experience on our platform.</p>
                <p><strong className="text-white block mb-1">2. Data Collection</strong>We collect minimal data required for authentication via Google (email, name, avatar). We also store the media files you upload and any metadata associated with them (descriptions, tags). We do not collect real names unless provided.</p>
                <p><strong className="text-white block mb-1">3. Data Usage</strong>Your data is used solely to provide the gallery service, display your public profile, and facilitate social interactions (likes, comments, messages). We do not sell your personal data to third parties.</p>
                <p><strong className="text-white block mb-1">4. Cookies & Storage</strong>We use cookies and local storage for session management to keep you logged in and to remember your preferences (e.g., age verification status).</p>
                <p><strong className="text-white block mb-1">5. Third-Party Services</strong>We use Google Apps Script for database services and Google for user login. Please refer to their respective privacy policies for how they handle data.</p>
                <p><strong className="text-white block mb-1">6. Content Visibility</strong>Please be aware that any content you upload or comments you make are public and viewable by other users of the site.</p>
            </div>
        </LegalModal>
      )}

      {activeLegalModal === 'terms' && (
        <LegalModal title="Terms of Service" onClose={closeLegal}>
            <div className="space-y-4">
                <p><strong className="text-white block mb-1">1. Age Requirement</strong>You must be at least 18 years old (or the age of majority in your jurisdiction) to access this site. By entering and using this service, you legally confirm you are an adult.</p>
                <p><strong className="text-white block mb-1">2. User Generated Content</strong>You retain full ownership of the content you upload. By uploading content to {APP_CONFIG.name}{APP_CONFIG.nameSuffix}, you grant us a worldwide, non-exclusive, royalty-free license to display, reproduce, and distribute your content on this platform.</p>
                <p><strong className="text-white block mb-1">3. Prohibited Content</strong>We have a <span className="text-red-400 font-bold">zero-tolerance policy</span> for illegal content. You may not upload content that depicts non-consensual sexual acts, child sexual abuse material (CSAM), real-world violence, or any content illegal under US or international law.</p>
                <p><strong className="text-white block mb-1">4. Conduct</strong>Harassment, hate speech, and spamming are strictly prohibited. We aim to foster a respectful community for artists and enthusiasts.</p>
                <p><strong className="text-white block mb-1">5. Account Termination</strong>We reserve the right to suspend or ban any account found violating these terms, at our sole discretion, without prior notice.</p>
                <p><strong className="text-white block mb-1">6. Disclaimer</strong>This site is provided "as is". We are not responsible for user-submitted content. View discretion is advised.</p>
            </div>
        </LegalModal>
      )}
    </>
  );
};

export default GlobalModalLayer;