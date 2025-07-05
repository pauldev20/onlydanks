RPC_WORLDSEPOLIA="https://worldchain-sepolia.g.alchemy.com/public"
RPC=$(RPC_WORLDSEPOLIA)

include .env
export

# --rpc-url $(RPC)

none:

deploy:
	forge script script/L2Registrar.s.sol:Deploy --broadcast --fork-url $(RPC) --private-key $(PRIVATE_KEY) -vvvv --ffi
verify:
	forge verify-contract \
	0x1468386e6ABb1874c0d9fD43899EbD21A12470A6 \
	src/L2Registrar.sol:L2Registrar \
	--rpc-url $(RPC) \
	--guess-constructor-args \
	--chain world-sepolia \
	--watch \
	-e $(ETHERSCAN_API_KEY)
testgetname:
	forge script script/L2Registrar.s.sol:TestGetName --broadcast --fork-url $(RPC) --private-key $(PRIVATE_KEY) -vvvv --ffi
test:
	forge test --fork-url ${RPC} -vvvv

.PHONY: deploy verify testgetname test