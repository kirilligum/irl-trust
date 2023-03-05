# IRL Trust 
dao lending pool that uses in-real-life trust between people to give credit

# Original post:
a micro-lending pool of people that personally know the borrower

This is an alternative to collateralized loans and mimics the credit-score system. From my experience in working in consumer banking and researching various models for financing, including microfinancing and anthropology, this is our society's best bet 🙂

Key ideas:
- lenders personally know the borrower(s). they are family and real-life friends
- lending pool is a dao
- dao chooses whom to accept as an additional lender (AL) based on the AL's relationship with other lenders and borrower(s)
- the loans are structured.
    - bi-weekly or monthly payments of a specific amount
    - downpayment
    - interest
    - limit on how much to take from the loan in a month
- dao approves addresses, where the borrower can spend the loan
- white-listed or token-gatedspending addresses for spending
- credit-score based on the connectivity in a graph and past history
- optional: dispute resolutions
- optional: annonymity
- previous: kyc ( https://ethglobal.com/showcase/zk-kyc-sbt-ozwb2 ) and aml (https://ethglobal.com/showcase/complisend-3j0jx )

# Users: 
Lenders, Borrowers, merchants, oracles 


# User Flow
User flow
1. Borrower (B) wants to buy sawing machine and yarn to start a sewing business.
2. B asks for a loan from her friends and family. By doing that, B puts her reputation at stake. 
3. These IRL Lenders form a dao
4.B creates a proposal that has the terms
    - Amount
    - Downpayment
    - Withdrawals (initial $40 for the sewing machine, $20 every week for textiles, and $5 for other expenses; for two months)
        - When (includes start and end day)
        - How much
        - To which addresses (seller of the sewing machine, textile suppliers, and other expenses)
        - Interest (included in the payments)
    d. Repayments: when and how much  (withdrawals end + 2 months to build capital, start repaying, specify dates and amounts)
5. Dao votes and approves the terms
6. Loan starts
7. If all repayments are according to the schedule, no problem –the dao emits an event.
8. If skipping a payment by less than 30 days, the dao emits an event, payment schedule is delayed.
9. If the payment is more than 90 days late → default event

This is a [Next.js](https://nextjs.org) + [Web3Modal](https://web3modal.com/) + [wagmi](https://wagmi.sh) project bootstrapped with [`create-wagmi`](https://github.com/wagmi-dev/wagmi/tree/main/packages/create-wagmi)

# Getting Started
`git clone --recurse-submodules https://github.com/kirilligum/irl-trust`

## Running submodules:
To demo this project, we first need to run 2 submodules: ceramic2 & snappy-recovery 
Open each folder to see Readme for detailed steps on how to run them.

This is resource intensive. If you encounter the error "ENOSPC: System limit for number of file watchers reached"
You can run this:
```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
## main webapp
After running all the dependencies above... run the main webapp:

``` cd src && npm install && npm run dev``` 

Since a submodule is already running a webapp, this main webapp should open at localhost:3001

### contracts

`cd huma-contracts && yarn install`
`cp .env.example .env`
fill out mnemonic from a development metamask
(bottom of file, wrap in single quotes)
`npx hardhat node`

(new terminal)

to run basic workflow tests
`npx hardhat test ./test/IrlTrustTest.js`

to preset for web integration
`npx hardhat run ./scripts/irl-trust-predeploy`

## Bounties

### Ceramic
We use ceramic to store loan contract term sheets. Modeled after ceramic's workshop, the ceramic2 submodule spins up a ceramic node plus a graphiql server. The run time composite enables the frontend to execute graphql queries. 
In this video, when a borrower initiates a lending pool, the browser console logs the query string and sees it was successful as the streamID is shown. Through a query on the graphiql server we can also see that the new data was written to ceramic. This has little data but if this were to go to production, the lending pool would contain a lot more data that wouldn't make sense to store on Ethereum. Ceramic was a great option as it allowed quick access to read and write data supplementing on-chain data.
https://youtu.be/7r-PXMzLgq8

### Metamask
Social recovery is an important aspect for our users. Since our lending pools are people that know each other in real life, it's a great safety mechanism for our borrowers to get help from lenders for recovery. This was built on the Snappy recovery repo by Ziad. We've enabled recovery from just 2 lenders. With more time we would have liked to streamline the recovery process so that in our dapp's workflow, recovery can be set up automatically by default. 
https://youtu.be/vmMPtxMcIEg

