import mongoose, { Schema, Document } from 'mongoose';

export interface IFYBEntry extends Document {
  definitionId: string;
  slot1?: string;
  slot2?: string;
  slot3?: string;
  slot4?: string;
  slot5?: string;
  slot6?: string;
  slot7?: string;
  slot8?: string;
  slot9?: string;
  slot10?: string;
  createdAt: Date;
  updatedAt: Date;
}

const fybEntrySchema = new Schema<IFYBEntry>(
  {
    definitionId: { type: String, required: true, index: true },
    slot1: { type: String }, slot2: { type: String }, slot3: { type: String },
    slot4: { type: String }, slot5: { type: String }, slot6: { type: String },
    slot7: { type: String }, slot8: { type: String }, slot9: { type: String },
    slot10: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IFYBEntry>('FYBEntry', fybEntrySchema);
