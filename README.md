# RO-HttpService
## Network Emulator & Security Analysis Tool

**Version 1.5.3**

---

## EXECUTIVE SUMMARY

RO-HttpService is a network fingerprint emulation and security testing framework designed to replicate the exact network characteristics of diverse HTTP client implementations. The tool enables security researchers, penetration testers, and backend developers to analyze how different client profiles interact with target systems, detect server-side fingerprinting and filtering mechanisms, and validate security controls.

---

## FUNCTIONALITY

The tool simulates the complete network stack of seven distinct client profiles, each with precisely configured parameters across multiple network layers:

### Layer 7 - Application (HTTP)
- Header construction and injection behaviors
- User-Agent strings
- Auto-generated identifiers (X-Request-Id, X-Session-Id)
- Content-Type preferences
- Compression algorithm support (gzip, deflate, brotli)

### Layer 6 - Presentation (TLS)
- JA3 fingerprint generation
- Cipher suite ordering (exact sequence per profile)
- ALPN protocol negotiation (h2, http/1.1)
- SSL certificate validation behavior
- ECDH curve preferences

### Layer 4 - Transport (TCP)
- Initial TTL values (64 for Unix-like systems, 128 for Windows)
- Window sizing and scaling factors
- MSS configuration
- SACK (Selective Acknowledgment) support
- Timestamp options
- Congestion control algorithms (CUBIC, NewReno)

### Layer 3 - Network (IP)
- SSRF protection emulation
- Private IP range restrictions
- DNS resolution behavior

---

## PROFILES

### Standard (Reference Client)
**Profile Key:** `standard`

**Technical Specifications:**
- Source Environment: Cloud Linux 5.x (AWS EC2)
- HTTP Engine: libcurl with BoringSSL
- TLS Versions: TLSv1.2, TLSv1.3
- SSL Verification: Strict (rejects invalid certificates)
- Cipher Suite Count: 18 (prioritizing AES-GCM and CHACHA20)
- ALPN Protocols: h2, http/1.1
- ECDH Curves: X25519, prime256v1, secp384r1
- TCP TTL: 64
- TCP Window: 29200
- Window Scaling: 7 (x128)
- SACK: Enabled
- Timestamps: Enabled
- Congestion Control: CUBIC

**Security Controls:**
- SSRF Guard: Active (blocks private IPs, localhost, metadata services)
- Rate Limiting: 500 requests per minute (token bucket)
- Maximum Request Body: 1,048,576 bytes
- Maximum Response Body: 1,048,576 bytes
- Maximum Redirects: 5
- HTTPS to HTTP Downgrade: Blocked

**HTTP Behavior:**
- User-Agent: HttpService/Linux 2023 (compatible)
- User-Agent Locked: Yes
- Auto Headers: Accept, Accept-Encoding (gzip, deflate, br), Connection
- Injected Headers: X-Request-Id, X-Session-Id
- Locked Headers: user-agent, host, content-length, transfer-encoding, connection, accept-encoding, x-request-id, x-session-id

**OS Fingerprint:** Linux 4.x-5.x

---

### Desktop Advanced Client
**Profile Key:** `desktop-advanced`

**Technical Specifications:**
- Source Environment: Windows 10/11 x64
- HTTP Engine: WinHTTP with Schannel
- TLS Versions: TLSv1.2, TLSv1.3
- SSL Verification: Disabled (accepts self-signed certificates)
- Cipher Suite Count: 14
- ALPN Protocols: http/1.1 only
- ECDH Curves: prime256v1, X25519, secp384r1
- TCP TTL: 128
- TCP Window: 65535
- Window Scaling: 8 (x256)
- SACK: Enabled
- Timestamps: Disabled
- Congestion Control: NewReno

**Security Controls:**
- SSRF Guard: Disabled
- Rate Limiting: None
- Maximum Request Body: Unlimited
- Maximum Response Body: Unlimited
- Maximum Redirects: 10
- HTTPS to HTTP Downgrade: Allowed

**HTTP Behavior:**
- User-Agent: DesktopClient/6.6.6 (Windows NT 10.0; Win64; x64)
- User-Agent Locked: No
- Auto Headers: Accept, Accept-Encoding (gzip, deflate), Connection, Content-Type
- Injected Headers: None
- Locked Headers: None

