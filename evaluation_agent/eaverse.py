from web3 import Web3

from huma_pool import HumaPool

import underwriter


def evaluation_agent_handler(**kwargs):
    pool_address = kwargs.get("poolAddress")
    wallet_address = kwargs.get("borrowerWalletAddress")
    huma_pool = HumaPool(pool_address)
    
    result = underwriter.underwrite(huma_pool, **kwargs)
    if result.get("creditLimit"):
        record_approved_credit(wallet_address, huma_pool, result.copy())
    return result

def record_approved_credit(wallet_address, huma_pool, approval_result):
    try:
        approval_result["creditLimit"]
    except KeyError:
        raise KeyError("creditLimit not included in approval result")
    try:
        approval_result["intervalInDays"]
    except KeyError:
        raise KeyError("intervalInDays not included in approval result")
    try:
        approval_result["remainingPeriods"]
    except KeyError:
        raise KeyError("remainingPeriods not included in approval result")
    try:
        approval_result["aprInBps"]
    except KeyError:
        raise KeyError("aprInBps not included in approval result")

    approval_result["borrower"] = Web3.toChecksumAddress(wallet_address)
    huma_pool.post_approved_request(**approval_result)


def manual_approve_handler(**kwargs):
    pool_address = kwargs.get("poolAddress")
    wallet_address = kwargs.get("borrowerWalletAddress")
    credit_limit = kwargs.get("creditLimit")
    huma_pool = HumaPool(pool_address)
    apr = huma_pool.summary[1]
    result = {
            "creditLimit": int(credit_limit*10**6),
            "intervalInDays": 30,
            "remainingPeriods": 12,
            "aprInBps": apr
        }
    record_approved_credit(wallet_address, huma_pool, result.copy())
    return result

if __name__ == "__main__":
    approve_param = {
        "poolAddress": "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
        "borrowerWalletAddress": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
    }
    r = evaluation_agent_handler(**approve_param)
    