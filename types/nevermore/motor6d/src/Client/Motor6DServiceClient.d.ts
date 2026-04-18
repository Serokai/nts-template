import { ServiceBag } from '@quenty/servicebag';

export interface Motor6DServiceClient {
  Init(serviceBag: ServiceBag): void;
}

export const Motor6DServiceClient: Motor6DServiceClient;
