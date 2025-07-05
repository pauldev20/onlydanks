// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {L2Registrar} from "../src/L2Registrar.sol";

contract L2RegistrarScript is Script {
    L2Registrar public l2Registrar;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        l2Registrar = new L2Registrar();

        vm.stopBroadcast();
    }
}
