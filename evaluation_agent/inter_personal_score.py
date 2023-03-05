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

def main(signer,borrower_addr):
    print("signer:",signer,"  borrower_addr:",borrower_addr)
    nsigner = int(signer.replace('x','8'))
    nborrower = int(borrower_addr.replace('x','9'))
    p = {}
    p = [{ "borrower":"0x001", "lenders":["0x01","0x02","0x03"], "amount":100, "apr": 0.1 }, \
         { "borrower":"0x101", "lenders":["0x11","0x02","0x03"], "amount":110, "apr": 0.1 }, \
         { "borrower":"0x201", "lenders":["0x11","0x22"], "amount":120, "apr": 0.1 }]
    G=nx.Graph()
    for i in p:
        pool2edges(G,i,borrower_addr)
    # print(G)
    # print(G.adj)
    print(weightedPathsSum(G,nsigner,nborrower))
    nx.draw_networkx(G)
    # nx.draw_networkx_edge_labels(G,pos=nx.spring_layout((G)))
    plt.savefig("path.png")


if __name__ == "__main__":
    main(sys.argv[1],sys.argv[2])

