RPC_SEPOLIA="https://sepolia.drpc.org"
RPC=$(RPC_SEPOLIA)

include .env
export

# --rpc-url $(RPC)

none:

ensSub-deploy:
	forge script script/ENSSubdomainCreator.s.sol:Deploy --broadcast --fork-url $(RPC_SEPOLIA) --private-key $(PRIVATE_KEY) -vvvv --ffi
ensSub-verify:
	forge verify-contract \
	0x927fB1414F83905620F460B024bcFf2dD1dA430c \
	src/ENSSubdomainCreator.sol:ENSSubdomainCreator \
	-e $(ETHERSCAN_API_KEY) \
	--rpc-url $(RPC_SEPOLIA) \
	--guess-constructor-args \
	--chain sepolia \
	--watch
ensSub-addEventDomain:
	forge script script/ENSSubdomainCreator.s.sol:AddEventDomain --broadcast --fork-url $(RPC_SEPOLIA) --private-key $(PRIVATE_KEY) -vvvv --ffi
ensSub-addEventSubDomain:
	forge script script/ENSSubdomainCreator.s.sol:AddEventSubDomain asd 0x9F79941335e54A11eCD13cedf58375657FdA97A1 --sig 'run(string,address)' --broadcast --fork-url $(RPC_SEPOLIA) --private-key $(PRIVATE_KEY) -vvvv --ffi

