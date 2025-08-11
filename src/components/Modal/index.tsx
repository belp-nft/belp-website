"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  headerTitle: string;
  description?: string;
  children: React.ReactNode;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryButtonDisabled?: boolean;
  secondaryButtonDisabled?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  headerTitle,
  description,
  children,
  primaryButtonText = "Confirm",
  secondaryButtonText = "Cancel",
  onPrimaryClick,
  onSecondaryClick,
  primaryButtonDisabled = false,
  secondaryButtonDisabled = false,
}) => {
  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#F2ECF6] rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 relative">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl bg-[#BBABD7] hover:opacity-85 cursor-pointer transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
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

                <motion.h1
                  className={clsx(
                    "font-bold text-center mt-3 sm:mt-5",
                    "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight",
                    "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl"
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  {headerTitle}
                </motion.h1>

                {description && (
                  <motion.p
                    className="text-center mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-gray-700 px-2 sm:px-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {description}
                  </motion.p>
                )}
              </div>

              {/* Content */}
              <motion.div
                className="px-4 sm:px-6 py-3 sm:py-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {children}
              </motion.div>

              <motion.div
                className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 flex gap-2 sm:gap-3 flex-col sm:flex-row mx-auto justify-center sm:justify-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.button
                  className={clsx(
                    "flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium text-[#702EAF] border border-gray-300 bg-[#E3CEF6] hover:opacity-85 transition-colors text-sm sm:text-base",
                    secondaryButtonDisabled && "opacity-50 cursor-not-allowed",
                    "max-w-[330px] cursor-pointer"
                  )}
                  onClick={handleSecondaryClick}
                  disabled={secondaryButtonDisabled}
                  whileHover={!secondaryButtonDisabled ? { scale: 1.02 } : {}}
                  whileTap={!secondaryButtonDisabled ? { scale: 0.98 } : {}}
                >
                  {secondaryButtonText}
                </motion.button>

                <motion.button
                  className={clsx(
                    "flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-medium text-white bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] hover:from-[#E045EF] hover:to-[#9D3BBE] transition-all shadow-md text-sm sm:text-base",
                    primaryButtonDisabled && "opacity-50 cursor-not-allowed",
                    "max-w-[330px] cursor-pointer"
                  )}
                  onClick={onPrimaryClick}
                  disabled={primaryButtonDisabled}
                  whileHover={!primaryButtonDisabled ? { scale: 1.02 } : {}}
                  whileTap={!primaryButtonDisabled ? { scale: 0.98 } : {}}
                >
                  {primaryButtonDisabled ? (
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                      <motion.div
                        className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span className="text-xs sm:text-sm">Minting...</span>
                    </div>
                  ) : (
                    primaryButtonText
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
