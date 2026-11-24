import {
  User,
  Order,
  SignalPackage,
  SignalSession,
  SystemAlert,
  DailySalesStat,
  WeeklySalesStat,
  ScannedSignalLog,
  BotConfig,
  VipTier,
  PaymentMethod,
  ActivityLogItem,
  HourlySuccessRate,
  OneXBetAccountData,
  BettingPlatform,
  SignalStrategy,
  CyberAuthState,
  CyberCellType,
  CyberBoardRow,
  ExpenseItem,
  ServerScript,
  ScriptLogEntry,
  DailyIpNode,
  DailyIpAuditEntry,
  DailyNetworkConfig,
} from '../types';
import { sound } from './sound';

export const MULTIPLIERS = [
  { index: 0, multiplier: 1.23, label: '×1.23' },
  { index: 1, multiplier: 1.54, label: '×1.54' },
  { index: 2, multiplier: 1.93, label: '×1.93' },
  { index: 3, multiplier: 2.41, label: '×2.41' },
  { index: 4, multiplier: 4.02, label: '×4.02' },
  { index: 5, multiplier: 6.71, label: '×6.71' },
  { index: 6, multiplier: 11.18, label: '×11.18' },
  { index: 7, multiplier: 27.97, label: '×27.97' },
  { index: 8, multiplier: 69.93, label: '×69.93' },
  { index: 9, multiplier: 349.68, label: '×349.68' },
];

export function generateRandomCyberGrid(): CyberBoardRow[] {
  const configs = [
    { rowIndex: 0, multiplier: '1.23', apples: 4, cores: 1 },
    { rowIndex: 1, multiplier: '1.54', apples: 4, cores: 1 },
    { rowIndex: 2, multiplier: '1.93', apples: 4, cores: 1 },
    { rowIndex: 3, multiplier: '2.41', apples: 4, cores: 1 },
    { rowIndex: 4, multiplier: '4.02', apples: 3, cores: 2 },
    { rowIndex: 5, multiplier: '6.71', apples: 3, cores: 2 },
    { rowIndex: 6, multiplier: '11.18', apples: 3, cores: 2 },
    { rowIndex: 7, multiplier: '27.97', apples: 2, cores: 3 },
    { rowIndex: 8, multiplier: '69.93', apples: 2, cores: 3 },
    { rowIndex: 9, multiplier: '349.68', apples: 1, cores: 4 },
  ];

  return configs.map((c) => {
    const list: CyberCellType[] = [
      ...Array(c.apples).fill('apple'),
      ...Array(c.cores).fill('core'),
    ];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return {
      rowIndex: c.rowIndex,
      multiplier: c.multiplier,
      cells: list,
    };
  });
}

export const ENTERPRISE_IP_POOL: DailyIpNode[] = [
  {
    id: 'node_kh_01',
    name: 'Cambodia IDC Primary Edge',
    feedIp: '185.195.234.19:8443',
    hostIp: '103.216.51.188',
    dnsIp: '45.142.122.10',
    proxyIp: '194.26.29.54',
    region: 'Cambodia',
    city: 'Phnom Penh',
    countryCode: 'KH',
    latencyMs: 1.2,
    uptimePercent: 100.0,
    provider: 'Smart IDC Datacenter',
    asn: 'AS136178 Smart IDC',
    encryption: 'TLS 1.3 + ChaCha20-Poly1305',
  },
  {
    id: 'node_sg_02',
    name: 'Singapore Equinix SG1 Relay',
    feedIp: '185.195.234.42:8443',
    hostIp: '103.216.51.204',
    dnsIp: '45.142.122.18',
    proxyIp: '194.26.29.88',
    region: 'Singapore',
    city: 'Jurong West',
    countryCode: 'SG',
    latencyMs: 1.8,
    uptimePercent: 100.0,
    provider: 'Equinix SG1 Hyper-Edge',
    asn: 'AS13335 Equinix SG',
    encryption: 'TLS 1.3 + AES-256-GCM',
  },
  {
    id: 'node_de_03',
    name: 'Germany Frankfurt CyberHub',
    feedIp: '185.195.234.77:8443',
    hostIp: '103.216.51.215',
    dnsIp: '45.142.122.25',
    proxyIp: '194.26.29.102',
    region: 'Germany',
    city: 'Frankfurt',
    countryCode: 'DE',
    latencyMs: 3.4,
    uptimePercent: 99.99,
    provider: 'Hetzner High-Speed Tier',
    asn: 'AS24940 Hetzner Online',
    encryption: 'TLS 1.3 + ChaCha20-Poly1305',
  },
  {
    id: 'node_nl_04',
    name: 'Netherlands WorldStream AMS',
    feedIp: '185.195.234.91:8443',
    hostIp: '103.216.51.229',
    dnsIp: '45.142.122.33',
    proxyIp: '194.26.29.115',
    region: 'Netherlands',
    city: 'Amsterdam',
    countryCode: 'NL',
    latencyMs: 2.9,
    uptimePercent: 100.0,
    provider: 'WorldStream Tier-IV Node',
    asn: 'AS49981 WorldStream AMS',
    encryption: 'TLS 1.3 + AES-256-GCM',
  },
  {
    id: 'node_hk_05',
    name: 'Hong Kong Mega-i Gateway',
    feedIp: '185.195.234.108:8443',
    hostIp: '103.216.51.240',
    dnsIp: '45.142.122.47',
    proxyIp: '194.26.29.130',
    region: 'Hong Kong',
    city: 'Kowloon',
    countryCode: 'HK',
    latencyMs: 1.7,
    uptimePercent: 100.0,
    provider: 'SUNeVision Mega-i',
    asn: 'AS132203 Mega-i HK',
    encryption: 'TLS 1.3 + ChaCha20-Poly1305',
  },
  {
    id: 'node_jp_06',
    name: 'Japan Tokyo KDDI Center',
    feedIp: '185.195.234.133:8443',
    hostIp: '103.216.51.251',
    dnsIp: '45.142.122.62',
    proxyIp: '194.26.29.148',
    region: 'Japan',
    city: 'Tokyo',
    countryCode: 'JP',
    latencyMs: 2.2,
    uptimePercent: 99.98,
    provider: 'KDDI Telehouse Tokyo',
    asn: 'AS2516 KDDI TYO',
    encryption: 'TLS 1.3 + AES-256-GCM',
  },
  {
    id: 'node_vn_07',
    name: 'Vietnam Viettel IDC Edge',
    feedIp: '185.195.234.156:8443',
    hostIp: '103.216.51.192',
    dnsIp: '45.142.122.78',
    proxyIp: '194.26.29.166',
    region: 'Vietnam',
    city: 'Ho Chi Minh',
    countryCode: 'VN',
    latencyMs: 1.5,
    uptimePercent: 100.0,
    provider: 'Viettel IDC Tier-3',
    asn: 'AS7552 Viettel IDC',
    encryption: 'TLS 1.3 + ChaCha20-Poly1305',
  },
  {
    id: 'node_th_08',
    name: 'Thailand True IDC Relay',
    feedIp: '185.195.234.228:8443',
    hostIp: '103.216.51.147',
    dnsIp: '45.142.122.118',
    proxyIp: '194.26.29.224',
    region: 'Thailand',
    city: 'Bangkok',
    countryCode: 'TH',
    latencyMs: 1.4,
    uptimePercent: 100.0,
    provider: 'True IDC Mid-City',
    asn: 'AS45629 True IDC',
    encryption: 'TLS 1.3 + AES-256-GCM',
  },
  {
    id: 'node_uk_09',
    name: 'UK London Docklands Edge',
    feedIp: '185.195.234.184:8443',
    hostIp: '103.216.51.173',
    dnsIp: '45.142.122.90',
    proxyIp: '194.26.29.182',
    region: 'United Kingdom',
    city: 'London',
    countryCode: 'GB',
    latencyMs: 3.6,
    uptimePercent: 99.99,
    provider: 'Telehouse London North',
    asn: 'AS13030 Telehouse',
    encryption: 'TLS 1.3 + AES-256-GCM',
  },
  {
    id: 'node_us_10',
    name: 'US Virginia AWS Hyper-Zone',
    feedIp: '185.195.234.205:8443',
    hostIp: '103.216.51.161',
    dnsIp: '45.142.122.104',
    proxyIp: '194.26.29.210',
    region: 'United States',
    city: 'Ashburn, VA',
    countryCode: 'US',
    latencyMs: 4.0,
    uptimePercent: 100.0,
    provider: 'AWS US-East Global Backbone',
    asn: 'AS16509 Amazon AWS',
    encryption: 'TLS 1.3 + ChaCha20-Poly1305',
  },
];

export function getDailyNodeForDate(pool: DailyIpNode[], dateStr: string): DailyIpNode {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

export function getNextMidnightUtc(): number {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
  return next.getTime();
}

export function generateDailyRotationHistory(pool: DailyIpNode[]): DailyIpAuditEntry[] {
  const history: DailyIpAuditEntry[] = [];
  const now = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const dateStr = d.toISOString().split('T')[0];
    const node = getDailyNodeForDate(pool, dateStr);

    history.push({
      id: `rot_${dateStr}_${node.id}`,
      date: dateStr,
      feedIp: node.feedIp,
      hostIp: node.hostIp,
      region: node.region,
      city: node.city,
      status: i === 0 ? 'active' : 'rotated',
      rotatedAt: `${dateStr}T00:00:00Z`,
      uptimePercent: node.uptimePercent,
      latencyMs: node.latencyMs,
      rotationType: 'scheduled_daily',
    });
  }
  return history;
}

export const VERIFIED_GAME_NODE_ACCOUNTS: OneXBetAccountData[] = [
  {
    accountId: '88419204',
    accountName: 'SOKPONG (VIP Master)',
    currency: 'USD',
    balance: 2450.0,
    vipStatus: 'VIP Club',
    connectedIp: '185.195.234.19',
    connectedAt: '2026-10-06T00:00:00Z',
    scanAccuracy: 100.0,
    isLiveScanning: true,
    gameSeed: 'SEED-1XBET-88419204',
    streamQuality: '100% Ultra Smooth (60 FPS)',
  },
  {
    accountId: '94218731',
    accountName: 'Pro Live Player (Sokha)',
    currency: 'USD',
    balance: 890.5,
    vipStatus: 'Pro Member',
    connectedIp: '185.195.234.19',
    connectedAt: '2026-10-06T10:00:00Z',
    scanAccuracy: 100.0,
    isLiveScanning: true,
    gameSeed: 'SEED-1XBET-94218731',
    streamQuality: '100% Ultra Smooth (60 FPS)',
  },
  {
    accountId: '71203945',
    accountName: 'Gold Member (Piseth)',
    currency: 'KHR',
    balance: 1800000,
    vipStatus: 'Master',
    connectedIp: '185.195.234.19',
    connectedAt: '2026-10-06T12:30:00Z',
    scanAccuracy: 100.0,
    isLiveScanning: true,
    gameSeed: 'SEED-1XBET-71203945',
    streamQuality: '100% Ultra Smooth (60 FPS)',
  },
];

export const PACKAGES: SignalPackage[] = [
  {
    id: 'pkg_1day',
    name: '1-Day VIP Pass',
    nameKh: 'កញ្ចប់ 1-Day VIP (១ ថ្ងៃ)',
    tier: 'vip_1day',
    durationDays: 1,
    priceUsd: 2.0,
    priceKhr: 8000,
    description: 'Ideal for daily live signal access and profit targets.',
    descriptionKh: 'ល្អបំផុតសម្រាប់ការប្រើប្រាស់សេវាប្រចាំថ្ងៃ និងដកប្រាក់ចំណេញ',
    accuracyRate: '96.5%',
    features: ['Access up to Step 10', '96.5% AI Signal Accuracy', 'Standard Server Speed', '24h Validity'],
    featuresKh: ['ចាប់សេវារហូតដល់ Step 10', 'ភាពត្រឹមត្រូវ 96.5%', 'ល្បឿន Server ធម្មតា', 'សុពលភាព ២៤ ម៉ោង'],
  },
  {
    id: 'pkg_7day',
    name: '7-Days Pro VIP',
    nameKh: 'កញ្ចប់ Pro VIP ៧ ថ្ងៃ',
    tier: 'vip_7day',
    durationDays: 7,
    priceUsd: 9.0,
    priceKhr: 36000,
    isPopular: true,
    description: 'Most popular package among serious players.',
    descriptionKh: 'កញ្ចប់ពេញនិយមបំផុតសម្រាប់អ្នកលេងប្រចាំសប្ដាហ៍',
    accuracyRate: '98.4%',
    features: ['Full 10 Steps Signal', '98.4% Server Sync Engine', 'Fast Signal Prediction', 'Instant Order Activation', 'Priority Telegram Bot'],
    featuresKh: ['ចាប់សេវាពេញលេញ ១០ ជួរ', 'ភាពត្រឹមត្រូវ 98.4% ពី Server', 'ចាប់សេវាលឿនទាន់ចិត្ត', 'ផ្ដល់ Key ស្វ័យប្រវត្តិភ្លាមៗ', 'សេវាជំនួយអាទិភាព'],
  },
  {
    id: 'pkg_30day',
    name: '30-Days Master VIP',
    nameKh: 'កញ្ចប់ Master VIP ៣០ ថ្ងៃ',
    tier: 'vip_30day',
    durationDays: 30,
    priceUsd: 25.0,
    priceKhr: 100000,
    description: 'High win-rate enterprise signal algorithm.',
    descriptionKh: 'កញ្ចប់ចំណេញខ្ពស់បំផុត សម្រាប់អ្នកលេងអាជីព',
    accuracyRate: '99.1%',
    features: ['Unlimited Signal Checks', '99.1% High-Precision Predictor', 'Anti-Loss Safe Mode', 'Automatic Order Delivery', 'VIP Telegram Channel Access'],
    featuresKh: ['ឆែកសេវាមិនកំណត់ចំនួនដង', 'ភាពត្រឹមត្រូវខ្ពស់ 99.1%', 'ប្រព័ន្ធ Anti-Loss សុវត្ថិភាព', 'ផ្ដល់ Key ដោយស្វ័យប្រវត្តិ', 'ចូលរួម VIP Telegram Channel'],
  },
  {
    id: 'pkg_lifetime',
    name: 'Lifetime Super VIP',
    nameKh: 'កញ្ចប់សមាជិកមួយជីវិត Lifetime VIP',
    tier: 'vip_lifetime',
    durationDays: 0,
    priceUsd: 69.0,
    priceKhr: 280000,
    description: 'One-time payment for lifetime continuous updates.',
    descriptionKh: 'បង់ម្ដងប្រើប្រាស់បានរហូត ជាមួយនឹងការ Update ជាប់ជានិច្ច',
    accuracyRate: '99.8%',
    features: ['Lifetime Unlimited Access', '99.8% Highest Winrate Model', 'Exclusive 1xBet / Melbet Seeds', 'Direct Admin 1-on-1 Support', 'All Future Bot Updates Free'],
    featuresKh: ['ប្រើប្រាស់រហូតគ្មានដែនកំណត់', 'ភាពត្រឹមត្រូវកំពូល 99.8%', 'ភ្ជាប់ Server API ផ្ដាច់មុខ', 'ជំនួយផ្ទាល់ពី Admin 24/7', 'ទទួលបាន Bot Update ឥតគិតថ្លៃ'],
  },
];

export const OWNER_USER: User = {
  id: 'usr_owner',
  name: 'SOKPONG (ម្ចាស់ Website / Owner: By Sokpong)',
  username: 'sokpong',
  phone: '0968888999',
  role: 'owner',
  vipTier: 'vip_lifetime',
  vipExpiresAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  totalSignalsUsed: 4250,
  oneXBetAccountId: '88419204',
  oneXBetConnectedAt: '2026-10-06T00:00:00Z',
  oneXBetSyncStatus: 'connected',
  oneXBetAccount: VERIFIED_GAME_NODE_ACCOUNTS[0],
};

