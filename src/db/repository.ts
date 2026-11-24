import { desc, eq, gte, sql } from 'drizzle-orm';
import { db } from './index.ts';
import {
  footballPredictions,
  gameServices,
  orders,
  photoScans,
  users,
} from './schema.ts';
import { ADMIN_BOOTSTRAP_EMAIL } from '../middleware/auth.ts';

const DEFAULT_SERVICES = [
  {
    slug: 'pkg_1day',
    name: '1-Day VIP Pass',
    nameKh: 'កញ្ចប់ 1-Day VIP (១ ថ្ងៃ)',
    category: 'vip_signal',
    priceUsd: 2.0,
    priceKhr: 8000,
    durationDays: 1,
    accuracyRate: '99.20%',
  },
  {
    slug: 'pkg_7day',
    name: '7-Days Pro VIP',
    nameKh: 'កញ្ចប់ Pro VIP ៧ ថ្ងៃ',
    category: 'vip_signal',
    priceUsd: 9.0,
    priceKhr: 36000,
    durationDays: 7,
    accuracyRate: '99.75%',
  },
  {
    slug: 'pkg_30day',
    name: '30-Days Master VIP',
    nameKh: 'កញ្ចប់ Master VIP ៣០ ថ្ងៃ',
    category: 'vip_signal',
    priceUsd: 25.0,
    priceKhr: 100000,
    durationDays: 30,
    accuracyRate: '99.90%',
  },
  {
    slug: 'pkg_lifetime',
    name: 'Lifetime Super VIP',
    nameKh: 'កញ្ចប់សមាជិកមួយជីវិត Lifetime VIP',
    category: 'vip_signal',
    priceUsd: 69.0,
    priceKhr: 280000,
    durationDays: 0,
    accuracyRate: '99.99%',
  },
];

