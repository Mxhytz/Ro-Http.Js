#!/usr/bin/env node
'use strict';

const https   = require('https');
const http    = require('http');
const dns     = require('dns').promises;
const urlMod  = require('url');
const fs      = require('fs');
const zlib    = require('zlib');
const crypto  = require('crypto');

const VERSION  = '1.5.3';
const CODENAME = 'MxhytzCorp';

const NO_COLOR = process.env.NO_COLOR || !process.stdout.isTTY;
const C = {
  reset   : NO_COLOR ? '' : '\x1b[0m',
  bold    : NO_COLOR ? '' : '\x1b[1m',
  dim     : NO_COLOR ? '' : '\x1b[2m',
  red     : NO_COLOR ? '' : '\x1b[31m',
  green   : NO_COLOR ? '' : '\x1b[32m',
  yellow  : NO_COLOR ? '' : '\x1b[33m',
  blue    : NO_COLOR ? '' : '\x1b[34m',
  magenta : NO_COLOR ? '' : '\x1b[35m',
  cyan    : NO_COLOR ? '' : '\x1b[36m',
  white   : NO_COLOR ? '' : '\x1b[37m',
  gray    : NO_COLOR ? '' : '\x1b[90m',
  bred    : NO_COLOR ? '' : '\x1b[91m',
  bgreen  : NO_COLOR ? '' : '\x1b[92m',
  byellow : NO_COLOR ? '' : '\x1b[93m',
  bcyan   : NO_COLOR ? '' : '\x1b[96m',
};

const p  = (col, s) => `${C[col]||''}${s}${C.reset}`;
const Cy = s => p('cyan',    s);
const G  = s => p('green',   s);
const R  = s => p('red',     s);
const Y  = s => p('yellow',  s);
const W  = s => p('white',   s);
const Gr = s => p('gray',    s);
const Dm = s => p('dim',     s);
const Bd = s => `${C.bold}${s}${C.reset}`;
const BY = s => p('byellow', s);
const BG = s => p('bgreen',  s);
const BR = s => p('bred',    s);
const BC = s => p('bcyan',   s);

const out    = (s='') => process.stdout.write(s+'\n');
const outRaw = (s='') => process.stdout.write(s);
const hr     = (ch='─',n=72) => ch.repeat(n);

function section(label) {
  out();
  out(`${C.bold}${C.cyan}[*]${C.reset} ${C.bold}${label}${C.reset}`);
  out(Gr('    '+hr('─',60)));
}

function field(label, value, col) {
  const lbl = Gr(label.padEnd(22));
  const val = col ? p(col, String(value)) : W(String(value));
  out(`    ${lbl}  ${val}`);
}

function statusBadge(code) {
  if (code >= 500) return `${C.bold}${C.bred} ${code} ${C.reset}`;
  if (code >= 400) return `${C.bold}${C.byellow} ${code} ${C.reset}`;
  if (code >= 300) return `${C.bold}${C.bcyan} ${code} ${C.reset}`;
  return `${C.bold}${C.bgreen} ${code} ${C.reset}`;
}

