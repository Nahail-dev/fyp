export type LetterDisplayStatus = 'pending' | 'in-transit' | 'delivered';

export function getLetterDisplayStatus(letter: {
  status?: string | null;
  sent_at?: string | null;
  estimated_delivery_at?: string | null;
  delivered_at?: string | null;
}) {
  if (letter.status === 'draft') return 'pending';
  if (letter.delivered_at) return 'delivered';
  if (!letter.sent_at || !letter.estimated_delivery_at) return 'pending';

  const estimatedTime = new Date(letter.estimated_delivery_at).getTime();
  if (!Number.isFinite(estimatedTime)) return 'pending';

  return Date.now() >= estimatedTime ? 'delivered' : 'in-transit';
}

export function getLetterProgress(letter: {
  status?: string | null;
  sent_at?: string | null;
  estimated_delivery_at?: string | null;
  delivered_at?: string | null;
}) {
  const displayStatus = getLetterDisplayStatus(letter);
  if (displayStatus === 'delivered') return 100;
  if (displayStatus === 'pending') return 0;

  const sentTime = new Date(letter.sent_at ?? '').getTime();
  const estimatedTime = new Date(letter.estimated_delivery_at ?? '').getTime();
  const total = estimatedTime - sentTime;

  if (!Number.isFinite(sentTime) || !Number.isFinite(estimatedTime) || total <= 0) {
    return 0;
  }

  const elapsed = Date.now() - sentTime;
  return Math.max(1, Math.min(99, Math.floor((elapsed / total) * 100)));
}

export function formatDeliveryEta(isoDate?: string | null) {
  if (!isoDate) return 'Not scheduled';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Not scheduled';
  return date.toLocaleString();
}
