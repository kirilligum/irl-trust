pragma solidity ^0.8.0;
import {IPool} from "./interfaces/IPool.sol";

contract PoolStarter {
  event PoolStarter(address pool, address lender);

  function enablePool(
    address pool
  ) public {
    address lender = msg.sender;
    require(IPool(pool).isApprovedLender(lender), "Only an approved lender can start a pool");
    IPool(pool).enablePool();
    emit PoolStarter(pool, msg.sender);
  }
}
