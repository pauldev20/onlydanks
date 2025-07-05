// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {L2Registrar} from "../src/L2Registrar.sol";

contract Deploy is Script {
    L2Registrar public l2Registrar;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        l2Registrar = new L2Registrar(0x41Fb196Ae7D65E06880A240c8d1B91245Fb84807);

        vm.stopBroadcast();
    }
}


contract TestGetName is Script {
    L2Registrar public l2Registrar;

    function setUp() public {
        l2Registrar = new L2Registrar(0x1468386e6ABb1874c0d9fD43899EbD21A12470A6);
    }

    function run() public {
        // console.log("Registry: %s", address(l2Registrar.registry()));
        vm.startBroadcast();

        // l2Registrar.register("test", 0xDEAd83FA2254aaB3689D7d70c48500648F407B5C);

        vm.stopBroadcast();
    }
}
