export type DivisionId = 'dhaka' | 'chattogram' | 'rajshahi' | 'khulna' | 'barishal' | 'sylhet' | 'rangpur' | 'mymensingh';

export interface District {
  id: string;
  en: string;
  bn: string;
  division: DivisionId;
  /** Older spellings people still search for. */
  aliases?: string[];
}

export const DIVISIONS: Record<DivisionId, { en: string; bn: string }> = {
  dhaka: { en: 'Dhaka', bn: 'ঢাকা' },
  chattogram: { en: 'Chattogram', bn: 'চট্টগ্রাম' },
  rajshahi: { en: 'Rajshahi', bn: 'রাজশাহী' },
  khulna: { en: 'Khulna', bn: 'খুলনা' },
  barishal: { en: 'Barishal', bn: 'বরিশাল' },
  sylhet: { en: 'Sylhet', bn: 'সিলেট' },
  rangpur: { en: 'Rangpur', bn: 'রংপুর' },
  mymensingh: { en: 'Mymensingh', bn: 'ময়মনসিংহ' },
};

const d = (id: string, en: string, bn: string, division: DivisionId, ...aliases: string[]): District => ({
  id,
  en,
  bn,
  division,
  ...(aliases.length ? { aliases } : {}),
});

/** All 64 districts (জেলা) of Bangladesh. Ids match the map shapes. */
export const DISTRICTS: District[] = [
  // Dhaka division
  d('dhaka', 'Dhaka', 'ঢাকা', 'dhaka'),
  d('faridpur', 'Faridpur', 'ফরিদপুর', 'dhaka'),
  d('gazipur', 'Gazipur', 'গাজীপুর', 'dhaka'),
  d('gopalganj', 'Gopalganj', 'গোপালগঞ্জ', 'dhaka'),
  d('kishoreganj', 'Kishoreganj', 'কিশোরগঞ্জ', 'dhaka'),
  d('madaripur', 'Madaripur', 'মাদারীপুর', 'dhaka'),
  d('manikganj', 'Manikganj', 'মানিকগঞ্জ', 'dhaka'),
  d('munshiganj', 'Munshiganj', 'মুন্সীগঞ্জ', 'dhaka'),
  d('narayanganj', 'Narayanganj', 'নারায়ণগঞ্জ', 'dhaka'),
  d('narsingdi', 'Narsingdi', 'নরসিংদী', 'dhaka'),
  d('rajbari', 'Rajbari', 'রাজবাড়ী', 'dhaka'),
  d('shariatpur', 'Shariatpur', 'শরীয়তপুর', 'dhaka'),
  d('tangail', 'Tangail', 'টাঙ্গাইল', 'dhaka'),
  // Chattogram division
  d('bandarban', 'Bandarban', 'বান্দরবান', 'chattogram'),
  d('brahmanbaria', 'Brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 'chattogram'),
  d('chandpur', 'Chandpur', 'চাঁদপুর', 'chattogram'),
  d('chattogram', 'Chattogram', 'চট্টগ্রাম', 'chattogram', 'Chittagong'),
  d('cumilla', 'Cumilla', 'কুমিল্লা', 'chattogram', 'Comilla'),
  d('coxs-bazar', "Cox's Bazar", 'কক্সবাজার', 'chattogram', 'Coxs Bazar'),
  d('feni', 'Feni', 'ফেনী', 'chattogram'),
  d('khagrachhari', 'Khagrachhari', 'খাগড়াছড়ি', 'chattogram'),
  d('lakshmipur', 'Lakshmipur', 'লক্ষ্মীপুর', 'chattogram'),
  d('noakhali', 'Noakhali', 'নোয়াখালী', 'chattogram'),
  d('rangamati', 'Rangamati', 'রাঙ্গামাটি', 'chattogram'),
  // Rajshahi division
  d('bogura', 'Bogura', 'বগুড়া', 'rajshahi', 'Bogra'),
  d('chapai-nawabganj', 'Chapai Nawabganj', 'চাঁপাইনবাবগঞ্জ', 'rajshahi', 'Nawabganj'),
  d('joypurhat', 'Joypurhat', 'জয়পুরহাট', 'rajshahi'),
  d('naogaon', 'Naogaon', 'নওগাঁ', 'rajshahi'),
  d('natore', 'Natore', 'নাটোর', 'rajshahi'),
  d('pabna', 'Pabna', 'পাবনা', 'rajshahi'),
  d('rajshahi', 'Rajshahi', 'রাজশাহী', 'rajshahi'),
  d('sirajganj', 'Sirajganj', 'সিরাজগঞ্জ', 'rajshahi'),
  // Khulna division
  d('bagerhat', 'Bagerhat', 'বাগেরহাট', 'khulna'),
  d('chuadanga', 'Chuadanga', 'চুয়াডাঙ্গা', 'khulna'),
  d('jashore', 'Jashore', 'যশোর', 'khulna', 'Jessore'),
  d('jhenaidah', 'Jhenaidah', 'ঝিনাইদহ', 'khulna'),
  d('khulna', 'Khulna', 'খুলনা', 'khulna'),
  d('kushtia', 'Kushtia', 'কুষ্টিয়া', 'khulna'),
  d('magura', 'Magura', 'মাগুরা', 'khulna'),
  d('meherpur', 'Meherpur', 'মেহেরপুর', 'khulna'),
  d('narail', 'Narail', 'নড়াইল', 'khulna'),
  d('satkhira', 'Satkhira', 'সাতক্ষীরা', 'khulna'),
  // Barishal division
  d('barguna', 'Barguna', 'বরগুনা', 'barishal'),
  d('barishal', 'Barishal', 'বরিশাল', 'barishal', 'Barisal'),
  d('bhola', 'Bhola', 'ভোলা', 'barishal'),
  d('jhalokati', 'Jhalokati', 'ঝালকাঠি', 'barishal'),
  d('patuakhali', 'Patuakhali', 'পটুয়াখালী', 'barishal'),
  d('pirojpur', 'Pirojpur', 'পিরোজপুর', 'barishal'),
  // Sylhet division
  d('habiganj', 'Habiganj', 'হবিগঞ্জ', 'sylhet'),
  d('moulvibazar', 'Moulvibazar', 'মৌলভীবাজার', 'sylhet', 'Maulvibazar'),
  d('sunamganj', 'Sunamganj', 'সুনামগঞ্জ', 'sylhet'),
  d('sylhet', 'Sylhet', 'সিলেট', 'sylhet'),
  // Rangpur division
  d('dinajpur', 'Dinajpur', 'দিনাজপুর', 'rangpur'),
  d('gaibandha', 'Gaibandha', 'গাইবান্ধা', 'rangpur'),
  d('kurigram', 'Kurigram', 'কুড়িগ্রাম', 'rangpur'),
  d('lalmonirhat', 'Lalmonirhat', 'লালমনিরহাট', 'rangpur'),
  d('nilphamari', 'Nilphamari', 'নীলফামারী', 'rangpur'),
  d('panchagarh', 'Panchagarh', 'পঞ্চগড়', 'rangpur'),
  d('rangpur', 'Rangpur', 'রংপুর', 'rangpur'),
  d('thakurgaon', 'Thakurgaon', 'ঠাকুরগাঁও', 'rangpur'),
  // Mymensingh division
  d('jamalpur', 'Jamalpur', 'জামালপুর', 'mymensingh'),
  d('mymensingh', 'Mymensingh', 'ময়মনসিংহ', 'mymensingh'),
  d('netrokona', 'Netrokona', 'নেত্রকোণা', 'mymensingh', 'Netrakona'),
  d('sherpur', 'Sherpur', 'শেরপুর', 'mymensingh'),
];

export function findDistrict(id: string | null | undefined): District | undefined {
  return DISTRICTS.find((x) => x.id === id);
}

/** Matches Bangla or English names (and old spellings), ignoring case and punctuation. */
export function searchDistricts(query: string): District[] {
  const q = query.trim().toLowerCase().replace(/[^a-zঀ-৿]/g, '');
  if (!q) return DISTRICTS;
  const key = (s: string) => s.toLowerCase().replace(/[^a-zঀ-৿]/g, '');
  const names = (x: District) => [x.en, x.bn, ...(x.aliases ?? [])].map(key);
  // Best matches first: a name that starts with what was typed, and among those a division's capital
  // ("Raj" → Rajshahi before Rajbari).
  const rank = (x: District) => (names(x).some((n) => n.startsWith(q)) ? 0 : 2) + (x.en === DIVISIONS[x.division].en ? 0 : 1);
  return DISTRICTS.filter((x) => names(x).some((n) => n.includes(q))).sort((a, b) => rank(a) - rank(b));
}
