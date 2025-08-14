# User API Documentation

## Base URL
```
/api/user
```

## Authentication
Hầu hết các endpoints (trừ `/connect`) yêu cầu JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 **1. Connect Wallet**
**Endpoint:** `POST /api/user/connect`  
**Description:** Kết nối wallet và nhận JWT token  
**Authentication:** ❌ Không cần

### Request
```json
{
  "walletAddress": "string" // Required
}
```

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "walletAddress": "string",
      "createdAt": "string",
      "updatedAt": "string"
    },
    "accessToken": "string"
  },
  "message": "Wallet connected successfully"
}
```

### Response Error (400)
```json
{
  "success": false,
  "message": "Wallet address is required"
}
```

---

## 👤 **2. Get User Info**
**Endpoint:** `GET /api/user/info`  
**Description:** Lấy thông tin user hiện tại từ JWT  
**Authentication:** ✅ Required

### Request
- Không cần body
- `walletAddress` được lấy từ JWT token

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": "string",
    "walletAddress": "string",
    "createdAt": "string",
    "updatedAt": "string",
    // ... other user fields
  }
}
```

### Response Error (404)
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

---

## 💰 **3. Get Wallet Balance**
**Endpoint:** `GET /api/user/balance`  
**Description:** Lấy Solana balance của wallet hiện tại  
**Authentication:** ✅ Required

### Request
- Không cần body
- `walletAddress` được lấy từ JWT token

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "balance": "number", // SOL balance
    "lamports": "number" // Balance in lamports
  },
  "message": "Wallet balance retrieved successfully"
}
```

---

## 📝 **4. Save Transaction**
**Endpoint:** `POST /api/user/transaction`  
**Description:** Lưu lịch sử giao dịch  
**Authentication:** ✅ Required

### Request
```json
{
  "transactionSignature": "string", // Required
  "candyMachineAddress": "string", // Required
  "amount": "number", // Optional
  "status": "string", // Optional
  "metadata": "object" // Optional
}
```
**Note:** `walletAddress` được tự động lấy từ JWT, không cần truyền

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": "string",
    "walletAddress": "string",
    "transactionSignature": "string",
    "candyMachineAddress": "string",
    "amount": "number",
    "status": "string",
    "createdAt": "string"
  },
  "message": "Transaction saved successfully"
}
```

### Response Error (400)
```json
{
  "success": false,
  "message": "Missing required fields: transactionSignature, candyMachineAddress"
}
```

---

## 🖼️ **5. Save NFT Info**
**Endpoint:** `POST /api/user/nft`  
**Description:** Lưu thông tin NFT  
**Authentication:** ✅ Required

### Request
```json
{
  "nftAddress": "string", // Required
  "name": "string", // Required
  "imageUrl": "string", // Required
  "description": "string", // Optional
  "attributes": "array", // Optional
  "collection": "string" // Optional
}
```
**Note:** `walletAddress` được tự động lấy từ JWT, không cần truyền

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "id": "string",
    "walletAddress": "string",
    "nftAddress": "string",
    "name": "string",
    "imageUrl": "string",
    "description": "string",
    "createdAt": "string"
  },
  "message": "NFT info saved successfully"
}
```

### Response Error (400)
```json
{
  "success": false,
  "message": "Missing required fields: nftAddress, name, imageUrl"
}
```

---

## 📊 **6. Get Transaction History**
**Endpoint:** `GET /api/user/transactions`  
**Description:** Lấy lịch sử giao dịch của user hiện tại  
**Authentication:** ✅ Required

### Request Query Parameters
- `limit` (optional): Number of records to return (default: 50)
- `skip` (optional): Number of records to skip (default: 0)

### Example
```
GET /api/user/transactions?limit=20&skip=0
```

### Response Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "walletAddress": "string",
      "transactionSignature": "string",
      "candyMachineAddress": "string",
      "amount": "number",
      "status": "string",
      "createdAt": "string"
    }
  ],
  "total": "number"
}
```

---

