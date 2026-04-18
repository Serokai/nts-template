import { ServiceBag } from '@quenty/servicebag';

export interface SpawnServiceClient {
  readonly ServiceName: 'SpawnServiceClient';
  Init(serviceBag: ServiceBag): void;
}

export const SpawnServiceClient: SpawnServiceClient;
