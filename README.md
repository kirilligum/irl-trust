# IRL Trust -- dao lending pool that uses in-real-life trust between people to give credit

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
  a. Amount
  b. Downpayment
  c. Withdrawals (initial $40 for the sewing machine, $20 every week for textiles, and $5 for other expenses; for two months)
    i. When (includes start and end day)
    ii. How much
    iii. To which addresses (seller of the sewing machine, textile suppliers, and other expenses)
    iv. Interest (included in the payments)
  d. Repayments: when and how much  (withdrawals end + 2 months to build capital, start repaying, specify dates and amounts)
5. Dao votes and approves the terms
6. Loan starts
7. If all repayments are according to the schedule, no problem –the dao emits an event.
8. If skipping a payment by less than 30 days, the dao emits an event, payment schedule is delayed.
9. If the payment is more than 90 days late → default event

