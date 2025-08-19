"use client";

import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface FeatureAnnouncementModalProps {
  isHiddenRemindMe: boolean;
  isOpen: boolean;
  onClose: (action?: "remind") => void;
}

const FeatureAnnouncementModal = ({
  isHiddenRemindMe,
  isOpen,
  onClose,
}: FeatureAnnouncementModalProps) => {
  const handleTwitterClick = () => {
    window.open("https://x.com/BELP_official", "_blank");
    handleCloseClick();
  };

  const handleRemindTomorrow = () => {
    onClose("remind");
  };

  const handleCloseClick = () => {
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
            onClick={handleCloseClick}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl py-8 max-w-lg px-5 sm:px-10 mx-5 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseClick}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#BBABD7] hover:opacity-85 cursor-pointer transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                className="text-gray-600"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon/Image */}
              <div className="mb-20 relative">
                <Image
                  src="/images/mint/cat-play-ball.png"
                  alt="Cat Playing with Ball"
                  width={186}
                  height={173}
                  className="absolute -top-[200px] translate-x-1/2 right-1/2 transform"
                />
              </div>

              {/* Title */}
              <motion.h1
                className={clsx(
                  "text-2xl sm:text-3xl md:text-[36px]",
                  "font-oxanium font-bold mb-4",
                  "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  fontFamily: "var(--font-oxanium)",
                }}
              >
                Something mystical is brewing…
              </motion.h1>

              {/* Description */}
              <motion.div
                className={clsx(
                  "text-sm sm:text-base",
                  "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
                )}
              >
                Catch the NFT Reveal <p className="block sm:inline">&</p> Mint
                Schedule on X
              </motion.div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 mt-5">
                {/* Features Button (Link to X) */}
                <button
                  onClick={handleTwitterClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  View on{" "}
                  <img src="/icons/x.svg" alt="Twitter" className="w-5 h-5" />
                </button>

                {/* Remind Tomorrow Button */}
                {!isHiddenRemindMe && (
                  <button
                    onClick={handleRemindTomorrow}
                    className="w-full bg-gray-200 py-3 px-6 rounded-xl font-semibold hover:opacity-80 transition-all duration-200 cursor-pointer"
                  >
                    Remind me tomorrow
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeatureAnnouncementModal;
