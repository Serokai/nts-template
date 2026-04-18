import { ServiceBag } from '@quenty/servicebag';

export interface ClipCharactersService {
  readonly ServiceName: 'ClipCharactersService';
  Init(serviceBag: ServiceBag): void;
  Destroy(): void;
}

export const ClipCharactersService: ClipCharactersService;
