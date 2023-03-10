// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./interfaces/ICredit.sol";

import "./BasePool.sol";
import "./BaseCreditPoolStorage.sol";
import "./Errors.sol";

import "hardhat/console.sol";

/**
 * @notice BaseCreditPool is the basic form of a complete pool in Huma Protocol.
 * All production pools are expected to be instances of BaseCreditPool or
 * contracts derived from it (e.g. ReceivableFactoringPool).
 *
 * All borrowing for BaseCreditPool starts with a credit line. As long as the account is in good
 * standing and below the approved limit, the borrower can borrow and repay again and again,
 * very similar to how a credit card works.
 */
contract BaseCreditPool is BasePool, BaseCreditPoolStorage, ICredit {
  using SafeERC20 for IERC20;
  using BS for BS.CreditRecord;

  enum CreditLineClosureReason {
    Paidoff,
    CreditLimitChangedToBeZero,
    OverwrittenByNewLine
  }

    /**
     * @notice Credit line created
     * @param borrower the address of the borrower
     * @param creditLimit the credit limit of the credit line
     * @param aprInBps interest rate (APR) expressed in basis points, 1% is 100, 100% is 10000
     * @param payPeriodInDays the number of days in each pay cycle
     * @param remainingPeriods how many cycles are there before the credit line expires
     * @param approved flag that shows if the credit line has been approved or not
     */
    event CreditInitiated(
        address indexed borrower,
        uint256 creditLimit,
        uint256 aprInBps,
        uint256 payPeriodInDays,
        uint256 remainingPeriods,
        bool approved
    );
  /// Account billing info refreshed with the updated due amount and date
  event BillRefreshed(address indexed _approvedBorrower, uint256 newDueDate, address by);
  /// Credit line request has been approved
  event CreditApproved(
    address indexed _approvedBorrower,
    uint256 endDate,
    uint256 intervalInDays,
    uint256 remainingPeriods,
    uint256 aprInBps
  );

  /// Credit limit for an existing credit line has been changed
  event CreditLineChanged(
      address indexed borrower,
      uint256 oldCreditLimit,
      uint256 newCreditLimit
      );

  /**
  * @notice An existing credit line has been closed
  * @param reasonCode the reason for the credit line closure
    */
  event CreditLineClosed(
    address indexed borrower,
    address by,
    CreditLineClosureReason reasonCode
  );
  /**
  * @notice The expiration (maturity) date of a credit line has been extended.
  * @param numOfPeriods the number of pay periods to be extended
  * @param remainingPeriods the remaining number of pay periods after the extension
  */
  event CreditLineExtended(
    address indexed borrower,
    uint256 numOfPeriods,
    uint256 remainingPeriods,
    address by
  );
  /**
  * @notice The credit line has been marked as Defaulted.
  * @param losses the total losses to be written off because of the default.
    * @param by the address who has triggered the default
  */
  event DefaultTriggered(address indexed borrower, uint256 losses, address by);
  /**
  * @notice A borrowing event has happened to the credit line
  * @param borrowAmount the amount the user has borrowed
  * @param netAmountToBorrower the borrowing amount minus the fees that are charged upfront
  */
  event DrawdownMade(
    address indexed borrower,
    uint256 borrowAmount,
    uint256 netAmountToBorrower
  );
  /**
  * @notice A payment has been made against the credit line
  * @param amount the payback amount
  * @param by the address that has triggered the process of marking the payment made.
    * In most cases, it is the borrower. In receivable factoring, it is PDSServiceAccount.
    */
  event PaymentMade(
    address indexed borrower,
    uint256 amount,
    uint256 totalDue,
    uint256 unbilledPrincipal,
    address by
  );

  /**
   * @notice turns on the pool. Only the pool owner or protocol owner can enable a pool.
   */
  function enableCreditPool() external virtual override {
    _onlyOwnerOrHumaMasterAdminOrPoolStarter();

    BS.CreditRecord memory cr = _getCreditRecord(_approvedBorrower);
    uint256 periods = (_endDate - _startDate) / _maxWithdrawPeriodLength;
    _creditRecordStaticMapping[_approvedBorrower] = BS.CreditRecordStatic({
    creditLimit:  uint96(periods * _maxWithdrawAmountPerPeriod),
      aprInBps: uint16(_defaultAprInBps),
      intervalInDays: uint16(_defaultIntervalInDays),
      defaultAmount: uint96(0)
    });
    console.log('maxWithdrawPeriodLength', _maxWithdrawPeriodLength);
    console.log('maxWithdrawPerPeriod', _maxWithdrawAmountPerPeriod);
    console.log('enable credit', _creditRecordStaticMapping[_approvedBorrower].creditLimit);
    _setCreditRecord(_approvedBorrower, _approveCredit(cr));

    enablePool();
    emit PoolEnabled(msg.sender);
  }
  /**
  * @notice Approves the credit request with the terms provided.
  * @param newEndDate new expiration date
  * @param intervalInDays the number of days in each pay cycle
  * @param remainingPeriods how many cycles are there before the credit line expires
  * @param aprInBps interest rate (APR) expressed in basis points, 1% is 100, 100% is 10000
  * @dev only Evaluation Agent can call
  */
  function approveCredit(
    uint256 newEndDate,
    uint256 intervalInDays,
    uint256 remainingPeriods,
    uint256 aprInBps
  ) public virtual override {
    _protocolAndPoolOn();
    onlyEAServiceAccount();
    BS.CreditRecordStatic memory crs = _getCreditRecordStatic(_approvedBorrower);
    crs.creditLimit += uint96(_maxWithdrawAmountPerPeriod*((newEndDate - _endDate) / _maxWithdrawAmountPerPeriod));
    _maxCreditLineCheck(crs.creditLimit);
    crs.aprInBps = uint16(aprInBps);
    crs.intervalInDays = uint16(intervalInDays);
    _creditRecordStaticMapping[_approvedBorrower] = crs;

    BS.CreditRecord memory cr = _getCreditRecord(_approvedBorrower);
    _setCreditRecord(_approvedBorrower, _approveCredit(cr));
    emit CreditApproved(
      _approvedBorrower,
      newEndDate,
      intervalInDays,
      remainingPeriods,
      aprInBps
    );
  }

  /**
  * @notice changes the limit of the borrower's credit line.
  * @param newCreditLimit the new limit of the line in the unit of pool token
  * @dev The credit line is marked as Deleted if 1) the new credit line is 0 AND
    * 2) there is no due or unbilled principals.
    * @dev only Evaluation Agent can call
  */
  function changeCreditLine(uint256 newCreditLimit) public virtual override {
    _protocolAndPoolOn();
    // Borrowing amount needs to be lower than max for the pool.
    _maxCreditLineCheck(newCreditLimit);

    uint256 oldCreditLimit = _creditRecordStaticMapping[_approvedBorrower].creditLimit;

    // Only EA can increase credit line. Only EA or the _approvedBorrower can reduce credit line.
    if (newCreditLimit > oldCreditLimit) onlyEAServiceAccount();
    else {
      if (msg.sender != _approvedBorrower && msg.sender != _humaConfig.eaServiceAccount())
        revert Errors.onlyBorrowerOrEACanReduceCreditLine();
    }

    _creditRecordStaticMapping[_approvedBorrower].creditLimit = uint96(newCreditLimit);

    // Mark the line as Deleted when there is no due or unbilled principal
    if (newCreditLimit == 0) {
      // Bring the account current
      BS.CreditRecord memory cr = _updateDueInfo(false, true);
      // Note: updated state and remainingPeriods directly instead of the entire cr
      // for contract size consideration
      if (cr.totalDue == 0 && cr.unbilledPrincipal == 0) {
        _creditRecordMapping[_approvedBorrower].state = BS.CreditState.Deleted;
        emit CreditLineClosed(
          _approvedBorrower,
          msg.sender,
          CreditLineClosureReason.CreditLimitChangedToBeZero
        );
      }
      _creditRecordMapping[_approvedBorrower].remainingPeriods = 0;
    }
    emit CreditLineChanged(_approvedBorrower, oldCreditLimit, newCreditLimit);
  }

  /**
  * @notice allows the borrower to borrow against an approved credit line.
  * The borrower can borrow and pay back as many times as they would like.
  * @param borrowAmount the amount to borrow
   */
  function drawdown(uint256 borrowAmount) external virtual override {
    console.log('drawing down');
    console.log('borrowAmount', borrowAmount);
    address borrower = msg.sender;
    // Open access to the borrower
    if (borrowAmount == 0) revert Errors.zeroAmountProvided();
    BS.CreditRecord memory cr = _getCreditRecord(_approvedBorrower);

  _checkDrawdownEligibility( cr, borrowAmount);
  uint256 netAmountToBorrower = _drawdown(cr, borrowAmount);
  emit DrawdownMade(_approvedBorrower, borrowAmount, netAmountToBorrower);
}

/**
* @notice The expiration (maturity) date of a credit line has been extended.
* @param numOfPeriods the number of pay periods to be extended
 */
function extendCreditLineDuration(uint256 numOfPeriods)
  external
  virtual
  override
{
  onlyEAServiceAccount();
  // Although it is not essential to call _updateDueInfo() to extend the credit line duration
  // it is good practice to bring the account current while we update one of the fields.
  // Also, only if we call _updateDueInfo(), we can write proper tests.
  _updateDueInfo(false, true);
  _creditRecordMapping[_approvedBorrower].remainingPeriods += uint16(numOfPeriods);
  emit CreditLineExtended(
      _approvedBorrower,
      numOfPeriods,
      _creditRecordMapping[_approvedBorrower].remainingPeriods,
      msg.sender
      );
}

/**
* @notice Makes one payment for the borrower. This can be initiated by the borrower
* or by PDSServiceAccount with the allowance approval from the borrower.
  * If this is the final payment, it automatically triggers the payoff process.
    * @return amountPaid the actual amount paid to the contract. When the tendered
  * amount is larger than the payoff amount, the contract only accepts the payoff amount.
    * @return paidoff a flag indicating whether the account has been paid off.
    * @notice Warning, payments should be made by calling this function
  * No token should be transferred directly to the contract
  */
function makePayment(uint256 amount)
public
virtual
override
returns (uint256 amountPaid, bool paidoff)
{
  if (msg.sender != _approvedBorrower) onlyPDSServiceAccount();

  (amountPaid, paidoff, ) = _makePayment( amount, BS.PaymentStatus.NotReceived);
}

/**
* @notice Updates the account and brings its billing status current
* @dev If the account is defaulted, no need to update the account anymore.
  * @dev If the account is ready to be defaulted but not yet, update the account without
* distributing the income for the upcoming period. Otherwise, update and distribute income
  * note the reason that we do not distribute income for the final cycle anymore since
    * it does not make sense to distribute income that we know cannot be collected to the
* administrators (e.g. protocol, pool owner and EA) since it will only add more losses
* to the LPs. Unfortunately, this special business consideration added more complexity
* and cognitive load to _updateDueInfo(...).
  */
function refreshAccount()
external
virtual
override
returns (BS.CreditRecord memory cr)
{
  if (_creditRecordMapping[_approvedBorrower].state != BS.CreditState.Defaulted) {
    if (isDefaultReady()) return _updateDueInfo( false, false);
    else return _updateDueInfo( false, true);
  }
}

/**
* @notice accepts a credit request from msg.sender
* @param creditLimit the credit line (number of pool token)
* @param intervalInDays duration of a payment cycle, typically 30 days
* @param numOfPayments number of cycles for the credit line to be valid.
    */
   /*
function requestCredit(
  uint256 creditLimit,
uint256 intervalInDays,
uint256 numOfPayments
) external virtual override {
  // Open access to the borrower. Data validation happens in _initiateCredit()
  _initiateCredit(
    creditLimit,
    _poolConfig.poolAprInBps(),
    intervalInDays,
    numOfPayments,
    false
  );
}
*/
/**
 * @notice initiation of a credit line
 * @param creditLimit the amount of the liquidity asset that the borrower obtains
 */
/**
* @notice Triggers the default process
* @return losses the amount of remaining losses to the pool
* @dev It is possible for the borrower to payback even after default, especially in
* receivable factoring cases.
 */
function triggerDefault() external virtual override returns (uint256 losses) {
  _protocolAndPoolOn();

// check to make sure the default grace period has passed.
BS.CreditRecord memory cr = _getCreditRecord(_approvedBorrower);

if (cr.state == BS.CreditState.Defaulted) revert Errors.defaultHasAlreadyBeenTriggered();

if (block.timestamp > cr.dueDate) {
  cr = _updateDueInfo( false, false);
}

// Check if grace period has exceeded. Please note it takes a full pay period
// before the account is considered to be late. The time passed should be one pay period
// plus the grace period.
if (!isDefaultReady()) revert Errors.defaultTriggeredTooEarly();

// default amount includes all outstanding principals
losses = cr.unbilledPrincipal + cr.totalDue - cr.feesAndInterestDue;

_creditRecordMapping[_approvedBorrower].state = BS.CreditState.Defaulted;

_creditRecordStaticMapping[_approvedBorrower].defaultAmount = uint96(losses);

distributeLosses(losses);

emit DefaultTriggered(_approvedBorrower, losses, msg.sender);

return losses;
    }

    function creditRecordMapping(address account) external view returns (BS.CreditRecord memory) {
      return _creditRecordMapping[account];
    }

    function creditRecordStaticMapping(address account)
    external
    view
    returns (BS.CreditRecordStatic memory)
    {
      return _creditRecordStaticMapping[account];
    }

    function isApproved(address check) external view virtual override returns (bool) {
      if ((_creditRecordMapping[check].state >= BS.CreditState.Approved)) return true;
      else return false;
    }

    /**
    * @notice checks if the credit line is ready to be triggered as defaulted
    */
    function isDefaultReady() public view virtual override returns (bool) {
      uint16 intervalInDays = _creditRecordStaticMapping[_approvedBorrower].intervalInDays;
      return
      _creditRecordMapping[_approvedBorrower].missedPeriods * intervalInDays * SECONDS_IN_A_DAY >
      _poolConfig.poolDefaultGracePeriodInSeconds()
        ? true
        : false;
    }

    /** 
    * @notice checks if the credit line is behind in payments
    * @dev When the account is in Approved state, there is no borrowing yet, thus being late
    * does not apply. Thus the check on account state. 
      * @dev after the bill is refreshed, the due date is updated, it is possible that the new due 
    // date is in the future, but if the bill refresh has set missedPeriods, the account is late.
    */
    function isLate() external view virtual override returns (bool) {
      return
      (_creditRecordMapping[_approvedBorrower].state > BS.CreditState.Approved &&
       (_creditRecordMapping[_approvedBorrower].missedPeriods > 0 ||
        block.timestamp > _creditRecordMapping[_approvedBorrower].dueDate))
          ? true
          : false;
    }

    function _approveCredit(BS.CreditRecord memory cr)
    internal
    view
    returns (BS.CreditRecord memory)
    {
      if (cr.state > BS.CreditState.Approved) revert Errors.creditLineOutstanding();

      // Note: Special logic. dueDate is normally used to track the next bill due.
      // Before the first drawdown, it is also used to set the deadline for the first
      // drawdown to happen, otherwise, the credit line expires.
      // Decided to use this field in this way to save one field for the struct.
      // Although we have room in the struct after split struct creditRecord and
      // struct creditRecordStatic, we keep it unchanged to leave room for the struct
      // to expand in the future (note Solidity has limit on 13 fields in a struct)
      uint256 validPeriod = _poolConfig.creditApprovalExpirationInSeconds();
      if (validPeriod > 0) cr.dueDate = uint64(block.timestamp + validPeriod);

      cr.state = BS.CreditState.Approved;

      return cr;
    }

    /**
    * @notice Checks if drawdown is allowed for the credit line at this point of time
    * @dev the requester can be the borrower or the EA
    * @dev requires the credit line to be in Approved (first drawdown) or
    * Good Standing (return drawdown) state.
    * @dev for first drawdown, after the credit line is approved, it needs to happen within
    * the expiration window configured by the pool
    * @dev the drawdown should not put the account over the approved credit limit
    * @dev Please note cr.dueDate is the credit expiration date for the first drawdown.
     */
    function _checkDrawdownEligibility(
      BS.CreditRecord memory cr,
      uint256 borrowAmount
    ) internal  {
      _protocolAndPoolOn();

      if (cr.state != BS.CreditState.GoodStanding && cr.state != BS.CreditState.Approved)
        revert Errors.creditLineNotInStateForDrawdown();
      else if (cr.state == BS.CreditState.Approved) {
        // After the credit approval, if the pool has credit expiration for the 1st drawdown,
        // the borrower must complete the first drawdown before the expiration date, which
        // is set in cr.dueDate in approveCredit().
        // note For pools without credit expiration for first drawdown, cr.dueDate is 0
        // before the first drawdown, thus the cr.dueDate > 0 condition in the check
        if (cr.dueDate > 0 && block.timestamp > cr.dueDate)
          revert Errors.creditExpiredDueToFirstDrawdownTooLate();
        console.log('creditLimit', _creditRecordStaticMapping[_approvedBorrower].creditLimit);
        /*
        if (borrowAmount > _creditRecordStaticMapping[_approvedBorrower].creditLimit)
          revert Errors.creditLineExceeded();
         */

        _updateBorrowSchedule(borrowAmount);
      }
    }

    function _updateBorrowSchedule(
      uint256 borrowAmount
    ) internal {
      if (block.timestamp > _endDate) {
        uint256 elapsedSeconds = block.timestamp - _startDate;
        uint256 periodsElapsed = elapsedSeconds / _maxWithdrawPeriodLength;
        console.log(_totalWithdrawn+borrowAmount);
        console.log(periodsElapsed * _maxWithdrawAmountPerPeriod);
        /*
        if (_totalWithdrawn+borrowAmount > (periodsElapsed + 1) * _maxWithdrawAmountPerPeriod) {
          revert Errors.creditInPeriodExceeded();
        }
       */
      }
    }

    /**
    * @notice helper function for drawdown
    * @param borrowAmount the amount to borrow
    */
    function _drawdown(
      BS.CreditRecord memory cr,
      uint256 borrowAmount
    ) internal virtual returns (uint256) {
      console.log('borrowAmount', borrowAmount);
      if (cr.state == BS.CreditState.Approved) {
        // Flow for first drawdown
        // Update total principal
        _creditRecordMapping[_approvedBorrower].unbilledPrincipal = uint96(borrowAmount);

        // Generates the first bill
        // Note: the interest is calculated at the beginning of each pay period
        cr = _updateDueInfo( true, true);

        // Set account status in good standing
        cr.state = BS.CreditState.GoodStanding;
      } else {
        // Return drawdown flow
        // Bring the account current.
        if (block.timestamp > cr.dueDate) {
          cr = _updateDueInfo(false, true);
          if (cr.state != BS.CreditState.GoodStanding)
            revert Errors.creditLineNotInGoodStandingState();
        }

        if (
          borrowAmount >
            (_creditRecordStaticMapping[_approvedBorrower].creditLimit -
             cr.unbilledPrincipal -
           (cr.totalDue - cr.feesAndInterestDue))
        ) revert Errors.creditLineExceeded();

        // note Drawdown is not allowed in the final pay period since the payment due for
        // such drawdown will fall outside of the window of the credit line.
        // note since we bill at the beginning of a period, cr.remainingPeriods is zero
        // in the final period.
        if (cr.remainingPeriods == 0) revert Errors.creditExpiredDueToMaturity();



        // For non-first bill, we do not update the current bill, the interest for the rest of
        // this pay period is accrued in correction and will be added to the next bill.
        cr.correction += int96(
          uint96(
            _calcCorrection(
              cr.dueDate,
              _creditRecordStaticMapping[_approvedBorrower].aprInBps,
              borrowAmount
            )
          )
        );

        cr.unbilledPrincipal = uint96(cr.unbilledPrincipal + borrowAmount);
      }

      _setCreditRecord(_approvedBorrower, cr);

      (uint256 netAmountToBorrower, uint256 platformFees) = _feeManager.distBorrowingAmount(
        borrowAmount
      );

      if (platformFees > 0) distributeIncome(platformFees);

      // Transfer funds to the _borrower

      console.log('borrowAmount', borrowAmount);
      console.log('newAmountToBorrow', netAmountToBorrower);
      _underlyingToken.safeTransfer(_approvedBorrower, netAmountToBorrower);
      _totalWithdrawn += borrowAmount;
      return netAmountToBorrower;
    }


    /**
     * @notice initiation of a credit line
     * @param creditLimit the amount of the liquidity asset that the borrower obtains
     */
    function _initiateCredit(
      uint256 creditLimit,
      uint256 aprInBps,
      uint256 intervalInDays,
      uint256 remainingPeriods,
      bool preApproved
    ) internal virtual {
      if (remainingPeriods == 0) revert Errors.requestedCreditWithZeroDuration();

      _protocolAndPoolOn();
      // Borrowers cannot have two credit lines in one pool. They can request to increase line.
      BS.CreditRecord memory cr = _getCreditRecord(_approvedBorrower);

      if (cr.state != BS.CreditState.Deleted) {
        // If the user has an existing line, but there is no balance, close the old one
        // and initiate the new one automatically.
        cr = _updateDueInfo( false, true);
        if (cr.totalDue == 0 && cr.unbilledPrincipal == 0) {
          cr.state = BS.CreditState.Deleted;
          cr.remainingPeriods = 0;
          emit CreditLineClosed(
            _approvedBorrower,
            msg.sender,
            CreditLineClosureReason.OverwrittenByNewLine
          );
        } else {
          revert Errors.creditLineAlreadyExists();
        }
      }

      // Borrowing amount needs to be lower than max for the pool.
      _maxCreditLineCheck(creditLimit);

      _creditRecordStaticMapping[_approvedBorrower] = BS.CreditRecordStatic({
        creditLimit: uint96(creditLimit),
        aprInBps: uint16(aprInBps),
        intervalInDays: uint16(intervalInDays),
        defaultAmount: uint96(0)
      });

      BS.CreditRecord memory ncr;
      ncr.remainingPeriods = uint16(remainingPeriods);

      if (preApproved) {
        ncr = _approveCredit(ncr);

      emit CreditApproved(
        _approvedBorrower,
        _endDate,
        intervalInDays,
        remainingPeriods,
        aprInBps
      );
      } else ncr.state = BS.CreditState.Requested;

      _setCreditRecord(_approvedBorrower, ncr);

      emit CreditInitiated(
        _approvedBorrower,
        creditLimit,
        aprInBps,
        intervalInDays,
        remainingPeriods,
        preApproved
      );
    }

    /**
    * @notice Borrower makes one payment. If this is the final payment,
    * it automatically triggers the payoff process.
    * @param amount the payment amount
    * @param paymentStatus a flag that indicates the status the payment.
      * Ideally, two boolean parameters (isPaymentReceived, isPaymentVerified) are used
    * instead of paymentStatus. Due to stack too deep issue, one parameter is used.
      * NotReceived: Payment not received
    * ReceivedNotVerified: the system thinks the payment has been received but no manual
    * verification yet. Outlier cases might be flagged for manual review.
        * ReceivedAndVerified: the system thinks the payment has been received and it has been
      * manually verified after being flagged by the system.
      * @return amountPaid the actual amount paid to the contract. When the tendered
    * amount is larger than the payoff amount, the contract only accepts the payoff amount.
      * @return paidoff a flag indciating whether the account has been paid off.
      * @return isReviewRequired a flag indicating whether this payment transaction has been
    * flagged for review.
        */
    function _makePayment(
      uint256 amount,
    BS.PaymentStatus paymentStatus
    )
    internal
    returns (
      uint256 amountPaid,
      bool paidoff,
      bool isReviewRequired
    )
    {
      _protocolAndPoolOn();

      if (amount == 0) revert Errors.zeroAmountProvided();
      console.log('1');
      BS.CreditRecord memory cr = _getCreditRecord(_approvedBorrower);

      console.log('2');
      if (
        cr.state == BS.CreditState.Requested ||
          cr.state == BS.CreditState.Approved ||
            cr.state == BS.CreditState.Deleted
      ) {
        if (paymentStatus == BS.PaymentStatus.NotReceived)
          revert Errors.creditLineNotInStateForMakingPayment();
        else if (paymentStatus == BS.PaymentStatus.ReceivedNotVerified)
          return (0, false, true);
      }

      if (block.timestamp > cr.dueDate) {
        // Bring the account current. This is necessary since the account might have been dormant for
        // several cycles.
        console.log('2.5');
        cr = _updateDueInfo(false, true);
      }

      // Computes the final payoff amount. Needs to consider the correction associated with
      // all outstanding principals.
      uint256 payoffCorrection = _calcCorrection(
        cr.dueDate,
        _creditRecordStaticMapping[_approvedBorrower].aprInBps,
        cr.unbilledPrincipal + cr.totalDue - cr.feesAndInterestDue
      );

      console.log('3');
      uint256 payoffAmount = uint256(
        int256(int96(cr.totalDue + cr.unbilledPrincipal)) + int256(cr.correction)
      ) - payoffCorrection;

      // If the reported received payment amount is far higher than the invoice amount,
      // flags the transaction for review.
      if (paymentStatus == BS.PaymentStatus.ReceivedNotVerified) {
        // Check against in-memory payoff amount first is purely for gas consideration.
        // We expect near 100% of the payments to fail in the first check
        if (amount > REVIEW_MULTIPLIER * payoffAmount) {
          if (
            amount >
              REVIEW_MULTIPLIER * uint256(_getCreditRecordStatic(_approvedBorrower).creditLimit)
          ) return (0, false, true);
        }
      }
      console.log('4');
      // The amount to be collected from the borrower. When _amount is more than what is needed
      // for payoff, only the payoff amount will be transferred
      uint256 amountToCollect;

      // The amount to be applied towards principal
      uint256 principalPayment = 0;

      if (amount < payoffAmount) {
        if (amount < cr.totalDue) {
          amountToCollect = amount;
          cr.totalDue = uint96(cr.totalDue - amount);

          if (amount <= cr.feesAndInterestDue) {
            cr.feesAndInterestDue = uint96(cr.feesAndInterestDue - amount);
          } else {
            principalPayment = amount - cr.feesAndInterestDue;
            cr.feesAndInterestDue = 0;
          }
        } else {
          amountToCollect = amount;

          // Apply extra payments towards principal, reduce unbilledPrincipal amount
          cr.unbilledPrincipal -= uint96(amount - cr.totalDue);

          principalPayment = amount - cr.feesAndInterestDue;
          cr.totalDue = 0;
          cr.feesAndInterestDue = 0;
          cr.missedPeriods = 0;

          // Moves account to GoodStanding if it was delayed.
          if (cr.state == BS.CreditState.Delayed) cr.state = BS.CreditState.GoodStanding;
        }

      console.log('5');
        // Gets the correction.
        if (principalPayment > 0) {
          // If there is principal payment, calculate new correction
          cr.correction -= int96(
            uint96(
              _calcCorrection(
                cr.dueDate,
                _creditRecordStaticMapping[_approvedBorrower].aprInBps,
                principalPayment
          )
          )
          );
        }

        // Recovers funds to the pool if the account is Defaulted.
        // Only moves it to GoodStanding only after payoff, handled in the payoff branch
        if (cr.state == BS.CreditState.Defaulted)
          _recoverDefaultedAmount(amountToCollect);
      } else {
        // Payoff logic
        principalPayment = cr.unbilledPrincipal + cr.totalDue - cr.feesAndInterestDue;
        amountToCollect = payoffAmount;

        if (cr.state == BS.CreditState.Defaulted) {
          _recoverDefaultedAmount( amountToCollect);
        } else {
          // Distribut or reverse income to consume outstanding correction.
          // Positive correction is generated because of a drawdown within this period.
          // It is not booked or distributed yet, needs to be distributed.
          // Negative correction is generated because of a payment including principal
          // within this period. The extra interest paid is not accounted for yet, thus
          // a reversal.
          // Note: For defaulted account, we do not distribute fees and interests
          // until they are paid. It is handled in _recoverDefaultedAmount().
          cr.correction = cr.correction - int96(int256(payoffCorrection));
          if (cr.correction > 0) distributeIncome(uint256(uint96(cr.correction)));
          else if (cr.correction < 0) reverseIncome(uint256(uint96(0 - cr.correction)));
        }

        cr.correction = 0;
        cr.unbilledPrincipal = 0;
        cr.feesAndInterestDue = 0;
        cr.totalDue = 0;
        cr.missedPeriods = 0;

        // Closes the credit line if it is in the final period
        if (cr.remainingPeriods == 0) {
          cr.state = BS.CreditState.Deleted;
          emit CreditLineClosed(_approvedBorrower, msg.sender, CreditLineClosureReason.Paidoff);
        } else cr.state = BS.CreditState.GoodStanding;
      }

      _setCreditRecord(_approvedBorrower, cr);

      if (amountToCollect > 0 && paymentStatus == BS.PaymentStatus.NotReceived) {
        // Transfer assets from the _borrower to pool locker
        _underlyingToken.safeTransferFrom(_approvedBorrower, address(this), amountToCollect);
        emit PaymentMade(
          _approvedBorrower,
          amountToCollect,
          cr.totalDue,
          cr.unbilledPrincipal,
          msg.sender
        );
      }

      // amountToCollect == payoffAmount indicates whether it is paid off or not.
      // Use >= as a safe practice
      return (amountToCollect, amountToCollect >= payoffAmount, false);
    }


    /**
    * @notice Recovers amount when a payment is paid towards a defaulted account.
    * @dev For any payment after a default, it is applied towards principal losses first.
      * Only after the principal is fully recovered, it is applied towards fees & interest.
      */
    function _recoverDefaultedAmount(uint256 amountToCollect) internal {
      uint96 _defaultAmount = _creditRecordStaticMapping[_approvedBorrower].defaultAmount;

      if (_defaultAmount > 0) {
        uint256 recoveredPrincipal;
        if (_defaultAmount >= amountToCollect) {
          recoveredPrincipal = amountToCollect;
        } else {
          recoveredPrincipal = _defaultAmount;
          distributeIncome(amountToCollect - recoveredPrincipal);
        }
        _totalPoolValue += recoveredPrincipal;
        _defaultAmount -= uint96(recoveredPrincipal);
        _creditRecordStaticMapping[_approvedBorrower].defaultAmount = _defaultAmount;
      } else {
        // note The account is moved out of Defaulted state only if the entire due
        // including principals, fees&Interest are paid off. It is possible for
        // the account to owe fees&Interest after _defaultAmount becomes zero.
        distributeIncome(amountToCollect);
      }
    }

    /// Checks if the given amount is higher than what is allowed by the pool
    function _maxCreditLineCheck(uint256 amount) internal view {
      if (amount > _poolConfig.maxCreditLine()) {
        revert Errors.greaterThanMaxCreditLine();
      }
    }

    /**
    * @notice updates CreditRecord for `_borrower` using the most up to date information.
    * @dev this is used in both makePayment() and drawdown() to bring the account current
    * @dev getDueInfo() gets the due information of the most current cycle. This function
    * updates the record in creditRecordMapping for `_borrower`
    * @param isFirstDrawdown whether this request is for the first drawdown of the credit line
      * @param distributeChargesForLastCycle whether to distribute income to different parties
    * (protocol, poolOwner, EA, and the pool). A `false` value is used in special cases
    * like `default` when we do not pause the accrue and distribution of fees.
      */
    function _updateDueInfo(
      bool isFirstDrawdown,
      bool distributeChargesForLastCycle
    ) internal virtual returns (BS.CreditRecord memory cr) {
      cr = _getCreditRecord(_approvedBorrower);
      if (isFirstDrawdown) cr.dueDate = 0;
      bool alreadyLate = cr.totalDue > 0 ? true : false;

      // Gets the up-to-date due information for the borrower. If the account has been
      // late or dormant for multiple cycles, getDueInfo() will bring it current and
      // return the most up-to-date due information.
      uint256 periodsPassed = 0;
      int96 newCharges;
      (
        periodsPassed,
        cr.feesAndInterestDue,
        cr.totalDue,
        cr.unbilledPrincipal,
        newCharges
      ) = _feeManager.getDueInfo(cr, _getCreditRecordStatic(_approvedBorrower));

      if (periodsPassed > 0) {
        cr.correction = 0;
        // Distribute income
        if (cr.state != BS.CreditState.Defaulted) {
          if (!distributeChargesForLastCycle)
            newCharges = newCharges - int96(cr.feesAndInterestDue);

          if (newCharges > 0) distributeIncome(uint256(uint96(newCharges)));
          else if (newCharges < 0) reverseIncome(uint256(uint96(0 - newCharges)));
        }

        uint16 intervalInDays = _creditRecordStaticMapping[_approvedBorrower].intervalInDays;
        if (cr.dueDate > 0)
          cr.dueDate = uint64(
            cr.dueDate + periodsPassed * intervalInDays * SECONDS_IN_A_DAY
          );
          else cr.dueDate = uint64(block.timestamp + intervalInDays * SECONDS_IN_A_DAY);

          // Adjusts remainingPeriods, special handling when reached the maturity of the credit line
          if (cr.remainingPeriods > periodsPassed) {
            cr.remainingPeriods = uint16(cr.remainingPeriods - periodsPassed);
          } else {
            cr.remainingPeriods = 0;
          }

          // Sets the right missedPeriods and state for the credit record
          if (alreadyLate) cr.missedPeriods = uint16(cr.missedPeriods + periodsPassed);
          else cr.missedPeriods = 0;

          if (cr.missedPeriods > 0) {
            if (cr.state != BS.CreditState.Defaulted) cr.state = BS.CreditState.Delayed;
          } else cr.state = BS.CreditState.GoodStanding;

          _setCreditRecord(_approvedBorrower, cr);

          emit BillRefreshed(_approvedBorrower, cr.dueDate, msg.sender);
      }
    }

    /// Shared setter to the credit record mapping for contract size consideration
    function _setCreditRecord(address borrower, BS.CreditRecord memory cr) internal {
      _creditRecordMapping[_approvedBorrower] = cr;
    }

    /// Shared accessor for contract size consideration
    function _calcCorrection(
      uint256 dueDate,
      uint256 aprInBps,
      uint256 amount
    ) internal view returns (uint256) {
      return _feeManager.calcCorrection(dueDate, aprInBps, amount);
    }

    /// Shared accessor to the credit record mapping for contract size consideration
    function _getCreditRecord(address account) internal view returns (BS.CreditRecord memory) {
      return _creditRecordMapping[account];
    }

    /// Shared accessor to the credit record static mapping for contract size consideration
    function _getCreditRecordStatic(address account)
    internal
    view
    returns (BS.CreditRecordStatic memory)
    {
      return _creditRecordStaticMapping[account];
    }

    /// "Modifier" function that limits access to pdsServiceAccount only.
    function onlyPDSServiceAccount() internal view {
      if (msg.sender != HumaConfig(_humaConfig).pdsServiceAccount())
        revert Errors.paymentDetectionServiceAccountRequired();
    }

    /// "Modifier" function that limits access to eaServiceAccount only
    function onlyEAServiceAccount() internal view {
      if (msg.sender != _humaConfig.eaServiceAccount())
        revert Errors.evaluationAgentServiceAccountRequired();
    }
    function getWithdrawSchedule()
      public view returns (uint256,uint256,uint256,uint256) {
        return ( _maxWithdrawPeriodLength,
         _maxWithdrawAmountPerPeriod,
         _startDate,
         _endDate
        );
    }
}
