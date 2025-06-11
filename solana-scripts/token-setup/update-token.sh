#!/bin/bash

# Token mint address
TOKEN_ADDRESS="4MCKxwSEF3M6y9WsLiJtkoKaMtWh7eRhuV1gRUVZMg6w"

# Configurar la autoridad del token
spl-token authorize $TOKEN_ADDRESS mint --owner /Users/pro/my-solana-wallet.json

# Configurar el nombre y símbolo del token
spl-token set-name $TOKEN_ADDRESS "RacingFi"
spl-token set-symbol $TOKEN_ADDRESS "RCF"

echo "Token metadata updated successfully!" 