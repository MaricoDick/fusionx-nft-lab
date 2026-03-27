import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";
import { http } from "wagmi";
import { Attribution } from "ox/erc8021";

const builderCode = "BUILDER_CODE_PLACEHOLDER";

export const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [builderCode]
});

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
