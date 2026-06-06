# RO-HTTP
## Network Emulator & Security Testing Tool

**Version 1.5.3**

---

## What It Does

ro-http lets you see how different types of HTTP clients look to a web server. It mimics the network behavior of official Roblox servers and various third-party Roblox clients. You can use it to test your own systems, understand how server-side filtering works, or analyze network fingerprints.

---

## How It Works

The tool simulates seven different client profiles, each with unique settings across multiple network layers:

### Application Layer (HTTP)
- Custom headers and User-Agent strings
- Auto-generated Roblox-specific headers
- Compression support (gzip, deflate, brotli)

### TLS Layer
- JA3 fingerprints
- Cipher suite ordering
- Protocol negotiation (h2, http/1.1)
- Certificate validation behavior

### TCP Layer
- TTL values (64 for Linux/Android, 128 for Windows)
- Window sizing and scaling
- SACK and timestamp options
- Congestion control (CUBIC, NewReno)

### IP Layer
- SSRF protection rules
- Private IP blocking
- DNS behavior

---

## Profiles

### Standard (Official Roblox Server)
**Profile Key:** `standard`

| Setting | Value |
|---------|-------|
| Source | AWS EC2 Linux 5.x |
| HTTP Engine | libcurl with BoringSSL |
| SSL Verification | Strict |
| Cipher Suites | 18 (AES-GCM, CHACHA20) |
| ALPN | h2, http/1.1 |
| ECDH Curves | X25519, prime256v1, secp384r1 |
| TCP TTL | 64 |
| TCP Window | 29200 |
| Window Scale | 7 (x128) |
| SACK | On |
| Timestamps | On |
| Congestion Control | CUBIC |
| SSRF Guard | On |
| Rate Limit | 500 req/min |
| Max Body | 1 MB |
| User-Agent | Roblox/Linux 2023 (compatible; HttpService) |
| User-Agent Locked | Yes |

---

### Synapse X (Windows Client)
**Profile Key:** `synapse-x`

| Setting | Value |
|---------|-------|
| Source | Windows 10/11 x64 |
| HTTP Engine | WinHTTP with Schannel |
| SSL Verification | Off |
| Cipher Suites | 14 |
| ALPN | http/1.1 only |
| ECDH Curves | prime256v1, X25519, secp384r1 |
| TCP TTL | 128 |
| TCP Window | 65535 |
| Window Scale | 8 (x256) |
| SACK | On |
| Timestamps | Off |
| Congestion Control | NewReno |
| SSRF Guard | Off |
| Rate Limit | None |
| Max Body | Unlimited |
| User-Agent | Synapse/6.6.6 (Roblox Client; Windows NT 10.0; Win64; x64) |
| User-Agent Locked | No |

---

### Delta (Android Client)
**Profile Key:** `delta`

| Setting | Value |
|---------|-------|
| Source | Android 12-14 arm64 |
| HTTP Engine | OkHttp with Conscrypt |
| SSL Verification | Off |
| Cipher Suites | 10 |
| ALPN | h2, http/1.1 |
| ECDH Curves | X25519, prime256v1 |
| TCP TTL | 64 |
| TCP Window | 65535 |
| Window Scale | 8 (x256) |
| SACK | On |
| Timestamps | On |
| Congestion Control | CUBIC |
| SSRF Guard | Off |
| Rate Limit | None |
| Max Body | Unlimited |
| User-Agent | Delta/1.0.0 (Roblox Mobile Client; Android 13; arm64-v8a) |
| User-Agent Locked | No |
| Auto Headers | Roblox-Id, Roblox-Game-Id |

---

### KRNL (Windows Client)
**Profile Key:** `krnl`

| Setting | Value |
|---------|-------|
| Source | Windows 10 x64 |
| HTTP Engine | WinInet with Schannel |
| SSL Verification | Off |
| Cipher Suites | 8 |
| ALPN | http/1.1 only |
| ECDH Curves | prime256v1, X25519 |
| TCP TTL | 128 |
| TCP Window | 65535 |
| Window Scale | 8 (x256) |
| SACK | On |
| Timestamps | Off |
| Congestion Control | NewReno |
| SSRF Guard | Off |
| Rate Limit | None |
| Max Body | Unlimited |
| User-Agent | KRNL/1.0 (Client; Windows NT 10.0; Win64; x64) |
| User-Agent Locked | No |

---

### Fluxus (Android Client)
**Profile Key:** `fluxus`

| Setting | Value |
|---------|-------|
| Source | Android 10-13 arm64 |
| HTTP Engine | OkHttp (Android) |
| SSL Verification | Off |
| Cipher Suites | 6 |
| ALPN | h2, http/1.1 |
| ECDH Curves | X25519, prime256v1 |
| TCP TTL | 64 |
| TCP Window | 65535 |
| Window Scale | 8 (x256) |
| SACK | On |
| Timestamps | On |
| Congestion Control | CUBIC |
| SSRF Guard | Off |
| Rate Limit | None |
| Max Body | Unlimited |
| User-Agent | Fluxus/2.0 (Mobile Client; Android; arm64) |
| User-Agent Locked | No |

---

### Arceus X (iOS/Android Client)
**Profile Key:** `arceus-x`

