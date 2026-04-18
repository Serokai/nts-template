import { ServiceBag } from '@quenty/servicebag';

export interface Motor6DService {
  Init(serviceBag: ServiceBag): void;
}

export const Motor6DService: Motor6DService;
