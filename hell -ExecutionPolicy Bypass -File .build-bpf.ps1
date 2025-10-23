[1mdiff --git a/programs/amm/Cargo.toml b/programs/amm/Cargo.toml[m
[1mindex d0682b7..d055a0c 100644[m
[1m--- a/programs/amm/Cargo.toml[m
[1m+++ b/programs/amm/Cargo.toml[m
[36m@@ -11,7 +11,6 @@[m [mname = "percolator_amm"[m
 [m
 [dependencies][m
 pinocchio.workspace = true[m
[31m-pinocchio-log.workspace = true[m
 percolator-common = { path = "../common" }[m
 [m
 [dev-dependencies][m
[1mdiff --git a/programs/amm/src/lib.rs b/programs/amm/src/lib.rs[m
[1mindex 20ed040..85875d1 100644[m
[1m--- a/programs/amm/src/lib.rs[m
[1m+++ b/programs/amm/src/lib.rs[m
[36m@@ -15,5 +15,5 @@[m [mpub mod state;[m
 [m
 pub use state::*;[m
 [m
[31m-/// Program ID (will be set during deployment)[m
[31m-pub const ID: &str = "AMM111111111111111111111111111111111111111";[m
[32m+[m[32m/// Program ID - Our generated vanity address[m
[32m+[m[32mpub const ID: &str = "AMMjkEeFdasQ8fs9a9HQyJdciPHtDHVEat8yxiXrTP6p";[m
[1mdiff --git a/programs/common/src/lib.rs b/programs/common/src/lib.rs[m
[1mindex 12700e5..4e0f734 100644[m
[1m--- a/programs/common/src/lib.rs[m
[1m+++ b/programs/common/src/lib.rs[m
[36m@@ -8,6 +8,7 @@[m [mpub mod instruction;[m
 pub mod header;[m
 pub mod quote_cache;[m
 pub mod fill_receipt;[m
[32m+[m[32mpub mod pda;[m
 [m
 #[cfg(test)][m
 mod tests;[m
[36m@@ -20,3 +21,4 @@[m [mpub use instruction::*;[m
 pub use header::*;[m
 pub use quote_cache::*;[m
 pub use fill_receipt::*;[m
[32m+[m[32mpub use pda::*;[m
[1mdiff --git a/programs/oracle/src/lib.rs b/programs/oracle/src/lib.rs[m
[1mindex a384367..039bd3f 100644[m
[1m--- a/programs/oracle/src/lib.rs[m
[1m+++ b/programs/oracle/src/lib.rs[m
[36m@@ -37,3 +37,6 @@[m [mfn panic(_info: &core::panic::PanicInfo) -> ! {[m
 }[m
 [m
 pub use state::{PriceOracle, PRICE_ORACLE_SIZE};[m
[32m+[m
[32m+[m[32m/// Program ID - Our generated vanity address[m
[32m+[m[32mpub const ID: &str = "oracpooXY8Nnpx2JTLkrLiJsDaMefERUFFRktkAZ3ki";[m
[1mdiff --git a/programs/router/src/entrypoint.rs b/programs/router/src/entrypoint.rs[m
[1mindex 71224bc..930c699 100644[m
[1m--- a/programs/router/src/entrypoint.rs[m
[1m+++ b/programs/router/src/entrypoint.rs[m
[36m@@ -84,37 +84,39 @@[m [mpub fn process_instruction([m
 /// Process initialize instruction[m
 ///[m
 /// Expected accounts:[m
[31m-/// 0. `[writable]` Registry account (PDA)[m
[31m-/// 1. `[signer]` Governance authority[m
[32m+[m[32m/// 0. `[writable]` Registry account (PDA, will be created if needed)[m
[32m+[m[32m/// 1. `[signer, writable]` Payer/Governance authority[m
[32m+[m[32m/// 2. `[]` System program[m
 ///[m
 /// Expected data layout (32 bytes):[m
 /// - governance: Pubkey (32 bytes)[m
 fn process_initialize_inner(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {[m
[31m-    if accounts.len() < 2 {[m
[31m-        msg!("Error: Initialize instruction requires at least 2 accounts");[m
[32m+[m[32m    if accounts.len() < 3 {[m
[32m+[m[32m        msg!("Error: Initialize instruction requires at least 3 accounts");[m
         return Err(PercolatorError::InvalidInstruction.into());[m
     }[m
 [m
     let registry_account = &accounts[0];[m
[31m-    let governance_account = &accounts[1];[m
[32m+[m[32m    let payer = &accounts[1];[m
[32m+[m[32m    let system_program = &accounts[2];[m
 [m
     // Validate accounts[m
[31m-    validate_owner(registry_account, program_id)?;[m
     validate_writable(registry_account)?;[m
[32m+[m[32m    validate_writable(payer)?;[m
 [m
     // Parse instruction data - governance pubkey[m
     let mut reader = InstructionReader::new(data);[m
     let governance_bytes = reader.read_bytes::<32>()?;[m
     let governance = Pubkey::from(governance_bytes);[m
 [m
[31m-    // Verify governance signer matches instruction data[m
[31m-    if governance_account.key() != &governance {[m
[31m-        msg!("Error: Governance account does not match instruction data");[m
[32m+[m[32m    // Verify payer matches governance (governance pays for creation)[m
[32m+[m[32m    if payer.key() != &governance {[m
[32m+[m[32m        msg!("Error: Payer must be governance authority");[m
         return Err(PercolatorError::InvalidAccount.into());[m
     }[m
 [m
     // Call the initialization logic[m
[31m-    process_initialize_registry(program_id, registry_account, &governance)?;[m
[32m+[m[32m    process_initialize_registry(program_id, registry_account, payer, system_program, &governance)?;[m
 [m
     msg!("Router initialized successfully");[m
     Ok(())[m
[1mdiff --git a/programs/router/src/instructions/initialize.rs b/programs/router/src/instructions/initialize.rs[m
[1mindex 7daf69f..81bd450 100644[m
[1m--- a/programs/router/src/instructions/initialize.rs[m
[1m+++ b/programs/router/src/instructions/initialize.rs[m
[36m@@ -3,20 +3,29 @@[m
 use crate::pda::derive_registry_pda;[m
 use crate::state::SlabRegistry;[m
 use percolator_common::*;[m
[31m-use pinocchio::{account_info::AccountInfo, msg, pubkey::Pubkey};[m
[32m+[m[32muse pinocchio::{[m
[32m+[m[32m    account_info::AccountInfo,[m[41m [m
[32m+[m[32m    msg,[m[41m [m
[32m+[m[32m    pubkey::Pubkey,[m
[32m+[m[32m};[m
 [m
 /// Process initialize instruction for registry[m
 ///[m
 /// Initializes the slab registry account with governance authority.[m
 /// This is called once during router deployment.[m
[32m+[m[32m/// Creates the PDA if it doesn't exist.[m
 ///[m
 /// # Arguments[m
 /// * `program_id` - The router program ID[m
 /// * `registry_account` - The registry account to initialize (must be PDA)[m
[32m+[m[32m/// * `payer` - The payer account (for rent)[m
[32m+[m[32m/// * `system_program` - The system program account[m
 /// * `governance` - The governance authority pubkey[m
 pub fn process_initialize_registry([m
     program_id: &Pubkey,[m
     registry_account: &AccountInfo,[m
[32m+[m[32m    payer: &AccountInfo,[m
[32m+[m[32m    system_program: &AccountInfo,[m
     governance: &Pubkey,[m
 ) -> Result<(), PercolatorError> {[m
     // Derive and verify registry PDA[m
[36m@@ -27,22 +36,36 @@[m [mpub fn process_initialize_registry([m
         return Err(PercolatorError::InvalidAccount);[m
     }[m
 [m
[31m-    // Verify account size[m
[31m-    let data = registry_account.try_borrow_data()[m
[31m-        .map_err(|_| PercolatorError::InvalidAccount)?;[m
[32m+[m[32m    // Create PDA if it doesn't exist[m
[32m+[m[32m    if registry_account.lamports() == 0 {[m
[32m+[m[32m        msg!("Creating registry PDA account");[m
[32m+[m[32m        let seeds: &[&[u8]] = &[b"registry", &[bump]];[m
[32m+[m[32m        create_pda_account([m
[32m+[m[32m            registry_account,[m
[32m+[m[32m            payer,[m
[32m+[m[32m            system_program,[m
[32m+[m[32m            program_id,[m
[32m+[m[32m            SlabRegistry::LEN,[m
[32m+[m[32m            seeds,[m
[32m+[m[32m        )?;[m
[32m+[m[32m    } else {[m
[32m+[m[32m        // Verify account size if it already exists[m
[32m+[m[32m        let data = registry_account.try_borrow_data()[m
[32m+[m[32m            .map_err(|_| PercolatorError::InvalidAccount)?;[m
 [m
[31m-    if data.len() != SlabRegistry::LEN {[m
[31m-        msg!("Error: Registry account has incorrect size");[m
[31m-        return Err(PercolatorError::InvalidAccount);[m
[31m-    }[m
[32m+[m[32m        if data.len() != SlabRegistry::LEN {[m
[32m+[m[32m            msg!("Error: Registry account has incorrect size");[m
[32m+[m[32m            return Err(PercolatorError::InvalidAccount);[m
[32m+[m[32m        }[m
 [m
[31m-    // Check if already initialized (first bytes should be zero)[m
[31m-    if data[0] != 0 || data.len() < 32 {[m
[31m-        msg!("Error: Registry account may already be initialized");[m
[31m-        return Err(PercolatorError::InvalidAccount);[m
[31m-    }[m
[32m+[m[32m        // Check if already initialized (first bytes should be zero)[m
[32m+[m[32m        if data[0] != 0 || data.len() < 32 {[m
[32m+[m[32m            msg!("Error: Registry account may already be initialized");[m
[32m+[m[32m            return Err(PercolatorError::InvalidAccount);[m
[32m+[m[32m        }[m
 [m
[31m-    drop(data);[m
[32m+[m[32m        drop(data);[m
[32m+[m[32m    }[m
 [m
     // Initialize the registry in-place (avoids stack overflow)[m
     let registry = unsafe { borrow_account_data_mut::<SlabRegistry>(registry_account)? };[m
[1mdiff --git a/programs/router/src/lib.rs b/programs/router/src/lib.rs[m
[1mindex 9ff9344..8a86d3b 100644[m
[1m--- a/programs/router/src/lib.rs[m
[1m+++ b/programs/router/src/lib.rs[m
[36m@@ -9,14 +9,8 @@[m [mpub mod chooser;[m
 // Always expose entrypoint for testing, but only register as entrypoint when feature enabled[m
 pub mod entrypoint;[m
 [m
[31m-// Panic handler for no_std builds (only for Solana BPF)[m
[31m-#[cfg(all(target_os = "solana", not(test)))][m
[31m-#[panic_handler][m
[31m-fn panic(_info: &core::panic::PanicInfo) -> ! {[m
[31m-    loop {}[m
[31m-}[m
[31m-[m
 pub use state::*;[m
 pub use instructions::*;[m
 [m
[31m-pinocchio_pubkey::declare_id!("RoutR1VdCpHqj89WEMJhb6TkGT9cPfr1rVjhM3e2YQr");[m
[32m+[m[32m// Use our generated vanity address[m
[32m+[m[32mpinocchio_pubkey::declare_id!("RoutqcxkpVH8jJ2cULG9u6WbdRskQwXkJe8CqZehcyr");[m
[1mdiff --git a/programs/slab/src/entrypoint.rs b/programs/slab/src/entrypoint.rs[m
[1mindex 8e83bb9..6d94442 100644[m
[1m--- a/programs/slab/src/entrypoint.rs[m
[1m+++ b/programs/slab/src/entrypoint.rs[m
[36m@@ -54,8 +54,9 @@[m [mpub fn process_instruction([m
 /// Process initialize instruction (v0)[m
 ///[m
 /// Expected accounts:[m
[31m-/// 0. `[writable]` Slab state account (PDA, uninitialized)[m
[31m-/// 1. `[signer]` Payer/authority[m
[32m+[m[32m/// 0. `[writable]` Slab state account (PDA, will be created if needed)[m
[32m+[m[32m/// 1. `[signer, writable]` Payer[m
[32m+[m[32m/// 2. `[]` System program[m
 ///[m
 /// Expected data layout (121 bytes):[m
 /// - lp_owner: Pubkey (32 bytes)[m
[36m@@ -66,14 +67,17 @@[m [mpub fn process_instruction([m
 /// - contract_size: i64 (8 bytes)[m
 /// - bump: u8 (1 byte)[m
 fn process_initialize_inner(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {[m
[31m-    if accounts.len() < 1 {[m
[31m-        msg!("Error: Initialize instruction requires at least 1 account");[m
[32m+[m[32m    if accounts.len() < 3 {[m
[32m+[m[32m        msg!("Error: Initialize instruction requires at least 3 accounts");[m
         return Err(PercolatorError::InvalidInstruction.into());[m
     }[m
 [m
     let slab_account = &accounts[0];[m
[31m-    validate_owner(slab_account, program_id)?;[m
[32m+[m[32m    let payer = &accounts[1];[m
[32m+[m[32m    let system_program = &accounts[2];[m
[32m+[m[41m    [m
     validate_writable(slab_account)?;[m
[32m+[m[32m    validate_writable(payer)?;[m
 [m
     // Parse instruction data[m
     let mut reader = InstructionReader::new(data);[m
[36m@@ -93,6 +97,8 @@[m [mfn process_initialize_inner(program_id: &Pubkey, accounts: &[AccountInfo], data:[m
     process_initialize_slab([m
         program_id,[m
         slab_account,[m
[32m+[m[32m        payer,[m
[32m+[m[32m        system_program,[m
         lp_owner,[m
         router_id,[m
         instrument,[m
[1mdiff --git a/programs/slab/src/instructions/initialize.rs b/programs/slab/src/instructions/initialize.rs[m
[1mindex 5cb4b47..674246a 100644[m
[1m--- a/programs/slab/src/instructions/initialize.rs[m
[1m+++ b/programs/slab/src/instructions/initialize.rs[m
[36m@@ -1,20 +1,28 @@[m
 //! Initialize instruction - initialize slab state (v0 minimal)[m
 [m
 use crate::state::{SlabHeader, SlabState};[m
[32m+[m[32muse crate::pda::derive_slab_pda;[m
 use percolator_common::*;[m
[31m-use pinocchio::{account_info::AccountInfo, msg, pubkey::Pubkey};[m
[32m+[m[32muse pinocchio::{[m
[32m+[m[32m    account_info::AccountInfo,[m[41m [m
[32m+[m[32m    msg,[m[41m [m
[32m+[m[32m    pubkey::Pubkey,[m
[32m+[m[32m};[m
 [m
 /// Process initialize instruction for slab (v0 minimal)[m
 ///[m
 /// Initializes the ~4KB slab state account with header, quote cache, and book.[m
 /// This is called once during slab deployment for each market.[m
[32m+[m[32m/// Creates the PDA if it doesn't exist.[m
 ///[m
 /// # Arguments[m
 /// * `program_id` - The slab program ID[m
[31m-/// * `slab_account` - The slab account to initialize[m
[32m+[m[32m/// * `slab_account` - The slab account to initialize (PDA)[m
[32m+[m[32m/// * `payer` - The payer account (for rent)[m
[32m+[m[32m/// * `system_program` - The system program account[m
 /// * `lp_owner` - LP owner pubkey[m
 /// * `router_id` - Router program ID[m
[31m-/// * `instrument` - Shared instrument ID (agreed with router)[m
[32m+[m[32m/// * `instrument` - Shared instrument ID (agreed with router, used as market_id)[m
 /// * `mark_px` - Initial mark price from oracle (1e6 scale)[m
 /// * `taker_fee_bps` - Taker fee (basis points)[m
 /// * `contract_size` - Contract size (1e6 scale)[m
[36m@@ -22,6 +30,8 @@[m [muse pinocchio::{account_info::AccountInfo, msg, pubkey::Pubkey};[m
 pub fn process_initialize_slab([m
     program_id: &Pubkey,[m
     slab_account: &AccountInfo,[m
[32m+[m[32m    payer: &AccountInfo,[m
[32m+[m[32m    system_program: &AccountInfo,[m
     lp_owner: Pubkey,[m
     router_id: Pubkey,[m
     instrument: Pubkey,[m
[36m@@ -30,25 +40,49 @@[m [mpub fn process_initialize_slab([m
     contract_size: i64,[m
     bump: u8,[m
 ) -> Result<(), PercolatorError> {[m
[31m-    // For v0, we skip PDA derivation and just verify ownership[m
[31m-    // In production, we would verify the account is a valid PDA[m
[32m+[m[32m    // Derive and verify slab PDA (using instrument as market_id)[m
[32m+[m[32m    let (expected_pda, expected_bump) = derive_slab_pda(instrument.as_ref(), program_id);[m
 [m
[31m-    // Verify account size (~4KB for v0)[m
[31m-    let data = slab_account.try_borrow_data()[m
[31m-        .map_err(|_| PercolatorError::InvalidAccount)?;[m
[31m-[m
[31m-    if data.len() != SlabState::LEN {[m
[31m-        msg!("Error: Slab account has incorrect size");[m
[32m+[m[32m    if slab_account.key() != &expected_pda {[m
[32m+[m[32m        msg!("Error: Slab account is not the correct PDA");[m
         return Err(PercolatorError::InvalidAccount);[m
     }[m
 [m
[31m-    // Check if already initialized (magic bytes should not match)[m
[31m-    if data.len() >= 8 && &data[0..8] == SlabHeader::MAGIC {[m
[31m-        msg!("Error: Slab account already initialized");[m
[32m+[m[32m    if bump != expected_bump {[m
[32m+[m[32m        msg!("Error: Bump seed does not match derived PDA");[m
         return Err(PercolatorError::InvalidAccount);[m
     }[m
 [m
[31m-    drop(data);[m
[32m+[m[32m    // Create PDA if it doesn't exist[m
[32m+[m[32m    if slab_account.lamports() == 0 {[m
[32m+[m[32m        msg!("Creating slab PDA account");[m
[32m+[m[32m        let seeds: &[&[u8]] = &[b"slab", instrument.as_ref(), &[bump]];[m
[32m+[m[32m        create_pda_account([m
[32m+[m[32m            slab_account,[m
[32m+[m[32m            payer,[m
[32m+[m[32m            system_program,[m
[32m+[m[32m            program_id,[m
[32m+[m[32m            SlabState::LEN,[m
[32m+[m[32m            seeds,[m
[32m+[m[32m        )?;[m
[32m+[m[32m    } else {[m
[32m+[m[32m        // Verify account size if it already exists[m
[32m+[m[32m        let data = slab_account.try_borrow_data()[m
[32m+[m[32m            .map_err(|_| PercolatorError::InvalidAccount)?;[m
[32m+[m
[32m+[m[32m        if data.len() != SlabState::LEN {[m
[32m+[m[32m            msg!("Error: Slab account has incorrect size");[m
[32m+[m[32m            return Err(PercolatorError::InvalidAccount);[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        // Check if already initialized (magic bytes should not match)[m
[32m+[m[32m        if data.len() >= 8 && &data[0..8] == SlabHeader::MAGIC {[m
[32m+[m[32m            msg!("Error: Slab account already initialized");[m
[32m+[m[32m            return Err(PercolatorError::InvalidAccount);[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        drop(data);[m
[32m+[m[32m    }[m
 [m
     // Initialize the slab state[m
     let slab = unsafe { borrow_account_data_mut::<SlabState>(slab_account)? };[m
[1mdiff --git a/programs/slab/src/lib.rs b/programs/slab/src/lib.rs[m
[1mindex be119d1..a9ea6f2 100644[m
[1m--- a/programs/slab/src/lib.rs[m
[1m+++ b/programs/slab/src/lib.rs[m
[36m@@ -10,14 +10,8 @@[m [mpub mod entrypoint;[m
 #[cfg(test)][m
 mod tests;[m
 [m
[31m-// Panic handler for no_std builds (only for Solana BPF)[m
[31m-#[cfg(all(target_os = "solana", not(test)))][m
[31m-#[panic_handler][m
[31m-fn panic(_info: &core::panic::PanicInfo) -> ! {[m
[31m-    loop {}[m
[31m-}[m
[31m-[m
 pub use state::*;[m
 pub use instructions::SlabInstruction;[m
 [m
[31m-pinocchio_pubkey::declare_id!("SLabZ6PsDLh2X6HzEoqxFDMqCVcJXDKCNEYuPzUvGPk");[m
[32m+[m[32m// Use our generated vanity address[m
[32m+[m[32mpinocchio_pubkey::declare_id!("SLAB98WHcToiuUMMX9NQSg5E5iB8CjpK21T4h9ZXiep");[m