function fmtBytes(b) {
  if (!b) return '0 B';
  if (b < 1024)        return `${b} B`;
  if (b < 1048576)     return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1048576).toFixed(2)} MB`;
}

function titleCase(s) {
  return s.split('-').map(p2 => p2[0].toUpperCase()+p2.slice(1)).join('-');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function printBanner() {
  out();
  out(`${C.bold}${C.cyan}    ██████╗  ██████╗       ██╗  ██╗████████╗████████╗██████╗ ${C.reset}`);
  out(`${C.bold}${C.cyan}    ██╔══██╗██╔═══██╗      ██║  ██║╚══██╔══╝╚══██╔══╝██╔══██╗${C.reset}`);
  out(`${C.bold}${C.cyan}    ██████╔╝██║   ██║█████╗███████║   ██║      ██║   ██████╔╝${C.reset}`);
  out(`${C.bold}${C.cyan}    ██╔══██╗██║   ██║╚════╝██╔══██║   ██║      ██║   ██╔═══╝ ${C.reset}`);
  out(`${C.bold}${C.cyan}    ██║  ██║╚██████╔╝      ██║  ██║   ██║      ██║   ██║     ${C.reset}`);
  out(`${C.bold}${C.cyan}    ╚═╝  ╚═╝ ╚═════╝       ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝     ${C.reset}`);
  out();
  out(`    ${Gr('Roblox HttpService Network Emulator & Inspector')}`);
  out(`    ${Gr('v'+VERSION+' "'+CODENAME+'"')}  ${Gr('|')}  ${Gr('Node.js '+process.version)}`);
  out();
  out(`    ${Gr(hr('─',60))}`);
  out(`    ${Gr('Profiles:')} ${Cy('standard')} ${Gr('synapse-x')} ${Cy('delta')} ${Gr('krnl')} ${Cy('fluxus')} ${Gr('arceus-x')} ${Cy('script-ware')}`);
  out(`    ${Gr('Modes:')}    ${Cy('request')} ${Gr('scan')} ${Cy('fingerprint')} ${Gr('fuzz')} ${Cy('replay')}`);
  out(`    ${Gr(hr('─',60))}`);
  out();
}

const PROFILES = {

  standard: {
    label:'Roblox Game Server',
    desc:'Official server-side HttpService',
    source:'server', engine:'libcurl/BoringSSL', platform:'Linux 5.x (AWS EC2)',
    userAgent:'Roblox/Linux 2023 (compatible; HttpService)',
    uaLocked:true,
    ciphers:[
      'TLS_AES_256_GCM_SHA384','TLS_CHACHA20_POLY1305_SHA256','TLS_AES_128_GCM_SHA256',
      'ECDHE-ECDSA-AES256-GCM-SHA384','ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-CHACHA20-POLY1305','ECDHE-RSA-CHACHA20-POLY1305',
      'ECDHE-ECDSA-AES128-GCM-SHA256','ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES256-SHA384','ECDHE-RSA-AES256-SHA384',
      'ECDHE-ECDSA-AES128-SHA256','ECDHE-RSA-AES128-SHA256',
      'AES256-GCM-SHA384','AES128-GCM-SHA256','AES256-SHA256','AES128-SHA256',
    ],
    ecdhCurve:'X25519:prime256v1:secp384r1', alpn:['h2','http/1.1'],
    tlsVersions:['TLSv1.2','TLSv1.3'], sslVerify:true,
    autoHeaders:{ 'Accept':'*/*','Accept-Encoding':'gzip, deflate, br','Connection':'keep-alive' },
    lockedHeaders:['user-agent','host','content-length','transfer-encoding','connection','accept-encoding','roblox-id','roblox-game-id'],
    injectRobloxId:true, canOverrideUA:false, canSetOrigin:false,
    ssrfGuard:true, robloxDomainBlock:true,
    rateLimit:{ capacity:500, perSecond:500/60 },
    maxReqBody:1048576, maxResBody:1048576,
    maxRedirects:5, allowHttpDowngrade:false,
    connectTimeout:30000, readTimeout:30000,
    tcp:{ ttl:64, window:29200, mss:1460, wscale:7, sack:true, timestamps:true, congestion:'CUBIC', os:'Linux 5.x' },
  },

  'synapse-x': {
    label:'Synapse X',
    desc:'Windows executor',
    source:'client', engine:'WinHTTP/Schannel', platform:'Windows 10/11',
    userAgent:'Roblox/Linux 2023 (compatible; HttpService)',
    uaLocked:false,
    ciphers:[
      'TLS_AES_256_GCM_SHA384','TLS_AES_128_GCM_SHA256','TLS_CHACHA20_POLY1305_SHA256',
      'ECDHE-ECDSA-AES256-GCM-SHA384','ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-AES128-GCM-SHA256','ECDHE-RSA-AES128-GCM-SHA256',
      'AES256-GCM-SHA384','AES128-GCM-SHA256',
    ],
    ecdhCurve:'X25519:prime256v1', alpn:['h2','http/1.1'],
    tlsVersions:['TLSv1.2','TLSv1.3'], sslVerify:true,
    autoHeaders:{ 'Accept':'*/*','Accept-Encoding':'gzip, deflate, br','Connection':'keep-alive', 'Content-Type':'application/json' },
    lockedHeaders:[], injectRobloxId:true,
    canOverrideUA:true, canSetOrigin:true,
    ssrfGuard:false, robloxDomainBlock:false, rateLimit:null,
    maxReqBody:null, maxResBody:null, maxRedirects:10, allowHttpDowngrade:true,
    connectTimeout:30000, readTimeout:30000,
    tcp:{ ttl:64, window:65535, mss:1460, wscale:8, sack:true, timestamps:true, congestion:'CUBIC', os:'Linux' },
  },

  delta: {
    label:'Delta Executor',
    desc:'Android executor',
    source:'client', engine:'OkHttp/Conscrypt', platform:'Android 12-14',
    userAgent:'Delta/1.0.0 (Roblox Mobile Exploit; Android 13; arm64-v8a)',
    uaLocked:false,
    ciphers:[
      'TLS_AES_128_GCM_SHA256','TLS_AES_256_GCM_SHA384','TLS_CHACHA20_POLY1305_SHA256',
      'ECDHE-ECDSA-AES128-GCM-SHA256','ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES256-GCM-SHA384','ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-CHACHA20-POLY1305','ECDHE-RSA-CHACHA20-POLY1305',
    ],
    ecdhCurve:'X25519:prime256v1', alpn:['h2','http/1.1'],
    tlsVersions:['TLSv1.2','TLSv1.3'], sslVerify:false,
    autoHeaders:{ 'Accept':'*/*','Accept-Encoding':'gzip, deflate, br','Connection':'keep-alive', 'Content-Type':'application/json' },
    lockedHeaders:[], injectRobloxId:true, canOverrideUA:true, canSetOrigin:true,
    ssrfGuard:false, robloxDomainBlock:false, rateLimit:null,
    maxReqBody:null, maxResBody:null, maxRedirects:5, allowHttpDowngrade:true,
    connectTimeout:15000, readTimeout:15000,
    tcp:{ ttl:64, window:65535, mss:1460, wscale:8, sack:true, timestamps:true, congestion:'CUBIC', os:'Android' },
  },

  krnl: {
    label:'KRNL',
    desc:'Windows kernel executor',
    source:'client', engine:'WinInet/Schannel', platform:'Windows 10',
    userAgent:'Roblox/Linux 2023 (compatible; HttpService)',
    uaLocked:false,
    ciphers:[
      'TLS_AES_256_GCM_SHA384','TLS_CHACHA20_POLY1305_SHA256','TLS_AES_128_GCM_SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384','ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-CHACHA20-POLY1305','AES256-GCM-SHA384','AES128-GCM-SHA256',
    ],
    ecdhCurve:'X25519:prime256v1', alpn:['h2','http/1.1'],
    tlsVersions:['TLSv1.2','TLSv1.3'], sslVerify:true,
    autoHeaders:{ 'Accept':'*/*','Accept-Encoding':'gzip, deflate, br','Connection':'keep-alive', 'Content-Type':'application/json' },
    lockedHeaders:[], injectRobloxId:true,
    canOverrideUA:true, canSetOrigin:true,
    ssrfGuard:false, robloxDomainBlock:false, rateLimit:null,
    maxReqBody:null, maxResBody:null, maxRedirects:5, allowHttpDowngrade:true,
    connectTimeout:30000, readTimeout:30000,
    tcp:{ ttl:64, window:65535, mss:1460, wscale:8, sack:true, timestamps:true, congestion:'CUBIC', os:'Linux' },
  },

  fluxus: {
    label:'Fluxus',
    desc:'Android executor',
    source:'client', engine:'OkHttp/Android', platform:'Android 10-13',
    userAgent:'Roblox/Linux 2023 (compatible; HttpService)',
    uaLocked:false,
    ciphers:[
      'TLS_AES_128_GCM_SHA256','TLS_AES_256_GCM_SHA384','TLS_CHACHA20_POLY1305_SHA256',
      'ECDHE-ECDSA-AES128-GCM-SHA256','ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES256-GCM-SHA384','ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-CHACHA20-POLY1305','ECDHE-RSA-CHACHA20-POLY1305',
    ],
    ecdhCurve:'X25519:prime256v1', alpn:['h2','http/1.1'],
    tlsVersions:['TLSv1.2','TLSv1.3'], sslVerify:true,
    autoHeaders:{ 'Accept':'application/json, */*','Accept-Encoding':'gzip, deflate, br','Connection':'keep-alive', 'Content-Type':'application/json' },
    lockedHeaders:[], injectRobloxId:true,
    canOverrideUA:true, canSetOrigin:true,
    ssrfGuard:false, robloxDomainBlock:false, rateLimit:null,
    maxReqBody:null, maxResBody:null, maxRedirects:5, allowHttpDowngrade:true,
    connectTimeout:20000, readTimeout:20000,
    tcp:{ ttl:64, window:65535, mss:1460, wscale:8, sack:true, timestamps:true, congestion:'CUBIC', os:'Android' },
  },

  'arceus-x': {
    label:'Arceus X',
    desc:'Cross-platform executor',
    source:'client', engine:'NSURLSession/Conscrypt', platform:'iOS/Android',
    userAgent:'Roblox ArceusX/3.1.0 (Mobile; iOS 16.6; iPhone14,3)',
    uaLocked:false,
    ciphers:[
      'TLS_AES_256_GCM_SHA384','TLS_AES_128_GCM_SHA256','TLS_CHACHA20_POLY1305_SHA256',
      'ECDHE-ECDSA-AES256-GCM-SHA384','ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384','ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-CHACHA20-POLY1305','ECDHE-RSA-CHACHA20-POLY1305',
    ],
    ecdhCurve:'X25519:prime256v1:secp384r1', alpn:['h2','http/1.1'],
    tlsVersions:['TLSv1.2','TLSv1.3'], sslVerify:false,
    autoHeaders:{ 'Accept':'*/*','Accept-Encoding':'gzip, deflate, br','Connection':'keep-alive', 'Content-Type':'application/json' },
    lockedHeaders:[], injectRobloxId:true, canOverrideUA:true, canSetOrigin:true,
    ssrfGuard:false, robloxDomainBlock:false, rateLimit:null,
    maxReqBody:null, maxResBody:null, maxRedirects:5, allowHttpDowngrade:true,
    connectTimeout:20000, readTimeout:20000,
    tcp:{ ttl:64, window:65535, mss:1460, wscale:6, sack:true, timestamps:true, congestion:'CUBIC', os:'iOS' },
  },

  'script-ware': {
    label:'Script-Ware',
    desc:'Premium executor',
    source:'client', engine:'libcurl/NSURLSession', platform:'Windows/macOS',
    userAgent:'Roblox/Linux 2023 (compatible; HttpService)',
    uaLocked:false,
    ciphers:[
      'TLS_AES_256_GCM_SHA384','TLS_AES_128_GCM_SHA256','TLS_CHACHA20_POLY1305_SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384','ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES256-GCM-SHA384','ECDHE-ECDSA-AES128-GCM-SHA256',
      'AES256-GCM-SHA384','AES128-GCM-SHA256',
    ],
    ecdhCurve:'X25519:prime256v1', alpn:['h2','http/1.1'],
    tlsVersions:['TLSv1.2','TLSv1.3'], sslVerify:true,
    autoHeaders:{ 'Accept':'*/*','Accept-Encoding':'gzip, deflate, br','Connection':'keep-alive', 'Content-Type':'application/json' },
    lockedHeaders:[], injectRobloxId:true,
    canOverrideUA:true, canSetOrigin:true,
    ssrfGuard:false, robloxDomainBlock:false, rateLimit:null,
    maxReqBody:null, maxResBody:null, maxRedirects:5, allowHttpDowngrade:true,
    connectTimeout:30000, readTimeout:30000,
    tcp:{ ttl:64, window:65535, mss:1460, wscale:8, sack:true, timestamps:true, congestion:'CUBIC', os:'Linux' },
  },
};

const RFC1918_RANGES = [
  ['127.0.0.0',8],['10.0.0.0',8],['172.16.0.0',12],['192.168.0.0',16],
  ['169.254.0.0',16],['100.64.0.0',10],['192.0.0.0',24],['192.0.2.0',24],
  ['198.51.100.0',24],['203.0.113.0',24],['198.18.0.0',15],
  ['224.0.0.0',4],['240.0.0.0',4],['255.255.255.255',32],['0.0.0.0',8],
].map(([ip,bits]) => {
  const n = ip.split('.').reduce((a,b) => (a*256)+ +b, 0) >>> 0;
  const m = bits===0 ? 0 : (0xFFFFFFFF << (32-bits)) >>> 0;
  return [n & m, m];
});

const BLOCKED_HOSTS   = new Set(['localhost','metadata.google.internal','metadata.google.com','169.254.169.254','100.100.100.200']);
const ROBLOX_PATTERNS = [/\.roblox\.com$/i,/\.rbxcdn\.com$/i,/\.rbx\.com$/i,/^roblox\.com$/i];

function ipInt(ip) { return ip.split('.').reduce((a,b) => (a*256)+ +b,0) >>> 0; }
function isBlockedIP(ip) {
  if (ip==='::1'||ip.startsWith('fe80:')||ip.startsWith('fc')||ip.startsWith('fd')) return true;
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return false;
  const n = ipInt(ip);
  return RFC1918_RANGES.some(([net,mask]) => (n & mask)===net);
}

async function ssrfCheck(hostname, blockRoblox) {
  if (BLOCKED_HOSTS.has(hostname.toLowerCase()))
    return { blocked:true, reason:`Blocked hostname: ${hostname}` };
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    if (isBlockedIP(hostname)) return { blocked:true, reason:`Blocked IP range: ${hostname}` };
    return { blocked:false };
  }
  if (blockRoblox && ROBLOX_PATTERNS.some(pt => pt.test(hostname)))
    return { blocked:true, reason:`Roblox domain loop-prevention: ${hostname}` };
  try {
    const addrs = await dns.lookup(hostname, { all:true });
    for (const { address } of addrs) {
      if (isBlockedIP(address)) return { blocked:true, reason:`Resolved to blocked IP ${address} (${hostname})` };
    }
  } catch(e) {
    return { blocked:true, reason:`DNS failed: ${e.message}` };
  }
  return { blocked:false };
}

class TokenBucket {
  constructor(cap, perSec) { this.cap=cap; this.rate=perSec; this.tokens=cap; this.ts=Date.now(); }
  _fill() { const e=(Date.now()-this.ts)/1000; this.tokens=Math.min(this.cap,this.tokens+e*this.rate); this.ts=Date.now(); }
  consume() { this._fill(); if(this.tokens>=1){this.tokens--;return true;}return false; }
  get remaining() { this._fill(); return Math.floor(this.tokens); }
  get waitMs()    { return Math.ceil((1-this.tokens)/this.rate*1000); }
}

const CIPHER_IDS = {
  'TLS_AES_256_GCM_SHA384':4866,'TLS_CHACHA20_POLY1305_SHA256':4867,'TLS_AES_128_GCM_SHA256':4865,
  'ECDHE-ECDSA-AES256-GCM-SHA384':49196,'ECDHE-RSA-AES256-GCM-SHA384':49200,
  'ECDHE-ECDSA-CHACHA20-POLY1305':52393,'ECDHE-RSA-CHACHA20-POLY1305':52392,
  'ECDHE-ECDSA-AES128-GCM-SHA256':49195,'ECDHE-RSA-AES128-GCM-SHA256':49199,
  'ECDHE-ECDSA-AES256-SHA384':49188,'ECDHE-RSA-AES256-SHA384':49192,
  'ECDHE-ECDSA-AES128-SHA256':49187,'ECDHE-RSA-AES128-SHA256':49191,
  'AES256-GCM-SHA384':157,'AES128-GCM-SHA256':156,'AES256-SHA256':61,'AES128-SHA256':60,
  'AES256-SHA':53,'AES128-SHA':47,
};
const CURVE_IDS = { 'X25519':29,'prime256v1':23,'secp384r1':24,'secp521r1':25 };

function computeJA3(profile) {
  const ciphers = profile.ciphers.map(c => CIPHER_IDS[c]).filter(Boolean);
  ciphers.push(255);
  const exts   = [0,23,65281,10,11,35,16,5,13,18,43,45,51,21];
  const curves = profile.ecdhCurve.split(':').map(c => CURVE_IDS[c]).filter(Boolean);
  const str    = `771,${ciphers.join('-')},${exts.join('-')},${curves.join('-')},0`;
  const hash   = crypto.createHash('md5').update(str).digest('hex');
  return { str, hash };
}

function genId(min, max) { return String(Math.floor(Math.random()*(max-min))+min); }

function buildHeaders(profile, userHeaders, method, body, placeId, universeId) {
  const h = Object.assign({}, profile.autoHeaders);
  for (const [k,v] of Object.entries(userHeaders)) {
    if (!profile.lockedHeaders.includes(k.toLowerCase())) h[k] = String(v);
  }
  if (!profile.canOverrideUA || !h['User-Agent']) h['User-Agent'] = profile.userAgent;
  if (body) h['Content-Length'] = String(Buffer.byteLength(body));
  else if (['POST','PUT','PATCH'].includes(method)) h['Content-Length'] = '0';
  if (profile.injectRobloxId) {
    h['Roblox-Id']      = placeId    || genId(1e9, 9e9);
    h['Roblox-Game-Id'] = universeId || genId(1e9, 9e9);
  }
  return h;
}

class RoError extends Error {
  constructor(msg, code) { super(msg); this.name='RoError'; this.code=code; }
}

function sendHTTP({ parsed, method, headers, body, tlsOpts, timeout, maxRes, verbose, timings }) {
  return new Promise((resolve, reject) => {
    const isHttps = parsed.protocol === 'https:';
    const lib     = isHttps ? https : http;
    const opts    = {
      hostname : parsed.hostname,
      port     : parsed.port || (isHttps ? 443 : 80),
      path     : parsed.path || '/',
      method   : method.toUpperCase(),
      headers,
      ...(isHttps ? tlsOpts : {}),
    };

    if (opts.ALPNProtocols) {
      opts.ALPNProtocols = ['http/1.1'];
    }

    timings.connectStart = Date.now();
    const req = lib.request(opts, res => {
      timings.firstByte = Date.now();
      
      const chunks = []; 
      let total = 0; 
      let dead = false;
      
      if (res.httpVersionMajor === 2) {
        if (verbose) console.log(Gr(`    [HTTP/2] Detected - processing response`));
      }
      
      res.on('data', chunk => {
        if (dead) return;
        total += chunk.length;
        if (maxRes && total > maxRes) {
          dead = true; req.destroy();
          reject(new RoError(`Response ${fmtBytes(total)} exceeds limit ${fmtBytes(maxRes)}`,'BODY_LIMIT'));
          return;
        }
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        if (dead) return;
        timings.end = Date.now();
        const raw = Buffer.concat(chunks);
        
        const encoding = (res.headers['content-encoding'] || '').toLowerCase();
        let bodyBuffer = raw;
        
        if (encoding === 'gzip' || encoding === 'deflate' || encoding === 'br') {
          try {
            if (encoding === 'gzip') {
              bodyBuffer = zlib.gunzipSync(raw);
            } else if (encoding === 'deflate') {
              bodyBuffer = zlib.inflateSync(raw);
            } else if (encoding === 'br' && zlib.brotliDecompressSync) {
              bodyBuffer = zlib.brotliDecompressSync(raw);
            }
            if (verbose) console.log(Gr(`    [Decompressed] ${encoding} → ${fmtBytes(bodyBuffer.length)}`));
          } catch (e) {
            if (verbose) console.log(R(`    [Decompress Error] ${e.message}`));
            bodyBuffer = raw;
          }
        }
        
        resolve({ 
          statusCode: res.statusCode, 
          statusMessage: res.statusMessage, 
          headers: res.headers, 
          body: bodyBuffer, 
          bodyText: bodyBuffer.toString('utf8'), 
          byteLength: bodyBuffer.length, 
          encoding 
        });
      });
      
      res.on('error', e => { 
        if (!dead) reject(new RoError(`Stream: ${e.message}`,'STREAM')); 
      });
    });

    const timer = setTimeout(() => { 
      req.destroy(); 
      reject(new RoError(`Timed out after ${timeout}ms`,'TIMEOUT')); 
    }, timeout);

    req.on('socket', sock => {
      sock.on('connect', () => {
        timings.tcpMs = Date.now();
        if (verbose) console.log(Gr(`    [TCP] connected ${sock.remoteAddress}:${sock.remotePort}`));
      });
      if (isHttps) {
        sock.on('secureConnect', () => {
          timings.tlsMs = Date.now();
          if (verbose) {
            const cipher = sock.getCipher();
            console.log(Gr(`    [TLS] ${sock.getProtocol()} | cipher: ${JSON.stringify(cipher)}`));
            console.log(Gr(`    [ALPN] ${sock.alpnProtocol || 'none'}`));
            try {
              const cert = sock.getPeerCertificate();
              if (cert && cert.subject) console.log(Gr(`    [CERT] ${cert.subject.CN || ''} valid_to=${cert.valid_to}`));
            } catch (e) {
              // Ignore cert errors
            }
          }
        });
      }
    });

    req.on('response', () => clearTimeout(timer));
    
    req.on('error', e => {
      clearTimeout(timer);
      let msg = `HTTP error: ${e.message}`;
      if (e.code === 'HPE_INVALID_CONSTANT') {
        msg = 'Protocol parsing error - target may be using HTTP/2. Try adding --no-alpn flag or using an executor profile.';
      } else {
        const msgs = {
          ENOTFOUND: `DNS: Could not resolve host ${parsed.hostname}`,
          ECONNREFUSED: `Connection refused ${parsed.hostname}`,
          CERT_HAS_EXPIRED: `SSL: Certificate expired`,
          DEPTH_ZERO_SELF_SIGNED_CERT: `SSL: Self-signed (rejected — strict mode)`,
          UNABLE_TO_VERIFY_LEAF_SIGNATURE: `SSL: Certificate verify failed`,
          ECONNRESET: `Connection reset by peer`,
          ETIMEDOUT: `Connection timed out`,
        };
        msg = msgs[e.code] || `HTTP 0 (${e.code}: ${e.message})`;
      }
      reject(new RoError(msg, e.code || 'REQUEST'));
    });

    if (body) req.write(Buffer.from(body));
    req.end();
  });
}


async function doRequest(cfg, profile, bucket, verbose) {
  const { targetUrl, method, userHeaders, body, placeId, universeId, followRedirects, maxRedirects, timeout, maxResBody } = cfg;

  if (bucket && !bucket.consume())
    throw new RoError(`Rate limited — ${bucket.remaining} tokens, wait ${bucket.waitMs}ms (cap:${bucket.cap}/min)`,'RATE_LIMIT');

  let curUrl = targetUrl, curMethod = method, curBody = body, hops = 0;
  const maxHops = maxRedirects != null ? maxRedirects : profile.maxRedirects;

  while (true) {
    const parsed = urlMod.parse(curUrl);
    if (!['http:','https:'].includes(parsed.protocol))
      throw new RoError(`Protocol not allowed: ${parsed.protocol}`,'PROTOCOL');

    if (profile.ssrfGuard) {
      const r = await ssrfCheck(parsed.hostname, profile.robloxDomainBlock);
      if (r.blocked) throw new RoError(`SSRF blocked: ${r.reason}`,'SSRF');
    }

    if (hops > 0 && !profile.allowHttpDowngrade) {
      const prevProto = urlMod.parse(targetUrl).protocol;
      if (prevProto==='https:' && parsed.protocol==='http:')
        throw new RoError('Redirect from HTTPS to HTTP blocked','DOWNGRADE');
    }

    const headers = buildHeaders(profile, userHeaders, curMethod, curBody, placeId, universeId);
    const tlsOpts = {
      ciphers            : profile.ciphers.join(':'),
      ecdhCurve          : profile.ecdhCurve,
      rejectUnauthorized : profile.sslVerify,
      ALPNProtocols      : profile.alpn,
      minVersion         : 'TLSv1.2',
      maxVersion         : 'TLSv1.3',
    };

    const timings = {};
    timings.reqStart = Date.now();
    const res = await sendHTTP({ parsed, method:curMethod, headers, body:curBody, tlsOpts, timeout:timeout||profile.connectTimeout, maxRes:maxResBody||profile.maxResBody, verbose, timings });

    timings.total = (timings.end||Date.now()) - timings.reqStart;
    timings.ttfb  = timings.firstByte ? timings.firstByte - timings.reqStart : null;
    timings.tcp   = timings.tcpMs ? timings.tcpMs - timings.connectStart : null;
    timings.tls   = (timings.tlsMs && timings.tcpMs) ? timings.tlsMs - timings.tcpMs : null;

    const isRedir = [301,302,303,307,308].includes(res.statusCode);
    if (isRedir && followRedirects!==false) {
      if (hops >= maxHops) throw new RoError(`Too many redirects (max:${maxHops})`,'MAX_REDIRECTS');
      const loc = res.headers['location'];
      if (!loc) throw new RoError('Redirect missing Location header','BAD_REDIRECT');
      curUrl = urlMod.resolve(curUrl, loc); hops++;
      if (res.statusCode===303) { curMethod='GET'; curBody=undefined; }
      if (verbose) out(Gr(`    [REDIR] ${hops}/${maxHops} → ${curUrl}`));
      continue;
    }

    return { res, timings, hops, headers };
  }
}

async function runScan(targetUrl, method, opts) {
  section(`PROFILE SCAN  ${Gr('→')}  ${Cy(targetUrl)}`);
  out(Gr(`    Firing all ${Object.keys(PROFILES).length} profiles. Comparing responses to detect server-side filtering.`));
  out();

  const COL = [14,8,6,8,9,10,26];
  const hdr = ['Profile','Status','TTL','TLS','Time','Size','Server'].map((h,i)=>h.padEnd(COL[i]));
  out(`    ${Bd(hdr.join('  '))}`);
  out(Gr(`    ${hr('─',84)}`));

  const results = [];
  for (const [key, profile] of Object.entries(PROFILES)) {
    outRaw(`    ${Cy(key.padEnd(COL[0]))}  `);
    try {
      const { res, timings } = await doRequest({ targetUrl, method:method||'GET', userHeaders:opts.headers||{}, body:opts.body, followRedirects:opts.followRedirects!==false, maxRedirects:opts.maxRedirects, timeout:opts.timeout, maxResBody:null }, profile, null, false);
      const sc  = res.statusCode;
      const col = sc>=500?'red':sc>=400?'yellow':sc>=300?'cyan':'bgreen';
      out([
        p(col, String(sc).padEnd(COL[1])),
        Gr(String(profile.tcp.ttl).padEnd(COL[2])),
        Gr(profile.tlsVersions.slice(-1)[0].replace('TLSv','').padEnd(COL[3])),
        BY((String(timings.total)+'ms').padEnd(COL[4])),
        Gr(fmtBytes(res.byteLength).padEnd(COL[5])),
        Dm((res.headers['server']||'').slice(0,26)),
      ].join('  '));
      results.push({ key, profile, res, timings, ok:true });
    } catch(e) {
      out(`${R('ERROR'.padEnd(COL[1]))}  ${Dm(e.message.slice(0,50))}`);
      results.push({ key, profile, error:e, ok:false });
    }
  }

  out(`\n    ${Gr(hr('─',84))}`);

  const codes   = results.filter(r=>r.ok).map(r=>r.res.statusCode);
  const majority= codes.sort((a,b)=>codes.filter(v=>v===b).length-codes.filter(v=>v===a).length)[0];
  const anomalies = results.filter(r=>r.ok&&r.res.statusCode!==majority);

  if (anomalies.length > 0) {
    out(); out(`    ${BY('[!]')} ${Bd('Anomalies')} — profiles with a different status code than majority (${G(String(majority))}):`);
    for (const a of anomalies) {
      out(`    ${Cy(a.key.padEnd(14))} got ${R(String(a.res.statusCode))} — may indicate UA/IP filtering`);
    }
  } else if (codes.length > 0) {
    out(`\n    ${G('[+]')} All profiles returned ${G(String(majority))} — no server-side profile filtering detected.`);
  }
}

async function runFuzz(targetUrl, method, opts) {
  const { profile, fuzzPayloads:payloads, fuzzMarker:marker='FUZZ', headers={}, body, timeout } = opts;
  section(`FUZZ MODE  ${Gr('→')}  ${Cy(targetUrl)}  marker=${Cy(marker)}  payloads=${Cy(payloads.length)}`);
  out(Gr(`    Profile: ${profile.label}  |  Method: ${method}  |  No redirects during fuzz`));
  out();

  const COL = [6,8,9,9,24];
  const hdr = ['#','Status','Time','Size','Payload'].map((h,i)=>h.padEnd(COL[i]));
  out(`    ${Bd(hdr.join('  '))}`);
  out(Gr(`    ${hr('─',60)}`));

  for (let i=0; i<payloads.length; i++) {
    const pl     = payloads[i];
    const fUrl   = targetUrl.replace(marker, encodeURIComponent(pl));
    const fBody  = body ? body.replace(marker, pl) : undefined;
    try {
      const { res, timings } = await doRequest({ targetUrl:fUrl, method, userHeaders:headers, body:fBody, followRedirects:false, timeout:timeout||10000, maxResBody:null }, profile, null, false);
      const sc  = res.statusCode;
      const col = sc>=500?'red':sc>=400?'yellow':sc>=300?'cyan':'bgreen';
      out(`    ${Gr(String(i+1).padEnd(COL[0]))}  ${p(col,String(sc).padEnd(COL[1]))}  ${BY((String(timings.total)+'ms').padEnd(COL[2]))}  ${Gr(fmtBytes(res.byteLength).padEnd(COL[3]))}  ${Cy(pl.slice(0,24))}`);
    } catch(e) {
      out(`    ${Gr(String(i+1).padEnd(COL[0]))}  ${R('ERR'.padEnd(COL[1]))}  ${Dm(e.message.slice(0,40))}`);
    }
  }
}

async function runReplay(targetUrl, method, opts) {
  const { profile, replayCount:n=5, replayDelay:delay=0, headers={}, body, timeout, followRedirects } = opts;
  section(`REPLAY MODE  ${Gr('→')}  ${Cy(targetUrl)}  n=${Cy(n)}  delay=${Cy(delay+'ms')}`);
  out(Gr(`    Profile: ${profile.label}  |  Method: ${method}`));
  out();

  const COL = [5,9,10,10,10];
  const hdr = ['#','Status','TTFB','Total','Size'].map((h,i)=>h.padEnd(COL[i]));
  out(`    ${Bd(hdr.join('  '))}`);
  out(Gr(`    ${hr('─',50)}`));

  const times=[], statuses=[];
  for (let i=0; i<n; i++) {
    try {
      const { res, timings } = await doRequest({ targetUrl, method, userHeaders:headers, body, followRedirects:followRedirects!==false, timeout, maxResBody:null }, profile, null, false);
      times.push(timings.total); statuses.push(res.statusCode);
      const sc  = res.statusCode;
      const col = sc>=500?'red':sc>=400?'yellow':'bgreen';
      out(`    ${Gr(String(i+1).padEnd(COL[0]))}  ${p(col,String(sc).padEnd(COL[1]))}  ${BY((String(timings.ttfb||0)+'ms').padEnd(COL[2]))}  ${BY((String(timings.total)+'ms').padEnd(COL[3]))}  ${Gr(fmtBytes(res.byteLength).padEnd(COL[4]))}`);
    } catch(e) {
      out(`    ${Gr(String(i+1).padEnd(COL[0]))}  ${R('ERROR')}  ${Dm(e.message.slice(0,40))}`);
    }
    if (delay>0 && i<n-1) await sleep(delay);
  }

  if (times.length > 0) {
    const avg = Math.round(times.reduce((a,b)=>a+b,0)/times.length);
    const mn  = Math.min(...times), mx = Math.max(...times);
    out(`\n    ${Gr(hr('─',50))}`);
    out(`    ${Gr('avg=')}${BY(avg+'ms')}  ${Gr('min=')}${G(mn+'ms')}  ${Gr('max=')}${R(mx+'ms')}  ${Gr('jitter=')}${Y((mx-mn)+'ms')}`);
    const uniq = [...new Set(statuses)];
    out(`    ${Gr('codes:')} ${uniq.map(s=>`${p(s>=500?'red':s>=400?'yellow':'bgreen',String(s))}×${statuses.filter(x=>x===s).length}`).join('  ')}`);
  }
}

function printFingerprint(profileKey, profile) {
  const fp = computeJA3(profile);

  section(`TLS + NETWORK FINGERPRINT  ${Gr('→')}  ${Cy(profileKey)}`);
  out();
  out(`    ${Bd(profile.label)}  ${Gr('|')}  ${Dm(profile.desc)}`);
  out();

  out(`    ${Bd('Identity')}`);
  out(Gr(`    ${hr('─',60)}`));
  field('Source',    profile.source==='server'?'Game server (AWS EC2)':'Client (player machine)','white');
  field('Engine',    profile.engine,    'white');
  field('Platform',  profile.platform,  'white');
  field('User-Agent',profile.userAgent, 'cyan');
  field('UA locked', String(profile.uaLocked), profile.uaLocked?'yellow':'green');

  out(`\n    ${Bd('JA3 TLS Fingerprint')}`);
  out(Gr(`    ${hr('─',60)}`));
  field('TLS versions', profile.tlsVersions.join(', '), 'white');
  field('ALPN',         profile.alpn.join(', '),        'white');
  field('ECDH curves',  profile.ecdhCurve,              'white');
  field('SSL verify',   profile.sslVerify?'strict':'disabled (accept self-signed)', profile.sslVerify?'green':'yellow');
  out();
  out(`    ${Gr('JA3 string:')}`);
  out(`    ${Dm(fp.str)}`);
  out();
  out(`    ${Gr('JA3 MD5 hash:')}`);
  out(`    ${BY(fp.hash)}`);

  out(`\n    ${Bd('Cipher Suite Order')}`);
  out(Gr(`    ${hr('─',60)}`));
  profile.ciphers.forEach((c,i) => {
    const id = CIPHER_IDS[c];
    out(`    ${Gr(String(i+1).padStart(2)+'.')}  ${W(c.padEnd(46))} ${id?Gr('0x'+id.toString(16).padStart(4,'0').toUpperCase()):''}`);
  });
  out(`    ${Gr('   +')}  ${Dm('TLS_EMPTY_RENEGOTIATION_INFO_SCSV (0x00FF)')}`);

  out(`\n    ${Bd('TCP Stack Fingerprint (p0f / nmap style)')}`);
  out(Gr(`    ${hr('─',60)}`));
  const tcp = profile.tcp;
  field('OS estimate',   tcp.os, 'white');
  field('TTL',           `${tcp.ttl}  (${tcp.ttl===64?'Linux/Android/iOS':'Windows'})`, tcp.ttl===64?'cyan':'yellow');
  field('Window size',   tcp.window, 'white');
  field('MSS',           `${tcp.mss} bytes`, 'white');
  field('Window scale',  `${tcp.wscale}  (×${Math.pow(2,tcp.wscale)} = ${fmtBytes(tcp.window*Math.pow(2,tcp.wscale))})`, 'white');
  field('SACK',          String(tcp.sack), tcp.sack?'green':'gray');
  field('Timestamps',    String(tcp.timestamps), tcp.timestamps?'green':'gray');
  field('Congestion',    tcp.congestion, 'white');

  out(`\n    ${Bd('Security Behavior')}`);
  out(Gr(`    ${hr('─',60)}`));
  field('SSRF guard',       String(profile.ssrfGuard),        profile.ssrfGuard?'green':'red');
  field('Rate limit',       profile.rateLimit?`${profile.rateLimit.capacity}/min`:'none', profile.rateLimit?'yellow':'gray');
  field('Max req body',     profile.maxReqBody?fmtBytes(profile.maxReqBody):'unlimited', 'white');
  field('Max res body',     profile.maxResBody?fmtBytes(profile.maxResBody):'unlimited', 'white');
  field('Max redirects',    profile.maxRedirects, 'white');
  field('HTTPS→HTTP redir', String(profile.allowHttpDowngrade), profile.allowHttpDowngrade?'yellow':'green');
  field('Inject Roblox-Id', String(profile.injectRobloxId), profile.injectRobloxId?'cyan':'gray');
  field('Locked headers',   profile.lockedHeaders.length?profile.lockedHeaders.join(', '):'none', 'gray');
}

function printProfileTable() {
  section('PROFILES');
  out();
  const COL = [14,8,10,8,8,8,6,32];
  const hdr = ['Profile','Source','Engine','SSL','SSRF','Rate','TTL','Description'].map((h,i)=>h.padEnd(COL[i]));
  out(`    ${Bd(hdr.join('  '))}`);
  out(Gr(`    ${hr('─',100)}`));
  for (const [key, pr] of Object.entries(PROFILES)) {
    const srcCol = pr.source==='server'?'cyan':'yellow';
    out([
      `    ${Cy(key.padEnd(COL[0]))}`,
      p(srcCol, pr.source.padEnd(COL[1])),
      Gr(pr.engine.split('/')[0].slice(0,10).padEnd(COL[2])),
      p(pr.sslVerify?'green':'yellow',(pr.sslVerify?'strict':'skip').padEnd(COL[3])),
      p(pr.ssrfGuard?'green':'gray',(pr.ssrfGuard?'yes':'no').padEnd(COL[4])),
      Gr((pr.rateLimit?`${pr.rateLimit.capacity}/m`:'none').padEnd(COL[5])),
      Gr(String(pr.tcp.ttl).padEnd(COL[6])),
      Dm(pr.desc.slice(0,32)),
    ].join('  '));
  }
  out(); out(Gr(`    ${hr('─',100)}`));
  out(`    ${Gr('Run')} --fingerprint ${Gr('-p')} <profile> ${Gr('for full TLS/TCP details.')}`);
}

function printRequest(profile, method, targetUrl, headers, body, bucket) {
  section(`REQUEST  ${Gr('→')}  ${Cy(method)}  ${W(targetUrl)}`);
  field('Profile',    profile.label,  'cyan');
  field('Source',     profile.source==='server'?`Server ${Gr('(AWS EC2 Linux)')}` : `Client ${Gr('('+profile.platform+')')}`, 'white');
  field('Engine',     profile.engine, 'gray');
  field('SSL verify', profile.sslVerify?'strict':'disabled — accepts self-signed', profile.sslVerify?'green':'yellow');
  field('SSRF guard', profile.ssrfGuard?'active':'disabled', profile.ssrfGuard?'green':'gray');
  if (bucket) field('Rate limit', `${bucket.remaining}/${bucket.cap} tokens remaining`, 'gray');
  else        field('Rate limit', 'none (executor profile)', 'gray');

  out(`\n    ${Bd('Headers')}`);
  out(Gr(`    ${hr('─',60)}`));
  for (const [k,v] of Object.entries(headers)) {
    const kl     = k.toLowerCase();
    const isAuto = ['roblox-id','roblox-game-id','user-agent','accept-encoding','connection','content-length'].includes(kl);
    const isLock = profile.lockedHeaders.includes(kl);
    const badge  = isAuto ? ` ${Y('[auto]')}` : isLock ? ` ${R('[locked]')}` : '';
    out(`    ${Cy(k.padEnd(28))}  ${W(v)}${badge}`);
  }

  if (body) {
    out(`\n    ${Bd('Body')} ${Gr('('+fmtBytes(Buffer.byteLength(body))+')')}`);
    out(Gr(`    ${hr('─',60)}`));
    out(`    ${Dm(body.slice(0,512))}${body.length>512?Gr('\n    ...[truncated]'):''}`);
  }
}

function printResponse(res, timings, hops, outputFile, format, verbose) {
  const sc = res.statusCode;
  section(`RESPONSE`);
  out(`    ${statusBadge(sc)} ${Bd(res.statusMessage)}`);
  out();
  field('Total time',    (timings.total||0)+'ms', 'byellow');
  if (timings.ttfb!=null) field('TTFB',         timings.ttfb+'ms', 'yellow');
  if (timings.tcp!=null)  field('TCP connect',  timings.tcp+'ms',  'gray');
  if (timings.tls!=null)  field('TLS handshake',timings.tls+'ms',  'gray');
  if (hops>0)             field('Redirects',    hops, 'cyan');
  field('Body size', fmtBytes(res.byteLength), 'gray');
  if (res.encoding && res.encoding!=='identity') field('Encoding', res.encoding+' (decompressed)', 'gray');

  if (format==='status') return;

  out(`\n    ${Bd('Headers')}`);
  out(Gr(`    ${hr('─',60)}`));
  for (const [k,v] of Object.entries(res.headers)) {
    out(`    ${Cy(titleCase(k).padEnd(28))}  ${Dm(v)}`);
  }

  if (format==='headers') return;

  out(`\n    ${Bd('Body')} ${Gr('('+fmtBytes(res.byteLength)+')')}`);
  out(Gr(`    ${hr('─',60)}`));

  if (outputFile) {
    fs.writeFileSync(outputFile, res.body);
    out(`    ${G('[+]')} Saved to ${Cy(outputFile)}`);
    return;
  }

  if (format==='body')   { outRaw(res.bodyText+'\n'); return; }
  if (format==='raw')    { process.stdout.write(res.body); return; }
  if (format==='json') {
    out(JSON.stringify({ status:sc, statusText:res.statusMessage, headers:res.headers, body:res.bodyText, byteLength:res.byteLength, timings }, null, 2));
    return;
  }

  let text = res.bodyText;
  if ((res.headers['content-type']||'').includes('json')) {
    try { text = JSON.stringify(JSON.parse(text), null, 2); } catch(_) {}
  }
  const lines = text.split('\n');
  if (lines.length > 80) {
    out(lines.slice(0,80).join('\n'));
    out(Gr(`\n    ... [${lines.length-80} more lines — use --format body or --output <file>]`));
  } else {
    out(text);
  }
}

function printError(e) {
  out();
  out(`${BR('[!]')} ${Bd('Error')}  ${Gr('['+( e.code||'ERR')+']')}  ${R(e.message)}`);
  const hints = {
    SSRF       : `SSRF protection blocked this. Private IPs, loopback, link-local, 169.254.169.254, *.roblox.com are blocked.\n    Executor profiles (synapse-x, delta, krnl, etc.) have no SSRF guard. Use --no-ssrf to force.`,
    RATE_LIMIT : `Standard profile: 500 req/min token bucket. Use --no-rate-limit or any executor profile.`,
    BODY_LIMIT : `Standard profile enforces 1MB body limit. Use an executor profile for unlimited body.`,
    TIMEOUT    : `Increase with --timeout <ms>. Standard default: 30000ms.`,
    DOWNGRADE  : `Standard profile blocks HTTPS→HTTP redirects. Executor profiles allow them.`,
    PROTOCOL   : `Only http:// and https:// are supported.`,
  };
  if (hints[e.code]) out(Gr(`    ${hints[e.code]}`));
  out();
}

