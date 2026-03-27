import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";
import { http } from "wagmi";
import { Attribution } from "ox/erc8021";

const builderCode = "bc_ccz5jzsg";
const encodedDataSuffix = "0x62635f63637a356a7a73670b0080218021802180218021802180218021";

export const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [builderCode]
});

if (DATA_SUFFIX.toLowerCase() !== encodedDataSuffix.toLowerCase()) {
  throw new Error("Builder Code attribution suffix does not match the provided encoded string.");
}

export const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "fusionx-nft-lab-demo";

export const wagmiConfig = getDefaultConfig({
  appName: "FusionX NFT Lab",
  projectId,
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL)
  },
  ssr: true,
  dataSuffix: DATA_SUFFIX
});
