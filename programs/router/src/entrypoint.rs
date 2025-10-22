//! Router program entrypoint

use pinocchio::{
    account_info::AccountInfo,
    msg,
    pubkey::Pubkey,
    ProgramResult,
};

use crate::instructions::RouterInstruction;
use crate::state::{Vault, Portfolio, SlabRegistry};
use percolator_common::*;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Check minimum instruction data length
    if instruction_data.is_empty() {
        msg!("Error: Instruction data is empty");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    // Parse instruction discriminator
    let discriminator = instruction_data[0];
    let instruction = match discriminator {
        0 => RouterInstruction::Initialize,
        1 => RouterInstruction::Deposit,
        2 => RouterInstruction::Withdraw,
        3 => RouterInstruction::MultiReserve,
        4 => RouterInstruction::MultiCommit,
        5 => RouterInstruction::Liquidate,
        _ => {
            msg!("Error: Unknown instruction");
            return Err(PercolatorError::InvalidInstruction.into());
        }
    };

    // Dispatch to instruction handler
    match instruction {
        RouterInstruction::Initialize => {
            msg!("Instruction: Initialize");
            handle_initialize(program_id, accounts, &instruction_data[1..])
        }
        RouterInstruction::Deposit => {
            msg!("Instruction: Deposit");
            handle_deposit(program_id, accounts, &instruction_data[1..])
        }
        RouterInstruction::Withdraw => {
            msg!("Instruction: Withdraw");
            handle_withdraw(program_id, accounts, &instruction_data[1..])
        }
        RouterInstruction::MultiReserve => {
            msg!("Instruction: MultiReserve");
            handle_multi_reserve(program_id, accounts, &instruction_data[1..])
        }
        RouterInstruction::MultiCommit => {
            msg!("Instruction: MultiCommit");
            handle_multi_commit(program_id, accounts, &instruction_data[1..])
        }
        RouterInstruction::Liquidate => {
            msg!("Instruction: Liquidate");
            handle_liquidate(program_id, accounts, &instruction_data[1..])
        }
    }
}

