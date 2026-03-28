import type { Abi, Address } from "viem";
import { isAddress } from "viem";
import { FUSION_CONTRACT_ADDRESS } from "@/lib/env";

if (!isAddress(FUSION_CONTRACT_ADDRESS)) {
  throw new Error(
    "Invalid NEXT_PUBLIC_FUSION_CONTRACT_ADDRESS. Please provide a valid 0x-prefixed contract address."
  );
}

export const fusionContract = {
  address: FUSION_CONTRACT_ADDRESS as Address
};

export const fusionAbi = [
  { type: "function", name: "nextId", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }]
  },
  {
    type: "function",
    name: "tierOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "mint", stateMutability: "nonpayable", inputs: [], outputs: [] },
  {
    type: "function",
    name: "fuse",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenIds", type: "uint256[3]" }],
    outputs: []
  }
] as const satisfies Abi;