**OS Fingerprint:** Windows 10/11

---

### Mobile Advanced Client (Android)
**Profile Key:** `mobile-android`

**Technical Specifications:**
- Source Environment: Android 12-14 arm64-v8a
- HTTP Engine: OkHttp with Conscrypt (BoringSSL)
- TLS Versions: TLSv1.2, TLSv1.3
- SSL Verification: Disabled
- Cipher Suite Count: 10
- ALPN Protocols: h2, http/1.1
- ECDH Curves: X25519, prime256v1
- TCP TTL: 64
- TCP Window: 65535
- Window Scaling: 8 (x256)
- SACK: Enabled
- Timestamps: Enabled
- Congestion Control: CUBIC

**Security Controls:**
- SSRF Guard: Disabled
- Rate Limiting: None
- Maximum Request Body: Unlimited
- Maximum Response Body: Unlimited
- Maximum Redirects: 5
- HTTPS to HTTP Downgrade: Allowed

**HTTP Behavior:**
- User-Agent: MobileClient/1.0.0 (Android 13; arm64-v8a)
- User-Agent Locked: No
- Auto Headers: Accept, Accept-Encoding (gzip, deflate, br), Connection, Content-Type
- Injected Headers: X-Request-Id, X-Session-Id
- Locked Headers: None

**OS Fingerprint:** Android/Linux 5.x ARM

---

### Desktop Lightweight Client
**Profile Key:** `desktop-light`

**Technical Specifications:**
- Source Environment: Windows 10 x64
- HTTP Engine: WinInet with Schannel
- TLS Versions: TLSv1.2, TLSv1.3
- SSL Verification: Disabled
- Cipher Suite Count: 8
- ALPN Protocols: http/1.1 only
- ECDH Curves: prime256v1, X25519
- TCP TTL: 128
- TCP Window: 65535
- Window Scaling: 8 (x256)
- SACK: Enabled
- Timestamps: Disabled
- Congestion Control: NewReno

**Security Controls:**
- SSRF Guard: Disabled
- Rate Limiting: None
- Maximum Request Body: Unlimited
- Maximum Response Body: Unlimited
- Maximum Redirects: 5
- HTTPS to HTTP Downgrade: Allowed

**HTTP Behavior:**
- User-Agent: LightClient/1.0 (Windows NT 10.0; Win64; x64)
- User-Agent Locked: No
- Auto Headers: Accept, Accept-Encoding (gzip, deflate), Connection, Content-Type
- Injected Headers: None
- Locked Headers: None

**OS Fingerprint:** Windows 10

---

### Mobile Alternative Client (Android)
**Profile Key:** `mobile-alt`

**Technical Specifications:**
- Source Environment: Android 10-13 arm64
- HTTP Engine: OkHttp (Android)
- TLS Versions: TLSv1.2, TLSv1.3
- SSL Verification: Disabled
- Cipher Suite Count: 6
- ALPN Protocols: h2, http/1.1
- ECDH Curves: X25519, prime256v1
- TCP TTL: 64
- TCP Window: 65535
- Window Scaling: 8 (x256)
- SACK: Enabled
- Timestamps: Enabled
- Congestion Control: CUBIC

**Security Controls:**
- SSRF Guard: Disabled
- Rate Limiting: None
- Maximum Request Body: Unlimited
- Maximum Response Body: Unlimited
- Maximum Redirects: 5
- HTTPS to HTTP Downgrade: Allowed

