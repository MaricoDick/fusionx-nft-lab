import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";
import { http } from "wagmi";
import { Attribution } from "ox/erc8021";
import { APP_NAME, BASE_RPC_URL, WALLETCONNECT_PROJECT_ID } from "@/lib/env";

const builderCode = "bc_ccz5jzsg";
const encodedDataSuffix = "0x62635f63637a356a7a73670b0080218021802180218021802180218021";

export const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [builderCode]
});

if (DATA_SUFFIX.toLowerCase() !== encodedDataSuffix.toLowerCase()) {
  throw new Error("Builder Code attribution suffix does not match the provided encoded string.");
}

if (!WALLETCONNECT_PROJECT_ID) {
  throw new Error(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Set a valid WalletConnect project id in your environment."
  );
}

export const projectId = WALLETCONNECT_PROJECT_ID;

export const wagmiConfig = getDefaultConfig({
  appName: APP_NAME,
  projectId,
  chains: [base],
  transports: {
    [base.id]: BASE_RPC_URL ? http(BASE_RPC_URL) : http()
  },
  ssr: true,
  dataSuffix: DATA_SUFFIX
});