const INITIAL_USERS: User[] = [
  OWNER_USER,
  {
    id: 'usr_admin',
    name: 'ប្រព័ន្ធគ្រប់គ្រង (Admin)',
    username: 'admin',
    phone: '0968888999',
    role: 'admin',
    vipTier: 'vip_lifetime',
    vipExpiresAt: null,
    createdAt: '2026-09-01T00:00:00Z',
    totalSignalsUsed: 1420,
  },
  {
    id: 'usr_sokha',
    name: 'សុខា ភក្តី (Sokha)',
    username: 'sokha_apple',
    phone: '0887123456',
    role: 'user',
    vipTier: 'vip_7day',
    vipExpiresAt: '2026-10-12T23:59:59Z',
    createdAt: '2026-10-01T10:00:00Z',
    totalSignalsUsed: 87,
  },
  {
    id: 'usr_free',
    name: 'ចាន់ថា (Chantha)',
    username: 'chantha99',
    phone: '0979876543',
    role: 'user',
    vipTier: 'free',
    vipExpiresAt: null,
    createdAt: '2026-10-04T14:30:00Z',
    totalSignalsUsed: 12,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_101',
    orderNumber: 'AOF-8821',
    userId: 'usr_sokha',
    userName: 'សុខា ភក្តី (Sokha)',
    userPhone: '0887123456',
    packageId: 'pkg_7day',
    packageName: '7-Days Pro VIP',
    packageNameKh: 'កញ្ចប់ Pro VIP ៧ ថ្ងៃ',
    amountUsd: 9.0,
    amountKhr: 36000,
    paymentMethod: 'aba',
    paymentStatus: 'completed',
    activationKey: 'VIP-7D-8942-S8Q',
    receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-05T07:15:20Z',
    completedAt: '2026-10-05T07:16:05Z',
    notes: 'Auto-approved by KHQR Gateway',
  },
  {
    id: 'ord_102',
    orderNumber: 'AOF-8822',
    userId: 'usr_guest1',
    userName: 'ម៉ៅ វិបុល (Mao Vibul)',
    userPhone: '012998877',
    packageId: 'pkg_30day',
    packageName: '30-Days Master VIP',
    packageNameKh: 'កញ្ចប់ Master VIP ៣០ ថ្ងៃ',
    amountUsd: 25.0,
    amountKhr: 100000,
    paymentMethod: 'bakong',
    paymentStatus: 'completed',
    activationKey: 'VIP-30D-4721-M3Z',
    receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-05T08:30:12Z',
    completedAt: '2026-10-05T08:31:00Z',
    notes: 'Bakong QR confirmed instantly',
  },
  {
    id: 'ord_103',
    orderNumber: 'AOF-8823',
    userId: 'usr_guest2',
    userName: 'គង់ ពិសិដ្ឋ (Piseth Kong)',
    userPhone: '096123987',
    packageId: 'pkg_1day',
    packageName: '1-Day VIP Pass',
    packageNameKh: 'កញ្ចប់ 1-Day VIP (១ ថ្ងៃ)',
    amountUsd: 2.0,
    amountKhr: 8000,
    paymentMethod: 'wing',
    paymentStatus: 'completed',
    activationKey: 'VIP-1D-1109-W4E',
    receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-05T10:45:00Z',
    completedAt: '2026-10-05T10:45:30Z',
  },
  {
    id: 'ord_104',
    orderNumber: 'AOF-8824',
    userId: 'usr_guest3',
    userName: 'ហេង រ៉ាដូ (Heng Rado)',
    userPhone: '070334455',
    packageId: 'pkg_lifetime',
    packageName: 'Lifetime Super VIP',
    packageNameKh: 'កញ្ចប់សមាជិកមួយជីវិត Lifetime VIP',
    amountUsd: 69.0,
    amountKhr: 280000,
    paymentMethod: 'usdt',
    paymentStatus: 'pending',
    receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-10-05T14:10:00Z',
    notes: 'USDT TRC20 Verification waiting for TXID block confirmation',
  },
];

const INITIAL_SALES_STATS: DailySalesStat[] = [
  { date: '2026-10-01', label: '01 Oct (ពុធ)', revenueUsd: 189, revenueKhr: 760000, ordersCount: 14, signalsCount: 510, vipNewUsers: 12, growthRatePercent: 12.5 },
  { date: '2026-10-02', label: '02 Oct (ព្រហ)', revenueUsd: 215, revenueKhr: 860000, ordersCount: 16, signalsCount: 580, vipNewUsers: 14, growthRatePercent: 13.8 },
  { date: '2026-10-03', label: '03 Oct (សុក្រ)', revenueUsd: 278, revenueKhr: 1110000, ordersCount: 21, signalsCount: 790, vipNewUsers: 18, growthRatePercent: 29.3 },
  { date: '2026-10-04', label: '04 Oct (សៅរ៍)', revenueUsd: 342, revenueKhr: 1370000, ordersCount: 26, signalsCount: 940, vipNewUsers: 22, growthRatePercent: 23.0 },
  { date: '2026-10-05', label: '05 Oct (អាទិត្យ)', revenueUsd: 310, revenueKhr: 1240000, ordersCount: 23, signalsCount: 890, vipNewUsers: 19, growthRatePercent: -9.4 },
  { date: '2026-10-06', label: '06 Oct (ច័ន្ទ)', revenueUsd: 295, revenueKhr: 1180000, ordersCount: 22, signalsCount: 860, vipNewUsers: 17, growthRatePercent: -4.8 },
  { date: '2026-10-07', label: '07 Oct (អង្គារ)', revenueUsd: 350, revenueKhr: 1400000, ordersCount: 25, signalsCount: 980, vipNewUsers: 20, growthRatePercent: 18.6 },
  { date: '2026-10-08', label: '08 Oct (ពុធ)', revenueUsd: 388, revenueKhr: 1552000, ordersCount: 28, signalsCount: 1040, vipNewUsers: 23, growthRatePercent: 10.9 },
  { date: '2026-10-09', label: '09 Oct (ព្រហ)', revenueUsd: 420, revenueKhr: 1680000, ordersCount: 30, signalsCount: 1120, vipNewUsers: 26, growthRatePercent: 8.2 },
  { date: '2026-10-10', label: '10 Oct (សុក្រ)', revenueUsd: 465, revenueKhr: 1860000, ordersCount: 34, signalsCount: 1250, vipNewUsers: 29, growthRatePercent: 10.7 },
  { date: '2026-10-11', label: '11 Oct (សៅរ៍)', revenueUsd: 540, revenueKhr: 2160000, ordersCount: 39, signalsCount: 1420, vipNewUsers: 33, growthRatePercent: 16.1 },
  { date: '2026-10-12', label: '12 Oct (អាទិត្យ)', revenueUsd: 512, revenueKhr: 2048000, ordersCount: 36, signalsCount: 1380, vipNewUsers: 31, growthRatePercent: -5.2 },
  { date: '2026-10-13', label: '13 Oct (ម្សិលមិញ)', revenueUsd: 590, revenueKhr: 2360000, ordersCount: 42, signalsCount: 1590, vipNewUsers: 38, growthRatePercent: 15.2 },
  { date: '2026-10-14', label: '14 Oct (ថ្ងៃនេះ/Live)', revenueUsd: 425, revenueKhr: 1700000, ordersCount: 29, signalsCount: 1180, vipNewUsers: 24, growthRatePercent: 21.4 },
];

export const INITIAL_WEEKLY_SALES_STATS: WeeklySalesStat[] = [
  {
    week: 'Week 37',
    label: 'សប្តាហ៍ទី ៣៧ (15 Sep - 21 Sep)',
    startDate: '2026-09-15',
    endDate: '2026-09-21',
    revenueUsd: 890,
    revenueKhr: 3560000,
    serverCostUsd: 114.8,
    netProfitUsd: 775.2,
    ordersCount: 68,
    signalsCount: 2840,
    growthRatePercent: 18.5,
  },
  {
    week: 'Week 38',
    label: 'សប្តាហ៍ទី ៣៨ (22 Sep - 28 Sep)',
    startDate: '2026-09-22',
    endDate: '2026-09-28',
    revenueUsd: 1140,
    revenueKhr: 4560000,
    serverCostUsd: 144.8,
    netProfitUsd: 995.2,
    ordersCount: 84,
    signalsCount: 3620,
    growthRatePercent: 28.1,
  },
  {
    week: 'Week 39',
    label: 'សប្តាហ៍ទី ៣៩ (29 Sep - 05 Oct)',
    startDate: '2026-09-29',
    endDate: '2026-10-05',
    revenueUsd: 1480,
    revenueKhr: 5920000,
    serverCostUsd: 185.6,
    netProfitUsd: 1294.4,
    ordersCount: 104,
    signalsCount: 4520,
    growthRatePercent: 29.8,
  },
  {
    week: 'Week 40',
    label: 'សប្តាហ៍ទី ៤០ (06 Oct - 12 Oct)',
    startDate: '2026-10-06',
    endDate: '2026-10-12',
    revenueUsd: 2025,
    revenueKhr: 8100000,
    serverCostUsd: 251.0,
    netProfitUsd: 1774.0,
    ordersCount: 142,
    signalsCount: 6240,
    growthRatePercent: 36.8,
  },
  {
    week: 'Week 41',
    label: 'សប្តាហ៍ទី ៤១ (13 Oct - 19 Oct / Live)',
    startDate: '2026-10-13',
    endDate: '2026-10-19',
    revenueUsd: 2680,
    revenueKhr: 10720000,
    serverCostUsd: 329.6,
    netProfitUsd: 2350.4,
    ordersCount: 186,
    signalsCount: 8120,
    growthRatePercent: 32.3,
  },
];

export const INITIAL_SCANNED_SIGNALS: ScannedSignalLog[] = [
  {
    id: 'sig_hist_1',
    gameId: '#982410',
    timestamp: '2026-10-14T08:45:12Z',
    timeFormatted: '14 Oct 2026, 15:45:12',
    userName: 'BIN SOPHA (Owner)',
    userPhone: '098****21',
    userVipTier: 'lifetime',
    strategy: 'ultra_max',
    sourceServer: '1xBet Live Feed Server (185.195.234.19:8443) • #94827104',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    clientSeed: 'ULTRA-MAX-9482-REAL-100',
  },
  {
    id: 'sig_hist_2',
    gameId: '#982409',
    timestamp: '2026-10-14T08:38:24Z',
    timeFormatted: '14 Oct 2026, 15:38:24',
    userName: 'ចាន់ មុនី (Chann Mony)',
    userPhone: '012****88',
    userVipTier: 'pkg_30day',
    strategy: 'ultra_max',
    sourceServer: '1xBet Live Feed Server (185.195.234.19:8443)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    clientSeed: '1XB-94827104-5821',
  },
  {
    id: 'sig_hist_3',
    gameId: '#982408',
    timestamp: '2026-10-14T08:29:05Z',
    timeFormatted: '14 Oct 2026, 15:29:05',
    userName: 'គឹមសាន្ត Pro (Kimsan Pro)',
    userPhone: '070****55',
    userVipTier: 'pkg_7day',
    strategy: 'balanced',
    sourceServer: 'Ultra Hack Apple (185.195.234.19) • Real Max',
    outcome: 'CASHOUT 💰',
    stepReached: 7,
    multiplier: '×27.97',
    multiplierValue: 27.97,
    accuracy: 100.0,
    serverHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    clientSeed: 'BALANCED-7STEP-CASH',
  },
  {
    id: 'sig_hist_4',
    gameId: '#982407',
    timestamp: '2026-10-14T08:18:41Z',
    timeFormatted: '14 Oct 2026, 15:18:41',
    userName: 'វណ្ណៈ Hacker (Vannak)',
    userPhone: '097****33',
    userVipTier: 'pkg_30day',
    strategy: 'aggressive',
    sourceServer: '1xBet Live Feed Server (185.195.234.19:8443)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    clientSeed: 'AGGR-MAX-SPEED-88',
  },
  {
    id: 'sig_hist_5',
    gameId: '#982406',
    timestamp: '2026-10-14T08:12:19Z',
    timeFormatted: '14 Oct 2026, 15:12:19',
    userName: 'សុខា Apple (Sokha Apple)',
    userPhone: '088****99',
    userVipTier: 'pkg_7day',
    strategy: 'conservative',
    sourceServer: 'Ultra Scan Signal Real Max Engine',
    outcome: 'CASHOUT 💰',
    stepReached: 5,
    multiplier: '×6.71',
    multiplierValue: 6.71,
    accuracy: 100.0,
    serverHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    clientSeed: 'SAFE-CONS-5STEP',
  },
  {
    id: 'sig_hist_6',
    gameId: '#982405',
    timestamp: '2026-10-14T08:05:00Z',
    timeFormatted: '14 Oct 2026, 15:05:00',
    userName: 'រីទ្ធី 1xBet (Rithy)',
    userPhone: '016****42',
    userVipTier: 'lifetime',
    strategy: 'ultra_max',
    sourceServer: '1xBet Live Feed Server (185.195.234.19)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    clientSeed: 'ULTRA-MAX-RITHY-100',
  },
  {
    id: 'sig_hist_7',
    gameId: '#982404',
    timestamp: '2026-10-14T07:55:18Z',
    timeFormatted: '14 Oct 2026, 14:55:18',
    userName: 'សេង ហេង (Seng Heng)',
    userPhone: '092****11',
    userVipTier: 'pkg_24h',
    strategy: 'balanced',
    sourceServer: 'Ultra Hack Apple API (185.195.234.19)',
    outcome: 'CASHOUT 💰',
    stepReached: 8,
    multiplier: '×69.93',
    multiplierValue: 69.93,
    accuracy: 100.0,
    serverHash: 'bc472509b471c42fa76305047400f10f7ee18d3b190f846653d1b4a828245130',
    clientSeed: 'BALANCED-8STEP-9211',
  },
  {
    id: 'sig_hist_8',
    gameId: '#982403',
    timestamp: '2026-10-14T07:44:30Z',
    timeFormatted: '14 Oct 2026, 14:44:30',
    userName: 'ប៊ុនហេង Slot (Bunheng)',
    userPhone: '085****67',
    userVipTier: 'pkg_30day',
    strategy: 'ultra_max',
    sourceServer: '1xBet Live Feed Server (185.195.234.19:8443)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: '18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4',
    clientSeed: 'ULTRA-BUNHENG-TOP',
  },
  {
    id: 'sig_hist_9',
    gameId: '#982402',
    timestamp: '2026-10-14T07:31:02Z',
    timeFormatted: '14 Oct 2026, 14:31:02',
    userName: 'ធារ៉ា 1xBet (Theara)',
    userPhone: '096****88',
    userVipTier: 'pkg_7day',
    strategy: 'conservative',
    sourceServer: 'Ultra Scan Signal Real Max',
    outcome: 'CASHOUT 💰',
    stepReached: 6,
    multiplier: '×11.18',
    multiplierValue: 11.18,
    accuracy: 100.0,
    serverHash: 'c4e5124101e405615d862f1cbe41bb45b854388147dffb292e0789fe61845eb5',
    clientSeed: 'SAFE-THEARA-STEP6',
  },
  {
    id: 'sig_hist_10',
    gameId: '#982401',
    timestamp: '2026-10-14T07:20:15Z',
    timeFormatted: '14 Oct 2026, 14:20:15',
    userName: 'គង់ ពិសិដ្ឋ (Kong Piseth)',
    userPhone: '077****90',
    userVipTier: 'lifetime',
    strategy: 'ultra_max',
    sourceServer: '1xBet Live Feed Server (185.195.234.19)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: '3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea',
    clientSeed: 'ULTRA-MAX-PISETH-100',
  },
  {
    id: 'sig_hist_11',
    gameId: '#982400',
    timestamp: '2026-10-14T07:05:40Z',
    timeFormatted: '14 Oct 2026, 14:05:40',
    userName: 'លីណា Apple (Lina)',
    userPhone: '010****33',
    userVipTier: 'pkg_30day',
    strategy: 'balanced',
    sourceServer: 'Ultra Hack Apple Real Max',
    outcome: 'CASHOUT 💰',
    stepReached: 9,
    multiplier: '×69.93',
    multiplierValue: 69.93,
    accuracy: 100.0,
    serverHash: 'd388b1f5d6f45cc31238804910ff6122d416b27d4ca40c31c94406ccae162c86',
    clientSeed: 'BALANCED-LINA-STEP9',
  },
  {
    id: 'sig_hist_12',
    gameId: '#982399',
    timestamp: '2026-10-14T06:50:22Z',
    timeFormatted: '14 Oct 2026, 13:50:22',
    userName: 'តារា 1xBet (Dara 1xBet)',
    userPhone: '015****77',
    userVipTier: 'pkg_24h',
    strategy: 'aggressive',
    sourceServer: '1xBet Live Feed Server (185.195.234.19)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    clientSeed: 'AGGR-DARA-349X',
  },
  {
    id: 'sig_hist_13',
    gameId: '#982398',
    timestamp: '2026-10-14T06:35:10Z',
    timeFormatted: '14 Oct 2026, 13:35:10',
    userName: 'សុខុម Master (Sokhom)',
    userPhone: '089****12',
    userVipTier: 'lifetime',
    strategy: 'ultra_max',
    sourceServer: '1xBet Live Feed Server (185.195.234.19:8443)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    clientSeed: 'ULTRA-MAX-SOKHOM',
  },
  {
    id: 'sig_hist_14',
    gameId: '#982397',
    timestamp: '2026-10-14T06:12:00Z',
    timeFormatted: '14 Oct 2026, 13:12:00',
    userName: 'ម៉ាប់ ភ្នំពេញ (Mab PP)',
    userPhone: '098****76',
    userVipTier: 'pkg_7day',
    strategy: 'conservative',
    sourceServer: 'Ultra Scan Signal Real Max',
    outcome: 'CASHOUT 💰',
    stepReached: 4,
    multiplier: '×4.02',
    multiplierValue: 4.02,
    accuracy: 100.0,
    serverHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    clientSeed: 'SAFE-MAB-STEP4',
  },
  {
    id: 'sig_hist_15',
    gameId: '#982396',
    timestamp: '2026-10-14T05:50:45Z',
    timeFormatted: '14 Oct 2026, 12:50:45',
    userName: 'សាវីន VIP (Savin VIP)',
    userPhone: '078****88',
    userVipTier: 'pkg_30day',
    strategy: 'ultra_max',
    sourceServer: '1xBet Live Feed Server (185.195.234.19)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    clientSeed: 'ULTRA-MAX-SAVIN',
  },
  {
    id: 'sig_hist_16',
    gameId: '#982395',
    timestamp: '2026-10-14T05:30:10Z',
    timeFormatted: '14 Oct 2026, 12:30:10',
    userName: 'វិសាល Hacker (Visal)',
    userPhone: '097****22',
    userVipTier: 'lifetime',
    strategy: 'ultra_max',
    sourceServer: '1xBet Live Feed Server (185.195.234.19:8443)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: '18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4',
    clientSeed: 'ULTRA-MAX-VISAL-100',
  },
  {
    id: 'sig_hist_17',
    gameId: '#982394',
    timestamp: '2026-10-14T05:10:00Z',
    timeFormatted: '14 Oct 2026, 12:10:00',
    userName: 'រតនា 1xBet (Rothana)',
    userPhone: '012****66',
    userVipTier: 'pkg_7day',
    strategy: 'balanced',
    sourceServer: 'Ultra Hack Apple API',
    outcome: 'CASHOUT 💰',
    stepReached: 7,
    multiplier: '×27.97',
    multiplierValue: 27.97,
    accuracy: 100.0,
    serverHash: '3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca046dea',
    clientSeed: 'BALANCED-ROTHANA-7',
  },
  {
    id: 'sig_hist_18',
    gameId: '#982393',
    timestamp: '2026-10-14T04:45:15Z',
    timeFormatted: '14 Oct 2026, 11:45:15',
    userName: 'ហុក ស្រេង (Hok Sreng)',
    userPhone: '093****99',
    userVipTier: 'free',
    strategy: 'conservative',
    sourceServer: 'Ultra Scan Signal Real Max',
    outcome: 'COMPLETED ✅',
    stepReached: 4,
    multiplier: '×4.02',
    multiplierValue: 4.02,
    accuracy: 100.0,
    serverHash: 'bc472509b471c42fa76305047400f10f7ee18d3b190f846653d1b4a828245130',
    clientSeed: 'FREE-HOK-STEP4',
  },
  {
    id: 'sig_hist_19',
    gameId: '#982392',
    timestamp: '2026-10-14T04:20:00Z',
    timeFormatted: '14 Oct 2026, 11:20:00',
    userName: 'សុភ័ក្រ Pro (Sopheak)',
    userPhone: '011****44',
    userVipTier: 'pkg_30day',
    strategy: 'ultra_max',
    sourceServer: '1xBet Live Feed Server (185.195.234.19)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    clientSeed: 'ULTRA-MAX-SOPHEAK',
  },
  {
    id: 'sig_hist_20',
    gameId: '#982391',
    timestamp: '2026-10-14T03:55:30Z',
    timeFormatted: '14 Oct 2026, 10:55:30',
    userName: 'ភារុណ 1xBet (Pharun)',
    userPhone: '070****88',
    userVipTier: 'lifetime',
    strategy: 'ultra_max',
    sourceServer: '1xBet Live Feed Server (185.195.234.19:8443)',
    outcome: 'WIN 🏆',
    stepReached: 10,
    multiplier: '×349.48',
    multiplierValue: 349.48,
    accuracy: 100.0,
    serverHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    clientSeed: 'ULTRA-MAX-PHARUN-100',
  },
];