function printHelp() {
  printBanner();
  const s = (title) => { out(`${Bd(title)}`); };
  const f = (fl, desc) => out(`  ${Cy(fl.padEnd(30))} ${Gr(desc)}`);
  const e = (cmd) => out(`  ${W(cmd)}`);
  const c = (comment) => out(`  ${Gr(comment)}`);

  s('SYNOPSIS');
  out(`  node ro-http.js ${Cy('<url>')} ${Cy('[method]')} ${Gr('[flags]')}`);
  out();

  s('MODES');
  out(`  ${Cy('request')}   ${Gr('(default)')}   Single HTTP request with selected profile.`);
  out(`  ${Cy('scan')}                 Fire all profiles at the URL. Compare responses.`);
  out(`  ${Cy('fuzz')}                 Iterate payload list replacing FUZZ in URL/body.`);
  out(`  ${Cy('replay')}              Repeat request N times. Collect timing stats.`);
  out(`  ${Cy('fingerprint')}         Print TLS + TCP fingerprint. No request sent.`);
  out();

  s('PROFILE  --profile, -p <name>');
  out(`  ${Cy('standard')}    ${Gr('Server-side  AWS EC2 Linux  libcurl+BoringSSL  SSRF+ratelimit  1MB limit')}`);
  out(`  ${Cy('synapse-x')}   ${Gr('Client-side  Windows x64   WinHTTP/Schannel   no-ssrf  no-ratelimit  unlimited')}`);
  out(`  ${Cy('delta')}       ${Gr('Client-side  Android arm64  OkHttp/Conscrypt   no-ssrf  injects Roblox-Id')}`);
  out(`  ${Cy('krnl')}        ${Gr('Client-side  Windows x64   WinInet/Schannel   no-ssrf  no-ratelimit  unlimited')}`);
  out(`  ${Cy('fluxus')}      ${Gr('Client-side  Android arm64  OkHttp             no-ssrf  no-ratelimit  unlimited')}`);
  out(`  ${Cy('arceus-x')}    ${Gr('Client-side  iOS/Android   NSURLSession/Conscrypt  no-ssrf  injects Roblox-Id')}`);
  out(`  ${Cy('script-ware')} ${Gr('Client-side  Win/macOS     libcurl/NSURLSession   no-ssrf  no-ratelimit')}`);
  out();

  s('REQUEST FLAGS');
  f('--header, -H "Key: Value"',  'Add header. Repeat for multiple.');
  f('--body, -d <string>',        'Request body string.');
  f('--body-file <path>',         'Read body from file.');
  f('--place-id <id>',            'Override auto-injected Roblox-Id header.');
  f('--universe-id <id>',         'Override auto-injected Roblox-Game-Id header.');
  f('--timeout, -t <ms>',         'Timeout ms. Default: profile value.');
  f('--no-redirects',             'Disable redirect following.');
  f('--max-redirects <n>',        'Max redirects. Default: profile value.');
  out();

  s('OUTPUT FLAGS');
  f('--format, -f <fmt>',         'full(default) | body | headers | status | json | raw');
  f('--output, -o <file>',        'Write response body to file.');
  f('--verbose, -v',              'Show TCP/TLS socket events live.');
  f('--quiet, -q',                'Print only response body. No banner or sections.');
  out();

  s('SECURITY FLAGS');
  f('--no-ssrf',                  'Bypass SSRF IP blocklist (testing only).');
  f('--no-rate-limit',            'Bypass token bucket rate limiter.');
  out();

  s('MODE FLAGS');
  f('--scan',                     'Scan all profiles. Add after URL.');
  f('--fuzz <wordlist.txt>',      'Fuzz mode. File = one payload per line. Put FUZZ in URL.');
  f('--fuzz-marker <str>',        'Custom fuzz marker. Default: FUZZ');
  f('--replay <n>',               'Replay N times.');
  f('--replay-delay <ms>',        'Delay between replays.');
  f('--fingerprint',              'Print TLS+TCP fingerprint for profile. No request sent.');
  f('--profiles',                 'Print all profiles comparison table.');
  out();

  s('EXAMPLES');
  c('# Standard game-server GET — AWS Linux, libcurl, Roblox headers auto-injected');
  e('node ro-http.js https://api.example.com/data');
  out();
  c('# POST JSON as Synapse X — Windows TLS, no SSL verify, full header control');
  e('node ro-http.js https://api.example.com/event POST -p synapse-x \\');
  e('  -H "Content-Type: application/json" -d \'{"event":"kill","victim":"player1"}\'');
  out();
  c('# Delta mobile executor with custom game IDs');
  e('node ro-http.js https://api.example.com/join POST -p delta \\');
  e('  --place-id 6872265039 --universe-id 2753915549 \\');
  e('  -H "Content-Type: application/json" -d \'{"level":50}\'');
  out();
  c('# Scan all profiles — detect server-side UA/IP filtering');
  e('node ro-http.js https://api.example.com/endpoint --scan');
  out();
  c('# Fuzz numeric ID in path with wordlist');
  e('node ro-http.js "https://api.example.com/user/FUZZ/inventory" -p krnl --fuzz ids.txt');
  out();
  c('# Replay 50 times with 200ms delay — stress test or timing attack');
  e('node ro-http.js https://api.example.com/ping --replay 50 --replay-delay 200');
  out();
  c('# Full JA3 + TCP fingerprint for arceus-x — no request sent');
  e('node ro-http.js --fingerprint -p arceus-x');
  out();
  c('# Verbose output — live TCP connect + TLS handshake info');
  e('node ro-http.js https://api.example.com/data -v --format json');
  out();
  c('# Quiet mode — pipe response body into jq or file');
  e('node ro-http.js https://api.example.com/data -q | jq .');
  out();
}

