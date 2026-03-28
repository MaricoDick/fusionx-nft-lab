const DEFAULT_APP_URL = "https://fusionx-nft-lab.vercel.app";
const DEFAULT_TALENT_VERIFICATION =
  "7433cbaee5897d6ff2648b1142cadbfc4e595f8971c0b876a6bf19e50870b9fdb98c9bcb77149907a1d39216b706dab80303f1e25e46b983e72fb80a362b454b";
const DEFAULT_FUSION_CONTRACT_ADDRESS = "0x6287A2bfc3E3de9C19cCe763B738df8C01b902cd";

const normalizeEnv = (value: string | undefined) => value?.trim() ?? "";

const parseNonNegativeInt = (value: string | undefined, fallback: number) => {
  const normalized = normalizeEnv(value);
  if (!normalized) return fallback;

  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
};

export const APP_NAME = "FusionX NFT Lab";
export const APP_URL = normalizeEnv(process.env.NEXT_PUBLIC_APP_URL) || DEFAULT_APP_URL;
export const BASE_RPC_URL = normalizeEnv(process.env.NEXT_PUBLIC_BASE_RPC_URL);
export const WALLETCONNECT_PROJECT_ID = normalizeEnv(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);
export const BASE_APP_ID = normalizeEnv(process.env.NEXT_PUBLIC_BASE_APP_ID);
export const ATTRIBUTION_TRACK_API_URL = normalizeEnv(process.env.NEXT_PUBLIC_ATTRIBUTION_TRACK_API);
export const TALENT_VERIFICATION =
  normalizeEnv(process.env.NEXT_PUBLIC_TALENT_VERIFICATION) || DEFAULT_TALENT_VERIFICATION;
export const NFT_SCAN_LIMIT = parseNonNegativeInt(process.env.NEXT_PUBLIC_NFT_SCAN_LIMIT, 0);
export const FUSION_CONTRACT_ADDRESS =
  normalizeEnv(process.env.NEXT_PUBLIC_FUSION_CONTRACT_ADDRESS) || DEFAULT_FUSION_CONTRACT_ADDRESS;
