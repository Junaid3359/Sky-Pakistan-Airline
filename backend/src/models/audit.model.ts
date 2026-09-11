import mongoose, { Schema, Document } from 'mongoose';

export interface IAudit extends Document {
  user?: mongoose.Types.ObjectId | string;
  action: string;
  resource?: string;
  details?: any;
  ip?: string;
}

const AuditSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.Mixed },
    action: { type: String, required: true },
    resource: { type: String },
    details: { type: Schema.Types.Mixed },
    ip: { type: String }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAudit>('AuditLog', AuditSchema);