function printTutorial() {
  printBanner();
  out(`${C.bold}${C.cyan}ro-http v${VERSION} - Tutorial${C.reset}`);
  out(`${C.cyan}${hr('─', 40)}${C.reset}`);
  out();
  
  out(`${Bd('1. WHAT IS RO-HTTP')}`);
  out(Gr('   Roblox HttpService Network Emulator & Inspector'));
  out(Gr('   This tool mimics the network fingerprints of:'));
  out(Gr('   • Official Roblox game servers (standard profile)'));
  out(Gr('   • Popular Roblox executors (Synapse X, Delta, KRNL, Fluxus, Arceus X, Script-Ware)'));
  out();
  
  out(`${Bd('2. HOW IT WORKS')}`);
  out(Gr('   Each profile contains specifications for:'));
  out(Gr('   • TLS cipher suites (in correct order)'));
  out(Gr('   • TCP stack parameters (TTL, window scaling, SACK, timestamps)'));
  out(Gr('   • HTTP headers (User-Agent, Accept-Encoding, Roblox-ID injection)'));
  out(Gr('   • Security features (SSRF protection, rate limiting, redirect handling)'));
  out();
  
  out(`${Bd('3. BASIC USAGE')}`);
  e('   # Simple GET request with standard profile (Roblox game server)');
  e('   node ro-http.js https://api.example.com/data');
  out();
  e('   # POST request with custom headers and body');
  e('   node ro-http.js https://api.example.com/api POST \\');
  e('     -H "Content-Type: application/json" \\');
  e('     -d \'{"key":"value"}\'');
  out();
  
  out(`${Bd('4. PROFILES')}`);
  out(Gr('   Use -p or --profile to select different executor behaviors:'));
  out();
  field('standard',    'Server-side  | AWS Linux | libcurl/BoringSSL | SSRF+ratelimit', 'cyan');
  field('synapse-x',   'Windows x64  | WinHTTP   | No SSL verify | Full header control', 'yellow');
  field('delta',       'Android      | OkHttp    | Injects Roblox-Id | Brotli support', 'yellow');
  field('krnl',        'Windows x64  | WinInet   | No SSL verify | Unlimited body', 'yellow');
  field('fluxus',      'Android      | OkHttp    | Lightweight | JSON Accept header', 'yellow');
  field('arceus-x',    'iOS/Android  | NSURLSession | Cross-platform | Injects Roblox-Id', 'yellow');
  field('script-ware', 'Win/macOS    | libcurl/NSURLSession | Premium executor', 'yellow');
  out();
  
  out(`${Bd('5. MODES')}`);
  out(Gr('   ro-http has 5 main modes:'));
  out();
  field('request',  'Default - Single request with selected profile', 'white');
  field('scan',     'Test all profiles against a URL to detect filtering', 'white');
  field('fuzz',     'Replace FUZZ marker with payloads from wordlist', 'white');
  field('replay',   'Repeat request N times for timing analysis', 'white');
  field('fingerprint','Display TLS/TCP fingerprint without sending request', 'white');
  out();
  
  out(`${Bd('6. SCAN MODE')}`);
  e('   node ro-http.js https://target.com/api --scan');
  out(Gr('   This fires all 7 profiles and compares responses.'));
  out(Gr('   If some profiles get different status codes:'));
  out(Gr('   • 200 vs 403 → Server may be blocking by User-Agent'));
  out(Gr('   • 200 vs 404 → Possible IP/geo filtering'));
  out(Gr('   • Timeouts → Rate limiting or WAF triggers'));
  out();
  
  out(`${Bd('7. FUZZ MODE')}`);
  e('   # Create wordlist.txt with one payload per line');
  e('   echo "admin" > payloads.txt');
  e('   echo "../../../etc/passwd" >> payloads.txt');
  e('   echo "\' OR 1=1--" >> payloads.txt');
  out();
  e('   # FUZZ in URL path');
  e('   node ro-http.js "https://target.com/user/FUZZ/profile" --fuzz payloads.txt');
  out();
  e('   # FUZZ in request body');
  e('   node ro-http.js https://target.com/login POST \\');
  e('     -H "Content-Type: application/x-www-form-urlencoded" \\');
  e('     -d "username=FUZZ&password=test" \\');
  e('     --fuzz payloads.txt');
  out();
  
  out(`${Bd('8. REPLAY MODE')}`);
  e('   # Send 100 requests, 500ms apart');
  e('   node ro-http.js https://target.com/api --replay 100 --replay-delay 500');
  out(Gr('   Output shows: TTFB, total time, size per request'));
  out(Gr('   Final stats: avg/min/max times, jitter, status code distribution'));
  out();
  
  out(`${Bd('9. FINGERPRINTING')}`);
  e('   # View complete TLS/TCP fingerprint for any profile');
  e('   node ro-http.js --fingerprint -p delta');
  out(Gr('   Displays:'));
  out(Gr('   • JA3 string and MD5 hash (TLS fingerprint)'));
  out(Gr('   • Cipher suite order (exact)'));
  out(Gr('   • TCP parameters (TTL, window scale, etc.)'));
  out(Gr('   • OS estimate based on network stack'));
  out();
  
  out(`${Bd('10. HEADERS')}`);
  out(Gr('   Different profiles handle headers differently:'));
  out();
  out(`   ${Cy('standard')} - Auto-injects Roblox-Id, Roblox-Game-Id`);
  out(`                Locked headers: user-agent, host, accept-encoding`);
  out(`                Cannot override User-Agent`);
  out();
  out(`   ${Cy('synapse-x')} - No locked headers, full control`);
  out(`                Can spoof any header including Host`);
  out(`                No Roblox-ID injection`);
  out();
  out(`   ${Cy('delta')} - Auto-injects Roblox headers`);
  out(`                Accepts custom headers`);
  out(`                Supports Brotli compression`);
  out();
  e('   # Example with custom headers');
  e('   node ro-http.js https://target.com/api -p synapse-x \\');
  e('     -H "User-Agent: Custom/1.0" \\');
  e('     -H "X-Forwarded-For: 1.2.3.4"');
  out();
  
  out(`${Bd('11. SECURITY')}`);
  out(Gr('   The standard profile includes Roblox-grade security:'));
  out(Gr('   • SSRF Protection: Blocks private IP ranges, localhost, metadata services'));
  out(Gr('   • Rate Limiting: 500 requests per minute token bucket'));
  out(Gr('   • Body Limits: 1MB max request/response'));
  out(Gr('   • Redirect Safety: Blocks HTTPS→HTTP downgrade'));
  out(Gr('   • Domain Blocking: Prevents loops to *.roblox.com'));
  out();
  out(Gr('   Executor profiles disable these for unrestricted testing'));
  out(Gr('   Use --no-ssrf or --no-rate-limit to bypass on standard profile'));
  out();
  
  out(`${Bd('12. USE CASES')}`);
  out();
  out(`   ${BY('A) Testing Roblox Game Backends')}`);
  e('      # Simulate legitimate game server traffic');
  e('      node ro-http.js https://mygame.com/api -p standard --place-id 12345');
  out();
  e('      # Test how exploit traffic appears');
  e('      node ro-http.js https://mygame.com/api -p synapse-x -H "User-Agent: Custom"');
  out();
  out(`   ${BY('B) Bypassing WAF/Filtering')}`);
  e('      # Scan to find allowed profiles');
  e('      node ro-http.js https://target.com/protected --scan');
  out();
  e('      # Use working profile to bypass');
  e('      node ro-http.js https://target.com/protected -p fluxus');
  out();
  out(`   ${BY('C) Fuzzing APIs')}`);
  e('      # Test for IDOR, SQLi, path traversal');
  e('      node ro-http.js "https://api.target.com/user/FUZZ/data" --fuzz ids.txt');
  out();
  out(`   ${BY('D) Performance Testing')}`);
  e('      # Measure response times under load');
  e('      node ro-http.js https://api.target.com/check --replay 50');
  out();
  
  out(`${Bd('13. OUTPUT FORMATS')}`);
  f('--format full',     'Default - Headers + truncated body');
  f('--format body',     'Only response body');
  f('--format headers',  'Only response headers');
  f('--format status',   'Only status code');
  f('--format json',     'Full JSON output');
  f('--format raw',      'Raw binary response');
  f('--output file.txt', 'Save body to file');
  f('--quiet, -q',       'Body only, no banners');
  f('--verbose, -v',     'Show TCP/TLS events live');
  out();
  
  out(`${Bd('14. TROUBLESHOOTING')}`);
  out();
  out(`   ${BY('Error: SSRF blocked')}`);
  out(Gr('   • Use executor profile (-p synapse-x) or --no-ssrf'));
  out(Gr('   • Cannot access localhost, 169.254.169.254, private IPs'));
  out();
  out(`   ${BY('Error: Rate limited')}`);
  out(Gr('   • Standard profile: 500/min. Use --no-rate-limit or executor'));
  out(Gr('   • Wait for token bucket to refill'));
  out();
  out(`   ${BY('Error: Body limit exceeded')}`);
  out(Gr('   • Standard profile: 1MB limit. Use executor profile'));
  out(Gr('   • Reduce body size or switch to -p synapse-x'));
  out();
  out(`   ${BY('No color output')}`);
  out(Gr('   • Set NO_COLOR=1 environment variable'));
  out(Gr('   • Output is piped (not a TTY)'));
  out();
  
  out(`${Bd('15. EXAMPLE WORKFLOW')}`);
  out();
  e('   # Step 1: Fingerprint target');
  e('   node ro-http.js https://target.com/api --scan');
  out();
  e('   # Step 2: Choose working profile (say delta works)');
  e('   node ro-http.js https://target.com/api -p delta -v');
  out();
  e('   # Step 3: Fuzz for vulnerabilities');
  e('   node ro-http.js "https://target.com/api/user/FUZZ" \\');
  e('     -p delta --fuzz payloads.txt --format status');
  out();
  e('   # Step 4: Test rate limits');
  e('   node ro-http.js https://target.com/api --replay 100 \\');
  e('     --replay-delay 100 --format status');
  out();
  e('   # Step 5: Save successful payload response');
  e('   node ro-http.js "https://target.com/api/user/12345" \\');
  e('     -p delta -o user_data.json');
  out();
  
  out(`${C.green}${hr('─', 40)}${C.reset}`);
  out(`${C.green}End of tutorial - see --help for more options${C.reset}`);
  out();
}

