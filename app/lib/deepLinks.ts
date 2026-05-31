const SCHEME = 'ajotribe';
const WEB_BASE = 'https://ajotribe.ng';

export function inviteDeepLink(inviteCode: string): string {
  return `${SCHEME}://circle/${inviteCode}`;
}

export function inviteWebUrl(inviteCode: string): string {
  return `${WEB_BASE}/join/${inviteCode}`;
}

export function shareText(circleName: string, amountNaira: number, frequency: string, inviteCode: string): string {
  return `Join my savings circle on Ajotribe!\n\n${circleName}\n₦${amountNaira.toLocaleString('en-NG')} ${frequency}\n\n${inviteWebUrl(inviteCode)}`;
}

// Returns the invite code if the URL is a valid Ajotribe invite link, null otherwise
export function parseInviteCode(url: string): string | null {
  // ajotribe://circle/{code}
  const deepMatch = url.match(/^ajotribe:\/\/circle\/([A-Za-z0-9_-]+)/i);
  if (deepMatch?.[1]) return deepMatch[1].toUpperCase();

  // https://ajotribe.ng/join/{code}
  const webMatch = url.match(/ajotribe\.ng\/join\/([A-Za-z0-9_-]+)/i);
  if (webMatch?.[1]) return webMatch[1].toUpperCase();

  return null;
}
