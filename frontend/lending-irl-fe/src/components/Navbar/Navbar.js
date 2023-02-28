import React, { Component } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">Lending IRL</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/lend">Lend</Link>
          </li>
          <li>
            <Link to="/borrow">Borrow</Link>
          </li>
          <li>
            <a>Connect Wallet</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