function parseArgs(argv) {
  const raw = argv.slice(2);
  const cfg = {
    targetUrl:null, method:'GET', profileKey:'standard',
    headers:{}, body:null, bodyFile:null, placeId:null, universeId:null,
    output:null, timeout:null, followRedirects:true, maxRedirects:null,
    format:'full', verbose:false, quiet:false,
    noSsrf:false, noRateLimit:false,
    showFingerprint:false, showProfiles:false, help:false, tutorial:false,
    scan:false, fuzzFile:null, fuzzMarker:'FUZZ',
    replayCount:null, replayDelay:0,
  };

  if (raw.length===0) { cfg.help=true; return cfg; }

  if (!raw[0].startsWith('-')) cfg.targetUrl = raw.shift();
  if (raw.length>0 && !raw[0].startsWith('-') && cfg.targetUrl) cfg.method = raw.shift().toUpperCase();

  let i=0;
  while (i<raw.length) {
    const f = raw[i];
    const nxt = () => { if (i+1>=raw.length) throw new Error(`${f} requires a value`); return raw[++i]; };
    switch(f) {
      case '--help':          case '-h':  cfg.help=true;             break;
      case '-hh':                         cfg.tutorial=true;          break;
      case '--profiles':                  cfg.showProfiles=true;     break;
      case '--fingerprint':               cfg.showFingerprint=true;  break;
      case '--scan':                      cfg.scan=true;             break;
      case '--verbose':       case '-v':  cfg.verbose=true;          break;
      case '--quiet':         case '-q':  cfg.quiet=true;            break;
      case '--no-ssrf':                   cfg.noSsrf=true;           break;
      case '--no-rate-limit':             cfg.noRateLimit=true;      break;
      case '--no-redirects':              cfg.followRedirects=false;  break;
      case '--profile':       case '-p':  cfg.profileKey=nxt();      break;
      case '--body':          case '-d':  cfg.body=nxt();            break;
      case '--body-file':                 cfg.bodyFile=nxt();        break;
      case '--place-id':                  cfg.placeId=nxt();         break;
      case '--universe-id':               cfg.universeId=nxt();      break;
      case '--output':        case '-o':  cfg.output=nxt();          break;
      case '--timeout':       case '-t':  cfg.timeout=parseInt(nxt(),10); break;
      case '--max-redirects':             cfg.maxRedirects=parseInt(nxt(),10); break;
      case '--replay':                    cfg.replayCount=parseInt(nxt(),10); break;
      case '--replay-delay':              cfg.replayDelay=parseInt(nxt(),10); break;
      case '--fuzz':                      cfg.fuzzFile=nxt();        break;
      case '--fuzz-marker':               cfg.fuzzMarker=nxt();      break;
      case '--format':        case '-f': {
        cfg.format=nxt();
        const v=['full','body','headers','status','json','raw'];
        if (!v.includes(cfg.format)) throw new Error(`--format must be one of: ${v.join(', ')}`);
        break;
      }
      case '--header':        case '-H': {
        const raw2=nxt(); const sep=raw2.indexOf(':');
        if (sep===-1) throw new Error(`Invalid header "${raw2}". Format: "Key: Value"`);
        cfg.headers[raw2.slice(0,sep).trim()]=raw2.slice(sep+1).trim();
        break;
      }
      default: throw new Error(`Unknown flag: ${f}`);
    }
    i++;
  }
  return cfg;
}

