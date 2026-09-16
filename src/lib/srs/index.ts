import type { AnswerOutcome, ItemStats, ReviewBucket } from "../storage/types";

/**
 * Lightweight Leitner-style scheduler (spec section 23). Deliberately simple
 * and replaceable — the goal is practical maintenance review, not a
 * scientifically tuned SM-2 implementation.
 *
 * Principle: wrong -> review sooner, self-accepted -> moderate interval,
 * automatic correct -> longer interval. Repeated correct answers advance the
 * bucket (new -> learning -> review -> mastered); a wrong answer always
 * drops back at least one bucket.
 */

const INTERVAL_DAYS_BY_BUCKET: Record<ReviewBucket, number> = {
  new: 0,
  learning: 1,
  review: 4,
  mastered: 14,
};

const BUCKET_ORDER: ReviewBucket[] = ["new", "learning", "review", "mastered"];

function shiftBucket(bucket: ReviewBucket, delta: number): ReviewBucket {
  const idx = BUCKET_ORDER.indexOf(bucket);
  const next = Math.min(BUCKET_ORDER.length - 1, Math.max(0, idx + delta));
  return BUCKET_ORDER[next];
}

export function createItemStats(itemId: string): ItemStats {
  return {
    itemId,
    attempts: 0,
    automaticCorrect: 0,
    selfAccepted: 0,
    wrong: 0,
    difficultyScore: 0,
    bucket: "new",
  };
}

export function applyAnswerOutcome(
  stats: ItemStats,
  outcome: AnswerOutcome,
  now: Date = new Date(),
): ItemStats {
  const updated: ItemStats = { ...stats, attempts: stats.attempts + 1, lastSeen: now.toISOString() };

  if (outcome === "auto-correct") {
    updated.automaticCorrect += 1;
    updated.lastCorrect = now.toISOString();
    updated.bucket = shiftBucket(stats.bucket, 1);
    updated.difficultyScore = Math.max(0, stats.difficultyScore - 2);
  } else if (outcome === "self-accepted") {
    updated.selfAccepted += 1;
    updated.lastCorrect = now.toISOString();
    updated.bucket = shiftBucket(stats.bucket, stats.bucket === "new" ? 1 : 0);
    updated.difficultyScore = Math.max(0, stats.difficultyScore - 1);
  } else {
    updated.wrong += 1;
    updated.bucket = shiftBucket(stats.bucket, -1);
    updated.difficultyScore = stats.difficultyScore + 3;
  }

  const intervalDays =
    outcome === "wrong" ? 0.5 : outcome === "self-accepted" ? INTERVAL_DAYS_BY_BUCKET[updated.bucket] / 2 : INTERVAL_DAYS_BY_BUCKET[updated.bucket];
  const due = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  updated.dueAt = due.toISOString();

  return updated;
}

export function isDue(stats: ItemStats, now: Date = new Date()): boolean {
  if (!stats.dueAt) return true;
  return new Date(stats.dueAt).getTime() <= now.getTime();
}
