# Store Management on Wallet Disconnect

## Overview

Khi disconnect wallet, hệ thống sẽ tự động clear toàn bộ stores để đảm bảo không có data leak giữa các session khác nhau.

## Implementation

### 1. **Updated useWallet Hook**

```typescript
import { useConfigActions } from "@/stores/config";

export function useWallet(onConnected?: (info: Connected) => void) {
  const { clearConfig } = useConfigActions();
  
  const disconnect = useCallback(async () => {
    // ... disconnect wallet provider
    
    // Reset all state
    setConnectedType(null);
    setSolAddress(null);
    setSolLamports(0);
    setConnectedWallet(null);
    setAuthToken(null);
    setUserStatistics(null);
    setTransactions([]);

    // Clear all stores
    clearConfig();

    // Cleanup tokens and flags
    AuthService.removeToken();
    window.localStorage.setItem("wallet-disconnected", "true");
  }, [clearConfig, ...otherDeps]);
}
```

### 2. **Stores Cleared on Disconnect**

#### Config Store
- `config: null`
- `collectionAddress: null`
- `candyMachineAddress: null`
- `totalMinted: 0`
- `totalSupply: 0`
- `loading: false`
- `error: null`

#### Future Stores
When adding more stores, update the disconnect function:
```typescript
const disconnect = useCallback(async () => {
  // ... existing cleanup
  
  // Clear all stores
  clearConfig();
  clearUserData();  // Future store
  clearNftData();   // Future store
  clearMintHistory(); // Future store
}, [clearConfig, clearUserData, clearNftData, clearMintHistory]);
```

### 3. **Token Utilities Also Clear Stores**

```typescript
const { clearToken } = useWallet();

// This will clear both auth token and all stores
clearToken();
```

## Usage Examples

### Basic Disconnect
```typescript
const { disconnect, connectWallet } = useWallet();

// User clicks disconnect
await disconnect();
// ✅ Wallet disconnected
// ✅ Auth token cleared  
// ✅ All stores cleared
// ✅ localStorage flags set
```

### Force Clear Everything
```typescript
const { clearToken } = useWallet();

// Emergency clear all data
clearToken();
// ✅ Token removed
// ✅ All stores cleared
// ❌ Wallet still connected (provider level)
```

### Reconnect Flow
```typescript
// After disconnect, reconnecting will start fresh
await connectWallet('phantom');
// ✅ New connection
// ✅ Fresh auth token
// ✅ Clean store state
// ✅ New user data loaded
```

## Store State Lifecycle

```
CONNECT WALLET
    ↓
Load Config Data → Store populated
    ↓
User Action → Store updated
    ↓
DISCONNECT
    ↓
Store cleared → Clean state
    ↓
RECONNECT
    ↓
Fresh start → New data loaded
```

## Debugging Store Clearing

### Console Logs
```typescript
const handleDisconnect = async () => {
  console.log('Before disconnect:', { config, mintStats });
  await disconnect();
  setTimeout(() => {
    console.log('After disconnect:', { config, mintStats });
  }, 100);
};
```

### Check Store State
```typescript
import { useConfig, useMintStats } from '@/stores/config';

const config = useConfig();
const mintStats = useMintStats();

console.log('Config:', config);        // null after disconnect
console.log('Stats:', mintStats);      // { minted: 0, supply: 0 }
```

## Security Benefits

### 1. **Data Isolation**
- Prevents data leak between different wallet sessions
- Each connection starts with clean state
- No stale data from previous sessions

### 2. **Privacy Protection**
- User statistics cleared on disconnect
- Transaction history removed
- Config data reset

### 3. **Memory Management**
- Prevents memory leaks from accumulated data
- Clean state for better performance
- Reduces storage footprint

## Best Practices

### 1. **Always Use Disconnect**
```typescript
// ✅ Good
await disconnect();

// ❌ Bad - manual cleanup
setWalletAddress(null);
AuthService.removeToken();
// Forgot to clear stores!
```

### 2. **Check Store State After Actions**
```typescript
const { getDebugInfo } = useWallet();

console.log('Debug info:', getDebugInfo());
// Includes store state in debug output
```

### 3. **Handle Errors Gracefully**
```typescript
const disconnect = useCallback(async () => {
  try {
    // Normal disconnect flow
  } catch (error) {
    // Force cleanup even on error
    clearConfig();
    clearAllStores();
  }
}, []);
```

## Future Extensions

### Adding New Stores
```typescript
// 1. Create store actions
export const useUserActions = () => {
  const clearUserData = useUserStore(state => state.clearUserData);
  return { clearUserData };
};

// 2. Update useWallet
const { clearConfig } = useConfigActions();
const { clearUserData } = useUserActions();

const disconnect = useCallback(async () => {
  // ... existing cleanup
  clearConfig();
  clearUserData(); // Add new store clear
}, [clearConfig, clearUserData]);
```

### Global Store Manager
```typescript
// Future: Central store management
export const useStoreManager = () => {
  const clearAllStores = useCallback(() => {
    clearConfig();
    clearUserData();
    clearNftData();
    clearMintHistory();
    // ... all future stores
  }, []);
  
  return { clearAllStores };
};
```

## Testing Checklist

- [ ] Disconnect clears config store
- [ ] Disconnect clears auth token  
- [ ] Disconnect sets localStorage flag
- [ ] Reconnect starts with clean state
- [ ] clearToken() also clears stores
- [ ] Error handling preserves cleanup
- [ ] Debug info shows cleared state
- [ ] No memory leaks after disconnect

This ensures complete data isolation and security when switching between different wallet connections.
