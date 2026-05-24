import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";

type CreateAuditLogPayload = {
  actorId?: string;
  action: string;
  targetCollection: string;
  targetId: string;
  metadata?: Record<string, unknown>;
};

export async function createAuditLog(
  payload: CreateAuditLogPayload
) {
  await addDoc(collection(db, "audit_logs"), {
    actorId: payload.actorId || null,
    action: payload.action,
    targetCollection: payload.targetCollection,
    targetId: payload.targetId,
    metadata: payload.metadata || {},
    createdAt: serverTimestamp(),
  });
}