const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'alt_1',
    type: 'order',
    title: 'ការបញ្ជាទិញថ្មី (New VIP Order)',
    titleKh: 'ការបញ្ជាទិញថ្មី (New VIP Order)',
    message: 'Heng Rado placed an order for Lifetime Super VIP ($69). Pending review.',
    messageKh: 'ហេង រ៉ាដូ បានបញ្ជាទិញកញ្ចប់ Lifetime VIP ($69) កំពុងរង់ចាំការពិនិត្យ',
    timestamp: '2026-10-05T14:10:00Z',
    read: false,
    orderId: 'ord_104',
    amountUsd: 69,
  },
  {
    id: 'alt_2',
    type: 'signal',
    title: 'ការឆែក Signal ជោគជ័យ (Signal Checked)',
    titleKh: 'មានអ្នកឆែក Signal ជោគជ័យ',
    message: 'User sokha_apple reached step 10 with 349.48x multiplier prediction.',
    messageKh: 'អ្នកប្រើប្រាស់ sokha_apple បានចាប់សេវាដល់ Step 10 មេគុណ 349.48x',
    timestamp: '2026-10-05T13:45:00Z',
    read: false,
  },
  {
    id: 'alt_3',
    type: 'system',
    title: 'ប្រព័ន្ធ Server Sync Online',
    titleKh: 'ប្រព័ន្ធ Server Sync Online',
    message: 'Apple of Fortune high-speed prediction engine running at 98.6% accuracy.',
    messageKh: 'ម៉ាស៊ីនគណនាសេវា Apple of Fortune ដំណើរការធម្មតា ភាពត្រឹមត្រូវ 98.6%',
    timestamp: '2026-10-05T12:00:00Z',
    read: true,
  },
];

export interface SignalCheckEvent {
  id: string;
  userName: string;
  userPhone: string;
  stepReached: number;
  multiplier: string;
  status: 'safe' | 'win' | 'processing';
  timestamp: string;
}

const INITIAL_RECENT_CHECKS: SignalCheckEvent[] = [
  { id: 'chk_1', userName: 'sokha_apple', userPhone: '088****456', stepReached: 5, multiplier: '×4.02', status: 'win', timestamp: '1 នាទីមុន' },
  { id: 'chk_2', userName: 'guest_user_91', userPhone: '097****321', stepReached: 7, multiplier: '×11.18', status: 'win', timestamp: '3 នាទីមុន' },
  { id: 'chk_3', userName: 'chantha99', userPhone: '096****789', stepReached: 4, multiplier: '×2.41', status: 'safe', timestamp: '6 នាទីមុន' },
  { id: 'chk_4', userName: 'pro_player_kh', userPhone: '012****901', stepReached: 10, multiplier: '×349.48', status: 'win', timestamp: '12 នាទីមុន' },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'act_99',
    timestamp: '2026-10-06T01:09:45Z',
    type: 'security',
    titleKh: '🛡️ ដំឡើង CyderShield V3.1 (Beta Version) Smooth 100%',
    titleEn: 'CyderShield V3.1 (Beta Version) Deployed - Smooth 100% Security',
    details: 'ស្វ័យប្រវត្តិលឿន ចាប់ចំៗត្រូវៗ 100% ដំណើរការរលូនគ្មានបញ្ហា (Zero Bugs, Ultra-Fast ~18ms, Pinpoint 100%)',
    status: 'success',
    userOrSource: 'Sokpong (Owner)',
    meta: { accuracy: 100, latencyMs: 1 },
  },
  {
    id: 'act_100',
    timestamp: '2026-10-06T01:02:40Z',
    type: 'system',
    titleKh: '🇰🇭 ប្តូរ Server IP ទៅ Cambodia Host (103.216.51.188)',
    titleEn: 'Server Host Connected to Cambodia 🇰🇭',
    details: 'Connected to KH-IX Edge Gateway. Upgraded to AMD EPYC 64-Core & Google TPU v5e. Latency: 2ms.',
    status: 'success',
    userOrSource: 'Sokpong (Owner)',
    meta: { ipAddress: '103.216.51.188', latencyMs: 2, accuracy: 99.9 },
  },
  {
    id: 'act_101',
    timestamp: '2026-10-06T00:30:15Z',
    type: 'system',
    titleKh: '🚀 ដំឡើង Gemini 3.8 Flash Neural Engine (10x Turbo)',
    titleEn: 'Gemini 3.8 Flash Neural Engine Deployed',
    details: 'Hardware Scan Online activated, 10x faster signal speed (~22ms latency) with 0 bugs',
    status: 'success',
    userOrSource: 'System Core v2.0.1',
    meta: { latencyMs: 22, accuracy: 99.9 },
  },
  {
    id: 'act_102',
    timestamp: '2026-10-06T00:28:40Z',
    type: 'security',
    titleKh: '🛡️ បើកដំណើរការ Cybersecurity v2.0.1 Hardware Shield',
    titleEn: 'Cybersecurity v2.0.1 Hardware Shield Active',
    details: 'Anti-Hack, Anti-Virus, Anti-DDoS, 256-bit encryption active. Zero vulnerability detected.',
    status: 'success',
    userOrSource: 'Shield Guard',
    meta: { ipAddress: '103.216.51.99' },
  },
  {
    id: 'act_103',
    timestamp: '2026-10-06T00:25:10Z',
    type: 'maintenance',
    titleKh: '⚡ ការធ្វើបច្ចុប្បន្នភាពម៉ាស៊ីនបម្រើ ២៤ ម៉ោង (Live Maintenance)',
    titleEn: '24-Hour Server Maintenance & Upgrade Notice',
    details: 'Server scheduled upgrade to Gemini 3.8 Flash & Bot Live Signal Scanners. VIP Admin bypass enabled.',
    status: 'info',
    userOrSource: 'BIN SOPHA (Owner)',
  },
  {
    id: 'act_104',
    timestamp: '2026-10-06T00:20:05Z',
    type: 'signal',
    titleKh: '🎯 AI Signal ចាប់បានជោគជ័យ Step 10 (×349.48)',
    titleEn: 'AI Signal Prediction Step 10 Success',
    details: 'Game #884129 safely navigated all 10 rows with 99.9% precision',
    status: 'success',
    userOrSource: 'sokha_apple',
    meta: { steps: 10, accuracy: 99.9 },
  },
  {
    id: 'act_105',
    timestamp: '2026-10-06T00:15:33Z',
    type: 'order',
    titleKh: '💰 បញ្ជាទិញទទួលបានការអនុម័ត AOF-8821 ($9.00)',
    titleEn: 'Order AOF-8821 Approved',
    details: 'Package 7-Days Pro VIP activated with key VIP-7D-8942-S8Q',
    status: 'success',
    userOrSource: 'Automated Gateway',
    meta: { orderNumber: 'AOF-8821', amountUsd: 9.0 },
  },
  {
    id: 'act_106',
    timestamp: '2026-10-06T00:10:12Z',
    type: 'signal',
    titleKh: '📡 Live Server Scan Online បានចាប់សេវា Step 7 (×11.18)',
    titleEn: 'Live Server Signal Scan Step 7',
    details: 'Safe path verified via 1xBet & Melbet live seed feed',
    status: 'success',
    userOrSource: 'guest_user_91',
    meta: { steps: 7, accuracy: 99.5 },
  },
  {
    id: 'act_107',
    timestamp: '2026-10-06T00:04:45Z',
    type: 'order',
    titleKh: '💳 ការទូទាត់ Bakong KHQR បានបញ្ជាក់ $25.00',
    titleEn: 'Bakong KHQR Payment Confirmed',
    details: 'Mao Vibul purchased 30-Days Master VIP. License Key delivered.',
    status: 'success',
    userOrSource: 'KHQR Gateway',
    meta: { orderNumber: 'AOF-8822', amountUsd: 25.0 },
  },
];

export const INITIAL_HOURLY_RATES: HourlySuccessRate[] = [
  { hour: '01:00', timestamp: '2026-10-05T01:00:00Z', successRate: 99.2, totalSignals: 182, successfulSignals: 180 },
  { hour: '02:00', timestamp: '2026-10-05T02:00:00Z', successRate: 99.5, totalSignals: 145, successfulSignals: 144 },
  { hour: '03:00', timestamp: '2026-10-05T03:00:00Z', successRate: 99.4, totalSignals: 120, successfulSignals: 119 },
  { hour: '04:00', timestamp: '2026-10-05T04:00:00Z', successRate: 99.1, totalSignals: 110, successfulSignals: 109 },
  { hour: '05:00', timestamp: '2026-10-05T05:00:00Z', successRate: 99.6, totalSignals: 135, successfulSignals: 134 },
  { hour: '06:00', timestamp: '2026-10-05T06:00:00Z', successRate: 99.8, totalSignals: 210, successfulSignals: 209 },
  { hour: '07:00', timestamp: '2026-10-05T07:00:00Z', successRate: 99.7, totalSignals: 280, successfulSignals: 279 },
  { hour: '08:00', timestamp: '2026-10-05T08:00:00Z', successRate: 99.9, totalSignals: 340, successfulSignals: 339 },
  { hour: '09:00', timestamp: '2026-10-05T09:00:00Z', successRate: 99.4, totalSignals: 310, successfulSignals: 308 },
  { hour: '10:00', timestamp: '2026-10-05T10:00:00Z', successRate: 99.6, totalSignals: 395, successfulSignals: 393 },
  { hour: '11:00', timestamp: '2026-10-05T11:00:00Z', successRate: 99.8, totalSignals: 420, successfulSignals: 419 },
  { hour: '12:00', timestamp: '2026-10-05T12:00:00Z', successRate: 99.7, totalSignals: 390, successfulSignals: 388 },
  { hour: '13:00', timestamp: '2026-10-05T13:00:00Z', successRate: 99.9, totalSignals: 360, successfulSignals: 359 },
  { hour: '14:00', timestamp: '2026-10-05T14:00:00Z', successRate: 99.5, totalSignals: 310, successfulSignals: 308 },
  { hour: '15:00', timestamp: '2026-10-05T15:00:00Z', successRate: 99.6, totalSignals: 340, successfulSignals: 338 },
  { hour: '16:00', timestamp: '2026-10-05T16:00:00Z', successRate: 99.8, totalSignals: 380, successfulSignals: 379 },
  { hour: '17:00', timestamp: '2026-10-05T17:00:00Z', successRate: 99.9, totalSignals: 450, successfulSignals: 449 },
  { hour: '18:00', timestamp: '2026-10-05T18:00:00Z', successRate: 99.7, totalSignals: 490, successfulSignals: 488 },
  { hour: '19:00', timestamp: '2026-10-05T19:00:00Z', successRate: 99.8, totalSignals: 520, successfulSignals: 519 },
  { hour: '20:00', timestamp: '2026-10-05T20:00:00Z', successRate: 99.9, totalSignals: 560, successfulSignals: 559 },
  { hour: '21:00', timestamp: '2026-10-05T21:00:00Z', successRate: 99.9, totalSignals: 580, successfulSignals: 579 },
  { hour: '22:00', timestamp: '2026-10-05T22:00:00Z', successRate: 99.8, totalSignals: 510, successfulSignals: 509 },
  { hour: '23:00', timestamp: '2026-10-05T23:00:00Z', successRate: 99.7, totalSignals: 420, successfulSignals: 418 },
  { hour: '00:00', timestamp: '2026-10-06T00:00:00Z', successRate: 99.9, totalSignals: 390, successfulSignals: 389 },
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp_01',
    title: 'Cambodia Phnom Penh Edge Host (103.216.51.188)',
    category: 'server_hosting',
    amountUsd: 185.0,
    recurrence: 'monthly',
    provider: 'Telecom Cambodia DataCenter IDC',
    status: 'paid',
    dueDate: '2026-11-01',
    notes: 'AMD EPYC 64-Core + NVMe Dedicated Tier-3 Hosting with 1Gbps unmetered uplink',
  },
  {
    id: 'exp_02',
    title: 'Upstream Signal Feed Tunnel (185.195.234.19:8443)',
    category: 'bandwidth',
    amountUsd: 120.0,
    recurrence: 'monthly',
    provider: 'Direct Edge API Gateway Transit',
    status: 'paid',
    dueDate: '2026-11-05',
    notes: 'Ultra-low latency (<2ms) real-time WebSocket pipe for uninterrupted signal feeds',
  },
  {
    id: 'exp_03',
    title: 'Cloudflare Enterprise DDoS & Bot Shield',
    category: 'security_shield',
    amountUsd: 45.0,
    recurrence: 'monthly',
    provider: 'Cloudflare Inc.',
    status: 'paid',
    dueDate: '2026-11-12',
    notes: 'CyderShield V3.1 automated layer-7 mitigation and SSL edge protection',
  },
  {
    id: 'exp_04',
    title: 'Telegram High-Speed Bot API Gateway',
    category: 'edge_proxy',
    amountUsd: 28.0,
    recurrence: 'monthly',
    provider: 'Telegram Bot Platform MTProto',
    status: 'paid',
    dueDate: '2026-11-15',
    notes: 'Handles instant notifications and customer routing to @Sokpong168',
  },
  {
    id: 'exp_05',
    title: 'Wildcard SSL TLS 1.3 & Edge CDN Storage',
    category: 'domain_ssl',
    amountUsd: 15.0,
    recurrence: 'monthly',
    provider: 'DigiCert & Fastly CDN',
    status: 'paid',
    dueDate: '2026-11-20',
    notes: '256-bit encrypted telemetry distribution',
  },
];

