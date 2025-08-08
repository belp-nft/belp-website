import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function RandomCloud() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible((v) => !v);
    }, 1500 + Math.random() * 2500);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <motion.div
      className="absolute left-[30%] top-[25%]"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1.2 }}
    >
      <Image
        src="/images/cloud.svg"
        alt="Random Cloud"
        width={50}
        height={30}
      />
    </motion.div>
  );
}
