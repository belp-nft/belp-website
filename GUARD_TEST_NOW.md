# 🚀 Test Candy Guard Fix - 3 Minute Guide

## Step 1: Reload Page (30 seconds)
```
Ctrl + R (or Cmd + R on Mac)
Wait for page to fully load
```

## Step 2: Open DevTools Console (30 seconds)
```
Press: F12 (or Cmd + Option + J on Mac)
Click: "Console" tab at top
```

## Step 3: Connect Wallet (30 seconds)
- If not already connected, click "Connect Wallet"
- Select your wallet
- Approve the connection

## Step 4: Click MINT Button (1 minute)
```
Click the MINT / Mint NFT button
Watch the console for logs
```

## Step 5: Check Console for Guard Logs (30 seconds)

### ✅ SUCCESS - Look for these logs:
```
🔍 Checking if candy machine has a guard...
✅ Found guard in candy machine, adding to mint config
📋 Final mint config: {
  "candyMachine": "...",
  "nftMint": {...},
  "collectionMint": "...",
  "collectionUpdateAuthority": "...",
  "guard": {...}
}
✅ Mint instruction built successfully
✅ Transaction confirmed: {...}
🎉 NFT added to walletNfts: ...
Belp NFT minted successfully! 🐱
```

### ❌ ERROR - If still failing:
Copy entire console output and share with developer

## Expected Behaviors

| Behavior | Meaning |
|----------|---------|
| Guard found in logs | ✅ Good - guard is being used |
| "Mint instruction built successfully" | ✅ Transaction building worked |
| "Transaction confirmed" | ✅ Blockchain accepted it |
| "minted successfully! 🐱" | ✅ **SUCCESS!** |
| "custom program error: 0x1776" | ❌ Guard still missing accounts |
| Different error code | ❌ Different issue |

## Troubleshooting

### If you see "Missing expected remaining account"
- Guard is being found but accounts still not correct
- This means guard config format may need adjustment
- Share full console logs with developer

### If you see "Wallet not connected"
- Reconnect wallet in step 3
- Make sure wallet has SOL for transaction

### If no mint button appears
- Wait for page to fully load
- Check that ConfigProvider has data
- Refresh page (Ctrl+R)

## 📱 Success Indicators

✅ All of these should happen:
1. See guard logs in console
2. Transaction sent with "sending and confirming"
3. "Transaction confirmed" appears
4. "minted successfully! 🐱" shows
5. NFT appears in collection if you reload after ~30 seconds

---

**Duration:** Should complete in 3 minutes  
**Report:** Share console screenshot if error occurs  
**Next:** Once working, guard is integrated and ready for production!
