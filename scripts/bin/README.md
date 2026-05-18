# Bundled minisign Binaries

Convenience copies of [minisign](https://github.com/jedisct1/minisign) so Windows mod authors can sign releases without a separate install step. The keypair-generator scripts (`scripts/generate-keypair.ps1` / `.sh`) prefer a system-installed `minisign` on `PATH` and fall back to the bundled copy only if `PATH` lookup fails.

macOS and Linux: install via your package manager (`brew install minisign`, `apt install minisign`, `pacman -S minisign`). We do not bundle for those platforms.

## Provenance

| File | Platform | Version | SHA-256 | Source |
|------|----------|---------|---------|--------|
| `win/minisign.exe` | Windows x86_64 | 0.12 | `5535be9e4e123831ebe6ef324aafe9dde507015c176191f9e20c3ad60567f9e1` | [github.com/jedisct1/minisign/releases](https://github.com/jedisct1/minisign/releases) — official `minisign-win64.zip` |

## Verifying the bundled binary yourself

Don't trust — verify. Compute the hash of the file in this repo and compare it to the value above and to the official release's published checksum.

```powershell
# Windows
Get-FileHash .\scripts\bin\win\minisign.exe -Algorithm SHA256
```

```bash
# Git Bash / WSL / Linux
sha256sum scripts/bin/win/minisign.exe
```

The three hashes — yours, the one in this file, and the one on the official release page — should match. If they don't, **do not run the binary**. Open an issue.

## Why bundle at all

- Zero install friction for the most common author platform.
- Removes a "which package manager?" support question from the issue tracker.
- Tiny cost — the binary is ~280 KB and minisign rarely needs updates (its surface is small and stable).

## Why this is safe

- Minisign is single-file, self-contained, no installer, no service.
- Source is auditable: <https://github.com/jedisct1/minisign>.
- The SHA-256 above pins the exact bytes — a tampered binary would change the hash and verification would fail.
- The bundled copy is never executed by the editor itself. It's only used locally by mod authors to sign their own releases. The editor verifies signatures in Rust via the `minisign-verify` crate — never shells out to the bundled binary.

## Updating

When a new minisign release lands:

1. Download the official Windows zip from <https://github.com/jedisct1/minisign/releases>.
2. Verify its signature / checksum on the release page.
3. Replace `scripts/bin/win/minisign.exe`.
4. Update the SHA-256 row in this README.
5. Commit with a message like `bump: minisign 0.12 → 0.13`.
