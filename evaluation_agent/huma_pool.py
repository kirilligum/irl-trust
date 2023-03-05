import json

from web3 import HTTPProvider, Web3
from web3.middleware import geth_poa_middleware

import config

class HumaPool:
    def __init__(self, pool_address):
        self.signer = Web3.toChecksumAddress(config.ea)
        self.pool_address = Web3.toChecksumAddress(pool_address)
        with open("abi/BaseCreditPool.json") as f:
            self.abi = json.load(f)
        self.w3 = Web3(HTTPProvider("http://localhost:8545"))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        self.huma_pool_contract = self.w3.eth.contract(address=self.pool_address, abi=self.abi)
        self.pool_config_address = Web3.toChecksumAddress(self.get_pool_config_address())
        with open("abi/BasePoolConfig.json") as f:
            self.config_abi = json.load(f)
        self.huma_pool_config_contract = self.w3.eth.contract(address=self.pool_config_address, abi=self.config_abi)
        self.summary = self.get_pool_summary()
        
    def post_approved_request(self, **approve_result):
        nonce = self.w3.eth.get_transaction_count(self.signer, "pending")
        post_txn = self.huma_pool_contract.functions.approveCredit(**approve_result).buildTransaction(
            {"from": self.signer, "nonce": nonce}
        )

        signed_txn = self.w3.eth.account.sign_transaction(post_txn, private_key=config.ea_key)
        txn_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        txn_receipt = self.w3.eth.wait_for_transaction_receipt(txn_hash)
        if txn_receipt["status"]:
            return
        else:
            raise RuntimeError("Blockchain transaction failed")

    def get_approval_status(self, borrower_address):
        return self.huma_pool_contract.functions.isApproved(Web3.toChecksumAddress(borrower_address)).call()
    
    def get_pool_summary(self):
        # tokenAddress, apr, payPeriod, maxCreditAmount, liquidityCap, token name
        # token Symbol, decimal, EAID, EANFTAddress
        return self.huma_pool_config_contract.functions.getPoolSummary().call()
    
    def get_pool_config_address(self):
        return self.huma_pool_contract.functions.poolConfig().call()