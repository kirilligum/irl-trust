import React, { Component, useRef, useEffect, useState } from "react";

import { Link } from "react-router-dom";
import "./Borrower.css";

function Borrower() {
  const [loanName, setLoanName] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("Minutes");
  const [length, setLength] = useState(0);

  const [addressList, setAddressList] = useState([{ address: "" }]);

  const handleAddressAdd = () => {
    setAddressList([...addressList, { address: "" }]);
  };

  const handleAddressRemove = (index) => {
    const list = [...addressList];
    list.splice(index, 1);
    setAddressList(list);
  };

  const handleAddressChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...addressList];
    list[index][name] = value;
    setAddressList(list);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(loanName);
    console.log(reason);
    console.log(amount);
    console.log(term);
    console.log(length);
    console.log(addressList);
  };

  return (
    <div>
      <h1>Borrow Request</h1>

      <form className="borrow-request-form" onSubmit={handleSubmit}>
        <label className="input-group form-item">
          <span>Name</span>
          <input
            type="text"
            placeholder="Unique loan name"
            className="input input-bordered"
            onChange={(e) => setLoanName(e.target.value)}
          />
        </label>

        <br />

        <label className="input-group form-item">
          <span>Loan Reason</span>
          <input
            type="text"
            placeholder="Sawing machine, etc."
            className="input input-bordered"
            onChange={(e) => setReason(e.target.value)}
          />
        </label>

        <br />

        <div className="form-control">
          <label className="input-group form-item">
            <span>Loan Amount</span>
            <input
              type="text"
              placeholder="10"
              className="input input-bordered"
              onChange={(e) => setAmount(e.target.value)}
            />
            <span>USDC</span>
          </label>
        </div>

        <h3>Payback information</h3>

        <div className="form-control">
          <div className="input-group form-item">
            <select
              onChange={(o) => setTerm(o.target.value)}
              className="select select-bordered"
            >
              <option disabled selected>
                Payback term
              </option>
              <option>Minutes</option>
              <option>Days</option>
              <option>Year</option>
            </select>
            <span>Term type</span>
          </div>
        </div>

        <br />

        <div className="form-control">
          <label className="input-group form-item">
            <span>Term Length</span>
            <input
              type="text"
              placeholder="10"
              className="input input-bordered"
              onChange={(e) => setLength(e.target.value)}
            />
            <span>USDC</span>
          </label>
        </div>

        <br />

        <label>Potential Lender(s)</label>
        {addressList.map((singleAddress, index) => (
          <div key={index} className="address">
            <div className="first-division">
              <input
                name="address"
                type="text"
                placeholder="0x000..."
                className="input input-bordered input-primary w-full max-w-xs"
                required
                value={singleAddress.address}
                onChange={(e) => handleAddressChange(e, index)}
              />
            </div>
            <div className="second-division">
              {addressList.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleAddressRemove(index)}
                >
                  <span>Remove</span>
                </button>
              )}
            </div>
            {addressList.length - 1 === index && (
              <button
                type="button"
                className="add-btn"
                onClick={handleAddressAdd}
              >
                <span>Add Lender</span>
              </button>
            )}
          </div>
        ))}

        <br />

        <button className="btn btn-outline">Submit</button>
      </form>
    </div>
  );
}

export default Borrower;
