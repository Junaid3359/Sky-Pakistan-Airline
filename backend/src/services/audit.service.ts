import { AuditLog } from '../models/audit.model';

export async function recordAudit(opts: { user?: any; action: string; resource?: string; details?: any; ip?: string }) {
  try {
    const a = new AuditLog({ user: opts.user, action: opts.action, resource: opts.resource, details: opts.details, ip: opts.ip });
    await a.save();
  } catch (e) {
    console.error('Failed to record audit', e);
  }
}
