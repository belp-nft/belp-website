# 🔍 Candy Guard Diagnostic Guide

## What Changed

**File:** `src/providers/CandyMachineProvider.tsx`  
**Lines:** 1146-1166  
**Purpose:** Add Candy Guard support to mint transaction

## The Fix in Detail

### Before (Broken Path)
```
Mint Button Click
  ↓
mintNft() function
  ↓
Build mintConfig WITHOUT guard
  ↓
Call mintV2() with incomplete config
  ↓
UMI builds instruction
  ↓
🚫 MISSING accounts for guard!
  ↓
Blockchain rejects: "MissingRemainingAccount"
```

### After (Fixed Path)
```
Mint Button Click
  ↓
mintNft() function
  ↓
Build mintConfig
  ↓
✅ Check if guard exists
  ↓
✅ Include guard in config
  ↓
Call mintV2() with COMPLETE config
  ↓
UMI reads guard data
  ↓
✅ UMI adds guard accounts automatically
  ↓
Blockchain accepts: "Transaction confirmed"
  ↓
✅ NFT minted successfully!
```

## Console Logs Explained

### 🔍 "Checking if candy machine has a guard..."
- Agent: CandyMachineProvider starting mint process
- Next: Will check state.candyMachine for guard property

### ✅ "Found guard in candy machine, adding to mint config"
- Status: Guard detected ✅
- Action: Guard is being added to mintConfig
- Impact: Instruction will include guard accounts

### 📋 "Final mint config: {...}"
- Status: Config is complete
- Shows: All parameters including guard
- Next: About to build transaction

### ✅ "About to call mintV2 with proper config"
- Status: Ready to build instruction
- Next: Calling the Metaplex mintV2 function

### ✅ "Mint instruction built successfully"
- Status: Transaction instruction built ✅
- Next: Transaction will be sent to blockchain

### 📝 "Sending and confirming Belp NFT transaction..."
- Status: Sending to blockchain
- Wait: For blockchain confirmation (5-10 seconds)

### ✅ "Transaction confirmed: {...}"
- Status: BLOCKCHAIN ACCEPTED ✅
- Signature: Transaction is confirmed
- Next: NFT should appear in wallet

## Error Scenarios

### Still See "MissingRemainingAccount"?
```
Program log: Error Code: MissingRemainingAccount. Error Number: 6006.
```
- Guard is being included ✅
- But guard config format might be wrong
- Might need different guard property structure
- **Action:** Check guard object structure in logs

### See "custom program error: 0x..."?
```
Error processing Instruction 0: custom program error: 0x1776
```
- `0x1776` = 6006 = MissingRemainingAccount
- **Same fix applied** ✅
- **Keep testing**, logs should show if guard is detected

### See Different Error Code?
```
Error processing Instruction 0: custom program error: 0xXXXX
```
- Different error = different problem
- Guard might not be the issue
- **Action:** Report the error code

## Debug Checklist

Before reporting error, verify in console:

- [ ] Page fully loaded
- [ ] Wallet connected (shows address)
- [ ] "Checking if candy machine has a guard..." appeared
- [ ] "Found guard in candy machine..." appeared
- [ ] Full config logged with guard included
- [ ] "Sent transaction" message appeared
- [ ] Waited 10+ seconds for confirmation

## Guard Data Structure

When guard is found, it should look like:
```javascript
{
  candyMachine: "8C...",
  nftMint: {...},        // GeneratedSigner
  collectionMint: "9p...",
  collectionUpdateAuthority: "5F...",
  guard: {              // ← NEW! This is the Candy Guard config
    // Guard-specific accounts and settings
  }
}
```

The `guard` object contains:
- Candy Guard program ID
- Guard PDA addresses
- Guard configuration (gates, rules, etc.)

## Why Candy Guards Exist

Guards wrap Candy Machines to provide:

| Feature | Purpose |
|---------|---------|
| **Access Control** | Limit who can mint |
| **Rate Limiting** | Prevent spam minting |
| **Whitelist** | Only specific wallets |
| **Payment** | Alternative payment methods |
| **Bot Protection** | Prove human minting |
| **Burn Prevention** | Prevent immediate burns |

Without proper guard accounts in the instruction, the Guard program can't validate these rules.

## Testing the Fix

### Full Test (5 minutes)
1. ✅ Reload page (Ctrl+R)
2. ✅ Open console (F12)
3. ✅ Connect wallet
4. ✅ Click MINT
5. ✅ Check for "Found guard" log
6. ✅ Check for "Transaction confirmed"
7. ✅ Check for "minted successfully! 🐱"
8. ✅ Wait 30 seconds
9. ✅ Reload page
10. ✅ Verify NFT in collection

### Quick Test (2 minutes)
1. ✅ F12 → Console
2. ✅ Click MINT
3. ✅ Scroll console to find guard logs
4. ✅ Verify "Found guard" appears

## Success Indicators

🎯 **You'll see this in console:**
```
🔍 Checking if candy machine has a guard...
✅ Found guard in candy machine, adding to mint config
📋 Final mint config: {
  "candyMachine": "8C...",
  "nftMint": {...},
  "collectionMint": "9p...",
  "collectionUpdateAuthority": "5F...",
  "guard": {...}
}
✅ Mint instruction built successfully
📝 Sending and confirming Belp NFT transaction...
✅ Transaction confirmed: {...}
🎉 NFT added to walletNfts
```

---

**Key Takeaway:** Guard support added → Instruction now complete → Blockchain should accept mint!

**Next:** Run the test and share results!