async function main() {
  let cfg;
  try { cfg = parseArgs(process.argv); }
  catch(e) {
    printBanner();
    out(`${BR('[!]')} Argument error: ${R(e.message)}`);
    out(Gr(`    Run with --help for usage.`));
    process.exit(1);
  }

  if (cfg.tutorial) { printTutorial(); return; }
  if (cfg.help) { printHelp(); return; }
  if (!cfg.quiet) printBanner();
  if (cfg.showProfiles) { printProfileTable(); return; }

  const profile = PROFILES[cfg.profileKey];
  if (!profile) {
    out(`${BR('[!]')} Unknown profile: ${R(cfg.profileKey)}`);
    out(Gr(`    Valid: ${Object.keys(PROFILES).join('  ')}`));
    process.exit(1);
  }

  const eff = Object.assign({}, profile);
  if (cfg.noSsrf) eff.ssrfGuard = false;

  if (cfg.showFingerprint) {
    printFingerprint(cfg.profileKey, eff);
    if (!cfg.targetUrl) return;
    out();
  }

  if (cfg.bodyFile) {
    if (!fs.existsSync(cfg.bodyFile)) { out(`${BR('[!]')} Body file not found: ${R(cfg.bodyFile)}`); process.exit(1); }
    cfg.body = fs.readFileSync(cfg.bodyFile, 'utf8');
  }

  const bucket = (eff.rateLimit && !cfg.noRateLimit)
    ? new TokenBucket(eff.rateLimit.capacity, eff.rateLimit.perSecond) : null;

  if (cfg.scan) {
    if (!cfg.targetUrl) { out(`${BR('[!]')} --scan requires a URL.`); process.exit(1); }
    try { await runScan(cfg.targetUrl, cfg.method, { headers:cfg.headers, body:cfg.body, followRedirects:cfg.followRedirects, maxRedirects:cfg.maxRedirects, timeout:cfg.timeout }); }
    catch(e) { printError(e); process.exit(1); }
    out(); return;
  }

  if (cfg.fuzzFile) {
    if (!cfg.targetUrl) { out(`${BR('[!]')} --fuzz requires a URL.`); process.exit(1); }
    if (!fs.existsSync(cfg.fuzzFile)) { out(`${BR('[!]')} Fuzz file not found: ${R(cfg.fuzzFile)}`); process.exit(1); }
    const payloads = fs.readFileSync(cfg.fuzzFile,'utf8').split('\n').map(l=>l.trim()).filter(Boolean);
    try { await runFuzz(cfg.targetUrl, cfg.method, { profile:eff, headers:cfg.headers, body:cfg.body, timeout:cfg.timeout, fuzzPayloads:payloads, fuzzMarker:cfg.fuzzMarker }); }
    catch(e) { printError(e); process.exit(1); }
    out(); return;
  }

  if (cfg.replayCount) {
    if (!cfg.targetUrl) { out(`${BR('[!]')} --replay requires a URL.`); process.exit(1); }
    try { await runReplay(cfg.targetUrl, cfg.method, { profile:eff, headers:cfg.headers, body:cfg.body, timeout:cfg.timeout, followRedirects:cfg.followRedirects, replayCount:cfg.replayCount, replayDelay:cfg.replayDelay }); }
    catch(e) { printError(e); process.exit(1); }
    out(); return;
  }

  if (!cfg.targetUrl) {
    if (!cfg.showFingerprint && !cfg.showProfiles) { out(`${BR('[!]')} URL required. Run --help.`); process.exit(1); }
    return;
  }
  try { new URL(cfg.targetUrl); } catch { out(`${BR('[!]')} Invalid URL: ${R(cfg.targetUrl)}`); process.exit(1); }

  const previewHeaders = buildHeaders(eff, cfg.headers, cfg.method, cfg.body, cfg.placeId, cfg.universeId);
  if (!cfg.quiet) printRequest(eff, cfg.method, cfg.targetUrl, previewHeaders, cfg.body, bucket);

  try {
    const { res, timings, hops } = await doRequest({
      targetUrl:cfg.targetUrl, method:cfg.method, userHeaders:cfg.headers, body:cfg.body,
      placeId:cfg.placeId, universeId:cfg.universeId, followRedirects:cfg.followRedirects,
      maxRedirects:cfg.maxRedirects, timeout:cfg.timeout, maxResBody:eff.maxResBody,
    }, eff, bucket, cfg.verbose);

    if (cfg.quiet) { outRaw(res.bodyText); }
    else printResponse(res, timings, hops, cfg.output, cfg.format, cfg.verbose);
    if (res.statusCode >= 400) process.exitCode = 1;

  } catch(e) {
    if (!cfg.quiet) printError(e);
    else process.stderr.write(e.message+'\n');
    process.exit(1);
  }

  if (!cfg.quiet) out();
}

main().catch(e => { process.stderr.write('Fatal: '+e.message+'\n'); process.exit(1); });