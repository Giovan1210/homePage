const http = require('http');
const https = require('https');
const tls = require('tls');

const DEFAULT_TIMEOUT = 10000;
const CERT_EXPIRING_DAYS = 30;

const ensureUrl = (input) => {
  if (!input) return null;
  const trimmed = String(input).trim();
  module.exports = { checkDomain };
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const requestHead = (url) => new Promise((resolve, reject) => {
  const urlObj = new URL(url);
  const lib = urlObj.protocol === 'https:' ? https : http;

  const start = Date.now();
  const req = lib.request(
    {
      method: 'HEAD',
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      timeout: DEFAULT_TIMEOUT,
      ...(urlObj.protocol === 'https:'
        ? { servername: urlObj.hostname, rejectUnauthorized: false }
        : {}),
    },
    (res) => {
      const latency = Date.now() - start;
      resolve({
        statusCode: res.statusCode || null,
        statusMessage: res.statusMessage || '',
        latency,
        headers: res.headers,
        protocol: urlObj.protocol,
        host: urlObj.hostname,
      });
      res.resume();
    }
  );

  req.on('timeout', () => {
    req.destroy(new Error('Request timeout'));
  });

  req.on('error', (err) => reject(err));
  req.end();
});

const formatErrorMessage = (error) => {
  const code = error?.code;
  const message = String(error?.message || '').toLowerCase();

  if (code === 'ENOTFOUND') return '域名解析失败';
  if (code === 'ECONNREFUSED') return '连接被拒绝';
  if (code === 'ETIMEDOUT') return '请求超时';
  if (code === 'ECONNRESET') return '连接被重置';
  if (code === 'EAI_AGAIN') return 'DNS 查询超时';
  if (message.includes('tls') && message.includes('disconnected')) return 'TLS 握手失败';
  if (message.includes('handshake')) return 'TLS 握手失败';
  if (message.includes('certificate')) return '证书校验失败';

  return '连接失败';
};

const checkCertificate = (host) => new Promise((resolve) => {
  if (!host) {
    resolve({ status: 'none', error: 'Invalid host' });
    return;
  }

  const socket = tls.connect(
    {
      host,
      port: 443,
      servername: host,
      rejectUnauthorized: false,
      timeout: DEFAULT_TIMEOUT,
    },
    () => {
      try {
        const cert = socket.getPeerCertificate();
        if (!cert || !cert.valid_to) {
          resolve({ status: 'none' });
          socket.end();
          return;
        }

        const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
        const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
        const now = new Date();
        const daysRemaining = validTo ? Math.ceil((validTo.getTime() - now.getTime()) / 86400000) : null;
        const isValidNow = !!(validFrom && validTo && now >= validFrom && now <= validTo);

        let status = 'valid';
        if (!isValidNow) status = 'expired';
        else if (daysRemaining !== null && daysRemaining <= CERT_EXPIRING_DAYS) status = 'expiring';

        resolve({
          status,
          validFrom: validFrom ? validFrom.toISOString() : null,
          validTo: validTo ? validTo.toISOString() : null,
          daysRemaining,
          issuer: cert.issuer?.O || cert.issuer?.CN || null,
          subject: cert.subject?.CN || null,
          serialNumber: cert.serialNumber || null,
          fingerprint: cert.fingerprint || null,
        });
      } catch (error) {
        resolve({ status: 'error', error: error?.message || 'Certificate parse error' });
      } finally {
        socket.end();
      }
    }
  );

  socket.on('error', (err) => {
    resolve({ status: 'error', error: err.message || 'TLS connection failed' });
  });

  socket.on('timeout', () => {
    socket.destroy();
    resolve({ status: 'error', error: 'TLS timeout' });
  });
});

const checkDomain = async (inputUrl) => {
  const normalizedUrl = ensureUrl(inputUrl);
  if (!normalizedUrl) {
    return {
      status: 'offline',
      message: '无效的 URL',
      latency: null,
      statusCode: null,
      ssl: { status: 'none' },
    };
  }

  const urlObj = new URL(normalizedUrl);
  const host = urlObj.hostname;

  try {
    const [head, ssl] = await Promise.all([
      requestHead(normalizedUrl),
      checkCertificate(host),
    ]);

    return {
      status: 'online',
      message: head.statusMessage || '连接成功',
      latency: head.latency,
      statusCode: head.statusCode,
      checkedAt: new Date().toISOString(),
      host,
      ssl,
    };
  } catch (error) {
    return {
      status: 'offline',
      message: formatErrorMessage(error),
      latency: null,
      statusCode: null,
      checkedAt: new Date().toISOString(),
      host,
      ssl: await checkCertificate(host),
    };
  }
};

module.exports = { checkDomain };