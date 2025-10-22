#![no_std]

#[cfg(all(target_os = "solana", feature = "bpf-entrypoint"))]
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

pub mod state;
pub mod instructions;
pub mod pda;
pub mod init;

#[cfg(feature = "bpf-entrypoint")]
pub mod entrypoint;

#[cfg(feature = "bpf-entrypoint")]
pinocchio::entrypoint!(entrypoint::process_instruction);

pub use state::*;
pub use instructions::*;
pub use init::*;

pinocchio_pubkey::declare_id!("RoutR1VdCpHqj89WEMJhb6TkGT9cPfr1rVjhM3e2YQr");
