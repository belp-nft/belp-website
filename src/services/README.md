# Belp API Services

Folder này chứa tất cả các services để tương tác với Belp API Backend theo [API Documentation](../../../sample/API_DOCUMENTATION.md).

## Cấu trúc Files

```
services/
├── index.ts           # Export tất cả services và types
├── types.ts           # Định nghĩa tất cả TypeScript interfaces
├── authService.ts     # Quản lý JWT authentication
├── userService.ts     # User Controller APIs
├── nftService.ts      # NFT Controller APIs
├── configService.ts   # Config Controller APIs
└── README.md         # Documentation này
```

## Cách sử dụng

### 1. Import Services

```typescript
// Import tất cả services
import { UserService, NftService, ConfigService, AuthService } from '@/services';

// Hoặc import riêng lẻ
import { UserService } from '@/services/userService';
import type { User, NFT } from '@/services/types';
```

### 2. Authentication

```typescript
// Kết nối ví (không cần JWT)
const result = await UserService.connectWallet('wallet_address_here');

// Lưu token (nếu API trả về)
AuthService.setToken('jwt_token_here');

// Kiểm tra token
const hasToken = AuthService.hasToken();

// Xóa token
AuthService.removeToken();
```

### 3. User APIs

```typescript
// Lấy thông tin user
const user = await UserService.getUserInfo('wallet_address');

// Lưu giao dịch
const transaction = await UserService.saveTransaction({
  walletAddress: 'wallet_address',
  transactionSignature: 'tx_signature',
  candyMachineAddress: 'cm_address',
  amount: 0.1,
});

// Lưu thông tin NFT (không cần JWT)
const nft = await UserService.saveNft({
  walletAddress: 'wallet_address',
  nftAddress: 'nft_address',
  name: 'Belp Cat #1',
  imageUrl: 'https://...',
  description: 'A cute Belp cat',
  attributes: { rarity: 'rare' },
});

// Lấy danh sách NFT
const nfts = await UserService.getNfts('wallet_address', {
  limit: 20,
  skip: 0,
});

// Lấy lịch sử giao dịch
const transactions = await UserService.getTransactions('wallet_address');

// Lấy thống kê
const userStats = await UserService.getUserStatistics('wallet_address');
const overviewStats = await UserService.getOverviewStatistics();
```

### 4. NFT APIs

```typescript
// Tạo giao dịch mint chưa ký
const buildResult = await NftService.buildMintTransaction(
  'candy_machine_address',
  'buyer_public_key'
);

// Gửi giao dịch đã ký
const sendResult = await NftService.sendSignedTransaction(
  'signed_transaction_base64',
  'wallet_address', // optional
  'candy_machine_address' // optional
);

// Lấy thông tin candy machine
const cmInfo = await NftService.getCandyMachineInfo('candy_machine_address');
```

### 5. Config APIs

```typescript
// Lấy cấu hình candy machine
const config = await ConfigService.getCandyMachineConfig('cm_address');

// Tạo/cập nhật cấu hình
const newConfig = await ConfigService.createOrUpdateConfig({
  address: 'cm_address',
  collectionAddress: 'collection_address',
  itemsAvailable: 1000,
  network: 'devnet',
});

// Kích hoạt candy machine
const activated = await ConfigService.activateCandyMachine('cm_address');
```

### 6. Health Checks

```typescript
// Kiểm tra health của tất cả services
const healthStatus = await checkAllServicesHealth();
console.log(healthStatus); // { user: true, nft: true, config: true, overall: true }

// Kiểm tra riêng lẻ
const userHealth = await UserService.healthCheck();
const nftHealth = await NftService.healthCheck();
const configHealth = await ConfigService.healthCheck();
```

## Cấu hình

### Environment Variables

```env
NEXT_PUBLIC_API_URI=http://localhost:4444
```

### API Base URL

Mặc định: `http://localhost:4444`

## Error Handling

Tất cả services đều có error handling tự động:

```typescript
try {
  const result = await UserService.getUserInfo('wallet_address');
} catch (error) {
  // Error sẽ được log automatically
  // 401 errors sẽ tự động xóa JWT token
  console.error('API call failed:', error.message);
}
```

## Types

Tất cả TypeScript interfaces được định nghĩa trong `types.ts`:

- `ApiResponse<T>` - Format response chung
- `User`, `Transaction`, `NFT` - User related types
- `CandyMachineInfo`, `CandyMachineConfig` - NFT/Config related types
- Request/Response interfaces cho từng API

## Logging

Services có built-in logging với emojis:

- 🔗 Wallet connection
- 👤 User operations
- 💾 Saving data
- 🖼️ NFT operations
- ⚙️ Config operations
- 📊 Statistics
- 🏥 Health checks
- ❌ Errors

## Notes

1. **Authentication**: Chỉ một số API cần JWT token (đã đánh dấu trong documentation)
2. **Error Handling**: 401 errors sẽ tự động xóa token và có thể redirect
3. **Timeouts**: Tất cả requests có timeout 30 giây, health checks 5 giây
4. **Logging**: Tất cả operations được log ra console để debug
5. **Type Safety**: Sử dụng TypeScript interfaces đầy đủ cho type safety
