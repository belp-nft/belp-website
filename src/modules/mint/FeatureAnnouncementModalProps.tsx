"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTwitter } from "react-icons/fa";

interface FeatureAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureAnnouncementModal = ({
  isOpen,
  onClose,
}: FeatureAnnouncementModalProps) => {
  const handleTwitterClick = () => {
    window.open("https://x.com/BELP_official", "_blank");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={20} />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon/Image */}
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl">
                  🚀
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-[#1C007C] mb-4">
                New Features Available!
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                We've launched exciting new features for our NFT collection! 
                Follow us on X to stay updated with all the latest news and announcements.
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                {/* Features Button (Link to X) */}
                <button
                  onClick={handleTwitterClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FaTwitter size={18} />
                  Follow us on X
                </button>

                {/* Remind Tomorrow Button */}
                <button
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Remind me tomorrow
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeatureAnnouncementModal;