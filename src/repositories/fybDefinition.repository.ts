import FYBDefinition, { IFYBDefinition } from '../models/fybDefinition.model';

export class FYBDefinitionRepository {
  async create(defData: Partial<IFYBDefinition>): Promise<IFYBDefinition> {
    const def = new FYBDefinition(defData);
    return await def.save();
  }

  async getAllByUser(userID: string): Promise<IFYBDefinition[]> {
    return await FYBDefinition.find({ userID });
  }

  async getById(id: string): Promise<IFYBDefinition | null> {
    return await FYBDefinition.findById(id);
  }
}
