import { Promise } from '@quenty/promise';

export namespace MarketplaceUtils {
  function promiseProductInfo(
    assetId: number,
    infoType: Enum.InfoType.Asset
  ): Promise<AssetProductInfo>;
  function promiseProductInfo(
    assetId: number,
    infoType: Enum.InfoType.Bundle
  ): Promise<BundleInfo>;
  function promiseProductInfo(
    assetId: number,
    infoType: Enum.InfoType.GamePass
  ): Promise<GamePassProductInfo>;
  function promiseProductInfo(
    assetId: number,
    infoType: Enum.InfoType.Product
  ): Promise<DeveloperProductInfo>;
  function promiseProductInfo(
    assetId: number,
    infoType: Enum.InfoType.Subscription
  ): Promise<SubscriptionProductInfo>;
  function promiseProductInfo(
    assetId: number,
    infoType: Enum.InfoType
  ): Promise<ProductInfo>;

  function promiseUserSubscriptionStatus(
    player: Player,
    subscriptionId: number
  ): Promise<UserSubscriptionStatus>;
  function promiseUserOwnsGamePass(
    userId: number,
    gamePassId: number
  ): Promise<boolean>;
  function promisePlayerOwnsAsset(
    player: Player,
    assetId: number
  ): Promise<boolean>;
  function promisePlayerOwnsBundle(
    player: Player,
    bundleId: number
  ): Promise<boolean>;
}
