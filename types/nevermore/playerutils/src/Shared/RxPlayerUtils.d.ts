import { Observable, Predicate } from '@quenty/rx';
import { Brio } from '@quenty/brio';

export namespace RxPlayerUtils {
  function observePlayersBrio(
    predicate?: Predicate<Player>
  ): Observable<Brio<Player>>;
  function observeCharactersBrio(): Observable<Brio<Model>>;
  function observeHumanoidsBrio(): Observable<Brio<Humanoid>>;
  function observeLocalPlayerBrio(): Observable<Brio<Player>>;
  function observeLocalPlayerHumanoidBrio(): Observable<Brio<Humanoid>>;
  function observePlayers(predicate?: Predicate<Player>): Observable<Player>;
  function observeFirstAppearanceLoaded(player: Player): Observable<void>;
}