/// Handle Initialize instruction
///
/// Expected accounts:
/// 0. `[writable]` Registry account
/// 1. `[signer]` Authority/payer
///
/// Instruction data:
/// - authority (Pubkey): Program authority (32 bytes)
fn handle_initialize(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if accounts.len() < 2 {
        msg!("Error: Initialize instruction requires at least 2 accounts");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let registry_account = &accounts[0];
    let authority_account = &accounts[1];

    validate_owner(registry_account, program_id)?;
    validate_writable(registry_account)?;
    validate_signer(authority_account)?;

    // Parse instruction data (32 bytes for authority pubkey)
    if data.len() < 32 {
        msg!("Error: Invalid Initialize instruction data length");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let mut offset = 0;react-dom-client.development.js:25630 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
useStandardWalletAdapters.ts:49 Phantom was registered as a Standard Wallet. The Wallet Adapter for Phantom can be removed from your app.
useStandardWalletAdapters.useMemo @ useStandardWalletAdapters.ts:49
useStandardWalletAdapters.useMemo @ useStandardWalletAdapters.ts:45
mountMemo @ react-dom-client.development.js:7868
useMemo @ react-dom-client.development.js:23894
exports.useMemo @ react.development.js:1238
useStandardWalletAdapters @ useStandardWalletAdapters.ts:42
WalletProvider @ WalletProvider.tsx:52
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooks @ react-dom-client.development.js:6792
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10857
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopConcurrentByScheduler @ react-dom-client.development.js:15720
renderRootConcurrent @ react-dom-client.development.js:15695
performWorkOnRoot @ react-dom-client.development.js:14989
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16815
performWorkUntilDeadline @ scheduler.development.js:45
<WalletProvider>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
WalletProvider @ WalletProvider.tsx:32
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10806
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopConcurrentByScheduler @ react-dom-client.development.js:15720
renderRootConcurrent @ react-dom-client.development.js:15695
performWorkOnRoot @ react-dom-client.development.js:14989
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16815
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
RootLayout @ layout.tsx:30
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1333
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:3055
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1235
getOutlinedModel @ react-server-dom-turbopack-client.browser.development.js:1623
parseModelString @ react-server-dom-turbopack-client.browser.development.js:1982
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:2985
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1235
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1092
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:2888
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:2755
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:2958
progress @ react-server-dom-turbopack-client.browser.development.js:3222
<RootLayout>
initializeFakeTask @ react-server-dom-turbopack-client.browser.development.js:2518
initializeDebugInfo @ react-server-dom-turbopack-client.browser.development.js:2543
initializeDebugChunk @ react-server-dom-turbopack-client.browser.development.js:1182
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:2839
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:2755
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:2958
progress @ react-server-dom-turbopack-client.browser.development.js:3222
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2030
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:3083
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:3460
__TURBOPACK__module__evaluation__ @ app-index.tsx:156
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:366
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:76
loadScriptsInSequence @ app-bootstrap.ts:22
appBootstrap @ app-bootstrap.ts:58
__TURBOPACK__module__evaluation__ @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1146
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
page.tsx:406 Real market price for ethereum: $3867.74
page.tsx:898 Depositing 1 SOL to portfolio...
page.tsx:931 📡 Submitting deposit transaction...
page.tsx:965 Deposit transaction failed: SendTransactionError: Simulation failed. 
Message: Transaction simulation failed: Error processing Instruction 2: custom program error: 0x1. 
Logs: 
[
  "Program ComputeBudget111111111111111111111111111111 invoke [1]",
  "Program ComputeBudget111111111111111111111111111111 success",
  "Program ComputeBudget111111111111111111111111111111 invoke [1]",
  "Program ComputeBudget111111111111111111111111111111 success",
  "Program 9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG invoke [1]",
  "Program log: Instruction: Deposit",
  "Program 9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG consumed 362 of 199700 compute units",
  "Program 9CQWTSDobkHqWzvx4nufdke4C8GKuoaqiNBBLEYFoHoG failed: custom program error: 0x1"
]. 
Catch the `SendTransactionError` and call `getLogs()` on it for full details.
    at Connection.sendEncodedTransaction (connection.ts:6053:13)
    at async Connection.sendRawTransaction (connection.ts:6009:20)
    at async handleDeposit (page.tsx:932:29)
error @ intercept-console-error.ts:44
handleDeposit @ page.tsx:965
await in handleDeposit
executeDispatch @ react-dom-client.development.js:16970
runWithFiberInDEV @ react-dom-client.development.js:871
processDispatchQueue @ react-dom-client.development.js:17020
(anonymous) @ react-dom-client.development.js:17621
batchedUpdates$1 @ react-dom-client.development.js:3311
dispatchEventForPluginEventSystem @ react-dom-client.development.js:17174
dispatchEvent @ react-dom-client.development.js:21357
dispatchDiscreteEvent @ react-dom-client.development.js:21325
<button>
exports.jsxDEV @ react-jsx-dev-runtime.development.js:323
TradingDashboard @ page.tsx:1282
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10857
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopSync @ react-dom-client.development.js:15546
renderRootSync @ react-dom-client.development.js:15526
performWorkOnRoot @ react-dom-client.development.js:14990
performSyncWorkOnRoot @ react-dom-client.development.js:16830
flushSyncWorkAcrossRoots_impl @ react-dom-client.development.js:16676
processRootScheduleInMicrotask @ react-dom-client.development.js:16714
(anonymous) @ react-dom-client.development.js:16849
<TradingDashboard>
exports.jsx @ react-jsx-runtime.development.js:323
ClientPageRoot @ client-page.tsx:60
react_stack_bottom_frame @ react-dom-client.development.js:23583
renderWithHooksAgain @ react-dom-client.development.js:6892
renderWithHooks @ react-dom-client.development.js:6804
updateFunctionComponent @ react-dom-client.development.js:9246
beginWork @ react-dom-client.development.js:10806
runWithFiberInDEV @ react-dom-client.development.js:871
performUnitOfWork @ react-dom-client.development.js:15726
workLoopConcurrentByScheduler @ react-dom-client.development.js:15720
renderRootConcurrent @ react-dom-client.development.js:15695
performWorkOnRoot @ react-dom-client.development.js:14989
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:16815
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Promise.all @ VM12073 <anonymous>:1
Promise.all @ VM12073 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1332
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2030
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:3083
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:3460
__TURBOPACK__module__evaluation__ @ app-index.tsx:156
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:366
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:76
loadScriptsInSequence @ app-bootstrap.ts:22
appBootstrap @ app-bootstrap.ts:58
__TURBOPACK__module__evaluation__ @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:241
runModuleExecutionHooks @ dev-base.ts:275
instantiateModule @ dev-base.ts:235
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1146
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126

    let authority_bytes = read_bytes::<32>(data, &mut offset)?;
    let authority = Pubkey::from(authority_bytes);

    // Initialize registry
    let registry = unsafe { borrow_account_data_mut::<SlabRegistry>(registry_account)? };
    *registry = SlabRegistry::new(*program_id, authority, 0);

    msg!("Router initialized successfully");
    Ok(())
}

/// Handle Deposit instruction
///
/// Expected accounts:
/// 0. `[writable]` Vault account
/// 1. `[writable]` User token account (source)
/// 2. `[writable]` User portfolio account
/// 3. `[signer]` User authority
/// 4. `[]` Token program
/// 5. `[]` Vault authority PDA
///
/// Instruction data:
/// - mint (Pubkey): Token mint (32 bytes)
/// - amount (u128): Amount to deposit (16 bytes)
fn handle_deposit(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if accounts.len() < 4 {
        msg!("Error: Deposit instruction requires at least 4 accounts");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let vault_account = &accounts[0];
    let user_token_account = &accounts[1];
    let portfolio_account = &accounts[2];
    let user_authority = &accounts[3];

    validate_owner(vault_account, program_id)?;
    validate_writable(vault_account)?;
    validate_writable(user_token_account)?;
    validate_writable(portfolio_account)?;
    validate_signer(user_authority)?;

    // Parse instruction data (32 + 16 = 48 bytes)
    if data.len() < 48 {
        msg!("Error: Invalid Deposit instruction data length");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let mut offset = 0;
    let _mint_bytes = read_bytes::<32>(data, &mut offset)?;
    let amount = read_u128(data, &mut offset)?;

    // Get vault state
    let vault = unsafe { borrow_account_data_mut::<Vault>(vault_account)? };

    // Process deposit
    crate::instructions::process_deposit(vault, amount)?;

    // Update user portfolio (add to equity)
    // Check if portfolio account is allocated
    let portfolio = unsafe {
        // If portfolio has lamports but owner is System Program, it needs to be allocated and assigned
        if portfolio_account.owner() == &pinocchio::pubkey!("11111111111111111111111111111111") {
            msg!("Allocating and assigning Portfolio PDA");
            
            // The account has been funded but not allocated
            // We need to allocate space and assign owner via CPI
            let portfolio_size = core::mem::size_of::<Portfolio>();
            
            // Derive PDA seeds
            let seeds = &[
                b"portfolio" as &[u8],
                user_authority.key.as_ref(),
            ];
            let (expected_pda, bump) = Pubkey::find_program_address(seeds, program_id);
            
            // Verify the portfolio account matches the expected PDA
            if portfolio_account.key != &expected_pda {
                msg!("Error: Portfolio account mismatch");
                return Err(PercolatorError::InvalidAccount.into());
            }
            
            // Allocate space
            pinocchio::program::invoke_signed(
                &pinocchio::instruction::Instruction {
                    program_id: &pinocchio::pubkey!("11111111111111111111111111111111"),
                    accounts: &[
                        pinocchio::instruction::AccountMeta {
                            pubkey: *portfolio_account.key,
                            is_signer: true,
                            is_writable: true,
                        },
                    ],
                    data: &{
                        let mut data = [0u8; 12];
                        data[0..4].copy_from_slice(&8u32.to_le_bytes()); // Allocate instruction
                        data[4..12].copy_from_slice(&(portfolio_size as u64).to_le_bytes());
                        data
                    },
                },
                &[portfolio_account],
                &[&[b"portfolio", user_authority.key.as_ref(), &[bump]]],
            )?;
            
            // Assign owner
            pinocchio::program::invoke_signed(
                &pinocchio::instruction::Instruction {
                    program_id: &pinocchio::pubkey!("11111111111111111111111111111111"),
                    accounts: &[
                        pinocchio::instruction::AccountMeta {
                            pubkey: *portfolio_account.key,
                            is_signer: true,
                            is_writable: true,
                        },
                    ],
                    data: &{
                        let mut data = [0u8; 36];
                        data[0..4].copy_from_slice(&1u32.to_le_bytes()); // Assign instruction
                        data[4..36].copy_from_slice(program_id.as_ref());
                        data
                    },
                },
                &[portfolio_account],
                &[&[b"portfolio", user_authority.key.as_ref(), &[bump]]],
            )?;
            
            // Initialize portfolio data
            let portfolio_data = Portfolio::new(*program_id, *user_authority.key, bump);
            let portfolio_bytes = core::slice::from_raw_parts(
                &portfolio_data as *const Portfolio as *const u8,
                core::mem::size_of::<Portfolio>()
            );
            portfolio_account.data.borrow_mut()[..core::mem::size_of::<Portfolio>()]
                .copy_from_slice(portfolio_bytes);
            
            msg!("Portfolio PDA allocated and initialized");
        }
        
        borrow_account_data_mut::<Portfolio>(portfolio_account)?
    };
    portfolio.update_equity(portfolio.equity.saturating_add(amount as i128));

    // TODO: Actual token transfer via CPI to SPL Token program
    // For now, just log the operation
    msg!("Deposit successful");

    Ok(())
}

/// Handle Withdraw instruction
///
/// Expected accounts:
/// 0. `[writable]` Vault account
/// 1. `[writable]` User token account (destination)
/// 2. `[writable]` User portfolio account
/// 3. `[signer]` User authority
/// 4. `[]` Token program
/// 5. `[]` Vault authority PDA
///
/// Instruction data:
/// - mint (Pubkey): Token mint (32 bytes)
/// - amount (u128): Amount to withdraw (16 bytes)
fn handle_withdraw(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if accounts.len() < 4 {
        msg!("Error: Withdraw instruction requires at least 4 accounts");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let vault_account = &accounts[0];
    let user_token_account = &accounts[1];
    let portfolio_account = &accounts[2];
    let user_authority = &accounts[3];

    validate_owner(vault_account, program_id)?;
    validate_writable(vault_account)?;
    validate_writable(user_token_account)?;
    validate_writable(portfolio_account)?;
    validate_signer(user_authority)?;

    // Parse instruction data (32 + 16 = 48 bytes)
    if data.len() < 48 {
        msg!("Error: Invalid Withdraw instruction data length");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let mut offset = 0;
    let _mint_bytes = read_bytes::<32>(data, &mut offset)?;
    let amount = read_u128(data, &mut offset)?;

    // Get portfolio and check free collateral
    let portfolio = unsafe { borrow_account_data_mut::<Portfolio>(portfolio_account)? };
    
    // Check if user has sufficient free collateral
    let free_collateral = portfolio.equity.saturating_sub(portfolio.im as i128);
    if free_collateral < amount as i128 {
        msg!("Error: Insufficient free collateral");
        return Err(PercolatorError::InsufficientFunds.into());
    }

    // Get vault state and withdraw
    let vault = unsafe { borrow_account_data_mut::<Vault>(vault_account)? };
    crate::instructions::process_withdraw(vault, amount)?;

    // Update portfolio
    portfolio.equity = portfolio.equity.saturating_sub(amount as i128);

    // TODO: Actual token transfer via CPI to SPL Token program
    msg!("Withdraw successful");

    Ok(())
}

/// Handle MultiReserve instruction
///
/// This instruction coordinates reserve operations across multiple slabs
///
/// Expected accounts:
/// 0. `[writable]` User portfolio account
/// 1. `[signer]` User authority
/// 2..N. `[writable]` Escrow accounts (one per slab)
/// N+1..M. `[]` Slab programs to invoke
///
/// Instruction data:
/// - slab_count (u8): Number of slabs to reserve from
/// - For each slab:
///   - slab_id (Pubkey): Slab program ID (32 bytes)
///   - instrument_idx (u16): Instrument index
///   - side (u8): 0 = Buy, 1 = Sell
///   - qty (u64): Quantity to reserve
///   - limit_px (u64): Limit price
fn handle_multi_reserve(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if accounts.len() < 2 {
        msg!("Error: MultiReserve instruction requires at least 2 accounts");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let portfolio_account = &accounts[0];
    let user_authority = &accounts[1];

    validate_owner(portfolio_account, program_id)?;
    validate_writable(portfolio_account)?;
    validate_signer(user_authority)?;

    // Parse instruction data
    if data.is_empty() {
        msg!("Error: Invalid MultiReserve instruction data length");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let mut offset = 0;
    let slab_count = read_u8(data, &mut offset)?;

    msg!("MultiReserve");

    // TODO: Implement actual multi-slab reserve coordination
    // For now, validate structure
    for i in 0..slab_count {
        if offset + 32 + 2 + 1 + 8 + 8 > data.len() {
            msg!("Error: Incomplete reserve data for slab");
            return Err(PercolatorError::InvalidInstruction.into());
        }

        let _slab_id_bytes = read_bytes::<32>(data, &mut offset)?;
        let instrument_idx = read_u16(data, &mut offset)?;
        let side = read_u8(data, &mut offset)?;
        let qty = read_u64(data, &mut offset)?;
        let limit_px = read_u64(data, &mut offset)?;

        msg!("Reserve");
    }

    msg!("MultiReserve validated - implementation pending");
    Ok(())
}

/// Handle MultiCommit instruction
///
/// This instruction coordinates commit operations across multiple slabs
///
/// Expected accounts:
/// 0. `[writable]` User portfolio account
/// 1. `[signer]` User authority
/// 2..N. `[writable]` Cap accounts (one per slab)
/// N+1..M. `[]` Slab programs to invoke
///
/// Instruction data:
/// - slab_count (u8): Number of slabs to commit to
/// - current_ts (u64): Current timestamp
/// - For each slab:
///   - hold_id (u64): Reservation identifier
fn handle_multi_commit(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if accounts.len() < 2 {
        msg!("Error: MultiCommit instruction requires at least 2 accounts");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let portfolio_account = &accounts[0];
    let user_authority = &accounts[1];

    validate_owner(portfolio_account, program_id)?;
    validate_writable(portfolio_account)?;
    validate_signer(user_authority)?;

    // Parse instruction data
    if data.len() < 9 {
        msg!("Error: Invalid MultiCommit instruction data length");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let mut offset = 0;
    let slab_count = read_u8(data, &mut offset)?;
    let current_ts = read_u64(data, &mut offset)?;

    msg!("MultiCommit");

    // TODO: Implement actual multi-slab commit coordination
    // For now, validate structure
    for i in 0..slab_count {
        if offset + 8 > data.len() {
            msg!("Error: Incomplete commit data for slab");
            return Err(PercolatorError::InvalidInstruction.into());
        }

        let hold_id = read_u64(data, &mut offset)?;
        msg!("Commit");
    }

    msg!("MultiCommit validated - implementation pending");
    Ok(())
}

/// Handle Liquidate instruction
///
/// Coordinates liquidation of an underwater position across multiple slabs
///
/// Expected accounts:
/// 0. `[writable]` Liquidatee portfolio account
/// 1. `[writable]` Liquidator portfolio account
/// 2. `[signer]` Liquidator authority
/// 3..N. `[writable]` Slab accounts involved in liquidation
///
/// Instruction data:
/// - liquidatee (Pubkey): User to liquidate (32 bytes)
/// - max_debt (u128): Maximum debt to cover (16 bytes)
fn handle_liquidate(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    if accounts.len() < 3 {
        msg!("Error: Liquidate instruction requires at least 3 accounts");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let liquidatee_portfolio = &accounts[0];
    let liquidator_portfolio = &accounts[1];
    let liquidator_authority = &accounts[2];

    validate_owner(liquidatee_portfolio, program_id)?;
    validate_writable(liquidatee_portfolio)?;
    validate_owner(liquidator_portfolio, program_id)?;
    validate_writable(liquidator_portfolio)?;
    validate_signer(liquidator_authority)?;

    // Parse instruction data (32 + 16 = 48 bytes)
    if data.len() < 48 {
        msg!("Error: Invalid Liquidate instruction data length");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    let mut offset = 0;
    let liquidatee_bytes = read_bytes::<32>(data, &mut offset)?;
    let max_debt = read_u128(data, &mut offset)?;

    let liquidatee_pubkey = Pubkey::from(liquidatee_bytes);

    // Verify liquidatee account matches
    if liquidatee_portfolio.key() != &liquidatee_pubkey {
        msg!("Error: Liquidatee account mismatch");
        return Err(PercolatorError::InvalidInstruction.into());
    }

    // Get liquidatee portfolio and check if underwater
    let portfolio = unsafe { borrow_account_data_mut::<Portfolio>(liquidatee_portfolio)? };
    
    // Check if account is eligible for liquidation (equity < maintenance margin)
    if portfolio.equity >= portfolio.mm as i128 {
        msg!("Error: Account is not underwater");
        return Err(PercolatorError::NotLiquidatable.into());
    }

    msg!("Liquidation eligible");

    // TODO: Implement actual liquidation logic
    // - Calculate deficit
    // - Close positions across slabs
    // - Reward liquidator
    // - Update both portfolios

    msg!("Liquidate validated - implementation pending");
    Ok(())
}
