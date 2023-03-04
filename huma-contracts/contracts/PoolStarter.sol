pragma solidity ^0.8.0;
import {ICredit} from "./interfaces/ICredit.sol";
import {IPool} from "./interfaces/IPool.sol";

contract PoolStarter {
  event PoolStarter(address pool, address lender);
  address[] public pools;
  function enablePool(
    address pool
  ) public {
    address lender = msg.sender;
    require(IPool(pool).isApprovedLender(lender), "Only an approved lender can start a pool");
    ICredit(pool).enableCreditPool();
    pools.push(pool);
    emit PoolStarter(pool, msg.sender);
  }
}
