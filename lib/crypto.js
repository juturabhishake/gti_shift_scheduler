const SECRET = 'GtiNgMajorIssuesSecretKey2026';

export function encryptId(id) {
  if (id === null || id === undefined || id === '') return '';
  const salt = Math.floor(1000 + Math.random() * 9000).toString();
  const raw = `${id}|${salt}`;
  let enc = '';
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i) ^ SECRET.charCodeAt(i % SECRET.length);
    enc += code.toString(16).padStart(2, '0');
  }
  return enc;
}

export function decryptId(cipherText) {
  if (!cipherText) return '';
  const text = String(cipherText).trim();
  if (/^\d+$/.test(text) && text.length <= 6) return text;
  try {
    let raw = '';
    for (let i = 0; i < text.length; i += 2) {
      const code = parseInt(text.substr(i, 2), 16);
      raw += String.fromCharCode(code ^ SECRET.charCodeAt((i / 2) % SECRET.length));
    }
    const [id] = raw.split('|');
    return id || text;
  } catch {
    return text;
  }
}
