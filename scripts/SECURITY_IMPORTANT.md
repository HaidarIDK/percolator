# 🔐 CRITICAL SECURITY NOTICE

## ⚠️ NEVER COMMIT PRIVATE KEYS TO GITHUB!

This directory contains **PRIVATE KEYPAIR FILES** that control your Solana programs and wallets.

---

## 🔒 Protected Files

The following files are **AUTOMATICALLY IGNORED** by Git:

```
*-keypair.json      ← All keypair files
*-wallet.json       ← Wallet files
*-program.json      ← Program deployment keys
perc-*.json         ← PERC wallet variants
slab-*.json         ← Slab program variants
rout-*.json         ← Router program variants
amm-*.json          ← AMM program variants
oral-*.json         ← Oracle program variants
*.key               ← Any .key files
*.pem               ← Any .pem files
id.json             ← Solana default keypair
```

---

## ✅ What's Safe to Commit

These files are **OK** to push to GitHub:
- `*.ts` - TypeScript scripts
- `*.js` - JavaScript files
- `package.json` - Dependencies
- `README.md` - Documentation

---

## 🚨 If You Accidentally Commit Keys

**DO THIS IMMEDIATELY:**

1. **Rotate the compromised keys** - generate new ones
2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch scripts/*-keypair.json" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (after backing up):
   ```bash
   git push origin --force --all
   ```
4. **Contact team** if keys had any funds/permissions

---

## 💾 How to Backup Keys Safely

### Local Backup:
```bash
# Copy to a secure USB drive
cp *-keypair.json /path/to/secure/usb/

# Or encrypted backup
tar -czf - *-keypair.json | gpg -c > keypairs-backup.tar.gz.gpg
```

### DO NOT:
- ❌ Email keys to yourself
- ❌ Upload to cloud storage (Dropbox, Google Drive, etc.)
- ❌ Copy to public servers
- ❌ Share in Discord/Slack/chat
- ❌ Commit to GitHub (even private repos!)

### DO:
- ✅ Store on encrypted USB drive
- ✅ Use password manager (1Password, Bitwarden)
- ✅ Keep paper backup in safe
- ✅ Use hardware wallets for production

---

## 🔍 Verify Protection

Check that keys are ignored:
```bash
git check-ignore -v scripts/amm-keypair.json
# Should show: .gitignore:XX:pattern
```

Check nothing is tracked:
```bash
git ls-files | grep -i keypair
# Should return nothing
```

---

## 📋 Current Generated Addresses

Track your **PUBLIC** addresses here (safe to share):

- **Wallet:** `PERC...` (generating...)
- **AMM:** `AMMjkEeFdasQ8fs9a9HQyJdciPHtDHVEat8yxiXrTP6p` ✅
- **Slab:** `SLAB...` (generating...)
- **Oracle:** `ORAL...` (generating...)
- **Router:** `ROUT...` (generating...)

**Public keys are safe to share.** Private keys (keypair files) are NOT!

---

## 🆘 Questions?

- **Is it safe to share public keys?** YES ✅
- **Is it safe to share keypair.json files?** NO ❌
- **Can I commit public keys to GitHub?** YES ✅
- **Can I commit keypair.json files?** NEVER ❌

---

**Remember:** If someone gets your keypair file, they **OWN** that address!