export async function getOrCreateUser(params: {
  uid: string;
  email: string;
  emailVerified?: boolean;
  displayName?: string;
}) {
  try {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const isBootstrapAdmin =
      cleanEmail === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() &&
      params.emailVerified === true;

    const fallbackName =
      (params.displayName || '').trim() ||
      (cleanEmail ? cleanEmail.split('@')[0] : 'Player');

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.uid, params.uid));

    if (existing) {
      const nextRole = isBootstrapAdmin ? 'owner' : existing.role;
      const [updated] = await db
        .update(users)
        .set({
          email: cleanEmail || existing.email,
          role: nextRole,
          updatedAt: new Date(),
        })
        .where(eq(users.uid, params.uid))
        .returning();
      return updated;
    }

    const [inserted] = await db
      .insert(users)
      .values({
        uid: params.uid,
        email: cleanEmail,
        displayName: fallbackName.slice(0, 80),
        role: isBootstrapAdmin ? 'owner' : 'user',
        vipTier: isBootstrapAdmin ? 'vip_lifetime' : 'free',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: cleanEmail,
          updatedAt: new Date(),
        },
      })
      .returning();

    return inserted;
  } catch (error) {
    console.error('Database error in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

export async function updateUserProfile(
  uid: string,
  updates: {
    displayName?: string;
    phone?: string;
    bettingPlatform?: string;
    bettingAccountId?: string;
    bio?: string;
  }
) {
  try {
    const safePlatform =
      updates.bettingPlatform === '1xbet' ? '1xbet' : 'sokrizybet';

    const [updated] = await db
      .update(users)
      .set({
        ...(typeof updates.displayName === 'string' && updates.displayName.trim()
          ? { displayName: updates.displayName.trim().slice(0, 80) }
          : {}),
        ...(typeof updates.phone === 'string'
          ? { phone: updates.phone.trim().slice(0, 30) }
          : {}),
        ...(updates.bettingPlatform ? { bettingPlatform: safePlatform } : {}),
        ...(typeof updates.bettingAccountId === 'string'
          ? { bettingAccountId: updates.bettingAccountId.trim().slice(0, 64) }
          : {}),
        ...(typeof updates.bio === 'string'
          ? { bio: updates.bio.trim().slice(0, 280) }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.uid, uid))
      .returning();

    return updated || null;
  } catch (error) {
    console.error('Database error in updateUserProfile:', error);
    throw new Error('Failed to update user profile.', { cause: error });
  }
}

export async function ensureGameServicesCatalog() {
  try {
    await db
      .insert(gameServices)
      .values(DEFAULT_SERVICES)
      .onConflictDoNothing({ target: gameServices.slug });

    return await db
      .select()
      .from(gameServices)
      .orderBy(gameServices.priceUsd);
  } catch (error) {
    console.error('Database error in ensureGameServicesCatalog:', error);
    throw new Error('Failed to load game services catalog.', { cause: error });
  }
}

export async function createServiceOrder(params: {
  userId: number;
  customerName: string;
  serviceSlug: string;
  paymentMethod: string;
  status?: 'pending' | 'completed';
}) {
  try {
    await ensureGameServicesCatalog();

    const [service] = await db
      .select()
      .from(gameServices)
      .where(eq(gameServices.slug, params.serviceSlug));

    if (!service) {
      throw new Error('Requested game service package was not found.');
    }

    const allowedMethods = new Set([
      'khqr',
      'aba',
      'bakong',
      'amk',
      'prasac',
      'ppc',
      'wing',
      'usdt',
    ]);
    const cleanMethod = allowedMethods.has(params.paymentMethod)
      ? params.paymentMethod
      : 'khqr';

    const orderNumber = `AOF-${Math.floor(1000 + Math.random() * 9000)}-${Date.now()
      .toString()
      .slice(-3)}`;
    const activationKey = `VIP-${service.durationDays === 0 ? 'LIFE' : `${service.durationDays}D`}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderStatus = params.status === 'pending' ? 'pending' : 'completed';

    const [created] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: params.userId,
        serviceId: service.id,
        serviceName: service.name,
        customerName: params.customerName.slice(0, 80),
        amountUsd: service.priceUsd,
        amountKhr: service.priceKhr,
        paymentMethod: cleanMethod,
        status: orderStatus,
        activationKey: orderStatus === 'completed' ? activationKey : '',
      })
      .returning();

    if (orderStatus === 'completed') {
      const nextTier =
        service.slug === 'pkg_lifetime'
          ? 'vip_lifetime'
          : service.slug === 'pkg_30day'
          ? 'vip_30day'
          : service.slug === 'pkg_7day'
          ? 'vip_7day'
          : 'vip_1day';

      await db
        .update(users)
        .set({ vipTier: nextTier, updatedAt: new Date() })
        .where(eq(users.id, params.userId));
    }

    return created;
  } catch (error) {
    console.error('Database error in createServiceOrder:', error);
    throw new Error(
      error instanceof Error && error.message.includes('package was not found')
        ? error.message
        : 'Failed to create order.',
      { cause: error }
    );
  }
}

export async function listOrdersByUid(uid: string) {
  try {
    return await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        serviceName: orders.serviceName,
        customerName: orders.customerName,
        amountUsd: orders.amountUsd,
        amountKhr: orders.amountKhr,
        paymentMethod: orders.paymentMethod,
        status: orders.status,
        activationKey: orders.activationKey,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(eq(users.uid, uid))
      .orderBy(desc(orders.createdAt))
      .limit(50);
  } catch (error) {
    console.error('Database error in listOrdersByUid:', error);
    throw new Error('Failed to load user orders.', { cause: error });
  }
}

export async function updateOrderStatusAdmin(
  orderId: number,
  nextStatus: 'completed' | 'rejected'
) {
  try {
    const [existing] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!existing) {
      return null;
    }

    const activationKey =
      nextStatus === 'completed'
        ? existing.activationKey ||
          `VIP-KEY-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
        : '';

    const [updated] = await db
      .update(orders)
      .set({
        status: nextStatus,
        activationKey,
      })
      .where(eq(orders.id, orderId))
      .returning();

    return updated;
  } catch (error) {
    console.error('Database error in updateOrderStatusAdmin:', error);
    throw new Error('Failed to update order status.', { cause: error });
  }
}

export async function savePhotoScanRecord(params: {
  userId: number;
  ownerUid: string;
  platform: string;
  activeRow: number;
  recommendedColumn: number;
  overallConfidence: number;
  summaryTitle: string;
  answerExplanation: string;
  rowSignalsJson: string;
}) {
  try {
    const [saved] = await db
      .insert(photoScans)
      .values({
        userId: params.userId,
        ownerUid: params.ownerUid,
        platform: params.platform.slice(0, 60),
        activeRow: Math.max(1, Math.min(10, Math.round(params.activeRow))),
        recommendedColumn: Math.max(1, Math.min(5, Math.round(params.recommendedColumn))),
        overallConfidence: Number(params.overallConfidence) || 99.99,
        summaryTitle: params.summaryTitle.slice(0, 140),
        answerExplanation: params.answerExplanation.slice(0, 1000),
        rowSignalsJson: params.rowSignalsJson.slice(0, 8000),
      })
      .returning();
    return saved;
  } catch (error) {
    console.error('Database error in savePhotoScanRecord:', error);
    throw new Error('Failed to save AI scan record.', { cause: error });
  }
}

export async function listPhotoScansByUid(uid: string) {
  try {
    return await db
      .select()
      .from(photoScans)
      .where(eq(photoScans.ownerUid, uid))
      .orderBy(desc(photoScans.createdAt))
      .limit(30);
  } catch (error) {
    console.error('Database error in listPhotoScansByUid:', error);
    throw new Error('Failed to load AI photo scan history.', { cause: error });
  }
}

export async function saveFootballPredictionRecord(params: {
  userId: number;
  ownerUid: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  winningTeamPick: string;
  handicapPick: string;
  overUnderPick: string;
  correctScorePick: string;
  confidence: number;
  workingAnalysis: string;
  marketsJson: string;
}) {
  try {
    const [saved] = await db
      .insert(footballPredictions)
      .values({
        userId: params.userId,
        ownerUid: params.ownerUid,
        league: params.league.slice(0, 80) || 'International',
        homeTeam: params.homeTeam.slice(0, 80) || 'Home Team',
        awayTeam: params.awayTeam.slice(0, 80) || 'Away Team',
        winningTeamPick: params.winningTeamPick.slice(0, 100) || 'Home Win',
        handicapPick: params.handicapPick.slice(0, 100) || '0',
        overUnderPick: params.overUnderPick.slice(0, 100) || 'Over 2.5',
        correctScorePick: params.correctScorePick.slice(0, 32) || '2 - 1',
        confidence: Math.max(0, Math.min(100, Number(params.confidence) || 99.99)),
        workingAnalysis: params.workingAnalysis.slice(0, 1500),
        marketsJson: params.marketsJson.slice(0, 8000),
      })
      .returning();
    return saved;
  } catch (error) {
    console.error('Database error in saveFootballPredictionRecord:', error);
    throw new Error('Failed to save football prediction record.', { cause: error });
  }
}

export async function listFootballPredictionsByUid(uid: string) {
  try {
    return await db
      .select()
      .from(footballPredictions)
      .where(eq(footballPredictions.ownerUid, uid))
      .orderBy(desc(footballPredictions.createdAt))
      .limit(30);
  } catch (error) {
    console.error('Database error in listFootballPredictionsByUid:', error);
    throw new Error('Failed to load football prediction history.', { cause: error });
  }
}

export async function getAdminSalesDashboardMetrics() {
  try {
    await ensureGameServicesCatalog();

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const [dailyTotals] = await db
      .select({
        dailySalesUsd: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.amountUsd} else 0 end), 0)`,
        dailySalesKhr: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.amountKhr} else 0 end), 0)`,
        ordersTodayCount: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(gte(orders.createdAt, startOfDay));

    const [overallTotals] = await db
      .select({
        totalRevenueUsd: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.amountUsd} else 0 end), 0)`,
        totalRevenueKhr: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.amountKhr} else 0 end), 0)`,
        totalOrdersCount: sql<number>`count(*)::int`,
        completedOrdersCount: sql<number>`count(case when ${orders.status} = 'completed' then 1 end)::int`,
        pendingOrdersCount: sql<number>`count(case when ${orders.status} = 'pending' then 1 end)::int`,
      })
      .from(orders);

    const [userStats] = await db
      .select({
        totalUsersCount: sql<number>`count(*)::int`,
        vipUsersCount: sql<number>`count(case when ${users.vipTier} <> 'free' then 1 end)::int`,
      })
      .from(users);

    const topServices = await db
      .select({
        serviceName: orders.serviceName,
        orderCount: sql<number>`count(*)::int`,
        revenueUsd: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.amountUsd} else 0 end), 0)`,
      })
      .from(orders)
      .groupBy(orders.serviceName)
      .orderBy(desc(sql`count(*)`))
      .limit(6);

    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        serviceName: orders.serviceName,
        customerName: orders.customerName,
        amountUsd: orders.amountUsd,
        amountKhr: orders.amountKhr,
        paymentMethod: orders.paymentMethod,
        status: orders.status,
        activationKey: orders.activationKey,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(20);

    const hourlyBreakdown = await db
      .select({
        hourBucket: sql<string>`to_char(date_trunc('hour', ${orders.createdAt}), 'HH24:00')`,
        ordersCount: sql<number>`count(*)::int`,
        revenueUsd: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.amountUsd} else 0 end), 0)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, startOfDay))
      .groupBy(sql`date_trunc('hour', ${orders.createdAt})`)
      .orderBy(sql`date_trunc('hour', ${orders.createdAt})`);

    return {
      updatedAt: new Date().toISOString(),
      totalDailySalesUsd: Number(dailyTotals?.dailySalesUsd || 0),
      totalDailySalesKhr: Number(dailyTotals?.dailySalesKhr || 0),
      ordersTodayCount: Number(dailyTotals?.ordersTodayCount || 0),
      totalRevenueUsd: Number(overallTotals?.totalRevenueUsd || 0),
      totalRevenueKhr: Number(overallTotals?.totalRevenueKhr || 0),
      totalOrdersCount: Number(overallTotals?.totalOrdersCount || 0),
      completedOrdersCount: Number(overallTotals?.completedOrdersCount || 0),
      pendingOrdersCount: Number(overallTotals?.pendingOrdersCount || 0),
      totalUsersCount: Number(userStats?.totalUsersCount || 0),
      vipUsersCount: Number(userStats?.vipUsersCount || 0),
      topServices: topServices.map((s) => ({
        serviceName: s.serviceName,
        orderCount: Number(s.orderCount || 0),
        revenueUsd: Number(s.revenueUsd || 0),
      })),
      hourlyBreakdown: hourlyBreakdown.map((h) => ({
        hour: h.hourBucket,
        ordersCount: Number(h.ordersCount || 0),
        revenueUsd: Number(h.revenueUsd || 0),
      })),
      recentOrders,
    };
  } catch (error) {
    console.error('Database error in getAdminSalesDashboardMetrics:', error);
    throw new Error('Failed to load real-time sales metrics.', { cause: error });
  }
}

export async function pingDatabase(): Promise<{ connected: boolean; latencyMs: number }> {
  const startedAt = performance.now();
  try {
    await db.execute(sql`SELECT 1`);
    const latencyMs = Number(Math.max(0.1, performance.now() - startedAt).toFixed(1));
    return { connected: true, latencyMs };
  } catch {
    const latencyMs = Number(Math.max(0.1, performance.now() - startedAt).toFixed(1));
    return { connected: false, latencyMs };
  }
}

