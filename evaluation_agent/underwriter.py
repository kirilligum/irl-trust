from typing import Any, Dict, List
import requests
import config

import sys
from typing import Dict
import networkx as nx
import matplotlib.pyplot as plt

def pool2edges(G,p,borrower_addr):
    for i in p["lenders"]:
        inode=int(i.replace('x','8'))
        if borrower_addr == p['borrower']:
            inode=int(i.replace('x','8'))
            jnode=int(borrower_addr.replace('x','9'))
            G.add_nodes_from([inode,jnode])
            G.add_edge(inode,jnode,weight=p[ 'amount' ])
        for j in p["lenders"]:
            if i != j:
                jnode=int(j.replace('x','8'))
                G.add_nodes_from([inode,jnode])
                G.add_edge(inode,jnode,weight=p[ 'amount' ])
                # print("edge", i,j,p['amount'])

def weightedPathsSum(G,a,b):
    wedges=[]
    e=nx.Graph()
    for i in G:
        ai=nx.dijkstra_path(G,a,i)
        ib = nx.dijkstra_path(G,i,b)
        path = ai[:-1]+ib
        r = path[0]
        nc=1
        for j in path[1:]:
            wedge= G[r][j]['weight']/len(path)/nc
            if r!=j:
                e.add_nodes_from([r,j])
                e.add_edge(r,i,weight=wedge)
            r=j
            nc+=1
    ws=0
    for i in e.edges.data():
        ws+=i[2]['weight']
    return ws

def fetch_signal(signal_names: List[str], adapter_inputs: Dict[str, Any]) -> Dict[str, Any]:
   """Fetch signals from the decentralized signal portfolio service.
   
   For more details about DSP service, see https://github.com/00labs/huma-signals/tree/main/huma_signals
   """
   request = {"signal_names": signal_names, "adapter_inputs": adapter_inputs}
   response = requests.post(config.signals_endpoint, json=request)
   if response.status_code != 200:
       raise ValueError(f"Error fetching signals: {response.text}")
   return {k: v for k, v in response.json().get("signals").items() if k in signal_names}


def underwrite(huma_pool, **kwargs):
    """
    The interface function between an EA and Huma EA service
    :param huma_pool: the object that represents huma pool contract
    :param **kwargs
        poolAddress:        str: the address for the destiny huma pool
        borrowerWalletAddress:      str: the borrower's wallet address
    :return: returns corresponding fields to UI
    """

    borrower_wallet_address = kwargs["borrowerWalletAddress"]  # noqa

    ### step 1: list all the lending pools
    ##pools = [p1, p2, p3]

    ### step 2: calculate whether the borrower defaulted on each of the pool
    ##def is_default(borrower_address, pool_address)->bool:
    ##    return False

    ### step 3: calculte credit score
    ##is_defaults = [is_default(borrower_wallet_address, p) for p in pools]

    # print("signer:",signer,"  borrower_addr:",borrower_addr)
    singer = "0x22" 
    borrower_addr = "0x001"
    # borrower_addr = borrower_wallet_address
    nsigner = int(signer.replace('x','8'))
    nborrower = int(borrower_addr.replace('x','9'))
    p = {} # should return the pools with the following data
    p = [{ "borrower":"0x001", "lenders":["0x01","0x02","0x03"], "amount":100, "apr": 0.1 }, \
         { "borrower":"0x101", "lenders":["0x11","0x02","0x03"], "amount":110, "apr": 0.1 }, \
         { "borrower":"0x201", "lenders":["0x11","0x22"], "amount":120, "apr": 0.1 }]
    G=nx.Graph()
    for i in p:
        pool2edges(G,i,borrower_addr)
    # print(G)
    # print(G.adj)
    interpersonal_credit_score = weightedPathsSum(G,nsigner,nborrower)
    
    # to be removed
    # result = {
    #         "creditLimit": int(10000*10**6),
    #         "intervalInDays": 30,
    #         "remainingPeriods": 12,
    #         "aprInBps": 0
    #     }
    
    # your code here
    
    signal_names = [
        "ethereum_wallet.total_transactions",
        "ethereum_wallet.total_sent",
        "ethereum_wallet.total_received",
        "ethereum_wallet.wallet_teneur_in_days",
        "ethereum_wallet.total_income_90days",
        "ethereum_wallet.total_transactions_90days"
        ]
    
    adapter_inputs = {"borrower_wallet_address": borrower_wallet_address}

    signals = fetch_signal(signal_names, adapter_inputs)
    if signals.get('ethereum_wallet.wallet_teneur_in_days') >= 365:
        result = {
            "creditLimit": interpersonal_credit_score 
            "intervalInDays": 30,
            "remainingPeriods": 12,
            "aprInBps": 0
        }
    else:
        raise Exception("accountTooNew")
    
    return result  # noqa
