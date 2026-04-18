import { ServiceBag } from '@quenty/servicebag';

export interface ScoredActionService {
  Init(serviceBag: ServiceBag): void;
}

export const ScoredActionService: ScoredActionService;
