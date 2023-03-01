import React, { Component, useRef, useEffect, useState } from "react";

import { Link } from "react-router-dom";
import "./Borrower.css";

function Borrower() {
  const [loanName, setLoanName] = useState("");
  const [address, setAddress] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("Minutes");
  const [length, setLength] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(loanName);
    console.log(address);
    console.log(reason);
    console.log(amount);
    console.log(term);
    console.log(length);
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
          <span>Address</span>
          <input
            type="text"
            placeholder="0xabc..."
            className="input input-bordered"
            onChange={(e) => setAddress(e.target.value)}
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

        <button className="btn btn-outline">random</button>
      </form>
    </div>
  );
}

export default Borrower;
