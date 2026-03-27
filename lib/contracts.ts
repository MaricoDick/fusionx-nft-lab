import type { Abi } from "viem";

export const fusionContract = {
  address: "0x6287A2bfc3E3de9C19cCe763B738df8C01b902cd" as const
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
  { type: "function", name: "mint", stateMutability: "nonpayable", inputs: [], outputs: [] },
  {
    type: "function",
    name: "fuse",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenIds", type: "uint256[3]" }],
    outputs: []
  }
] as const satisfies Abi;
