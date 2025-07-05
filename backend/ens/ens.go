package ens

import (
	"errors"
	"proto-dankmessaging/backend/dependencies"

	"github.com/ethereum/go-ethereum/accounts/keystore"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type ENSWrapper struct {
	dep     *dependencies.Dependencies
	client  *ethclient.Client
	key     *keystore.Key
	ensName string
	ens     *ENS
}

func NewENSWrapper(dep *dependencies.Dependencies) (*ENSWrapper, error) {
	client, err := ethclient.Dial(dep.Config.RpcUrl)
	if err != nil {
		return nil, errors.New("failed to dial Ethereum client: " + err.Error())
	}
	privateKey, err := crypto.HexToECDSA(dep.Config.PrivateKey)
	if err != nil {
		return nil, errors.New("failed to parse private key: " + err.Error())
	}
	key := &keystore.Key{
		Address:    crypto.PubkeyToAddress(privateKey.PublicKey),
		PrivateKey: privateKey,
	}
	ens, err := NewENS(common.HexToAddress("0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"), client)
	if err != nil {
		return nil, errors.New("failed to create ENS: " + err.Error())
	}
	return &ENSWrapper{
		dep:     dep,
		client:  client,
		key:     key,
		ensName: dep.Config.EnsName,
		ens:     ens,
	}, nil
}

func (e *ENSWrapper) RegisterENS(subdomain string, address string) error {
	return nil
}
