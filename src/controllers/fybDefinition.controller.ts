import { Request, Response } from 'express';
import { FYBDefinitionRepository } from '../repositories/fybDefinition.repository';
import { FYBEntryRepository } from '../repositories/fybEntry.repository';
import { FieldType } from '../interfaces/user.interface';
import { IFYBDefinition } from '../models/fybDefinition.model';
import { IFYBEntry } from '../models/fybEntry.model';
import { v2 as cloudinary } from 'cloudinary';

const MAX_FIELDS = 10;
type FieldInput = { label: string; type: FieldType };
type EntryValueInput = { fieldId?: string; label?: string; value: any };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class FYBDefinitionController {
  private definitionRepo: FYBDefinitionRepository;
  private entryRepo: FYBEntryRepository;

  constructor() {
    this.definitionRepo = new FYBDefinitionRepository();
    this.entryRepo = new FYBEntryRepository();
  }

  public create = async (req: Request, res: Response) => {
    try {
      const { name, description, fields } = req.body as { name: string; description?: string; fields: FieldInput[] };
      const userID = (req as any).user?.id || (req as any).user?._id || req.body.userID;

      if (!userID || !name || !Array.isArray(fields)) {
        res.status(400).json({ message: 'userID, name and fields array are required' });
        return;
      }

      if (fields.length === 0 || fields.length > MAX_FIELDS) {
        res.status(400).json({ message: `fields must have between 1 and ${MAX_FIELDS} items` });
        return;
      }

      const filled = fields.slice(0, MAX_FIELDS);
      const slots: Record<string, string | undefined> = {};
      filled.forEach((f, idx) => {
        if (!f.label || !f.type) {
          throw new Error(`Field at index ${idx} is missing label or type`);
        }
        if (!Object.values(FieldType).includes(f.type)) {
          throw new Error(`Field type at index ${idx} must be one of ${Object.values(FieldType).join(',')}`);
        }
        const slot = idx + 1;
        slots[`slot${slot}Label`] = f.label;
        slots[`slot${slot}Type`] = f.type;
      });

      const created = await this.definitionRepo.create({
        userID,
        name,
        description,
        ...slots
      } as IFYBDefinition);

      const shareLink = `${process.env.APP_URL || 'http://localhost:3000'}/api/definitions/${created._id.toString()}/entries`;

      res.status(201).json({ ...created.toObject(), shareLink });
    } catch (err: any) {
      res.status(400).json({ message: err.message || 'Error creating FYB definition', error: err });
    }
  };

  public list = async (req: Request, res: Response) => {
    try {
      const userID = (req as any).user?.id || (req as any).user?._id;
      if (!userID) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const defs = await this.definitionRepo.getAllByUser(userID);
      const enriched = defs.map(def => {
        const fields = this.definitionSlots(def);
        return {
          ...def.toObject(),
          fields,
          shareLink: `${process.env.APP_URL || 'http://localhost:3000'}/api/definitions/${def._id.toString()}/entries`
        };
      });
      res.json(enriched);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching FYB definitions', error: err });
    }
  };

  public createEntry = async (req: Request, res: Response) => {
    const definitionId = req.params.definitionId as string;
    try {
      const definition = await this.definitionRepo.getById(definitionId);
      if (!definition) {
        res.status(404).json({ message: 'Definition not found' });
        return;
      }

      const incomingValues = (req.body?.values || []) as EntryValueInput[];
      if (!Array.isArray(incomingValues) || incomingValues.length === 0) {
        res.status(400).json({ message: 'values array is required' });
        return;
      }

      const slots = this.definitionSlots(definition);
      const slotValues: Record<string, string | undefined> = {};

      for (const val of incomingValues) {
        const rawValue = Array.isArray((val as any).value) ? (val as any).value[0] : (val as any).value;
        const targetSlot = slots.find(s => s.label === val.label);
        if (!targetSlot || !targetSlot.slotKey) {
          res.status(400).json({ message: `Unknown field label ${val.label}` });
          return;
        }

        if (targetSlot.type === FieldType.NUMBER) {
          const asNumber = Number(rawValue);
          if (!Number.isFinite(asNumber)) {
            res.status(400).json({ message: `Field ${targetSlot.label} must be a number` });
            return;
          }
          slotValues[targetSlot.slotKey] = asNumber.toString();
        } else if (targetSlot.type === FieldType.IMAGE) {
          if (!rawValue) {
            res.status(400).json({ message: `Field ${targetSlot.label} requires an image value` });
            return;
          }
          const url = await this.uploadImage(String(rawValue));
          slotValues[targetSlot.slotKey] = url;
        } else {
          slotValues[targetSlot.slotKey] = String(rawValue || '');
        }
      }

      const createdEntry: IFYBEntry = await this.entryRepo.create({
        definitionId,
        ...slotValues
      });

      res.status(201).json(createdEntry);
    } catch (err) {
      res.status(500).json({ message: 'Error creating FYB entry', error: err });
    }
  };

  public listEntries = async (req: Request, res: Response) => {
    const definitionId = req.params.definitionId as string;
    try {
      const entries = await this.entryRepo.getByDefinition(definitionId);
      res.json(entries);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching FYB entries', error: err });
    }
  };

  private uploadImage = async (value: string): Promise<string> => {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    const uploadResult = await cloudinary.uploader.upload(value, {
      resource_type: 'auto'
    });

    return uploadResult.secure_url;
  };

  private definitionSlots(def: IFYBDefinition): Array<{ slotKey: string; label?: string; type?: FieldType }> {
    const slots: Array<{ slotKey: string; label?: string; type?: FieldType }> = [];
    for (let i = 1; i <= MAX_FIELDS; i++) {
      const label = (def as any)[`slot${i}Label`] as string | undefined;
      const type = (def as any)[`slot${i}Type`] as FieldType | undefined;
      slots.push({ slotKey: `slot${i}`, label, type });
    }
    return slots.filter(s => s.label);
  }
}
