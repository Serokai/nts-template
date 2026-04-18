import { ServiceBag } from "@quenty/servicebag";

import { ExampleService } from "src/modules/example/Server/ExampleService";

export class GameService {
  public static readonly ServiceName = "GameService";

  private _serviceBag!: ServiceBag;

  public Init(serviceBag: ServiceBag): void {
    assert(!this._serviceBag, "Already initialized");
    this._serviceBag = serviceBag;

    this._serviceBag.GetService(ExampleService);
  }
}
