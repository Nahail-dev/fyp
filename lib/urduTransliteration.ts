const wordMap: Record<string, string> = {
  aap: 'آپ',
  ap: 'آپ',
  aur: 'اور',
  assalamualaikum: 'السلام علیکم',
  salam: 'سلام',
  main: 'میں',
  mein: 'میں',
  me: 'میں',
  hai: 'ہے',
  hain: 'ہیں',
  hun: 'ہوں',
  ho: 'ہو',
  kya: 'کیا',
  kyon: 'کیوں',
  kyun: 'کیوں',
  ka: 'کا',
  ki: 'کی',
  ke: 'کے',
  ko: 'کو',
  se: 'سے',
  ye: 'یہ',
  yeh: 'یہ',
  wo: 'وہ',
  woh: 'وہ',
  mera: 'میرا',
  meri: 'میری',
  mere: 'میرے',
  tum: 'تم',
  hum: 'ہم',
  ham: 'ہم',
  dost: 'دوست',
  pyar: 'پیار',
  khat: 'خط',
  shukriya: 'شکریہ',
};

const chunks: Array<[string, string]> = [
  ['kh', 'خ'],
  ['gh', 'غ'],
  ['ch', 'چ'],
  ['sh', 'ش'],
  ['ph', 'ف'],
  ['th', 'تھ'],
  ['dh', 'دھ'],
  ['bh', 'بھ'],
  ['aa', 'آ'],
  ['ee', 'ی'],
  ['oo', 'و'],
  ['ai', 'ے'],
  ['ay', 'ے'],
  ['au', 'او'],
  ['a', 'ا'],
  ['b', 'ب'],
  ['p', 'پ'],
  ['t', 'ت'],
  ['j', 'ج'],
  ['h', 'ہ'],
  ['d', 'د'],
  ['r', 'ر'],
  ['z', 'ز'],
  ['s', 'س'],
  ['f', 'ف'],
  ['q', 'ق'],
  ['k', 'ک'],
  ['g', 'گ'],
  ['l', 'ل'],
  ['m', 'م'],
  ['n', 'ن'],
  ['w', 'و'],
  ['v', 'و'],
  ['y', 'ی'],
  ['i', 'ی'],
  ['e', 'ے'],
  ['u', 'و'],
  ['o', 'و'],
];

function transliterateWord(word: string) {
  const lower = word.toLowerCase();
  if (wordMap[lower]) return wordMap[lower];

  let output = '';
  let index = 0;

  while (index < lower.length) {
    const match = chunks.find(([roman]) => lower.startsWith(roman, index));

    if (match) {
      output += match[1];
      index += match[0].length;
    } else {
      output += word[index];
      index += 1;
    }
  }

  return output;
}

export function transliterateRomanUrdu(value: string) {
  return value.replace(/[A-Za-z]+/g, (word) => transliterateWord(word));
}
