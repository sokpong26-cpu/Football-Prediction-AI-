export type Role = 'admin' | 'user' | 'owner';

export type VipTier = 'free' | 'vip_1day' | 'vip_7day' | 'vip_30day' | 'vip_lifetime';

export type BettingPlatform = 'sokrizybet' | '1xbet';

export interface OneXBetAccountData {
  accountId: string; // e.g. "88419204" or "SRB778899"
  platform?: BettingPlatform;
  accountName?: string;
  currency?: string; // "USD" | "KHR"
  balance?: number;
  vipStatus?: 'VIP Club' | 'Pro Member' | 'Master' | 'Standard';
  connectedIp: string; // "185.195.234.19"
  connectedAt: string;
  scanAccuracy: number; // 100.0
  isLiveScanning: boolean;
  gameSeed?: string;
  streamQuality?: '100% Ultra Smooth (60 FPS)' | 'Standard';
}

export interface User {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: Role;
  vipTier: VipTier;
  vipExpiresAt: string | null; // ISO string or null for lifetime/free
  createdAt: string;
  totalSignalsUsed: number;
  bettingPlatform?: BettingPlatform;
  sokRizyBetAccountId?: string;
  oneXBetAccountId?: string; // 1xBet or SokRizyBet Player ID
  oneXBetConnectedAt?: string;
  oneXBetSyncStatus?: 'connected' | 'idle' | 'syncing';
  oneXBetAccount?: OneXBetAccountData;
}

export type PaymentMethod =
  | 'khqr'
  | 'amk'
  | 'prasac'
  | 'ppc'
  | 'aba'
  | 'bakong'
  | 'wing'
  | 'usdt';
export type OrderStatus = 'pending' | 'completed' | 'rejected';

