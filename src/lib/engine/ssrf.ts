import dns from 'dns/promises';
import { URL } from 'url';

// Private and reserved IP patterns
const BLOCKED_IP_PATTERNS = [
  /^127\./,                         // Loopback (127.0.0.0/8)
  /^10\./,                          // Private class A (10.0.0.0/8)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private class B (172.16.0.0/12)
  /^192\.168\./,                    // Private class C (192.168.0.0/16)
  /^169\.254\./,                    // Link-local / Cloud metadata (AWS, GCP, Azure: 169.254.169.254)
  /^0\./,                           // Zero address
  /^::1$/,                          // IPv6 loopback
  /^fc00:/,                         // IPv6 unique local
  /^fe80:/,                         // IPv6 link local
  /^fd[0-9a-f]{2}:/i,               // IPv6 private
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
  'internal',
  'local',
];

/**
 * Validates a URL against Server-Side Request Forgery (SSRF) vulnerabilities
 */
export async function validateSafeUrl(urlString: string): Promise<{ safe: boolean; error?: string; url?: URL }> {
  try {
    if (!urlString || typeof urlString !== 'string') {
      return { safe: false, error: 'URL is required' };
    }

    const trimmed = urlString.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { safe: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    // Check blocked hostnames
    if (BLOCKED_HOSTNAMES.some(blocked => hostname === blocked || hostname.endsWith(`.${blocked}`))) {
      return { safe: false, error: `Access to restricted internal host "${hostname}" is blocked` };
    }

    // Check if hostname is direct IP and blocked
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return { safe: false, error: `Access to private IP range "${hostname}" is prohibited` };
      }
    }

    // Resolve DNS to verify the target IP address is not private
    try {
      const addresses = await dns.lookup(hostname, { all: true });
      for (const addr of addresses) {
        for (const pattern of BLOCKED_IP_PATTERNS) {
          if (pattern.test(addr.address)) {
            return {
              safe: false,
              error: `Host "${hostname}" resolved to private IP "${addr.address}" which is prohibited`,
            };
          }
        }
      }
    } catch {
      // If DNS lookup fails, let the request proceed to fail naturally with standard fetch error or flag
    }

    return { safe: true, url: parsed };
  } catch (err: any) {
    return { safe: false, error: `Invalid URL format: ${err.message}` };
  }
}
