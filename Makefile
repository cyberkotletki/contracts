bunABI:
	bun i
	bun hardhat compile
	mv ./artifacts/contracts/Donates.sol/Donates.json ./

npmABI:
	npm i
	npm hardhat compile
	mv ./artifacts/contracts/Donates.sol/Donates.json ./

