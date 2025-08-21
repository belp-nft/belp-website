import { UserService, AuthService } from "@/services";
import { ApiCallHelper } from "./apiCallHelper";

export class UserDataService {
  static async loadTransactions(
    isLoadingTransactions: boolean,
    transactions: any[],
    transactionsLastLoaded: number,
    setIsLoadingTransactions: (value: boolean) => void,
    setTransactions: (value: any[]) => void,
    setTransactionsLastLoaded: (value: number) => void,
    forceRefresh: boolean = false
  ): Promise<void> {
    // Check authentication before proceeding
    if (!ApiCallHelper.canMakeAuthenticatedCall()) {
      console.warn(
        "⚠️ Skipping transaction loading - authentication not ready"
      );
      return;
    }

    if (isLoadingTransactions) {
      console.log("Transactions already loading, skipping...");
      return;
    }

    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    if (
      !forceRefresh &&
      transactions.length > 0 &&
      now - transactionsLastLoaded < CACHE_DURATION
    ) {
      console.log("Using cached transactions data");
      return;
    }

    try {
      setIsLoadingTransactions(true);

      const txResult = await ApiCallHelper.executeWithAuthCheck(
        () => UserService.getTransactions({ limit: 50 }),
        "Load Transactions"
      );

      if (txResult && txResult.success && txResult.data) {
        setTransactions(txResult.data);
        setTransactionsLastLoaded(now);
        console.log(
          "Transaction history loaded:",
          txResult.data.length,
          "transactions"
        );
      } else if (txResult === null) {
        console.warn("Transaction loading failed due to authentication");
      }
    } catch (error: any) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  }

  static async loadUserStatistics(
    isLoadingUserStats: boolean,
    userStatistics: any,
    userStatsLastLoaded: number,
    setIsLoadingUserStats: (value: boolean) => void,
    setUserStatistics: (value: any) => void,
    setUserStatsLastLoaded: (value: number) => void,
    forceRefresh: boolean = false
  ): Promise<void> {
    // Check authentication before proceeding
    if (!ApiCallHelper.canMakeAuthenticatedCall()) {
      console.warn(
        "⚠️ Skipping user statistics loading - authentication not ready"
      );
      return;
    }

    if (isLoadingUserStats) {
      console.log("User statistics already loading, skipping...");
      return;
    }

    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    if (
      !forceRefresh &&
      userStatistics &&
      now - userStatsLastLoaded < CACHE_DURATION
    ) {
      console.log("Using cached user statistics data");
      return;
    }

    try {
      setIsLoadingUserStats(true);

      const statsResult = await ApiCallHelper.executeWithAuthCheck(
        () => UserService.getUserStatistics(),
        "Load User Statistics"
      );

      if (statsResult && statsResult.success && statsResult.data) {
        setUserStatistics(statsResult.data);
        setUserStatsLastLoaded(now);
        console.log("User statistics loaded:", statsResult.data);
      } else if (statsResult === null) {
        console.warn("User statistics loading failed due to authentication");
      }
    } catch (error: any) {
      console.error("Failed to load user statistics:", error);
    } finally {
      setIsLoadingUserStats(false);
    }
  }
}
