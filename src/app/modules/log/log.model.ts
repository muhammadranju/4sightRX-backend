import { Schema, model } from 'mongoose';
import { ILog, LogModel } from './log.interface';

const logSchema = new Schema<ILog, LogModel>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    type: {
      type: String,
      enum: ['savings', 'extraction', 'recommendation'],
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      required: true,
    },
    source: {
      type: String,
    },
    confidence: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

export const Log = model<ILog, LogModel>('Log', logSchema);
