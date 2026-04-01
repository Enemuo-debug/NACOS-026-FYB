import FYBEntry, { IFYBEntry } from '../models/fybEntry.model';

export class FYBEntryRepository {
  async create(entry: Partial<IFYBEntry>): Promise<IFYBEntry> {
    const doc = new FYBEntry(entry);
    return await doc.save();
  }

  async getByDefinition(definitionId: string): Promise<IFYBEntry[]> {
    return await FYBEntry.find({ definitionId });
  }
}
