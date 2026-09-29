import pytest
from app.adapters.ethereum import EthereumAdapter
from app.adapters.bitcoin import BitcoinAdapter


def test_ethereum_address_validation():
    eth = EthereumAdapter()
    
    # Valid checksum and lowercase addresses
    assert eth.validate_address("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045") is True
    assert eth.validate_address("0x71c2b5368a4114299b821430c6e11894d3a011a1") is True
    assert eth.validate_address("0xDemoSuspectWallet9a8123910248192a912") is True
    
    # Invalid formats
    assert eth.validate_address("") is False
    assert eth.validate_address("0xInvalidTooShort") is False
    assert eth.validate_address("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa") is False
    assert eth.validate_address("0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ") is False


def test_bitcoin_address_validation():
    btc = BitcoinAdapter()
    
    # Valid P2PKH, P2SH, and Bech32
    assert btc.validate_address("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa") is True
    assert btc.validate_address("3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy") is True
    assert btc.validate_address("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq") is True
    assert btc.validate_address("bc1qdemowalletaddress99812491a") is True
    
    # Invalid formats
    assert btc.validate_address("") is False
    assert btc.validate_address("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045") is False
    assert btc.validate_address("invalid_btc_addr") is False
