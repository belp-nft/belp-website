# Troubleshooting: Token Authentication Issues

## Vấn đề: Disconnect sau đó Connect lại bị lỗi không lấy được token

### 🔍 **Phân tích nguyên nhân:**

1. **Logic xử lý `wallet-disconnected` flag không đúng**
   - Khi disconnect, set flag `"true"` nhưng không clear khi connect lại
   - Hook skip auto-connect khi flag này tồn tại

2. **Token không được refresh**
   - Token cũ có thể đã expire
   - Không có cơ chế re-authenticate khi connect lại

3. **Race condition trong authentication flow**
   - Wallet provider connect trước khi backend authentication hoàn thành
   - State management không đồng bộ

### 🛠️ **Các fix đã implement:**

#### 1. **Cải thiện AuthService**
```typescript
// Thêm token validation
static isTokenValid(): boolean {
  const token = this.getToken();
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Auto cleanup invalid token
static validateAndCleanToken(): boolean {
  if (!this.isTokenValid()) {
    this.removeToken();
    return false;
  }
  return true;
}
```

#### 2. **Cải thiện useWallet Logic**

**a) Fix disconnect logic:**
```typescript
const disconnect = useCallback(async () => {
  // Better logging
  console.log("Disconnecting wallet...", { 
    connectedWallet, 
    hasToken: AuthService.hasToken(),
    address: solAddress 
  });
  
  // Force cleanup even if error occurs
  // Set disconnected flag to prevent auto-reconnect
  window.localStorage.setItem("wallet-disconnected", "true");
}, []);
```

**b) Fix connect logic:**
```typescript
const connectWallet = useCallback(async (walletType: WalletType) => {
  // Clear disconnected flag
  window.localStorage.removeItem("wallet-disconnected");
  
  // Better error handling for authentication
  if (connectResult.success) {
    if ((connectResult as any).data?.accessToken) {
      AuthService.setToken((connectResult as any).data.accessToken);
      setAuthToken((connectResult as any).data.accessToken);
      console.log("JWT token saved successfully");
    } else {
      console.warn("No access token received from backend");
    }
  } else {
    console.error("Backend authentication failed:", connectResult.message);
  }
}, []);
```

**c) Fix useEffect logic:**
```typescript
useEffect(() => {
  // Setup listeners first
  Object.keys(WALLET_CONFIGS).forEach((walletType) => {
    setupWalletListeners(walletType as WalletType);
  });

  // Check disconnect flag
  const wasManuallyDisconnected = window.localStorage.getItem("wallet-disconnected") === "true";
  
  if (wasManuallyDisconnected) {
    console.log("User manually disconnected, skipping auto-connect");
    return;
  }

  // Always try to re-authenticate when found connected wallet
  if (provider?.isConnected === true && provider?.publicKey) {
    // Re-authenticate to get fresh token
    UserService.connectWallet(addr)
      .then((connectResult) => {
        if (connectResult.success && connectResult.data?.accessToken) {
          AuthService.setToken(connectResult.data.accessToken);
          setAuthToken(connectResult.data.accessToken);
          console.log("Re-authentication successful, token refreshed");
        }
      });
  }
}, []);
```

#### 3. **Enhanced loadUserData với retry mechanism**
```typescript
const loadUserData = useCallback(async (walletAddress: string, retryAuth: boolean = false) => {
  try {
    const statsResult = await UserService.getUserStatistics(walletAddress);
    
    if (statsResult.success) {
      setUserStatistics(statsResult.data);
    } else if (statsResult.message?.includes("Unauthorized") && !retryAuth) {
      // Auto retry authentication once
      const connectResult = await UserService.connectWallet(walletAddress);
      if (connectResult.success && connectResult.data?.accessToken) {
        AuthService.setToken(connectResult.data.accessToken);
        setAuthToken(connectResult.data.accessToken);
        return loadUserData(walletAddress, true); // Retry with fresh token
      }
    }
  } catch (error) {
    if (error.response?.status === 401 && !retryAuth) {
      // Clear invalid token and retry
      AuthService.removeToken();
      setAuthToken(null);
    }
  }
}, []);
```

### 🧪 **Testing Flow:**

1. **Connect wallet** → Verify token saved
2. **Disconnect** → Verify token cleared & disconnect flag set
3. **Connect again** → Verify:
   - Disconnect flag cleared
   - Fresh authentication
   - New token saved
   - User data loaded

### 🔧 **Debug Tools:**

```typescript
const { getDebugInfo, forceReconnect, hasValidToken } = useWallet();

// Check current state
console.log(getDebugInfo());

// Force reconnect if issues
await forceReconnect();

// Check token validity
console.log('Token valid:', hasValidToken());
```

### 📋 **Common Issues & Solutions:**

#### Issue 1: "Token still invalid after reconnect"
**Solution:** Backend token might be corrupted
```typescript
// Clear all auth state and reconnect
AuthService.removeToken();
localStorage.removeItem('wallet-disconnected');
await disconnect();
await connectWallet('phantom');
```

#### Issue 2: "Wallet connects but no backend data"
**Solution:** Authentication service might be down
```typescript
// Check if backend is responding
const result = await UserService.connectWallet(address);
console.log('Backend response:', result);
```

#### Issue 3: "Auto-connect doesn't work"
**Solution:** Check disconnect flag
```typescript
// Clear disconnect flag manually
localStorage.removeItem('wallet-disconnected');
window.location.reload();
```

### 🚀 **Best Practices:**

1. **Always check token validity before API calls**
2. **Implement retry mechanism for auth failures**
3. **Clear disconnect flag on successful connect**
4. **Log authentication flow for debugging**
5. **Handle backend errors gracefully**

### 📊 **Monitoring:**

Monitor these metrics to catch auth issues:
- Token refresh rate
- Authentication failure rate  
- Disconnect/reconnect patterns
- Backend response times