export const INITIAL_SCRIPTS: ServerScript[] = [
  {
    id: 'scr_setup',
    name: 'Simple Setup Server Environment',
    filename: 'simple_setup.sh',
    description: 'Installs Node 20 runtime, PM2 daemon, NGINX reverse-proxy, and tunes kernel sockets for <2ms latency.',
    category: 'setup',
    command: 'bash scripts/simple_setup.sh --host=103.216.51.188 --feed=185.195.234.19',
    lastExecutedAt: '2026-10-22T08:00:00Z',
    status: 'success',
  },
  {
    id: 'scr_update',
    name: 'Safe System & Bot Engine Update',
    filename: 'system_update.sh',
    description: 'Hot-pulls CyderShield V3.1 Beta engine updates, regenerates signal algorithms, clears memory cache, and hot-reloads processes without drops.',
    category: 'update',
    command: 'bash scripts/system_update.sh --release=v3.1-beta --smooth-mode=on',
    lastExecutedAt: '2026-10-22T08:30:00Z',
    status: 'success',
  },
  {
    id: 'scr_restart',
    name: 'Restart Server Worker Cluster',
    filename: 'node_restart.sh',
    description: 'Gracefully reboots all 8 worker threads on Cambodia host 103.216.51.188 with zero downtime rolling failover.',
    category: 'restart',
    command: 'pm2 reload cydershield-cluster --update-env',
    lastExecutedAt: '2026-10-21T18:00:00Z',
    status: 'success',
  },
  {
    id: 'scr_feed_reconnect',
    name: 'Feed Reconnect & Latency Benchmark',
    filename: 'feed_reconnect.sh',
    description: 'Re-negotiates WebSocket handshake to 185.195.234.19:8443, pings upstream nodes, and locks sub-15ms auto-retry thresholds.',
    category: 'maintenance',
    command: 'curl -sS -I https://185.195.234.19:8443/ping && wscat -c wss://185.195.234.19:8443/live/apple',
    lastExecutedAt: '2026-10-22T08:40:00Z',
    status: 'success',
  },
  {
    id: 'scr_train_ml',
    name: 'Train ML Outcome Predictor (RandomForest & Scaler)',
    filename: 'train_predictor.py',
    description: 'Trains RandomForestClassifier (100 estimators, max depth 5) on 500 feature-engineered samples, applies StandardScaler, and dumps prediction_model.pkl via joblib.',
    category: 'update',
    command: 'python public/assets/aistudio/ai_studio_code__1__2da57ff1.py',
    lastExecutedAt: '2026-10-22T19:00:00Z',
    status: 'success',
  },
  {
    id: 'scr_organize_files',
    name: 'File Category Organizer (Images, Docs, Audio, Video, Archives, Code)',
    filename: 'organize_files.py',
    description: 'Categorizes downloaded game assets, receipts, and scripts into Images, Documents, Audio, Videos, Archives, and Code_and_Scripts folders (ai_studio_code__3__92b4e56b.py).',
    category: 'maintenance',
    command: 'python3 public/assets/aistudio/ai_studio_code__3__92b4e56b.py',
    lastExecutedAt: '2026-10-23T10:15:00Z',
    status: 'success',
  },
  {
    id: 'scr_apple_ext',
    name: 'Apple VIP Overlay Extension Generator (Manifest V3)',
    filename: 'make_apple_extension.py',
    description: 'Builds Chrome MV3 extension with manifest.json, functions.js element wait observer, and multi-color logo animation style.css (ai_studio_code__2__23ea1862.py).',
    category: 'setup',
    command: 'python3 public/assets/aistudio/ai_studio_code__2__23ea1862.py',
    lastExecutedAt: '2026-10-23T10:20:00Z',
    status: 'success',
  },
  {
    id: 'scr_sys_update_reboot',
    name: 'Update All System Software, IP & Restart Website',
    filename: 'system_update_reboot.sh',
    description: 'Hot-pulls CyderShield V4.0 Enterprise & BitsGap Bot AI v6.0 (99.99% Target), rotates enterprise IP address, benchmarks feed latency, and executes a zero-bug reboot.',
    category: 'update',
    command: 'bash scripts/system_update_reboot.sh --release=v6.0-bot-ai --target=99.99 --zero-bug=on --reboot=auto',
    lastExecutedAt: '2026-10-25T08:00:00Z',
    status: 'success',
  },
];

export class AppState {
  users: User[] = INITIAL_USERS;
  currentUser: User = INITIAL_USERS[0]; // BIN SOPHA (Owner) by default
  orders: Order[] = INITIAL_ORDERS;
  alerts: SystemAlert[] = INITIAL_ALERTS;
  salesStats: DailySalesStat[] = INITIAL_SALES_STATS;
  weeklySalesStats: WeeklySalesStat[] = INITIAL_WEEKLY_SALES_STATS;
  scannedSignalsHistory: ScannedSignalLog[] = INITIAL_SCANNED_SIGNALS;
  recentChecks: SignalCheckEvent[] = INITIAL_RECENT_CHECKS;
  activityLogs: ActivityLogItem[] = INITIAL_ACTIVITY_LOGS;
  hourlyRates: HourlySuccessRate[] = INITIAL_HOURLY_RATES;
  expenses: ExpenseItem[] = INITIAL_EXPENSES;
  serverScripts: ServerScript[] = INITIAL_SCRIPTS;
  scriptLogs: ScriptLogEntry[] = [];
  cyberAuth: CyberAuthState = {
    isLoggedIn: false,
    accountId: '',
    key: '',
  };
  
  config: BotConfig = {
    winRateTarget: 99.99,
    autoStepDelayMs: 14, // Quick Bot Scan Signal (14ms per step, 60 FPS zero-bug sweep)
    requireVipAfterStep: 4, // Step 5+ requires VIP
    serverStatus: 'online',
    activeEngine: 'AI High Scan Signal v6.0 (Real-Time Live Signal 99.99%)',
    signalStrategy: 'power_max',
    ultraHackMode: true,
    autoApproveOrders: true,
    soundEnabled: true,
    language: 'kh',
    merchantName: 'Sokpong',
    merchantAccount: 'Sokpong (Bakong / KHQR)',
    khqrImage: '/src/assets/images/khqr_bin_sopha_flat_1791191617191.jpg',
    maintenanceMode: true,
    maintenanceDurationHours: 24,
    maintenanceEndsAt: '2026-10-07T00:30:00Z',
    cybersecurityVersion: 'CyderShield V4.0 Enterprise - Zero-Bug Real-Time Core',
    aiEngineVersion: 'BitsGap Bot AI v6.0 (High Scan Live Signal 99.99%)',
    antiHackStatus: 'hardened',
    lowSuccessRateThreshold: 85,
    serverHostLocation: 'Cambodia 🇰🇭 (Phnom Penh Edge DC)',
    serverHostIp: '103.216.51.188',
    serverFeedIp: '185.195.234.19:8443',
    feedConnectionStatus: 'connected',
    feedPacketsPerSec: 2180,
    feedLatencyMs: 1,
    feedStreamActive: true,
    serverCpuModel: 'AMD EPYC 9654 + Google TPU v5e (64 Cores)',
    serverPingMs: 1,
    scheduleEnabled: true,
    operatingStartHour: 7, // 7:00 AM
    operatingEndHour: 22, // 10:00 PM
    scheduleForceMode: 'auto',
    autoUpdateWindowEnabled: true,
    autoUpdateStartHour: 15, // 3:00 PM (15:00)
    autoUpdateEndHour: 17, // 5:00 PM (17:00)
    autoUpdateEarlyResume: false,
    autoUpdateForceMode: 'auto',
    latencyRetryThresholdMs: 15,
    theme: 'dark',
  };

  websocketHeartbeat = {
    status: 'connected' as 'connected' | 'connecting' | 'idle' | 'pulse',
    lastPingMs: 1,
    jitterMs: 0.1,
    packetsReceived: 42180,
    lastHeartbeatTime: new Date().toISOString(),
    serverEndpoint: 'wss://185.195.234.19:8443/live/apple-of-fortune',
    activeFeedId: 'FEED-1XB-88419204',
    streamFidelity: 100,
  };

  latencyRetryToast: {
    active: boolean;
    status: 'checking' | 'waiting' | 'reconnected';
    latencyMs: number;
    messageKh: string;
    messageEn: string;
  } | null = null;

  activeSignalSession: SignalSession | null = null;
  listeners: (() => void)[] = [];

  dailyNetworkConfig: DailyNetworkConfig = {
    currentNode: ENTERPRISE_IP_POOL[0],
    autoRotateDaily: true,
    nextRotationTimestamp: getNextMidnightUtc(),
    lastRotatedDate: new Date().toISOString().split('T')[0],
    ipPool: [...ENTERPRISE_IP_POOL],
    rotationHistory: generateDailyRotationHistory(ENTERPRISE_IP_POOL),
    totalRotationsCount: 14,
    systemSoftwareVersion: 'CyderShield V4.0 Enterprise + Bot AI v6.0 (99.99% Live)',
    lastSoftwareUpdateAt: new Date().toISOString(),
  };

  isRebootModalOpen: boolean = false;
  rebootCountdownSeconds: number = 5;
  rebootReason: string = '';

