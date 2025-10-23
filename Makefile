.PHONY: help build-bpf build-sbpf-linker build test test-e2e clean deploy

help:
	@echo "Percolator v0 Build Targets"
	@echo ""
	@echo "  make build-bpf         - Build programs with standard Solana SDK"
	@echo "  make build-sbpf-linker - Build programs with sbpf-linker (nightly)"
	@echo "  make build             - Build all programs (native)"
	@echo "  make test              - Run unit tests"
	@echo "  make test-e2e          - Run E2E integration tests"
	@echo "  make clean             - Clean build artifacts"
	@echo "  make deploy            - Deploy programs to localnet"
	@echo ""

build-bpf:
	@echo "Building BPF programs (standard SDK)..."
	@cargo build-sbf

build-sbpf-linker:
	@echo "Building BPF programs (sbpf-linker + nightly)..."
	@./build-sbpf-linker.sh

build:
	@echo "Building native..."
	@cargo build --lib --all

test:
	@echo "Running unit tests..."
	@cargo test --lib

test-e2e:
	@echo "Running E2E integration tests..."
	@cargo test -p percolator-integration-tests

clean:
	@echo "Cleaning..."
	@cargo clean

deploy:
	@echo "Deploying to localnet..."
	@./scripts/deploy.sh
