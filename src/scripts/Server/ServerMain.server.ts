import { ServiceBag } from "@quenty/servicebag";

import { GameService } from "../../modules/game/Server/GameService";

const serviceBag = new ServiceBag();
serviceBag.GetService(GameService);
serviceBag.Init();
serviceBag.Start();
