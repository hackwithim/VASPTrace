from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime


class BlockchainAdapter(ABC):
    @property
    @abstractmethod
    def chain_name(self) -> str:
        """Returns normalized chain identifier: ethereum, bitcoin, tron, etc."""
        pass

    @abstractmethod
    def validate_address(self, address: str) -> bool:
        """Validates chain-specific address format."""
        pass

    @abstractmethod
    async def get_transactions(
        self, 
        address: str, 
        limit: int = 50, 
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        min_value: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves raw or normalized incoming/outgoing transactions for address."""
        pass

    @abstractmethod
    async def get_transaction(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """Retrieves single transaction details."""
        pass

    @abstractmethod
    async def get_balance(self, address: str) -> float:
        """Retrieves native token balance."""
        pass

    @abstractmethod
    async def get_token_transfers(self, address: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves ERC20 / TRC20 / token transfers."""
        pass

    @abstractmethod
    async def get_block_timestamp(self, block_number: int) -> Optional[datetime]:
        """Retrieves timestamp of given block."""
        pass
