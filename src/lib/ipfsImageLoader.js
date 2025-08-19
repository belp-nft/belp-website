export default function ipfsImageLoader({ src, width, quality }) {
  // Nếu là IPFS URL
  if (src.startsWith('ipfs://')) {
    const hash = src.replace('ipfs://', '');
    // IPFS gateways không hỗ trợ image optimization parameters
    // Chỉ trả về URL gốc từ gateway
    return `https://dweb.link/ipfs/${hash}`;
  }
  
  // Nếu đã là HTTP URL, giữ nguyên
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // Nếu là relative path, giữ nguyên
  return src;
}
