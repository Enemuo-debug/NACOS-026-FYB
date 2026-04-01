import mongoose, { Schema, Document } from 'mongoose';
import { FieldType } from '../interfaces/user.interface';

export interface IFYBDefinition extends Document {
  userID: string;
  name: string;
  description?: string;
  slot1Label?: string; slot1Type?: FieldType;
  slot2Label?: string; slot2Type?: FieldType;
  slot3Label?: string; slot3Type?: FieldType;
  slot4Label?: string; slot4Type?: FieldType;
  slot5Label?: string; slot5Type?: FieldType;
  slot6Label?: string; slot6Type?: FieldType;
  slot7Label?: string; slot7Type?: FieldType;
  slot8Label?: string; slot8Type?: FieldType;
  slot9Label?: string; slot9Type?: FieldType;
  slot10Label?: string; slot10Type?: FieldType;
  createdAt: Date;
  updatedAt: Date;
}

const slotDefinition = {
  type: { type: String, enum: Object.values(FieldType) },
  label: { type: String }
};

const fybDefinitionSchema = new Schema<IFYBDefinition>(
  {
    userID: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    slot1Label: slotDefinition.label, slot1Type: slotDefinition.type,
    slot2Label: slotDefinition.label, slot2Type: slotDefinition.type,
    slot3Label: slotDefinition.label, slot3Type: slotDefinition.type,
    slot4Label: slotDefinition.label, slot4Type: slotDefinition.type,
    slot5Label: slotDefinition.label, slot5Type: slotDefinition.type,
    slot6Label: slotDefinition.label, slot6Type: slotDefinition.type,
    slot7Label: slotDefinition.label, slot7Type: slotDefinition.type,
    slot8Label: slotDefinition.label, slot8Type: slotDefinition.type,
    slot9Label: slotDefinition.label, slot9Type: slotDefinition.type,
    slot10Label: slotDefinition.label, slot10Type: slotDefinition.type
  },
  { timestamps: true }
);

export default mongoose.model<IFYBDefinition>('FYBDefinition', fybDefinitionSchema);
