// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package ens

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// ENSMetaData contains all meta data concerning the ENS contract.
var ENSMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"contractENS\",\"name\":\"_old\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"ApprovalForAll\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"label\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"NewOwner\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"resolver\",\"type\":\"address\"}],\"name\":\"NewResolver\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"uint64\",\"name\":\"ttl\",\"type\":\"uint64\"}],\"name\":\"NewTTL\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"}],\"name\":\"isApprovedForAll\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"old\",\"outputs\":[{\"internalType\":\"contractENS\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"}],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"}],\"name\":\"recordExists\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"}],\"name\":\"resolver\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"operator\",\"type\":\"address\"},{\"internalType\":\"bool\",\"name\":\"approved\",\"type\":\"bool\"}],\"name\":\"setApprovalForAll\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"setOwner\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"resolver\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"ttl\",\"type\":\"uint64\"}],\"name\":\"setRecord\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"resolver\",\"type\":\"address\"}],\"name\":\"setResolver\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"label\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"}],\"name\":\"setSubnodeOwner\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"label\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"resolver\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"ttl\",\"type\":\"uint64\"}],\"name\":\"setSubnodeRecord\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"},{\"internalType\":\"uint64\",\"name\":\"ttl\",\"type\":\"uint64\"}],\"name\":\"setTTL\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"node\",\"type\":\"bytes32\"}],\"name\":\"ttl\",\"outputs\":[{\"internalType\":\"uint64\",\"name\":\"\",\"type\":\"uint64\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
}

// ENSABI is the input ABI used to generate the binding from.
// Deprecated: Use ENSMetaData.ABI instead.
var ENSABI = ENSMetaData.ABI

// ENS is an auto generated Go binding around an Ethereum contract.
type ENS struct {
	ENSCaller     // Read-only binding to the contract
	ENSTransactor // Write-only binding to the contract
	ENSFilterer   // Log filterer for contract events
}

// ENSCaller is an auto generated read-only Go binding around an Ethereum contract.
type ENSCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ENSTransactor is an auto generated write-only Go binding around an Ethereum contract.
type ENSTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ENSFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type ENSFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ENSSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type ENSSession struct {
	Contract     *ENS              // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// ENSCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type ENSCallerSession struct {
	Contract *ENSCaller    // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// ENSTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type ENSTransactorSession struct {
	Contract     *ENSTransactor    // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// ENSRaw is an auto generated low-level Go binding around an Ethereum contract.
type ENSRaw struct {
	Contract *ENS // Generic contract binding to access the raw methods on
}

// ENSCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type ENSCallerRaw struct {
	Contract *ENSCaller // Generic read-only contract binding to access the raw methods on
}

// ENSTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type ENSTransactorRaw struct {
	Contract *ENSTransactor // Generic write-only contract binding to access the raw methods on
}