| Setting | Value |
|---------|-------|
| Source | iOS 15-17 / Android 12-14 |
| HTTP Engine | NSURLSession / Conscrypt |
| SSL Verification | Off |
| Cipher Suites | 10 |
| ALPN | h2, http/1.1 |
| ECDH Curves | X25519, prime256v1, secp384r1 |
| TCP TTL | 64 |
| TCP Window | 65535 |
| Window Scale | 6 (x64) |
| SACK | On |
| Timestamps | On |
| Congestion Control | CUBIC |
| SSRF Guard | Off |
| Rate Limit | None |
| Max Body | Unlimited |
| User-Agent | ArceuX/3.1.0 (Mobile; iOS 16.6; iPhone14,3) |
| User-Agent Locked | No |
| Auto Headers | Roblox-Id, Roblox-Game-Id |

---

### Script-Ware (Windows/macOS Client)
**Profile Key:** `script-ware`

| Setting | Value |
|---------|-------|
| Source | Windows 10/11 / macOS 13+ |
| HTTP Engine | libcurl / NSURLSession |
| SSL Verification | Off |
| Cipher Suites | 8 |
| ALPN | http/1.1 only |
| ECDH Curves | prime256v1, X25519 |
| TCP TTL | 128 |
| TCP Window | 65535 |
| Window Scale | 8 (x256) |
| SACK | On |
| Timestamps | Off |
| Congestion Control | NewReno |
| SSRF Guard | Off |
| Rate Limit | None |
| Max Body | Unlimited |
| User-Agent | Script-Ware/1.0 (Client; Windows NT 10.0 / macOS 13.0) |
| User-Agent Locked | No |

---

## Modes

### Request Mode (default)
Makes a single HTTP request with the chosen profile. Shows status, headers, and response body.

### Scan Mode
Tests all seven profiles against the same URL and compares results. Helps detect if a server treats different clients differently.

### Fuzz Mode
Replaces a marker (default: FUZZ) in the URL or body with words from a list. Good for discovering endpoints or testing input validation.

### Replay Mode
Sends the same request multiple times with delays. Useful for measuring response time consistency or detecting rate limiting.

### Fingerprint Mode
Shows the TLS and TCP fingerprint of a profile without making any actual request.

---

## Commands

### Basic Usage
```
ro-http <url> [method]
```

### Options

| Flag | Description |
|------|-------------|
| `-p, --profile` | Pick a profile (standard, synapse-x, delta, krnl, fluxus, arceus-x, script-ware) |
| `-H` | Add a custom header |
| `-d` | Set request body |
| `--body-file` | Read body from file |
| `--place-id` | Set Roblox-Id header |
| `--universe-id` | Set Roblox-Game-Id header |
| `-t, --timeout` | Timeout in milliseconds |
| `--no-redirects` | Don't follow redirects |
| `--max-redirects` | Max redirects to follow |
| `-f, --format` | Output: full, body, headers, status, json, raw |
| `-o, --output` | Save to file |
| `-v` | Show socket events |
| `-q` | Quiet mode |
| `--no-ssrf` | Disable SSRF blocking (standard profile only) |
| `--no-rate-limit` | Disable rate limiting (standard profile only) |
| `--scan` | Test all profiles |
| `--fuzz <file>` | Run fuzz mode with wordlist |
| `--fuzz-marker` | Custom marker (default: FUZZ) |
| `--replay <n>` | Repeat request N times |
| `--replay-delay <ms>` | Delay between repeats |
| `--fingerprint` | Show profile fingerprint |
| `--profiles` | Show profiles table |
| `--help, -h` | Help |
| `--hh` | Detailed tutorial |

---

## Examples

### Basic request
```
ro-http https://api.example.com/data
```

### POST with JSON
```
ro-http https://api.example.com/event POST -p synapse-x \
  -H "Content-Type: application/json" \
  -d '{"player_id": 123456, "action": "teleport"}'
```

### With Roblox headers
```
ro-http https://game-api.roblox.com/v1/users/authenticated \
  -p delta \
  --place-id 6872265039 \
  --universe-id 2753915549
```

### Test SSRF protection
```
ro-http http://localhost/admin -p standard
ro-http http://localhost/admin -p synapse-x
```

### Compare how server sees different clients
```
ro-http https://target.com/api --scan
```

### Discover endpoints
```
ro-http "https://target.com/FUZZ" --fuzz wordlist.txt --format status
```

### Check response times
```
ro-http https://api.example.com/health --replay 50 --replay-delay 100
```

### Save response
```
ro-http https://api.example.com/data -o output.json --format json
```

---

## Errors and Fixes

| Error | What it means | Fix |
|-------|---------------|-----|
| SSRF | Blocked by IP filter | Use a different profile or --no-ssrf |
| RATE_LIMIT | Too many requests | Wait or use another profile |
| BODY_LIMIT | Response too big | Use a client profile |
| TIMEOUT | Request took too long | Increase timeout with -t |
| DOWNGRADE | HTTPS→HTTP redirect blocked | Use client profile or --no-ssrf |
| CERT_HAS_EXPIRED | SSL certificate expired | Use client profile |
| MAX_REDIRECTS | Too many redirects | Increase --max-redirects |

---

## Requirements

- Node.js 14 or higher
- Any OS that runs Node (Windows, Linux, macOS)
- Outbound internet access to your targets
- ~50MB RAM

---

## Installation

```
git clone 
cd ro-http
npm install
```

Or run directly:
```
node ro-http.js https://example.com
```

---

## Notes

**JA3 fingerprint format:**
`771,4865-4866-4867-... ,0-23-65281-... ,29-23-24,0`

**TCP fingerprint is based on:**
- Initial TTL
- Window size
- Window scaling
- SACK and timestamps
- MSS
- Congestion control

**SSRF blocking uses IP range matching** against private and local addresses.

---

## License

MIT License. For educational and authorized testing only. You are responsible for following all laws and terms of service.
