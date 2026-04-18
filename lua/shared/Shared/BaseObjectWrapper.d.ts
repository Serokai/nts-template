import { Maid } from "@quenty/maid";

declare class BaseObject<T extends Instance | undefined = undefined> {
  protected _maid: Maid;
  protected _obj: T;
  constructor(obj?: T);
  public Destroy(): void;
}

export = BaseObject;