export interface SignalPackage {
  id: string;
  name: string;
  nameKh: string;
  tier: VipTier;
  durationDays: number; // 0 for lifetime
  priceUsd: number;
  priceKhr: number;
  description: string;
  descriptionKh: string;
  accuracyRate: string;
  features: string[];
  featuresKh: string[];
  isPopular?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  packageId: string;
  packageName: string;
  packageNameKh: string;
  amountUsd: number;
  amountKhr: number;
  paymentMethod: PaymentMethod;
  paymentStatus: OrderStatus;
  activationKey?: string;
  receiptImage?: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export type SignalStrategy = 'power_max' | 'ultra_max' | 'conservative' | 'balanced' | 'aggressive';

export interface SignalStepPrediction {
  rowIndex: number; // 0 to 9 (0 is bottom 1.23x, 9 is top 349.48x)
  multiplier: number;
  multiplierText: string;
  safeColumn: number; // 0 to 4 (5 columns)
  confidence: number; // e.g. 98.6%
}

export interface SignalSession {
  id: string;
  gameId: string;
  timestamp: string;
  serverHash: string;
  clientSeed: string;
  steps: SignalStepPrediction[];
  maxStep: number;
  accuracy: number;
  sourceServer: string; // e.g. '1xBet / Melbet Engine API'
  strategy?: SignalStrategy;
  hackStatus?: 'active_100' | 'ultra_real_max' | 'power_max_ai';
}

export interface SystemAlert {
  id: string;
  type: 'order' | 'signal' | 'vip' | 'system';
  title: string;
  titleKh: string;
  message: string;
  messageKh: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  amountUsd?: number;
}

export interface ScannedSignalLog {
  id: string;
  gameId: string;
  timestamp: string; // ISO date
  timeFormatted: string; // "14 Oct 2026, 15:42:09"
  userName: string;
  userPhone?: string;
  userVipTier?: string;
  strategy: SignalStrategy;
  sourceServer: string;
  outcome: 'WIN 🏆' | 'CASHOUT 💰' | 'COMPLETED ✅';
  stepReached: number; // e.g. 10
  multiplier: string; // e.g. "×349.48"
  multiplierValue: number;
  accuracy: number; // 100.0
  serverHash: string;
  clientSeed: string;
}

export interface WeeklySalesStat {
  week: string; // "W37", "W38", etc.
  label: string;
  startDate: string;
  endDate: string;
  revenueUsd: number;
  revenueKhr: number;
  serverCostUsd: number;
  netProfitUsd: number;
  ordersCount: number;
  signalsCount: number;
  growthRatePercent: number;
}

export interface DailySalesStat {
  date: string;
  label: string;
  revenueUsd: number;
  revenueKhr: number;
  ordersCount: number;
  signalsCount: number;
  vipNewUsers: number;
  growthRatePercent?: number;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  type: 'signal' | 'order' | 'system' | 'security' | 'maintenance';
  titleKh: string;
  titleEn: string;
  details: string;
  status: 'success' | 'warning' | 'info' | 'error';
  userOrSource: string;
  meta?: {
    accuracy?: number;
    steps?: number;
    amountUsd?: number;
    orderNumber?: string;
    ipAddress?: string;
    latencyMs?: number;
  };
}

export interface HourlySuccessRate {
  hour: string; // e.g. "00:00", "01:00", ... "23:00"
  timestamp: string;
  successRate: number; // e.g. 99.4
  totalSignals: number;
  successfulSignals: number;
}

export interface BotConfig {
  winRateTarget: number; // e.g. 99.9
  autoStepDelayMs: number; // 25ms for 10x faster
  requireVipAfterStep: number; // e.g. step 4 or 5 for free users
  serverStatus: 'online' | 'degraded' | 'maintenance';
  activeEngine: string;
  signalStrategy?: SignalStrategy;
  ultraHackMode?: boolean;
  autoApproveOrders: boolean;
  soundEnabled: boolean;
  language: 'kh' | 'en' | 'ru';
  merchantName: string;
  merchantAccount: string;
  khqrImage: string;
  maintenanceMode: boolean;
  maintenanceDurationHours: number;
  maintenanceEndsAt: string;
  cybersecurityVersion: string;
  aiEngineVersion: string;
  antiHackStatus: 'active' | 'hardened';
  lowSuccessRateThreshold: number;
  serverHostLocation: string;
  serverHostIp: string;
  serverFeedIp: string; // 185.195.234.19 (Live Real-Time Signal Scan Stream Feed IP)
  feedConnectionStatus?: 'connected' | 'syncing' | 'reconnecting';
  feedPacketsPerSec?: number; // e.g. 2140 pkts/s
  feedLatencyMs?: number; // 1ms ultra-low ping
  feedStreamActive?: boolean;
  serverCpuModel: string;
  serverPingMs: number;
  scheduleEnabled: boolean;
  operatingStartHour: number; // 7 for 7:00 AM
  operatingEndHour: number; // 22 for 10:00 PM
  scheduleForceMode?: 'auto' | 'force_open' | 'force_closed';
  autoUpdateWindowEnabled?: boolean; // 3:00 PM - 5:00 PM daily auto-update
  autoUpdateStartHour?: number; // 15 (3:00 PM)
  autoUpdateEndHour?: number; // 17 (5:00 PM)
  autoUpdateEarlyResume?: boolean;
  autoUpdateForceMode?: 'auto' | 'force_updating' | 'normal';
  latencyRetryThresholdMs?: number; // e.g. 15ms threshold for intelligent auto-retry
  theme: 'dark' | 'forest';
}

export type CyberCellType = 'apple' | 'core';

export interface CyberBoardRow {
  rowIndex: number;
  multiplier: string;
  cells: CyberCellType[];
}

export interface CyberAuthState {
  isLoggedIn: boolean;
  accountId: string;
  key: string;
  platform?: BettingPlatform;
  activatedAt?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  category: 'server_hosting' | 'edge_proxy' | 'bandwidth' | 'security_shield' | 'domain_ssl' | 'maintenance';
  amountUsd: number;
  recurrence: 'monthly' | 'one_time' | 'yearly';
  provider: string;
  status: 'paid' | 'pending' | 'due';
  dueDate: string;
  notes?: string;
}

export interface ServerScript {
  id: string;
  name: string;
  filename: string;
  description: string;
  category: 'setup' | 'update' | 'maintenance' | 'restart';
  command: string;
  lastExecutedAt?: string;
  status: 'idle' | 'running' | 'success' | 'failed';
}

export interface ScriptLogEntry {
  id: string;
  timestamp: string;
  scriptName: string;
  command: string;
  output: string[];
  exitCode: number;
  durationMs: number;
}

export interface DailyIpNode {
  id: string;
  name: string;
  feedIp: string;
  hostIp: string;
  dnsIp: string;
  proxyIp: string;
  region: string;
  city: string;
  countryCode: string;
  latencyMs: number;
  uptimePercent: number;
  provider: string;
  asn: string;
  encryption: string;
}

export interface DailyIpAuditEntry {
  id: string;
  date: string; // YYYY-MM-DD
  feedIp: string;
  hostIp: string;
  region: string;
  city: string;
  status: 'active' | 'rotated' | 'maintenance';
  rotatedAt: string;
  uptimePercent: number;
  latencyMs: number;
  rotationType: 'scheduled_daily' | 'manual_force' | 'auto_failover';
}

export interface DailyNetworkConfig {
  currentNode: DailyIpNode;
  autoRotateDaily: boolean;
  nextRotationTimestamp: number; // Unix timestamp for next 00:00 UTC
  lastRotatedDate: string; // YYYY-MM-DD
  ipPool: DailyIpNode[];
  rotationHistory: DailyIpAuditEntry[];
  totalRotationsCount: number;
  systemSoftwareVersion: string;
  lastSoftwareUpdateAt: string;
}

export interface PhotoScanRowSignal {
  rowNumber: number;
  multiplier: string;
  safeColumns: number[];
  bestColumn: number;
  status: 'revealed_win' | 'revealed_loss' | 'ai_predicted_target';
  confidence: number;
}

export interface PhotoScanResult {
  id: string;
  fileName: string;
  previewUrl?: string;
  scannedAt: string;
  model: string;
  isAppleOfFortuneScreenshot: boolean;
  detectedPlatform: string;
  detectedActiveRow: number;
  recommendedColumn: number;
  overallConfidence: number;
  summaryTitle: string;
  answerExplanation: string;
  rowSignals: PhotoScanRowSignal[];
}

export interface DbUserProfile {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  bettingPlatform: BettingPlatform;
  bettingAccountId: string;
  bio: string;
  role: Role;
  vipTier: VipTier;
  createdAt: string;
  updatedAt: string;
}

export interface DbOrderRecord {
  id: number;
  orderNumber: string;
  serviceName: string;
  customerName: string;
  amountUsd: number;
  amountKhr: number;
  paymentMethod: string;
  status: string;
  activationKey: string;
  createdAt: string;
}

export interface AdminSalesMetricsResponse {
  updatedAt: string;
  totalDailySalesUsd: number;
  totalDailySalesKhr: number;
  ordersTodayCount: number;
  totalRevenueUsd: number;
  totalRevenueKhr: number;
  totalOrdersCount: number;
  completedOrdersCount: number;
  pendingOrdersCount: number;
  totalUsersCount: number;
  vipUsersCount: number;
  topServices: {
    serviceName: string;
    orderCount: number;
    revenueUsd: number;
  }[];
  hourlyBreakdown: {
    hour: string;
    ordersCount: number;
    revenueUsd: number;
  }[];
  recentOrders: DbOrderRecord[];
}

export interface FootballWorkingStep {
  stepTitle: string;
  detail: string;
  signalImpact: string;
}

export type FootballMarketConfidenceTier = 'LOCK' | 'HIGH' | 'VALUE';

export interface FootballGroundingSource {
  title: string;
  uri: string;
}

export interface FootballMatchPredictionResult {
  id: string;
  inputMode?: 'photo' | 'manual';
  fileName: string;
  previewUrl?: string;
  scannedAt: string;
  model: string;
  isFootballMatchScreenshot: boolean;
  league: string;
  matchStatus: string;
  homeTeam: string;
  awayTeam: string;
  visibleOddsOrScore: string;
  overallConfidence: number;
  workingSummary: string;
  workingMatchSteps: FootballWorkingStep[];
  groundingSources?: FootballGroundingSource[];
  topLockPick: {
    market: string;
    selection: string;
    confidence: number;
    tier: FootballMarketConfidenceTier;
    rationale: string;
  };
  winningTeam: {
    pick: string;
    pickType: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN';
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    confidence: number;
    tier: FootballMarketConfidenceTier;
    reasoning: string;
  };
  asianHandicap: {
    line: string;
    recommendedSide: string;
    pickLabel: string;
    confidence: number;
    tier: FootballMarketConfidenceTier;
    reasoning: string;
  };
  overUnder: {
    goalLine: string;
    pick: 'OVER' | 'UNDER';
    pickLabel: string;
    expectedTotalGoals: number;
    confidence: number;
    tier: FootballMarketConfidenceTier;
    reasoning: string;
  };
  correctScore: {
    primaryScore: string;
    alternativeScores: string[];
    confidence: number;
    tier: FootballMarketConfidenceTier;
    reasoning: string;
  };
  btts: {
    pick: 'YES' | 'NO';
    pickLabel: string;
    yesProb: number;
    noProb: number;
    confidence: number;
    tier: FootballMarketConfidenceTier;
    reasoning: string;
  };
  halfTimeFullTime: {
    primaryCombo: string;
    backupCombo: string;
    confidence: number;
    tier: FootballMarketConfidenceTier;
    reasoning: string;
  };
  corners: {
    line: string;
    pick: 'OVER' | 'UNDER';
    pickLabel: string;
    expectedCorners: number;
    confidence: number;
    tier: FootballMarketConfidenceTier;
    reasoning: string;
  };
  cards: {
    line: string;
    pick: 'OVER' | 'UNDER';
    pickLabel: string;
    expectedCards: number;
    intensityLevel: 'Low' | 'Moderate' | 'High';
    confidence: number;
    tier: FootballMarketConfidenceTier;
    reasoning: string;
  };
}
