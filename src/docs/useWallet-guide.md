# useWallet Hook - Universal Wallet Integration

## Tổng quan

`useWallet` hook đã được refactor để trở thành một universal wallet hook, hỗ trợ nhiều loại wallet Solana khác nhau với các action chung.

## Các wallet được hỗ trợ

- **Phantom** - phantom.app
- **Solflare** - solflare.com  
- **Backpack** - backpack.app
- **Glow** - glow.app
- **OKX Wallet** - okx.com/web3

## Cách sử dụng

### Import Hook

```typescript
import { useWallet } from '@/hooks/useWallet';
```

### Basic Usage

```typescript
const {
  // State
  solAddress,           // Địa chỉ wallet hiện tại
  connectedWallet,      // Loại wallet đang kết nối (phantom, solflare, etc.)
  connectedType,        // Loại blockchain ("sol")
  loading,              // Trạng thái loading
  solLamports,          // Số dư SOL (lamports)
  solBalanceText,       // Số dư SOL (formatted string)
  authToken,            // JWT token từ backend
  userStatistics,       // Thống kê user từ backend
  transactions,         // Lịch sử giao dịch
  availableWallets,     // Danh sách wallet có sẵn
  
  // Generic Actions
  connectWallet,        // Kết nối wallet theo type
  disconnect,           // Ngắt kết nối wallet
  autoConnect,          // Tự động kết nối nếu đã ủy quyền
  refreshSolBalance,    // Refresh số dư SOL
  loadUserData,         // Load dữ liệu user từ backend
  shorten,              // Rút gọn địa chỉ wallet
  
  // Backward Compatibility
  connectPhantom,       // Kết nối Phantom (legacy)
  connectSolflare,      // Kết nối Solflare (legacy)
  connectBackpack,      // Kết nối Backpack (legacy)
  connectGlow,          // Kết nối Glow (legacy)
  connectOKX,           // Kết nối OKX (legacy)
  
  // Wallet Availability
  hasPhantom,           // Kiểm tra có Phantom không
  hasSolflare,          // Kiểm tra có Solflare không
  hasBackpack,          // Kiểm tra có Backpack không
  hasGlow,              // Kiểm tra có Glow không
  hasOKX,               // Kiểm tra có OKX không
  
  // Utility Functions
  getWalletConfig,      // Lấy config của wallet
  getWalletProvider,    // Lấy provider của wallet
} = useWallet();
```

## Các Action chính

### 1. connectWallet(walletType)

Kết nối wallet theo type cụ thể:

```typescript
// Kết nối Phantom
await connectWallet('phantom');

// Kết nối Solflare  
await connectWallet('solflare');

// Kết nối Backpack
await connectWallet('backpack');
```

### 2. disconnect()

Ngắt kết nối wallet hiện tại:

```typescript
await disconnect();
```

### 3. autoConnect(walletType)

Tự động kết nối nếu wallet đã được ủy quyền trước đó:

```typescript
const result = await autoConnect('phantom');
if (result) {
  // console.log('Auto-connect thành công');
} else {
  // console.log('Cần kết nối thủ công');
}
```

## Dynamic Wallet Detection

Hook tự động detect các wallet có sẵn:

```typescript
const { availableWallets } = useWallet();

// Render buttons cho các wallet có sẵn
{availableWallets.map(wallet => (
  <button 
    key={wallet.type}
    onClick={() => connectWallet(wallet.type)}
  >
    Connect {wallet.displayName}
  </button>
))}
```

## Error Handling

Hook tự động xử lý các lỗi phổ biến:

- User từ chối kết nối
- Wallet chưa được cài đặt
- Yêu cầu kết nối đang pending
- Lỗi mạng/backend

Khi wallet chưa được cài đặt, hook sẽ tự động redirect đến trang download.

## Mobile Support

Hook hỗ trợ mobile với deep linking:

- Trên mobile: Mở app wallet nếu có, fallback sang app store
- Trên desktop: Mở trang download extension

## Backend Integration

Hook tự động:

1. Authenticate với backend sau khi kết nối wallet
2. Lưu JWT token vào localStorage  
3. Load user statistics và transaction history
4. Cleanup token khi disconnect

## Migration từ version cũ

Các function cũ vẫn hoạt động để backward compatibility:

```typescript
// Cũ (vẫn hoạt động)
const { connectPhantom, hasPhantom } = useWallet();

// Mới (khuyến khích)
const { connectWallet, availableWallets } = useWallet();
await connectWallet('phantom');
```

## Configuration

Có thể customize wallet config trong `WALLET_CONFIGS`:

```typescript
const WALLET_CONFIGS = {
  phantom: {
    name: "phantom",
    displayName: "Phantom",
    downloadUrl: { ... },
    deepLinkTemplate: "...",
    getProvider: () => window.solana,
    isAvailable: () => !!window.solana,
  },
  // ... other wallets
};
```

## Event Handling

Hook tự động setup/cleanup event listeners cho tất cả wallet:

- `connect` event: Update state khi wallet kết nối
- `disconnect` event: Cleanup state khi wallet ngắt kết nối

## Performance

- Lazy detection: Chỉ check wallet khi cần
- Efficient event handling: Dùng Map để quản lý listeners
- Memory cleanup: Tự động cleanup listeners khi unmount