## 🎨 **7. Get User NFTs**
**Endpoint:** `GET /api/user/nfts`  
**Description:** Lấy danh sách NFT của user hiện tại  
**Authentication:** ✅ Required

### Request Query Parameters
- `limit` (optional): Number of records to return (default: 50)
- `skip` (optional): Number of records to skip (default: 0)

### Example
```
GET /api/user/nfts?limit=20&skip=0
```

### Response Success (200)
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "walletAddress": "string",
      "nftAddress": "string",
      "name": "string",
      "imageUrl": "string",
      "description": "string",
      "attributes": "array",
      "createdAt": "string"
    }
  ],
  "total": "number"
}
```

---

## 📈 **8. Get Overall Statistics**
**Endpoint:** `GET /api/user/statistics/overview`  
**Description:** Lấy thống kê tổng quan của hệ thống  
**Authentication:** ✅ Required

### Request
- Không cần body

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "totalUsers": "number",
    "totalTransactions": "number",
    "totalNfts": "number",
    "totalVolume": "number"
  }
}
```

---

## 📊 **9. Get User Statistics**
**Endpoint:** `GET /api/user/statistics`  
**Description:** Lấy thống kê của user hiện tại  
**Authentication:** ✅ Required

### Request
- Không cần body
- `walletAddress` được lấy từ JWT token

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "totalTransactions": "number",
    "totalNfts": "number",
    "totalSpent": "number",
    "firstTransactionDate": "string",
    "lastTransactionDate": "string"
  }
}
```

---

## 🗑️ **10. Clear Transaction History**
**Endpoint:** `DELETE /api/user/transactions`  
**Description:** Xóa toàn bộ lịch sử giao dịch của user hiện tại  
**Authentication:** ✅ Required

### Request
- Không cần body
- `walletAddress` được lấy từ JWT token

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "deletedCount": "number"
  },
  "message": "Deleted X transactions"
}
```

---

## 🔧 **Frontend Implementation Example**

### 1. Set up Axios interceptor
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://your-api-url/api/user'
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Connect wallet
```javascript
const connectWallet = async (walletAddress) => {
  try {
    const response = await api.post('/connect', { walletAddress });
    const { accessToken } = response.data.data;
    
    // Save token
    localStorage.setItem('accessToken', accessToken);
    
    return response.data;
  } catch (error) {
    console.error('Connect wallet failed:', error.response.data);
  }
};
```

### 3. Get user info
```javascript
const getUserInfo = async () => {
  try {
    const response = await api.get('/info');
    return response.data;
  } catch (error) {
    console.error('Get user info failed:', error.response.data);
  }
};
```

### 4. Save transaction
```javascript
const saveTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transaction', {
      transactionSignature: transactionData.signature,
      candyMachineAddress: transactionData.candyMachine,
      amount: transactionData.amount
    });
    return response.data;
  } catch (error) {
    console.error('Save transaction failed:', error.response.data);
  }
};
```

---

## 📝 **Important Notes**

1. **JWT Token:** Sau khi connect wallet thành công, lưu `accessToken` và gửi kèm trong header của mọi request tiếp theo
2. **Wallet Address:** Không cần truyền `walletAddress` trong body/param nữa, nó được tự động lấy từ JWT
3. **Error Handling:** Tất cả endpoints đều trả về format nhất quán với `success`, `data`, `message`
4. **Pagination:** Các endpoints list data hỗ trợ `limit` và `skip` parameters
5. **Security:** User chỉ có thể truy cập data của chính họ thông qua JWT

## 🚀 **Migration từ version cũ**

Nếu frontend đang dùng version cũ, cần update:

1. **URLs:** Bỏ `:walletAddress` param khỏi URLs
2. **Body:** Bỏ `walletAddress` khỏi request body
3. **Headers:** Đảm bảo gửi JWT token trong Authorization header

**Ví dụ migration:**
```javascript
// OLD
GET /api/user/ABC123.../transactions
POST /api/user/transaction { walletAddress: "ABC123...", ... }

// NEW  
GET /api/user/transactions
POST /api/user/transaction { ... } // No walletAddress needed
```
