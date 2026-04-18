import { ServiceBag } from "@quenty/servicebag";

export class GameServiceClient {
  public static readonly ServiceName = "GameServiceClient";

  private _serviceBag!: ServiceBag;

  public Init(serviceBag: ServiceBag): void {
    assert(!this._serviceBag, "Already initialized");
    this._serviceBag = serviceBag;
  }
}