// NewENS creates a new instance of ENS, bound to a specific deployed contract.
func NewENS(address common.Address, backend bind.ContractBackend) (*ENS, error) {
	contract, err := bindENS(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &ENS{ENSCaller: ENSCaller{contract: contract}, ENSTransactor: ENSTransactor{contract: contract}, ENSFilterer: ENSFilterer{contract: contract}}, nil
}

// NewENSCaller creates a new read-only instance of ENS, bound to a specific deployed contract.
func NewENSCaller(address common.Address, caller bind.ContractCaller) (*ENSCaller, error) {
	contract, err := bindENS(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &ENSCaller{contract: contract}, nil
}

// NewENSTransactor creates a new write-only instance of ENS, bound to a specific deployed contract.
func NewENSTransactor(address common.Address, transactor bind.ContractTransactor) (*ENSTransactor, error) {
	contract, err := bindENS(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &ENSTransactor{contract: contract}, nil
}

// NewENSFilterer creates a new log filterer instance of ENS, bound to a specific deployed contract.
func NewENSFilterer(address common.Address, filterer bind.ContractFilterer) (*ENSFilterer, error) {
	contract, err := bindENS(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &ENSFilterer{contract: contract}, nil
}

// bindENS binds a generic wrapper to an already deployed contract.
func bindENS(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := ENSMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_ENS *ENSRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _ENS.Contract.ENSCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_ENS *ENSRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _ENS.Contract.ENSTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_ENS *ENSRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _ENS.Contract.ENSTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_ENS *ENSCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _ENS.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_ENS *ENSTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _ENS.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_ENS *ENSTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _ENS.Contract.contract.Transact(opts, method, params...)
}

// IsApprovedForAll is a free data retrieval call binding the contract method 0xe985e9c5.
//
// Solidity: function isApprovedForAll(address owner, address operator) view returns(bool)
func (_ENS *ENSCaller) IsApprovedForAll(opts *bind.CallOpts, owner common.Address, operator common.Address) (bool, error) {
	var out []interface{}
	err := _ENS.contract.Call(opts, &out, "isApprovedForAll", owner, operator)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsApprovedForAll is a free data retrieval call binding the contract method 0xe985e9c5.
//
// Solidity: function isApprovedForAll(address owner, address operator) view returns(bool)
func (_ENS *ENSSession) IsApprovedForAll(owner common.Address, operator common.Address) (bool, error) {
	return _ENS.Contract.IsApprovedForAll(&_ENS.CallOpts, owner, operator)
}

// IsApprovedForAll is a free data retrieval call binding the contract method 0xe985e9c5.
//
// Solidity: function isApprovedForAll(address owner, address operator) view returns(bool)
func (_ENS *ENSCallerSession) IsApprovedForAll(owner common.Address, operator common.Address) (bool, error) {
	return _ENS.Contract.IsApprovedForAll(&_ENS.CallOpts, owner, operator)
}

// Old is a free data retrieval call binding the contract method 0xb83f8663.
//
// Solidity: function old() view returns(address)
func (_ENS *ENSCaller) Old(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _ENS.contract.Call(opts, &out, "old")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Old is a free data retrieval call binding the contract method 0xb83f8663.
//
// Solidity: function old() view returns(address)
func (_ENS *ENSSession) Old() (common.Address, error) {
	return _ENS.Contract.Old(&_ENS.CallOpts)
}

// Old is a free data retrieval call binding the contract method 0xb83f8663.
//
// Solidity: function old() view returns(address)
func (_ENS *ENSCallerSession) Old() (common.Address, error) {
	return _ENS.Contract.Old(&_ENS.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x02571be3.
//
// Solidity: function owner(bytes32 node) view returns(address)
func (_ENS *ENSCaller) Owner(opts *bind.CallOpts, node [32]byte) (common.Address, error) {
	var out []interface{}
	err := _ENS.contract.Call(opts, &out, "owner", node)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Owner is a free data retrieval call binding the contract method 0x02571be3.
//
// Solidity: function owner(bytes32 node) view returns(address)
func (_ENS *ENSSession) Owner(node [32]byte) (common.Address, error) {
	return _ENS.Contract.Owner(&_ENS.CallOpts, node)
}

// Owner is a free data retrieval call binding the contract method 0x02571be3.
//
// Solidity: function owner(bytes32 node) view returns(address)
func (_ENS *ENSCallerSession) Owner(node [32]byte) (common.Address, error) {
	return _ENS.Contract.Owner(&_ENS.CallOpts, node)
}

// RecordExists is a free data retrieval call binding the contract method 0xf79fe538.
//
// Solidity: function recordExists(bytes32 node) view returns(bool)
func (_ENS *ENSCaller) RecordExists(opts *bind.CallOpts, node [32]byte) (bool, error) {
	var out []interface{}
	err := _ENS.contract.Call(opts, &out, "recordExists", node)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// RecordExists is a free data retrieval call binding the contract method 0xf79fe538.
//
// Solidity: function recordExists(bytes32 node) view returns(bool)
func (_ENS *ENSSession) RecordExists(node [32]byte) (bool, error) {
	return _ENS.Contract.RecordExists(&_ENS.CallOpts, node)
}

// RecordExists is a free data retrieval call binding the contract method 0xf79fe538.
//
// Solidity: function recordExists(bytes32 node) view returns(bool)
func (_ENS *ENSCallerSession) RecordExists(node [32]byte) (bool, error) {
	return _ENS.Contract.RecordExists(&_ENS.CallOpts, node)
}

// Resolver is a free data retrieval call binding the contract method 0x0178b8bf.
//
// Solidity: function resolver(bytes32 node) view returns(address)
func (_ENS *ENSCaller) Resolver(opts *bind.CallOpts, node [32]byte) (common.Address, error) {
	var out []interface{}
	err := _ENS.contract.Call(opts, &out, "resolver", node)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Resolver is a free data retrieval call binding the contract method 0x0178b8bf.
//
// Solidity: function resolver(bytes32 node) view returns(address)
func (_ENS *ENSSession) Resolver(node [32]byte) (common.Address, error) {
	return _ENS.Contract.Resolver(&_ENS.CallOpts, node)
}

// Resolver is a free data retrieval call binding the contract method 0x0178b8bf.
//
// Solidity: function resolver(bytes32 node) view returns(address)
func (_ENS *ENSCallerSession) Resolver(node [32]byte) (common.Address, error) {
	return _ENS.Contract.Resolver(&_ENS.CallOpts, node)
}

// Ttl is a free data retrieval call binding the contract method 0x16a25cbd.
//
// Solidity: function ttl(bytes32 node) view returns(uint64)
func (_ENS *ENSCaller) Ttl(opts *bind.CallOpts, node [32]byte) (uint64, error) {
	var out []interface{}
	err := _ENS.contract.Call(opts, &out, "ttl", node)

	if err != nil {
		return *new(uint64), err
	}

	out0 := *abi.ConvertType(out[0], new(uint64)).(*uint64)

	return out0, err

}

// Ttl is a free data retrieval call binding the contract method 0x16a25cbd.
//
// Solidity: function ttl(bytes32 node) view returns(uint64)
func (_ENS *ENSSession) Ttl(node [32]byte) (uint64, error) {
	return _ENS.Contract.Ttl(&_ENS.CallOpts, node)
}

// Ttl is a free data retrieval call binding the contract method 0x16a25cbd.
//
// Solidity: function ttl(bytes32 node) view returns(uint64)
func (_ENS *ENSCallerSession) Ttl(node [32]byte) (uint64, error) {
	return _ENS.Contract.Ttl(&_ENS.CallOpts, node)
}

// SetApprovalForAll is a paid mutator transaction binding the contract method 0xa22cb465.
//
// Solidity: function setApprovalForAll(address operator, bool approved) returns()
func (_ENS *ENSTransactor) SetApprovalForAll(opts *bind.TransactOpts, operator common.Address, approved bool) (*types.Transaction, error) {
	return _ENS.contract.Transact(opts, "setApprovalForAll", operator, approved)
}

// SetApprovalForAll is a paid mutator transaction binding the contract method 0xa22cb465.
//
// Solidity: function setApprovalForAll(address operator, bool approved) returns()
func (_ENS *ENSSession) SetApprovalForAll(operator common.Address, approved bool) (*types.Transaction, error) {
	return _ENS.Contract.SetApprovalForAll(&_ENS.TransactOpts, operator, approved)
}

// SetApprovalForAll is a paid mutator transaction binding the contract method 0xa22cb465.
//
// Solidity: function setApprovalForAll(address operator, bool approved) returns()
func (_ENS *ENSTransactorSession) SetApprovalForAll(operator common.Address, approved bool) (*types.Transaction, error) {
	return _ENS.Contract.SetApprovalForAll(&_ENS.TransactOpts, operator, approved)
}

// SetOwner is a paid mutator transaction binding the contract method 0x5b0fc9c3.
//
// Solidity: function setOwner(bytes32 node, address owner) returns()
func (_ENS *ENSTransactor) SetOwner(opts *bind.TransactOpts, node [32]byte, owner common.Address) (*types.Transaction, error) {
	return _ENS.contract.Transact(opts, "setOwner", node, owner)
}

// SetOwner is a paid mutator transaction binding the contract method 0x5b0fc9c3.
//
// Solidity: function setOwner(bytes32 node, address owner) returns()
func (_ENS *ENSSession) SetOwner(node [32]byte, owner common.Address) (*types.Transaction, error) {
	return _ENS.Contract.SetOwner(&_ENS.TransactOpts, node, owner)
}

// SetOwner is a paid mutator transaction binding the contract method 0x5b0fc9c3.
//
// Solidity: function setOwner(bytes32 node, address owner) returns()
func (_ENS *ENSTransactorSession) SetOwner(node [32]byte, owner common.Address) (*types.Transaction, error) {
	return _ENS.Contract.SetOwner(&_ENS.TransactOpts, node, owner)
}

// SetRecord is a paid mutator transaction binding the contract method 0xcf408823.
//
// Solidity: function setRecord(bytes32 node, address owner, address resolver, uint64 ttl) returns()
func (_ENS *ENSTransactor) SetRecord(opts *bind.TransactOpts, node [32]byte, owner common.Address, resolver common.Address, ttl uint64) (*types.Transaction, error) {
	return _ENS.contract.Transact(opts, "setRecord", node, owner, resolver, ttl)
}

// SetRecord is a paid mutator transaction binding the contract method 0xcf408823.
//
// Solidity: function setRecord(bytes32 node, address owner, address resolver, uint64 ttl) returns()
func (_ENS *ENSSession) SetRecord(node [32]byte, owner common.Address, resolver common.Address, ttl uint64) (*types.Transaction, error) {
	return _ENS.Contract.SetRecord(&_ENS.TransactOpts, node, owner, resolver, ttl)
}

// SetRecord is a paid mutator transaction binding the contract method 0xcf408823.
//
// Solidity: function setRecord(bytes32 node, address owner, address resolver, uint64 ttl) returns()
func (_ENS *ENSTransactorSession) SetRecord(node [32]byte, owner common.Address, resolver common.Address, ttl uint64) (*types.Transaction, error) {
	return _ENS.Contract.SetRecord(&_ENS.TransactOpts, node, owner, resolver, ttl)
}

// SetResolver is a paid mutator transaction binding the contract method 0x1896f70a.
//
// Solidity: function setResolver(bytes32 node, address resolver) returns()
func (_ENS *ENSTransactor) SetResolver(opts *bind.TransactOpts, node [32]byte, resolver common.Address) (*types.Transaction, error) {
	return _ENS.contract.Transact(opts, "setResolver", node, resolver)
}

// SetResolver is a paid mutator transaction binding the contract method 0x1896f70a.
//
// Solidity: function setResolver(bytes32 node, address resolver) returns()
func (_ENS *ENSSession) SetResolver(node [32]byte, resolver common.Address) (*types.Transaction, error) {
	return _ENS.Contract.SetResolver(&_ENS.TransactOpts, node, resolver)
}

// SetResolver is a paid mutator transaction binding the contract method 0x1896f70a.
//
// Solidity: function setResolver(bytes32 node, address resolver) returns()
func (_ENS *ENSTransactorSession) SetResolver(node [32]byte, resolver common.Address) (*types.Transaction, error) {
	return _ENS.Contract.SetResolver(&_ENS.TransactOpts, node, resolver)
}

// SetSubnodeOwner is a paid mutator transaction binding the contract method 0x06ab5923.
//
// Solidity: function setSubnodeOwner(bytes32 node, bytes32 label, address owner) returns(bytes32)
func (_ENS *ENSTransactor) SetSubnodeOwner(opts *bind.TransactOpts, node [32]byte, label [32]byte, owner common.Address) (*types.Transaction, error) {
	return _ENS.contract.Transact(opts, "setSubnodeOwner", node, label, owner)
}

// SetSubnodeOwner is a paid mutator transaction binding the contract method 0x06ab5923.
//
// Solidity: function setSubnodeOwner(bytes32 node, bytes32 label, address owner) returns(bytes32)
func (_ENS *ENSSession) SetSubnodeOwner(node [32]byte, label [32]byte, owner common.Address) (*types.Transaction, error) {
	return _ENS.Contract.SetSubnodeOwner(&_ENS.TransactOpts, node, label, owner)
}

// SetSubnodeOwner is a paid mutator transaction binding the contract method 0x06ab5923.
//
// Solidity: function setSubnodeOwner(bytes32 node, bytes32 label, address owner) returns(bytes32)
func (_ENS *ENSTransactorSession) SetSubnodeOwner(node [32]byte, label [32]byte, owner common.Address) (*types.Transaction, error) {
	return _ENS.Contract.SetSubnodeOwner(&_ENS.TransactOpts, node, label, owner)
}

// SetSubnodeRecord is a paid mutator transaction binding the contract method 0x5ef2c7f0.
//
// Solidity: function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) returns()
func (_ENS *ENSTransactor) SetSubnodeRecord(opts *bind.TransactOpts, node [32]byte, label [32]byte, owner common.Address, resolver common.Address, ttl uint64) (*types.Transaction, error) {
	return _ENS.contract.Transact(opts, "setSubnodeRecord", node, label, owner, resolver, ttl)
}

// SetSubnodeRecord is a paid mutator transaction binding the contract method 0x5ef2c7f0.
//
// Solidity: function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) returns()
func (_ENS *ENSSession) SetSubnodeRecord(node [32]byte, label [32]byte, owner common.Address, resolver common.Address, ttl uint64) (*types.Transaction, error) {
	return _ENS.Contract.SetSubnodeRecord(&_ENS.TransactOpts, node, label, owner, resolver, ttl)
}

// SetSubnodeRecord is a paid mutator transaction binding the contract method 0x5ef2c7f0.
//
// Solidity: function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) returns()
func (_ENS *ENSTransactorSession) SetSubnodeRecord(node [32]byte, label [32]byte, owner common.Address, resolver common.Address, ttl uint64) (*types.Transaction, error) {
	return _ENS.Contract.SetSubnodeRecord(&_ENS.TransactOpts, node, label, owner, resolver, ttl)
}

// SetTTL is a paid mutator transaction binding the contract method 0x14ab9038.
//
// Solidity: function setTTL(bytes32 node, uint64 ttl) returns()
func (_ENS *ENSTransactor) SetTTL(opts *bind.TransactOpts, node [32]byte, ttl uint64) (*types.Transaction, error) {
	return _ENS.contract.Transact(opts, "setTTL", node, ttl)
}

// SetTTL is a paid mutator transaction binding the contract method 0x14ab9038.
//
// Solidity: function setTTL(bytes32 node, uint64 ttl) returns()
func (_ENS *ENSSession) SetTTL(node [32]byte, ttl uint64) (*types.Transaction, error) {
	return _ENS.Contract.SetTTL(&_ENS.TransactOpts, node, ttl)
}

// SetTTL is a paid mutator transaction binding the contract method 0x14ab9038.
//
// Solidity: function setTTL(bytes32 node, uint64 ttl) returns()
func (_ENS *ENSTransactorSession) SetTTL(node [32]byte, ttl uint64) (*types.Transaction, error) {
	return _ENS.Contract.SetTTL(&_ENS.TransactOpts, node, ttl)
}

// ENSApprovalForAllIterator is returned from FilterApprovalForAll and is used to iterate over the raw logs and unpacked data for ApprovalForAll events raised by the ENS contract.
type ENSApprovalForAllIterator struct {
	Event *ENSApprovalForAll // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ENSApprovalForAllIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ENSApprovalForAll)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ENSApprovalForAll)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ENSApprovalForAllIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ENSApprovalForAllIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ENSApprovalForAll represents a ApprovalForAll event raised by the ENS contract.
type ENSApprovalForAll struct {
	Owner    common.Address
	Operator common.Address
	Approved bool
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterApprovalForAll is a free log retrieval operation binding the contract event 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31.
//
// Solidity: event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
func (_ENS *ENSFilterer) FilterApprovalForAll(opts *bind.FilterOpts, owner []common.Address, operator []common.Address) (*ENSApprovalForAllIterator, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}

	logs, sub, err := _ENS.contract.FilterLogs(opts, "ApprovalForAll", ownerRule, operatorRule)
	if err != nil {
		return nil, err
	}
	return &ENSApprovalForAllIterator{contract: _ENS.contract, event: "ApprovalForAll", logs: logs, sub: sub}, nil
}

// WatchApprovalForAll is a free log subscription operation binding the contract event 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31.
//
// Solidity: event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
func (_ENS *ENSFilterer) WatchApprovalForAll(opts *bind.WatchOpts, sink chan<- *ENSApprovalForAll, owner []common.Address, operator []common.Address) (event.Subscription, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var operatorRule []interface{}
	for _, operatorItem := range operator {
		operatorRule = append(operatorRule, operatorItem)
	}

	logs, sub, err := _ENS.contract.WatchLogs(opts, "ApprovalForAll", ownerRule, operatorRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ENSApprovalForAll)
				if err := _ENS.contract.UnpackLog(event, "ApprovalForAll", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseApprovalForAll is a log parse operation binding the contract event 0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31.
//
// Solidity: event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
func (_ENS *ENSFilterer) ParseApprovalForAll(log types.Log) (*ENSApprovalForAll, error) {
	event := new(ENSApprovalForAll)
	if err := _ENS.contract.UnpackLog(event, "ApprovalForAll", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ENSNewOwnerIterator is returned from FilterNewOwner and is used to iterate over the raw logs and unpacked data for NewOwner events raised by the ENS contract.
type ENSNewOwnerIterator struct {
	Event *ENSNewOwner // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ENSNewOwnerIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ENSNewOwner)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ENSNewOwner)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ENSNewOwnerIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ENSNewOwnerIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ENSNewOwner represents a NewOwner event raised by the ENS contract.
type ENSNewOwner struct {
	Node  [32]byte
	Label [32]byte
	Owner common.Address
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterNewOwner is a free log retrieval operation binding the contract event 0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82.
//
// Solidity: event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner)
func (_ENS *ENSFilterer) FilterNewOwner(opts *bind.FilterOpts, node [][32]byte, label [][32]byte) (*ENSNewOwnerIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}
	var labelRule []interface{}
	for _, labelItem := range label {
		labelRule = append(labelRule, labelItem)
	}

	logs, sub, err := _ENS.contract.FilterLogs(opts, "NewOwner", nodeRule, labelRule)
	if err != nil {
		return nil, err
	}
	return &ENSNewOwnerIterator{contract: _ENS.contract, event: "NewOwner", logs: logs, sub: sub}, nil
}

// WatchNewOwner is a free log subscription operation binding the contract event 0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82.
//
// Solidity: event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner)
func (_ENS *ENSFilterer) WatchNewOwner(opts *bind.WatchOpts, sink chan<- *ENSNewOwner, node [][32]byte, label [][32]byte) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}
	var labelRule []interface{}
	for _, labelItem := range label {
		labelRule = append(labelRule, labelItem)
	}

	logs, sub, err := _ENS.contract.WatchLogs(opts, "NewOwner", nodeRule, labelRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ENSNewOwner)
				if err := _ENS.contract.UnpackLog(event, "NewOwner", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseNewOwner is a log parse operation binding the contract event 0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82.
//
// Solidity: event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner)
func (_ENS *ENSFilterer) ParseNewOwner(log types.Log) (*ENSNewOwner, error) {
	event := new(ENSNewOwner)
	if err := _ENS.contract.UnpackLog(event, "NewOwner", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ENSNewResolverIterator is returned from FilterNewResolver and is used to iterate over the raw logs and unpacked data for NewResolver events raised by the ENS contract.
type ENSNewResolverIterator struct {
	Event *ENSNewResolver // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ENSNewResolverIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ENSNewResolver)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ENSNewResolver)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ENSNewResolverIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ENSNewResolverIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ENSNewResolver represents a NewResolver event raised by the ENS contract.
type ENSNewResolver struct {
	Node     [32]byte
	Resolver common.Address
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterNewResolver is a free log retrieval operation binding the contract event 0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0.
//
// Solidity: event NewResolver(bytes32 indexed node, address resolver)
func (_ENS *ENSFilterer) FilterNewResolver(opts *bind.FilterOpts, node [][32]byte) (*ENSNewResolverIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _ENS.contract.FilterLogs(opts, "NewResolver", nodeRule)
	if err != nil {
		return nil, err
	}
	return &ENSNewResolverIterator{contract: _ENS.contract, event: "NewResolver", logs: logs, sub: sub}, nil
}

// WatchNewResolver is a free log subscription operation binding the contract event 0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0.
//
// Solidity: event NewResolver(bytes32 indexed node, address resolver)
func (_ENS *ENSFilterer) WatchNewResolver(opts *bind.WatchOpts, sink chan<- *ENSNewResolver, node [][32]byte) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _ENS.contract.WatchLogs(opts, "NewResolver", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ENSNewResolver)
				if err := _ENS.contract.UnpackLog(event, "NewResolver", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseNewResolver is a log parse operation binding the contract event 0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0.
//
// Solidity: event NewResolver(bytes32 indexed node, address resolver)
func (_ENS *ENSFilterer) ParseNewResolver(log types.Log) (*ENSNewResolver, error) {
	event := new(ENSNewResolver)
	if err := _ENS.contract.UnpackLog(event, "NewResolver", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ENSNewTTLIterator is returned from FilterNewTTL and is used to iterate over the raw logs and unpacked data for NewTTL events raised by the ENS contract.
type ENSNewTTLIterator struct {
	Event *ENSNewTTL // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ENSNewTTLIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ENSNewTTL)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ENSNewTTL)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ENSNewTTLIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ENSNewTTLIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ENSNewTTL represents a NewTTL event raised by the ENS contract.
type ENSNewTTL struct {
	Node [32]byte
	Ttl  uint64
	Raw  types.Log // Blockchain specific contextual infos
}

// FilterNewTTL is a free log retrieval operation binding the contract event 0x1d4f9bbfc9cab89d66e1a1562f2233ccbf1308cb4f63de2ead5787adddb8fa68.
//
// Solidity: event NewTTL(bytes32 indexed node, uint64 ttl)
func (_ENS *ENSFilterer) FilterNewTTL(opts *bind.FilterOpts, node [][32]byte) (*ENSNewTTLIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _ENS.contract.FilterLogs(opts, "NewTTL", nodeRule)
	if err != nil {
		return nil, err
	}
	return &ENSNewTTLIterator{contract: _ENS.contract, event: "NewTTL", logs: logs, sub: sub}, nil
}

// WatchNewTTL is a free log subscription operation binding the contract event 0x1d4f9bbfc9cab89d66e1a1562f2233ccbf1308cb4f63de2ead5787adddb8fa68.
//
// Solidity: event NewTTL(bytes32 indexed node, uint64 ttl)
func (_ENS *ENSFilterer) WatchNewTTL(opts *bind.WatchOpts, sink chan<- *ENSNewTTL, node [][32]byte) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _ENS.contract.WatchLogs(opts, "NewTTL", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ENSNewTTL)
				if err := _ENS.contract.UnpackLog(event, "NewTTL", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseNewTTL is a log parse operation binding the contract event 0x1d4f9bbfc9cab89d66e1a1562f2233ccbf1308cb4f63de2ead5787adddb8fa68.
//
// Solidity: event NewTTL(bytes32 indexed node, uint64 ttl)
func (_ENS *ENSFilterer) ParseNewTTL(log types.Log) (*ENSNewTTL, error) {
	event := new(ENSNewTTL)
	if err := _ENS.contract.UnpackLog(event, "NewTTL", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ENSTransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the ENS contract.
type ENSTransferIterator struct {
	Event *ENSTransfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ENSTransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ENSTransfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ENSTransfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ENSTransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ENSTransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ENSTransfer represents a Transfer event raised by the ENS contract.
type ENSTransfer struct {
	Node  [32]byte
	Owner common.Address
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xd4735d920b0f87494915f556dd9b54c8f309026070caea5c737245152564d266.
//
// Solidity: event Transfer(bytes32 indexed node, address owner)
func (_ENS *ENSFilterer) FilterTransfer(opts *bind.FilterOpts, node [][32]byte) (*ENSTransferIterator, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _ENS.contract.FilterLogs(opts, "Transfer", nodeRule)
	if err != nil {
		return nil, err
	}
	return &ENSTransferIterator{contract: _ENS.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xd4735d920b0f87494915f556dd9b54c8f309026070caea5c737245152564d266.
//
// Solidity: event Transfer(bytes32 indexed node, address owner)
func (_ENS *ENSFilterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *ENSTransfer, node [][32]byte) (event.Subscription, error) {

	var nodeRule []interface{}
	for _, nodeItem := range node {
		nodeRule = append(nodeRule, nodeItem)
	}

	logs, sub, err := _ENS.contract.WatchLogs(opts, "Transfer", nodeRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ENSTransfer)
				if err := _ENS.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseTransfer is a log parse operation binding the contract event 0xd4735d920b0f87494915f556dd9b54c8f309026070caea5c737245152564d266.
//
// Solidity: event Transfer(bytes32 indexed node, address owner)
func (_ENS *ENSFilterer) ParseTransfer(log types.Log) (*ENSTransfer, error) {
	event := new(ENSTransfer)
	if err := _ENS.contract.UnpackLog(event, "Transfer", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
