// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {L2Registrar} from "../src/L2Registrar.sol";

contract L2RegistrarTest is Test {
    L2Registrar l2Registrar;

    function setUp() public {
        l2Registrar = L2Registrar(0x1468386e6ABb1874c0d9fD43899EbD21A12470A6);
    }

    function test_GetName() public {
        address registry = address(l2Registrar.registry());
        console.log("Registry: %s", registry);
    }

}