**HTTP Behavior:**
- User-Agent: AltMobileClient/2.0 (Android; arm64)
- User-Agent Locked: No
- Auto Headers: Accept (application/json, */*), Accept-Encoding (gzip, deflate, br), Connection, Content-Type
- Injected Headers: None
- Locked Headers: None

**OS Fingerprint:** Android/Linux ARM

---

### Cross-Platform Mobile Client (iOS/Android)
**Profile Key:** `mobile-cross`

**Technical Specifications:**
- Source Environment: iOS 15-17 / Android 12-14
- HTTP Engine: NSURLSession (iOS) / Conscrypt (Android)
- TLS Versions: TLSv1.2, TLSv1.3
- SSL Verification: Disabled
- Cipher Suite Count: 10
- ALPN Protocols: h2, http/1.1
- ECDH Curves: X25519, prime256v1, secp384r1
- TCP TTL: 64
- TCP Window: 65535
- Window Scaling: 6 (x64)
- SACK: Enabled
- Timestamps: Enabled
- Congestion Control: CUBIC

**Security Controls:**
- SSRF Guard: Disabled
- Rate Limiting: None
- Maximum Request Body: Unlimited
- Maximum Response Body: Unlimited
- Maximum Redirects: 5
- HTTPS to HTTP Downgrade: Allowed

**HTTP Behavior:**
- User-Agent: CrossPlatformClient/3.1.0 (iOS 16.6; iPhone14,3)
- User-Agent Locked: No
- Auto Headers: Accept, Accept-Encoding (gzip, deflate, br), Connection, Content-Type
- Injected Headers: X-Request-Id, X-Session-Id
- Locked Headers: None

**OS Fingerprint:** iOS/Darwin BSD

---

### Cross-Platform Advanced Client (Windows/macOS)
**Profile Key:** `cross-advanced`

**Technical Specifications:**
- Source Environment: Windows 10/11 / macOS 13+
- HTTP Engine: libcurl (Windows) / NSURLSession (macOS)
- TLS Versions: TLSv1.2, TLSv1.3
- SSL Verification: Disabled
- Cipher Suite Count: 8
- ALPN Protocols: http/1.1 only
- ECDH Curves: prime256v1, X25519
- TCP TTL: 128
- TCP Window: 65535
- Window Scaling: 8 (x256)
- SACK: Enabled
- Timestamps: Disabled
- Congestion Control: NewReno

**Security Controls:**
- SSRF Guard: Disabled
- Rate Limiting: None
- Maximum Request Body: Unlimited
- Maximum Response Body: Unlimited
- Maximum Redirects: 5
- HTTPS to HTTP Downgrade: Allowed

**HTTP Behavior:**
- User-Agent: AdvancedClient/1.0 (Windows NT 10.0 / macOS 13.0)
- User-Agent Locked: No
- Auto Headers: Accept, Accept-Encoding (gzip, deflate), Connection, Content-Type
- Injected Headers: None
- Locked Headers: None

**OS Fingerprint:** Windows 10/11 / macOS 13

---

## OPERATING MODES

### Request Mode (Default)
Executes a single HTTP request using the selected profile. Returns complete response data including status codes, headers, and body content.

**Use Cases:**
- Manual endpoint testing
- Header validation
- Response analysis

### Scan Mode
Executes all profiles sequentially against the target URL and compares responses. Identifies discrepancies in status codes, response times, and error messages to detect server-side filtering based on client fingerprints.

**Detection Capabilities:**
- User-Agent filtering
- TLS fingerprint blocking
- TCP stack discrimination
- IP-based geofencing
- WAF rule variations

### Fuzz Mode
Iterates through a wordlist, replacing the marker in the URL or request body with each payload. Records status codes, response times, and body sizes for each iteration.

**Fuzzing Vectors:**
- Path traversal (../../../etc/passwd)
- SQL injection (' OR 1=1--)
- IDOR enumeration (user/1, user/2, user/3)
- Parameter pollution
- Format string attacks
- XSS payloads

### Replay Mode
Repeats the same request N times with configurable delays between iterations. Collects timing statistics including TTFB (Time to First Byte), total response time, and response size distribution.

**Analysis Metrics:**
- Average response time
- Minimum/maximum latency
- Jitter calculation
- Status code consistency
- Rate limit detection

### Fingerprint Mode
Outputs the complete TLS and TCP fingerprint for the selected profile without sending any network requests. Displays JA3 string, JA3 hash, cipher suite order, and TCP stack parameters.

**Fingerprint Components:**
- JA3 string (TLS version, ciphers, extensions, curves)
- JA3 MD5 hash
- Cipher suite IDs and names
- TCP TTL value
- Window scaling factor
- SACK and timestamp flags

---

## SECURITY IMPLEMENTATION

### SSRF Protection (Standard Profile Only)

The standard profile implements SSRF protection by blocking requests to:

**IP Address Ranges:**
- 127.0.0.0/8 (Loopback)
- 10.0.0.0/8 (Private network)
- 172.16.0.0/12 (Private network)
- 192.168.0.0/16 (Private network)
- 169.254.0.0/16 (Link-local)
- 100.64.0.0/10 (Carrier-grade NAT)
- 192.0.0.0/24 (IETF protocol)
- 192.0.2.0/24 (Documentation)
- 198.51.100.0/24 (Documentation)
- 203.0.113.0/24 (Documentation)
- 198.18.0.0/15 (Benchmark)
- 224.0.0.0/4 (Multicast)
- 240.0.0.0/4 (Reserved)
- 255.255.255.255/32 (Broadcast)
- 0.0.0.0/8 (Invalid)

**Hostname Blocklist:**
- localhost
- metadata.google.internal
- metadata.google.com
- 169.254.169.254 (AWS/Google/Azure metadata)
- 100.100.100.200 (Alibaba metadata)

### Rate Limiting (Standard Profile Only)

Implementation: Token bucket algorithm
- Capacity: 500 tokens
- Refill Rate: 500 tokens per 60 seconds (8.33 tokens/second)
- Token Consumption: 1 token per request

### Body Size Restrictions (Standard Profile Only)
- Maximum Request Body: 1,048,576 bytes (1 MB)
- Maximum Response Body: 1,048,576 bytes (1 MB)

---

## COMMAND REFERENCE

### Positional Arguments
```
<url>           Target URL (required for request, scan, fuzz, replay modes)
[method]        HTTP method (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
                Default: GET
```

### Profile Selection
```
-p, --profile <name>    Select profile (standard, desktop-advanced, mobile-android,
                        desktop-light, mobile-alt, mobile-cross, cross-advanced)
                        Default: standard
```

### Request Configuration
```
-H, --header "Key: Value"     Add custom header (can be repeated)
-d, --body <string>           Request body content
--body-file <path>            Read request body from file
--session-id <id>             Override X-Session-Id header value
--request-id <id>             Override X-Request-Id header value
-t, --timeout <ms>            Request timeout in milliseconds
--no-redirects                Disable automatic redirect following
--max-redirects <n>           Maximum redirects to follow
```

### Output Control
```
-f, --format <type>           Output format:
                              full     - Headers + truncated body (default)
                              body     - Response body only
                              headers  - Response headers only
                              status   - Status code only
                              json     - Complete JSON response
                              raw      - Raw binary response
-o, --output <file>           Save response body to file
-v, --verbose                 Display TCP/TLS socket events
-q, --quiet                   Suppress all output except response body
```

### Security Testing Flags
```
--no-ssrf                     Disable SSRF protection for testing (standard profile only)
--no-rate-limit               Disable rate limiting (standard profile only)
```

### Mode Selection
```
--scan                        Execute scan mode (test all profiles)
--fuzz <file>                 Execute fuzz mode with wordlist
--fuzz-marker <string>        Custom fuzz marker (default: FUZZ)
--replay <n>                  Execute replay mode with N iterations
--replay-delay <ms>           Delay between replay iterations
--fingerprint                 Display profile fingerprint (no request)
--profiles                    Display profiles comparison table
--help, -h                    Display help information
--hh                          Display detailed tutorial
```

---

## OPERATIONAL EXAMPLES

### Basic Request Operations

**Standard Profile GET Request:**
```
ro-http https://api.example.com/data
```

**Desktop Advanced Profile POST Request with JSON Body:**
```
ro-http https://api.example.com/event POST -p desktop-advanced \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123456, "action": "update", "payload": {"key": "value"}}'
```

**Mobile Android Profile with Session Injection:**
```
ro-http https://api.example.com/v1/users/me \
  -p mobile-android \
  --session-id 550e8400-e29b-41d4-a716-446655440000 \
  --request-id req_123456
```

### Security Testing Operations

**SSRF Protection Testing:**
```
# Test with standard profile (SSRF active - should block)
ro-http http://169.254.169.254/latest/meta-data/ -p standard

# Test with desktop profile (SSRF disabled for analysis)
ro-http http://169.254.169.254/latest/meta-data/ -p desktop-advanced
```

**Rate Limit Analysis:**
```
ro-http https://api.example.com/endpoint --replay 600 --replay-delay 50 --format status
```

**WAF Fingerprinting:**
```
ro-http https://target.com/protected --scan
```

### Fuzzing Operations

**Path Traversal Fuzzing:**
```
# Create wordlist
echo "etc/passwd" > traversal.txt
echo "etc/shadow" >> traversal.txt
echo "windows/win.ini" >> traversal.txt
echo "proc/self/environ" >> traversal.txt

# Execute fuzz
ro-http "https://target.com/download?file=../../FUZZ" \
  -p desktop-light \
  --fuzz traversal.txt \
  --format status
```

**SQL Injection Fuzzing:**
```
ro-http "https://target.com/login?username=FUZZ&password=test" \
  -p mobile-alt \
  --fuzz sqli_payloads.txt \
  --fuzz-marker FUZZ \
  -o fuzz_results.json
```

### Performance Analysis

**Response Time Benchmarking:**
```
ro-http https://api.example.com/health \
  -p standard \
  --replay 100 \
  --replay-delay 100 \
  --format json > benchmark_results.json
```

**Profile Comparison:**
```
for profile in standard desktop-advanced mobile-android desktop-light mobile-alt mobile-cross cross-advanced; do
  echo "Testing $profile..."
  ro-http https://api.example.com/endpoint -p $profile --format status
done
```

### Data Extraction

**Save Response for Analysis:**
```
ro-http https://api.example.com/users/me \
  -p mobile-android \
  -o user_data.json \
  --format json
```

**Parse with External Tools:**
```
ro-http https://api.example.com/data -q | jq '.items[].id'
```

---

## ERROR HANDLING

| Error Code       | Description                        | Resolution                                       |
|------------------|------------------------------------|--------------------------------------------------|
| SSRF             | Request blocked by SSRF protection | Use --no-ssrf flag or select another profile    |
| RATE_LIMIT       | Token bucket exhausted             | Wait for refill or use another profile          |
| BODY_LIMIT       | Response exceeded size limit       | Use profile with unlimited bodies               |
| TIMEOUT          | Request timed out                  | Increase timeout with -t flag                   |
| DOWNGRADE        | HTTPS to HTTP redirect blocked     | Use another profile or --no-ssrf                |
| PROTOCOL         | Unsupported protocol               | Use http:// or https:// URLs                    |
| ENOTFOUND        | DNS resolution failed              | Verify hostname and network connectivity        |
| ECONNREFUSED     | Connection refused                 | Verify target service is running                |
| CERT_HAS_EXPIRED | SSL certificate expired            | Use profile with SSL verify disabled            |
| MAX_REDIRECTS    | Redirect limit exceeded            | Increase --max-redirects value                  |

---

## SYSTEM REQUIREMENTS

- Node.js 14.0 or higher
- Operating System: Windows, Linux, macOS (any Node.js supported platform)
- Network: Outbound HTTPS/HTTP access to target endpoints
- Memory: 50MB minimum (more for large response bodies)
- Disk: 10MB for installation

---

## INSTALLATION

### Local Installation from Source
```
git clone 
cd ro-http
npm install
```

### Direct Execution (node)
```
node ro-http.js https://example.com
```

---

## FILE STRUCTURE

```
ro-http/
├── ro-http.js           # Main executable
├── package.json         # Package configuration
├── README.md            # Documentation
└── LICENSE              # MIT license
```

---

## TECHNICAL NOTES

### TLS Fingerprint Generation

The JA3 fingerprint is calculated using:
- SSL/TLS version (771 = TLSv1.2)
- Cipher suites in client order
- Extension types in client order
- Elliptic curves in client order
- Elliptic curve formats (always 0)

Example JA3 string format:
`771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49188-49192-49187-49191-157-156-61-60-53-47-255,0-23-65281-10-11-35-16-5-13-18-43-45-51-21,29-23-24,0`

### TCP Fingerprint Parameters

The TCP fingerprint is based on:
- Initial TTL (Time to Live)
- Window size (initial)
- Window scaling factor
- SACK permitted flag
- Timestamp option presence
- MSS value
- Congestion control algorithm

### SSRF Protection Implementation

IP blocking uses bitmask comparison:
1. Convert IP string to 32-bit integer
2. Apply network mask
3. Compare against blocked network ranges
4. Block if match found within private ranges

---

## LICENSE

MIT License - See LICENSE file for details.
