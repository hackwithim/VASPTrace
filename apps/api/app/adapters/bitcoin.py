import re
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from app.adapters.base import BlockchainAdapter
from app.core.config import settings


class BitcoinAdapter(BlockchainAdapter):
    def __init__(self):
        self.rpc_url = settings.BITCOIN_RPC_URL
        self.api_key = settings.BITCOIN_API_KEY
        self.mock_mode = settings.MOCK_MODE

    @property
    def chain_name(self) -> str:
        return "bitcoin"

    def validate_address(self, address: str) -> bool:
        if not address:
            return False
        if address.lower().startswith("bc1qdemo") or address.lower().startswith("1demo"):
            return True
        # P2PKH (1...), P2SH (3...), Bech32 (bc1...)
        legacy_or_p2sh = bool(re.match(r"^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$", address))
        bech32 = bool(re.match(r"^bc1[a-z0-9]{38,59}$", address.lower()))
        return legacy_or_p2sh or bech32

    async def get_balance(self, address: str) -> float:
        return 1.42

    async def get_transactions(
        self,
        address: str,
        limit: int = 50,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        min_value: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        btc_wallet_a = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
        btc_wallet_b = "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"
        btc_vasp_deposit = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"  # Demo BTC Exchange Cluster

        results = [
            {
                "tx_hash": "f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16",
                "blockchain": "bitcoin",
                "from_address": address,
                "to_address": btc_wallet_a,
                "amount": 2.15,
                "asset": "BTC",
                "block_number": 834920,
                "timestamp": now - timedelta(hours=4),
                "hop_level": 1,
                "is_direct_deposit": False,
                "edge_type": "transfer",
            },
            {
                "tx_hash": "a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d",
                "blockchain": "bitcoin",
                "from_address": btc_wallet_a,
                "to_address": btc_wallet_b,
                "amount": 1.95,
                "asset": "BTC",
                "block_number": 834932,
                "timestamp": now - timedelta(hours=3, minutes=20),
                "hop_level": 2,
                "is_direct_deposit": False,
                "edge_type": "transfer",
            },
            {
                "tx_hash": "7b827e8d6314f3a4731804c6374f67b5e13589b3f36a5cf6e838933b918342a1",
                "blockchain": "bitcoin",
                "from_address": btc_wallet_b,
                "to_address": btc_vasp_deposit,
                "amount": 1.90,
                "asset": "BTC",
                "block_number": 834945,
                "timestamp": now - timedelta(hours=2, minutes=45),
                "hop_level": 3,
                "is_direct_deposit": True,
                "edge_type": "deposit",
            }
        ]

        if min_value is not None:
            results = [r for r in results if r["amount"] >= min_value]

        return results

    async def get_transaction(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        return {
            "tx_hash": tx_hash,
            "blockchain": "bitcoin",
            "from_address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            "to_address": "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
            "amount": 1.95,
            "asset": "BTC",
            "block_number": 834932,
            "timestamp": now - timedelta(hours=3, minutes=20),
            "status": "confirmed",
        }

    async def get_token_transfers(self, address: str, limit: int = 50) -> List[Dict[str, Any]]:
        return []

    async def get_block_timestamp(self, block_number: int) -> Optional[datetime]:
        return datetime.now(timezone.utc) - timedelta(hours=3)