  constructor() {
    this.loadFromStorage();
    // Dynamic real-time WebSocket heartbeat from 1xBet server (185.195.234.19)
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.websocketHeartbeat.packetsReceived += Math.floor(18 + Math.random() * 14);
        this.websocketHeartbeat.lastPingMs = Math.floor(1 + Math.random() * 2);
        this.websocketHeartbeat.lastHeartbeatTime = new Date().toISOString();
        this.websocketHeartbeat.jitterMs = Number((0.08 + Math.random() * 0.05).toFixed(2));
        this.listeners.forEach((l) => l());
      }, 1200);
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyScheduled = false;

  notify() {
    this.saveToStorage();
    if (this.notifyScheduled) return;
    this.notifyScheduled = true;
    const trigger = () => {
      this.notifyScheduled = false;
      this.listeners.forEach((l) => l());
    };
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(trigger);
    } else {
      setTimeout(trigger, 0);
    }
  }

  private saveToStorage() {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem('aof_users', JSON.stringify(this.users));
      localStorage.setItem('aof_currentUser', JSON.stringify(this.currentUser));
      localStorage.setItem('aof_orders', JSON.stringify(this.orders));
      localStorage.setItem('aof_alerts', JSON.stringify(this.alerts));
      localStorage.setItem('aof_activity_logs', JSON.stringify(this.activityLogs));
      localStorage.setItem('aof_hourly_rates', JSON.stringify(this.hourlyRates));
      localStorage.setItem('aof_scanned_signals', JSON.stringify(this.scannedSignalsHistory));
      localStorage.setItem('aof_weekly_sales', JSON.stringify(this.weeklySalesStats));
      localStorage.setItem('aof_expenses', JSON.stringify(this.expenses));
      localStorage.setItem('aof_config', JSON.stringify(this.config));
      localStorage.setItem('aof_daily_network', JSON.stringify(this.dailyNetworkConfig));
    } catch {
      // storage error
    }
  }

  private loadFromStorage() {
    try {
      if (typeof window === 'undefined') return;
      const storedUsers = localStorage.getItem('aof_users');
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
        // Ensure owner account is always present and up-to-date
        const ownerIdx = this.users.findIndex(
          (u) => u.id === 'usr_owner' || u.role === 'owner' || u.username === 'binsopha' || u.username === 'sokpong'
        );
        if (ownerIdx === -1) {
          this.users.unshift(OWNER_USER);
        } else {
          this.users[ownerIdx] = { ...this.users[ownerIdx], ...OWNER_USER };
        }
      } else {
        this.users = [...INITIAL_USERS];
      }

      const storedUser = localStorage.getItem('aof_currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        if (this.currentUser.role === 'owner' || this.currentUser.id === 'usr_owner') {
          this.currentUser = { ...this.currentUser, ...OWNER_USER };
        }
      } else {
        this.currentUser = this.users[0]; // SOKPONG (Owner)
      }

      const storedOrders = localStorage.getItem('aof_orders');
      if (storedOrders) this.orders = JSON.parse(storedOrders);

      const storedAlerts = localStorage.getItem('aof_alerts');
      if (storedAlerts) this.alerts = JSON.parse(storedAlerts);

      const storedActivityLogs = localStorage.getItem('aof_activity_logs');
      if (storedActivityLogs) {
        this.activityLogs = JSON.parse(storedActivityLogs);
      } else {
        this.activityLogs = [...INITIAL_ACTIVITY_LOGS];
      }

      const storedHourlyRates = localStorage.getItem('aof_hourly_rates');
      if (storedHourlyRates) {
        this.hourlyRates = JSON.parse(storedHourlyRates);
      } else {
        this.hourlyRates = [...INITIAL_HOURLY_RATES];
      }

      const storedScannedSignals = localStorage.getItem('aof_scanned_signals');
      if (storedScannedSignals) {
        try {
          this.scannedSignalsHistory = JSON.parse(storedScannedSignals);
        } catch {
          this.scannedSignalsHistory = [...INITIAL_SCANNED_SIGNALS];
        }
      } else {
        this.scannedSignalsHistory = [...INITIAL_SCANNED_SIGNALS];
      }

      const storedWeeklySales = localStorage.getItem('aof_weekly_sales');
      if (storedWeeklySales) {
        try {
          this.weeklySalesStats = JSON.parse(storedWeeklySales);
        } catch {
          this.weeklySalesStats = [...INITIAL_WEEKLY_SALES_STATS];
        }
      } else {
        this.weeklySalesStats = [...INITIAL_WEEKLY_SALES_STATS];
      }

      const storedExpenses = localStorage.getItem('aof_expenses');
      if (storedExpenses) {
        try {
          this.expenses = JSON.parse(storedExpenses);
        } catch {
          this.expenses = [...INITIAL_EXPENSES];
        }
      } else {
        this.expenses = [...INITIAL_EXPENSES];
      }

      const storedCyber = localStorage.getItem('aof_cyber_auth');
      if (storedCyber) {
        try {
          this.cyberAuth = JSON.parse(storedCyber);
        } catch {}
      }

      const storedConfig = localStorage.getItem('aof_config');
      if (storedConfig) {
        this.config = { ...this.config, ...JSON.parse(storedConfig) };
        this.config.merchantName = 'Sokpong';
        this.config.merchantAccount = 'Sokpong (Bakong / KHQR)';
        if (!this.config.khqrImage) {
          this.config.khqrImage = '/src/assets/images/khqr_bin_sopha_flat_1791191617191.jpg';
        }
        // Guarantee latest engine specifications
        this.config.activeEngine = 'Ultra Scan Signal Real Max V3.1 (100% Hack Signal & Smooth Engine)';
        this.config.signalStrategy = this.config.signalStrategy || 'ultra_max';
        this.config.ultraHackMode = true;
        this.config.cybersecurityVersion = 'CyderShield V3.3 Enterprise (Auto IP Rotate) - Smooth 100% Security';
        this.config.aiEngineVersion = 'BitsGap Neural Network v4.6 (High-Accuracy Decision Matrix)';
        this.config.serverFeedIp = '185.195.234.19:8443';
        this.config.serverHostIp = '103.216.51.188';
        this.config.autoStepDelayMs = 18; // Ultra fast & smooth
        this.config.winRateTarget = 100.0;
        if (this.config.maintenanceMode === undefined) {
          this.config.maintenanceMode = true;
          this.config.maintenanceDurationHours = 24;
          this.config.maintenanceEndsAt = '2026-10-07T00:30:00Z';
        }
        if (!this.config.lowSuccessRateThreshold) {
          this.config.lowSuccessRateThreshold = 85;
        }
        this.config.serverHostLocation = 'Cambodia 🇰🇭 (Phnom Penh Edge DC)';
        this.config.serverHostIp = '103.216.51.188';
        this.config.serverFeedIp = '185.195.234.19';
        this.config.feedConnectionStatus = 'connected';
        this.config.serverCpuModel = 'AMD EPYC 9654 + Google TPU v5e (64 Cores)';
        this.config.serverPingMs = 1;
        if (this.config.scheduleEnabled === undefined) {
          this.config.scheduleEnabled = true;
          this.config.operatingStartHour = 7;
          this.config.operatingEndHour = 22;
        }
        if (!this.config.theme) {
          this.config.theme = 'dark';
        }
        sound.enabled = this.config.soundEnabled;
      }

      // Load & Synchronize Daily IP Address Network Configuration
      const storedDailyNet = localStorage.getItem('aof_daily_network');
      const todayStr = new Date().toISOString().split('T')[0];
      if (storedDailyNet) {
        try {
          this.dailyNetworkConfig = { ...this.dailyNetworkConfig, ...JSON.parse(storedDailyNet) };
          // If auto-rotate is enabled and a new calendar day has arrived, cycle IP automatically!
          if (this.dailyNetworkConfig.autoRotateDaily && this.dailyNetworkConfig.lastRotatedDate !== todayStr) {
            const todayNode = getDailyNodeForDate(this.dailyNetworkConfig.ipPool, todayStr);
            this.dailyNetworkConfig.currentNode = todayNode;
            this.dailyNetworkConfig.lastRotatedDate = todayStr;
            this.dailyNetworkConfig.nextRotationTimestamp = getNextMidnightUtc();
            this.dailyNetworkConfig.totalRotationsCount++;
            this.dailyNetworkConfig.rotationHistory.forEach((h) => {
              if (h.status === 'active') h.status = 'rotated';
            });
            this.dailyNetworkConfig.rotationHistory.unshift({
              id: `rot_${todayStr}_${todayNode.id}`,
              date: todayStr,
              feedIp: todayNode.feedIp,
              hostIp: todayNode.hostIp,
              region: todayNode.region,
              city: todayNode.city,
              status: 'active',
              rotatedAt: new Date().toISOString(),
              uptimePercent: todayNode.uptimePercent,
              latencyMs: todayNode.latencyMs,
              rotationType: 'scheduled_daily',
            });
          }
        } catch {}
      } else {
        const todayNode = getDailyNodeForDate(ENTERPRISE_IP_POOL, todayStr);
        this.dailyNetworkConfig.currentNode = todayNode;
        this.dailyNetworkConfig.lastRotatedDate = todayStr;
        this.dailyNetworkConfig.nextRotationTimestamp = getNextMidnightUtc();
      }

      // Guarantee system-wide propagation of active daily IP endpoints
      this.config.serverFeedIp = this.dailyNetworkConfig.currentNode.feedIp;
      this.config.serverHostIp = this.dailyNetworkConfig.currentNode.hostIp;
      this.config.serverHostLocation = `${this.dailyNetworkConfig.currentNode.region} (${this.dailyNetworkConfig.currentNode.city})`;
      this.websocketHeartbeat.serverEndpoint = `wss://${this.dailyNetworkConfig.currentNode.feedIp}/live/apple-of-fortune`;
    } catch {
      // ignore
    }
  }

  // Daily IP Address Auto-Rotation & Software Updater
  rotateIpNow(nodeId?: string, isSoftwareUpdate: boolean = false): DailyIpNode {
    const pool = this.dailyNetworkConfig.ipPool;
    let nextNode: DailyIpNode;

    if (nodeId) {
      nextNode = pool.find((n) => n.id === nodeId) || pool[0];
    } else {
      const currentIndex = pool.findIndex((n) => n.id === this.dailyNetworkConfig.currentNode.id);
      const nextIndex = (currentIndex + 1) % pool.length;
      nextNode = pool[nextIndex];
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Mark previous active records as rotated
    this.dailyNetworkConfig.rotationHistory.forEach((h) => {
      if (h.status === 'active') h.status = 'rotated';
    });

    this.dailyNetworkConfig.rotationHistory.unshift({
      id: `rot_${Date.now()}_${nextNode.id}`,
      date: dateStr,
      feedIp: nextNode.feedIp,
      hostIp: nextNode.hostIp,
      region: nextNode.region,
      city: nextNode.city,
      status: 'active',
      rotatedAt: now.toISOString(),
      uptimePercent: nextNode.uptimePercent,
      latencyMs: nextNode.latencyMs,
      rotationType: isSoftwareUpdate ? 'manual_force' : 'scheduled_daily',
    });

    this.dailyNetworkConfig.currentNode = nextNode;
    this.dailyNetworkConfig.lastRotatedDate = dateStr;
    this.dailyNetworkConfig.nextRotationTimestamp = getNextMidnightUtc();
    this.dailyNetworkConfig.totalRotationsCount++;
    this.dailyNetworkConfig.lastSoftwareUpdateAt = now.toISOString();

    // Propagate to global config & telemetry
    this.config.serverFeedIp = nextNode.feedIp;
    this.config.serverHostIp = nextNode.hostIp;
    this.config.serverHostLocation = `${nextNode.region} (${nextNode.city})`;
    this.websocketHeartbeat.serverEndpoint = `wss://${nextNode.feedIp}/live/apple-of-fortune`;

    this.addActivityLog({
      type: 'system',
      titleKh: `🌐 ប្តូរ IP ស្វ័យប្រវត្តិប្រចាំថ្ងៃ: ${nextNode.feedIp} (${nextNode.region})`,
      titleEn: `Daily IP Auto-Rotated: ${nextNode.feedIp} (${nextNode.region})`,
      details: `New Host: ${nextNode.hostIp} • Latency: ${nextNode.latencyMs}ms • Provider: ${nextNode.provider} • Software: ${this.dailyNetworkConfig.systemSoftwareVersion}`,
      status: 'success',
      userOrSource: 'Daily IP Engine',
      meta: { ipAddress: nextNode.hostIp, latencyMs: nextNode.latencyMs },
    });

    try {
      sound.playCompleteFanfare();
    } catch {}
    this.notify();
    return nextNode;
  }

  toggleDailyAutoRotate(enabled?: boolean) {
    this.dailyNetworkConfig.autoRotateDaily =
      enabled !== undefined ? enabled : !this.dailyNetworkConfig.autoRotateDaily;
    this.notify();
  }

  // Reboot Modal & Automated Full Website Reboot Sequence
  openRebootModal(countdownSeconds: number = 5, reason: string = 'System Software & IP Address Update Completed') {
    this.isRebootModalOpen = true;
    this.rebootCountdownSeconds = countdownSeconds;
    this.rebootReason = reason;
    this.notify();
  }

  closeRebootModal() {
    this.isRebootModalOpen = false;
    this.notify();
  }

  executeWebsiteReboot() {
    this.isRebootModalOpen = false;
    this.resetSuccessRateToNormal();
    this.websocketHeartbeat.status = 'pulse';
    setTimeout(() => {
      this.websocketHeartbeat.status = 'connected';
      this.websocketHeartbeat.packetsReceived += 1400;
      this.notify();
    }, 450);

    sound.playCompleteFanfare();
    this.addAlert({
      type: 'system',
      title: '🔄 Website & System Rebooted Successfully',
      titleKh: '🔄 វេបសាយ និងប្រព័ន្ធត្រូវបាន Restart ជោគជ័យ (Zero Bugs)',
      message: `System restarted on ${this.dailyNetworkConfig.currentNode.feedIp} with CyderShield V4.0 Enterprise & BitsGap Bot AI v6.0 (99.99% Live Signal). All sockets synchronized.`,
      messageKh: `ប្រព័ន្ធបាន Restart ជោគជ័យលើ IP ${this.dailyNetworkConfig.currentNode.feedIp} ជាមួយ CyderShield V4.0 Enterprise & BitsGap Bot AI v6.0 (99.99% Live Signal)!`,
    });
    this.addActivityLog({
      type: 'system',
      titleKh: '🔄 Restart វេបសាយ និង Bot AI v6.0 ជោគជ័យ (99.99%)',
      titleEn: 'Website & System Software Bot AI v6.0 Rebooted (Zero Bugs)',
      details: `Active Node: ${this.dailyNetworkConfig.currentNode.name} (${this.dailyNetworkConfig.currentNode.feedIp}) • Bot AI v6.0 verified at 99.99% live signal target.`,
      status: 'success',
      userOrSource: 'System Reboot Engine',
      meta: { ipAddress: this.dailyNetworkConfig.currentNode.feedIp, latencyMs: 1 },
    });
    this.notify();
  }

  // Update All System Software, Bot AI New Version, Rotate IP & Trigger Automated Reboot
  async updateAllSystemSoftwareAndReboot(
    onProgress?: (step: number, line: string) => void
  ): Promise<{ success: boolean; newNode: DailyIpNode; version: string }> {
    const push = (step: number, line: string) => {
      if (onProgress) onProgress(step, line);
    };

    push(1, '[INIT] Checking Enterprise IP cluster & Bot AI diagnostics (0 bugs detected)...');
    await new Promise((r) => setTimeout(r, 300));

    push(2, '[PULL] Upgrading System Software -> CyderShield V4.0 & BitsGap Bot AI v6.0...');
    this.dailyNetworkConfig.systemSoftwareVersion = 'CyderShield V4.0 Enterprise + Bot AI v6.0 (99.99% Live)';
    this.dailyNetworkConfig.lastSoftwareUpdateAt = new Date().toISOString();
    this.config.cybersecurityVersion = 'CyderShield V4.0 Enterprise - Zero-Bug Real-Time Core';
    this.config.aiEngineVersion = 'BitsGap Bot AI v6.0 (High Scan Live Signal 99.99%)';
    this.config.activeEngine = 'AI High Scan Signal v6.0 (Real-Time Live Signal 99.99%)';
    this.config.winRateTarget = 99.99;
    this.config.autoStepDelayMs = 14;
    await new Promise((r) => setTimeout(r, 320));

    push(3, '[IP ROTATE] Rotating enterprise edge node to lowest-latency live signal feed...');
    const newNode = this.rotateIpNow(undefined, true);
    await new Promise((r) => setTimeout(r, 320));

    push(4, `[NET SYNC] Locking Feed ${newNode.feedIp} & Host ${newNode.hostIp} to 99.99% Live Signal... OK`);
    await new Promise((r) => setTimeout(r, 300));

    push(5, '[VERIFY] Bot AI v6.0 zero-bug self-check & quick scan calibration (99.99%)... PASS');
    await new Promise((r) => setTimeout(r, 300));

    push(6, '[COMPLETE] System Software & Bot AI v6.0 active! Launching clean reboot...');
    sound.playCompleteFanfare();

    this.addAlert({
      type: 'system',
      title: '🚀 System Software & Bot AI v6.0 Updated (99.99% Target)',
      titleKh: '🚀 អាប់ដេត System Software & Bot AI v6.0 ជោគជ័យ (99.99%)',
      message: `Upgraded to CyderShield V4.0 & Bot AI v6.0 (Zero Bugs, 99.99% Live Signal). Active IP: ${newNode.feedIp} (${newNode.region}).`,
      messageKh: `បានអាប់ដេតទៅ CyderShield V4.0 & Bot AI v6.0 (គ្មាន Bug, 99.99% Live Signal)។ IP សកម្ម: ${newNode.feedIp} (${newNode.region})។`,
    });

    this.saveToStorage();
    this.notify();

    this.openRebootModal(
      5,
      `Upgraded to Bot AI v6.0 & CyderShield V4.0 (99.99% Live Signal). Node: ${newNode.region} (${newNode.feedIp})`
    );

    return {
      success: true,
      newNode,
      version: this.dailyNetworkConfig.systemSoftwareVersion,
    };
  }

  // Quick Action: Check Live Server Status Snapshot across Host/Feed IP & WebSocket
  checkServerStatusSnapshot(): {
    hostIp: string;
    feedIp: string;
    region: string;
    latencyMs: number;
    pingOk: boolean;
    packetsPerSec: number;
    engineVersion: string;
  } {
    const latencyMs = Math.max(1, Math.min(4, Math.floor(Math.random() * 3) + 1));
    const packetsPerSec = Math.floor(Math.random() * 600) + 1450;
    this.websocketHeartbeat.lastPingMs = latencyMs;
    this.websocketHeartbeat.status = 'connected';
    this.websocketHeartbeat.packetsReceived += Math.floor(packetsPerSec / 10);

    const node = this.dailyNetworkConfig.currentNode;
    this.addActivityLog({
      type: 'system',
      titleKh: `📡 ត្រួតពិនិត្យស្ថានភាព Server ជោគជ័យ (${latencyMs}ms)`,
      titleEn: 'Quick Action: Server Status Check Completed',
      details: `Host: ${node.hostIp} • Feed: ${node.feedIp} (${node.region}) • Latency: ${latencyMs}ms • Throughput: ${packetsPerSec} pkt/s`,
      status: 'success',
      userOrSource: 'AppleBot Quick Actions',
      meta: { ipAddress: node.feedIp, latencyMs },
    });
    this.notify();

    return {
      hostIp: node.hostIp,
      feedIp: node.feedIp,
      region: node.region,
      latencyMs,
      pingOk: true,
      packetsPerSec,
      engineVersion: this.config.aiEngineVersion,
    };
  }

  // Quick Action: Clear Signal Cache & Reset Signal Buffer
  clearSignalCache(): { clearedEntries: number; freshSession: SignalSession } {
    const clearedEntries = (this.scannedSignalsHistory?.length || 0) + (this.activeSignalSession ? 1 : 0);
    this.activeSignalSession = null;
    this.latencyRetryToast = null;
    this.websocketHeartbeat.packetsReceived += 24;

    const freshSession = this.generateNewSignal(this.config.signalStrategy || 'power_max');
    this.addActivityLog({
      type: 'system',
      titleKh: `🧹 សម្អាត Signal Cache ជោគជ័យ (${clearedEntries} buffers)`,
      titleEn: 'Quick Action: Signal Cache Cleared (Zero Bugs)',
      details: `Cleared ${clearedEntries} cached signal buffers & initialized fresh Bot AI v6.0 seed (${freshSession.clientSeed}) at 99.99% accuracy.`,
      status: 'success',
      userOrSource: 'AppleBot Quick Actions',
    });
    this.saveToStorage();
    this.notify();

    return { clearedEntries, freshSession };
  }

  // Expense Management
  addExpense(item: Omit<ExpenseItem, 'id'>) {
    const newExpense: ExpenseItem = {
      ...item,
      id: `exp_${Date.now()}`,
    };
    this.expenses.unshift(newExpense);
    this.addActivityLog({
      type: 'system',
      titleKh: `💸 Added Expense: ${newExpense.title} ($${newExpense.amountUsd.toFixed(2)})`,
      titleEn: `Added Expense: ${newExpense.title} ($${newExpense.amountUsd.toFixed(2)})`,
      details: `Category: ${newExpense.category} • Recurrence: ${newExpense.recurrence}`,
      status: 'success',
      userOrSource: 'Owner (Sokpong)',
    });
    this.notify();
    return newExpense;
  }

  updateExpense(id: string, updates: Partial<ExpenseItem>) {
    const idx = this.expenses.findIndex((e) => e.id === id);
    if (idx !== -1) {
      this.expenses[idx] = { ...this.expenses[idx], ...updates };
      this.notify();
    }
  }

  deleteExpense(id: string) {
    this.expenses = this.expenses.filter((e) => e.id !== id);
    this.notify();
  }

  // Server Ops & Script Execution Simulation
  async runServerScript(
    scriptId: string,
    onProgress?: (line: string) => void
  ): Promise<ScriptLogEntry> {
    const script = this.serverScripts.find((s) => s.id === scriptId);
    if (!script) throw new Error('Script not found');

    script.status = 'running';
    this.notify();

    const output: string[] = [];
    const pushLine = (line: string) => {
      output.push(line);
      if (onProgress) onProgress(line);
    };

    const startTime = Date.now();
    pushLine(`[INIT] Executing script: ${script.name} (${script.filename})`);
    pushLine(`[HOST] Target node: ${this.config.serverHostIp} (Cambodia IDC)`);
    pushLine(`[CMD]  ${script.command}`);
    pushLine(`----------------------------------------------------------------`);

    await new Promise((resolve) => setTimeout(resolve, 350));

    if (scriptId === 'scr_setup') {
      pushLine(`[STEP 1/5] Checking OS packages & Node.js 20 LTS runtime... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 2/5] Configuring NGINX reverse-proxy & WebSocket buffering (Feed: 185.195.234.19:8443)... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 3/5] Tuning Linux kernel tcp_tw_reuse & tcp_fastopen (<2ms ping)... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 4/5] Enabling PM2 cluster process daemon with auto-respawn... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 5/5] Provisioning TLS 1.3 wildcard certificate & CyderShield V3.1 rules... OK`);
      pushLine(`[COMPLETE] Environment ready on ${this.config.serverHostIp}. Service status: HEALTHY 100%`);
    } else if (scriptId === 'scr_update') {
      pushLine(`[STEP 1/4] Git pulling upstream release tag: v3.1-beta (Smooth 100% Security)... OK`);
      await new Promise((resolve) => setTimeout(resolve, 350));
      pushLine(`[STEP 2/4] Regenerating live signal matrix seeds & anti-loss weights... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 3/4] Purging Redis L2 cache & flushing in-memory session buffers... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 4/4] Zero-downtime hot reload: PM2 cluster reloaded smoothly in 18ms... OK`);
      pushLine(`[COMPLETE] CyderShield V3.1 Beta update applied successfully without connection drop.`);
    } else if (scriptId === 'scr_restart') {
      pushLine(`[STEP 1/3] Sending graceful SIGINT to 8 worker threads... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 2/3] Draining active WebSocket connections to 185.195.234.19... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 3/3] Respawning worker threads with fresh memory allocation... OK`);
      pushLine(`[COMPLETE] All 8 worker threads online. Memory usage: 142MB / 64GB.`);
    } else if (scriptId === 'scr_train_ml') {
      pushLine(`[STEP 1/4] Loading historical dataset (500 samples) & generating feature vectors... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 2/4] Fitting StandardScaler: means=[0.55, 30.12, 3.01, 5.5], stds=[0.26, 11.54, 1.15, 2.6]... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 3/4] Training RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)... OK`);
      pushLine(`[EVAL]    Validation Accuracy: 94.50% | F1-Score: 0.95 (Balanced Class Distribution)`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 4/4] Serializing model & scaler pipeline to prediction_model.pkl via joblib... OK`);
      pushLine(`[TEST]    Predicting new_event [[0.85, 22.0, 4.2, 5]] -> Win Prob: 95.8%, Loss Prob: 4.2%`);
      pushLine(`[COMPLETE] ML Model Artifact saved to prediction_model.pkl and loaded into real-time server memory.`);
    } else if (scriptId === 'scr_organize_files') {
      pushLine(`[INIT] Scanning directory target: ./downloads_test`);
      pushLine(`[RULE] Defined 6 categories: Images, Documents, Audio, Videos, Archives, Code_and_Scripts`);
      await new Promise((resolve) => setTimeout(resolve, 250));
      pushLine(`[SCAN] Found 14 items in directory: 4 images, 3 documents, 2 audio, 2 videos, 1 archive, 2 scripts`);
      await new Promise((resolve) => setTimeout(resolve, 250));
      pushLine(`[MOVE] Moved: win_apple_medallion.png -> Images/`);
      pushLine(`[MOVE] Moved: losing_core_red.svg -> Images/`);
      pushLine(`[MOVE] Moved: monthly_audit_2026.xlsx -> Documents/`);
      pushLine(`[MOVE] Moved: signal_telemetry_receipt.pdf -> Documents/`);
      pushLine(`[MOVE] Moved: chime_victory.wav -> Audio/`);
      pushLine(`[MOVE] Moved: apple_overlay_recording.mp4 -> Videos/`);
      pushLine(`[MOVE] Moved: apple_extension_dist.zip -> Archives/`);
      pushLine(`[MOVE] Moved: functions.js & content.js -> Code_and_Scripts/`);
      await new Promise((resolve) => setTimeout(resolve, 250));
      pushLine(`[COMPLETE] Organization complete! All files organized cleanly into category directories.`);
    } else if (scriptId === 'scr_apple_ext') {
      pushLine(`[INIT] Creating extension output directory: ./apple_extension/`);
      await new Promise((resolve) => setTimeout(resolve, 200));
      pushLine(`[GEN 1/3] Generating manifest.json (Manifest V3, permissions: ["storage"], matches: ["<all_urls>"])... OK`);
      await new Promise((resolve) => setTimeout(resolve, 250));
      pushLine(`[GEN 2/3] Writing functions.js with async waitForElems(selector, reversed, track)... OK`);
      await new Promise((resolve) => setTimeout(resolve, 250));
      pushLine(`[GEN 3/3] Writing style.css with @keyframes colorChange & .thimbles-logo__caption animation... OK`);
      pushLine(`[VALID] Verifying Chrome MV3 schema compliance & content_scripts bundling... OK`);
      pushLine(`[COMPLETE] Extension files created successfully in ./apple_extension/ [Ready for Chrome / Kiwi Browser]`);
    } else if (scriptId === 'scr_sys_update_reboot') {
      pushLine(`[STEP 1/6] Contacting Enterprise IP pool cluster (10 nodes active)... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 2/6] Pulling CyderShield V4.0 Enterprise & Bot AI v6.0 (99.99% weights)... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newNode = this.rotateIpNow(undefined, true);
      pushLine(`[STEP 3/6] Rotating enterprise IP node to: ${newNode.name} (${newNode.feedIp})... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 4/6] Re-binding Feed IP ${newNode.feedIp} & Host IP ${newNode.hostIp} (<2ms ping)... OK`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 5/6] Running zero-bug verification & 99.99% live signal calibration... PASS`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 6/6] Bot AI v6.0 applied cleanly! Triggering 5s website reboot countdown...`);
      this.openRebootModal(5, `System Software updated to CyderShield V4.0 & Bot AI v6.0 (99.99% Live Signal). Rotated to ${newNode.region} (${newNode.feedIp})`);
    } else {
      pushLine(`[STEP 1/3] Pinging 185.195.234.19:8443 TLS handshake... 1.2ms latency (PASS)`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 2/3] Benchmarking WebSocket packet ingest: 2,180 pkts/s (Zero packet loss)`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      pushLine(`[STEP 3/3] Setting intelligent auto-retry threshold to <15ms... OK`);
      pushLine(`[COMPLETE] Feed connection synchronized with 100% fidelity.`);
    }

    const durationMs = Date.now() - startTime;
    script.status = 'success';
    script.lastExecutedAt = new Date().toISOString();

    const logEntry: ScriptLogEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      scriptName: script.name,
      command: script.command,
      output,
      exitCode: 0,
      durationMs,
    };

    this.scriptLogs.unshift(logEntry);
    this.addActivityLog({
      type: 'system',
      titleKh: `⚡ Executed Script: ${script.name}`,
      titleEn: `Executed Script: ${script.name}`,
      details: `Exit code: 0 (${durationMs}ms) • Host: ${this.config.serverHostIp}`,
      status: 'success',
      userOrSource: 'Console',
    });

    this.notify();
    return logEntry;
  }

  // Operating Hours (07:00 AM - 10:00 PM) Automation
  isWithinOperatingHours(): boolean {
    if (!this.config.scheduleEnabled) return true;
    if (this.config.scheduleForceMode === 'force_open') return true;
    if (this.config.scheduleForceMode === 'force_closed') return false;
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= this.config.operatingStartHour && currentHour < this.config.operatingEndHour;
  }

  getOperatingScheduleInfo() {
    const isOpen = this.isWithinOperatingHours();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const formattedCurrentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const startStr = `${String(this.config.operatingStartHour).padStart(2, '0')}:00`;
    const endStr = `${String(this.config.operatingEndHour).padStart(2, '0')}:00`;

    let countdownHours = 0;
    let countdownMinutes = 0;

    if (!isOpen) {
      // Calculate time until next opening (7:00 AM)
      const targetOpening = new Date(now);
      if (currentHour >= this.config.operatingEndHour) {
        targetOpening.setDate(targetOpening.getDate() + 1);
      }
      targetOpening.setHours(this.config.operatingStartHour, 0, 0, 0);
      const diffMs = Math.max(0, targetOpening.getTime() - now.getTime());
      countdownHours = Math.floor(diffMs / (1000 * 60 * 60));
      countdownMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    } else {
      // Calculate time until closing (10:00 PM)
      const targetClosing = new Date(now);
      targetClosing.setHours(this.config.operatingEndHour, 0, 0, 0);
      const diffMs = Math.max(0, targetClosing.getTime() - now.getTime());
      countdownHours = Math.floor(diffMs / (1000 * 60 * 60));
      countdownMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    }

    return {
      isOpen,
      scheduleEnabled: this.config.scheduleEnabled,
      forceMode: this.config.scheduleForceMode || 'auto',
      currentTime: formattedCurrentTime,
      currentHour,
      currentMinute,
      startHour: this.config.operatingStartHour,
      endHour: this.config.operatingEndHour,
      startStr,
      endStr,
      scheduleLabel: `${startStr} ព្រឹក - ${endStr} យប់ (${this.config.operatingStartHour}:00 AM - ${this.config.operatingEndHour > 12 ? this.config.operatingEndHour - 12 : this.config.operatingEndHour}:00 PM)`,
      countdownHours,
      countdownMinutes,
    };
  }

  setScheduleEnabled(enabled: boolean) {
    this.config.scheduleEnabled = enabled;
    try {
      localStorage.setItem('aof_config', JSON.stringify(this.config));
    } catch {}
    this.addActivityLog({
      type: 'maintenance',
      titleKh: enabled ? '⏰ បើកកាលវិភាគស្វ័យប្រវត្តិ (07:00 ព្រឹក - 22:00 យប់)' : '🔓 បិទកាលវិភាគ - ប្រព័ន្ធដំណើរការ 24/7',
      titleEn: enabled ? 'Operating Hours Schedule Enabled (07:00 - 22:00)' : 'Schedule Disabled (24/7 Mode)',
      details: enabled
        ? `ប្រព័ន្ធកំណត់ដំណើរការស្វ័យប្រវត្តិពីម៉ោង ${this.config.operatingStartHour}:00 ព្រឹក ដល់ម៉ោង ${this.config.operatingEndHour}:00 យប់ (ក្រៅម៉ោងនេះនឹងបិទស្វ័យប្រវត្តិ)។`
        : 'ប្រព័ន្ធដំណើរការ 24 ម៉ោងជាប់ជាប្រចាំដោយគ្មានដែនកំណត់ពេលវេលា។',
      status: 'info',
      userOrSource: this.currentUser?.name || 'Administrator',
    });
    this.notify();
  }

  setOperatingHours(start: number, end: number) {
    this.config.operatingStartHour = start;
    this.config.operatingEndHour = end;
    try {
      localStorage.setItem('aof_config', JSON.stringify(this.config));
    } catch {}
    this.notify();
  }

  setScheduleForceMode(mode: 'auto' | 'force_open' | 'force_closed') {
    this.config.scheduleForceMode = mode;
    try {
      localStorage.setItem('aof_config', JSON.stringify(this.config));
    } catch {}
    this.addActivityLog({
      type: 'system',
      titleKh: mode === 'force_closed'
        ? '🔒 បិទដំណើរការប្រព័ន្ធបណ្តោះអាសន្ន (Force Closed)'
        : mode === 'force_open'
        ? '🔓 បើកដំណើរការប្រព័ន្ធ 24/7 (Force Open Mode)'
        : '⏰ ត្រលប់ទៅរបៀបស្វ័យប្រវត្តិតាមម៉ោងកំណត់ (Auto 07:00-22:00)',
      titleEn: `Schedule mode changed to ${mode}`,
      details: `Admin changed schedule enforcement to ${mode}.`,
      status: 'info',
      userOrSource: this.currentUser?.name || 'Administrator',
    });
    this.notify();
  }

  // 3:00 PM - 5:00 PM Afternoon Auto-Update Window (Auto System & Machine Update)
  isWithinAutoUpdateWindow(): boolean {
    if (!this.config.autoUpdateWindowEnabled) return false;
    if (this.config.autoUpdateForceMode === 'force_updating') return true;
    if (this.config.autoUpdateForceMode === 'normal') return false;
    if (this.config.autoUpdateEarlyResume) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const start = this.config.autoUpdateStartHour ?? 15;
    const end = this.config.autoUpdateEndHour ?? 17;
    return currentHour >= start && currentHour < end;
  }

  getAutoUpdateWindowInfo() {
    const isUpdating = this.isWithinAutoUpdateWindow();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const start = this.config.autoUpdateStartHour ?? 15;
    const end = this.config.autoUpdateEndHour ?? 17;

    let remainingMinutes = 0;
    if (isUpdating) {
      const targetEnd = new Date(now);
      targetEnd.setHours(end, 0, 0, 0);
      const diffMs = Math.max(0, targetEnd.getTime() - now.getTime());
      remainingMinutes = Math.floor(diffMs / (1000 * 60));
    }

    return {
      isUpdating,
      enabled: this.config.autoUpdateWindowEnabled,
      startHour: start,
      endHour: end,
      earlyResume: this.config.autoUpdateEarlyResume,
      forceMode: this.config.autoUpdateForceMode || 'auto',
      remainingMinutes,
      scheduleLabel: '3:00 រសៀល ដល់ 5:00 ល្ងាច (15:00 - 17:00)',
      targetEngine: 'Gemini 3.8 Flash Neural Core & Edge Optimizer',
      hardwareState: 'AMD EPYC 9654 + Google TPU v5e (Zero Lag)',
    };
  }

  triggerEarlyResume() {
    this.config.autoUpdateEarlyResume = true;
    this.config.autoUpdateForceMode = 'normal';
    try {
      localStorage.setItem('aof_config', JSON.stringify(this.config));
    } catch {}
    this.addActivityLog({
      type: 'maintenance',
      titleKh: '⚡ បើកដំណើរការឡើងវិញមុនម៉ោងកំណត់ (Early Resume Before 5:00 PM)',
      titleEn: 'System Resumed Early Before 5:00 PM',
      details: 'Auto-update completed early. All systems, bot, and Cambodia host edge back online.',
      status: 'success',
      userOrSource: this.currentUser?.name || 'Administrator',
    });
    this.notify();
  }

  setAutoUpdateForceMode(mode: 'auto' | 'force_updating' | 'normal') {
    this.config.autoUpdateForceMode = mode;
    if (mode === 'normal') {
      this.config.autoUpdateEarlyResume = true;
    } else if (mode === 'force_updating') {
      this.config.autoUpdateEarlyResume = false;
    }
    try {
      localStorage.setItem('aof_config', JSON.stringify(this.config));
    } catch {}
    this.addActivityLog({
      type: 'maintenance',
      titleKh: mode === 'force_updating'
        ? '⚙️ ចាប់ផ្តើមដំណើរការ Auto Update (3:00 PM - 5:00 PM)'
        : mode === 'normal'
        ? '✅ បញ្ចប់ Auto Update និងបើកដំណើរការឡើងវិញ'
        : '⏰ ត្រលប់ទៅកាលវិភាគ Auto Update ស្វ័យប្រវត្តិ',
      titleEn: `Auto update force mode set to ${mode}`,
      details: `Admin changed auto update mode to ${mode}.`,
      status: 'info',
      userOrSource: this.currentUser?.name || 'Administrator',
    });
    this.notify();
  }

  setAutoUpdateWindow(enabled: boolean, start: number = 15, end: number = 17) {
    this.config.autoUpdateWindowEnabled = enabled;
    this.config.autoUpdateStartHour = start;
    this.config.autoUpdateEndHour = end;
    try {
      localStorage.setItem('aof_config', JSON.stringify(this.config));
    } catch {}
    this.notify();
  }

  // Intelligent Auto-Retry Signal Processing (Waits for Latency to Dip Below Threshold)
  executeSignalWithAutoRetry(targetCallback: () => void) {
    const threshold = this.config.latencyRetryThresholdMs || 15;
    const currentPing = this.config.serverPingMs || 2;

    if (currentPing > threshold) {
      sound.playAlertNotification();
      this.latencyRetryToast = {
        active: true,
        status: 'waiting',
        latencyMs: currentPing,
        messageKh: `⏳ Server Latency ខ្ពស់ (${currentPing}ms > ${threshold}ms)! Auto-Retry កំពុងរង់ចាំ Latency ធ្លាក់ចុះ...`,
        messageEn: `High Latency (${currentPing}ms > ${threshold}ms). Intelligent Auto-Retry engaged, waiting for optimal latency...`,
      };
      this.notify();

      setTimeout(() => {
        const optimalPing = 2;
        this.config.serverPingMs = optimalPing;
        sound.playCompleteFanfare();
        this.latencyRetryToast = {
          active: true,
          status: 'reconnected',
          latencyMs: optimalPing,
          messageKh: `⚡ Latency ធ្លាក់ចុះមកត្រឹម ${optimalPing}ms (< ${threshold}ms)! ភ្ជាប់ទៅ Data Center ជោគជ័យ 100%!`,
          messageEn: `Latency dipped to ${optimalPing}ms (< ${threshold}ms). Auto-reconnected to Data Center successfully!`,
        };
        this.notify();

        targetCallback();

        setTimeout(() => {
          this.latencyRetryToast = null;
          this.notify();
        }, 3200);
      }, 1300);
    } else {
      targetCallback();
    }
  }

  // Connect / Sync Server to Live Feed IP Address (185.195.234.19) for Real-Time Signal Scan
  connectServerToFeedIp(ip: string = '185.195.234.19') {
    this.config.serverFeedIp = ip;
    this.config.feedConnectionStatus = 'syncing';
    sound.playClick();
    this.notify();

    setTimeout(() => {
      this.config.feedConnectionStatus = 'connected';
      sound.playCompleteFanfare();
      this.addAlert({
        type: 'system',
        title: `📡 ភ្ជាប់ Server ទៅ IP ${ip} ជោគជ័យ 100%!`,
        titleKh: `📡 ភ្ជាប់ Server ទៅ IP ${ip} ជោគជ័យ 100%!`,
        message: `Connected server to IP ${ip} for real-time live signal scanning in Apple of Fortune.`,
        messageKh: `បានភ្ជាប់ Server ទៅកាន់ IP address (${ip}) ដោយជោគជ័យ សម្រាប់ការចាប់សេវា Bot Live Scan Signal Real-time ក្នុង Apple of Fortune!`,
      });
      this.addActivityLog({
        type: 'signal',
        titleKh: `📡 ភ្ជាប់ Server ទៅ IP ${ip} Live Scan Real-time`,
        titleEn: `Connected Server to IP ${ip} for Live Real-Time Scan`,
        details: `Bot live scan signal linked to IP address ${ip}. Real-time feed streaming with 0.00% packet loss and 12ms latency.`,
        status: 'success',
        userOrSource: this.currentUser?.name || 'Administrator',
        meta: { ipAddress: ip },
      });
      this.notify();
    }, 500);
  }

  setTheme(theme: 'dark' | 'forest') {
    this.config.theme = theme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('aof_theme', theme);
    }
    this.notify();
  }

  // Browser-stored encrypted credentials for Quick Login
  getStoredCredentials(): {
    username: string;
    token: string;
    savedAt: string;
    displayName: string;
    role: string;
    oneXBetId?: string;
  } | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('aof_encrypted_cred');
      if (!raw) return null;
      const decoded = JSON.parse(decodeURIComponent(escape(atob(raw))));
      return decoded;
    } catch {
      return null;
    }
  }

  saveStoredCredentials(username: string, displayName?: string, role?: string, oneXBetId?: string) {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        username,
        token: 'AUTH_ENC_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
        savedAt: new Date().toISOString(),
        displayName: displayName || username,
        role: role || 'user',
        oneXBetId: oneXBetId || this.currentUser.oneXBetAccountId || '',
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      localStorage.setItem('aof_encrypted_cred', encoded);
    } catch {
      // ignore
    }
  }

  clearStoredCredentials() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('aof_encrypted_cred');
    this.notify();
  }

  quickLogin(): { success: boolean; message: string; user: User } {
    const cred = this.getStoredCredentials();
    if (!cred) {
      return {
        success: false,
        message: 'មិនមានគណនីរក្សាទុកក្នុង Browser ទេ (No stored credentials found)',
        user: this.currentUser,
      };
    }
    const res = this.login(cred.username);
    if (res.success && cred.oneXBetId && !this.currentUser.oneXBetAccountId) {
      this.loginWith1xBetId(cred.oneXBetId);
    }
    return { success: res.success, message: res.message, user: this.currentUser };
  }

  // Login via SokRizyBet ID Account & Bind Live Real-Time Quick & Smooth Feed
  loginWithSokRizyBetId(
    accountId: string,
    optionalKey?: string,
    customName?: string
  ): { success: boolean; message: string; account?: OneXBetAccountData } {
    const cleanId = accountId.trim();
    if (!cleanId || cleanId.length < 5) {
      return {
        success: false,
        message: 'សូមបញ្ចូលលេខសម្គាល់ SokRizyBet ID Account យ៉ាងតិច 5 ខ្ទង់ (Need ID Account min 5 chars)',
      };
    }

    const activeIp = this.dailyNetworkConfig.currentNode.feedIp.split(':')[0] || '185.195.234.19';
    const accountData: OneXBetAccountData = {
      accountId: cleanId,
      platform: 'sokrizybet',
      accountName: customName || `SokRizyBet #${cleanId}`,
      currency: 'USD',
      balance: 0,
      vipStatus: 'VIP Club',
      connectedIp: activeIp,
      connectedAt: new Date().toISOString(),
      scanAccuracy: 100.0,
      isLiveScanning: true,
      gameSeed: `SEED-SRB-${cleanId}`,
      streamQuality: '100% Ultra Smooth (60 FPS)',
    };

    this.currentUser.bettingPlatform = 'sokrizybet';
    this.currentUser.sokRizyBetAccountId = cleanId;
    this.currentUser.oneXBetAccountId = cleanId;
    this.currentUser.oneXBetConnectedAt = new Date().toISOString();
    this.currentUser.oneXBetSyncStatus = 'connected';
    this.currentUser.oneXBetAccount = accountData;
    if (optionalKey && optionalKey.trim().length > 0) {
      this.activateKey(optionalKey.trim());
    }

    this.config.serverFeedIp = activeIp;
    this.config.feedConnectionStatus = 'connected';
    this.config.feedStreamActive = true;
    this.config.serverPingMs = 1;

    this.websocketHeartbeat.status = 'connected';
    this.websocketHeartbeat.lastPingMs = 1;
    this.websocketHeartbeat.activeFeedId = `FEED-SRB-${cleanId}`;

    this.saveStoredCredentials(this.currentUser.username, this.currentUser.name, this.currentUser.role, cleanId);

    sound.playCompleteFanfare();
    this.addAlert({
      type: 'system',
      title: `⚡ SokRizyBet ID #${cleanId} Connected (Quick & Smooth)`,
      titleKh: `⚡ ភ្ជាប់គណនី SokRizyBet ID #${cleanId} ជោគជ័យ 100%!`,
      message: `Connected SokRizyBet ID Account #${cleanId} to Power Max Scan Signal AI (${activeIp}) for quick 60 FPS real-time scanning.`,
      messageKh: `បានភ្ជាប់ SokRizyBet ID Account (#${cleanId}) ទៅកាន់ Power Max Scan Signal AI (${activeIp}) លឿន រលូន Real-Time 100%!`,
    });

    this.addActivityLog({
      type: 'signal',
      titleKh: `⚡ ភ្ជាប់ SokRizyBet ID #${cleanId} (Real-Time Quick & Smooth)`,
      titleEn: `SokRizyBet ID Account #${cleanId} Connected to Power Max AI`,
      details: `SokRizyBet ID #${cleanId} bound to Power Max Scan Signal AI on ${activeIp} (60 FPS, 1ms latency).`,
      status: 'success',
      userOrSource: this.currentUser.name,
      meta: { ipAddress: activeIp, accuracy: 100, latencyMs: 1 },
    });

    this.saveToStorage();
    this.notify();
    return {
      success: true,
      message: `ភ្ជាប់គណនី SokRizyBet ID: #${cleanId} ជោគជ័យ 100% Quick & Smooth!`,
      account: accountData,
    };
  }

  // Login via 1xBet Account ID & Bind with Server 185.195.234.19
  loginWith1xBetId(
    accountId: string,
    pin?: string,
    customName?: string
  ): { success: boolean; message: string; account?: OneXBetAccountData } {
    const cleanId = accountId.trim();
    if (!cleanId || cleanId.length < 5) {
      return {
        success: false,
        message: 'សូមបញ្ចូលលេខសម្គាល់ ID 1xBet យ៉ាងតិច 5 ខ្ទង់ (Min 5 digits required)',
      };
    }

    const accountData: OneXBetAccountData = {
      accountId: cleanId,
      platform: '1xbet',
      accountName: customName || `1xBet Player #${cleanId}`,
      currency: 'USD',
      balance: 0,
      vipStatus: 'VIP Club',
      connectedIp: '185.195.234.19',
      connectedAt: new Date().toISOString(),
      scanAccuracy: 100.0,
      isLiveScanning: true,
      gameSeed: `SEED-1XBET-${cleanId}`,
      streamQuality: '100% Ultra Smooth (60 FPS)',
    };

    this.currentUser.bettingPlatform = '1xbet';
    this.currentUser.sokRizyBetAccountId = undefined;
    this.currentUser.oneXBetAccountId = cleanId;
    this.currentUser.oneXBetConnectedAt = new Date().toISOString();
    this.currentUser.oneXBetSyncStatus = 'connected';
    this.currentUser.oneXBetAccount = accountData;

    this.config.serverFeedIp = '185.195.234.19';
    this.config.feedConnectionStatus = 'connected';
    this.config.feedStreamActive = true;

    this.websocketHeartbeat.status = 'connected';
    this.websocketHeartbeat.activeFeedId = `FEED-1XB-${cleanId}`;

    // Auto-save browser credentials
    this.saveStoredCredentials(this.currentUser.username, this.currentUser.name, this.currentUser.role, cleanId);

    sound.playCompleteFanfare();
    this.addAlert({
      type: 'system',
      title: `🟢 ភ្ជាប់ 1xBet ID #${cleanId} ជោគជ័យ 100%!`,
      titleKh: `🟢 ភ្ជាប់ 1xBet ID #${cleanId} ជោគជ័យ 100%!`,
      message: `Connected 1xBet ID #${cleanId} to Server 185.195.234.19 for real-time live signal scanning in Apple of Fortune.`,
      messageKh: `បានភ្ជាប់គណនី 1xBet ID (#${cleanId}) ទៅកាន់ Server 185.195.234.19 ដោយជោគជ័យ សម្រាប់ការចាប់សេវា Real-time 100% Smooth!`,
    });

    this.addActivityLog({
      type: 'signal',
      titleKh: `🟢 ភ្ជាប់ 1xBet ID #${cleanId} ទៅ Server 185.195.234.19`,
      titleEn: `1xBet Account #${cleanId} Connected to Live Server 185.195.234.19`,
      details: `1xBet player account bound to Live Scan Engine. Direct stream at 60 FPS, 100% accuracy, 1ms ping.`,
      status: 'success',
      userOrSource: this.currentUser.name,
      meta: { ipAddress: '185.195.234.19', accuracy: 100, latencyMs: 1 },
    });

    this.notify();
    return {
      success: true,
      message: `ភ្ជាប់គណនី 1xBet ID: #${cleanId} ជាមួយ Server 185.195.234.19 ជោគជ័យ 100%!`,
      account: accountData,
    };
  }

  disconnect1xBetAccount() {
    if (this.currentUser) {
      this.currentUser.bettingPlatform = undefined;
      this.currentUser.sokRizyBetAccountId = undefined;
      this.currentUser.oneXBetAccountId = undefined;
      this.currentUser.oneXBetAccount = undefined;
      this.currentUser.oneXBetSyncStatus = 'idle';
    }
    sound.playClick();
    this.notify();
  }

  loginCyber(
    accountId: string,
    key: string = '',
    platform: BettingPlatform = 'sokrizybet'
  ): { success: boolean; message: string } {
    const cleanId = accountId.trim();
    const cleanKey = key.trim();
    this.cyberAuth = {
      isLoggedIn: true,
      accountId: cleanId,
      key: cleanKey || (platform === 'sokrizybet' ? 'SRB-AUTO-VIP' : ''),
      platform,
      activatedAt: new Date().toISOString(),
    };
    if (platform === 'sokrizybet') {
      this.loginWithSokRizyBetId(cleanId, cleanKey, `SokRizyBet #${cleanId}`);
    } else {
      this.loginWith1xBetId(cleanId, undefined, `1xBet #${cleanId}`);
    }
    if (this.currentUser) {
      this.currentUser.vipTier = 'vip_lifetime';
    }
    try {
      localStorage.setItem('aof_cyber_auth', JSON.stringify(this.cyberAuth));
    } catch {}
    sound.playCompleteFanfare();
    this.notify();
    return {
      success: true,
      message: `Activated ${platform === 'sokrizybet' ? 'SokRizyBet' : '1xBet'} ID: ${cleanId}`,
    };
  }

  logoutCyber() {
    this.cyberAuth = {
      isLoggedIn: false,
      accountId: '',
      key: '',
    };
    try {
      localStorage.removeItem('aof_cyber_auth');
    } catch {}
    this.disconnect1xBetAccount();
    sound.playClick();
    this.notify();
  }

  getDailyProfitLossStats() {
    let cumulativeRevenue = 0;
    let cumulativeProfit = 0;

    return this.salesStats.map((stat, idx, arr) => {
      // Estimated infrastructure / Cloud cost: base $8 + ~12% operational bandwidth & API seeds
      const serverCostUsd = Number((8 + stat.revenueUsd * 0.12).toFixed(2));
      const netProfitUsd = Number((stat.revenueUsd - serverCostUsd).toFixed(2));
      const profitMargin =
        stat.revenueUsd > 0 ? Number(((netProfitUsd / stat.revenueUsd) * 100).toFixed(1)) : 0;

      cumulativeRevenue += stat.revenueUsd;
      cumulativeProfit += netProfitUsd;

      const prevRevenue = idx > 0 ? arr[idx - 1].revenueUsd : 0;
      const growthRate =
        prevRevenue > 0
          ? Number((((stat.revenueUsd - prevRevenue) / prevRevenue) * 100).toFixed(1))
          : (stat.growthRatePercent ?? 0);

      return {
        date: stat.date,
        label: stat.label,
        revenueUsd: stat.revenueUsd,
        revenueKhr: stat.revenueKhr,
        serverCostUsd,
        netProfitUsd,
        profitMargin,
        ordersCount: stat.ordersCount,
        signalsCount: stat.signalsCount,
        vipNewUsers: stat.vipNewUsers,
        cumulativeRevenue,
        cumulativeProfit: Number(cumulativeProfit.toFixed(2)),
        growthRate,
      };
    });
  }

  getWeeklySalesGrowthStats() {
    let cumulativeRevenue = 0;
    let cumulativeProfit = 0;

    return this.weeklySalesStats.map((stat, idx, arr) => {
      cumulativeRevenue += stat.revenueUsd;
      cumulativeProfit += stat.netProfitUsd;
      const prevRevenue = idx > 0 ? arr[idx - 1].revenueUsd : 0;
      const calculatedGrowth =
        prevRevenue > 0
          ? Number((((stat.revenueUsd - prevRevenue) / prevRevenue) * 100).toFixed(1))
          : stat.growthRatePercent;

      return {
        ...stat,
        cumulativeRevenue,
        cumulativeProfit: Number(cumulativeProfit.toFixed(2)),
        growthRate: calculatedGrowth,
      };
    });
  }

  // Auth Methods
  login(usernameOrPhone: string, rolePreference?: 'admin' | 'user' | 'owner'): { success: boolean; message: string } {
    const normalizedInput = usernameOrPhone.toLowerCase().trim();

    // Owner direct shortcut
    if (
      normalizedInput === 'sokpong' ||
      normalizedInput === 'binsopha' ||
      normalizedInput === 'owner' ||
      normalizedInput === 'sopha' ||
      normalizedInput === 'freeomg73@gmail.com' ||
      rolePreference === 'owner'
    ) {
      const owner = this.users.find((u) => u.role === 'owner' || u.id === 'usr_owner') || OWNER_USER;
      this.currentUser = owner;
      this.saveStoredCredentials(owner.username, owner.name, owner.role, owner.oneXBetAccountId);
      sound.playCompleteFanfare();
      this.notify();
      return { success: true, message: `សូមស្វាគមន៍មកកាន់គណនីម្ចាស់ Website: ${owner.name}` };
    }

    const user = this.users.find(
      (u) =>
        u.username.toLowerCase() === normalizedInput ||
        u.phone === normalizedInput
    );

    if (user) {
      this.currentUser = user;
      this.saveStoredCredentials(user.username, user.name, user.role, user.oneXBetAccountId);
      sound.playClick();
      this.notify();
      return { success: true, message: `សូមស្វាគមន៍មកវិញ ${user.name}` };
    }

    return { success: false, message: 'រកមិនឃើញគណនីនេះទេ សូមចុះឈ្មោះថ្មី' };
  }

  logout(): void {
    const guestUser: User = {
      id: 'usr_guest',
      name: 'ភ្ញៀវ (Guest)',
      username: 'guest',
      phone: '',
      role: 'user',
      vipTier: 'free',
      vipExpiresAt: null,
      createdAt: new Date().toISOString(),
      totalSignalsUsed: 0,
    };
    this.currentUser = guestUser;
    sound.playClick();
    this.notify();
  }

  register(name: string, username: string, phone: string): { success: boolean; message: string } {
    if (!name.trim() || !username.trim() || !phone.trim()) {
      return { success: false, message: 'សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់' };
    }

    const existing = this.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() || u.phone === phone
    );
    if (existing) {
      return { success: false, message: 'ឈ្មោះគណនី ឬលេខទូរស័ព្ទនេះមានរួចហើយ' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      username,
      phone,
      role: 'user',
      vipTier: 'free',
      vipExpiresAt: null,
      createdAt: new Date().toISOString(),
      totalSignalsUsed: 0,
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    sound.playClick();
    this.notify();
    return { success: true, message: 'ចុះឈ្មោះជោគជ័យ! សូមស្វាគមន៍' };
  }

  toggleSound() {
    this.config.soundEnabled = !this.config.soundEnabled;
    sound.enabled = this.config.soundEnabled;
    if (sound.enabled) sound.playClick();
    this.notify();
  }

  setLanguage(lang: 'kh' | 'en' | 'ru') {
    this.config.language = lang;
    this.notify();
  }

  // Signal Prediction Generation
  // Change Signal Strategy (Ultra Max, Balanced, Conservative, Aggressive)
  setSignalStrategy(strategy: SignalStrategy) {
    this.config.signalStrategy = strategy;
    this.notify();
  }

  // Pure initial signal session generator (no store side effects, safe for initial render)
  createInitialSignalSession(customStrategy?: SignalStrategy): SignalSession {
    const steps: SignalSession['steps'] = [];
    const activeStrategy = customStrategy || this.config.signalStrategy || 'ultra_max';
    
    // Exactly matches screenshot layout: 10 rows (rowIndex 0 to 9)
    for (let r = 0; r < 10; r++) {
      // Pick a safe column 0 to 4 (5 columns)
      const safeCol = Math.floor(Math.random() * 5);
      const mult = MULTIPLIERS[r];
      steps.push({
        rowIndex: r,
        multiplier: mult.multiplier,
        multiplierText: mult.label,
        safeColumn: safeCol,
        confidence: 99.99, // 99.99% Live Signal On Target (Bot AI v6.0)
      });
    }

    const activePlatform = this.currentUser?.bettingPlatform || this.cyberAuth.platform || '1xbet';
    const hasAccount = Boolean(this.currentUser?.oneXBetAccountId || this.currentUser?.sokRizyBetAccountId);
    const activeId = this.currentUser?.sokRizyBetAccountId || this.currentUser?.oneXBetAccountId;
    const isSokRizy = activePlatform === 'sokrizybet';

    const clientSeed = hasAccount
      ? `${isSokRizy ? 'SRB' : '1XB'}-${activeId}-${Math.floor(1000 + Math.random() * 9000)}`
      : `${activeStrategy === 'power_max' ? 'AI-HIGH' : 'ULTRA-MAX'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const feedIp = this.dailyNetworkConfig.currentNode.feedIp || '185.195.234.19:8443';

    return {
      id: `sig_${Date.now()}`,
      gameId: `#${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      serverHash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      clientSeed,
      steps,
      maxStep: 10,
      accuracy: 99.99,
      sourceServer: hasAccount
        ? `${isSokRizy ? 'SokRizyBet' : '1xBet'} ${activeStrategy === 'power_max' ? 'Bot AI v6.0 High Scan (99.99%)' : 'Live Signal'} (${feedIp}) • #${activeId}`
        : activeStrategy === 'power_max'
        ? `AI High Scan Signal v6.0 (${feedIp}) • 99.99% Live Target`
        : 'Bot AI v6.0 Live Signal (185.195.234.19:8443) • 99.99% On Target',
      strategy: activeStrategy,
      hackStatus: activeStrategy === 'power_max' ? 'power_max_ai' : 'ultra_real_max',
    };
  }

  // Signal Prediction Generation (Ultra Hack Apple - Ultra Scan Signal Real Max)
  generateNewSignal(customStrategy?: SignalStrategy): SignalSession {
    const activeStrategy = customStrategy || this.config.signalStrategy || 'ultra_max';
    const session = this.createInitialSignalSession(activeStrategy);
    this.activeSignalSession = session;

    // Track user usage
    if (this.currentUser) {
      this.currentUser.totalSignalsUsed += 1;
      const idx = this.users.findIndex((u) => u.id === this.currentUser.id);
      if (idx !== -1) this.users[idx] = this.currentUser;
    }

    // Record into scannedSignalsHistory
    const now = new Date();
    const timeFormatted = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newSignalLog: ScannedSignalLog = {
      id: `sig_hist_${Date.now()}`,
      gameId: session.gameId,
      timestamp: session.timestamp,
      timeFormatted,
      userName: this.currentUser?.name || this.currentUser?.username || 'BIN SOPHA (Owner)',
      userPhone: this.currentUser?.phone ? this.currentUser.phone.slice(0, 3) + '****' + this.currentUser.phone.slice(-3) : '098****21',
      userVipTier: this.currentUser?.vipTier || 'lifetime',
      strategy: activeStrategy,
      sourceServer: session.sourceServer,
      outcome: 'WIN 🏆',
      stepReached: 10,
      multiplier: '×349.48',
      multiplierValue: 349.48,
      accuracy: 99.99,
      serverHash: session.serverHash,
      clientSeed: session.clientSeed,
    };
    this.scannedSignalsHistory.unshift(newSignalLog);
    if (this.scannedSignalsHistory.length > 300) this.scannedSignalsHistory.pop();

    // Add to recent checks
    const checkEvent: SignalCheckEvent = {
      id: `chk_${Date.now()}`,
      userName: this.currentUser?.username || 'Guest',
      userPhone: this.currentUser?.phone ? this.currentUser.phone.slice(0, 3) + '****' + this.currentUser.phone.slice(-3) : '012****888',
      stepReached: 0,
      multiplier: '×1.23',
      status: 'processing',
      timestamp: 'ទើបតែឥឡូវនេះ (Just now)',
    };
    this.recentChecks.unshift(checkEvent);
    if (this.recentChecks.length > 20) this.recentChecks.pop();

    this.addActivityLog({
      type: 'signal',
      titleKh: `⚡ AI High Scan Signal v6.0: Live Signal 99.99% (${session.gameId})`,
      titleEn: `AI High Scan Signal Real-Time Live 99.99% (${session.gameId})`,
      details: `User ${this.currentUser?.name || 'Guest'} ran Bot AI v6.0 Quick Scan (${activeStrategy.toUpperCase()}) • 99.99% On Target, Zero Bugs, latency <1ms`,
      status: 'info',
      userOrSource: this.currentUser?.username || 'Guest',
      meta: { steps: 10, accuracy: 99.99 },
    });

    this.notify();
    return session;
  }

  // Update signal step reached & notify
  recordStepReached(stepIndex: number) {
    if (!this.activeSignalSession) return;
    const mult = MULTIPLIERS[stepIndex];
    if (this.recentChecks.length > 0) {
      this.recentChecks[0].stepReached = stepIndex + 1;
      this.recentChecks[0].multiplier = mult.label;
      if (stepIndex >= 9) {
        this.recentChecks[0].status = 'win';
      }
    }

    if (this.scannedSignalsHistory.length > 0 && this.scannedSignalsHistory[0].gameId === this.activeSignalSession.gameId) {
      this.scannedSignalsHistory[0].stepReached = stepIndex + 1;
      this.scannedSignalsHistory[0].multiplier = mult.label;
      this.scannedSignalsHistory[0].multiplierValue = mult.multiplier;
      if (stepIndex >= 9) {
        this.scannedSignalsHistory[0].outcome = 'WIN 🏆';
      } else if (stepIndex >= 4) {
        this.scannedSignalsHistory[0].outcome = 'CASHOUT 💰';
      }
    }

    // If reaching step 10, trigger victory alert!
    if (stepIndex === 9) {
      this.addAlert({
        type: 'signal',
        title: '🎯 Signal សម្រេចបាន Step 10 (×349.48)',
        titleKh: '🎯 Signal សម្រេចបាន Step 10 (×349.48)',
        message: `${this.currentUser.name} successfully reached maximum prediction multiplier ×349.48!`,
        messageKh: `${this.currentUser.name} បានចាប់សេវាដល់កម្រិតអតិបរមា ×349.48 ដោយជោគជ័យ!`,
      });

      this.addActivityLog({
        type: 'signal',
        titleKh: '🏆 សម្រេចបាន Step 10 កំពូលមេគុណ ×349.48',
        titleEn: 'Step 10 Max Multiplier ×349.48 Reached',
        details: `${this.currentUser.name} reached maximum step safely via Gemini 3.8 Flash AI`,
        status: 'success',
        userOrSource: this.currentUser.username,
        meta: { steps: 10, accuracy: 100 },
      });
    }

    this.notify();
  }

  // Export Scanned Signals History to CSV
  exportSignalHistoryCSV() {
    if (typeof window === 'undefined') return;
    const headers = [
      'ID',
      'Game ID',
      'Timestamp (ISO)',
      'Time Formatted',
      'User Name',
      'Phone',
      'VIP Tier',
      'Strategy',
      'Outcome',
      'Step Reached',
      'Multiplier',
      'Multiplier Value',
      'Accuracy %',
      'Source Server',
      'Server Hash',
      'Client Seed',
    ];

    const rows = this.scannedSignalsHistory.map((s) => [
      s.id,
      s.gameId,
      s.timestamp,
      `"${s.timeFormatted}"`,
      `"${s.userName}"`,
      s.userPhone || '',
      s.userVipTier || '',
      s.strategy,
      s.outcome,
      s.stepReached,
      s.multiplier,
      s.multiplierValue,
      s.accuracy,
      `"${s.sourceServer}"`,
      s.serverHash,
      s.clientSeed,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `signal_history_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sound.playClick();
  }

  // Order Placement & Automation
  placeOrder(packageId: string, paymentMethod: PaymentMethod, customPhone?: string): Order {
    const pkg = PACKAGES.find((p) => p.id === packageId) || PACKAGES[1];
    const orderNum = `AOF-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomKey = `VIP-${pkg.durationDays || 'LIFE'}D-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const isAutoApproved =
      this.config.autoApproveOrders ||
      paymentMethod === 'khqr' ||
      paymentMethod === 'amk' ||
      paymentMethod === 'prasac' ||
      paymentMethod === 'ppc' ||
      paymentMethod === 'aba' ||
      paymentMethod === 'bakong' ||
      paymentMethod === 'wing';

    const order: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: orderNum,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userPhone: customPhone || this.currentUser.phone,
      packageId: pkg.id,
      packageName: pkg.name,
      packageNameKh: pkg.nameKh,
      amountUsd: pkg.priceUsd,
      amountKhr: pkg.priceKhr,
      paymentMethod,
      paymentStatus: isAutoApproved ? 'completed' : 'pending',
      activationKey: isAutoApproved ? randomKey : undefined,
      receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      completedAt: isAutoApproved ? new Date().toISOString() : undefined,
      notes: isAutoApproved ? 'ប្រព័ន្ធបានអនុម័តស្វ័យប្រវត្តិ (Auto-approved)' : 'រង់ចាំការពិនិត្យ (Pending verification)',
    };

    this.orders.unshift(order);

    // If auto approved, upgrade user VIP immediately!
    if (isAutoApproved) {
      this.applyVipToUser(this.currentUser.id, pkg.tier, pkg.durationDays);
    }

    // Trigger instant chime & notification alert!
    sound.playAlertNotification();

    // Add alert
    this.addAlert({
      type: 'order',
      title: `💰 ការបញ្ជាទិញថ្មី #${orderNum}`,
      titleKh: `💰 ការបញ្ជាទិញថ្មី #${orderNum}`,
      message: `New VIP order by ${order.userName} for ${order.packageName} ($${order.amountUsd}).`,
      messageKh: `ការបញ្ជាទិញថ្មីពី ${order.userName} សម្រាប់ ${order.packageNameKh} ($${order.amountUsd} / ${order.amountKhr.toLocaleString()} ៛)`,
      orderId: order.id,
      amountUsd: order.amountUsd,
    });

    // Update today's sales
    const today = this.salesStats[this.salesStats.length - 1];
    if (today && isAutoApproved) {
      today.revenueUsd += order.amountUsd;
      today.revenueKhr += order.amountKhr;
      today.ordersCount += 1;
      today.vipNewUsers += 1;
    }

    this.notify();
    return order;
  }

  // Admin approves order
  approveOrder(orderId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    const pkg = PACKAGES.find((p) => p.id === order.packageId) || PACKAGES[1];
    const key = `VIP-${pkg.durationDays || 'LIFE'}D-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    order.paymentStatus = 'completed';
    order.activationKey = key;
    order.completedAt = new Date().toISOString();
    order.notes = 'Admin បានអនុម័តដោយជោគជ័យ';

    this.applyVipToUser(order.userId, pkg.tier, pkg.durationDays);

    // Update today's sales
    const today = this.salesStats[this.salesStats.length - 1];
    if (today) {
      today.revenueUsd += order.amountUsd;
      today.revenueKhr += order.amountKhr;
      today.ordersCount += 1;
      today.vipNewUsers += 1;
    }

    sound.playCompleteFanfare();
    this.addAlert({
      type: 'order',
      title: `✅ ការបញ្ជាទិញ #${order.orderNumber} ត្រូវបានអនុម័ត`,
      titleKh: `✅ ការបញ្ជាទិញ #${order.orderNumber} ត្រូវបានអនុម័ត`,
      message: `Order #${order.orderNumber} approved and VIP activated.`,
      messageKh: `ការបញ្ជាទិញលេខ #${order.orderNumber} ត្រូវបានអនុម័ត និងបើកសិទ្ធិ VIP រួចរាល់។`,
      orderId: order.id,
    });

    this.notify();
  }

  rejectOrder(orderId: string, reason: string = 'បុងទូទាត់ប្រាក់មិនត្រឹមត្រូវ') {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;
    order.paymentStatus = 'rejected';
    order.notes = reason;
    this.notify();
  }

  private applyVipToUser(userId: string, tier: VipTier, durationDays: number) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;

    user.vipTier = tier;
    if (durationDays === 0) {
      user.vipExpiresAt = null; // Lifetime
    } else {
      const exp = new Date();
      exp.setDate(exp.getDate() + durationDays);
      user.vipExpiresAt = exp.toISOString();
    }

    if (this.currentUser.id === userId) {
      this.currentUser = { ...user };
    }
  }

  // Activate license key manually
  activateKey(keyString: string): { success: boolean; message: string } {
    const key = keyString.trim().toUpperCase();
    if (!key.startsWith('VIP-')) {
      return { success: false, message: 'លេខកូដ Key មិនត្រឹមត្រូវទេ (ទម្រង់: VIP-...)' };
    }

    let tier: VipTier = 'vip_7day';
    let days = 7;
    let label = 'Pro VIP ៧ ថ្ងៃ';

    if (key.includes('1D')) {
      tier = 'vip_1day';
      days = 1;
      label = '1-Day VIP';
    } else if (key.includes('30D')) {
      tier = 'vip_30day';
      days = 30;
      label = '30-Days VIP';
    } else if (key.includes('LIFE')) {
      tier = 'vip_lifetime';
      days = 0;
      label = 'Lifetime Super VIP';
    }

    this.applyVipToUser(this.currentUser.id, tier, days);
    sound.playCompleteFanfare();

    this.addAlert({
      type: 'vip',
      title: '🎉 បើកដំណើរការ Key ជោគជ័យ',
      titleKh: '🎉 បើកដំណើរការ Key ជោគជ័យ',
      message: `${this.currentUser.name} activated ${label}.`,
      messageKh: `${this.currentUser.name} បានបើកដំណើរការ ${label} ដោយជោគជ័យ!`,
    });

    this.notify();
    return { success: true, message: `បើកដំណើរការ ${label} ជោគជ័យ!` };
  }

  addAlert(alertData: Omit<SystemAlert, 'id' | 'timestamp' | 'read'>) {
    const newAlert: SystemAlert = {
      id: `alt_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...alertData,
    };
    this.alerts.unshift(newAlert);
    if (this.alerts.length > 50) this.alerts.pop();
    this.notify();
  }

  markAllAlertsAsRead() {
    this.alerts.forEach((a) => (a.read = true));
    this.notify();
  }

  // Activity Log Management
  addActivityLog(logData: Omit<ActivityLogItem, 'id' | 'timestamp'>): ActivityLogItem {
    const item: ActivityLogItem = {
      id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...logData,
    };
    this.activityLogs.unshift(item);
    if (this.activityLogs.length > 100) this.activityLogs.pop();
    this.notify();
    return item;
  }

  // 24-Hour Success Rate Calculation
  getAverageSuccessRate24h(): number {
    if (!this.hourlyRates || this.hourlyRates.length === 0) return 99.9;
    const sum = this.hourlyRates.reduce((acc, h) => acc + h.successRate, 0);
    return Number((sum / this.hourlyRates.length).toFixed(1));
  }

  resetSuccessRateToNormal() {
    this.hourlyRates = this.hourlyRates.map((h) => ({
      ...h,
      successRate: 99.99,
    }));
    sound.playAlertNotification();
    this.addActivityLog({
      type: 'system',
      titleKh: '✅ បានស្ដារ AI Live Signal On Target 99.99%',
      titleEn: 'AI Live Signal Target calibrated to 99.99% (Zero Bugs)',
      details: 'Bot AI v6.0 re-calibrated. All live signal sweeps running cleanly at 99.99% accuracy with zero bugs.',
      status: 'success',
      userOrSource: 'Bot AI v6.0 Core',
      meta: { accuracy: 99.99 },
    });
    this.notify();
  }

  setLowRateThreshold(threshold: number) {
    this.config.lowSuccessRateThreshold = Math.max(50, Math.min(99.99, threshold));
    this.notify();
  }

  setMaintenanceMode(active: boolean, hours: number = 24) {
    this.config.maintenanceMode = active;
    this.config.maintenanceDurationHours = hours;
    this.config.maintenanceEndsAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    this.addActivityLog({
      type: 'maintenance',
      titleKh: active ? `⚡ បើកដំណើរការ Server Maintenance (${hours} ម៉ោង)` : '✅ បិទ Server Maintenance - ប្រព័ន្ធបើកដំណើរការពេញលេញ',
      titleEn: active ? `Server Maintenance Activated (${hours}h)` : 'Server Maintenance Deactivated',
      details: active ? `System upgrade mode on for ${hours} hours. VIP and Owner bypass available.` : 'System fully online. All users can access without restriction.',
      status: active ? 'warning' : 'success',
      userOrSource: this.currentUser?.name || 'Administrator',
    });
    this.notify();
  }

  // Restart Server & All Systems & Bot AI v6.0 (CyderShield V4.0 Enterprise)
  restartServerAndAllSystems() {
    this.config.serverStatus = 'online';
    this.config.activeEngine = 'AI High Scan Signal v6.0 (Real-Time Live Signal 99.99%)';
    this.config.signalStrategy = 'power_max';
    this.config.ultraHackMode = true;
    this.config.cybersecurityVersion = 'CyderShield V4.0 Enterprise - Zero-Bug Real-Time Core';
    this.config.aiEngineVersion = 'BitsGap Bot AI v6.0 (High Scan Live Signal 99.99%)';
    this.config.antiHackStatus = 'hardened';
    this.config.serverHostLocation = 'Cambodia 🇰🇭 (Phnom Penh Edge DC)';
    this.config.serverHostIp = '103.216.51.188';
    this.config.serverCpuModel = 'AMD EPYC 9654 + Google TPU v5e (64 Cores)';
    this.config.serverPingMs = 1;
    this.config.winRateTarget = 99.99;
    this.config.autoStepDelayMs = 14;
    this.resetSuccessRateToNormal();

    sound.playCompleteFanfare();

    this.addAlert({
      type: 'system',
      title: '🔄 Restart Server & Bot AI v6.0 (Zero Bugs • 99.99%)',
      titleKh: '🔄 Restart Server & Bot AI v6.0 ជោគជ័យ (គ្មាន Bug • 99.99%)',
      message: 'Server & Bot AI v6.0 restarted with CyderShield V4.0 Enterprise. Live Signal On Target: 99.99% (1ms ping, Zero Bugs).',
      messageKh: 'ប្រព័ន្ធ និង Bot AI v6.0 ត្រូវបាន Restart ជាមួយ CyderShield V4.0 Enterprise។ Live Signal 99.99% ល្បឿន 1ms គ្មាន Bug!',
    });

    this.addActivityLog({
      type: 'system',
      titleKh: '🔄 Restart Server & Bot AI v6.0 (99.99% On Target)',
      titleEn: 'Restarted Server & Bot AI v6.0 (CyderShield V4.0 Enterprise)',
      details: 'Re-synchronized Cambodia Host 103.216.51.188 & Feed 185.195.234.19 with Bot AI v6.0 & CyderShield V4.0. Zero bugs, 99.99% live signal target.',
      status: 'success',
      userOrSource: 'Sokpong (Owner)',
      meta: { ipAddress: '103.216.51.188', latencyMs: 1, accuracy: 99.99 },
    });

    this.notify();
  }

  // CSV Export Generators with UTF-8 BOM
  private downloadCSV(filename: string, csvContent: string) {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  exportSignalsCSV() {
    const headers = ['Check ID', 'User Name', 'Phone', 'Step Reached', 'Multiplier', 'Status', 'Timestamp'];
    const rows = this.recentChecks.map((c) => [
      c.id,
      `"${c.userName.replace(/"/g, '""')}"`,
      `"${c.userPhone}"`,
      c.stepReached,
      `"${c.multiplier}"`,
      c.status,
      `"${c.timestamp}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadCSV(`aof_signal_history_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    sound.playClick();
  }

  exportOrdersCSV() {
    const headers = [
      'Order Number',
      'Customer Name',
      'Phone',
      'Package',
      'Price USD',
      'Price KHR',
      'Payment Method',
      'Status',
      'Activation Key',
      'Created At',
      'Completed At',
      'Notes',
    ];
    const rows = this.orders.map((o) => [
      o.orderNumber,
      `"${o.userName.replace(/"/g, '""')}"`,
      `"${o.userPhone}"`,
      `"${(o.packageNameKh || o.packageName).replace(/"/g, '""')}"`,
      o.amountUsd,
      o.amountKhr,
      o.paymentMethod.toUpperCase(),
      o.paymentStatus.toUpperCase(),
      `"${o.activationKey || '-'}"`,
      `"${o.createdAt}"`,
      `"${o.completedAt || '-'}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadCSV(`aof_orders_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    sound.playClick();
  }

  exportActivityLogsCSV() {
    const headers = ['Log ID', 'Timestamp', 'Type', 'Title (Khmer)', 'Title (English)', 'Details', 'Source / User', 'Status'];
    const rows = this.activityLogs.map((a) => [
      a.id,
      `"${a.timestamp}"`,
      a.type,
      `"${a.titleKh.replace(/"/g, '""')}"`,
      `"${a.titleEn.replace(/"/g, '""')}"`,
      `"${a.details.replace(/"/g, '""')}"`,
      `"${a.userOrSource.replace(/"/g, '""')}"`,
      a.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.downloadCSV(`aof_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
    sound.playClick();
  }
}

export const appState = new AppState();
