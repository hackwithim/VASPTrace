# Blockchain Adapter System

VASPTrace is architected with a decoupled adapter design pattern (`BlockchainAdapter`), enabling addition of new networks without modifying graph or attribution logic.

## 1. Abstract Adapter Interface

```python
class BlockchainAdapter(ABC):
    @property
    @abstractmethod
    def chain_name(self) -> str:
        """Returns normalized chain identifier: ethereum, bitcoin, etc."""
        pass

    @abstractmethod
    def validate_address(self, address: str) -> bool:
        """Validates chain-specific address format."""
        pass

    @abstractmethod
    async def get_transactions(
        self, address: str, limit: int, start_time: Optional[datetime], end_time: Optional[datetime], min_value: Optional[float]
    ) -> List[Dict[str, Any]]:
        """Retrieves raw or normalized incoming/outgoing transactions."""
        pass
```

## 2. Implemented Adapters

- **`EthereumAdapter`**:
  - Handles EVM hexadecimal addresses (`^0x[a-fA-F0-9]{40}$`).
  - Supports JSON-RPC endpoints and Etherscan indexing.
  - Generates deterministic multi-hop traces under `MOCK_MODE=true`.

- **`BitcoinAdapter`**:
  - Validates Legacy (1...), Script/Segwit (3...), and Native Segwit (bc1...).
  - Supports UTXO-level transaction graph modeling.

## 3. Adding a New Blockchain (e.g. Tron / Solana)

1. Create `app/adapters/tron.py` inheriting from `BlockchainAdapter`.
2. Implement address validation (e.g. Base58 check starting with `T`).
3. Connect RPC endpoint or block explorer indexer.
4. Register the new adapter in `InvestigationService.get_adapter()`.
