export default function ipfsImageLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Nếu là IPFS URL
  if (src.startsWith('ipfs://')) {
    const hash = src.replace('ipfs://', '');
    // Sử dụng dweb.link IPFS gateway
    return `https://dweb.link/ipfs/${hash}?w=${width}&q=${quality || 75}`;
  }
  
  // Nếu đã là HTTP URL, giữ nguyên
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // Nếu là relative path, giữ nguyên
  return src;
}
