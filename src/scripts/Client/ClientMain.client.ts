import { ServiceBag } from "@quenty/servicebag";

import { GameServiceClient } from "../../modules/game/Client/GameServiceClient";

const serviceBag = new ServiceBag();
serviceBag.GetService(GameServiceClient);
serviceBag.Init();
serviceBag.Start();
