"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const clouds = [
  "/images/home/Cloud 1.png",
  "/images/home/Cloud 2.png",
  "/images/home/Cloud 3.png",
];

interface CloudItem {
  id: number;
  src: string;
  x: number;
  y: number;
  scale: number;
  duration: number;
  delay: number;
  direction: "left-to-right" | "right-to-left"; // Thêm hướng di chuyển
  width: number; // Thêm kích thước width
  height: number; // Thêm kích thước height
}

export default function RandomCloud() {
  const [cloudItems, setCloudItems] = useState<CloudItem[]>([]);
  const [parentSize, setParentSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lấy kích thước parent thực tế
    const updateParentSize = () => {
      if (containerRef.current?.parentElement) {
        const parent = containerRef.current.parentElement;
        setParentSize({
          width: parent.offsetWidth,
          height: parent.offsetHeight,
        });
      }
    };

    updateParentSize();
    window.addEventListener('resize', updateParentSize);
    
    return () => window.removeEventListener('resize', updateParentSize);
  }, []);

  useEffect(() => {
    if (parentSize.width === 0 || parentSize.height === 0) return;
    // Tạo mảng mây với vị trí phân bố đều
    const generateClouds = () => {
      const items: CloudItem[] = [];
      
      // Chỉ tạo 3-5 mây
      const cloudCount = Math.floor(Math.random() * 50) + 100;
      
      // Log kích thước parent để debug
      console.log('Parent size:', parentSize);
      
      // Tính toán vùng phân bố dựa trên kích thước thực tế của parent
      const { width: parentWidth, height: parentHeight } = parentSize;
      
      // Định nghĩa các vùng theo pixel thực tế
      const predefinedPositions = [
        { x: parentWidth * 0.2, y: parentHeight * 0.25 },   // Trái trên
        { x: parentWidth * 0.7, y: parentHeight * 0.2 },    // Phải trên  
        { x: parentWidth * 0.5, y: parentHeight * 0.45 },   // Giữa
        { x: parentWidth * 0.3, y: parentHeight * 0.7 },    // Trái dưới
        { x: parentWidth * 0.75, y: parentHeight * 0.65 },  // Phải dưới
      ];
      
      for (let i = 0; i < cloudCount; i++) {
        // Lấy vị trí từ danh sách cố định hoặc tạo ngẫu nhiên nếu hết
        let baseX, baseY;
        if (i < predefinedPositions.length) {
          baseX = predefinedPositions[i].x;
          baseY = predefinedPositions[i].y;
        } else {
          // Tạo vị trí ngẫu nhiên trong vùng an toàn (15-85% width, 20-80% height)
          baseX = parentWidth * (Math.random() * 0.7 + 0.15);
          baseY = parentHeight * (Math.random() * 0.6 + 0.2);
        }
        
        // Thêm offset ngẫu nhiên nhỏ (±40px hoặc ±5% parent size, tùy cái nào nhỏ hơn)
        const maxOffsetX = Math.min(40, parentWidth * 0.05);
        const maxOffsetY = Math.min(40, parentHeight * 0.05);
        const offsetX = (Math.random() - 0.5) * maxOffsetX * 2;
        const offsetY = (Math.random() - 0.5) * maxOffsetY * 2;
        
        // Chọn ngẫu nhiên hướng di chuyển
        const direction = Math.random() > 0.5 ? "left-to-right" : "right-to-left";
        
        // Tính vị trí cuối cùng và đảm bảo không vượt quá viền
        const finalX = Math.max(50, Math.min(parentWidth - 50, baseX + offsetX));
        const finalY = Math.max(50, Math.min(parentHeight - 50, baseY + offsetY));
        
        items.push({
          id: i,
          src: clouds[Math.floor(Math.random() * clouds.length)],
          x: finalX, // Vị trí pixel thực tế
          y: finalY, // Vị trí pixel thực tế
          scale: Math.random() * 0.6 + 0.8, // Kích thước lớn hơn (0.8-1.4)
          duration: Math.random() * 20 + 40, // Thời gian di chuyển (40-60s)
          delay: i * 2 + Math.random() * 3, // Delay tuần tự với random nhỏ
          direction: direction,
          // Kích thước mây dựa trên parent size (3-8% của width parent)
          width: Math.floor(parentWidth * (Math.random() * 0.05 + 0.03)), // 3-8% parent width
          height: Math.floor(parentHeight * (Math.random() * 0.04 + 0.02)), // 2-6% parent height
        });
      }
      
      setCloudItems(items);
    };

    generateClouds();
  }, [parentSize]); // Depend on parentSize thay vì []

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-50 w-full h-full top-0 left-0"
    >
      {cloudItems.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute"
          initial={{
            x: cloud.direction === "left-to-right" ? -200 : parentSize.width + 200,
            y: cloud.y,
            scale: cloud.scale,
            opacity: 0.6,
          }}
          animate={{
            x: cloud.direction === "left-to-right" ? parentSize.width + 200 : -200,
            y: cloud.y + (Math.random() - 0.5) * 40, // Dao động nhẹ ±20px
          }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            zIndex: Math.floor(Math.random() * 10) + 1,
            // Lật mây nếu di chuyển từ phải sang trái
            transform: cloud.direction === "right-to-left" ? "scaleX(-1)" : "scaleX(1)",
          }}
        >
          <Image
            src={cloud.src}
            alt={`Cloud ${cloud.id + 1}`}
            width={cloud.width}
            height={cloud.height}
            className="opacity-50 blur-[0.5px] mix-blend-soft-light"
            priority={false}
          />
        </motion.div>
      ))}
    </div>
  );
}
