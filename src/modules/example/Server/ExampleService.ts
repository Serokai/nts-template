import { ServiceBag } from "@quenty/servicebag";

export class ExampleService {
  public static readonly ServiceName = "ExampleService";

  private _serviceBag!: ServiceBag;

  public Init(serviceBag: ServiceBag): void {
    assert(!this._serviceBag, "Already initialized");
    this._serviceBag = serviceBag;
  }

  public Start(): void {
    print("[ExampleService] Started");
  }
}
