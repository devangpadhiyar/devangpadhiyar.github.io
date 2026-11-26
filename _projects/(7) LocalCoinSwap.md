---
name: LocalCoinSwap
title: "LocalCoinSwap"
order: 5
client: Nividata
years: 2018 → 2020
url_live: https://localcoinswap.com
tools: [Python, Django, Blockchain, Multi-sig, PostgreSQL]
description: Non-custodial peer-to-peer crypto marketplace — users trade fiat for crypto directly with each other while holding their own private keys, with multi-signature escrow for BTC-family coins and smart contracts for ETH-family.
---

## The problem

A P2P crypto exchange has to solve a trust problem between strangers: the buyer wants the coin before paying, the seller wants payment before releasing the coin. The usual answer is custody — the exchange holds the funds. That makes the exchange a target and its users dependent on it staying solvent and honest.

## The approach

**Escrow without custody.** Users keep their own keys. Trades settle through **multi-signature transactions** for BTC-family coins and **smart contracts** for ETH-family — so the platform can arbitrate a dispute without ever being able to walk off with the funds.

## The scale of the surface

The engineering difficulty is less in any single trade than in the combinatorics around it: **20+ cryptocurrencies** across Ethereum, BSC and Tron, **300+ payment methods**, **160+ fiat currencies**, users in **190+ countries** — every combination needing correct settlement, dispute handling and reconciliation.

## What I worked on

Blockchain node communication and the cryptocurrency trading systems underneath the marketplace — the layer that watches chains, confirms transactions, and drives escrow state.

<p class="callout">Client project delivered via Nividata Consultancy. Described here at the level the product's own public documentation covers.</p>
