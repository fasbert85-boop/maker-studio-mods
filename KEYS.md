# Signing Keys for Mod Authors

Signed mods get a green **Verified** chip in the Maker Studio Marketplace and skip the "I understand this is unverified code" confirm step. Users are much more likely to install signed mods. Setting up a signing key takes about two minutes.

Signing uses [minisign](https://jedisct1.github.io/minisign/) — a tiny, free, single-file CLI. No GPG complexity, no account, no server.

## The fast path

```powershell
# Windows (PowerShell)
.\scripts\generate-keypair.ps1
```

```bash
# macOS / Linux
./scripts/generate-keypair.sh
```

The script:

1. Picks a minisign binary — prefers a system install on `PATH`, otherwise falls back to the **bundled Windows copy** under [`scripts/bin/win/minisign.exe`](scripts/bin/) so Windows authors don't need any install step. (macOS/Linux: install via `brew`/`apt`/`pacman` first — see [scripts/bin/README.md](scripts/bin/README.md).)
2. Asks for your mod id.
3. Runs `minisign -G` with sensible filenames.
4. Prints your public key line — copy it into your registry entry's `pubkey` field.

Skip ahead to [Step 4 — Use it](#step-4--use-it) once the script finishes.

Want to use a system-installed minisign instead of the bundled one? Just install it (`scoop install minisign` on Windows) before running the script — the script auto-detects.

## The manual path

### Step 1 — Install minisign

| Platform | Command |
|----------|---------|
| Windows (scoop) | `scoop install minisign` |
| Windows (manual) | Download from the [minisign releases page](https://github.com/jedisct1/minisign/releases), unzip, add the folder to your `PATH` |
| macOS | `brew install minisign` |
| Debian / Ubuntu | `sudo apt install minisign` |
| Arch | `sudo pacman -S minisign` |

Verify:

```
minisign -v
```

### Step 2 — Generate your keypair

```
minisign -G -p com.yourname.mymod.pub -s com.yourname.mymod.key
```

You'll be prompted for a password **twice**. Pick a strong one. Save it in your password manager.

Two files are written in the current directory:

- `com.yourname.mymod.pub` — the public key. Safe to share. Line 2 (starts with `RW`) is what you'll paste into the registry entry.
- `com.yourname.mymod.key` — the secret key. **Never share. Never commit.**

### Step 3 — Back up the secret key

This is the single most important step.

Put a copy of `com.yourname.mymod.key` in **at least two offline locations**:

- A USB stick stored physically separate from your main computer.
- An encrypted cloud vault (Bitwarden, 1Password Files, Cryptomator + Dropbox, etc.).

If you lose this file, you cannot sign new releases under the same identity. The Marketplace will refuse to install your updates (signature mismatch). Your only path forward is to ask the registry maintainer to swap your `pubkey` for a new one — and existing users will get sig-failure errors until they uninstall and reinstall.

Also write down the password and store it the same way.

### Step 4 — Use it

When you ship a release:

```
minisign -S -s com.yourname.mymod.key -m com.yourname.mymod-1.0.0.zip
```

Produces `com.yourname.mymod-1.0.0.zip.minisig`. Attach **both** files to your GitHub Release.

In your `index.json` entry, set the `pubkey` field to the second line of your `.pub` file:

```json
{
  "id": "com.yourname.mymod",
  "...": "...",
  "pubkey": "RW..."
}
```

The editor downloads the `.minisig` along with the zip and verifies the signature against the `pubkey` before installing. Mismatch = install blocked.

## Rotating your key

If you suspect your secret key is compromised, or you simply want a fresh one:

1. Generate a new keypair (different filenames so you don't overwrite the old one).
2. Open a PR to the registry replacing the `pubkey` field in your entry with the new public key.
3. Once merged, sign all future releases with the new key.

Existing users running your last-signed-with-old-key release are unaffected. Their next update check will pull the new release, see the new pubkey, and verify against the new signature — clean swap.

Old `.minisig` files attached to past releases keep verifying with the old pubkey for archival purposes, but the marketplace only cares about the latest release.

## FAQ

**Do I have to sign?** No. Unsigned mods install fine but show "Unverified" with an extra confirmation step. Signing builds trust over time.

**Can multiple co-authors share one key?** Technically yes, but every person who holds the key can sign as the mod. Treat it like a shared password — risky. Better to designate one signer.

**What if minisign is missing on a user's machine?** It isn't needed on the user side. Verification happens inside the editor's Rust backend using the `minisign-verify` library. Users never install minisign.

**Why minisign instead of GPG?** Minisign is one file, no keyring management, no web-of-trust, no expiry surprises, no agent. The verify code in the editor is ~100 lines of Rust. GPG's surface area is orders of magnitude larger for the same job here.
